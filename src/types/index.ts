// Workout and Timer Types

export interface WorkoutInterval {
  id: string;
  type: 'work' | 'rest' | 'warmup' | 'cooldown';
  duration: number; // in seconds
  name: string;
  description?: string;
}

export interface Workout {
  id: string;
  name: string;
  totalDuration: number; // in seconds
  intervals: WorkoutInterval[];
  intensity: number; // 0-100
  estimatedCalories: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workout: Workout;
  startedAt: Date;
  completedAt?: Date;
  currentIntervalIndex: number;
  elapsedTime: number; // total elapsed in seconds
  intervalElapsedTime: number; // current interval elapsed
  status: 'idle' | 'running' | 'paused' | 'completed';
  caloriesBurned: number;
}

// User and Auth Types

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  isGuest: boolean;
  createdAt: Date;
  tier?: 'free' | 'pro' | 'elite';
  memberSince?: Date;
  role?: 'guest' | 'user' | 'admin';
}

export interface UserStats {
  lifetimeTotalTime: number; // in hours
  totalCaloriesBurnt: number;
  workoutsCompleted: number;
  currentStreak: number;
  monthlyGoalHours: number;
  monthlyCompletedHours: number;
}

export interface PersonalRecord {
  id: string;
  category: string;
  value: number;
  unit: string;
  achievedAt: Date;
  trend: 'up' | 'down' | 'stable';
}

// Settings Types

export interface UserSettings {
  theme: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  voiceEnabled: boolean;
  keepScreenOn: boolean;
  autoStartIntervals: boolean;
  units: 'metric' | 'imperial';
  // Legacy aliases (for backwards compatibility)
  audioCues?: boolean;
  hapticFeedback?: boolean;
  screenAlwaysOn?: boolean;
}

// Activity Types

export interface RecentActivity {
  id: string;
  workoutName: string;
  type: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'recovery';
  completedAt: Date;
  duration: number; // in minutes
  metrics: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
}

// AI Workout Generation

export interface AIWorkoutRequest {
  prompt: string;
  totalDuration?: number;
  workInterval?: number;
  restInterval?: number;
}

export interface AIWorkoutResponse {
  workout: Workout;
  message: string;
}

// Weekly Activity for Stats

export interface WeeklyActivity {
  day: string;
  intensity: number; // 0-100
  isHighlight: boolean;
}

// Data Layer Interface - for future database integration

export interface DataStore {
  // User
  getUser(id: string): Promise<User | null>;
  saveUser(user: User): Promise<void>;
  
  // Workouts
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | null>;
  saveWorkout(workout: Workout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  
  // Workout Presets
  getWorkoutPresets(userId: string): Promise<WorkoutPreset[]>;
  saveWorkoutPreset(preset: WorkoutPreset): Promise<void>;
  deleteWorkoutPreset(id: string): Promise<void>;
  
  // Sessions
  getSessions(userId: string): Promise<WorkoutSession[]>;
  saveSession(session: WorkoutSession): Promise<void>;
  
  // Stats
  getUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<void>;
  
  // Settings
  getSettings(userId: string): Promise<UserSettings>;
  saveSettings(userId: string, settings: UserSettings): Promise<void>;
  
  // Personal Records
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  savePersonalRecord(userId: string, record: PersonalRecord): Promise<void>;
  deletePersonalRecord(userId: string, recordId: string): Promise<void>;
  
  // Recent Activity
  getRecentActivity(userId: string, limit?: number): Promise<RecentActivity[]>;
  saveActivity(userId: string, activity: RecentActivity): Promise<void>;
  
  // User Profile
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void>;
}

// User Profile (editable user info)
export interface UserProfile {
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  fitnessGoal?: string;
  preferredWorkoutTypes: string[];
}

// Workout Preset (saved workout templates)
export interface WorkoutPreset {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes (15, 30, 45, 60, 90)
  intervals: WorkoutInterval[];
  userId: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
