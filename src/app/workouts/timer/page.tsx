'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useAuth } from '@/contexts/AuthContext';
import WorkoutIntervalTimerView from '@/components/WorkoutIntervalTimerView';
import { haptics } from '@/lib/audio';

export default function TimerPage() {
  const router = useRouter();
  const hasAutoStartedRef = useRef(false);
  const hasLoggedCompletionRef = useRef(false);
  const { settings, stats, updateStats } = useAuth();
  const {
    workout,
    currentInterval,
    nextInterval,
    isRunning,
    isPaused,
    progress,
    intervalRemainingTime,
    elapsedTime,
    pauseWorkout,
    resumeWorkout,
    resetWorkout,
    endWorkout,
    skipInterval,
    setSoundEnabled,
    setHapticEnabled,
    lastTransitionAt,
    startWorkout,
  } = useWorkout();

  // Sync settings
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled ?? true);
    setHapticEnabled(settings.hapticEnabled ?? true);
  }, [settings.soundEnabled, settings.hapticEnabled, setSoundEnabled, setHapticEnabled]);

  useEffect(() => {
    if (!settings.hapticEnabled || !lastTransitionAt) return;
    haptics.intervalChange();
  }, [settings.hapticEnabled, lastTransitionAt]);

  // Keep screen awake if enabled
  useEffect(() => {
    if (!settings.keepScreenOn || !isRunning || !('wakeLock' in navigator)) return;

    let wakeLock: WakeLockSentinel | null = null;
    let released = false;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !released) {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void wakeLock?.release();
    };
  }, [settings.keepScreenOn, isRunning]);

  // Redirect if no workout
  useEffect(() => {
    if (!workout) {
      router.push('/workouts');
    }
  }, [workout, router]);

  useEffect(() => {
    hasAutoStartedRef.current = false;
    hasLoggedCompletionRef.current = false;
  }, [workout?.id]);

  // Auto-start workout
  useEffect(() => {
    if (!workout || hasAutoStartedRef.current) return;
    if (isRunning || isPaused) return;
    if (elapsedTime > 0 || progress > 0) return;
    hasAutoStartedRef.current = true;
    if (!isRunning && !isPaused) {
      startWorkout();
    }
  }, [workout, isRunning, isPaused, elapsedTime, progress, startWorkout]);

  // Auto-return to builder when workout completes naturally + update stats.
  useEffect(() => {
    if (!workout) return;
    if (isRunning) return;
    if (isPaused) return;
    if (!currentInterval) return;
    if (progress < 100) return;
    if (hasLoggedCompletionRef.current) return;
    
    hasLoggedCompletionRef.current = true;
    console.info('Workout finished. Logging completion and returning to workout builder.');
    
    // Update user stats
    const workoutMinutes = Math.round(elapsedTime / 60);
    const estimatedCalories = Math.round((elapsedTime / 60) * 8); // rough estimate
    
    void updateStats({
      workoutsCompleted: stats.workoutsCompleted + 1,
      lifetimeTotalTime: stats.lifetimeTotalTime + workoutMinutes,
      totalCaloriesBurnt: stats.totalCaloriesBurnt + estimatedCalories,
    });
    
    router.push('/workouts');
  }, [workout, isRunning, isPaused, currentInterval, progress, router, elapsedTime, stats, updateStats]);

  if (!workout || !currentInterval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-on-surface-variant">Loading workout...</div>
      </div>
    );
  }

  const handleEnd = () => {
    // Update stats for manually ended workout (partial completion)
    if (elapsedTime > 0) {
      const workoutMinutes = Math.round(elapsedTime / 60);
      const estimatedCalories = Math.round((elapsedTime / 60) * 8);
      
      void updateStats({
        workoutsCompleted: stats.workoutsCompleted + 1,
        lifetimeTotalTime: stats.lifetimeTotalTime + workoutMinutes,
        totalCaloriesBurnt: stats.totalCaloriesBurnt + estimatedCalories,
      });
    }
    
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
      lastTransitionAt={lastTransitionAt}
      topPaddingClass="pt-6 md:pt-6"
      onReset={resetWorkout}
      onPauseResume={isPaused ? resumeWorkout : pauseWorkout}
      onEnd={handleEnd}
      onSkip={skipInterval}
    />
  );
}
