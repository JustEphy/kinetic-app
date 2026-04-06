'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, Theme, applyTheme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'kinetic_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState('kinetic-volt');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && themes[savedTheme]) {
      setThemeId(savedTheme);
      applyThemeColors(savedTheme);
    }
    setMounted(true);
  }, []);

  const applyThemeColors = useCallback((id: string) => {
    const theme = themes[id];
    if (!theme) return;
    
    const root = document.documentElement;
    const colors = theme.colors;
    
    // Apply all CSS custom properties with --theme- prefix
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-dim', colors.primaryDim);
    root.style.setProperty('--theme-primary-container', colors.primaryContainer);
    root.style.setProperty('--theme-on-primary', colors.onPrimary);
    
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-secondary-dim', colors.secondaryDim);
    root.style.setProperty('--theme-secondary-container', colors.secondaryContainer);
    root.style.setProperty('--theme-on-secondary', colors.onSecondary);
    
    root.style.setProperty('--theme-tertiary', colors.tertiary);
    root.style.setProperty('--theme-tertiary-dim', colors.tertiaryDim);
    root.style.setProperty('--theme-tertiary-container', colors.tertiaryContainer);
    root.style.setProperty('--theme-on-tertiary', colors.onTertiary);
    
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-surface-dim', colors.surfaceDim);
    root.style.setProperty('--theme-surface-bright', colors.surfaceBright);
    root.style.setProperty('--theme-surface-container-lowest', colors.surfaceContainerLowest);
    root.style.setProperty('--theme-surface-container-low', colors.surfaceContainerLow);
    root.style.setProperty('--theme-surface-container', colors.surfaceContainer);
    root.style.setProperty('--theme-surface-container-high', colors.surfaceContainerHigh);
    root.style.setProperty('--theme-surface-container-highest', colors.surfaceContainerHighest);
    root.style.setProperty('--theme-surface-variant', colors.surfaceVariant);
    
    root.style.setProperty('--theme-on-background', colors.onBackground);
    root.style.setProperty('--theme-on-surface', colors.onSurface);
    root.style.setProperty('--theme-on-surface-variant', colors.onSurfaceVariant);
    
    root.style.setProperty('--theme-error', colors.error);
    root.style.setProperty('--theme-error-dim', colors.errorDim);
    root.style.setProperty('--theme-error-container', colors.errorContainer);
    root.style.setProperty('--theme-on-error', colors.onError);
    
    root.style.setProperty('--theme-outline', colors.outline);
    root.style.setProperty('--theme-outline-variant', colors.outlineVariant);
    
    root.style.setProperty('--theme-inverse-surface', colors.inverseSurface);
    root.style.setProperty('--theme-inverse-on-surface', colors.inverseOnSurface);
    root.style.setProperty('--theme-inverse-primary', colors.inversePrimary);
    
    root.style.setProperty('--theme-gradient-start', colors.gradientStart);
    root.style.setProperty('--theme-gradient-end', colors.gradientEnd);
  }, []);

  const setTheme = useCallback((id: string) => {
    if (!themes[id]) return;
    
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
    applyThemeColors(id);
  }, [applyThemeColors]);

  const currentTheme = themes[themeId] || themes['kinetic-volt'];

  // Apply theme on initial render
  useEffect(() => {
    if (mounted) {
      applyThemeColors(themeId);
    }
  }, [mounted, themeId, applyThemeColors]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
