import { logError } from '../lib/utils/errorLogger';
import { isCi } from 'ci-info';

// Check if navigation is in progress
let isNavigating = false;

// Set a timeout to automatically reset navigation state
let navigationResetTimeout: NodeJS.Timeout | null = null;

// Track navigation attempts
let navigationAttempts = 0;
const MAX_NAVIGATION_ATTEMPTS = 3;

/**
 * Safely navigate to a new screen with debouncing to prevent multiple clicks
 * @param callback The navigation callback function
 * @param delay Delay in milliseconds before allowing another navigation
 * @returns A boolean indicating if navigation was initiated
 */
export const safeNavigate = async (
  callback: () => void | Promise<void>,
  delay = 500
): Promise<boolean> => {
  try {
    // If already navigating, prevent multiple clicks
    if (isNavigating) {
      console.log('Navigation already in progress, ignoring');
      return false;
    }
    
    // Set navigating state
    isNavigating = true;
    navigationAttempts++;
    console.log(`Navigation started (attempt ${navigationAttempts}/${MAX_NAVIGATION_ATTEMPTS})`);
    
    // Set a flag in localStorage to indicate navigation is in progress
    localStorage.setItem('neuropul_navigation_in_progress', 'true');
    
    // Clear any existing timeout
    if (navigationResetTimeout) {
      clearTimeout(navigationResetTimeout);
    }
    
    // Set a timeout to reset navigation state in case of failure
    navigationResetTimeout = setTimeout(() => {
      console.log('Navigation timeout reached, resetting state');
      isNavigating = false;
      localStorage.removeItem('neuropul_navigation_in_progress');
    }, 5000); // 5 second safety timeout
    
    // Execute the navigation callback
    await callback();
    
    // Set a timeout before allowing another navigation
    setTimeout(() => {
      console.log('Navigation cooldown complete');
      isNavigating = false;
      
      // Clear the safety timeout
      if (navigationResetTimeout) {
        clearTimeout(navigationResetTimeout);
        navigationResetTimeout = null;
      }
      
      // Clear the navigation flag
      localStorage.removeItem('neuropul_navigation_in_progress');
    }, delay);
    
    return true;
  } catch (error) {
    console.error('Navigation error:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'safeNavigate'
    });
    
    // Reset navigation state
    isNavigating = false;
    
    // Clear the safety timeout
    if (navigationResetTimeout) {
      clearTimeout(navigationResetTimeout);
      navigationResetTimeout = null;
    }
    
    // Clear the navigation flag
    localStorage.removeItem('neuropul_navigation_in_progress');
    
    // If we've tried too many times, use direct location change
    if (navigationAttempts >= MAX_NAVIGATION_ATTEMPTS) {
      console.log('Too many navigation attempts, using direct location change');
      window.location.href = '/';
    }
    
    return false;
  }
};

/**
 * Check if the current navigation state is active
 * @returns Boolean indicating if navigation is in progress
 */
export const isNavigationInProgress = (): boolean => {
  return isNavigating || localStorage.getItem('neuropul_navigation_in_progress') === 'true';
};

/**
 * Force reset the navigation state (for use in error recovery)
 */
export const resetNavigationState = (): void => {
  isNavigating = false;
  navigationAttempts = 0;
  
  // Clear any existing timeout
  if (navigationResetTimeout) {
    clearTimeout(navigationResetTimeout);
    navigationResetTimeout = null;
  }
  
  // Clear the navigation flag
  localStorage.removeItem('neuropul_navigation_in_progress');
  
  console.log('Navigation state forcibly reset');
};

/**
 * Save the current navigation path to localStorage
 * @param path The current navigation path
 */
export const saveNavigationPath = (path: string): void => {
  try {
    // Don't save 'portal' as a path to prevent loops
    if (path !== 'portal') {
      localStorage.setItem('neuropul_current_path', path);
      localStorage.setItem('neuropul_last_navigation', new Date().toISOString());
    } else {
      console.log('Not saving portal path to prevent navigation loops');
    }
  } catch (error) {
    console.error('Error saving navigation path:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'saveNavigationPath'
    });
  }
};

/**
 * Get the last saved navigation path from localStorage
 * @returns The last saved path or null if none exists
 */
export const getLastNavigationPath = (): string | null => {
  try {
    return localStorage.getItem('neuropul_current_path');
  } catch (error) {
    console.error('Error getting last navigation path:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'getLastNavigationPath'
    });
    return null;
  }
};

/**
 * Force navigation to a specific path using window.location
 * This is more reliable than React Router's navigate in some cases
 * @param path The path to navigate to
 */
export const forceNavigate = (path: string): void => {
  try {
    console.log(`Force navigating to: ${path}`);
    
    // Clear navigation state
    resetNavigationState();
    
    // Clear portal screen from localStorage
    localStorage.removeItem('neuropul_current_screen');
    
    // Use window.location for more reliable navigation
    window.location.href = path;
  } catch (error) {
    console.error('Error in force navigation:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'forceNavigate'
    });
    
    // Last resort - reload the page
    window.location.reload();
  }
};

/**
 * Emergency system reset - clears all state and navigates to home
 * Use this as a last resort when navigation is completely stuck
 */
export const emergencyReset = (): void => {
  try {
    console.log('🚨 EMERGENCY SYSTEM RESET INITIATED');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Force navigation to home
    window.location.href = '/';
  } catch (error) {
    console.error('Error in emergency reset:', error);
    
    // If even this fails, reload the page
    window.location.reload();
  }
};

// Add a global emergency reset function for debugging
if (!isCi && typeof window !== 'undefined') {
  (window as any).emergencyReset = emergencyReset;
}