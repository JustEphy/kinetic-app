import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RefreshResult = {
  sync: unknown;
  embeddings: unknown;
};

function resolveInternalOrigin(requestUrl: string): string {
  const configured =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return new URL(configured).origin;
  }

  return new URL(requestUrl).origin;
}

async function postJson(url: string, secret: string): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-ingest-secret': secret,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Failed calling ${url}: ${JSON.stringify(body)}`);
  }
  return body;
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

    const host = resolveInternalOrigin(req.url);
    const syncResult = await postJson(`${host}/api/ai/knowledge/sync-wger`, ingestSecret);
    const embeddingResult = await postJson(`${host}/api/ai/knowledge/backfill-embeddings`, ingestSecret);

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: logError } = await supabase.from('ai_generation_logs').insert({
      user_id: null,
      route: '/api/ai/knowledge/refresh',
      prompt: 'scheduled-refresh',
      rag_context: null,
      model: 'hybrid-rag-free-tier',
      response_summary: JSON.stringify({ syncResult, embeddingResult }).slice(0, 1500),
    });
    if (logError) {
      console.warn('[AI REFRESH] failed to write refresh log:', logError.message);
    }

    const result: RefreshResult = {
      sync: syncResult,
      embeddings: embeddingResult,
    };

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('[AI REFRESH] error:', error);
    return NextResponse.json({ error: 'Failed to refresh AI knowledge' }, { status: 500 });
  }
}
