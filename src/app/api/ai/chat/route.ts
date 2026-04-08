import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getChatRagContext } from '@/lib/ai-rag';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Rate limiting: In-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  return realIp || 'unknown';
}

function shouldOfferWorkoutBuild(message: string): boolean {
  const text = message.toLowerCase();
  const patterns = [
    /\b(create|build|make|design|generate|plan)\b.{0,30}\b(workout|routine|session)\b/,
    /\b(workout|routine|session)\b.{0,30}\b(for me|please|for)\b/,
    /\bi need\b.{0,30}\b(workout|routine|plan)\b/,
    /\b(give me|write me|draft)\b.{0,30}\b(workout|routine|training plan)\b/,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function responseLooksLikeWorkoutPlan(message: string): boolean {
  const text = message.toLowerCase();
  return (
    /\b\d{1,2}:\d{2}\b/.test(text) ||
    /\b(sets?|reps?|interval|rest|cool-?down|warm-?up)\b/.test(text) ||
    /\b(workout plan|training plan|routine)\b/.test(text)
  );
}

function extractExerciseNamesFromPlan(message: string): string[] {
  const generic = new Set([
    'warm up', 'cool down', 'recovery', 'rest', 'work phase', 'final push', 'tempo push', 'power burst', 'endurance block',
    'repeat the circuit', 'active recovery', 'rest phase',
  ]);
  const names: string[] = [];
  const lines = message.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const boldMatch = trimmed.match(/\*\*[^:]*:\s*([^*]+)\*\*/i);
    const bulletMatch = trimmed.match(/^[-•]\s*([^:]+):\s*(.+)$/i);
    const plainExerciseMatch = trimmed.match(/^[-•]\s*([A-Za-z][A-Za-z0-9'\-\s]{2,40})\s*$/);

    const candidate = boldMatch?.[1] || bulletMatch?.[1] || plainExerciseMatch?.[1] || null;
    if (!candidate) continue;

    const normalized = candidate.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();
    if (lower.length < 3 || generic.has(lower)) continue;
    if (/\b(min|sec|seconds?|minutes?)\b/.test(lower)) continue;
    if (/^\d/.test(lower)) continue;
    names.push(normalized);
  }

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(name);
  }
  return deduped.slice(0, 20);
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

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
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const clientIP = getClientIp(req);
    const identifier = user?.id || `guest:${clientIP}`;

    const rateLimitResult = checkRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { messages, message } = body as { messages?: Message[]; message?: string };
    const userMessage = message?.trim();
    
    if (!userMessage && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const workoutBuildRequested = !!userMessage && shouldOfferWorkoutBuild(userMessage);
    const ragContext = await getChatRagContext({
      supabase,
      userId: user?.id ?? null,
      query: userMessage || '',
    });

    const systemPrompt = `You are KINETIC AI, a fitness assistant specialized in workouts and interval training.
Keep responses concise (2-4 sentences), energetic, and workout-focused.
If user asks for non-fitness topics, redirect to fitness help.
If the user asks to create/build a workout, provide a practical workout suggestion they can run immediately.
Include emojis sparingly: 💪 🔥 ⚡
${ragContext ? `\n\nUse this retrieval context when helpful:\n${ragContext}` : ''}`;

    const conversationMessages: Message[] = [{ role: 'system', content: systemPrompt }];
    
    if (messages && messages.length > 0) {
      conversationMessages.push(...messages.slice(-10));
    }
    
    if (userMessage) {
      conversationMessages.push({ role: 'user', content: userMessage.substring(0, 2000) });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 });
    }

    let finalMessage = content.trim();
    const planDetected = responseLooksLikeWorkoutPlan(finalMessage);
    const shouldOfferBuild = workoutBuildRequested || planDetected;
    const extractedExerciseNames = planDetected ? extractExerciseNamesFromPlan(finalMessage) : [];

    if (shouldOfferBuild && !/build this in the app\?/i.test(finalMessage)) {
      finalMessage = `${finalMessage}\n\nWant me to build this in the app?`;
    }

    return NextResponse.json({
      message: finalMessage,
      role: 'assistant',
      shouldOfferBuild,
      buildPrompt: shouldOfferBuild ? userMessage : null,
      exerciseNames: extractedExerciseNames,
    });
  } catch (error) {
    console.error('[GROQ CHAT] Error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
