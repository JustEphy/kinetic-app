import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type GroqResult = {
  totalDuration: number;
  workDuration: number;
  restDuration: number;
  intensity: number;
  name: string;
};

// Rate limiting: In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  rateLimitStore.set(identifier, record);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function POST(req: Request) {
  try {
    // 1. Authentication Check (supports both authenticated and guest users)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // For guest users (no Supabase session), use IP-based rate limiting
    // For authenticated users, use user ID
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const identifier = user?.id || `guest:${clientIP}`;

    // 2. Rate Limiting
    const rateLimitResult = checkRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }

    // 3. Input Validation
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { prompt } = body as { prompt?: string };

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid prompt' },
        { status: 400 }
      );
    }

    if (prompt.length < 3 || prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be between 3 and 500 characters' },
        { status: 400 }
      );
    }

    // Sanitize prompt (remove potentially harmful content)
    const sanitizedPrompt = prompt
      .trim()
      .replace(/[<>]/g, '') // Remove HTML-like characters
      .substring(0, 500); // Enforce max length

    // 4. API Key Check
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[GROQ API] API key not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // 5. Call Groq API with Timeout
    const systemPrompt = `You are a fitness AI that parses workout requests and returns structured data.
Given a workout description, extract:
- totalDuration: total workout time in seconds
- workDuration: work interval duration in seconds
- restDuration: rest interval duration in seconds
- intensity: workout intensity 1-100
- name: a catchy workout name

Respond ONLY with valid JSON in this exact format:
{"totalDuration": 1800, "workDuration": 60, "restDuration": 30, "intensity": 75, "name": "Power HIIT 30"}

Examples:
- "60 min with 1 min work 30 sec rest" → {"totalDuration": 3600, "workDuration": 60, "restDuration": 30, "intensity": 75, "name": "Endurance Builder 60"}
- "tabata style 20 minutes" → {"totalDuration": 1200, "workDuration": 20, "restDuration": 10, "intensity": 95, "name": "Tabata Blast 20"}
- "quick 15 min cardio" → {"totalDuration": 900, "workDuration": 45, "restDuration": 15, "intensity": 80, "name": "Quick Cardio Burn"}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    // 6. Handle API Response
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[GROQ API] Error ${response.status}:`, errorText);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[GROQ API] No content in response:', data);
      return NextResponse.json(
        { error: 'Invalid AI response' },
        { status: 502 }
      );
    }

    // 7. Parse and Validate Response
    const jsonMatch = String(content).match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[GROQ API] Invalid JSON format:', content);
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<GroqResult>;
    
    // Validate and sanitize AI response
    const result: GroqResult = {
      totalDuration: Math.max(60, Math.min(parsed.totalDuration || 1800, 7200)), // 1min - 2hrs
      workDuration: Math.max(10, Math.min(parsed.workDuration || 60, 600)), // 10s - 10min
      restDuration: Math.max(5, Math.min(parsed.restDuration || 30, 300)), // 5s - 5min
      intensity: Math.max(1, Math.min(parsed.intensity || 75, 100)), // 1-100
      name: (parsed.name || 'AI Generated Workout').substring(0, 100), // Max 100 chars
    };

    // Log successful request (for monitoring)
    const userType = user ? 'authenticated' : 'guest';
    const userId = user?.id.substring(0, 8) || clientIP.substring(0, 15);
    console.log(`[GROQ API] Success for ${userType} user ${userId}...`);

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    });
  } catch (error) {
    // 8. Error Handling and Logging
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[GROQ API] Request timeout');
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 504 }
        );
      }
      
      console.error('[GROQ API] Error:', error.message);
    } else {
      console.error('[GROQ API] Unknown error:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

