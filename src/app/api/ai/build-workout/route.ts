import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateWorkoutFromPrompt } from '@/lib/ai';
import { saveLearningSignal } from '@/lib/ai-rag';

type RateRecord = { count: number; resetTime: number };

const rateLimitStore = new Map<string, RateRecord>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  return realIp || 'unknown';
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
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const identifier = user?.id || `guest:${getClientIp(req)}`;
    const rateLimitResult = checkRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const prompt = body?.prompt;
    const exerciseNames = Array.isArray(body?.exerciseNames)
      ? body.exerciseNames.filter((value: unknown): value is string => typeof value === 'string').slice(0, 30)
      : [];

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }

    const sanitizedPrompt = prompt.trim().replace(/[<>]/g, '').slice(0, 500);
    if (sanitizedPrompt.length < 3) {
      return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
    }

    const result = await generateWorkoutFromPrompt({
      prompt: sanitizedPrompt,
      exerciseNames,
    });

    try {
      await saveLearningSignal({
        supabase,
        userId: user?.id ?? null,
        prompt: sanitizedPrompt,
        accepted: true,
        generatedWorkout: result.workout,
        source: 'build-workout',
      });
    } catch (signalError) {
      console.warn('[BUILD WORKOUT API] learning signal failed:', signalError);
    }

    return NextResponse.json(
      { workout: result.workout, message: result.message },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[BUILD WORKOUT API] Error:', error);
    return NextResponse.json({ error: 'Failed to build workout' }, { status: 500 });
  }
}
