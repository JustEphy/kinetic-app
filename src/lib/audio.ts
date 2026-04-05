/**
 * Audio Alerts System
 * Uses Web Audio API for timer beeps and notifications
 */

type SoundType = 'work' | 'rest' | 'complete' | 'tick' | 'warning' | 'countdown' | 'trill';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private initialized = false;

  // Initialize audio context (must be called after user interaction)
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.error('Web Audio API not supported:', e);
    }
  }

  // Ensure audio context is ready
  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.audioContext) {
      this.init();
    }
    
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  // Play a beep sound with specific frequency, duration and volume
  async playBeep(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Envelope for smooth sound - use provided volume
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Play a loud countdown beep (5, 4, 3, 2 seconds remaining)
  async playCountdownBeep(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'square'; // Square wave is louder/sharper

    // LOUD volume for cutting through music
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01); // 80% volume - LOUD
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // Play a loud trill at 1 second (interval about to change)
  async playTrill(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) return;

    // Play a rapid ascending trill
    const frequencies = [880, 1100, 880, 1100, 1320];
    const noteDuration = 0.08;
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequencies[i];
      oscillator.type = 'square';

      const startTime = ctx.currentTime + (i * noteDuration);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.9, startTime + 0.01); // 90% volume - VERY LOUD
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration - 0.01);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    }
  }

  // Play multiple beeps in sequence
  async playBeepSequence(beeps: { frequency: number; duration: number; delay: number; volume?: number }[]): Promise<void> {
    for (const beep of beeps) {
      await this.playBeep(beep.frequency, beep.duration, 'sine', beep.volume || 0.3);
      await new Promise(resolve => setTimeout(resolve, beep.delay));
    }
  }

  // Pre-defined sound effects
  async playSound(type: SoundType): Promise<void> {
    switch (type) {
      case 'countdown':
        // Loud beep for 5, 4, 3, 2 second countdown
        await this.playCountdownBeep();
        break;

      case 'trill':
        // Loud trill for 1 second / interval change
        await this.playTrill();
        break;

      case 'work':
        // High-energy double beep for work phase - LOUD
        await this.playBeepSequence([
          { frequency: 880, duration: 0.15, delay: 100, volume: 0.7 },
          { frequency: 1100, duration: 0.2, delay: 0, volume: 0.7 },
        ]);
        break;

      case 'rest':
        // Calming descending tone for rest phase - LOUD
        await this.playBeepSequence([
          { frequency: 660, duration: 0.2, delay: 150, volume: 0.6 },
          { frequency: 440, duration: 0.3, delay: 0, volume: 0.6 },
        ]);
        break;

      case 'complete':
        // Triumphant completion sound - LOUD
        await this.playBeepSequence([
          { frequency: 523, duration: 0.15, delay: 100, volume: 0.8 },
          { frequency: 659, duration: 0.15, delay: 100, volume: 0.8 },
          { frequency: 784, duration: 0.15, delay: 100, volume: 0.8 },
          { frequency: 1047, duration: 0.4, delay: 0, volume: 0.9 },
        ]);
        break;

      case 'tick':
        // Subtle tick for countdown
        await this.playBeep(800, 0.05, 'square', 0.3);
        break;

      case 'warning':
        // Warning beeps for last few seconds
        await this.playBeepSequence([
          { frequency: 600, duration: 0.1, delay: 100, volume: 0.5 },
          { frequency: 600, duration: 0.1, delay: 100, volume: 0.5 },
          { frequency: 600, duration: 0.1, delay: 0, volume: 0.5 },
        ]);
        break;
    }
  }

  // Countdown beeps (3, 2, 1, GO!)
  async playCountdown(): Promise<void> {
    for (let i = 3; i > 0; i--) {
      await this.playBeep(440, 0.15, 'sine', 0.5);
      await new Promise(resolve => setTimeout(resolve, 850));
    }
    await this.playBeep(880, 0.3, 'sine', 0.7);
  }
}

// Haptic Feedback
export const haptics = {
  // Vibrate if supported
  vibrate(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Short tap
  tap(): void {
    this.vibrate(50);
  },

  // Double tap
  doubleTap(): void {
    this.vibrate([50, 50, 50]);
  },

  // Long vibration
  long(): void {
    this.vibrate(200);
  },

  // Pattern for interval change
  intervalChange(): void {
    this.vibrate([100, 50, 100]);
  },

  // Success pattern
  success(): void {
    this.vibrate([50, 50, 50, 50, 100]);
  },
};

// Export singleton instance
export const audioManager = new AudioManager();

// Combined notification function
export async function notify(
  type: SoundType,
  options: { sound?: boolean; haptic?: boolean } = { sound: true, haptic: true }
): Promise<void> {
  const promises: Promise<void>[] = [];

  if (options.sound) {
    promises.push(audioManager.playSound(type));
  }

  if (options.haptic) {
    switch (type) {
      case 'work':
        haptics.doubleTap();
        break;
      case 'rest':
        haptics.tap();
        break;
      case 'complete':
        haptics.success();
        break;
      case 'tick':
        haptics.tap();
        break;
      case 'warning':
        haptics.intervalChange();
        break;
      case 'countdown':
        haptics.tap();
        break;
      case 'trill':
        haptics.doubleTap();
        break;
    }
  }

  await Promise.all(promises);
}

// Direct haptic trigger for countdown
export function triggerHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
  switch (intensity) {
    case 'light':
      haptics.tap();
      break;
    case 'medium':
      haptics.doubleTap();
      break;
    case 'heavy':
      haptics.long();
      break;
  }
}
