import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const defaultTemplates = [
  {
    title: 'Beginner Full Body Intervals',
    goal: 'general fitness',
    split: 'full-body',
    difficulty: 'beginner',
    notes: 'Balanced low-impact routine with progressive intensity.',
    intervals: [
      { id: 't1', type: 'warmup', duration: 180, name: 'Warm Up' },
      { id: 't2', type: 'work', duration: 45, name: 'Bodyweight Circuit' },
      { id: 't3', type: 'rest', duration: 30, name: 'Recovery' },
      { id: 't4', type: 'work', duration: 45, name: 'Core Focus' },
      { id: 't5', type: 'cooldown', duration: 120, name: 'Cool Down' },
    ],
  },
  {
    title: 'HIIT Fat Burn Express',
    goal: 'fat loss',
    split: 'conditioning',
    difficulty: 'intermediate',
    notes: 'Short high-intensity blocks with controlled recovery.',
    intervals: [
      { id: 'h1', type: 'warmup', duration: 120, name: 'Warm Up' },
      { id: 'h2', type: 'work', duration: 40, name: 'Power Interval' },
      { id: 'h3', type: 'rest', duration: 20, name: 'Rest' },
      { id: 'h4', type: 'work', duration: 40, name: 'Cardio Burst' },
      { id: 'h5', type: 'cooldown', duration: 120, name: 'Cool Down' },
    ],
  },
  {
    title: 'Strength Endurance Builder',
    goal: 'strength endurance',
    split: 'upper-lower',
    difficulty: 'advanced',
    notes: 'Longer intervals to build muscular endurance capacity.',
    intervals: [
      { id: 's1', type: 'warmup', duration: 180, name: 'Warm Up' },
      { id: 's2', type: 'work', duration: 90, name: 'Upper Block' },
      { id: 's3', type: 'rest', duration: 45, name: 'Transition' },
      { id: 's4', type: 'work', duration: 90, name: 'Lower Block' },
      { id: 's5', type: 'cooldown', duration: 150, name: 'Cool Down' },
    ],
  },
];

async function main() {
  const env = {
    ...parseEnvFile(path.join(process.cwd(), '.env.local')),
    ...process.env,
  };

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const rows = defaultTemplates.map((template) => ({
    user_id: null,
    title: template.title,
    goal: template.goal,
    split: template.split,
    difficulty: template.difficulty,
    notes: template.notes,
    intervals: template.intervals,
    updated_at: new Date().toISOString(),
  }));

  const { error: deleteError } = await supabase
    .from('ai_workout_templates')
    .delete()
    .is('user_id', null);
  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await supabase.from('ai_workout_templates').insert(rows);
  if (insertError) throw new Error(insertError.message);

  console.log(`[seed:ai-templates] Inserted ${rows.length} default templates.`);
}

main().catch((error) => {
  console.error('[seed:ai-templates] Error:', error.message);
  process.exit(1);
});
