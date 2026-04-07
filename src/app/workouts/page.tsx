'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useAuth } from '@/contexts/AuthContext';
import { presets } from '@/lib/ai';
import { WorkoutInterval, WorkoutPreset } from '@/types';
import { generateId } from '@/lib/db';
import PresetsModal from '@/components/PresetsModal';

type IntervalMode = 'simple' | 'advanced';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function WorkoutsPage() {
  const router = useRouter();
  const { workout, setWorkout, startWorkout } = useWorkout();
  const { workoutPresets, saveWorkoutPreset } = useAuth();
  
  const [workoutName, setWorkoutName] = useState(workout?.name || '');
  const [totalMinutes, setTotalMinutes] = useState(workout?.totalDuration ? Math.floor(workout.totalDuration / 60) : 30);
  const [intervals, setIntervals] = useState<WorkoutInterval[]>(workout?.intervals || []);
  
  // Interval mode
  const [intervalMode, setIntervalMode] = useState<IntervalMode>('simple');
  
  // Simple interval settings
  const [simpleIntervalMinutes, setSimpleIntervalMinutes] = useState(5);
  const [simpleIntervalSeconds, setSimpleIntervalSeconds] = useState(0);
  
  // Save preset modal
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  const applyWorkoutToBuilder = useCallback((nextWorkout: NonNullable<typeof workout>) => {
    setWorkoutName(nextWorkout.name);
    setTotalMinutes(Math.max(1, Math.ceil(nextWorkout.totalDuration / 60)));
    setIntervals(nextWorkout.intervals);
    setIntervalMode('advanced');
  }, []);

  // Keep builder UI in sync when workout is generated outside this page (e.g., chatbot).
  useEffect(() => {
    if (!workout || workout.intervals.length === 0) return;
    applyWorkoutToBuilder(workout);
  }, [workout, applyWorkoutToBuilder]);

  const handleAddInterval = (type: 'work' | 'rest') => {
    const newInterval: WorkoutInterval = {
      id: generateId(),
      type,
      duration: type === 'work' ? 60 : 30,
      name: type === 'work' ? 'Workout Phase' : 'Rest Phase',
      description: type === 'work' ? 'High intensity output' : 'Active recovery',
    };
    setIntervals([...intervals, newInterval]);
  };

  const handleRemoveInterval = (id: string) => {
    setIntervals(intervals.filter(i => i.id !== id));
  };

  const handleUpdateInterval = (id: string, updates: Partial<WorkoutInterval>) => {
    setIntervals(intervals.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleStartWorkout = () => {
    let finalIntervals: WorkoutInterval[] = [];
    let totalSeconds = 0;
    
    if (intervalMode === 'simple') {
      // Generate simple repeating intervals
      const intervalDuration = simpleIntervalMinutes * 60 + simpleIntervalSeconds;
      if (intervalDuration <= 0) return;
      
      totalSeconds = totalMinutes * 60;
      const numIntervals = Math.floor(totalSeconds / intervalDuration);
      const remainder = totalSeconds % intervalDuration;
      
      for (let i = 0; i < numIntervals; i++) {
        finalIntervals.push({
          id: generateId(),
          type: 'work',
          duration: intervalDuration,
          name: `Interval ${i + 1}`,
          description: `${simpleIntervalMinutes}:${simpleIntervalSeconds.toString().padStart(2, '0')} block`,
        });
      }
      
      if (remainder > 0) {
        finalIntervals.push({
          id: generateId(),
          type: 'work',
          duration: remainder,
          name: `Final Interval`,
          description: `${formatTime(remainder)} remaining`,
        });
      }
    } else {
      if (intervals.length === 0) return;
      finalIntervals = intervals;
      totalSeconds = intervals.reduce((sum, i) => sum + i.duration, 0);
    }
    
    const workSeconds = finalIntervals.filter(i => i.type === 'work').reduce((sum, i) => sum + i.duration, 0);
    const intensity = Math.round((workSeconds / totalSeconds) * 100);
    
    const newWorkout = {
      id: generateId(),
      name: workoutName || `Custom Workout`,
      totalDuration: totalSeconds,
      intervals: finalIntervals,
      intensity,
      estimatedCalories: Math.round((totalSeconds / 60) * (8 + (intensity / 100) * 7)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWorkout(newWorkout);
    startWorkout();
    router.push('/workouts/timer');
  };

  const handlePreset = (presetFn: () => ReturnType<typeof presets.quickHIIT>) => {
    const presetWorkout = presetFn();
    setWorkout(presetWorkout);
    setWorkoutName(presetWorkout.name);
    setIntervals(presetWorkout.intervals);
    setIntervalMode('advanced');
  };

  const handleLoadSavedPreset = (preset: WorkoutPreset) => {
    setWorkoutName(preset.name);
    setTotalMinutes(preset.duration);
    setIntervals(preset.intervals);
    setIntervalMode('advanced');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const presetId = new URLSearchParams(window.location.search).get('preset');
    if (!presetId || !workoutPresets.length) return;
    const preset = workoutPresets.find((p) => p.id === presetId);
    if (!preset) return;
    handleLoadSavedPreset(preset);
  }, [workoutPresets]);

  const handleSaveAsPreset = async () => {
    if (!presetName.trim() || isSavingPreset) return;
    setPresetError(null);
    setIsSavingPreset(true);
    
    const currentIntervals = intervalMode === 'simple' 
      ? generateSimpleIntervals()
      : intervals;
    
    // Calculate actual duration from intervals
    const actualDurationSeconds = currentIntervals.reduce((sum, i) => sum + i.duration, 0);
    const actualDurationMinutes = Math.ceil(actualDurationSeconds / 60);
    
    try {
      // Add timeout wrapper to prevent infinite hangs
      const savePromise = saveWorkoutPreset({
        ...(editingPresetId ? { id: editingPresetId } : {}),
        name: presetName,
        description: presetDescription || undefined,
        duration: actualDurationMinutes,
        intervals: currentIntervals,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timed out after 15 seconds')), 15000)
      );
      
      await Promise.race([savePromise, timeoutPromise]);
      
      // Successfully saved - close modal and reset state
      setShowSavePreset(false);
      setEditingPresetId(null);
      setPresetName('');
      setPresetDescription('');
      setPresetError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPresetError(`Save failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsSavingPreset(false);
    }
  };

  const generateSimpleIntervals = (): WorkoutInterval[] => {
    const intervalDuration = simpleIntervalMinutes * 60 + simpleIntervalSeconds;
    if (intervalDuration <= 0) return [];
    
    const totalSecs = totalMinutes * 60;
    const numIntervals = Math.floor(totalSecs / intervalDuration);
    const remainder = totalSecs % intervalDuration;
    const result: WorkoutInterval[] = [];
    
    for (let i = 0; i < numIntervals; i++) {
      result.push({
        id: generateId(),
        type: 'work',
        duration: intervalDuration,
        name: `Interval ${i + 1}`,
        description: `${simpleIntervalMinutes}:${simpleIntervalSeconds.toString().padStart(2, '0')} block`,
      });
    }
    
    if (remainder > 0) {
      result.push({
        id: generateId(),
        type: 'work',
        duration: remainder,
        name: `Final Interval`,
        description: `${formatTime(remainder)} remaining`,
      });
    }
    
    return result;
  };

  // Calculate stats based on mode
  const simpleIntervalTotal = simpleIntervalMinutes * 60 + simpleIntervalSeconds;
  const totalSeconds = intervalMode === 'simple' 
    ? totalMinutes * 60 
    : intervals.reduce((sum, i) => sum + i.duration, 0);
  const numSimpleIntervals = simpleIntervalTotal > 0 ? Math.ceil(totalSeconds / simpleIntervalTotal) : 0;
  const workSeconds = intervalMode === 'simple'
    ? totalMinutes * 60
    : intervals.filter(i => i.type === 'work' || i.type === 'warmup').reduce((sum, i) => sum + i.duration, 0);
  const restSeconds = intervalMode === 'simple'
    ? 0
    : intervals.filter(i => i.type === 'rest').reduce((sum, i) => sum + i.duration, 0);
  const workoutBlockCount = intervalMode === 'simple'
    ? numSimpleIntervals
    : intervals.filter(i => i.type === 'work' || i.type === 'warmup').length;
  const restBlockCount = intervalMode === 'simple'
    ? 0
    : intervals.filter(i => i.type === 'rest').length;
  const intensity = totalSeconds > 0 ? Math.round((workSeconds / totalSeconds) * 100) : 0;

  // Duration mismatch detection (only for advanced mode)
  const targetDurationSeconds = totalMinutes * 60;
  const actualDurationSeconds = intervals.reduce((sum, i) => sum + i.duration, 0);
  const durationDiff = actualDurationSeconds - targetDurationSeconds;
  const hasDurationMismatch = intervalMode === 'advanced' && intervals.length > 0 && Math.abs(durationDiff) > 0;

  return (
    <div className="pb-24 md:pb-32 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
          Workout Builder
        </h1>
        <p className="text-on-surface-variant font-light tracking-wide">
          Create your custom interval workout with precision timing.
        </p>
      </header>

      {/* Quick Presets */}
      <section className="mb-8 md:mb-10 p-4 md:p-6 rounded-lg bg-surface-container-high border border-secondary/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary text-sm">bolt</span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
            Quick Presets
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tabata', fn: presets.tabata },
            { label: 'Quick HIIT', fn: presets.quickHIIT },
            { label: 'Endurance', fn: presets.endurance30 },
            { label: 'Fat Burn', fn: presets.fatBurn },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.fn)}
              className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs hover:bg-surface-container-highest transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Setup Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Basic Info */}
          <section className="bg-surface-container-low p-5 md:p-8 rounded-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-secondary text-xs uppercase tracking-widest font-bold mb-3">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Morning HIIT"
                  className="ui-input w-full rounded-full px-6 py-4"
                />
              </div>
              
              {/* Duration Input */}
              <div>
                <label className="block text-secondary text-xs uppercase tracking-widest font-bold mb-3">
                  Total Duration
                </label>
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-4 py-2">
                    <button
                      onClick={() => setTotalMinutes(Math.max(1, totalMinutes - 1))}
                      className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-2xl font-black w-16 text-center">{totalMinutes}</span>
                    <button
                      onClick={() => setTotalMinutes(totalMinutes + 1)}
                      className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                    <span className="text-on-surface-variant font-bold ml-1">MIN</span>
                  </div>
                </div>
                {/* Duration presets */}
                <div className="flex gap-2 mt-3">
                  {DURATION_PRESETS.map(min => (
                    <button
                      key={min}
                      onClick={() => setTotalMinutes(min)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        totalMinutes === min 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Interval Mode Toggle */}
          <div className="flex p-1 bg-surface-container-low rounded-full">
            <button
              onClick={() => setIntervalMode('simple')}
              className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                intervalMode === 'simple' 
                  ? 'bg-primary text-on-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">repeat</span>
              Simple Interval
            </button>
            <button
              onClick={() => setIntervalMode('advanced')}
              className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                intervalMode === 'advanced' 
                  ? 'bg-primary text-on-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">tune</span>
              Custom Intervals
            </button>
          </div>

          {intervalMode === 'simple' ? (
            /* Simple Interval Mode */
            <section className="bg-surface-container-low p-5 md:p-8 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Repeat Every</h3>
                <p className="text-on-surface-variant text-sm">
                  Set one interval that repeats throughout your workout. 
                  You&apos;ll hear a sound every time this interval completes.
                </p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-8 max-w-md mx-auto">
                {/* Minutes */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 bg-surface-container-high rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => setSimpleIntervalMinutes(Math.max(0, simpleIntervalMinutes - 1))}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">remove</span>
                    </button>
                    <span className="text-3xl sm:text-5xl font-black w-12 sm:w-20 text-center">{simpleIntervalMinutes}</span>
                    <button
                      onClick={() => setSimpleIntervalMinutes(simpleIntervalMinutes + 1)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">add</span>
                    </button>
                  </div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mt-2">Minutes</p>
                </div>
                
                <span className="text-2xl sm:text-4xl font-black text-primary">:</span>
                
                {/* Seconds */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 bg-surface-container-high rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => setSimpleIntervalSeconds(Math.max(0, simpleIntervalSeconds - 5))}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">remove</span>
                    </button>
                    <span className="text-3xl sm:text-5xl font-black w-12 sm:w-20 text-center">{simpleIntervalSeconds.toString().padStart(2, '0')}</span>
                    <button
                      onClick={() => setSimpleIntervalSeconds(Math.min(55, simpleIntervalSeconds + 5))}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">add</span>
                    </button>
                  </div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mt-2">Seconds</p>
                </div>
              </div>

              {/* Quick interval presets */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  { label: '30 sec', m: 0, s: 30 },
                  { label: '1 min', m: 1, s: 0 },
                  { label: '2 min', m: 2, s: 0 },
                  { label: '5 min', m: 5, s: 0 },
                  { label: '10 min', m: 10, s: 0 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSimpleIntervalMinutes(preset.m);
                      setSimpleIntervalSeconds(preset.s);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      simpleIntervalMinutes === preset.m && simpleIntervalSeconds === preset.s
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {simpleIntervalTotal > 0 && (
                <div className="mt-8 p-4 bg-surface-container rounded-lg">
                  <p className="text-center text-on-surface-variant text-sm">
                    Your <span className="text-primary font-bold">{totalMinutes} minute</span> workout will have{' '}
                    <span className="text-secondary font-bold">{numSimpleIntervals} intervals</span> of{' '}
                    <span className="text-primary font-bold">{simpleIntervalMinutes}:{simpleIntervalSeconds.toString().padStart(2, '0')}</span> each.
                    <br />
                    <span className="text-on-surface-variant/60">A sound will play at each interval.</span>
                  </p>
                </div>
              )}
            </section>
          ) : (
            /* Advanced Interval Mode */
            <section className="space-y-4">
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-xl font-bold tracking-tight">Interval Sequence</h2>
                <span className="text-primary text-xs font-bold tracking-widest uppercase">
                  {intervals.length} Blocks
                </span>
              </div>
              
              {/* Interval List - Collapsible/Scrollable */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {intervals.map((interval, index) => (
                  <div
                    key={interval.id}
                    className="flex items-center gap-3 p-4 bg-surface-container rounded-lg group hover:bg-surface-bright transition-colors"
                  >
                    <span className="text-on-surface-variant text-sm font-bold w-6">{index + 1}</span>
                    <div
                      className={`w-1 h-8 rounded-full ${
                        interval.type === 'work' || interval.type === 'warmup'
                          ? 'bg-primary'
                          : 'bg-secondary'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={interval.name}
                        onChange={(e) => handleUpdateInterval(interval.id, { name: e.target.value })}
                        className="bg-transparent text-on-surface font-semibold w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateInterval(interval.id, { duration: Math.max(5, interval.duration - 5) })}
                        className="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-14 text-center">{formatTime(interval.duration)}</span>
                      <button
                        onClick={() => handleUpdateInterval(interval.id, { duration: interval.duration + 5 })}
                        className="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveInterval(interval.id)}
                      className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              
              {intervals.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">timer</span>
                  <p>No intervals yet. Add workout or rest blocks below.</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAddInterval('work')}
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-full border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                  <span className="font-bold">Add Workout</span>
                </button>
                <button
                  onClick={() => handleAddInterval('rest')}
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-full border-2 border-dashed border-secondary/30 text-secondary hover:border-secondary hover:bg-secondary/5 transition-all group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                  <span className="font-bold">Add Rest</span>
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Visualization */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-low flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #46484c 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Progress Ring */}
              <div className="relative w-48 h-48 rounded-full border-8 border-surface-container-highest flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-primary"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="45"
                    stroke="currentColor"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 * (1 - intensity / 100)}
                    strokeWidth="8"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-3xl font-black text-on-surface">{intensity}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Intensity
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container p-6 rounded-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">
                Workout Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Target Duration</span>
                  <span className="text-on-surface-variant">{totalMinutes} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Actual Time</span>
                  <span className={`font-bold ${hasDurationMismatch ? (durationDiff > 0 ? 'text-error' : 'text-warning') : 'text-secondary'}`}>
                    {formatTime(totalSeconds)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Workout Blocks</span>
                  <span className="text-primary font-bold">{workoutBlockCount} ({formatDurationWords(workSeconds)})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Rest Blocks</span>
                  <span className="text-secondary font-bold">{restBlockCount} ({formatDurationWords(restSeconds)})</span>
                </div>
              </div>
              
              {/* Duration Mismatch Warning */}
              {hasDurationMismatch && (
                <div className={`mt-4 p-3 rounded-lg ${durationDiff > 0 ? 'bg-error/10 border border-error/30' : 'bg-warning/10 border border-warning/30'}`}>
                  <div className="flex items-start gap-2">
                    <span className={`material-symbols-outlined text-sm ${durationDiff > 0 ? 'text-error' : 'text-warning'}`}>
                      {durationDiff > 0 ? 'schedule' : 'hourglass_empty'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${durationDiff > 0 ? 'text-error' : 'text-warning'}`}>
                        {durationDiff > 0 
                          ? `${formatTime(Math.abs(durationDiff))} over target`
                          : `${formatTime(Math.abs(durationDiff))} under target`
                        }
                      </p>
                      <button
                        onClick={() => setTotalMinutes(Math.ceil(actualDurationSeconds / 60))}
                        className={`mt-2 text-xs font-bold underline ${durationDiff > 0 ? 'text-error hover:text-error/80' : 'text-warning hover:text-warning/80'}`}
                      >
                        Update target to {Math.ceil(actualDurationSeconds / 60)} min
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Save as Preset Button */}
             <button
               onClick={() => {
                  setEditingPresetId(null);
                  setPresetName(workoutName || '');
                  setPresetError(null);
                  setShowSavePreset(true);
                }}
              className="w-full py-3 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">bookmark_add</span>
              Save as Preset
            </button>
            
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="w-full mt-3 py-2.5 rounded-full border border-secondary/40 text-secondary text-xs font-bold tracking-widest uppercase hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">bookmarks</span>
              View All Presets
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md p-6 z-40 border-t border-surface-container">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleStartWorkout}
            disabled={intervalMode === 'advanced' ? intervals.length === 0 : simpleIntervalTotal <= 0}
            className="w-full kinetic-gradient text-on-primary font-bold py-5 rounded-full shadow-[0_0_30px_rgba(255,138,169,0.3)] hover:shadow-[0_0_40px_rgba(255,138,169,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            <span className="tracking-widest uppercase">Start Workout</span>
          </button>
        </div>
      </div>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low rounded-lg p-6 max-w-md w-full border border-outline-variant/30">
            <h3 className="text-xl font-bold text-on-surface mb-4">
              {editingPresetId ? 'Edit Preset' : 'Save as Preset'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-on-surface-variant text-sm mb-2">Preset Name</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., My HIIT Routine"
                  className="ui-input w-full rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant text-sm mb-2">Description (optional)</label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Quick notes about this workout..."
                  rows={2}
                  className="ui-input w-full rounded-lg px-4 py-3 resize-none"
                />
              </div>
              <div className="text-on-surface-variant text-sm">
                <span className="font-medium">Duration:</span> {Math.ceil(totalSeconds / 60)} minutes<br />
                <span className="font-medium">Intervals:</span> {intervalMode === 'simple' ? numSimpleIntervals : intervals.length}
              </div>
              {presetError && (
                <div className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
                  {presetError}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  console.log('[PRESET-MODAL] Cancel clicked, forcing close');
                  setShowSavePreset(false);
                  setEditingPresetId(null);
                  setPresetError(null);
                  setIsSavingPreset(false); // Force reset saving state
                }}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface-variant font-bold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsPreset}
                disabled={!presetName.trim() || isSavingPreset}
                className="flex-1 py-3 rounded-full bg-primary text-on-primary font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingPreset ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  editingPresetId ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <PresetsModal isOpen={isPresetsModalOpen} onClose={() => setIsPresetsModalOpen(false)} />
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDurationWords(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}min ${secs}sec`;
}
