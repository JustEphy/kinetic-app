import { beforeEach, describe, expect, it, vi } from 'vitest';

const chatMocks = vi.hoisted(() => {
  const cookieStore = { getAll: vi.fn(() => []), set: vi.fn() };
  const supabaseClient = { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } };
  return {
    cookieStore,
    supabaseClient,
    ragContext: '',
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => chatMocks.cookieStore),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => chatMocks.supabaseClient),
}));

vi.mock('@/lib/ai-rag', () => ({
  getChatRagContext: vi.fn(async () => chatMocks.ragContext),
}));

import { POST } from '@/app/api/ai/chat/route';

describe('POST /api/ai/chat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GROQ_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    chatMocks.ragContext = '';
    chatMocks.supabaseClient.auth.getUser = vi.fn(async () => ({ data: { user: null } }));
  });

  it('returns 400 when no message payload is provided', async () => {
    const req = new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Missing message');
  });

  it('offers workout build and extracts exercise names from workout-like response', async () => {
    const groqMessage = [
      '- Warm Up: 3 minutes easy cardio',
      '- Push-Ups: 45 sec',
      '- Squat Jumps: 45 sec',
      '- Rest: 20 sec',
    ].join('\n');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: groqMessage } }],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      )
    );

    const req = new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({ message: 'Please build me a workout' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.shouldOfferBuild).toBe(true);
    expect(body.buildPrompt).toBe('Please build me a workout');
    expect(body.exerciseNames).toContain('Push-Ups');
    expect(body.exerciseNames).toContain('Squat Jumps');
    expect(body.message).toMatch(/Want me to build this in the app\?/i);
  });
});
