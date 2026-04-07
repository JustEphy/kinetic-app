'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import AIChatbot to ensure client-side rendering
const AIChatbot = dynamic(() => import('./AIChatbot'), { ssr: false });

export default function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isGuest, isLoading } = useAuth();

  const isGuestTimerRoute = pathname.startsWith('/guest-timer');
  const isLandingPage = pathname === '/';
  const isAuthenticated = !!user && !isGuest;
  const shouldShowChat = !isLoading && !isLandingPage && (isAuthenticated || isGuestTimerRoute);

  if (!shouldShowChat) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-lg hover:scale-110 transition-transform z-[9999] flex items-center justify-center group motion-reduce:hover:scale-100"
        aria-label="Open AI Chat"
        style={{ zIndex: 9999 }}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'psychology'}
        </span>
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20 motion-reduce:hidden"></div>
        )}
      </button>

      {/* Chatbot */}
      {isOpen && <AIChatbot onClose={() => setIsOpen(false)} />}
    </>
  );
}
