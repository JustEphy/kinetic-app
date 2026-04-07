'use client';

import { useCallback } from 'react';

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
  const valueId = `number-picker-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const format = useCallback((num: number) => {
    return padZero ? num.toString().padStart(2, '0') : num.toString();
  }, [padZero]);

  const increment = useCallback(() => {
    onChange(value >= max ? min : value + 1);
  }, [value, max, min, onChange]);

  const decrement = useCallback(() => {
    onChange(value <= min ? max : value - 1);
  }, [value, max, min, onChange]);

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
          aria-label={`Increase ${label}`}
          aria-controls={valueId}
          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">keyboard_arrow_up</span>
        </button>
        
        {/* Current value */}
        <div id={valueId} className="text-5xl font-black text-primary w-20 text-center select-none" aria-live="polite">
          {format(value)}
        </div>
        
        {/* Down button */}
        <button
          type="button"
          onClick={decrement}
          aria-label={`Decrease ${label}`}
          aria-controls={valueId}
          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">keyboard_arrow_down</span>
        </button>
      </div>
    </div>
  );
}
