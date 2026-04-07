'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to /home
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/home');
    }
  }, [isLoading, user, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">bolt</span>
          <p className="text-on-surface-variant mt-4">Loading KINETIC...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full kinetic-gradient flex items-center justify-center neon-glow-primary">
            <span
              className="material-symbols-outlined text-6xl text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-center mb-4">
          KINETIC
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl text-center max-w-md mb-12">
          AI-Powered Workout Timer for Precision Training
        </p>

        {/* Main Actions */}
        <div className="w-full max-w-md space-y-4">
          {/* Use Timer - Guest */}
          <Link
            href="/guest-timer"
            className="w-full flex items-center justify-center gap-4 bg-surface-container hover:bg-surface-container-high px-8 py-5 rounded-xl font-bold text-lg transition-all border border-white/10"
          >
            <span
              className="material-symbols-outlined text-secondary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              timer
            </span>
            <span>Use Timer</span>
            <span className="ml-auto text-on-surface-variant text-sm font-normal">No account needed</span>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-on-surface-variant text-sm">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Login */}
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center gap-4 kinetic-gradient text-on-primary px-8 py-5 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] neon-glow-primary"
          >
            <span className="material-symbols-outlined text-2xl">login</span>
            Login
          </Link>

          {/* Sign Up */}
          <Link
            href="/auth/signin?mode=signup"
            className="w-full flex items-center justify-center gap-4 border-2 border-secondary text-secondary px-8 py-5 rounded-xl font-bold text-lg transition-all hover:bg-secondary/10"
          >
            <span className="material-symbols-outlined text-2xl">person_add</span>
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
          <div className="flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
            <span className="text-on-surface-variant text-sm">AI Workouts</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">timer</span>
            <span className="text-on-surface-variant text-sm">Interval Timer</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-3xl">analytics</span>
            <span className="text-on-surface-variant text-sm">Track Progress</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">cloud_sync</span>
            <span className="text-on-surface-variant text-sm">Sync Data</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-surface-container">
        <div className="flex flex-col items-center gap-4">
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <Link
              href="/legal/privacy"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Support
            </Link>
            <Link
              href="/contact"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
          
          {/* Copyright */}
          <p className="text-center text-on-surface-variant text-xs">
            © 2026 KINETIC. Train smarter.
          </p>
        </div>
      </footer>
    </div>
  );
}
