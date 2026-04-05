'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserSettings, UserStats, PersonalRecord, RecentActivity, WorkoutPreset, UserProfile } from '@/types';
import { dataStore, generateId, generateGuestToken, getStoredToken } from '@/lib/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  settings: UserSettings;
  stats: UserStats;
  personalRecords: PersonalRecord[];
  recentActivity: RecentActivity[];
  workoutPresets: WorkoutPreset[];
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addPersonalRecord: (record: Omit<PersonalRecord, 'id' | 'achievedAt'>) => Promise<void>;
  updatePersonalRecord: (record: PersonalRecord) => Promise<void>;
  deletePersonalRecord: (recordId: string) => Promise<void>;
  saveWorkoutPreset: (preset: Omit<WorkoutPreset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteWorkoutPreset: (presetId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [workoutPresets, setWorkoutPresets] = useState<WorkoutPreset[]>([]);

  const isGuest = user?.isGuest ?? true;

  // Load user data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredToken();
        
        if (token) {
          // Load existing user
          const existingUser = await dataStore.getUser(token);
          if (existingUser) {
            setUser(existingUser);
            const userSettings = await dataStore.getSettings(token);
            setSettings(userSettings);
            const userStats = await dataStore.getUserStats(token);
            setStats(userStats);
            const records = await dataStore.getPersonalRecords(token);
            setPersonalRecords(records);
            const activity = await dataStore.getRecentActivity(token);
            setRecentActivity(activity);
            const presets = await dataStore.getWorkoutPresets(token);
            setWorkoutPresets(presets);
          }
        } else {
          // Load guest presets even without a user
          const guestPresets = await dataStore.getWorkoutPresets('guest');
          setWorkoutPresets(guestPresets);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // In a real app, this would trigger NextAuth Google sign-in
    // For now, we'll simulate it
    console.log('Google sign-in would happen here');
    // window.location.href = '/api/auth/signin/google';
  }, []);

  const signInAsGuest = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = generateGuestToken();
      const guestUser: User = {
        id: token,
        name: 'Guest User',
        isGuest: true,
        createdAt: new Date(),
        tier: 'free',
        memberSince: new Date(),
      };
      
      await dataStore.saveUser(guestUser);
      await dataStore.saveSettings(token, DEFAULT_SETTINGS);
      
      setUser(guestUser);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Guest sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setSettings(DEFAULT_SETTINGS);
    setStats(DEFAULT_STATS);
    // Note: We don't clear localStorage here to preserve guest data
    // In a real app, you might want to clear it
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (user) {
      await dataStore.saveSettings(user.id, updated);
    }
  }, [settings, user]);

  const updateStats = useCallback(async (newStats: Partial<UserStats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    
    if (user) {
      await dataStore.updateUserStats(user.id, newStats);
    }
  }, [stats, user]);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...profile };
    setUser(updatedUser);
    await dataStore.saveUser(updatedUser);
  }, [user]);

  const addPersonalRecord = useCallback(async (record: Omit<PersonalRecord, 'id' | 'achievedAt'>) => {
    if (!user) return;
    
    const newRecord: PersonalRecord = {
      ...record,
      id: generateId(),
      achievedAt: new Date(),
    };
    
    setPersonalRecords(prev => [...prev, newRecord]);
    await dataStore.savePersonalRecord(user.id, newRecord);
  }, [user]);

  const updatePersonalRecord = useCallback(async (record: PersonalRecord) => {
    if (!user) return;
    
    setPersonalRecords(prev => prev.map(r => r.id === record.id ? record : r));
    await dataStore.savePersonalRecord(user.id, record);
  }, [user]);

  const deletePersonalRecord = useCallback(async (recordId: string) => {
    if (!user) return;
    
    setPersonalRecords(prev => prev.filter(r => r.id !== recordId));
    await dataStore.deletePersonalRecord(user.id, recordId);
  }, [user]);

  const saveWorkoutPreset = useCallback(async (preset: Omit<WorkoutPreset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const userId = user?.id || 'guest';
    
    const newPreset: WorkoutPreset = {
      ...preset,
      id: generateId(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWorkoutPresets(prev => [...prev, newPreset]);
    await dataStore.saveWorkoutPreset(newPreset);
  }, [user]);

  const deleteWorkoutPreset = useCallback(async (presetId: string) => {
    setWorkoutPresets(prev => prev.filter(p => p.id !== presetId));
    await dataStore.deleteWorkoutPreset(presetId);
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      const userSettings = await dataStore.getSettings(user.id);
      setSettings(userSettings);
      const userStats = await dataStore.getUserStats(user.id);
      setStats(userStats);
      const records = await dataStore.getPersonalRecords(user.id);
      setPersonalRecords(records);
      const activity = await dataStore.getRecentActivity(user.id);
      setRecentActivity(activity);
      const presets = await dataStore.getWorkoutPresets(user.id);
      setWorkoutPresets(presets);
    } catch (error) {
      console.error('Data refresh error:', error);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isGuest,
    settings,
    stats,
    personalRecords,
    recentActivity,
    workoutPresets,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    updateSettings,
    updateStats,
    updateProfile,
    addPersonalRecord,
    updatePersonalRecord,
    deletePersonalRecord,
    saveWorkoutPreset,
    deleteWorkoutPreset,
    refreshData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
