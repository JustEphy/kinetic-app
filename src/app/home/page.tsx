'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TimeAgo from '@/components/TimeAgo';
import PresetsModal from '@/components/PresetsModal';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, stats, recentActivity } = useAuth();
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary animate-pulse">bolt</span>
            <p className="text-on-surface-variant mt-4">Loading your dashboard...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="pb-12 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <section className="relative mb-10 md:mb-12 rounded-xl overflow-hidden min-h-[340px] md:min-h-[400px] flex items-center bg-surface-container-low">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10"></div>
          <img
            alt="Gym aesthetic"
            className="w-full h-full object-cover opacity-40 scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7V0yHvUApLgqwuu8fsOWuAj2tN_viGilC_W7NKP2S-10VRTH7N9yIPvI1KoGXMe8UkWqJQKboAqId43CYLukWdwx7aQbVr9y4aioUDfpHuqXvc4cEMnzV4nUCBs-eJ8RuNisvjtAf_FnU_hc6v58WERNX4Mdf4Rs3RHB2iCwZAi10yVMSYs3Nv1hXTC-iYlOiDlmVYkTbmflaSF3aaJtRv0xZR9LW2y7LHMTuifj629ViHUq9-PCVNkXVgYzq6ApaqOmeo4WFetf8"
          />
        </div>
        <div className="relative z-20 px-6 md:px-8 lg:px-16 py-10 md:py-12 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 md:mb-6">
            READY TO <br />
            <span className="text-primary italic">TRAIN?</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-10 max-w-md font-light leading-relaxed">
            Ignite your performance with precision-engineered routines. Select your mode to begin.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/timer"
              className="kinetic-gradient text-on-primary font-bold px-8 py-4 rounded-full flex items-center gap-3 hover:scale-105 transition-all duration-300 neon-glow-primary"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
              Timer
            </Link>
            <Link
              href="/workouts"
              className="border-2 border-secondary text-secondary font-bold px-8 py-4 rounded-full flex items-center gap-3 hover:bg-secondary/10 transition-all duration-300"
            >
              <span className="material-symbols-outlined">architecture</span>
              Workout Builder
            </Link>
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="border border-primary/40 text-primary font-bold px-8 py-4 rounded-full flex items-center gap-3 hover:bg-primary/10 transition-all duration-300"
            >
              <span className="material-symbols-outlined">bookmarks</span>
              My Presets
            </button>
          </div>
        </div>
      </section>

      {/* User Stats Grid (Dynamic Only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-surface-container rounded-xl p-6">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Lifetime Time</p>
          <p className="text-4xl font-black tracking-tighter text-primary">
            {stats.lifetimeTotalTime}
            <span className="text-base font-normal ml-2 text-on-surface-variant">hrs</span>
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Workouts Completed</p>
          <p className="text-4xl font-black tracking-tighter text-secondary">
            {stats.workoutsCompleted}
            <span className="text-base font-normal ml-2 text-on-surface-variant">sessions</span>
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Current Streak</p>
          <p className="text-4xl font-black tracking-tighter text-tertiary">
            {stats.currentStreak}
            <span className="text-base font-normal ml-2 text-on-surface-variant">days</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-12 mt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Recent Activity</h2>
            <Link
              href="/stats"
              className="text-secondary font-label text-sm tracking-widest uppercase flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              View All History{' '}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-4 block">fitness_center</span>
                <p>No activity yet — start your first workout to build momentum.</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group bg-surface-container-low hover:bg-surface-container rounded-xl p-6 transition-all duration-300 flex flex-wrap md:flex-nowrap items-center gap-6 relative"
                >
                  <div
                    className={`absolute top-0 right-0 h-full w-1 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      activity.type === 'strength' ? 'bg-primary' : 'bg-secondary'
                    }`}
                  ></div>
                  <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/20">
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        activity.type === 'strength' ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {activity.type === 'strength' ? 'fitness_center' : 'bolt'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold">{activity.workoutName}</h4>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          activity.type === 'strength'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm">
                      Completed <TimeAgo date={activity.completedAt} /> • {activity.duration} Minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-8 pr-4">
                    {activity.metrics.slice(0, 2).map((metric, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                          {metric.label}
                        </div>
                        <div className={`text-xl font-bold ${i === 1 ? 'text-secondary' : ''}`}>
                          {metric.value}
                          {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                        </div>
                      </div>
                    ))}
                    <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-bright transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PresetsModal isOpen={isPresetsModalOpen} onClose={() => setIsPresetsModalOpen(false)} />
    </div>
  );
}
