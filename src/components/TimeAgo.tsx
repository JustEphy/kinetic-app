'use client';

import { useEffect, useReducer } from 'react';

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
  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const timeAgo = formatTimeAgo(date);

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      forceRender();
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{timeAgo}</span>;
}
