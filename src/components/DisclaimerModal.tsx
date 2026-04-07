'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DisclaimerModal() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const { user, isLoading, isGuest } = useAuth();
  const titleId = useId();
  const showModal = !isLoading && (isGuest || !user) && !hasAccepted;

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (hasDeclined) {
          setHasDeclined(false);
          return;
        }
        setHasDeclined(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, hasDeclined]);

  const handleAccept = () => {
    // Close for this visit/session only.
    setHasAccepted(true);
    setHasDeclined(false);
  };

  const handleDecline = () => {
    setHasDeclined(true);
  };

  const handleTryAgain = () => {
    setHasDeclined(false);
  };

  // Don't render anything on server-side to avoid hydration issues
  if (!showModal) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-surface-dim/95 backdrop-blur-sm z-50" aria-hidden="true" />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role={hasDeclined ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="bg-surface-container-high rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-outline-variant">
          {!hasDeclined ? (
            <>
              {/* Header */}
              <div className="bg-error-container p-6 rounded-t-2xl border-b-2 border-error">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-error">warning</span>
                  <div>
                    <h2 id={titleId} className="text-2xl font-bold text-on-surface">Important Legal Disclaimer</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Please read carefully before continuing</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-error-container border-2 border-error rounded-lg p-4">
                  <h3 className="font-bold text-lg text-on-surface mb-2">
                    ⚠️ Unfinished Application - Use At Your Own Risk
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    This application is currently <strong>in development and incomplete</strong>. By using this app, 
                    you acknowledge and accept that:
                  </p>
                </div>

                <div className="space-y-3 text-sm text-on-surface-variant">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">No Medical Advice:</strong> This app is a workout timer tool only and does NOT provide 
                      medical, fitness, health, or nutritional advice. Consult a healthcare professional before 
                      starting any exercise program.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">Assumption of Risk:</strong> You assume all risks associated with using this app and 
                      any workouts. Exercise can be strenuous and may result in injury, including serious injury or death.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">No Liability:</strong> Kinetic By You Inc., its developers, and contributors are NOT 
                      responsible for any damages, injuries, data loss, or other issues arising from your use of this 
                      application.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">Beta Software:</strong> Features may not work as expected, data may be lost, and the 
                      app may be unavailable at any time without notice.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">Age Requirement:</strong> You must be at least 13 years old (16 in the EU) to use this 
                      app. If under 18, you must have parental/guardian permission.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error text-xl flex-shrink-0">check_circle</span>
                    <p>
                      <strong className="text-on-surface">&quot;As Is&quot; Basis:</strong> The app is provided &quot;as is&quot; without warranties 
                      of any kind, express or implied.
                    </p>
                  </div>
                </div>

                <div className="bg-secondary-container border-l-4 border-secondary p-4 rounded">
                  <p className="text-sm font-semibold text-on-surface mb-2">
                    🚨 Stop Immediately If You Experience:
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Chest pain, severe shortness of breath, dizziness, nausea, irregular heartbeat, or any 
                    concerning symptoms. Call emergency services (911 in the US) if necessary.
                  </p>
                </div>

                {/* Legal Documents */}
                <div className="border border-outline rounded-lg p-4 bg-surface-container">
                  <h3 className="font-semibold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Review Our Legal Documents
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    By continuing as a guest, you agree to our terms for this session. Create an account to accept terms permanently:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Privacy Policy
                    </Link>
                    <Link
                      href="/legal/terms"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Terms of Service
                    </Link>
                    <Link
                      href="/legal/disclaimer"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Full Disclaimer
                    </Link>
                    <Link
                      href="/support"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Support Center
                    </Link>
                  </div>
                </div>

                <div className="bg-primary-container border border-outline rounded-lg p-4">
                  <p className="text-sm text-on-surface">
                    <strong>Contact Us:</strong> For questions or concerns, email{' '}
                    <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim underline transition-colors">
                      support@kinetic.app
                    </a>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-outline-variant bg-surface-container-low rounded-b-2xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDecline}
                    className="flex-1 px-6 py-3 border-2 border-error text-error rounded-lg font-semibold hover:bg-error-container transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-6 py-3 kinetic-gradient text-on-primary rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
                  >
                    I Understand and Accept
                  </button>
                </div>
                <p className="text-xs text-center text-on-surface-variant mt-3">
                  By clicking &quot;I Understand and Accept&quot;, you acknowledge you have read and agree to all terms
                </p>
              </div>
            </>
          ) : (
            // Declined state
            <>
              <div className="bg-error-container p-6 rounded-t-2xl border-b-2 border-error">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-5xl text-error">block</span>
                  <div>
                    <h2 id={titleId} className="text-2xl font-bold text-on-surface">Access Denied</h2>
                    <p className="text-on-surface-variant text-sm mt-1">You must accept to continue</p>
                  </div>
                </div>
              </div>

              <div className="p-8 text-center space-y-4">
                <p className="text-lg text-on-surface">
                  You have declined the terms and conditions. You cannot use Kinetic without accepting our disclaimer 
                  and legal terms.
                </p>

                <div className="bg-surface-container rounded-lg p-6 space-y-3 border border-outline">
                  <h3 className="font-semibold text-on-surface">What happens now?</h3>
                  <ul className="text-sm text-on-surface-variant space-y-2 text-left">
                    <li>• You will not be able to access Kinetic features</li>
                    <li>• No data will be collected or stored</li>
                    <li>• You can review our legal documents at any time</li>
                    <li>• You may reconsider and accept if you change your mind</li>
                  </ul>
                </div>

                <div className="border border-outline rounded-lg p-4">
                  <p className="text-sm text-on-surface-variant mb-3">
                    Review our policies before deciding:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-on-surface-variant">•</span>
                    <Link
                      href="/legal/terms"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <span className="text-on-surface-variant">•</span>
                    <Link
                      href="/legal/disclaimer"
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-dim transition-colors"
                    >
                      Disclaimer
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleTryAgain}
                    className="flex-1 px-6 py-3 kinetic-gradient text-on-primary rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Review Terms Again
                  </button>
                  <a
                    href="about:blank"
                    className="flex-1 px-6 py-3 border-2 border-outline text-on-surface-variant rounded-lg font-semibold hover:bg-surface-container transition-colors text-center"
                  >
                    Leave Site
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
