-- KINETIC App Database Schema (idempotent)
-- Safe to re-run in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  fitness_goal TEXT,
  preferred_workout_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'midnight-cyber',
  sound_enabled BOOLEAN DEFAULT true,
  haptic_enabled BOOLEAN DEFAULT true,
  voice_enabled BOOLEAN DEFAULT false,
  keep_screen_on BOOLEAN DEFAULT false,
  auto_start_intervals BOOLEAN DEFAULT true,
  units TEXT DEFAULT 'metric',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  lifetime_total_time INTEGER DEFAULT 0,
  total_calories_burnt INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  monthly_goal_hours INTEGER DEFAULT 120,
  monthly_completed_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_duration INTEGER,
  intervals JSONB,
  intensity INTEGER DEFAULT 50,
  estimated_calories INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT,
  workout JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  elapsed_time INTEGER DEFAULT 0,
  interval_elapsed_time INTEGER DEFAULT 0,
  current_interval_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'idle',
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  achieved_at TIMESTAMPTZ NOT NULL,
  trend TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recent_activity (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  type TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration INTEGER,
  metrics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_presets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  intervals JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_knowledge_exercises (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'wger',
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  equipment TEXT[] DEFAULT '{}',
  primary_muscles TEXT[] DEFAULT '{}',
  secondary_muscles TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal TEXT,
  split TEXT,
  difficulty TEXT,
  notes TEXT,
  intervals JSONB NOT NULL DEFAULT '[]',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_templates_global_title_unique
  ON ai_workout_templates (title)
  WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS ai_feedback_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  prompt TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  generated_workout JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  prompt TEXT,
  rag_context TEXT,
  model TEXT,
  response_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_user_id ON recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_presets_user_id ON workout_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_name ON ai_knowledge_exercises(name);
CREATE INDEX IF NOT EXISTS idx_ai_templates_user_id ON ai_workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON ai_feedback_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);

-- Optional vector indexes (fine on free tier with small data)
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_embedding ON ai_knowledge_exercises USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
CREATE INDEX IF NOT EXISTS idx_ai_templates_embedding ON ai_workout_templates USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Drop/recreate policies so reruns do not fail
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;
CREATE POLICY "Users can view own sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own records" ON personal_records;
DROP POLICY IF EXISTS "Users can insert own records" ON personal_records;
DROP POLICY IF EXISTS "Users can update own records" ON personal_records;
DROP POLICY IF EXISTS "Users can delete own records" ON personal_records;
CREATE POLICY "Users can view own records" ON personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON personal_records FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own activity" ON recent_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON recent_activity;
CREATE POLICY "Users can view own activity" ON recent_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON recent_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own presets or defaults" ON workout_presets;
DROP POLICY IF EXISTS "Users can insert own presets" ON workout_presets;
DROP POLICY IF EXISTS "Users can update own presets" ON workout_presets;
DROP POLICY IF EXISTS "Users can delete own presets" ON workout_presets;
CREATE POLICY "Users can view own presets or defaults" ON workout_presets FOR SELECT USING (auth.uid() = user_id OR is_default = true);
CREATE POLICY "Users can insert own presets" ON workout_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presets" ON workout_presets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presets" ON workout_presets FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can read AI knowledge" ON ai_knowledge_exercises;
CREATE POLICY "Everyone can read AI knowledge" ON ai_knowledge_exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own templates" ON ai_workout_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON ai_workout_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON ai_workout_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON ai_workout_templates;
CREATE POLICY "Users can view own templates" ON ai_workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON ai_workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON ai_workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON ai_workout_templates FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback signals" ON ai_feedback_signals;
DROP POLICY IF EXISTS "Users can insert own feedback signals" ON ai_feedback_signals;
CREATE POLICY "Users can view own feedback signals" ON ai_feedback_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback signals" ON ai_feedback_signals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own generation logs" ON ai_generation_logs;
DROP POLICY IF EXISTS "Users can insert own generation logs" ON ai_generation_logs;
CREATE POLICY "Users can view own generation logs" ON ai_generation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generation logs" ON ai_generation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_stats (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
