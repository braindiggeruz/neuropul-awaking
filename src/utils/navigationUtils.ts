import { logError } from '../lib/utils/errorLogger';

// Global navigation state control
let _isNavigating = false;
let _navigationTimeoutId: NodeJS.Timeout | null = null;

/**
 * Safely navigate to a new screen with protection against multiple calls
 * @param navigateFn The navigation function (usually from useNavigate())
 * @param path The path to navigate to
 * @param options Navigation options
 */
export const navigateSafely = (
  navigateFn: (path: string, options?: any) => void,
  path: string,
  options?: any
): void => {
  try {
    // If already navigating, prevent multiple calls
    if (_isNavigating) {
      console.log('[Navigation] Already in progress, ignoring');
      return;
    }
    
    // Set navigating state
    _isNavigating = true;
    console.log(`[Navigation] Navigating to ${path}`);
    
    // Clear any existing timeout
    if (_navigationTimeoutId) {
      clearTimeout(_navigationTimeoutId);
    }
    
    // Execute the navigation
    navigateFn(path, options);
    
    // Set a timeout to reset navigation state
    _navigationTimeoutId = setTimeout(() => {
      console.log('[Navigation] Reset navigation state');
      _isNavigating = false;
      _navigationTimeoutId = null;
    }, 500);
  } catch (error) {
    console.error('[Navigation] Error:', error);
    logError(error, {
      component: 'navigationUtils',
      action: 'navigateSafely'
    });
    
    // Reset navigation state
    _isNavigating = false;
    
    // Clear the timeout
    if (_navigationTimeoutId) {
      clearTimeout(_navigationTimeoutId);
      _navigationTimeoutId = null;
    }
  }
};

/**
 * Debounce function to prevent multiple rapid calls
 * @param func The function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  } as T;
}

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
    _isNavigating = false;
    if (_navigationTimeoutId) {
      clearTimeout(_navigationTimeoutId);
      _navigationTimeoutId = null;
    }
    
    // Navigate to home
    window.location.href = '/';
  } catch (error) {
    console.error('[Navigation] Emergency reset failed:', error);
    window.location.reload();
  }
};