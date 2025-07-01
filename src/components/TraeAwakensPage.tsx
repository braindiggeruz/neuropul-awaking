import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TraeAwakens from '../components/TraeAwakens';
import ResponseLostSoul from '../components/ResponseLostSoul';
import ResponseAwakening from '../components/ResponseAwakening';
import ResponseHackerReady from '../components/ResponseHackerReady';
import { AnimatePresence, motion } from 'framer-motion';
import { saveUserProgress, loadUserProgress, updateUserProgress } from '../utils/progressUtils';
import { logError } from '../lib/utils/errorLogger';
import { cleanupAudio } from '../utils/audioUtils';
import EmergencyResetButton from '../components/EmergencyResetButton';
import { navigateSafely } from '../utils/navigationUtils';

type Screen = 'intro' | 'lost' | 'awakening' | 'ready' | 'portal';

const TraeAwakensPage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [userPath, setUserPath] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [viewCount, setViewCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for cleanup and navigation control
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const navigationAttemptRef = useRef<number>(0);
  const hasNavigatedRef = useRef<boolean>(false);
  const portalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Initialize session and tracking
  useEffect(() => {
    try {
      console.log('[TraeAwakensPage] Component mounted, pathname:', location.pathname);
      
      // CRITICAL: Clear any portal-related storage to prevent loops
      localStorage.removeItem('neuropul_current_screen');
      sessionStorage.removeItem('neuropul_current_screen');
      localStorage.removeItem('neuropul_navigation_in_progress');
      
      // Check if there's a saved path and screen
      const savedPath = localStorage.getItem('neuropul_user_path');
      
      if (savedPath) {
        setUserPath(savedPath);
        console.log(`[TraeAwakensPage] Loaded saved path: ${savedPath}`);
      }
      
      // Generate session ID if not exists
      const existingSessionId = localStorage.getItem('neuropul_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
      } else {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('neuropul_session_id', newSessionId);
        setSessionId(newSessionId);
      }
      
      // Track view count
      const views = parseInt(localStorage.getItem('neuropul_view_count') || '0');
      const newViewCount = views + 1;
      localStorage.setItem('neuropul_view_count', newViewCount.toString());
      setViewCount(newViewCount);
      
      // Track first visit date if not set
      if (!localStorage.getItem('neuropul_first_visit')) {
        localStorage.setItem('neuropul_first_visit', new Date().toISOString());
      }
      
      // Track last visit date
      localStorage.setItem('neuropul_last_visit', new Date().toISOString());
      
      // Initialize XP if not exists
      if (!localStorage.getItem('neuropul_xp')) {
        localStorage.setItem('neuropul_xp', '0');
      }
      
      // Initialize isPaid flag if not exists
      if (!localStorage.getItem('neuropul_is_paid')) {
        localStorage.setItem('neuropul_is_paid', 'false');
      }
      
      // Load or initialize user progress
      const existingProgress = loadUserProgress();
      if (!existingProgress) {
        saveUserProgress({
          name: '',
          archetype: null,
          avatarUrl: '',
          xp: 0,
          level: 1,
          prophecy: '',
          awakened: false,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          questStep: 0
        });
      }
      
      // Set mounted flag
      isMountedRef.current = true;
      initializedRef.current = true;
      
      // Add emergency escape hatch for portal screen
      if (currentScreen === 'portal') {
        console.log('[TraeAwakensPage] Portal screen detected, adding emergency escape timeout');
        portalTimeoutRef.current = setTimeout(() => {
          if (currentScreen === 'portal' && isMountedRef.current) {
            console.log('[TraeAwakensPage] Emergency escape triggered - forcing navigation');
            forceNavigateToHome();
          }
        }, 10000); // 10 second escape hatch
        
        if (portalTimeoutRef.current) {
          timeoutRefs.current.push(portalTimeoutRef.current);
        }
      }

      // Log current path for debugging
      console.log("[NAV] Current path:", window.location.pathname);
    } catch (error) {
      console.error('[TraeAwakensPage] Error initializing session:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'initialize'
      });
    }
    
    // Cleanup function
    return () => {
      console.log('[TraeAwakensPage] Component unmounting');
      isMountedRef.current = false;
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current);
        portalTimeoutRef.current = null;
      }
      
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      
      // Clean up audio
      cleanupAudio();
    };
  }, [location.pathname]);

  // Force navigation to home
  const forceNavigateToHome = () => {
    try {
      console.log('[TraeAwakensPage] Force navigation triggered - current screen:', currentScreen);
      navigationAttemptRef.current += 1;
      
      // Clear all portal-related storage
      localStorage.removeItem('neuropul_current_screen');
      sessionStorage.removeItem('neuropul_current_screen');
      localStorage.removeItem('neuropul_portal_state');
      localStorage.removeItem('neuropul_navigation_in_progress');
      localStorage.removeItem('hasPassedPortal');
      
      // Use navigateSafely for reliable navigation
      navigateSafely(navigate, '/', { replace: true });
      hasNavigatedRef.current = true;
    } catch (error) {
      console.error('[TraeAwakensPage] Force navigation failed:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'forceNavigateToHome'
      });
      
      // Last resort - direct location change
      window.location.href = '/';
    }
  };

  const handlePathSelect = (path: 'lost' | 'awakening' | 'ready') => {
    try {
      console.log(`[TraeAwakensPage] Path selected: ${path}`);
      
      // Update state
      setCurrentScreen(path);
      setUserPath(path);
      
      // Save path to localStorage
      localStorage.setItem('neuropul_user_path', path);
      
      // Track path selection
      localStorage.setItem('neuropul_path_selected_at', new Date().toISOString());
      
      // Set level_selected flag
      localStorage.setItem('neuropul_level_selected', 'true');
      
      // Update user progress
      updateUserProgress({
        userPath: path,
        questStep: 1,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('[TraeAwakensPage] Error in handlePathSelect:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handlePathSelect'
      });
    }
  };

  const handleBack = () => {
    try {
      console.log('[TraeAwakensPage] Going back to intro');
      
      // Update state
      setCurrentScreen('intro');
      
      // Update user progress
      updateUserProgress({
        questStep: 0,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('[TraeAwakensPage] Error in handleBack:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleBack'
      });
    }
  };

  const handleContinueToPortal = () => {
    try {
      console.log('[TraeAwakensPage] Continue to portal triggered');
      
      // Update state
      setCurrentScreen('portal');
      
      // Set completion flag - FIXED: Use string "true" instead of boolean true
      localStorage.setItem('neuropul_intro_completed', 'true');
      localStorage.setItem('neuropul_intro_completed_at', new Date().toISOString());
      localStorage.setItem('hasPassedPortal', 'true'); // FIXED: Use string "true" instead of boolean true
      
      // Update user progress
      updateUserProgress({
        questStep: 2,
        lastActive: new Date().toISOString()
      });
      
      // Check if this is the third message viewed (for CTA trigger)
      const messagesViewed = parseInt(localStorage.getItem('neuropul_viewed_messages') || '0');
      if (messagesViewed >= 3) {
        // Set flag for CTA
        localStorage.setItem('neuropul_show_cta', 'true');
      }
      
      // CRITICAL: Set a timeout to force navigation if portal screen gets stuck
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current);
      }
      
      portalTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && currentScreen === 'portal') {
          console.log('[TraeAwakensPage] Portal timeout reached, forcing navigation');
          forceNavigateToHome();
        }
      }, 5000); // 5 second timeout
      
      if (portalTimeoutRef.current) {
        timeoutRefs.current.push(portalTimeoutRef.current);
      }
      
      // Navigate to home after a short delay
      const redirectTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          console.log('[TraeAwakensPage] Redirect timeout reached, navigating to home');
          forceNavigateToHome();
        }
      }, 2000); // 2 second delay
      
      timeoutRefs.current.push(redirectTimeout);
    } catch (error) {
      console.error('[TraeAwakensPage] Error in handleContinueToPortal:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleContinueToPortal'
      });
      
      // Fallback navigation
      if (isMountedRef.current) {
        forceNavigateToHome();
      }
    }
  };

  // Auto-reset session after inactivity
  useEffect(() => {
    // Clear previous timer if it exists
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        // If user has been inactive for 30 minutes, reset session
        const lastActivity = localStorage.getItem('neuropul_last_activity');
        if (lastActivity) {
          const lastActivityTime = new Date(lastActivity).getTime();
          const currentTime = new Date().getTime();
          const inactiveTime = currentTime - lastActivityTime;
          
          // 30 minutes in milliseconds
          if (inactiveTime > 30 * 60 * 1000) {
            // Don't clear everything, just reset the current session
            localStorage.removeItem('neuropul_session_id');
            // Generate new session
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('neuropul_session_id', newSessionId);
            if (isMountedRef.current) {
              setSessionId(newSessionId);
            }
          }
        }
      }
    }, 60000); // Check every minute
    
    timeoutRefs.current.push(inactivityTimerRef.current);
    
    // Update last activity timestamp
    localStorage.setItem('neuropul_last_activity', new Date().toISOString());
    
    // Cleanup function
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [currentScreen]);

  // Emergency escape hatch for portal screen
  useEffect(() => {
    if (currentScreen === 'portal') {
      console.log('[TraeAwakensPage] Portal screen detected, adding emergency escape timeout');
      
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current);
      }
      
      portalTimeoutRef.current = setTimeout(() => {
        if (currentScreen === 'portal' && isMountedRef.current) {
          console.log('[TraeAwakensPage] Force navigation triggered - still on portal screen');
          forceNavigateToHome();
        }
      }, 8000); // 8 second escape hatch
      
      if (portalTimeoutRef.current) {
        timeoutRefs.current.push(portalTimeoutRef.current);
      }
    }
    
    return () => {
      if (portalTimeoutRef.current) {
        clearTimeout(portalTimeoutRef.current);
        portalTimeoutRef.current = null;
      }
    };
  }, [currentScreen]);

  // Check if we need to navigate away from this page
  useEffect(() => {
    if (!initializedRef.current) return;
    
    const hasPassedPortal = localStorage.getItem('hasPassedPortal') === 'true';
    console.log('[TraeAwakensPage] Checking navigation state, hasPassedPortal:', hasPassedPortal);
    
    if (hasPassedPortal && location.pathname === '/') {
      console.log('[TraeAwakensPage] Portal passed, navigating to dashboard');
      navigateSafely(navigate, '/dashboard', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Manual escape button handler
  const handleManualEscape = () => {
    console.log('[TraeAwakensPage] Manual escape button clicked');
    forceNavigateToHome();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TraeAwakens onPathSelect={handlePathSelect} />
          </motion.div>
        )}
        
        {currentScreen === 'lost' && (
          <motion.div
            key="lost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResponseLostSoul onContinue={handleContinueToPortal} onBack={handleBack} />
          </motion.div>
        )}
        
        {currentScreen === 'awakening' && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResponseAwakening onContinue={handleContinueToPortal} onBack={handleBack} />
          </motion.div>
        )}
        
        {currentScreen === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResponseHackerReady onContinue={handleContinueToPortal} onBack={handleBack} />
          </motion.div>
        )}
        
        {currentScreen === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center flex-col"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Переход к порталу пробуждения...</p>
              <p className="text-gray-400 text-sm mt-2">Пожалуйста, подождите...</p>
            </div>
            
            {/* Emergency escape button */}
            <button
              onClick={handleManualEscape}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Перейти на главную вручную
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Emergency reset button */}
      <EmergencyResetButton />
    </div>
  );
};

export default TraeAwakensPage;