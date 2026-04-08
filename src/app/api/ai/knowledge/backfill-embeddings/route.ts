import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildDeterministicEmbedding } from '@/lib/embeddings';

type KnowledgeRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string[] | null;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
  embedding: string | null;
};

type TemplateRow = {
  id: string;
  title: string;
  goal: string | null;
  split: string | null;
  difficulty: string | null;
  notes: string | null;
  embedding: string | null;
};

function buildKnowledgeText(row: KnowledgeRow): string {
  return [
    row.name,
    row.description ?? '',
    row.category ?? '',
    ...(row.equipment ?? []),
    ...(row.primary_muscles ?? []),
    ...(row.secondary_muscles ?? []),
  ]
    .join(' ')
    .trim();
}

function buildTemplateText(row: TemplateRow): string {
  return [row.title, row.goal ?? '', row.split ?? '', row.difficulty ?? '', row.notes ?? '']
    .join(' ')
    .trim();
}

function vectorToPgLiteral(vector: number[]): string {
  return `[${vector.map((value) => Number(value.toFixed(8))).join(',')}]`;
}

export async function POST(req: Request) {
  try {
    const ingestSecret = process.env.AI_INGEST_SECRET;
    const providedSecret = req.headers.get('x-ingest-secret');
    if (!ingestSecret || providedSecret !== ingestSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json({ error: 'Missing Supabase service credentials' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [{ data: knowledgeRows, error: knowledgeError }, { data: templateRows, error: templateError }] = await Promise.all([
      supabase
        .from('ai_knowledge_exercises')
        .select('id, name, description, category, equipment, primary_muscles, secondary_muscles, embedding')
        .limit(1200),
      supabase
        .from('ai_workout_templates')
        .select('id, title, goal, split, difficulty, notes, embedding')
        .limit(1000),
    ]);

    if (knowledgeError) {
      return NextResponse.json({ error: `Knowledge fetch failed: ${knowledgeError.message}` }, { status: 500 });
    }
    if (templateError) {
      return NextResponse.json({ error: `Template fetch failed: ${templateError.message}` }, { status: 500 });
    }

    let knowledgeUpdated = 0;
    const typedKnowledge = (knowledgeRows ?? []) as KnowledgeRow[];
    for (const row of typedKnowledge) {
      const text = buildKnowledgeText(row);
      if (!text) continue;
      const embedding = vectorToPgLiteral(buildDeterministicEmbedding(text));
      const { error } = await supabase
        .from('ai_knowledge_exercises')
        .update({ embedding, updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (!error) knowledgeUpdated += 1;
    }

    let templatesUpdated = 0;
    const typedTemplates = (templateRows ?? []) as TemplateRow[];
    for (const row of typedTemplates) {
      const text = buildTemplateText(row);
      if (!text) continue;
      const embedding = vectorToPgLiteral(buildDeterministicEmbedding(text));
      const { error } = await supabase
        .from('ai_workout_templates')
        .update({ embedding, updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (!error) templatesUpdated += 1;
    }

    return NextResponse.json({
      ok: true,
      knowledgeUpdated,
      templatesUpdated,
    });
  } catch (error) {
    console.error('[BACKFILL EMBEDDINGS] error:', error);
    return NextResponse.json({ error: 'Failed to backfill embeddings' }, { status: 500 });
  }
}
