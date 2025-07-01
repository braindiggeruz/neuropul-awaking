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
  const isNavigatingRef = useRef<boolean>(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const navigationAttempts = useRef<number>(0);
  const maxNavigationAttempts = 3;
  const forceNavigationTriggered = useRef<boolean>(false);
  const portalEnteredTime = useRef<number | null>(null);

  // Initialize session and tracking
  useEffect(() => {
    try {
      console.log('🔍 TraeAwakensPage mounted, pathname:', location.pathname);
      
      // CRITICAL: Clear portal screen from localStorage on mount to prevent loops
      if (localStorage.getItem('neuropul_current_screen') === 'portal') {
        console.log('🚨 CRITICAL: Detected portal screen in localStorage on mount, removing it');
        localStorage.removeItem('neuropul_current_screen');
      }
      
      // Remove initial loader if it's still there
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        console.log('🧹 Removing initial loader that was still present');
        initialLoader.style.display = 'none';
        if (initialLoader.parentNode) {
          initialLoader.parentNode.removeChild(initialLoader);
        }
      }
      
      // Check if we're already on a different route
      if (location.pathname !== '/' && location.pathname !== '/awakening') {
        console.log(`🔍 Already on a different route: ${location.pathname}, not restoring saved screen`);
        return;
      }
      
      // Check if there's a saved path and screen
      const savedPath = localStorage.getItem('neuropul_user_path');
      const savedScreen = localStorage.getItem('neuropul_current_screen');
      
      console.log(`🔍 Saved path: ${savedPath}, saved screen: ${savedScreen}`);
      
      if (savedPath) {
        setUserPath(savedPath);
        
        // If there's a saved screen that's not 'intro', restore it
        if (savedScreen && savedScreen !== 'intro' && 
            ['lost', 'awakening', 'ready'].includes(savedScreen)) {
          
          // CRITICAL FIX: Don't restore 'portal' screen to avoid navigation loop
          setCurrentScreen(savedScreen as Screen);
          console.log('📂 Restored saved screen:', savedScreen);
        } else if (savedScreen === 'portal') {
          console.log('⚠️ Not restoring portal screen to avoid navigation loop');
          // Clear the saved screen to prevent future loops
          localStorage.removeItem('neuropul_current_screen');
          
          // If intro is completed, navigate directly to home
          if (localStorage.getItem('neuropul_intro_completed') === 'true') {
            console.log('🔄 Intro already completed, navigating directly to home');
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
            return;
          }
        }
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
    } catch (error) {
      console.error('Error initializing session:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'initialize'
      });
    }
    
    // Cleanup function
    return () => {
      console.log('🧹 TraeAwakensPage unmounting, cleaning up resources');
      isMountedRef.current = false;
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      
      // Clean up audio
      cleanupAudio();
    };
  }, [location.pathname, navigate]);

  const handlePathSelect = (path: 'lost' | 'awakening' | 'ready') => {
    // Prevent multiple navigation attempts
    if (isNavigatingRef.current) {
      console.log('⚠️ Navigation already in progress, ignoring duplicate request');
      return;
    }
    
    isNavigatingRef.current = true;
    console.log(`🔄 Selecting path: ${path}`);
    
    try {
      // Update state
      if (isMountedRef.current) {
        setCurrentScreen(path);
        setUserPath(path);
      }
      
      // Save current screen and path to localStorage
      localStorage.setItem('neuropul_current_screen', path);
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
      
      // Reset navigation lock after a delay
      const resetTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          isNavigatingRef.current = false;
          console.log('🔓 Navigation lock reset');
        }
      }, 500);
      
      timeoutRefs.current.push(resetTimeout);
    } catch (error) {
      console.error('Error in handlePathSelect:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handlePathSelect'
      });
      
      // Reset navigation lock
      isNavigatingRef.current = false;
    }
  };

  const handleBack = () => {
    // Prevent multiple navigation attempts
    if (isNavigatingRef.current) {
      console.log('⚠️ Navigation already in progress, ignoring duplicate request');
      return;
    }
    
    isNavigatingRef.current = true;
    console.log('🔄 Going back to intro screen');
    
    try {
      // Update state
      if (isMountedRef.current) {
        setCurrentScreen('intro');
      }
      
      // Update localStorage
      localStorage.setItem('neuropul_current_screen', 'intro');
      
      // Update user progress
      updateUserProgress({
        questStep: 0,
        lastActive: new Date().toISOString()
      });
      
      // Reset navigation lock after a delay
      const resetTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          isNavigatingRef.current = false;
          console.log('🔓 Navigation lock reset');
        }
      }, 500);
      
      timeoutRefs.current.push(resetTimeout);
    } catch (error) {
      console.error('Error in handleBack:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleBack'
      });
      
      // Reset navigation lock
      isNavigatingRef.current = false;
    }
  };

  const handleContinueToPortal = () => {
    // Prevent multiple navigation attempts
    if (isNavigatingRef.current) {
      console.log('⚠️ Navigation already in progress, ignoring duplicate request');
      return;
    }
    
    isNavigatingRef.current = true;
    console.log('🔄 Continuing to portal');
    
    try {
      // Update state
      if (isMountedRef.current) {
        setCurrentScreen('portal');
        portalEnteredTime.current = Date.now();
      }
      
      // CRITICAL FIX: Don't save portal as current screen
      // Instead, mark that we're in transition
      localStorage.setItem('neuropul_navigation_in_progress', 'true');
      
      // Set completion flag
      localStorage.setItem('neuropul_intro_completed', 'true');
      localStorage.setItem('neuropul_intro_completed_at', new Date().toISOString());
      
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
      
      // CRITICAL FIX: Clear any existing portal screen from localStorage
      localStorage.removeItem('neuropul_current_screen');
      
      // Navigate to home or premium page after a delay
      const redirectTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          // Determine destination
          const destination = localStorage.getItem('neuropul_show_cta') === 'true' && 
                             localStorage.getItem('neuropul_is_paid') !== 'true' 
                             ? '/premium' 
                             : '/';
          
          console.log(`🔄 Navigating to ${destination} with window.location.href`);
          
          // CRITICAL FIX: Clear localStorage navigation flags
          localStorage.removeItem('neuropul_current_screen');
          localStorage.removeItem('neuropul_navigation_in_progress');
          
          // Use direct location change for more reliable navigation
          window.location.href = destination;
        }
      }, 2000);
      
      timeoutRefs.current.push(redirectTimeout);
    } catch (error) {
      console.error('Error in handleContinueToPortal:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleContinueToPortal'
      });
      
      // Reset navigation lock
      isNavigatingRef.current = false;
      
      // Fallback navigation
      if (isMountedRef.current) {
        console.log('🔄 Using fallback navigation');
        
        // CRITICAL FIX: Clear localStorage navigation flags
        localStorage.removeItem('neuropul_current_screen');
        localStorage.removeItem('neuropul_navigation_in_progress');
        
        window.location.href = '/';
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

  // Add emergency escape hatch for portal screen
  useEffect(() => {
    if (currentScreen === 'portal') {
      console.log('🚨 Portal screen detected, adding emergency escape timeout');
      portalEnteredTime.current = Date.now();
      
      // CRITICAL FIX: Force navigation after a short delay
      const escapeTimeout = setTimeout(() => {
        if (currentScreen === 'portal' && isMountedRef.current && !forceNavigationTriggered.current) {
          console.log('⚠️ Force navigation triggered - still on portal screen');
          forceNavigationTriggered.current = true;
          
          // Clear localStorage to prevent restoration loop
          localStorage.removeItem('neuropul_current_screen');
          localStorage.removeItem('neuropul_navigation_in_progress');
          
          // Use direct location change as last resort
          window.location.href = '/';
        }
      }, 5000); // 5 seconds max on portal screen
      
      timeoutRefs.current.push(escapeTimeout);
      
      return () => {
        clearTimeout(escapeTimeout);
      };
    }
  }, [currentScreen]);

  // Direct navigation function for emergency button
  const handleDirectNavigation = () => {
    console.log('🚨 Manual navigation button clicked');
    
    // CRITICAL FIX: Clear localStorage to prevent restoration loop
    localStorage.removeItem('neuropul_current_screen');
    localStorage.removeItem('neuropul_navigation_in_progress');
    
    // Use direct location change
    window.location.href = '/';
  };

  // CRITICAL FIX: Add system diagnostic info
  const getDiagnosticInfo = () => {
    try {
      return {
        currentScreen,
        userPath,
        portalTime: portalEnteredTime.current ? Math.round((Date.now() - portalEnteredTime.current) / 1000) : null,
        localStorage: {
          currentScreen: localStorage.getItem('neuropul_current_screen'),
          userPath: localStorage.getItem('neuropul_user_path'),
          introCompleted: localStorage.getItem('neuropul_intro_completed'),
          navigationInProgress: localStorage.getItem('neuropul_navigation_in_progress')
        },
        navigationAttempts: navigationAttempts.current,
        forceNavigationTriggered: forceNavigationTriggered.current,
        pathname: location.pathname
      };
    } catch (e) {
      return { error: String(e) };
    }
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
              <p className="text-gray-400 text-sm mt-4">Пожалуйста, подождите...</p>
            </div>
            
            {/* Emergency escape button */}
            <button 
              onClick={handleDirectNavigation}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Перейти на главную вручную
            </button>
            
            <div className="mt-4 text-gray-500 text-xs">
              Если переход не происходит автоматически, нажмите кнопку выше
            </div>
            
            {/* System diagnostic info */}
            <div className="mt-8 p-4 bg-black bg-opacity-50 rounded-lg max-w-md text-left text-xs text-gray-400">
              <div className="font-mono">
                <div>Диагностика системы:</div>
                <pre>{JSON.stringify(getDiagnosticInfo(), null, 2)}</pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TraeAwakensPage;