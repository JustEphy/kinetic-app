import { beforeEach, describe, expect, it, vi } from 'vitest';

const buildMocks = vi.hoisted(() => {
  const cookieStore = { getAll: vi.fn(() => []), set: vi.fn() };
  const supabaseClient = { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } };
  const generatedWorkout = {
    id: 'w-1',
    name: 'Generated Workout',
    totalDuration: 1200,
    intervals: [{ id: 'i-1', type: 'work', duration: 60, name: 'Push-Ups', description: 'desc' }],
    intensity: 70,
    estimatedCalories: 180,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return {
    cookieStore,
    supabaseClient,
    generatedWorkout,
    generateWorkoutFromPrompt: vi.fn(async () => ({
      workout: generatedWorkout,
      message: 'ok',
    })),
    saveLearningSignal: vi.fn(async () => undefined),
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => buildMocks.cookieStore),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => buildMocks.supabaseClient),
}));

vi.mock('@/lib/ai', () => ({
  generateWorkoutFromPrompt: buildMocks.generateWorkoutFromPrompt,
}));

vi.mock('@/lib/ai-rag', () => ({
  saveLearningSignal: buildMocks.saveLearningSignal,
}));

import { POST } from '@/app/api/ai/build-workout/route';

describe('POST /api/ai/build-workout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    buildMocks.supabaseClient.auth.getUser = vi.fn(async () => ({ data: { user: { id: 'user-1' } } }));
    buildMocks.generateWorkoutFromPrompt.mockResolvedValue({
      workout: buildMocks.generatedWorkout,
      message: 'ok',
    });
    buildMocks.saveLearningSignal.mockResolvedValue(undefined);
  });

  it('returns 400 for missing prompt', async () => {
    const req = new Request('http://localhost/api/ai/build-workout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Missing or invalid prompt');
  });

  it('sanitizes prompt and limits exercise names before generation', async () => {
    const exerciseNames = ['Push-Ups', 123, 'Squats', null, 'Lunges'] as unknown[];
    const req = new Request('http://localhost/api/ai/build-workout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.11',
      },
      body: JSON.stringify({
        prompt: '  <script>build me a plan</script>  ',
        exerciseNames,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(buildMocks.generateWorkoutFromPrompt).toHaveBeenCalledWith({
      prompt: 'scriptbuild me a plan/script',
      exerciseNames: ['Push-Ups', 'Squats', 'Lunges'],
    });
    expect(buildMocks.saveLearningSignal).toHaveBeenCalled();
    expect(body.workout.name).toBe('Generated Workout');
  });
});
