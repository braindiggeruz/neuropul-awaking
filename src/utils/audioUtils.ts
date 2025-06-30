import { logError } from '../lib/utils/errorLogger';

// Audio context instance (created lazily)
let audioContext: AudioContext | null = null;

// Active audio nodes for cleanup
const activeNodes: { oscillator: OscillatorNode, gain: GainNode }[] = [];

// Initialize audio context
const getAudioContext = (): AudioContext | null => {
  try {
    if (audioContext === null) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      } else {
        console.warn('Web Audio API not supported in this browser');
        return null;
      }
    }
    
    // Resume context if it's suspended (needed for Safari)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.warn('Failed to resume audio context:', err);
      });
    }
    
    return audioContext;
  } catch (error) {
    console.error('Error initializing audio context:', error);
    logError(error, {
      component: 'audioUtils',
      action: 'getAudioContext'
    });
    return null;
  }
};

/**
 * Play a sound effect with error handling and fallbacks
 * @param type The type of sound to play
 * @param enabled Whether sound is enabled
 */
export const playSound = (
  type: 'click' | 'hover' | 'success' | 'error' | 'levelup' | 'xp',
  enabled: boolean = true
): void => {
  if (!enabled) return;
  
  try {
    const context = getAudioContext();
    if (!context) return;
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Track active nodes for cleanup
    activeNodes.push({ oscillator, gain: gainNode });
    
    switch (type) {
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
        
      case 'success':
        // Success sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
        break;
        
      case 'error':
        // Error sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, context.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, context.currentTime + 0.1); // G3
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.4);
        break;
        
      case 'levelup':
        // Level up fanfare
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.50, context.currentTime + 0.3); // C6
        gainNode.gain.setValueAtTime(0.2, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
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
    
    // Remove from active nodes when done
    oscillator.onended = () => {
      const index = activeNodes.findIndex(node => node.oscillator === oscillator);
      if (index !== -1) {
        activeNodes.splice(index, 1);
      }
    };
  } catch (error) {
    // Silently fail in production
    if (import.meta.env.MODE !== 'production') {
      console.error('Error playing sound:', error);
      logError(error, {
        component: 'audioUtils',
        action: 'playSound',
        additionalData: { soundType: type }
      });
    }
  }
};

/**
 * Trigger device vibration with error handling
 * @param pattern Vibration pattern in milliseconds
 * @param enabled Whether vibration is enabled
 */
export const vibrate = (pattern: number[], enabled: boolean = true): void => {
  if (!enabled) return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    } else {
      if (import.meta.env.MODE !== 'production') {
        console.log('Vibration API not supported in this browser');
      }
    }
  } catch (error) {
    // Silently fail in production
    if (import.meta.env.MODE !== 'production') {
      console.error('Error triggering vibration:', error);
      logError(error, {
        component: 'audioUtils',
        action: 'vibrate'
      });
    }
  }
};

/**
 * Check if audio is supported in the current browser
 * @returns Boolean indicating if audio is supported
 */
export const isAudioSupported = (): boolean => {
  return getAudioContext() !== null;
};

/**
 * Check if vibration is supported in the current browser
 * @returns Boolean indicating if vibration is supported
 */
export const isVibrationSupported = (): boolean => {
  return !!navigator.vibrate;
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = (): void => {
  try {
    // Stop all active oscillators
    activeNodes.forEach(node => {
      try {
        if (node.oscillator.frequency) {
          node.oscillator.stop();
        }
        node.gain.disconnect();
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    
    // Clear the array
    activeNodes.length = 0;
    
    // Close audio context if it exists
    if (audioContext) {
      audioContext.close().then(() => {
        audioContext = null;
      }).catch(err => {
        if (import.meta.env.MODE !== 'production') {
          console.error('Error closing audio context:', err);
        }
      });
    }
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      console.error('Error cleaning up audio resources:', error);
    }
    logError(error, {
      component: 'audioUtils',
      action: 'cleanupAudio'
    });
  }
};