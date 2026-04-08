import { describe, it, expect, vi, beforeEach } from 'vitest';
import { practicalPresetOptions, presets, generateWorkoutFromPrompt } from '@/lib/ai';

describe('practical preset options', () => {
  it('maps every option key to an existing preset function', () => {
    for (const option of practicalPresetOptions) {
      expect(typeof presets[option.key]).toBe('function');
    }
  });

  it('uses unique labels and keys', () => {
    const labels = practicalPresetOptions.map((option) => option.label);
    const keys = practicalPresetOptions.map((option) => option.key);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('preset generation', () => {
  it('creates named intervals and keeps duration consistent', () => {
    const workout = presets.yogaSunriseFlow();
    const intervalTotal = workout.intervals.reduce((sum, interval) => sum + interval.duration, 0);

    expect(workout.name).toContain('Yoga Sunrise Flow');
    expect(workout.intervals.length).toBeGreaterThan(0);
    expect(workout.intervals.every((interval) => interval.name.trim().length > 0)).toBe(true);
    expect(intervalTotal).toBe(workout.totalDuration);
  });
});

describe('generateWorkoutFromPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to local parsing when groq route fails and applies provided exercise names', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('downstream unavailable', { status: 503 })));

    const response = await generateWorkoutFromPrompt({
      prompt: 'Create a 20 minute interval workout',
      exerciseNames: ['Squat Jumps', 'Push-Ups'],
    });

    const firstWorkBlock = response.workout.intervals.find((interval) => interval.type === 'work');
    expect(firstWorkBlock?.name).toBe('Push-Ups');
    expect(response.message).toContain('Created a 20-minute workout');
  });
});
