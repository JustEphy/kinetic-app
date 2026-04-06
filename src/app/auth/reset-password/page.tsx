'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setSuccessMessage('Password updated. Redirecting to sign in...');
      window.setTimeout(() => {
        router.replace('/auth/signin?reset=success');
      }, 1200);
    } catch {
      setErrorMessage('Could not update password. Open the reset link again and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/auth/signin" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Sign In
        </Link>

        <div className="bg-surface-container-low rounded-lg p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Reset Password</h1>
            <p className="text-on-surface-variant text-sm">
              Enter a new password for your account.
            </p>
          </div>

          <input
            type="password"
            className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-primary"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-primary"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          {errorMessage && <p className="text-sm text-warning">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-secondary">{successMessage}</p>}

          <button
            className="w-full flex items-center justify-center gap-4 bg-primary text-on-primary px-6 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || !password || !confirmPassword}
          >
            {isSubmitting ? 'Updating password...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">bolt</span>
          <p className="text-on-surface-variant mt-4">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
