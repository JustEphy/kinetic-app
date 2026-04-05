// Theme definitions for KINETIC
// Each theme has a complete color palette from the design system

export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    // Primary colors
    primary: string;
    primaryDim: string;
    primaryContainer: string;
    onPrimary: string;
    
    // Secondary colors
    secondary: string;
    secondaryDim: string;
    secondaryContainer: string;
    onSecondary: string;
    
    // Tertiary colors
    tertiary: string;
    tertiaryDim: string;
    tertiaryContainer: string;
    onTertiary: string;
    
    // Surface colors
    background: string;
    surface: string;
    surfaceDim: string;
    surfaceBright: string;
    surfaceContainerLowest: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    surfaceVariant: string;
    
    // On colors
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;
    
    // Error
    error: string;
    errorDim: string;
    errorContainer: string;
    onError: string;
    
    // Outline
    outline: string;
    outlineVariant: string;
    
    // Inverse
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    
    // Accent for gradients
    gradientStart: string;
    gradientEnd: string;
  };
  preview: string[]; // 3 colors for preview dots
}

export const themes: Record<string, Theme> = {
  // Kinetic Volt - "High-Stakes Physics" theme
  // Maximum visibility and high-energy impact
  'kinetic-volt': {
    id: 'kinetic-volt',
    name: 'Kinetic Volt',
    description: 'High-energy lime for maximum visibility',
    isDark: true,
    colors: {
      primary: '#D1FF00',           // Kinetic Lime
      primaryDim: '#a8cc00',
      primaryContainer: '#3d4d00',
      onPrimary: '#000000',
      
      secondary: '#D1FF00',         // Matches Primary
      secondaryDim: '#a8cc00',
      secondaryContainer: '#3d4d00',
      onSecondary: '#000000',
      
      tertiary: '#D1FF00',
      tertiaryDim: '#a8cc00',
      tertiaryContainer: '#3d4d00',
      onTertiary: '#000000',
      
      background: '#0E0E0E',        // Deep Onyx
      surface: '#0E0E0E',
      surfaceDim: '#0a0a0a',
      surfaceBright: '#1a1a1a',
      surfaceContainerLowest: '#000000',
      surfaceContainerLow: '#0E0E0E',
      surfaceContainer: '#131313',   // Stone Grey
      surfaceContainerHigh: '#1a1a1a',
      surfaceContainerHighest: '#222222',
      surfaceVariant: '#1a1a1a',
      
      onBackground: '#FFFFFF',       // Pure White
      onSurface: '#FFFFFF',
      onSurfaceVariant: '#ADAAAA',   // Muted Silver
      
      error: '#ff6b6b',
      errorDim: '#cc5555',
      errorContainer: '#4d0000',
      onError: '#ffffff',
      
      outline: '#555555',
      outlineVariant: '#333333',
      
      inverseSurface: '#FFFFFF',
      inverseOnSurface: '#0E0E0E',
      inversePrimary: '#6b8500',
      
      gradientStart: '#D1FF00',
      gradientEnd: '#a8cc00',
    },
    preview: ['#0E0E0E', '#D1FF00', '#FFFFFF'],
  },

  // Midnight Cyber - "The Neon Kinetic"
  // High-performance futuristic engine aesthetic
  'midnight-cyber': {
    id: 'midnight-cyber',
    name: 'Midnight Cyber',
    description: 'Neon magenta and cyber cyan on midnight void',
    isDark: true,
    colors: {
      primary: '#FF007A',           // Neon Magenta
      primaryDim: '#cc0062',
      primaryContainer: '#4d0025',
      onPrimary: '#ffffff',
      
      secondary: '#00E5FF',         // Cyber Cyan
      secondaryDim: '#00b8cc',
      secondaryContainer: '#004d55',
      onSecondary: '#000000',
      
      tertiary: '#FF007A',
      tertiaryDim: '#cc0062',
      tertiaryContainer: '#4d0025',
      onTertiary: '#ffffff',
      
      background: '#05070A',        // Midnight Void
      surface: '#05070A',
      surfaceDim: '#020304',
      surfaceBright: '#1a1d22',
      surfaceContainerLowest: '#000000',
      surfaceContainerLow: '#0a0c10',
      surfaceContainer: '#111417',   // Deep Slate
      surfaceContainerHigh: '#181b1f',
      surfaceContainerHighest: '#1f2227',
      surfaceVariant: '#1a1d22',
      
      onBackground: '#FFFFFF',       // Pure White
      onSurface: '#FFFFFF',
      onSurfaceVariant: '#64748B',   // Slate Grey
      
      error: '#ff4466',
      errorDim: '#cc3652',
      errorContainer: '#4d141f',
      onError: '#ffffff',
      
      outline: '#64748B',
      outlineVariant: '#334155',
      
      inverseSurface: '#FFFFFF',
      inverseOnSurface: '#05070A',
      inversePrimary: '#99004a',
      
      gradientStart: '#FF007A',
      gradientEnd: '#00E5FF',
    },
    preview: ['#05070A', '#FF007A', '#00E5FF'],
  },

  // Solar Flare - "The Kinetic Pulse"
  // High-end editorial light mode
  'solar-flare': {
    id: 'solar-flare',
    name: 'Solar Flare',
    description: 'Warm editorial light mode with solar orange',
    isDark: false,
    colors: {
      primary: '#FF5C00',           // Solar Orange
      primaryDim: '#cc4a00',
      primaryContainer: '#ffe0cc',
      onPrimary: '#ffffff',
      
      secondary: '#A33800',         // Shadow tone
      secondaryDim: '#802c00',
      secondaryContainer: '#ffccb3',
      onSecondary: '#ffffff',
      
      tertiary: '#FF5C00',
      tertiaryDim: '#cc4a00',
      tertiaryContainer: '#ffe0cc',
      onTertiary: '#ffffff',
      
      background: '#FAFAF9',        // Stone Light
      surface: '#FAFAF9',
      surfaceDim: '#e7e5e4',
      surfaceBright: '#ffffff',
      surfaceContainerLowest: '#ffffff',
      surfaceContainerLow: '#F5F5F4', // Stone 100
      surfaceContainer: '#f0efed',
      surfaceContainerHigh: '#e7e5e4',
      surfaceContainerHighest: '#d6d3d1',
      surfaceVariant: '#f0efed',
      
      onBackground: '#1C1917',       // Stone 900
      onSurface: '#1C1917',
      onSurfaceVariant: '#78716C',   // Stone 500
      
      error: '#dc2626',
      errorDim: '#b91c1c',
      errorContainer: '#fecaca',
      onError: '#ffffff',
      
      outline: '#a8a29e',
      outlineVariant: '#d6d3d1',
      
      inverseSurface: '#1C1917',
      inverseOnSurface: '#FAFAF9',
      inversePrimary: '#ff8533',
      
      gradientStart: '#FF5C00',
      gradientEnd: '#ff8533',
    },
    preview: ['#FAFAF9', '#FF5C00', '#1C1917'],
  },

  // Monochrome Pro - "The Clinical Architect"
  // Precision-focused, distraction-free environment
  'monochrome-pro': {
    id: 'monochrome-pro',
    name: 'Monochrome Pro',
    description: 'Maximum contrast for elite focus',
    isDark: true,
    colors: {
      primary: '#FFFFFF',           // High-Contrast White
      primaryDim: '#cccccc',
      primaryContainer: '#333333',
      onPrimary: '#000000',
      
      secondary: '#FFFFFF',
      secondaryDim: '#cccccc',
      secondaryContainer: '#333333',
      onSecondary: '#000000',
      
      tertiary: '#FFFFFF',
      tertiaryDim: '#cccccc',
      tertiaryContainer: '#333333',
      onTertiary: '#000000',
      
      background: '#000000',        // Absolute Black
      surface: '#000000',
      surfaceDim: '#000000',
      surfaceBright: '#262626',
      surfaceContainerLowest: '#000000',
      surfaceContainerLow: '#0d0d0d',
      surfaceContainer: '#1A1A1A',   // Operator Grey
      surfaceContainerHigh: '#262626',
      surfaceContainerHighest: '#333333',
      surfaceVariant: '#1A1A1A',
      
      onBackground: '#FFFFFF',       // Pure White
      onSurface: '#FFFFFF',
      onSurfaceVariant: '#888888',   // Mid-Grey
      
      error: '#ff4444',
      errorDim: '#cc3333',
      errorContainer: '#4d0000',
      onError: '#ffffff',
      
      outline: '#555555',
      outlineVariant: '#333333',
      
      inverseSurface: '#FFFFFF',
      inverseOnSurface: '#000000',
      inversePrimary: '#666666',
      
      gradientStart: '#FFFFFF',
      gradientEnd: '#888888',
    },
    preview: ['#000000', '#FFFFFF', '#888888'],
  },
};

export const themeList = Object.values(themes);

export function applyTheme(themeId: string): void {
  const theme = themes[themeId];
  if (!theme) return;
  
  const root = document.documentElement;
  const colors = theme.colors;
  
  // Apply all CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-dim', colors.primaryDim);
  root.style.setProperty('--color-primary-container', colors.primaryContainer);
  root.style.setProperty('--color-on-primary', colors.onPrimary);
  
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-dim', colors.secondaryDim);
  root.style.setProperty('--color-secondary-container', colors.secondaryContainer);
  root.style.setProperty('--color-on-secondary', colors.onSecondary);
  
  root.style.setProperty('--color-tertiary', colors.tertiary);
  root.style.setProperty('--color-tertiary-dim', colors.tertiaryDim);
  root.style.setProperty('--color-tertiary-container', colors.tertiaryContainer);
  root.style.setProperty('--color-on-tertiary', colors.onTertiary);
  
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-dim', colors.surfaceDim);
  root.style.setProperty('--color-surface-bright', colors.surfaceBright);
  root.style.setProperty('--color-surface-container-lowest', colors.surfaceContainerLowest);
  root.style.setProperty('--color-surface-container-low', colors.surfaceContainerLow);
  root.style.setProperty('--color-surface-container', colors.surfaceContainer);
  root.style.setProperty('--color-surface-container-high', colors.surfaceContainerHigh);
  root.style.setProperty('--color-surface-container-highest', colors.surfaceContainerHighest);
  root.style.setProperty('--color-surface-variant', colors.surfaceVariant);
  
  root.style.setProperty('--color-on-background', colors.onBackground);
  root.style.setProperty('--color-on-surface', colors.onSurface);
  root.style.setProperty('--color-on-surface-variant', colors.onSurfaceVariant);
  
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-error-dim', colors.errorDim);
  root.style.setProperty('--color-error-container', colors.errorContainer);
  root.style.setProperty('--color-on-error', colors.onError);
  
  root.style.setProperty('--color-outline', colors.outline);
  root.style.setProperty('--color-outline-variant', colors.outlineVariant);
  
  root.style.setProperty('--color-inverse-surface', colors.inverseSurface);
  root.style.setProperty('--color-inverse-on-surface', colors.inverseOnSurface);
  root.style.setProperty('--color-inverse-primary', colors.inversePrimary);
  
  root.style.setProperty('--gradient-start', colors.gradientStart);
  root.style.setProperty('--gradient-end', colors.gradientEnd);
  
  // Update body background
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.onSurface;
}
