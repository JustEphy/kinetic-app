/**
 * AI Workout Generator
 * Parses natural language prompts to generate workout interval sequences
 * Supports both local parsing and Groq API for enhanced AI responses
 */

import { Workout, WorkoutInterval, AIWorkoutRequest, AIWorkoutResponse } from '@/types';
import { generateId } from './db';
import { createClient } from '@supabase/supabase-js';

// Common workout patterns
const PATTERNS = {
  hiit: { workRatio: 2, restRatio: 1, intensity: 85 },
  tabata: { workRatio: 20, restRatio: 10, intensity: 95, rounds: 8 },
  emom: { workRatio: 1, restRatio: 0, intensity: 75 },
  amrap: { workRatio: 1, restRatio: 0, intensity: 80 },
  circuit: { workRatio: 3, restRatio: 1, intensity: 70 },
  endurance: { workRatio: 4, restRatio: 1, intensity: 60 },
  recovery: { workRatio: 2, restRatio: 3, intensity: 40 },
};

const EXERCISE_NAME_PATTERNS: Array<{ regex: RegExp; names: string[] }> = [
  { regex: /\bleg|lower body|quad|hamstring|glute\b/i, names: ['Warm Up', 'Leg Press', 'Goblet Squats', 'Walking Lunges', 'Romanian Deadlift', 'Split Squats'] },
  { regex: /\bchest|push\b/i, names: ['Warm Up', 'Push-Ups', 'Dumbbell Press', 'Incline Press', 'Chest Fly', 'Plyo Push-Ups'] },
  { regex: /\bback|pull\b/i, names: ['Warm Up', 'Bent-Over Rows', 'Lat Pull-Down', 'Single Arm Rows', 'Face Pulls', 'Deadlift Pull'] },
  { regex: /\bcore|abs|abdominal\b/i, names: ['Warm Up', 'Plank Hold', 'Dead Bug', 'Bicycle Crunch', 'Russian Twist', 'Hollow Hold'] },
  { regex: /\bfull body|hiit|circuit\b/i, names: ['Warm Up', 'Burpees', 'Mountain Climbers', 'Jump Squats', 'Push-Ups', 'High Knees'] },
];

function inferExerciseNames(prompt: string): string[] {
  const matched = EXERCISE_NAME_PATTERNS.find(({ regex }) => regex.test(prompt));
  if (matched) return matched.names;
  return ['Warm Up', 'Work Phase', 'Tempo Push', 'Power Burst', 'Endurance Block', 'Final Push'];
}

async function fetchKnowledgeExerciseNames(prompt: string): Promise<string[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) return [];

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tokens = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 10);

  if (tokens.length === 0) return [];

  const orFilter = tokens
    .map((token) => `name.ilike.%${token}%`)
    .join(',');

  const { data, error } = await supabase
    .from('ai_knowledge_exercises')
    .select('name, category')
    .or(orFilter)
    .limit(20);

  if (error || !data) return [];

  const prioritized = [...data]
    .sort((a, b) => {
      const aScore = scoreExerciseName(a.name, tokens) + (a.category?.toLowerCase().includes('cardio') ? 0.1 : 0);
      const bScore = scoreExerciseName(b.name, tokens) + (b.category?.toLowerCase().includes('cardio') ? 0.1 : 0);
      return bScore - aScore;
    })
    .map((row) => row.name?.trim())
    .filter((name): name is string => !!name && name.length > 2);

  return uniqueStrings(prioritized).slice(0, 14);
}

function scoreExerciseName(name: string, tokens: string[]): number {
  const lower = name.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (lower.includes(token)) score += 2;
  }
  return score;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function normalizeDurations(workDuration: number, restDuration: number): { work: number; rest: number } {
  const normalizedWork = Math.max(30, Math.round(workDuration / 15) * 15);
  const normalizedRest = Math.max(10, Math.round(restDuration / 5) * 5);
  return { work: normalizedWork, rest: normalizedRest };
}

// Groq API integration
async function callGroqAPI(prompt: string): Promise<{
  totalDuration: number;
  workDuration: number;
  restDuration: number;
  intensity: number;
  name: string;
} | null> {
  try {
    const response = await fetch('/api/ai/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      if (response.status !== 503) {
        console.error('Groq API error:', response.status);
      }
      return null;
    }

    const parsed = await response.json();

    return {
      totalDuration: parsed.totalDuration || 1800,
      workDuration: parsed.workDuration || 60,
      restDuration: parsed.restDuration || 30,
      intensity: parsed.intensity || 75,
      name: parsed.name || 'AI Generated Workout',
    };
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
}

// Parse time strings like "30 seconds", "1 minute", "1:30"
function parseTime(timeStr: string): number | null {
  const str = timeStr.toLowerCase().trim();
  
  // Handle "X:XX" format
  const colonMatch = str.match(/^(\d+):(\d{2})$/);
  if (colonMatch) {
    return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  }
  
  // Handle "X min", "X minute(s)", "X m"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?|m)\b/);
  if (minMatch) {
    return Math.round(parseFloat(minMatch[1]) * 60);
  }
  
  // Handle "X sec", "X second(s)", "X s"
  const secMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:sec(?:ond)?s?|s)\b/);
  if (secMatch) {
    return Math.round(parseFloat(secMatch[1]));
  }
  
  // Handle just a number (assume seconds if < 10, minutes otherwise)
  const numMatch = str.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    return num < 10 ? Math.round(num * 60) : Math.round(num);
  }
  
  return null;
}

// Parse duration from prompt
function parseTotalDuration(prompt: string): number {
  const patterns = [
    /(\d+)\s*(?:min(?:ute)?|m)\s*(?:workout|session|total)?/i,
    /(\d+)\s*(?:hour|hr|h)\s*(?:workout|session)?/i,
    /for\s+(\d+)\s*(?:min(?:ute)?s?|m)/i,
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (pattern.source.includes('hour')) {
        return value * 3600;
      }
      return value * 60;
    }
  }
  
  return 30 * 60; // Default 30 minutes
}

// Parse work/rest intervals from prompt
function parseIntervals(prompt: string): { work: number; rest: number } | null {
  const lowerPrompt = prompt.toLowerCase();
  const hasExplicitRestLead = /\b(rest|recovery|off)\b.*\b(\d+)\b/.test(lowerPrompt);
  
  // Pattern: "X min work, Y sec rest" or "X-minute work/Y-second rest"
  const workRestPattern = /(\d+(?::\d{2})?)\s*(?:min(?:ute)?s?|sec(?:ond)?s?|m|s)?\s*(?:work|on|active)[\s,/]+(\d+(?::\d{2})?)\s*(?:min(?:ute)?s?|sec(?:ond)?s?|m|s)?\s*(?:rest|off|recovery)/i;
  const match = lowerPrompt.match(workRestPattern);
  
  if (match) {
    const workStr = match[0].match(/(\d+(?::\d{2})?)\s*(?:min(?:ute)?s?|sec(?:ond)?s?|m|s)?/)?.[0] || match[1];
    let work = parseTime(workStr);
    let rest = parseTime(match[2] + (lowerPrompt.includes('sec') ? ' sec' : ' min'));
    
    // Better parsing
    const workPart = match[1];
    const restPart = match[2];
    
    // Detect units based on context
    if (lowerPrompt.includes(workPart + ' min') || lowerPrompt.includes(workPart + '-min')) {
      work = parseInt(workPart) * 60;
    } else if (lowerPrompt.includes(workPart + ' sec') || lowerPrompt.includes(workPart + '-sec') || parseInt(workPart) > 10) {
      work = parseInt(workPart);
    } else {
      work = parseInt(workPart) * 60; // Default to minutes for small numbers
    }
    
    if (lowerPrompt.includes(restPart + ' sec') || lowerPrompt.includes(restPart + '-sec')) {
      rest = parseInt(restPart);
    } else if (lowerPrompt.includes(restPart + ' min') || lowerPrompt.includes(restPart + '-min')) {
      rest = parseInt(restPart) * 60;
    } else {
      rest = parseInt(restPart); // Default to seconds for rest
    }
    
    if (work && rest) {
      return { work, rest };
    }
  }
  
  // Simple pattern: "1min/30sec" or "1:00/0:30"
  const ratioPattern = /(\d+(?::\d{2})?)\s*\/\s*(\d+(?::\d{2})?)/;
  const ratioMatch = lowerPrompt.match(ratioPattern);
  if (ratioMatch) {
    let work = parseTime(ratioMatch[1]) || parseInt(ratioMatch[1]) * 60;
    let rest = parseTime(ratioMatch[2]) || parseInt(ratioMatch[2]);
    if (hasExplicitRestLead) {
      const temp = work;
      work = rest;
      rest = temp;
    }
    if (work && rest) {
      return { work, rest };
    }
  }

  // Pattern: "rest 30 sec" with implied/default work interval
  const explicitRestOnly = lowerPrompt.match(/\b(?:rest|recovery|off)\s*(?:for\s*)?(\d+(?::\d{2})?)\s*(sec(?:ond)?s?|s|min(?:ute)?s?|m)?/i);
  if (explicitRestOnly) {
    const restBase = explicitRestOnly[1];
    const restUnit = explicitRestOnly[2] || 'sec';
    const rest = parseTime(`${restBase} ${restUnit}`) || 30;
    return { work: 60, rest };
  }
  
  return null;
}

// Detect workout type from prompt
function detectWorkoutType(prompt: string): keyof typeof PATTERNS | null {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [type] of Object.entries(PATTERNS)) {
    if (lowerPrompt.includes(type)) {
      return type as keyof typeof PATTERNS;
    }
  }
  
  // Keyword detection
  if (lowerPrompt.includes('high intensity') || lowerPrompt.includes('intense')) {
    return 'hiit';
  }
  if (lowerPrompt.includes('20/10') || lowerPrompt.includes('20 on 10 off')) {
    return 'tabata';
  }
  if (lowerPrompt.includes('every minute')) {
    return 'emom';
  }
  if (lowerPrompt.includes('fat loss') || lowerPrompt.includes('burn')) {
    return 'hiit';
  }
  if (lowerPrompt.includes('cardio') || lowerPrompt.includes('running')) {
    return 'endurance';
  }
  if (lowerPrompt.includes('strength') || lowerPrompt.includes('muscle')) {
    return 'circuit';
  }
  
  return null;
}

// Generate workout from parsed parameters
function generateWorkout(
  totalDuration: number,
  workDuration: number,
  restDuration: number,
  intensity: number = 75,
  name?: string,
  prompt?: string,
  customExerciseNames?: string[]
): Workout {
  const intervals: WorkoutInterval[] = [];
  const fallbackNames = inferExerciseNames(prompt ?? '');
  const knowledgeNames = uniqueStrings(customExerciseNames ?? []);
  const exerciseNames = knowledgeNames.length > 0 ? knowledgeNames : fallbackNames;
  let workBlockIndex = 1; // reserve index 0 (Warm Up) for warmup block label only
  let currentTime = 0;
  let isWork = true;
  
  // Add warmup if workout is longer than 10 minutes
  if (totalDuration > 600) {
    const warmupDuration = Math.min(180, totalDuration * 0.1); // 10% or max 3 min
    intervals.push({
      id: generateId(),
      type: 'warmup',
      duration: warmupDuration,
      name: 'Warm Up',
      description: 'Light activity to prepare your body',
    });
    currentTime += warmupDuration;
  }
  
  // Calculate available time for main workout (leaving room for cooldown)
  const cooldownTime = totalDuration > 600 ? Math.min(120, totalDuration * 0.05) : 0;
  const mainWorkoutEnd = totalDuration - cooldownTime;
  
  while (currentTime < mainWorkoutEnd) {
    const duration = isWork ? workDuration : restDuration;
    
    if (currentTime + duration > mainWorkoutEnd) {
      // Add remaining time as final work phase
      const remaining = mainWorkoutEnd - currentTime;
      if (remaining > 10) {
        intervals.push({
          id: generateId(),
          type: 'work',
          duration: remaining,
          name: 'Final Push',
          description: 'Give it everything you have!',
        });
      }
      break;
    }
    
    if (isWork) {
      const workLabel = resolveWorkLabel(exerciseNames, workBlockIndex);
      workBlockIndex++;
      intervals.push({
        id: generateId(),
        type: 'work',
        duration,
        name: workLabel,
        description: `${workLabel} - high intensity output`,
      });
    } else {
      intervals.push({
        id: generateId(),
        type: 'rest',
        duration,
        name: resolveRestLabel(workBlockIndex),
        description: 'Controlled breathing and active recovery',
      });
    }
    
    currentTime += duration;
    isWork = !isWork;
  }
  
  // Ensure the final interval before cooldown is a work block, not a recovery block.
  if (cooldownTime > 0 && intervals.length > 0) {
    const lastInterval = intervals[intervals.length - 1];
    if (lastInterval.type === 'rest') {
      const recoveredDuration = lastInterval.duration;
      intervals.pop();
      currentTime -= recoveredDuration;

      const remainingBeforeCooldown = Math.max(0, mainWorkoutEnd - currentTime);
      if (remainingBeforeCooldown > 10) {
        const workLabel = resolveWorkLabel(exerciseNames, workBlockIndex);
        intervals.push({
          id: generateId(),
          type: 'work',
          duration: remainingBeforeCooldown,
          name: workLabel,
          description: `${workLabel} - finish strong`,
        });
      }
    }
  }

  // Add cooldown if needed
  if (cooldownTime > 0) {
    intervals.push({
      id: generateId(),
      type: 'cooldown',
      duration: cooldownTime,
      name: 'Cool Down',
      description: 'Light stretching and recovery',
    });
  }
  
  // Calculate estimated calories (rough estimate: 10-15 cal/min based on intensity)
  const caloriesPerMinute = 8 + (intensity / 100) * 7;
  const estimatedCalories = Math.round((totalDuration / 60) * caloriesPerMinute);
  
  return {
    id: generateId(),
    name: name || `${Math.round(totalDuration / 60)}min ${workDuration >= 60 ? `${workDuration / 60}min` : `${workDuration}sec`}/${restDuration}sec Intervals`,
    totalDuration,
    intervals,
    intensity,
    estimatedCalories,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Main AI generator function
export async function generateWorkoutFromPrompt(request: AIWorkoutRequest): Promise<AIWorkoutResponse> {
  const { prompt } = request;
  const knowledgeExerciseNames = await fetchKnowledgeExerciseNames(prompt);
  
  // Try Groq API first for enhanced AI
  const groqResult = await callGroqAPI(prompt);
  
  let totalDuration: number;
  let workDuration: number;
  let restDuration: number;
  let intensity: number;
  let workoutName: string | undefined;
  
  if (groqResult) {
    // Use Groq AI results
    totalDuration = groqResult.totalDuration;
    workDuration = groqResult.workDuration;
    restDuration = groqResult.restDuration;
    intensity = groqResult.intensity;
    workoutName = groqResult.name;
  } else {
    // Fall back to local parsing
    totalDuration = request.totalDuration 
      ? request.totalDuration * 60 
      : parseTotalDuration(prompt);
    
    workDuration = request.workInterval || 60;
    restDuration = request.restInterval || 30;
    
    const parsedIntervals = parseIntervals(prompt);
    if (parsedIntervals) {
      workDuration = parsedIntervals.work;
      restDuration = parsedIntervals.rest;
    }
    
    const workoutType = detectWorkoutType(prompt);
    intensity = 75;
    
    if (workoutType) {
      const pattern = PATTERNS[workoutType];
      intensity = pattern.intensity;
      
      if (!parsedIntervals && !request.workInterval) {
        if (workoutType === 'tabata') {
          workDuration = 20;
          restDuration = 10;
        }
      }
      
      workoutName = `${workoutType.toUpperCase()} ${Math.round(totalDuration / 60)}min`;
    }
  }

  const normalizedDurations = normalizeDurations(workDuration, restDuration);
  workDuration = normalizedDurations.work;
  restDuration = normalizedDurations.rest;
  
  const workout = generateWorkout(
    totalDuration,
    workDuration,
    restDuration,
    intensity,
    workoutName,
    prompt,
    request.exerciseNames && request.exerciseNames.length > 0
      ? request.exerciseNames
      : knowledgeExerciseNames
  );
  
  // Generate response message
  const intervalCount = workout.intervals.filter(i => i.type === 'work').length;
  const aiPowered = groqResult ? '🤖 AI-Generated: ' : '';
  const message = `${aiPowered}Created a ${Math.round(totalDuration / 60)}-minute workout with ${intervalCount} work intervals. ` +
    `Work: ${workDuration >= 60 ? `${Math.round(workDuration / 60)} min` : `${workDuration} sec`}, ` +
    `Rest: ${restDuration} sec.`;
  
  return { workout, message };
}

// Quick preset generators
export const presets = {
  beginnerFullBody: () =>
    generateWorkout(1800, 60, 45, 60, 'Beginner Full Body 30min', 'beginner full body', [
      'Bodyweight Squats',
      'Knee Push-Ups',
      'Glute Bridge',
      'Bird Dog',
      'Step-Back Lunges',
      'Dead Bug',
      'Standing March',
      'Forearm Plank',
    ]),
  fullBodyStrength: () =>
    generateWorkout(2400, 75, 30, 72, 'Full Body Strength 40min', 'full body strength', [
      'Goblet Squats',
      'Push-Ups',
      'Bent-Over Rows',
      'Reverse Lunges',
      'Dumbbell Shoulder Press',
      'Romanian Deadlift',
      'Mountain Climbers',
      'Plank Shoulder Taps',
    ]),
  upperBodyFocus: () =>
    generateWorkout(1800, 70, 35, 75, 'Upper Body Focus 30min', 'upper body', [
      'Push-Ups',
      'Dumbbell Shoulder Press',
      'Bent-Over Rows',
      'Tricep Dips',
      'Bicep Curls',
      'Lateral Raises',
      'Plank Up-Downs',
    ]),
  lowerBodyFocus: () =>
    generateWorkout(1800, 70, 35, 75, 'Lower Body Focus 30min', 'lower body', [
      'Bodyweight Squats',
      'Walking Lunges',
      'Romanian Deadlift',
      'Glute Bridges',
      'Calf Raises',
      'Split Squats',
      'Wall Sit',
    ]),
  yogaSunriseFlow: () =>
    generateWorkout(2700, 75, 20, 45, 'Yoga Sunrise Flow 45min', 'yoga sunrise salute flow', [
      'Centering Breath',
      'Mountain Pose',
      'Half Sun Salutation',
      'Sun Salutation A',
      'Sun Salutation B',
      'Warrior I',
      'Warrior II',
      'Triangle Pose',
      'Tree Pose',
      'Seated Forward Fold',
      'Bridge Pose',
      'Supine Twist',
      'Savasana',
    ]),
};

export const practicalPresetOptions: Array<{
  label: string;
  key: keyof typeof presets;
}> = [
  { label: 'Beginner', key: 'beginnerFullBody' },
  { label: 'Full Body', key: 'fullBodyStrength' },
  { label: 'Upper Body', key: 'upperBodyFocus' },
  { label: 'Lower Body', key: 'lowerBodyFocus' },
  { label: 'Yoga Flow', key: 'yogaSunriseFlow' },
];

function resolveWorkLabel(exerciseNames: string[], workBlockIndex: number): string {
  if (exerciseNames.length === 0) return `Work Block ${workBlockIndex}`;
  if (workBlockIndex < exerciseNames.length) return exerciseNames[workBlockIndex];
  const cycleIndex = (workBlockIndex - 1) % exerciseNames.length;
  const label = exerciseNames[cycleIndex];
  const round = Math.floor((workBlockIndex - 1) / exerciseNames.length) + 1;
  return `${label} (Round ${round})`;
}

function resolveRestLabel(workBlockIndex: number): string {
  return `Recovery ${Math.max(1, workBlockIndex - 1)}`;
}
