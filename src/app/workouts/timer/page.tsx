'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useAuth } from '@/contexts/AuthContext';
import WorkoutIntervalTimerView from '@/components/WorkoutIntervalTimerView';

export default function TimerPage() {
  const router = useRouter();
  const { settings } = useAuth();
  const {
    workout,
    currentInterval,
    nextInterval,
    isRunning,
    isPaused,
    progress,
    intervalProgress,
    intervalRemainingTime,
    elapsedTime,
    pauseWorkout,
    resumeWorkout,
    resetWorkout,
    endWorkout,
    skipInterval,
    setSoundEnabled,
    setHapticEnabled,
    soundEnabled,
    hapticEnabled,
    startWorkout,
  } = useWorkout();

  // Sync settings
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled ?? true);
    setHapticEnabled(settings.hapticEnabled ?? true);
  }, [settings.soundEnabled, settings.hapticEnabled, setSoundEnabled, setHapticEnabled]);

  // Keep screen awake if enabled
  useEffect(() => {
    if (settings.keepScreenOn && isRunning && 'wakeLock' in navigator) {
      let wakeLock: WakeLockSentinel | null = null;
      
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      };
      
      requestWakeLock();
      
      return () => {
        wakeLock?.release();
      };
    }
  }, [settings.screenAlwaysOn, isRunning]);

  // Redirect if no workout
  useEffect(() => {
    if (!workout) {
      router.push('/workouts');
    }
  }, [workout, router]);

  // Auto-start workout
  useEffect(() => {
    if (workout && !isRunning && !isPaused) {
      startWorkout();
    }
  }, [workout, isRunning, isPaused, startWorkout]);

  if (!workout || !currentInterval) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant">Loading workout...</div>
      </div>
    );
  }

  const handleEnd = () => {
    endWorkout();
    router.push('/workouts');
  };

  return (
    <WorkoutIntervalTimerView
      workoutTotalDuration={workout.totalDuration}
      elapsedTime={elapsedTime}
      progress={progress}
      intervalRemainingTime={intervalRemainingTime}
      currentInterval={currentInterval}
      nextInterval={nextInterval}
      isPaused={isPaused}
      onReset={resetWorkout}
      onPauseResume={isPaused ? resumeWorkout : pauseWorkout}
      onEnd={handleEnd}
      onSkip={skipInterval}
    />
  );
}
