/**
 * Supabase Data Store Implementation
 * Replaces localStorage with Supabase for persistent cloud storage
 */

import { getSupabase } from './client';
import {
  User,
  Workout,
  WorkoutSession,
  UserStats,
  UserSettings,
  PersonalRecord,
  RecentActivity,
  DataStore,
  WorkoutPreset,
  UserProfile,
} from '@/types';

// Default values
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'kinetic-volt',
  soundEnabled: true,
  hapticEnabled: true,
  voiceEnabled: false,
  keepScreenOn: false,
  autoStartIntervals: true,
  units: 'metric',
};

const DEFAULT_STATS: UserStats = {
  lifetimeTotalTime: 0,
  totalCaloriesBurnt: 0,
  workoutsCompleted: 0,
  currentStreak: 0,
  monthlyGoalHours: 120,
  monthlyCompletedHours: 0,
};

/**
 * Supabase Data Store Implementation
 */
export const supabaseDataStore: DataStore = {
  // User - Uses Supabase Auth user + profiles table
  async getUser(id: string): Promise<User | null> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email?.split('@')[0],
      image: data.avatar_url,
      isGuest: false,
      createdAt: new Date(data.created_at),
    };
  },

  async saveUser(user: User): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.image,
      updated_at: new Date().toISOString(),
    });
  },

  // Workouts
  async getWorkouts(userId: string): Promise<Workout[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(w => ({
      id: w.id,
      userId: w.user_id,
      name: w.name,
      totalDuration: w.total_duration,
      intervals: w.intervals || [],
      intensity: w.intensity || 50,
      estimatedCalories: w.estimated_calories || 0,
      createdAt: new Date(w.created_at),
      updatedAt: new Date(w.updated_at),
    }));
  },

  async getWorkout(id: string): Promise<Workout | null> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      totalDuration: data.total_duration,
      intervals: data.intervals || [],
      intensity: data.intensity || 50,
      estimatedCalories: data.estimated_calories || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async saveWorkout(workout: Workout): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('workouts').upsert({
      id: workout.id,
      user_id: workout.userId,
      name: workout.name,
      total_duration: workout.totalDuration,
      intervals: workout.intervals,
      intensity: workout.intensity,
      estimated_calories: workout.estimatedCalories,
      updated_at: new Date().toISOString(),
    });
  },

  async deleteWorkout(id: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from('workouts').delete().eq('id', id);
  },

  // Sessions
  async getSessions(userId: string): Promise<WorkoutSession[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(100);
    
    if (error || !data) return [];
    
    return data.map(s => ({
      id: s.id,
      workoutId: s.workout_id,
      workout: s.workout,
      startedAt: new Date(s.started_at),
      completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
      elapsedTime: s.elapsed_time,
      intervalElapsedTime: s.interval_elapsed_time || 0,
      currentIntervalIndex: s.current_interval_index || 0,
      status: s.status,
      caloriesBurned: s.calories_burned || 0,
    }));
  },

  async saveSession(session: WorkoutSession): Promise<void> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('workout_sessions').upsert({
      id: session.id,
      user_id: user?.id,
      workout_id: session.workoutId,
      workout: session.workout,
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt?.toISOString(),
      elapsed_time: session.elapsedTime,
      interval_elapsed_time: session.intervalElapsedTime,
      current_interval_index: session.currentIntervalIndex,
      status: session.status,
      calories_burned: session.caloriesBurned,
    });
  },

  // Stats
  async getUserStats(userId: string): Promise<UserStats> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return DEFAULT_STATS;
    
    return {
      lifetimeTotalTime: data.lifetime_total_time || 0,
      totalCaloriesBurnt: data.total_calories_burnt || 0,
      workoutsCompleted: data.workouts_completed || 0,
      currentStreak: data.current_streak || 0,
      monthlyGoalHours: data.monthly_goal_hours || 120,
      monthlyCompletedHours: data.monthly_completed_hours || 0,
    };
  },

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    const supabase = getSupabase();
    
    const updateData: Record<string, unknown> = { user_id: userId };
    if (stats.lifetimeTotalTime !== undefined) updateData.lifetime_total_time = stats.lifetimeTotalTime;
    if (stats.totalCaloriesBurnt !== undefined) updateData.total_calories_burnt = stats.totalCaloriesBurnt;
    if (stats.workoutsCompleted !== undefined) updateData.workouts_completed = stats.workoutsCompleted;
    if (stats.currentStreak !== undefined) updateData.current_streak = stats.currentStreak;
    if (stats.monthlyGoalHours !== undefined) updateData.monthly_goal_hours = stats.monthlyGoalHours;
    if (stats.monthlyCompletedHours !== undefined) updateData.monthly_completed_hours = stats.monthlyCompletedHours;
    updateData.updated_at = new Date().toISOString();
    
    await supabase.from('user_stats').upsert(updateData);
  },

  // Settings
  async getSettings(userId: string): Promise<UserSettings> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return DEFAULT_SETTINGS;
    
    return {
      theme: data.theme || DEFAULT_SETTINGS.theme,
      soundEnabled: data.sound_enabled ?? DEFAULT_SETTINGS.soundEnabled,
      hapticEnabled: data.haptic_enabled ?? DEFAULT_SETTINGS.hapticEnabled,
      voiceEnabled: data.voice_enabled ?? DEFAULT_SETTINGS.voiceEnabled,
      keepScreenOn: data.keep_screen_on ?? DEFAULT_SETTINGS.keepScreenOn,
      autoStartIntervals: data.auto_start_intervals ?? DEFAULT_SETTINGS.autoStartIntervals,
      units: data.units || DEFAULT_SETTINGS.units,
    };
  },

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('user_settings').upsert({
      user_id: userId,
      theme: settings.theme,
      sound_enabled: settings.soundEnabled,
      haptic_enabled: settings.hapticEnabled,
      voice_enabled: settings.voiceEnabled,
      keep_screen_on: settings.keepScreenOn,
      auto_start_intervals: settings.autoStartIntervals,
      units: settings.units,
      updated_at: new Date().toISOString(),
    });
  },

  // Personal Records
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(r => ({
      id: r.id,
      category: r.category,
      value: r.value,
      unit: r.unit,
      achievedAt: new Date(r.achieved_at),
      trend: r.trend || 'stable' as const,
    }));
  },

  async savePersonalRecord(userId: string, record: PersonalRecord): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('personal_records').upsert({
      id: record.id,
      user_id: userId,
      category: record.category,
      value: record.value,
      unit: record.unit,
      achieved_at: record.achievedAt.toISOString(),
      trend: record.trend,
    });
  },

  async deletePersonalRecord(userId: string, recordId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from('personal_records').delete().eq('id', recordId);
  },

  // Recent Activity
  async getRecentActivity(userId: string, limit = 10): Promise<RecentActivity[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('recent_activity')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    
    return data.map(a => ({
      id: a.id,
      workoutName: a.workout_name,
      type: a.type,
      completedAt: new Date(a.completed_at),
      duration: a.duration,
      metrics: a.metrics || [],
    }));
  },

  async saveActivity(userId: string, activity: RecentActivity): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('recent_activity').insert({
      id: activity.id,
      user_id: userId,
      workout_name: activity.workoutName,
      type: activity.type,
      completed_at: activity.completedAt.toISOString(),
      duration: activity.duration,
      metrics: activity.metrics,
    });
  },

  // Workout Presets
  async getWorkoutPresets(userId: string): Promise<WorkoutPreset[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('workout_presets')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      duration: p.duration,
      intervals: p.intervals,
      userId: p.user_id,
      isDefault: p.is_default,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));
  },

  async saveWorkoutPreset(preset: WorkoutPreset): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase.from('workout_presets').upsert({
      id: preset.id,
      user_id: preset.userId,
      name: preset.name,
      description: preset.description,
      duration: preset.duration,
      intervals: preset.intervals,
      is_default: preset.isDefault || false,
      updated_at: new Date().toISOString(),
    });
    
    if (error) {
      throw new Error(`Failed to save preset: ${error.message}`);
    }
  },

  async deleteWorkoutPreset(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('workout_presets').delete().eq('id', id);
    
    if (error) {
      console.error('Failed to delete workout preset:', error);
      throw new Error(`Failed to delete preset: ${error.message}`);
    }
  },

  // User Profile
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const supabase = getSupabase();
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (profile.name !== undefined) updateData.name = profile.name;
    if (profile.email !== undefined) updateData.email = profile.email;
    if (profile.image !== undefined) updateData.avatar_url = profile.image;
    if (profile.bio !== undefined) updateData.bio = profile.bio;
    if (profile.fitnessGoal !== undefined) updateData.fitness_goal = profile.fitnessGoal;
    if (profile.preferredWorkoutTypes !== undefined) updateData.preferred_workout_types = profile.preferredWorkoutTypes;
    
    await supabase.from('profiles').update(updateData).eq('id', userId);
  },
};
