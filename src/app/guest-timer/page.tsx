'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { audioManager, haptics } from '@/lib/audio';
import WorkoutIntervalTimerView from '@/components/WorkoutIntervalTimerView';
import { WorkoutInterval } from '@/types';
import { generateId } from '@/lib/db';
import { generateWorkoutFromPrompt, presets } from '@/lib/ai';

type GuestMode = 'normal' | 'interval';
type TimerMode = 'setup' | 'countdown' | 'stopwatch';
type IntervalMode = 'simple' | 'advanced';

interface Interval extends WorkoutInterval {}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function GuestTimerPage() {
  const router = useRouter();
  const [guestMode, setGuestMode] = useState<GuestMode>('normal');

  // Normal timer state
  const [mode, setMode] = useState<TimerMode>('setup');
  const [timerType, setTimerType] = useState<'countdown' | 'stopwatch'>('countdown');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const normalIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interval builder/timer state (1:1 with workouts builder)
  const [workoutName, setWorkoutName] = useState('Guest Workout');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [intervalMode, setIntervalMode] = useState<IntervalMode>('simple');
  const [simpleIntervalMinutes, setSimpleIntervalMinutes] = useState(5);
  const [simpleIntervalSeconds, setSimpleIntervalSeconds] = useState(0);

  // Running interval timer state
  const [isSetup, setIsSetup] = useState(true);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [intervalElapsed, setIntervalElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioManager.init();
  }, []);

  const totalSetTime = hours * 3600 + minutes * 60 + seconds;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Normal timer handlers
  const startTimer = useCallback(() => {
    if (timerType === 'countdown') {
      if (totalSetTime <= 0) return;
      setTimeRemaining(totalSetTime);
      setMode('countdown');
    } else {
      setElapsed(0);
      setMode('stopwatch');
    }
    setIsRunning(true);
    audioManager.playSound('work');
    haptics.doubleTap();
  }, [timerType, totalSetTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (normalIntervalRef.current) {
      clearInterval(normalIntervalRef.current);
      normalIntervalRef.current = null;
    }
  }, []);

  const resumeTimer = useCallback(() => setIsRunning(true), []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setMode('setup');
    setTimeRemaining(0);
    setElapsed(0);
    if (normalIntervalRef.current) {
      clearInterval(normalIntervalRef.current);
      normalIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning || guestMode !== 'normal') return;
    normalIntervalRef.current = setInterval(() => {
      if (timerType === 'countdown' || mode === 'countdown') {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            audioManager.playSound('complete');
            haptics.success();
            return 0;
          }
          if (prev <= 4 && prev > 1) audioManager.playSound('warning');
          return prev - 1;
        });
      } else {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => {
      if (normalIntervalRef.current) clearInterval(normalIntervalRef.current);
    };
  }, [isRunning, timerType, mode, guestMode]);

  const normalProgress = timerType === 'countdown' && totalSetTime > 0 ? ((totalSetTime - timeRemaining) / totalSetTime) * 100 : 0;
  const normalCircumference = 2 * Math.PI * 140;
  const normalStrokeDashoffset = normalCircumference - (normalProgress / 100) * normalCircumference;

  // Builder handlers (mirrors workouts page behavior)
  const handleAddInterval = (type: 'work' | 'rest') => {
    const newInterval: Interval = {
      id: generateId(),
      type,
      duration: type === 'work' ? 60 : 30,
      name: type === 'work' ? 'Workout Phase' : 'Rest Phase',
      description: type === 'work' ? 'High intensity output' : 'Active recovery',
    };
    setIntervals([...intervals, newInterval]);
  };

  const handleRemoveInterval = (id: string) => {
    setIntervals(intervals.filter((i) => i.id !== id));
  };

  const handleUpdateInterval = (id: string, updates: Partial<WorkoutInterval>) => {
    setIntervals(intervals.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateWorkoutFromPrompt({
        prompt: aiPrompt,
        totalDuration: totalMinutes,
      });
      setWorkoutName(result.workout.name);
      setIntervals(result.workout.intervals as Interval[]);
      setIntervalMode('advanced');
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreset = (presetFn: () => ReturnType<typeof presets.quickHIIT>) => {
    const presetWorkout = presetFn();
    setWorkoutName(presetWorkout.name);
    setIntervals(presetWorkout.intervals as Interval[]);
    setIntervalMode('advanced');
  };

  const generateSimpleIntervals = (): Interval[] => {
    const intervalDuration = simpleIntervalMinutes * 60 + simpleIntervalSeconds;
    if (intervalDuration <= 0) return [];

    const totalSecs = totalMinutes * 60;
    const numIntervals = Math.floor(totalSecs / intervalDuration);
    const remainder = totalSecs % intervalDuration;
    const result: Interval[] = [];

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

  const handleStartIntervalWorkout = () => {
    let finalIntervals: Interval[] = [];
    if (intervalMode === 'simple') {
      finalIntervals = generateSimpleIntervals();
      if (finalIntervals.length === 0) return;
    } else {
      if (intervals.length === 0) return;
      finalIntervals = intervals;
    }
    setIntervals(finalIntervals);
    setCurrentIntervalIndex(0);
    setIntervalElapsed(0);
    setTotalElapsed(0);
    setIsSetup(false);
    setIsIntervalRunning(true);
    setIsPaused(false);
  };

  useEffect(() => {
    if (guestMode !== 'interval') return;
    if (isIntervalRunning && !isPaused && intervals.length > 0) {
      intervalTimerRef.current = setInterval(() => {
        setIntervalElapsed((prev) => {
          const newElapsed = prev + 1;
          const current = intervals[currentIntervalIndex];
          if (!current) return prev;
          if (newElapsed >= current.duration) {
            audioManager.playSound('work');
            if (currentIntervalIndex < intervals.length - 1) {
              setCurrentIntervalIndex((i) => i + 1);
              setTotalElapsed((t) => t + current.duration);
              return 0;
            }
            audioManager.playSound('complete');
            setIsIntervalRunning(false);
            setTotalElapsed((t) => t + current.duration);
            return current.duration;
          }
          return newElapsed;
        });
      }, 1000);
    } else if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    return () => {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [guestMode, isIntervalRunning, isPaused, intervals, currentIntervalIndex]);

  const resetInterval = () => {
    setIsIntervalRunning(false);
    setIsPaused(false);
    setCurrentIntervalIndex(0);
    setIntervalElapsed(0);
    setTotalElapsed(0);
    setIsSetup(true);
  };

  const skipInterval = () => {
    if (currentIntervalIndex < intervals.length - 1) {
      const current = intervals[currentIntervalIndex];
      if (!current) return;
      setTotalElapsed((prev) => prev + current.duration);
      setCurrentIntervalIndex((i) => i + 1);
      setIntervalElapsed(0);
    } else {
      setIsIntervalRunning(false);
    }
  };

  const currentInterval = intervals[currentIntervalIndex];
  const intervalRemainingTime = currentInterval ? currentInterval.duration - intervalElapsed : 0;
  const workoutTotalDuration = intervals.reduce((sum, i) => sum + i.duration, 0);
  const intervalProgress = workoutTotalDuration > 0 ? ((totalElapsed + intervalElapsed) / workoutTotalDuration) * 100 : 0;
  const nextInterval = currentIntervalIndex < intervals.length - 1 ? intervals[currentIntervalIndex + 1] : null;

  const simpleIntervalTotal = simpleIntervalMinutes * 60 + simpleIntervalSeconds;
  const totalSeconds = intervalMode === 'simple' ? totalMinutes * 60 : intervals.reduce((sum, i) => sum + i.duration, 0);
  const workSeconds = intervalMode === 'simple'
    ? totalMinutes * 60
    : intervals.filter((i) => i.type === 'work' || i.type === 'warmup').reduce((sum, i) => sum + i.duration, 0);
  const intensity = totalSeconds > 0 ? Math.round((workSeconds / totalSeconds) * 100) : 0;
  const estimatedCalories = Math.round((totalSeconds / 60) * (8 + (intensity / 100) * 7));
  const numSimpleIntervals = simpleIntervalTotal > 0 ? Math.ceil(totalSeconds / simpleIntervalTotal) : 0;
  const targetDurationSeconds = totalMinutes * 60;
  const actualDurationSeconds = intervals.reduce((sum, i) => sum + i.duration, 0);
  const durationDiff = actualDurationSeconds - targetDurationSeconds;
  const hasDurationMismatch = intervalMode === 'advanced' && intervals.length > 0 && Math.abs(durationDiff) > 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </Link>
          <div className="inline-flex p-1 bg-surface-container-low rounded-full">
            <button
              className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${guestMode === 'normal' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => {
                setGuestMode('normal');
                resetInterval();
              }}
            >
              Normal Timer
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${guestMode === 'interval' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setGuestMode('interval')}
            >
              Interval Timer
            </button>
          </div>
          <button onClick={() => router.push('/auth/signin')} className="text-sm font-bold text-secondary hover:opacity-80">
            Sign In
          </button>
        </div>

        {guestMode === 'normal' && (
          <div className="max-w-3xl mx-auto">
            {mode === 'setup' ? (
              <>
                <header className="mb-8 text-center">
                  <p className="text-secondary font-label uppercase tracking-widest text-sm mb-2">Simple Timer</p>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter">SET TIME</h1>
                </header>
                <div className="flex justify-center mb-8">
                  <div className="flex p-1 bg-surface-container-low rounded-full">
                    <button className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${timerType === 'countdown' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTimerType('countdown')}>
                      <span className="material-symbols-outlined text-lg align-middle mr-2">timer</span>Countdown
                    </button>
                    <button className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${timerType === 'stopwatch' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setTimerType('stopwatch')}>
                      <span className="material-symbols-outlined text-lg align-middle mr-2">pace</span>Stopwatch
                    </button>
                  </div>
                </div>
                {timerType === 'countdown' ? (
                  <div className="flex justify-center items-center gap-4 mb-12">
                    <NumberInput value={hours} onChange={setHours} max={23} label="Hours" />
                    <span className="text-5xl font-black text-primary mt-6">:</span>
                    <NumberInput value={minutes} onChange={setMinutes} max={59} label="Minutes" />
                    <span className="text-5xl font-black text-primary mt-6">:</span>
                    <NumberInput value={seconds} onChange={setSeconds} max={59} label="Seconds" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center mb-12">
                    <div className="text-8xl font-black tracking-tighter text-on-surface-variant">00:00</div>
                    <p className="text-on-surface-variant text-sm mt-4">Tap start to begin counting</p>
                  </div>
                )}
                <div className="flex justify-center">
                  <button className="kinetic-gradient px-12 py-5 rounded-full font-black uppercase tracking-widest text-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50" onClick={startTimer} disabled={timerType === 'countdown' && totalSetTime <= 0}>
                    <span className="material-symbols-outlined text-2xl align-middle mr-2">play_arrow</span>Start
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-8">
                  <svg className="w-80 h-80 -rotate-90">
                    <circle cx="160" cy="160" r="140" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-highest" />
                    {timerType === 'countdown' && (
                      <circle cx="160" cy="160" r="140" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={normalCircumference} strokeDashoffset={normalStrokeDashoffset} className="text-primary transition-all duration-300" />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl md:text-7xl font-black tracking-tighter">{formatTime(timerType === 'countdown' ? timeRemaining : elapsed)}</span>
                    <span className="text-on-surface-variant text-sm uppercase tracking-widest mt-2">{timerType === 'countdown' ? 'Remaining' : 'Elapsed'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="w-16 h-16 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors" onClick={resetTimer}>
                    <span className="material-symbols-outlined text-2xl">stop</span>
                  </button>
                  <button className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${isRunning ? 'bg-secondary text-on-secondary' : 'kinetic-gradient'}`} onClick={isRunning ? pauseTimer : resumeTimer}>
                    <span className="material-symbols-outlined text-3xl">{isRunning ? 'pause' : 'play_arrow'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {guestMode === 'interval' && isSetup && (
          <>
            <header className="mb-12">
              <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2">Workout Builder</h1>
              <p className="text-on-surface-variant font-light tracking-wide">Create your custom interval workout with precision timing.</p>
            </header>

            <section className="mb-10 p-6 rounded-lg bg-surface-container-high border border-secondary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary">psychology</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">AI Protocol Engine</h3>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 max-w-md">
                  Describe your workout and let AI create the intervals for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                      placeholder="e.g., 60 min workout with 1 min work / 30 sec rest..."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full pl-6 pr-14 py-4 text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all placeholder:text-on-surface-variant/40 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-secondary text-on-secondary-fixed font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-sm whitespace-nowrap shadow-[0_0_20px_rgba(0,238,252,0.2)] disabled:opacity-50"
                  >
                    <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: 'Tabata', fn: presets.tabata },
                    { label: 'Quick HIIT', fn: presets.quickHIIT },
                    { label: 'Endurance', fn: presets.endurance30 },
                    { label: 'Fat Burn', fn: presets.fatBurn },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePreset(preset.fn)}
                      className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs hover:bg-surface-container-highest transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-8">
                <section className="bg-surface-container-low p-8 rounded-lg">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-secondary text-xs uppercase tracking-widest font-bold mb-3">Workout Name</label>
                      <input type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} placeholder="e.g., Morning HIIT" className="w-full bg-surface-container-high border-none rounded-full px-6 py-4 text-on-surface focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-on-surface-variant/30" />
                    </div>
                    <div>
                      <label className="block text-secondary text-xs uppercase tracking-widest font-bold mb-3">Total Duration</label>
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-4 py-2">
                          <button onClick={() => setTotalMinutes(Math.max(1, totalMinutes - 1))} className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
                          <span className="text-2xl font-black w-16 text-center">{totalMinutes}</span>
                          <button onClick={() => setTotalMinutes(totalMinutes + 1)} className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                          <span className="text-on-surface-variant font-bold ml-1">MIN</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {DURATION_PRESETS.map((min) => (
                          <button key={min} onClick={() => setTotalMinutes(min)} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${totalMinutes === min ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                            {min}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex p-1 bg-surface-container-low rounded-full">
                  <button onClick={() => setIntervalMode('simple')} className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${intervalMode === 'simple' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-lg">repeat</span>Simple Interval
                  </button>
                  <button onClick={() => setIntervalMode('advanced')} className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2 ${intervalMode === 'advanced' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-lg">tune</span>Custom Intervals
                  </button>
                </div>

                {intervalMode === 'simple' ? (
                  <section className="bg-surface-container-low p-8 rounded-lg">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Repeat Every</h3>
                      <p className="text-on-surface-variant text-sm">Set one interval that repeats throughout your workout. You&apos;ll hear a sound every time this interval completes.</p>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-8 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-surface-container-high rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                          <button onClick={() => setSimpleIntervalMinutes(Math.max(0, simpleIntervalMinutes - 1))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-base sm:text-xl">remove</span></button>
                          <span className="text-3xl sm:text-5xl font-black w-12 sm:w-20 text-center">{simpleIntervalMinutes}</span>
                          <button onClick={() => setSimpleIntervalMinutes(simpleIntervalMinutes + 1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-base sm:text-xl">add</span></button>
                        </div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mt-2">Minutes</p>
                      </div>
                      <span className="text-2xl sm:text-4xl font-black text-primary">:</span>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-surface-container-high rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                          <button onClick={() => setSimpleIntervalSeconds(Math.max(0, simpleIntervalSeconds - 5))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-base sm:text-xl">remove</span></button>
                          <span className="text-3xl sm:text-5xl font-black w-12 sm:w-20 text-center">{simpleIntervalSeconds.toString().padStart(2, '0')}</span>
                          <button onClick={() => setSimpleIntervalSeconds(Math.min(55, simpleIntervalSeconds + 5))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-base sm:text-xl">add</span></button>
                        </div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mt-2">Seconds</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {[{ label: '30 sec', m: 0, s: 30 }, { label: '1 min', m: 1, s: 0 }, { label: '2 min', m: 2, s: 0 }, { label: '5 min', m: 5, s: 0 }, { label: '10 min', m: 10, s: 0 }].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            setSimpleIntervalMinutes(preset.m);
                            setSimpleIntervalSeconds(preset.s);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${simpleIntervalMinutes === preset.m && simpleIntervalSeconds === preset.s ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

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
                  <section className="space-y-4">
                    <div className="flex justify-between items-end mb-4 px-2">
                      <h2 className="text-xl font-bold tracking-tight">Interval Sequence</h2>
                      <span className="text-primary text-xs font-bold tracking-widest uppercase">{intervals.length} Blocks</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                      {intervals.map((interval, index) => (
                        <div key={interval.id} className="flex items-center gap-3 p-4 bg-surface-container rounded-lg group hover:bg-surface-bright transition-colors">
                          <span className="text-on-surface-variant text-sm font-bold w-6">{index + 1}</span>
                          <div className={`w-1 h-8 rounded-full ${interval.type === 'work' || interval.type === 'warmup' ? 'bg-primary' : 'bg-secondary'}`} />
                          <div className="flex-1 min-w-0">
                            <input type="text" value={interval.name} onChange={(e) => handleUpdateInterval(interval.id, { name: e.target.value })} className="bg-transparent text-on-surface font-semibold w-full focus:outline-none" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleUpdateInterval(interval.id, { duration: Math.max(5, interval.duration - 15) })} className="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-xs">-</button>
                            <span className="text-sm font-bold w-14 text-center">{formatTime(interval.duration)}</span>
                            <button onClick={() => handleUpdateInterval(interval.id, { duration: interval.duration + 15 })} className="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-xs">+</button>
                          </div>
                          <button onClick={() => handleRemoveInterval(interval.id)} className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100">
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
                      <button onClick={() => handleAddInterval('work')} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-full border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                        <span className="font-bold">Add Workout</span>
                      </button>
                      <button onClick={() => handleAddInterval('rest')} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-full border-2 border-dashed border-secondary/30 text-secondary hover:border-secondary hover:bg-secondary/5 transition-all group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                        <span className="font-bold">Add Rest</span>
                      </button>
                    </div>
                  </section>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-28 space-y-6">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-low flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #46484c 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="relative w-48 h-48 rounded-full border-8 border-surface-container-highest flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-primary" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - intensity / 100)} strokeWidth="8" />
                      </svg>
                      <div className="text-center">
                        <div className="text-3xl font-black text-on-surface">{intensity}%</div>
                        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Intensity</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container p-6 rounded-lg">
                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Workout Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-on-surface-variant">Target Duration</span><span className="text-on-surface-variant">{totalMinutes} min</span></div>
                      <div className="flex justify-between items-center"><span className="text-on-surface-variant">Actual Time</span><span className={`font-bold ${hasDurationMismatch ? (durationDiff > 0 ? 'text-error' : 'text-warning') : 'text-secondary'}`}>{formatTime(totalSeconds)}</span></div>
                      <div className="flex justify-between items-center"><span className="text-on-surface-variant">Work Blocks</span><span className="text-primary font-bold">{intervalMode === 'simple' ? numSimpleIntervals : intervals.filter((i) => i.type === 'work').length}</span></div>
                      <div className="flex justify-between items-center"><span className="text-on-surface-variant">Rest Blocks</span><span className="text-secondary font-bold">{intervalMode === 'simple' ? 0 : intervals.filter((i) => i.type === 'rest').length}</span></div>
                      <div className="pt-4 mt-4 border-t border-outline-variant/20">
                        <div className="flex justify-between items-center mb-2"><span className="text-on-surface-variant text-sm">Est. Calories</span><span className="text-xl font-black text-primary">{estimatedCalories}</span></div>
                      </div>
                    </div>
                    <button
                      onClick={handleStartIntervalWorkout}
                      className="w-full mt-6 kinetic-gradient py-4 rounded-full font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,138,169,0.2)]"
                    >
                      Start Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {guestMode === 'interval' && !isSetup && currentInterval && (
          <WorkoutIntervalTimerView
            workoutTotalDuration={workoutTotalDuration}
            elapsedTime={totalElapsed + intervalElapsed}
            progress={intervalProgress}
            intervalRemainingTime={intervalRemainingTime}
            currentInterval={currentInterval}
            nextInterval={nextInterval}
            isPaused={isPaused}
            onReset={resetInterval}
            onPauseResume={() => setIsPaused((v) => !v)}
            onEnd={resetInterval}
            onSkip={skipInterval}
            topPaddingClass="pt-8"
          />
        )}
      </div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center mb-2">
        <input type="number" min={0} max={max} value={value} onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))} className="w-full text-center text-3xl font-black bg-transparent outline-none appearance-none" />
      </div>
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</p>
    </div>
  );
}
