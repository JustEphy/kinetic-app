'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, UserSettings, UserStats, PersonalRecord, RecentActivity, WorkoutPreset, UserProfile } from '@/types';
import { dataStore as localDataStore, generateId } from '@/lib/db';
import { getSupabase } from '@/lib/supabase/client';
import { supabaseDataStore } from '@/lib/supabase/dataStore';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Use Supabase data store for authenticated users, localStorage for guests
const getDataStore = (isGuest: boolean) => isGuest ? localDataStore : supabaseDataStore;

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addPersonalRecord: (record: Omit<PersonalRecord, 'id' | 'achievedAt'>) => Promise<void>;
  updatePersonalRecord: (record: PersonalRecord) => Promise<void>;
  deletePersonalRecord: (recordId: string) => Promise<void>;
  saveWorkoutPreset: (preset: (Omit<WorkoutPreset, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string })) => Promise<void>;
  deleteWorkoutPreset: (presetId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [workoutPresets, setWorkoutPresets] = useState<WorkoutPreset[]>([]);
  const authInitRef = useRef(false);
  const signingOutRef = useRef(false);

  const isGuest = user?.isGuest ?? true;
  const dataStore = getDataStore(isGuest);

  // Convert Supabase user to our User type
  const mapSupabaseUser = (sbUser: SupabaseUser): User => ({
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
    image: sbUser.user_metadata?.avatar_url,
    isGuest: false,
    createdAt: new Date(sbUser.created_at),
    tier: 'free',
    memberSince: new Date(sbUser.created_at),
  });

  // Load user data from dataStore
  const loadUserData = useCallback(async (userId: string, isGuestUser: boolean) => {
    const ds = getDataStore(isGuestUser);
    try {
      const userSettings = await ds.getSettings(userId);
      setSettings(userSettings);
      const userStats = await ds.getUserStats(userId);
      setStats(userStats);
      const records = await ds.getPersonalRecords(userId);
      setPersonalRecords(records);
      const activity = await ds.getRecentActivity(userId);
      setRecentActivity(activity);
      const presets = await ds.getWorkoutPresets(userId);
      setWorkoutPresets(presets);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set defaults on error to prevent infinite loading
      setSettings(DEFAULT_SETTINGS);
      setStats(DEFAULT_STATS);
      setPersonalRecords([]);
      setRecentActivity([]);
      setWorkoutPresets([]);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;

    const supabase = getSupabase();
    let isMounted = true;

    // Check for existing session first
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          // Clear stale data
          await supabase.auth.signOut({ scope: 'local' });
          if (isMounted) setIsLoading(false);
          return;
        }

        if (session?.user && isMounted) {
          const mappedUser = mapSupabaseUser(session.user);
          setUser(mappedUser);
          setSupabaseUser(session.user);
          await loadUserData(session.user.id, false);
        }
        
        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    // Keep callback synchronous; defer async work to avoid auth deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' && signingOutRef.current) {
        setUser(null);
        setSupabaseUser(null);
        setSettings(DEFAULT_SETTINGS);
        setStats(DEFAULT_STATS);
        setPersonalRecords([]);
        setRecentActivity([]);
        setWorkoutPresets([]);
        if (isMounted) setIsLoading(false);
        return;
      }

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        const loadStartedAt = performance.now();
        setIsLoading(true);
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        setSupabaseUser(session.user);

        window.setTimeout(() => {
          void (async () => {
            try {
              await loadUserData(session.user.id, false);
            } catch (error) {
              console.error('Auth state change error:', error);
            } finally {
              if (isMounted) setIsLoading(false);
            }
          })();
        }, 0);
        return;
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        setUser(null);
        setSupabaseUser(null);
        setSettings(DEFAULT_SETTINGS);
        setStats(DEFAULT_STATS);
        setPersonalRecords([]);
        setRecentActivity([]);

        window.setTimeout(() => {
          void (async () => {
            try {
              const guestPresets = await localDataStore.getWorkoutPresets('guest');
              setWorkoutPresets(guestPresets);
            } catch (error) {
              console.error('Auth state change error:', error);
            } finally {
              if (isMounted) setIsLoading(false);
            }
          })();
        }, 0);
        return;
      }

      if (isMounted) setIsLoading(false);
    });

    // Safety valve: never leave UI in loading state
    const loadingTimeout = window.setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Email sign-in error:', error);
        setIsLoading(false);
        throw error;
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    const supabase = getSupabase();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name?.trim() || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Email sign-up error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Email sign-up error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();

    signingOutRef.current = true;

    try {
      const localSignOutResult = await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise<{ error: null }>((resolve) =>
          window.setTimeout(() => resolve({ error: null }), 5000)
        ),
      ]);

      const { error } = localSignOutResult;
      if (error) {
        console.warn('Local sign out warning:', error);
      }

      // Best-effort server-side cookie/session cleanup.
      void fetch('/auth/signout', { method: 'POST' }).catch((serverError) => {
        console.warn('Server sign out warning:', serverError);
      });
    } catch (error) {
      console.warn('Sign out warning:', error);
    } finally {
      // Clear any local auth remnants after Supabase sign-out has been attempted.
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kinetic_token');

        const authKeys = Object.keys(localStorage).filter(
          (key) =>
            key.startsWith('sb-') &&
            (key.includes('-auth-token') || key.includes('-code-verifier') || key.includes('-refresh-token'))
        );
        authKeys.forEach((key) => localStorage.removeItem(key));
      }

      setUser(null);
      setSupabaseUser(null);
      setSettings(DEFAULT_SETTINGS);
      setStats(DEFAULT_STATS);
      setPersonalRecords([]);
      setRecentActivity([]);
      setWorkoutPresets([]);
      // allow a microtask turn so route transition can happen first
      queueMicrotask(() => {
        signingOutRef.current = false;
      });
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (user) {
      const ds = getDataStore(user.isGuest);
      await ds.saveSettings(user.id, updated);
    }
  }, [settings, user]);

  const updateStats = useCallback(async (newStats: Partial<UserStats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated);
    
    if (user) {
      const ds = getDataStore(user.isGuest);
      await ds.updateUserStats(user.id, newStats);
    }
  }, [stats, user]);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    const ds = getDataStore(user.isGuest);
    const updatedUser = { ...user, ...profile };
    setUser(updatedUser);
    await ds.saveUser(updatedUser);
  }, [user, workoutPresets]);

  const addPersonalRecord = useCallback(async (record: Omit<PersonalRecord, 'id' | 'achievedAt'>) => {
    if (!user) return;
    
    const ds = getDataStore(user.isGuest);
    const newRecord: PersonalRecord = {
      ...record,
      id: generateId(),
      achievedAt: new Date(),
    };
    
    setPersonalRecords(prev => [...prev, newRecord]);
    await ds.savePersonalRecord(user.id, newRecord);
  }, [user]);

  const updatePersonalRecord = useCallback(async (record: PersonalRecord) => {
    if (!user) return;
    
    const ds = getDataStore(user.isGuest);
    setPersonalRecords(prev => prev.map(r => r.id === record.id ? record : r));
    await ds.savePersonalRecord(user.id, record);
  }, [user]);

  const deletePersonalRecord = useCallback(async (recordId: string) => {
    if (!user) return;
    
    const ds = getDataStore(user.isGuest);
    setPersonalRecords(prev => prev.filter(r => r.id !== recordId));
    await ds.deletePersonalRecord(user.id, recordId);
  }, [user]);

  const saveWorkoutPreset = useCallback(async (preset: Omit<WorkoutPreset, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const userId = user?.id || 'guest';
    const isGuest = user?.isGuest ?? true;

    const ds = getDataStore(isGuest);
    const createdAt = preset.id
      ? workoutPresets.find((p) => p.id === preset.id)?.createdAt ?? new Date()
      : new Date();
    
    const newPreset: WorkoutPreset = {
      ...preset,
      id: preset.id ?? generateId(),
      userId,
      createdAt,
      updatedAt: new Date(),
    };
    
    // Optimistically update local state first (instant UI feedback)
    setWorkoutPresets(prev => {
      const existingIndex = prev.findIndex((p) => p.id === newPreset.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newPreset;
        return updated;
      }
      return [newPreset, ...prev];
    });
    
    // Save to database (this is the slow part on free tier)
    await ds.saveWorkoutPreset(newPreset);
    
    // Skip the refresh - we already have the correct local state
    // This cuts latency in half on Supabase free tier
  }, [user, workoutPresets]);

  const deleteWorkoutPreset = useCallback(async (presetId: string) => {
    const ds = getDataStore(user?.isGuest ?? true);
    setWorkoutPresets(prev => prev.filter(p => p.id !== presetId));
    await ds.deleteWorkoutPreset(presetId);
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    const ds = getDataStore(user.isGuest);
    try {
      const userSettings = await ds.getSettings(user.id);
      setSettings(userSettings);
      const userStats = await ds.getUserStats(user.id);
      setStats(userStats);
      const records = await ds.getPersonalRecords(user.id);
      setPersonalRecords(records);
      const activity = await ds.getRecentActivity(user.id);
      setRecentActivity(activity);
      const presets = await ds.getWorkoutPresets(user.id);
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
    signInWithEmail,
    signUpWithEmail,
    signOut,
    requestPasswordReset,
    updatePassword,
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
