'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { themeList } from '@/lib/themes';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { settings, updateSettings } = useAuth();
  const { themeId, setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);

  // Auto-save settings when they change (except theme which is handled separately)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateSettings(localSettings);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localSettings, updateSettings]);

  const handleToggle = (key: keyof typeof localSettings) => {
    if (typeof localSettings[key] === 'boolean') {
      setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSelect = (key: keyof typeof localSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (newThemeId: string) => {
    setTheme(newThemeId);
    setLocalSettings(prev => ({ ...prev, theme: newThemeId }));
  };

  return (
    <div className="pb-16 px-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-secondary font-label uppercase tracking-widest text-sm mb-2">
              Configuration
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              SETTINGS
            </h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Theme Selection - Bento Style */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Interface Visuals</h2>
            <span className="text-secondary text-sm font-medium tracking-widest uppercase">Select Engine Skin</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeList.map(theme => (
              <button
                key={theme.id}
                className={`group relative overflow-hidden rounded-lg p-1 transition-all ${
                  themeId === theme.id
                    ? 'bg-surface-container-high ring-2 ring-primary'
                    : 'bg-surface-container hover:bg-surface-container-high'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                {/* Preview gradient */}
                <div className="aspect-video rounded-md overflow-hidden relative">
                  <div 
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surfaceContainer} 50%, ${theme.colors.primary} 100%)` 
                    }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: `linear-gradient(to top, ${theme.colors.surfaceContainer}, transparent)` 
                    }}
                  />
                  {themeId === theme.id && (
                    <div 
                      className="absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter"
                      style={{ backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }}
                    >
                      Active
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{theme.name}</h3>
                    <div className="flex gap-1">
                      {theme.preview.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant text-left">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Performance Prefs */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-lg p-8 space-y-8 border-r-4 border-primary">
            <h2 className="text-xl font-bold tracking-tight">Performance Prefs</h2>
            <div className="space-y-6">
              {/* Audio Cues */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">volume_up</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Audio Cues</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Voice Guidance</p>
                  </div>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors active:scale-95 ${
                    localSettings.soundEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                  onClick={() => handleToggle('soundEnabled')}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                      localSettings.soundEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">vibration</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Haptic Feedback</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Tactile Alerts</p>
                  </div>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors active:scale-95 ${
                    localSettings.hapticEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                  onClick={() => handleToggle('hapticEnabled')}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                      localSettings.hapticEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Screen Always-On */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">light_mode</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Screen Always-On</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Display Timeout</p>
                  </div>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors active:scale-95 ${
                    localSettings.keepScreenOn ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                  onClick={() => handleToggle('keepScreenOn')}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                      localSettings.keepScreenOn ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Unit Selection */}
            <div className="pt-4 border-t border-outline-variant/30">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">Measurement Units</p>
              <div className="flex p-1 bg-surface-container-highest rounded-full">
                <button
                  className={`flex-1 py-2 rounded-full text-xs font-black transition-colors ${
                    localSettings.units === 'metric' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => handleSelect('units', 'metric')}
                >
                  METRIC
                </button>
                <button
                  className={`flex-1 py-2 rounded-full text-xs font-black transition-colors ${
                    localSettings.units === 'imperial' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => handleSelect('units', 'imperial')}
                >
                  IMPERIAL
                </button>
              </div>
              <p className="mt-2 text-[10px] text-on-surface-variant italic">
                Using {localSettings.units === 'metric' ? 'KG, CM, and KM' : 'LBS, IN, and MI'} for tracking.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-surface-container p-6 rounded-lg border border-error-container/20">
            <h3 className="text-error text-xs font-black uppercase tracking-widest mb-4">Account Integrity</h3>
            <button 
              className="w-full py-3 rounded-full border border-error text-error text-xs font-bold hover:bg-error/10 transition-all flex items-center justify-center gap-2"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Clear All Data
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}