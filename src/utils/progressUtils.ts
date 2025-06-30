import { UserProgress } from '../types';
import { logError } from '../lib/utils/errorLogger';

const STORAGE_KEY = 'neuropul_user_progress';
const BACKUP_KEY = 'neuropul_user_progress_backup';

/**
 * Save user progress to localStorage with backup
 * @param progress User progress data to save
 * @returns boolean indicating success
 */
export const saveUserProgress = (progress: UserProgress): boolean => {
  try {
    // Validate progress data
    if (!progress) {
      console.error('Invalid progress data: progress is null or undefined');
      return false;
    }
    
    // Create backup of current data if it exists
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      localStorage.setItem(BACKUP_KEY, existing);
    }
    
    // Add timestamp for last saved
    const progressWithTimestamp = {
      ...progress,
      lastSaved: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressWithTimestamp));
    console.log('Progress saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save progress:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'saveUserProgress'
    });
    return false;
  }
};

/**
 * Load user progress from localStorage
 * @returns UserProgress object or null if not found
 */
export const loadUserProgress = (): UserProgress | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }
    
    const progress = JSON.parse(saved) as UserProgress;
    return progress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'loadUserProgress'
    });
    
    // Try to load from backup
    return loadUserProgressBackup();
  }
};

/**
 * Load user progress from backup
 * @returns UserProgress object or null if not found
 */
export const loadUserProgressBackup = (): UserProgress | null => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) {
      return null;
    }
    
    const progress = JSON.parse(backup) as UserProgress;
    console.log('Loaded progress from backup');
    return progress;
  } catch (error) {
    console.error('Failed to load progress backup:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'loadUserProgressBackup'
    });
    return null;
  }
};

/**
 * Update specific fields in user progress
 * @param updates Partial UserProgress with fields to update
 * @returns boolean indicating success
 */
export const updateUserProgress = (updates: Partial<UserProgress>): boolean => {
  try {
    const currentProgress = loadUserProgress();
    if (!currentProgress) {
      console.error('Cannot update progress: No existing progress found');
      return false;
    }
    
    const updatedProgress = {
      ...currentProgress,
      ...updates,
      lastActive: new Date().toISOString()
    };
    
    return saveUserProgress(updatedProgress);
  } catch (error) {
    console.error('Failed to update progress:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'updateUserProgress'
    });
    return false;
  }
};

/**
 * Add XP to user progress with daily cap
 * @param amount Amount of XP to add
 * @returns Updated UserProgress or null if failed
 */
export const addUserXP = (amount: number): UserProgress | null => {
  try {
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn('Invalid XP amount:', amount);
      return null;
    }
    
    const currentProgress = loadUserProgress();
    if (!currentProgress) {
      console.error('Cannot add XP: No existing progress found');
      return null;
    }
    
    // Apply daily XP cap
    const today = new Date().toISOString().split('T')[0];
    const dailyXPKey = `neuropul_daily_xp_${today}`;
    const dailyXP = parseInt(localStorage.getItem(dailyXPKey) || '0', 10);
    
    // Cap at 250 XP per day, with 50% reduction after 150 XP
    let adjustedAmount = amount;
    if (dailyXP >= 250) {
      console.warn('Daily XP cap reached, no XP awarded');
      return currentProgress;
    } else if (dailyXP >= 150) {
      adjustedAmount = Math.floor(amount * 0.5);
      console.log(`Daily soft cap reached, reducing XP from ${amount} to ${adjustedAmount}`);
    }
    
    if (dailyXP + adjustedAmount > 250) {
      adjustedAmount = 250 - dailyXP;
      console.log(`Adjusting XP to stay within daily cap: ${adjustedAmount}`);
    }
    
    // Update daily XP counter
    localStorage.setItem(dailyXPKey, (dailyXP + adjustedAmount).toString());
    
    // Update user progress
    const updatedProgress = {
      ...currentProgress,
      xp: (currentProgress.xp || 0) + adjustedAmount,
      level: Math.floor(((currentProgress.xp || 0) + adjustedAmount) / 100) + 1,
      lastActive: new Date().toISOString()
    };
    
    if (saveUserProgress(updatedProgress)) {
      return updatedProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to add XP:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'addUserXP'
    });
    return null;
  }
};

/**
 * Clear all user progress data
 * @returns boolean indicating success
 */
export const clearUserProgress = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    
    // Also clear related items
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`neuropul_daily_xp_${today}`);
    localStorage.removeItem('neuropul_awakening_completed');
    localStorage.removeItem('neuropul_pdf_generated');
    
    console.log('User progress cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear progress:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'clearUserProgress'
    });
    return false;
  }
};

/**
 * Check if user has completed awakening
 * @returns boolean indicating if awakening is completed
 */
export const hasCompletedAwakening = (): boolean => {
  try {
    // Check specific flag first
    const awakeningCompleted = localStorage.getItem('neuropul_awakening_completed');
    if (awakeningCompleted === 'true') {
      return true;
    }
    
    // Check user progress as fallback
    const progress = loadUserProgress();
    return progress?.awakened === true;
  } catch (error) {
    console.error('Failed to check awakening status:', error);
    logError(error, {
      component: 'progressUtils',
      action: 'hasCompletedAwakening'
    });
    return false;
  }
};