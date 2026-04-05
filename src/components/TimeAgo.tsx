'use client';

import { useState, useEffect } from 'react';

interface TimeAgoProps {
  date: Date;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setMounted(true);
    setTimeAgo(formatTimeAgo(date));
    
    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  // Return placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return <span className={className}>Recently</span>;
  }

  return <span className={className}>{timeAgo}</span>;
}
