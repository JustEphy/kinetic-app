'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Workout, WorkoutInterval, WorkoutSession } from '@/types';
import { generateId, dataStore } from '@/lib/db';
import { notify, audioManager, triggerHaptic } from '@/lib/audio';

interface WorkoutContextType {
  // Current workout state
  workout: Workout | null;
  session: WorkoutSession | null;
  currentInterval: WorkoutInterval | null;
  nextInterval: WorkoutInterval | null;
  
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  intervalElapsedTime: number;
  intervalRemainingTime: number;
  progress: number; // 0-100 overall progress
  intervalProgress: number; // 0-100 current interval progress
  
  // Settings
  soundEnabled: boolean;
  hapticEnabled: boolean;
  lastTransitionAt: number;
  
  // Actions
  setWorkout: (workout: Workout) => void;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  resetWorkout: () => void;
  endWorkout: () => void;
  skipInterval: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workout, setWorkoutState] = useState<Workout | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalElapsedTime, setIntervalElapsedTime] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [lastTransitionAt, setLastTransitionAt] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // Computed values
  const currentInterval = workout?.intervals[currentIntervalIndex] || null;
  const nextInterval = workout?.intervals[currentIntervalIndex + 1] || null;
  const intervalRemainingTime = currentInterval 
    ? Math.max(0, currentInterval.duration - intervalElapsedTime) 
    : 0;
  const progress = workout 
    ? Math.min(100, (elapsedTime / workout.totalDuration) * 100) 
    : 0;
  // Calculate interval progress - use remaining time to ensure circle fills at 0
  const intervalProgress = currentInterval 
    ? Math.min(100, ((currentInterval.duration - intervalRemainingTime) / currentInterval.duration) * 100) 
    : 0;

  // Initialize audio on mount
  useEffect(() => {
    audioManager.init();
  }, []);

  // Timer logic
  const tick = useCallback(() => {
    if (!workout || !currentInterval) return;

    setElapsedTime(prev => prev + 1);
    setIntervalElapsedTime(prev => {
      const newTime = prev + 1;
      const timeRemaining = currentInterval.duration - newTime;
      
      // Countdown beeps at 5, 4, 3, 2, 1 seconds - loud beeps
      if (timeRemaining >= 1 && timeRemaining <= 5) {
        if (soundEnabled) {
          audioManager.playSound('countdown');
        }
        if (hapticEnabled) {
          triggerHaptic('medium');
        }
      }
      
      // Check if interval is complete (timeRemaining === 0)
      if (newTime >= currentInterval.duration) {
        // Play trill at 0 - the transition sound
        if (soundEnabled) {
          audioManager.playSound('trill');
        }
        if (hapticEnabled) {
          triggerHaptic('heavy');
        }
        
        // Move to next interval
        const nextIdx = currentIntervalIndex + 1;
        
        if (nextIdx >= workout.intervals.length) {
          // Workout complete
          setIsRunning(false);
          notify('complete', { sound: soundEnabled, haptic: hapticEnabled });
          
          // Save session
          if (session) {
            const completedSession: WorkoutSession = {
              ...session,
              completedAt: new Date(),
              status: 'completed',
              elapsedTime: elapsedTime + 1,
            };
            dataStore.saveSession(completedSession);
            setSession(completedSession);
          }
          return 0;
        }
        
        // Next interval
        setCurrentIntervalIndex(nextIdx);
        setLastTransitionAt(Date.now());
        const next = workout.intervals[nextIdx];
        
        // Play appropriate sound
        if (next.type === 'work' || next.type === 'warmup') {
          notify('work', { sound: soundEnabled, haptic: hapticEnabled });
        } else {
          notify('rest', { sound: soundEnabled, haptic: hapticEnabled });
        }
        
        return 0;
      }
      
      return newTime;
    });
  }, [workout, currentInterval, currentIntervalIndex, soundEnabled, hapticEnabled, session, elapsedTime]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, tick]);

  // Actions
  const setWorkout = useCallback((newWorkout: Workout) => {
    setWorkoutState(newWorkout);
    setElapsedTime(0);
    setIntervalElapsedTime(0);
    setCurrentIntervalIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setSession(null);
  }, []);

  const startWorkout = useCallback(() => {
    if (!workout) return;
    
    audioManager.init(); // Ensure audio is ready
    
    const newSession: WorkoutSession = {
      id: generateId(),
      workoutId: workout.id,
      workout,
      startedAt: new Date(),
      currentIntervalIndex: 0,
      elapsedTime: 0,
      intervalElapsedTime: 0,
      status: 'running',
      caloriesBurned: 0,
    };
    
    setSession(newSession);
    setElapsedTime(0);
    setIntervalElapsedTime(0);
    setCurrentIntervalIndex(0);
    setIsRunning(true);
    setIsPaused(false);
    
    // Play start sound
    notify('work', { sound: soundEnabled, haptic: hapticEnabled });
  }, [workout, soundEnabled, hapticEnabled]);

  const pauseWorkout = useCallback(() => {
    setIsPaused(true);
    if (session) {
      setSession({ ...session, status: 'paused' });
    }
  }, [session]);

  const resumeWorkout = useCallback(() => {
    setIsPaused(false);
    if (session) {
      setSession({ ...session, status: 'running' });
    }
  }, [session]);

  const resetWorkout = useCallback(() => {
    setElapsedTime(0);
    setIntervalElapsedTime(0);
    setCurrentIntervalIndex(0);
    setIsPaused(false);
    if (session) {
      setSession({ ...session, elapsedTime: 0, intervalElapsedTime: 0, currentIntervalIndex: 0 });
    }
  }, [session]);

  const endWorkout = useCallback(() => {
    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setWorkoutState(null);
    setElapsedTime(0);
    setIntervalElapsedTime(0);
    setCurrentIntervalIndex(0);
    
    if (session) {
      const endedSession: WorkoutSession = {
        ...session,
        completedAt: new Date(),
        status: 'completed',
        elapsedTime,
      };
      dataStore.saveSession(endedSession);
      setSession(null);
    }
  }, [session, elapsedTime]);

  const skipInterval = useCallback(() => {
    if (!workout) return;
    
    const nextIdx = currentIntervalIndex + 1;
    if (nextIdx >= workout.intervals.length) {
      endWorkout();
      return;
    }
    
    setCurrentIntervalIndex(nextIdx);
    setIntervalElapsedTime(0);
    setLastTransitionAt(Date.now());
    
    const next = workout.intervals[nextIdx];
    if (next.type === 'work' || next.type === 'warmup') {
      notify('work', { sound: soundEnabled, haptic: hapticEnabled });
    } else {
      notify('rest', { sound: soundEnabled, haptic: hapticEnabled });
    }
  }, [workout, currentIntervalIndex, endWorkout, soundEnabled, hapticEnabled]);

  const value: WorkoutContextType = {
    workout,
    session,
    currentInterval,
    nextInterval,
    isRunning,
    isPaused,
    elapsedTime,
    intervalElapsedTime,
    intervalRemainingTime,
    progress,
    intervalProgress,
    soundEnabled,
    hapticEnabled,
    lastTransitionAt,
    setWorkout,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    resetWorkout,
    endWorkout,
    skipInterval,
    setSoundEnabled,
    setHapticEnabled,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
