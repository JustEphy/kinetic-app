import fs from 'node:fs';
import path from 'node:path';

function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = {
    ...parseEnvFile(path.join(process.cwd(), '.env.local')),
    ...process.env,
  };

  const ingestSecret = env.AI_INGEST_SECRET;
  if (!ingestSecret) throw new Error('Missing AI_INGEST_SECRET');

  const appUrl = env.APP_URL || 'http://localhost:3000';
  const endpoint = `${appUrl.replace(/\/$/, '')}/api/ai/knowledge/backfill-embeddings`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-ingest-secret': ingestSecret,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(JSON.stringify(body));
  console.log('[backfill:embeddings] Success:', body);
}

main().catch((error) => {
  console.error('[backfill:embeddings] Error:', error.message);
  process.exit(1);
});
