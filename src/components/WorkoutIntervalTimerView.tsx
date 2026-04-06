'use client';

import { WorkoutInterval } from '@/types';

interface WorkoutIntervalTimerViewProps {
  workoutTotalDuration: number;
  elapsedTime: number;
  progress: number;
  intervalRemainingTime: number;
  currentInterval: WorkoutInterval;
  nextInterval: WorkoutInterval | null;
  isPaused: boolean;
  onReset: () => void;
  onPauseResume: () => void;
  onEnd: () => void;
  onSkip: () => void;
  topPaddingClass?: string;
}

export default function WorkoutIntervalTimerView({
  workoutTotalDuration,
  elapsedTime,
  progress,
  intervalRemainingTime,
  currentInterval,
  nextInterval,
  isPaused,
  onReset,
  onPauseResume,
  onEnd,
  onSkip,
  topPaddingClass = 'pt-32 md:pt-24',
}: WorkoutIntervalTimerViewProps) {
  const minutes = Math.floor(intervalRemainingTime / 60);
  const seconds = intervalRemainingTime % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const circumference = 2 * Math.PI * 140;
  const intervalDuration = currentInterval.duration;
  let actualProgress: number;

  if (intervalRemainingTime <= 1) {
    actualProgress = 100;
  } else {
    const effectiveDuration = intervalDuration - 1;
    const effectiveElapsed = intervalDuration - intervalRemainingTime;
    actualProgress = effectiveDuration > 0 ? Math.min(100, (effectiveElapsed / effectiveDuration) * 100) : 0;
  }

  const strokeOffset = circumference * (1 - actualProgress / 100);
  const isWorkInterval = currentInterval.type === 'work' || currentInterval.type === 'warmup';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start relative overflow-hidden px-6 ${topPaddingClass}`}>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md mb-8 flex flex-col items-center gap-3">
        <div className="flex justify-between w-full px-1">
          <span className="text-secondary font-label text-sm uppercase tracking-widest font-bold">Session Progress</span>
          <span className="text-on-surface-variant font-label text-sm">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-secondary-dim rounded-full shadow-[0_0_10px_rgba(0,238,252,0.3)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between w-full px-1 text-sm">
          <span className="text-on-surface font-bold">{formatTimeDisplay(elapsedTime)}</span>
          <span className="text-on-surface-variant">/ {formatTimeDisplay(workoutTotalDuration)}</span>
        </div>
      </div>

      <section className="flex flex-col items-center gap-8 z-10">
        <div className="flex flex-col items-center">
          <span className="text-on-surface-variant font-headline tracking-[0.2em] uppercase text-sm mb-1">
            Interval Remaining
          </span>
          <h2 className={`font-black text-3xl italic tracking-tighter uppercase ${isWorkInterval ? 'text-primary' : 'text-secondary'}`}>
            {currentInterval.type === 'work' && 'High Intensity'}
            {currentInterval.type === 'rest' && 'Active Recovery'}
            {currentInterval.type === 'warmup' && 'Warm Up'}
            {currentInterval.type === 'cooldown' && 'Cool Down'}
          </h2>
        </div>

        <div className="relative flex items-center justify-center">
          <svg className="w-80 h-80 md:w-88 md:h-88" style={{ minWidth: '320px', minHeight: '320px' }} viewBox="0 0 320 320">
            <g transform="rotate(-90 160 160)">
              <circle
                className="text-surface-container"
                cx="160"
                cy="160"
                fill="transparent"
                r="140"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className={`progress-ring-circle transition-all duration-300 ${isWorkInterval ? 'stroke-primary' : 'stroke-secondary'}`}
                cx="160"
                cy="160"
                fill="transparent"
                r="140"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                strokeWidth="8"
                style={{ filter: `drop-shadow(0 0 8px var(--color-${isWorkInterval ? 'primary' : 'secondary'}))` }}
              />
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl md:text-8xl font-black font-headline tracking-tighter text-on-surface flex items-baseline">
              {timeDisplay.split(':')[0]}
              <span className="text-primary-dim">:</span>
              {timeDisplay.split(':')[1]}
            </span>
            <span className="text-on-surface-variant/60 font-bold tracking-widest mt-2">
              {intervalRemainingTime >= 60 ? 'MINUTES' : 'SECONDS'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <button
            onClick={onReset}
            className="px-8 py-3 bg-surface-container-highest hover:bg-surface-bright text-on-surface font-bold uppercase tracking-widest text-sm rounded-full transition-all active:scale-95 shadow-xl border border-outline-variant/10"
          >
            Reset
          </button>
          <button
            onClick={onPauseResume}
            className="px-12 py-3 bg-gradient-to-br from-primary to-primary-dim hover:brightness-110 text-on-primary font-black uppercase tracking-widest text-sm rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(255,138,169,0.3)]"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onEnd}
            className="px-8 py-3 bg-surface-container-low hover:bg-error/10 text-error-dim font-bold uppercase tracking-widest text-sm rounded-full transition-all active:scale-95 border border-error/20"
          >
            End Session
          </button>
        </div>

        <button onClick={onSkip} className="text-on-surface-variant hover:text-secondary transition-colors flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined">skip_next</span>
          <span className="text-sm uppercase tracking-wider">Skip Interval</span>
        </button>
      </section>

      {nextInterval && (
        <section className="mt-16 w-full max-w-sm">
          <div className="bg-surface-container-low p-6 rounded-lg border-t-4 border-secondary shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">fast_forward</span>
            </div>
            <div className="flex flex-col items-center text-center relative z-10">
              <span className="text-secondary font-label text-xs uppercase tracking-[0.3em] font-bold mb-3">Up Next</span>
              <h3 className="text-2xl font-black text-on-surface mb-1">{nextInterval.name}</h3>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">timer</span>
                <span className="font-bold">{formatTime(nextInterval.duration)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-0 pointer-events-none -z-10 opacity-5">
        <img
          alt=""
          className="w-full h-full object-cover grayscale"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEPKvhuz_Fo0Gbr8CMYWpxjUS0kRhmDZ87ytpI5vZbiWwzOC-p9Wb2e5an6CqOXiiyAQbK2WOCxn-dWdNahrSOIMrJv0o98y8HUhlPrTWsCHndCff8EZXa7gtUw5ZHbB7CwVc2hQwM5VbnmurplR3TnfKtSwBcwBVLGT-xbnKlQ7AnWX7BHQN3Zpezi1OOCjY6JBnQ4Yz69ru4qujkjyetsHbjQvi4z3v6cGYc010uLw_urawoDW8pAuqlIbYFRK8vsOCjqzxMlP_C"
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} MIN`;
}

function formatTimeDisplay(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
