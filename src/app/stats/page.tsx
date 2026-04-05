'use client';

import { useAuth } from '@/contexts/AuthContext';

const WEEKLY_DATA = [
  { day: 'MON', intensity: 50, isHighlight: false },
  { day: 'TUE', intensity: 75, isHighlight: false },
  { day: 'WED', intensity: 67, isHighlight: false },
  { day: 'THU', intensity: 90, isHighlight: true },
  { day: 'FRI', intensity: 33, isHighlight: false },
  { day: 'SAT', intensity: 80, isHighlight: false },
  { day: 'SUN', intensity: 25, isHighlight: false },
];

export default function StatsPage() {
  const { stats, personalRecords } = useAuth();

  const monthlyProgress = Math.round((stats.monthlyCompletedHours / stats.monthlyGoalHours) * 100);

  return (
    <div className="pb-16 px-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-secondary font-label uppercase tracking-widest text-sm mb-2">
              Performance Dashboard
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              TRAINING <span className="text-primary-dim">STATS</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-6 py-4 rounded-lg flex items-center gap-4 border-l-4 border-primary">
              <div className="text-primary">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest">
                  Current Streak
                </p>
                <p className="text-3xl font-black italic tracking-tighter">
                  {stats.currentStreak} DAYS
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Activity Chart */}
        <div className="md:col-span-8 bg-surface-container-low rounded-lg p-8 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Weekly Activity Intensity</h3>
              <p className="text-on-surface-variant text-sm">Real-time exertion tracking (7 days)</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">
                Active State
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {WEEKLY_DATA.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div
                  className="w-full bg-surface-container rounded-full relative overflow-hidden"
                  style={{ height: `${day.intensity * 2.5}px` }}
                >
                  <div
                    className={`absolute bottom-0 w-full h-full rounded-full transition-all group-hover/bar:brightness-125 ${
                      day.isHighlight ? 'bg-primary' : 'bg-secondary'
                    }`}
                  ></div>
                </div>
                <span
                  className={`text-xs font-bold ${
                    day.isHighlight ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="md:col-span-4 bg-surface-container-low rounded-lg p-8 flex flex-col justify-between border-t border-white/5">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Training Volume</h3>
            <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">
              Month to Date
            </p>
          </div>
          <div className="relative py-12 flex justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle
                className="text-surface-container-highest"
                cx="96"
                cy="96"
                fill="transparent"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
              />
              <circle
                className="text-secondary"
                cx="96"
                cy="96"
                fill="transparent"
                r="88"
                stroke="currentColor"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - monthlyProgress / 100)}
                strokeLinecap="round"
                strokeWidth="12"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tighter">{monthlyProgress}%</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Target reached
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="text-on-surface-variant font-bold text-[10px] uppercase">Goal</span>
              <span className="font-black">{stats.monthlyGoalHours} HRS</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-secondary font-bold text-[10px] uppercase">Current</span>
              <span className="font-black">{stats.monthlyCompletedHours} HRS</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="md:col-span-4 bg-surface-container rounded-lg p-6 group hover:bg-surface-bright transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">history</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary neon-glow-primary"></div>
          </div>
          <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest mb-1">
            Lifetime Total Time
          </p>
          <h4 className="text-4xl font-black italic tracking-tighter">
            {stats.lifetimeTotalTime.toLocaleString()}{' '}
            <span className="text-lg font-normal not-italic text-on-surface-variant">HRS</span>
          </h4>
        </div>

        <div className="md:col-span-4 bg-surface-container rounded-lg p-6 group hover:bg-surface-bright transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-secondary neon-glow-secondary"></div>
          </div>
          <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest mb-1">
            Total Calories Burnt
          </p>
          <h4 className="text-4xl font-black italic tracking-tighter">
            {stats.totalCaloriesBurnt.toLocaleString()}{' '}
            <span className="text-lg font-normal not-italic text-on-surface-variant">KCAL</span>
          </h4>
        </div>

        <div className="md:col-span-4 bg-surface-container rounded-lg p-6 group hover:bg-surface-bright transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-tertiary neon-glow-tertiary"></div>
          </div>
          <p className="text-on-surface-variant text-xs uppercase font-bold tracking-widest mb-1">
            Workouts Completed
          </p>
          <h4 className="text-4xl font-black italic tracking-tighter">
            {stats.workoutsCompleted}{' '}
            <span className="text-lg font-normal not-italic text-on-surface-variant">SESSIONS</span>
          </h4>
        </div>
      </div>

      {/* Personal Records Section */}
      <section className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-lg overflow-hidden h-[400px]">
            <img
              alt="Training Visual"
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBruaZIQTDjJ2q49WGby4a6EsUkKeH4rI9kPHCKyhqsvj2yj0GolfcrPF8yl-FslbqrIY8Hpk2kfcR5ebr5cBJkQEVUum3OuBjv17gtLv0C4cOsqn2_2oExy29Pl_rY7Tf8OETsPbOz-oJ_IdssH7bJxCetM2V_wLx-eKTg_839cv76zqrGuHc89DtjMwfNjGhsrup5U8LBI47QiWWYLj7TWW9zTcNtA8gt_cWwr5WiPHTcE0heParV2rCuTRk_fzWnbzCNUqpwI60p"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <p className="text-primary font-black text-6xl tracking-tighter italic">KINETIC ELITE</p>
              <p className="text-on-surface-variant font-bold tracking-widest text-sm uppercase">
                Top 1% Achievement Level
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-4">PERSONAL RECORDS</h2>
              <div className="space-y-4">
                {personalRecords.map((record, index) => {
                  const colorClasses = ['border-secondary text-secondary', 'border-primary text-primary', 'border-tertiary text-tertiary'];
                  const colorClass = colorClasses[index % colorClasses.length];
                  
                  return (
                    <div
                      key={record.id}
                      className={`flex justify-between items-center p-4 rounded-lg bg-surface-container-high border-r-4 ${colorClass.split(' ')[0]}`}
                    >
                      <div>
                        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                          {record.category}
                        </p>
                        <p className="text-xl font-black">
                          {record.value} {record.unit}
                        </p>
                      </div>
                      <span
                        className={`material-symbols-outlined ${colorClass.split(' ')[1]}`}
                      >
                        {record.trend === 'up' ? 'arrow_upward' : record.trend === 'down' ? 'arrow_downward' : 'horizontal_rule'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}