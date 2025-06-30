import { logError } from '../lib/utils/errorLogger';

// Check if navigation is in progress
let isNavigating = false;

// Set a timeout to automatically reset navigation state
let navigationResetTimeout: NodeJS.Timeout | null = null;

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
    console.log('Navigation started');
    
    // Clear any existing timeout
    if (navigationResetTimeout) {
      clearTimeout(navigationResetTimeout);
    }
    
    // Set a timeout to reset navigation state in case of failure
    navigationResetTimeout = setTimeout(() => {
      console.log('Navigation timeout reached, resetting state');
      isNavigating = false;
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
    
    return false;
  }
};

/**
 * Check if the current navigation state is active
 * @returns Boolean indicating if navigation is in progress
 */
export const isNavigationInProgress = (): boolean => {
  return isNavigating;
};

/**
 * Force reset the navigation state (for use in error recovery)
 */
export const resetNavigationState = (): void => {
  isNavigating = false;
  
  // Clear any existing timeout
  if (navigationResetTimeout) {
    clearTimeout(navigationResetTimeout);
    navigationResetTimeout = null;
  }
  
  console.log('Navigation state forcibly reset');
};

/**
 * Save the current navigation path to localStorage
 * @param path The current navigation path
 */
export const saveNavigationPath = (path: string): void => {
  try {
    localStorage.setItem('neuropul_current_path', path);
    localStorage.setItem('neuropul_last_navigation', new Date().toISOString());
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