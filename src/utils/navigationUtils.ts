import { logError } from '../lib/utils/errorLogger';

// Check if navigation is in progress
let isNavigating = false;

// Set a timeout to automatically reset navigation state
let navigationResetTimeout: NodeJS.Timeout | null = null;

// Track navigation attempts
let navigationAttempts = 0;
const MAX_NAVIGATION_ATTEMPTS = 3;

/**
 * Debounce function to prevent multiple rapid calls
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: any[]) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  } as T;
}

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
      console.log('[Navigation] Already in progress, ignoring');
      return false;
    }
    
    // Track attempts
    navigationAttempts++;
    
    // If too many attempts, use direct location change
    if (navigationAttempts > MAX_NAVIGATION_ATTEMPTS) {
      console.log('[Navigation] Too many attempts, using direct location change');
      window.location.href = '/';
      return true;
    }
    
    // Set navigating state
    isNavigating = true;
    console.log('[Navigation] Started');
    
    // Clear any existing timeout
    if (navigationResetTimeout) {
      clearTimeout(navigationResetTimeout);
    }
    
    // Set a timeout to reset navigation state in case of failure
    navigationResetTimeout = setTimeout(() => {
      console.log('[Navigation] Timeout reached, resetting state');
      isNavigating = false;
    }, 5000); // 5 second safety timeout
    
    // Execute the navigation callback
    await callback();
    
    // Set a timeout before allowing another navigation
    setTimeout(() => {
      console.log('[Navigation] Cooldown complete');
      isNavigating = false;
      
      // Clear the safety timeout
      if (navigationResetTimeout) {
        clearTimeout(navigationResetTimeout);
        navigationResetTimeout = null;
      }
    }, delay);
    
    return true;
  } catch (error) {
    console.error('[Navigation] Error:', error);
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
  navigationAttempts = 0;
  
  // Clear any existing timeout
  if (navigationResetTimeout) {
    clearTimeout(navigationResetTimeout);
    navigationResetTimeout = null;
  }
  
  console.log('[Navigation] State forcibly reset');
};

/**
 * Force navigation to a specific path
 * @param path The path to navigate to
 */
export const forceNavigate = (path: string): void => {
  try {
    console.log(`[Navigation] Force navigating to ${path}`);
    
    // Clear any portal state
    localStorage.removeItem('neuropul_current_screen');
    sessionStorage.removeItem('neuropul_current_screen');
    localStorage.removeItem('neuropul_portal_state');
    localStorage.removeItem('neuropul_navigation_in_progress');
    localStorage.removeItem('hasPassedPortal');
    
    // If too many attempts, use direct location change
    if (navigationAttempts > MAX_NAVIGATION_ATTEMPTS) {
      console.log('[Navigation] Too many attempts, using direct location change');
      window.location.href = path;
      return;
    }
    
    // Use window.location for reliable navigation
    window.location.href = path;
  } catch (error) {
    console.error('[Navigation] Force navigation failed:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'forceNavigate'
    });
    
    // Last resort - direct location change
    window.location.href = path;
  }
};

/**
 * Emergency system reset and navigation
 */
export const emergencyReset = (): void => {
  try {
    console.log('🧠 SYSTEM CLEAR INITIATED');
    
    // Clear all localStorage items
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset navigation state
    resetNavigationState();
    
    // Navigate to home
    window.location.href = '/';
  } catch (error) {
    console.error('[Navigation] Emergency reset failed:', error);
    window.location.reload();
  }
};