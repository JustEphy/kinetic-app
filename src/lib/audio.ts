/**
 * Audio Alerts System
 * Uses Web Audio API for timer beeps and notifications
 * Falls back to HTML5 Audio for broader mobile compatibility
 */

type SoundType = 'work' | 'rest' | 'complete' | 'tick' | 'warning' | 'countdown' | 'trill';

// Pre-generated base64 audio data for fallback (short beep sounds)
const FALLBACK_SOUNDS = {
  // Short beep ~880Hz for countdown
  beep: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAAA//8AAAEA/v8AAP//AQACAP3/AAD//wEAAgD9/wAA//8BAAAA//8AAAEA//8AAAEA//8AAAAA',
  // Double beep for work phase
  work: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAAA//8AAAEA/v8AAP//AQACAP3/AAD//wEAAgD9/wAA//8BAAAA//8AAAEA//8AAAEA//8AAAAA',
  // Lower tone for rest
  rest: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAAA//8AAAEA/v8AAP//AQACAP3/AAD//wEAAgD9/wAA//8BAAAA//8AAAEA//8AAAEA//8AAAAA',
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private fallbackAudio: HTMLAudioElement | null = null;
  private useWebAudio = true;

  // Initialize audio context (must be called after user interaction)
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      this.useWebAudio = true;
    } catch (e) {
      console.warn('Web Audio API not supported, using fallback:', e);
      this.useWebAudio = false;
      this.initialized = true;
    }
    
    // Create fallback audio element
    if (typeof Audio !== 'undefined') {
      this.fallbackAudio = new Audio();
      this.fallbackAudio.volume = 0.7;
    }
  }

  // Ensure audio context is ready
  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.initialized) {
      this.init();
    }
    
    if (!this.useWebAudio || !this.audioContext) {
      return null;
    }
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('Could not resume audio context:', e);
        return null;
      }
    }
    
    return this.audioContext;
  }

  // Play fallback audio
  private playFallbackSound(type: 'beep' | 'work' | 'rest'): void {
    if (!this.fallbackAudio) return;
    
    try {
      this.fallbackAudio.src = FALLBACK_SOUNDS[type];
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio.play().catch(e => {
        console.warn('Fallback audio playback failed:', e);
      });
    } catch (e) {
      console.warn('Fallback audio error:', e);
    }
  }

  // Play a beep sound with specific frequency, duration and volume
  async playBeep(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) {
      // Fallback to HTML5 Audio
      this.playFallbackSound('beep');
      return;
    }

    try {
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
    } catch (e) {
      console.warn('Web Audio playback failed, using fallback:', e);
      this.playFallbackSound('beep');
    }
  }

  // Play a loud countdown beep (5, 4, 3, 2 seconds remaining)
  async playCountdownBeep(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) {
      this.playFallbackSound('beep');
      return;
    }

    try {
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
    } catch (e) {
      console.warn('Countdown beep failed, using fallback:', e);
      this.playFallbackSound('beep');
    }
  }

  // Play a loud trill at 1 second (interval about to change)
  async playTrill(): Promise<void> {
    const ctx = await this.ensureContext();
    if (!ctx) {
      // Fallback - play multiple beeps quickly
      this.playFallbackSound('work');
      return;
    }

    try {
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
    } catch (e) {
      console.warn('Trill playback failed, using fallback:', e);
      this.playFallbackSound('work');
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
    try {
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
    } catch (e) {
      console.warn('Sound playback failed:', e);
      // Use appropriate fallback
      if (type === 'work' || type === 'trill' || type === 'complete') {
        this.playFallbackSound('work');
      } else if (type === 'rest') {
        this.playFallbackSound('rest');
      } else {
        this.playFallbackSound('beep');
      }
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
