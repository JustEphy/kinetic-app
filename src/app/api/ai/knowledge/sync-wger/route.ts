import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type WgerExercise = {
  id: number;
  name: string;
  description?: string | null;
  category?: { name?: string | null } | null;
  equipment?: Array<{ name?: string | null }> | null;
  muscles?: Array<{ name?: string | null }> | null;
  muscles_secondary?: Array<{ name?: string | null }> | null;
};

type WgerResponse = {
  next: string | null;
  results: WgerExercise[];
};

function sanitizeText(input: string | null | undefined): string {
  return (input ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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

    const apiKey = process.env.WGER_API_KEY;
    const headers: Record<string, string> = {};
    if (apiKey) headers.Authorization = `Token ${apiKey}`;

    const maxPages = 5;
    let url = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=100';
    let page = 0;
    let totalFetched = 0;
    let totalUpserted = 0;

    while (url && page < maxPages) {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        return NextResponse.json(
          { error: `WGER fetch failed with ${response.status}` },
          { status: 502 }
        );
      }

      const payload = (await response.json()) as WgerResponse;
      const rows = (payload.results ?? []).map((exercise) => ({
        id: String(exercise.id),
        source: 'wger',
        name: sanitizeText(exercise.name) || 'Unnamed Exercise',
        description: sanitizeText(exercise.description),
        category: sanitizeText(exercise.category?.name),
        equipment: (exercise.equipment ?? [])
          .map((e) => sanitizeText(e.name))
          .filter(Boolean),
        primary_muscles: (exercise.muscles ?? [])
          .map((m) => sanitizeText(m.name))
          .filter(Boolean),
        secondary_muscles: (exercise.muscles_secondary ?? [])
          .map((m) => sanitizeText(m.name))
          .filter(Boolean),
        metadata: {
          externalId: exercise.id,
        },
        updated_at: new Date().toISOString(),
      }));

      totalFetched += rows.length;
      if (rows.length > 0) {
        const { error } = await supabase
          .from('ai_knowledge_exercises')
          .upsert(rows, { onConflict: 'id' });

        if (error) {
          return NextResponse.json(
            { error: `Supabase upsert failed: ${error.message}` },
            { status: 500 }
          );
        }
        totalUpserted += rows.length;
      }

      url = payload.next ?? '';
      page += 1;
    }

    return NextResponse.json({
      ok: true,
      pagesProcessed: page,
      fetched: totalFetched,
      upserted: totalUpserted,
    });
  } catch (error) {
    console.error('[WGER SYNC] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
