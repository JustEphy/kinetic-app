'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { signInAsGuest, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    // For now, show that Google OAuth would be triggered here
    // In production with proper OAuth setup, this would use signIn('google')
    try {
      await signInWithGoogle();
    } catch {
      alert('Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables. For now, please use Guest mode.');
    }
  };

  const handleGuestContinue = async () => {
    await signInAsGuest();
    router.push('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full kinetic-gradient flex items-center justify-center">
              <span
                className="material-symbols-outlined text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">KINETIC</h1>
          <p className="text-on-surface-variant">AI-Powered Workout Timer</p>
        </div>

        {/* Sign In Options */}
        <div className="bg-surface-container-low rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant text-sm">
              Sign in to save your workouts and track progress across devices.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            className="w-full flex items-center justify-center gap-4 bg-white text-gray-900 px-6 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-on-surface-variant text-sm">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Guest Continue */}
          <button
            className="w-full flex items-center justify-center gap-4 bg-surface-container hover:bg-surface-container-high px-6 py-4 rounded-lg font-bold transition-colors"
            onClick={handleGuestContinue}
          >
            <span className="material-symbols-outlined">person</span>
            Continue as Guest
          </button>

          <p className="text-on-surface-variant text-xs text-center">
            Guest data is stored locally on this device only.
          </p>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-secondary text-xl">timer</span>
            <span className="text-on-surface-variant">AI Interval Timer</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-primary text-xl">volume_up</span>
            <span className="text-on-surface-variant">Audio Alerts</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-tertiary text-xl">analytics</span>
            <span className="text-on-surface-variant">Track Progress</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-secondary text-xl">devices</span>
            <span className="text-on-surface-variant">Sync Devices</span>
          </div>
        </div>
      </div>
    </div>
  );
}