import { UserProgress } from '../../types';
import { logError } from './errorLogger';

const STORAGE_KEY = 'neuropul_user_progress';
const BACKUP_KEY = 'neuropul_user_progress_backup';

export const useStorage = () => {
  const saveProgress = (progress: UserProgress): void => {
    try {
      // Validate progress data
      if (!progress.name || !progress.archetype) {
        console.error('❌ Invalid progress data:', progress);
        logError('Invalid progress data: missing name or archetype', {
          component: 'storage',
          action: 'saveProgress',
          additionalData: { progress }
        });
        throw new Error('Invalid progress data: missing name or archetype');
      }
      
      // Create backup of current data
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        localStorage.setItem(BACKUP_KEY, existing);
      }
      
      // Save new progress
      const progressWithTimestamp = {
        ...progress,
        lastActive: new Date().toISOString(),
        version: '1.0.0'
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressWithTimestamp));
      console.log('✅ Progress saved successfully:', progressWithTimestamp);
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      logError(error, {
        component: 'storage',
        action: 'saveProgress'
      });
      throw error;
    }
  };

  const loadProgress = (): UserProgress | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        
        // Validate loaded data
        if (!progress.name || !progress.archetype) {
          console.warn('⚠️ Invalid saved data, attempting backup restore');
          return loadBackup();
        }
        
        console.log('✅ Progress loaded successfully:', progress);
        return progress;
      }
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
      logError(error, {
        component: 'storage',
        action: 'loadProgress'
      });
      return loadBackup();
    }
    return null;
  };

  const loadBackup = (): UserProgress | null => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const progress = JSON.parse(backup);
        console.log('🔄 Backup progress restored:', progress);
        return progress;
      }
    } catch (error) {
      console.error('❌ Failed to load backup:', error);
      logError(error, {
        component: 'storage',
        action: 'loadBackup'
      });
    }
    return null;
  };

  const clearProgress = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BACKUP_KEY);
      localStorage.removeItem('neuropul_awakening_completed');
      localStorage.removeItem('neuropul_pdf_generated');
      localStorage.removeItem('neuropul_current_screen'); // CRITICAL FIX: Also clear current screen
      console.log('🗑️ All progress cleared');
    } catch (error) {
      console.error('❌ Failed to clear progress:', error);
      logError(error, {
        component: 'storage',
        action: 'clearProgress'
      });
    }
  };

  const addXP = (amount: number): UserProgress | null => {
    try {
      // Validate amount
      if (typeof amount !== 'number' || amount <= 0) {
        console.warn('⚠️ Invalid XP amount:', amount);
        return null;
      }
      
      const current = loadProgress();
      if (current) {
        // Apply daily XP cap
        const today = new Date().toISOString().split('T')[0];
        const dailyXPKey = `neuropul_daily_xp_${today}`;
        const dailyXP = parseInt(localStorage.getItem(dailyXPKey) || '0', 10);
        
        // Cap at 250 XP per day, with 50% reduction after 150 XP
        let adjustedAmount = amount;
        if (dailyXP >= 250) {
          console.warn('⚠️ Daily XP cap reached, no XP awarded');
          return current;
        } else if (dailyXP >= 150) {
          adjustedAmount = Math.floor(amount * 0.5);
          console.log(`⚠️ Daily soft cap reached, reducing XP from ${amount} to ${adjustedAmount}`);
        }
        
        if (dailyXP + adjustedAmount > 250) {
          adjustedAmount = 250 - dailyXP;
          console.log(`⚠️ Adjusting XP to stay within daily cap: ${adjustedAmount}`);
        }
        
        // Update daily XP counter
        localStorage.setItem(dailyXPKey, (dailyXP + adjustedAmount).toString());
        
        const updated = {
          ...current,
          xp: current.xp + adjustedAmount,
          level: Math.floor((current.xp + adjustedAmount) / 100) + 1,
          lastActive: new Date().toISOString()
        };
        saveProgress(updated);
        return updated;
      }
    } catch (error) {
      console.error('❌ Failed to add XP:', error);
      logError(error, {
        component: 'storage',
        action: 'addXP',
        additionalData: { amount }
      });
    }
    return null;
  };

  const validateProgress = (progress: any): boolean => {
    if (!progress) return false;
    
    try {
      // Basic structure validation
      const requiredFields = ['name', 'archetype', 'xp', 'level', 'awakened'];
      for (const field of requiredFields) {
        if (progress[field] === undefined) {
          console.warn(`⚠️ Missing required field in progress: ${field}`);
          return false;
        }
      }
      
      // Type validation
      if (typeof progress.name !== 'string' || 
          typeof progress.archetype !== 'string' || 
          typeof progress.xp !== 'number' || 
          typeof progress.level !== 'number' || 
          typeof progress.awakened !== 'boolean') {
        console.warn('⚠️ Invalid field types in progress');
        return false;
      }
      
      // Value validation
      if (progress.name.trim().length === 0 || 
          progress.archetype.trim().length === 0 || 
          progress.xp < 0 || 
          progress.level < 1) {
        console.warn('⚠️ Invalid field values in progress');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validating progress:', error);
      logError(error, {
        component: 'storage',
        action: 'validateProgress'
      });
      return false;
    }
  };

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    addXP,
    validateProgress
  };
};