import type { SupabaseClient } from '@supabase/supabase-js';
import { buildDeterministicEmbedding, cosineSimilarity, parsePgVector } from '@/lib/embeddings';

type KnowledgeRow = {
  name: string;
  description: string | null;
  category: string | null;
  equipment: string[] | null;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
  embedding?: string | number[] | null;
};

type TemplateRow = {
  title: string;
  goal: string | null;
  split: string | null;
  difficulty: string | null;
  notes: string | null;
  embedding?: string | number[] | null;
};

type ProfileRow = {
  fitness_goal: string | null;
  preferred_workout_types: string[] | null;
};

type StatsRow = {
  workouts_completed: number | null;
  current_streak: number | null;
  monthly_goal_hours: number | null;
  monthly_completed_hours: number | null;
};

type ActivityRow = {
  workout_name: string;
  type: string;
  duration: number | null;
};

type FeedbackRow = {
  prompt: string;
  accepted: boolean;
};

export async function getChatRagContext(params: {
  supabase: SupabaseClient;
  userId: string | null;
  query: string;
}): Promise<string> {
  const { supabase, userId, query } = params;

  const contextParts: string[] = [];
  const normalizedQuery = query.trim().slice(0, 240);
  if (!normalizedQuery) return '';

  let personalizationWeights: Map<string, number> | null = null;
  if (userId) {
    personalizationWeights = await fetchPersonalizationWeights(supabase, userId);
  }

  try {
    const knowledge = await fetchKnowledge(supabase, normalizedQuery, personalizationWeights);
    if (knowledge.length > 0) {
      const lines = knowledge.slice(0, 5).map((item) => {
        const muscles = [...(item.primary_muscles ?? []), ...(item.secondary_muscles ?? [])]
          .filter(Boolean)
          .slice(0, 3)
          .join(', ');
        const equipment = (item.equipment ?? []).slice(0, 2).join(', ');
        const description = cleanText(item.description || '').slice(0, 120);
        return `- ${item.name} (${item.category || 'general'})${muscles ? ` | muscles: ${muscles}` : ''}${equipment ? ` | equipment: ${equipment}` : ''}${description ? ` | note: ${description}` : ''}`;
      });
      contextParts.push(`Relevant exercise knowledge:\n${lines.join('\n')}`);
    }
  } catch (error) {
    console.warn('[RAG] knowledge retrieval failed:', error);
  }

  try {
    const templates = await fetchTemplates(supabase, normalizedQuery, personalizationWeights);
    if (templates.length > 0) {
      const lines = templates.slice(0, 3).map((t) =>
        `- ${t.title}${t.goal ? ` | goal: ${t.goal}` : ''}${t.split ? ` | split: ${t.split}` : ''}${t.difficulty ? ` | difficulty: ${t.difficulty}` : ''}`
      );
      contextParts.push(`Relevant workout templates:\n${lines.join('\n')}`);
    }
  } catch (error) {
    console.warn('[RAG] template retrieval failed:', error);
  }

  if (userId) {
    try {
      const userSignals = await fetchUserSignals(supabase, userId);
      if (userSignals) {
        contextParts.push(userSignals);
      }
    } catch (error) {
      console.warn('[RAG] user signal retrieval failed:', error);
    }
  }

  return contextParts.join('\n\n');
}

export async function saveLearningSignal(params: {
  supabase: SupabaseClient;
  userId: string | null;
  prompt: string;
  accepted: boolean;
  generatedWorkout?: unknown;
  source: 'chat' | 'build-workout';
}): Promise<void> {
  const { supabase, userId, prompt, accepted, generatedWorkout, source } = params;
  if (!userId) return;

  const insertPayload = {
    user_id: userId,
    source,
    prompt: prompt.slice(0, 2000),
    accepted,
    generated_workout: generatedWorkout ?? null,
  };

  const { error } = await supabase.from('ai_feedback_signals').insert(insertPayload);
  if (error) {
    throw new Error(`Failed to save learning signal: ${error.message}`);
  }
}

async function fetchKnowledge(
  supabase: SupabaseClient,
  query: string,
  personalizationWeights: Map<string, number> | null
): Promise<KnowledgeRow[]> {
  const queryTokens = tokenize(query);
  const queryEmbedding = buildDeterministicEmbedding(query);
  const { data, error } = await supabase
    .from('ai_knowledge_exercises')
    .select('name, description, category, equipment, primary_muscles, secondary_muscles, embedding')
    .or(`name.ilike.%${escapeLike(query)}%,description.ilike.%${escapeLike(query)}%`)
    .limit(30);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as KnowledgeRow[];
  return rows
    .map((row) => ({
      row,
      score: scoreKnowledge(row, queryTokens, personalizationWeights, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.row);
}

async function fetchTemplates(
  supabase: SupabaseClient,
  query: string,
  personalizationWeights: Map<string, number> | null
): Promise<TemplateRow[]> {
  const queryTokens = tokenize(query);
  const queryEmbedding = buildDeterministicEmbedding(query);
  const { data, error } = await supabase
    .from('ai_workout_templates')
    .select('title, goal, split, difficulty, notes, embedding')
    .or(`title.ilike.%${escapeLike(query)}%,goal.ilike.%${escapeLike(query)}%,notes.ilike.%${escapeLike(query)}%,user_id.is.null`)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as TemplateRow[];
  return rows
    .map((row) => ({
      row,
      score: scoreTemplate(row, queryTokens, personalizationWeights, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.row);
}

async function fetchUserSignals(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const [{ data: profile }, { data: stats }, { data: activity }] = await Promise.all([
    supabase
      .from('profiles')
      .select('fitness_goal, preferred_workout_types')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_stats')
      .select('workouts_completed, current_streak, monthly_goal_hours, monthly_completed_hours')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('recent_activity')
      .select('workout_name, type, duration')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3),
  ]);

  const p = (profile as ProfileRow | null) ?? null;
  const s = (stats as StatsRow | null) ?? null;
  const a = ((activity as ActivityRow[] | null) ?? []).slice(0, 3);

  const parts: string[] = [];
  if (p?.fitness_goal) parts.push(`fitness goal: ${p.fitness_goal}`);
  if (p?.preferred_workout_types?.length) parts.push(`preferred types: ${p.preferred_workout_types.join(', ')}`);
  if (s) {
    parts.push(
      `workouts completed: ${s.workouts_completed ?? 0}`,
      `current streak: ${s.current_streak ?? 0}`,
      `monthly progress: ${(s.monthly_completed_hours ?? 0)}/${s.monthly_goal_hours ?? 0} hrs`
    );
  }
  if (a.length > 0) {
    parts.push(`recent sessions: ${a.map((x) => `${x.workout_name} (${x.type}${x.duration ? `, ${x.duration}m` : ''})`).join('; ')}`);
  }

  if (parts.length === 0) return null;
  return `User training context:\n- ${parts.join('\n- ')}`;
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '');
}

function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 24);
}

function scoreKnowledge(
  row: KnowledgeRow,
  queryTokens: string[],
  personalizationWeights: Map<string, number> | null,
  queryEmbedding: number[]
): number {
  const haystack = [
    row.name,
    row.description ?? '',
    row.category ?? '',
    ...(row.equipment ?? []),
    ...(row.primary_muscles ?? []),
    ...(row.secondary_muscles ?? []),
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (row.name.toLowerCase().includes(token)) score += 5;
    if (haystack.includes(token)) score += 2;
    if (personalizationWeights) score += personalizationWeights.get(token) ?? 0;
  }
  const itemEmbedding = parsePgVector(row.embedding);
  if (itemEmbedding && itemEmbedding.length === queryEmbedding.length) {
    score += Math.max(0, cosineSimilarity(queryEmbedding, itemEmbedding)) * 8;
  }
  return score;
}

function scoreTemplate(
  row: TemplateRow,
  queryTokens: string[],
  personalizationWeights: Map<string, number> | null,
  queryEmbedding: number[]
): number {
  const haystack = [row.title, row.goal ?? '', row.split ?? '', row.difficulty ?? '', row.notes ?? '']
    .join(' ')
    .toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (row.title.toLowerCase().includes(token)) score += 6;
    if (haystack.includes(token)) score += 2;
    if (personalizationWeights) score += personalizationWeights.get(token) ?? 0;
  }
  const itemEmbedding = parsePgVector(row.embedding);
  if (itemEmbedding && itemEmbedding.length === queryEmbedding.length) {
    score += Math.max(0, cosineSimilarity(queryEmbedding, itemEmbedding)) * 8;
  }
  return score;
}

async function fetchPersonalizationWeights(
  supabase: SupabaseClient,
  userId: string
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('ai_feedback_signals')
    .select('prompt, accepted')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as FeedbackRow[];
  const weights = new Map<string, number>();

  for (const row of rows) {
    const delta = row.accepted ? 0.6 : -0.3;
    for (const token of tokenize(row.prompt)) {
      const prev = weights.get(token) ?? 0;
      weights.set(token, prev + delta);
    }
  }

  return weights;
}
