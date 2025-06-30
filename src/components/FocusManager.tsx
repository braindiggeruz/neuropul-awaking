import React, { useEffect, useRef } from 'react';
import { logError } from '../lib/utils/errorLogger';

interface FocusManagerProps {
  children: React.ReactNode;
}

/**
 * Component to manage focus for accessibility
 * Ensures focus is properly managed during navigation
 */
const FocusManager: React.FC<FocusManagerProps> = ({ children }) => {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);

  // Save the last focused element before navigation
  useEffect(() => {
    try {
      const saveFocus = () => {
        lastFocusedElement.current = document.activeElement as HTMLElement;
      };

      // Listen for navigation events
      window.addEventListener('beforeunload', saveFocus);
      
      // Cleanup
      return () => {
        isMountedRef.current = false;
        window.removeEventListener('beforeunload', saveFocus);
      };
    } catch (error) {
      if (import.meta.env.MODE !== 'production') {
        console.error('Error in focus management:', error);
      }
      logError(error, {
        component: 'FocusManager',
        action: 'saveFocus'
      });
    }
  }, []);

  // Restore focus after navigation
  useEffect(() => {
    try {
      // If we have a container and a previously focused element
      if (containerRef.current && lastFocusedElement.current && isMountedRef.current) {
        // Check if the element is still in the document
        if (document.body.contains(lastFocusedElement.current)) {
          lastFocusedElement.current.focus();
        } else {
          // Focus the first focusable element in the container
          const focusableElements = containerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
      }
    } catch (error) {
      if (import.meta.env.MODE !== 'production') {
        console.error('Error restoring focus:', error);
      }
      logError(error, {
        component: 'FocusManager',
        action: 'restoreFocus'
      });
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div ref={containerRef} className="focus-container">
      {children}
    </div>
  );
};

export default FocusManager;