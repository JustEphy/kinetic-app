## Hybrid RAG Setup (Free Tier Friendly)

1. Run updated `supabase/schema_idempotent.sql` in Supabase SQL Editor.
2. Set env vars:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_INGEST_SECRET`
   - `WGER_API_KEY` (optional, recommended)
3. Trigger full refresh pipeline (WGER sync + embedding backfill):
   - `npm run sync:wger`
   - or `POST /api/ai/knowledge/refresh` with header `x-ingest-secret`
4. Optional manual embedding refresh:
   - `npm run backfill:embeddings`
5. Chat/build routes now use hybrid retrieval:
   - keyword SQL retrieval from `ai_knowledge_exercises`
   - template retrieval from `ai_workout_templates`
   - user signals from profile/stats/activity
6. Learning loop:
   - successful builds are logged to `ai_feedback_signals`.

### Why hybrid on free tier
- Lower cost than full embedding-only flow.
- Works immediately with SQL retrieval.
- Uses deterministic embeddings + pgvector index for better semantic matching without paid embedding APIs.
