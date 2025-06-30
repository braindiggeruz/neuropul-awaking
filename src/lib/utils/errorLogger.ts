/**
 * Centralized error logging utility
 * Logs errors to console and optionally to a server endpoint
 */

// Define error levels
export type ErrorLevel = 'ERROR' | 'WARNING' | 'INFO';

// Define error context
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

/**
 * Log an error to the console and optionally to the server
 */
export const logError = async (
  error: Error | string,
  context: ErrorContext = {},
  level: ErrorLevel = 'ERROR',
  sendToServer: boolean = true
): Promise<void> => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? '' : error.stack;
  
  // Format context for logging
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(', ');
  
  // Log to console with appropriate level
  switch (level) {
    case 'ERROR':
      console.error(`🚨 [${level}] ${errorMessage}${contextStr ? ` (${contextStr})` : ''}`);
      if (errorStack) console.error(errorStack);
      break;
    case 'WARNING':
      console.warn(`⚠️ [${level}] ${errorMessage}${contextStr ? ` (${contextStr})` : ''}`);
      break;
    case 'INFO':
      console.info(`ℹ️ [${level}] ${errorMessage}${contextStr ? ` (${contextStr})` : ''}`);
      break;
  }
  
  // Send to server if enabled and not in development mode
  if (sendToServer && import.meta.env.MODE !== 'development') {
    try {
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context.component 
            ? `${context.component}${context.action ? ` - ${context.action}` : ''}`
            : 'Unknown context',
          error_message: errorMessage,
          stack_trace: errorStack || '',
          source: 'client',
          user_id: context.userId || localStorage.getItem('neuropul_user_id') || sessionStorage.getItem('neuropul_session_id'),
          level,
          additional_data: {
            ...context.additionalData,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            sessionId: localStorage.getItem('neuropul_session_id') || sessionStorage.getItem('neuropul_session_id'),
            viewCount: localStorage.getItem('neuropul_view_count'),
            userPath: localStorage.getItem('neuropul_user_path')
          }
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send error to server:', await response.text());
      }
    } catch (serverError) {
      // Don't try to log this error to avoid infinite loops
      console.error('Failed to send error to server:', serverError);
    }
  }
};

/**
 * Create a logger instance for a specific component
 */
export const createLogger = (component: string) => {
  return {
    error: (error: Error | string, action?: string, additionalData?: Record<string, any>, userId?: string) => 
      logError(error, { component, action, additionalData, userId }, 'ERROR'),
    
    warning: (message: string, action?: string, additionalData?: Record<string, any>, userId?: string) => 
      logError(message, { component, action, additionalData, userId }, 'WARNING'),
    
    info: (message: string, action?: string, additionalData?: Record<string, any>, userId?: string) => 
      logError(message, { component, action, additionalData, userId }, 'INFO', false) // Don't send INFO to server by default
  };
};

/**
 * Global error handler for uncaught exceptions
 */
export const setupGlobalErrorHandling = (): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logError(event.error || new Error(event.message), {
        component: 'GlobalErrorHandler',
        action: 'uncaught',
        additionalData: {
          fileName: event.filename,
          lineNo: event.lineno,
          colNo: event.colno
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      logError(error, {
        component: 'GlobalErrorHandler',
        action: 'unhandledRejection'
      });
    });
    
    // Clean up event listeners when the component unmounts
    return () => {
      window.removeEventListener('error', () => {});
      window.removeEventListener('unhandledrejection', () => {});
    };
  }
};