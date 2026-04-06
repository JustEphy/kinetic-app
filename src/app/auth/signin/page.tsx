'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signUpWithEmail, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Check for mode query param
  useEffect(() => {
    const resetParam = searchParams.get('reset');
    const modeParam = searchParams.get('mode');
    if (resetParam === 'success') {
      setInfoMessage('Password reset complete. Sign in with your new password.');
    }
    if (modeParam === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleEmailSubmit = async () => {
    setErrorMessage('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        router.push('/home');
        return;
      }

      await signUpWithEmail(email, password, name);
      alert('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Authentication failed. Check your email/password or Supabase auth settings.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!email) {
      setErrorMessage('Enter your email first, then tap Forgot password.');
      return;
    }

    setIsSendingReset(true);
    try {
      await requestPasswordReset(email);
      setInfoMessage('Password reset email sent. Check your inbox for the reset link.');
    } catch {
      setErrorMessage('Could not send reset email. Verify your email and try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        
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
            <h2 className="text-xl font-bold tracking-tight mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {mode === 'signin' 
                ? 'Sign in to sync your workouts across devices.' 
                : 'Create an account to save your workouts and track progress.'}
            </p>
          </div>

          {mode === 'signup' && (
            <input
              className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-primary"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-primary"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-primary"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
          />
          {errorMessage && (
            <p className="text-sm text-warning">{errorMessage}</p>
          )}
          {infoMessage && (
            <p className="text-sm text-secondary">{infoMessage}</p>
          )}
          <button
            className="w-full flex items-center justify-center gap-4 bg-primary text-on-primary px-6 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleEmailSubmit}
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Login' : 'Create Account'
            )}
          </button>
          {mode === 'signin' && (
            <button
              className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
              onClick={handleForgotPassword}
              disabled={isSendingReset}
            >
              {isSendingReset ? 'Sending reset email...' : 'Forgot password?'}
            </button>
          )}
          <button
            className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>

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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">bolt</span>
          <p className="text-on-surface-variant mt-4">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
