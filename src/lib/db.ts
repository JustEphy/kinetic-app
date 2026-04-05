/**
 * Data Layer - LocalStorage Implementation
 * This provides a database-ready abstraction that can be swapped out
 * for PostgreSQL, MongoDB, or any other database solution.
 */

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

const STORAGE_KEYS = {
  USER: 'kinetic_user',
  WORKOUTS: 'kinetic_workouts',
  SESSIONS: 'kinetic_sessions',
  STATS: 'kinetic_stats',
  SETTINGS: 'kinetic_settings',
  RECORDS: 'kinetic_records',
  ACTIVITY: 'kinetic_activity',
  TOKEN: 'kinetic_token',
  PRESETS: 'kinetic_presets',
  PROFILE: 'kinetic_profile',
};

// Default values
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'midnight-cyber',
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

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  },
};

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate a simple token for guest users
export const generateGuestToken = (): string => {
  const token = `guest_${generateId()}`;
  safeLocalStorage.setItem(STORAGE_KEYS.TOKEN, token);
  return token;
};

export const getStoredToken = (): string | null => {
  return safeLocalStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const clearStoredToken = (): void => {
  safeLocalStorage.removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * LocalStorage Data Store Implementation
 */
export const localStorageDataStore: DataStore = {
  // User
  async getUser(id: string): Promise<User | null> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    const user = JSON.parse(data);
    return user.id === id ? user : null;
  },

  async saveUser(user: User): Promise<void> {
    safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Workouts
  async getWorkouts(userId: string): Promise<Workout[]> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (!data) return [];
    const workouts: Workout[] = JSON.parse(data);
    return workouts.filter((w) => w.userId === userId);
  },

  async getWorkout(id: string): Promise<Workout | null> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (!data) return null;
    const workouts: Workout[] = JSON.parse(data);
    return workouts.find((w) => w.id === id) || null;
  },

  async saveWorkout(workout: Workout): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.WORKOUTS);
    const workouts: Workout[] = data ? JSON.parse(data) : [];
    const index = workouts.findIndex((w) => w.id === workout.id);
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    safeLocalStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  async deleteWorkout(id: string): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (!data) return;
    const workouts: Workout[] = JSON.parse(data);
    const filtered = workouts.filter((w) => w.id !== id);
    safeLocalStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filtered));
  },

  // Sessions
  async getSessions(userId: string): Promise<WorkoutSession[]> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    return JSON.parse(data);
  },

  async saveSession(session: WorkoutSession): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: WorkoutSession[] = data ? JSON.parse(data) : [];
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    // Keep only last 100 sessions
    const trimmed = sessions.slice(-100);
    safeLocalStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));
  },

  // Stats
  async getUserStats(userId: string): Promise<UserStats> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return DEFAULT_STATS;
    return JSON.parse(data);
  },

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void> {
    const current = await this.getUserStats(userId);
    const updated = { ...current, ...stats };
    safeLocalStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  },

  // Settings
  async getSettings(userId: string): Promise<UserSettings> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    return JSON.parse(data);
  },

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    safeLocalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Personal Records
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!data) return [];
    return JSON.parse(data);
  },

  async savePersonalRecord(userId: string, record: PersonalRecord): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.RECORDS);
    const records: PersonalRecord[] = data ? JSON.parse(data) : [];
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    safeLocalStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  async deletePersonalRecord(userId: string, recordId: string): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!data) return;
    const records: PersonalRecord[] = JSON.parse(data);
    const filtered = records.filter((r) => r.id !== recordId);
    safeLocalStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
  },

  // Recent Activity
  async getRecentActivity(userId: string, limit = 10): Promise<RecentActivity[]> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!data) return [];
    const activities: RecentActivity[] = JSON.parse(data);
    return activities.slice(-limit).reverse();
  },

  async saveActivity(userId: string, activity: RecentActivity): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.ACTIVITY);
    const activities: RecentActivity[] = data ? JSON.parse(data) : [];
    activities.push(activity);
    // Keep only last 50 activities
    const trimmed = activities.slice(-50);
    safeLocalStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(trimmed));
  },

  // Workout Presets
  async getWorkoutPresets(userId: string): Promise<WorkoutPreset[]> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!data) return [];
    const presets: WorkoutPreset[] = JSON.parse(data);
    return presets.filter((p) => p.userId === userId || p.isDefault);
  },

  async saveWorkoutPreset(preset: WorkoutPreset): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PRESETS);
    const presets: WorkoutPreset[] = data ? JSON.parse(data) : [];
    const index = presets.findIndex((p) => p.id === preset.id);
    if (index >= 0) {
      presets[index] = preset;
    } else {
      presets.push(preset);
    }
    safeLocalStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  },

  async deleteWorkoutPreset(id: string): Promise<void> {
    const data = safeLocalStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!data) return;
    const presets: WorkoutPreset[] = JSON.parse(data);
    const filtered = presets.filter((p) => p.id !== id);
    safeLocalStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(filtered));
  },

  // User Profile
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userData = safeLocalStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return;
    const user = JSON.parse(userData);
    const updatedUser = { ...user, ...profile };
    safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  },
};

// Export the current data store (can be swapped for different implementations)
export const dataStore = localStorageDataStore;

/**
 * Future Database Implementation Example:
 * 
 * export const postgresDataStore: DataStore = {
 *   async getUser(id: string) {
 *     const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 *     return result.rows[0] || null;
 *   },
 *   // ... other methods
 * };
 * 
 * export const mongoDataStore: DataStore = {
 *   async getUser(id: string) {
 *     return await User.findById(id);
 *   },
 *   // ... other methods
 * };
 */
