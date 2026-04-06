'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresetsModal({ isOpen, onClose }: PresetsModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { workoutPresets } = useAuth();

  const sortedPresets = useMemo(
    () =>
      [...workoutPresets].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [workoutPresets]
  );

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const target = `/workouts?preset=${encodeURIComponent(presetId)}&ts=${Date.now()}`;
    if (pathname.startsWith('/workouts')) {
      router.replace(target);
    } else {
      router.push(target);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-surface-container-low border border-outline-variant/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black tracking-tight">My Presets</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close presets modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {sortedPresets.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl mb-2 block opacity-60">bookmarks</span>
            <p>No saved presets yet. Save one from the Workout Builder.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {sortedPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className="w-full text-left p-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-on-surface font-semibold truncate">{preset.name}</span>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{preset.duration} min</span>
                </div>
                {preset.description && (
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{preset.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
