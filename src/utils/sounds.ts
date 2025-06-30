import { logError } from '../lib/utils/errorLogger';
import { cleanupAudio } from './audioUtils';

// Audio context instance (created lazily)
let audioContext: AudioContext | null = null;

// Initialize audio context
const getAudioContext = (): AudioContext | null => {
  try {
    if (audioContext === null) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      } else {
        return null;
      }
    }
    
    // Resume context if it's suspended (needed for Safari)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    return audioContext;
  } catch (error) {
    return null;
  }
};

export const playSound = (type: 'levelup' | 'success' | 'error' | 'click' | 'hover' | 'xp', enabled: boolean = true) => {
  if (!enabled) return;
  
  try {
    const context = getAudioContext();
    if (!context) return;
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    switch (type) {
      case 'levelup':
        // Мелодичная последовательность для level up
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.50, context.currentTime + 0.3); // C6
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
        break;
        
      case 'success':
        oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
        oscillator.frequency.setValueAtTime(554.37, context.currentTime + 0.1); // C#5
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
        break;
        
      case 'error':
        oscillator.frequency.setValueAtTime(220, context.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, context.currentTime + 0.1); // G3
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.4);
        break;
        
      case 'click':
        // Digital click sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        oscillator.frequency.setValueAtTime(330, context.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
        break;
        
      case 'hover':
        // Subtle hover sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        gainNode.gain.setValueAtTime(0.05, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
        break;
        
      case 'xp':
        // XP gain sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
        break;
    }
  } catch (error) {
    // Silently fail in production
    if (import.meta.env.MODE !== 'production') {
      console.error('Error playing sound:', error);
      logError(error, {
        component: 'sounds',
        action: 'playSound',
        additionalData: { soundType: type }
      });
    }
  }
};

export const vibrate = (pattern: number[], enabled: boolean = true) => {
  if (!enabled) return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Silently fail in production
    if (import.meta.env.MODE !== 'production') {
      console.error('Error triggering vibration:', error);
      logError(error, {
        component: 'sounds',
        action: 'vibrate'
      });
    }
  }
};

// Clean up audio resources
export const cleanupSound = (): void => {
  cleanupAudio();
};

// Check if audio is supported
export const isAudioSupported = (): boolean => {
  return !!getAudioContext();
};

// Check if vibration is supported
export const isVibrationSupported = (): boolean => {
  return !!navigator.vibrate;
};