'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  label: string;
  padZero?: boolean;
}

export default function NumberPicker({ 
  value, 
  onChange, 
  min = 0, 
  max, 
  label,
  padZero = true 
}: NumberPickerProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const format = useCallback((num: number) => {
    return padZero ? num.toString().padStart(2, '0') : num.toString();
  }, [padZero]);

  const increment = useCallback(() => {
    onChange(value >= max ? min : value + 1);
  }, [value, max, min, onChange]);

  const decrement = useCallback(() => {
    onChange(value <= min ? max : value - 1);
  }, [value, max, min, onChange]);

  // Use simplified UI that works without hydration issues
  if (!mounted) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-2">
          {label}
        </p>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10" />
          <div className="text-5xl font-black text-primary w-20 text-center">
            {format(value)}
          </div>
          <div className="w-10 h-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-2">
        {label}
      </p>
      <div className="flex flex-col items-center gap-2">
        {/* Up button */}
        <button
          type="button"
          onClick={increment}
          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-on-surface-variant">keyboard_arrow_up</span>
        </button>
        
        {/* Current value */}
        <div className="text-5xl font-black text-primary w-20 text-center select-none">
          {format(value)}
        </div>
        
        {/* Down button */}
        <button
          type="button"
          onClick={decrement}
          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-on-surface-variant">keyboard_arrow_down</span>
        </button>
      </div>
    </div>
  );
}
