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
  const cwd = process.cwd();
  const envLocalPath = path.join(cwd, '.env.local');
  const envFromFile = parseEnvFile(envLocalPath);

  const ingestSecret = process.env.AI_INGEST_SECRET || envFromFile.AI_INGEST_SECRET;
  if (!ingestSecret) {
    throw new Error('AI_INGEST_SECRET is missing in .env.local or process env.');
  }

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const endpoint = `${appUrl.replace(/\/$/, '')}/api/ai/knowledge/refresh`;

  console.log(`[sync:wger] Triggering refresh pipeline ${endpoint}`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-ingest-secret': ingestSecret,
    },
  });

  const text = await response.text();
  let payload = text;
  try {
    payload = JSON.parse(text);
  } catch {
    // Keep raw text
  }

  if (!response.ok) {
    console.error('[sync:wger] Failed:', payload);
    process.exit(1);
  }

  console.log('[sync:wger] Success:', payload);
}

main().catch((error) => {
  console.error('[sync:wger] Error:', error.message);
  process.exit(1);
});
