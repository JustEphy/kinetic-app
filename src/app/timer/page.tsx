'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import NumberPicker from '@/components/NumberPicker';
import { audioManager, haptics } from '@/lib/audio';

type TimerMode = 'setup' | 'countdown' | 'stopwatch';

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('setup');
  const [timerType, setTimerType] = useState<'countdown' | 'stopwatch'>('countdown');
  
  // Setup values
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  
  // Running timer state
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [elapsed, setElapsed] = useState(0); // for stopwatch
  const [isRunning, setIsRunning] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const totalSetTime = hours * 3600 + minutes * 60 + seconds;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
    startTimeRef.current = Date.now();
    audioManager.playSound('work');
    haptics.doubleTap();
  }, [timerType, totalSetTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    haptics.tap();
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    haptics.tap();
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setMode('setup');
    setTimeRemaining(0);
    setElapsed(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (timerType === 'countdown' || mode === 'countdown') {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            audioManager.playSound('complete');
            haptics.success();
            return 0;
          }
          // Warning beeps at 3, 2, 1
          if (prev <= 4 && prev > 1) {
            audioManager.playSound('warning');
            haptics.tap();
          }
          return prev - 1;
        });
      } else {
        setElapsed(prev => prev + 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timerType, mode]);

  const progress = timerType === 'countdown' && totalSetTime > 0
    ? ((totalSetTime - timeRemaining) / totalSetTime) * 100
    : 0;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="pb-16 px-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <p className="text-secondary font-label uppercase tracking-widest text-sm mb-2">
          Simple Timer
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
          {mode === 'setup' ? 'SET TIME' : timerType === 'countdown' ? 'COUNTDOWN' : 'STOPWATCH'}
        </h1>
      </header>

      {mode === 'setup' ? (
        <>
          {/* Timer Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex p-1 bg-surface-container-low rounded-full">
              <button
                className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${
                  timerType === 'countdown' 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setTimerType('countdown')}
              >
                <span className="material-symbols-outlined text-lg align-middle mr-2">timer</span>
                Countdown
              </button>
              <button
                className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${
                  timerType === 'stopwatch' 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setTimerType('stopwatch')}
              >
                <span className="material-symbols-outlined text-lg align-middle mr-2">pace</span>
                Stopwatch
              </button>
            </div>
          </div>

          {timerType === 'countdown' ? (
            /* Number Pickers for Countdown */
            <div className="flex justify-center items-center gap-4 mb-12">
              <NumberPicker
                value={hours}
                onChange={setHours}
                max={23}
                label="Hours"
              />
              <span className="text-5xl font-black text-primary mt-6">:</span>
              <NumberPicker
                value={minutes}
                onChange={setMinutes}
                max={59}
                label="Minutes"
              />
              <span className="text-5xl font-black text-primary mt-6">:</span>
              <NumberPicker
                value={seconds}
                onChange={setSeconds}
                max={59}
                label="Seconds"
              />
            </div>
          ) : (
            /* Stopwatch Preview */
            <div className="flex flex-col items-center mb-12">
              <div className="text-8xl font-black tracking-tighter text-on-surface-variant">
                00:00
              </div>
              <p className="text-on-surface-variant text-sm mt-4">
                Tap start to begin counting
              </p>
            </div>
          )}

          {/* Quick Presets for Countdown */}
          {timerType === 'countdown' && (
            <div className="mb-8">
              <p className="text-center text-on-surface-variant text-xs uppercase tracking-widest mb-4">
                Quick Presets
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: '1 min', h: 0, m: 1, s: 0 },
                  { label: '5 min', h: 0, m: 5, s: 0 },
                  { label: '10 min', h: 0, m: 10, s: 0 },
                  { label: '15 min', h: 0, m: 15, s: 0 },
                  { label: '30 min', h: 0, m: 30, s: 0 },
                  { label: '1 hour', h: 1, m: 0, s: 0 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-sm font-bold transition-colors"
                    onClick={() => {
                      setHours(preset.h);
                      setMinutes(preset.m);
                      setSeconds(preset.s);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              className="kinetic-gradient px-12 py-5 rounded-full font-black uppercase tracking-widest text-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              onClick={startTimer}
              disabled={timerType === 'countdown' && totalSetTime <= 0}
            >
              <span className="material-symbols-outlined text-2xl align-middle mr-2">play_arrow</span>
              Start
            </button>
          </div>
        </>
      ) : (
        /* Active Timer View */
        <div className="flex flex-col items-center">
          {/* Progress Ring */}
          <div className="relative mb-8">
            <svg className="w-80 h-80 -rotate-90">
              {/* Background ring */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-surface-container-highest"
              />
              {/* Progress ring */}
              {timerType === 'countdown' && (
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-primary transition-all duration-300"
                />
              )}
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl md:text-7xl font-black tracking-tighter">
                {formatTime(timerType === 'countdown' ? timeRemaining : elapsed)}
              </span>
              <span className="text-on-surface-variant text-sm uppercase tracking-widest mt-2">
                {timerType === 'countdown' ? 'Remaining' : 'Elapsed'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              className="w-16 h-16 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
              onClick={resetTimer}
            >
              <span className="material-symbols-outlined text-2xl">stop</span>
            </button>
            
            <button
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isRunning ? 'bg-secondary text-on-secondary' : 'kinetic-gradient'
              }`}
              onClick={isRunning ? pauseTimer : resumeTimer}
            >
              <span className="material-symbols-outlined text-3xl">
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
            </button>
            
            {timerType === 'stopwatch' && (
              <button
                className="w-16 h-16 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
                onClick={() => {
                  // Lap functionality could be added here
                  haptics.tap();
                }}
              >
                <span className="material-symbols-outlined text-2xl">flag</span>
              </button>
            )}
          </div>

          {/* Timer complete message */}
          {timerType === 'countdown' && timeRemaining === 0 && !isRunning && (
            <div className="mt-8 text-center">
              <p className="text-2xl font-black text-primary mb-2">TIME&apos;S UP!</p>
              <button
                className="text-secondary underline"
                onClick={resetTimer}
              >
                Set a new timer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
