import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // Refs for cleanup and navigation control
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef<boolean>(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const navigationAttempts = useRef<number>(0);

  // Initialize session and tracking
  useEffect(() => {
    try {
      console.log('🔍 TraeAwakensPage mounted');
      
      // Check if there's a saved path and screen
      const savedPath = localStorage.getItem('neuropul_user_path');
      const savedScreen = localStorage.getItem('neuropul_current_screen');
      
      if (savedPath) {
        setUserPath(savedPath);
        console.log('📂 Loaded saved path:', savedPath);
        
        // If there's a saved screen that's not 'intro', restore it
        if (savedScreen && savedScreen !== 'intro' && 
            ['lost', 'awakening', 'ready', 'portal'].includes(savedScreen)) {
          setCurrentScreen(savedScreen as Screen);
          console.log('📂 Restored saved screen:', savedScreen);
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
      
      // Remove initial loader if it's still there
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        console.log('🧹 Removing initial loader that was still present');
        initialLoader.style.display = 'none';
      }
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
  }, []);

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
      }
      
      // Update localStorage
      localStorage.setItem('neuropul_current_screen', 'portal');
      
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
      
      // Navigate to home or premium page after a delay
      const redirectTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          navigationAttempts.current += 1;
          console.log(`🧭 Navigation attempt ${navigationAttempts.current}`);
          
          try {
            // Check if we should show CTA
            if (localStorage.getItem('neuropul_show_cta') === 'true' && 
                localStorage.getItem('neuropul_is_paid') !== 'true') {
              console.log('🔄 Navigating to premium page');
              navigate('/premium', { replace: true });
            } else {
              console.log('🔄 Navigating to home page');
              navigate('/', { replace: true });
            }
            
            console.log('✅ Navigation completed successfully');
            
            // Reset navigation lock
            isNavigatingRef.current = false;
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            logError(navError, {
              component: 'TraeAwakensPage',
              action: 'navigate'
            });
            
            // If navigation fails and we haven't tried too many times, try again
            if (navigationAttempts.current < 3) {
              console.log(`🔄 Retrying navigation (attempt ${navigationAttempts.current + 1}/3)`);
              const retryTimeout = setTimeout(() => handleContinueToPortal(), 1000);
              timeoutRefs.current.push(retryTimeout);
            } else {
              console.error('❌ Max navigation attempts reached, giving up');
              isNavigatingRef.current = false;
              
              // Force reload as last resort
              if (isMountedRef.current) {
                console.log('🔄 Forcing page reload as fallback');
                window.location.href = '/';
              }
            }
          }
        }
      }, 1000);
      
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
  }, [currentScreen, navigate]);

  // Add emergency escape hatch
  useEffect(() => {
    if (currentScreen === 'portal') {
      console.log('🚨 Portal screen detected, adding emergency escape timeout');
      const escapeTimeout = setTimeout(() => {
        if (currentScreen === 'portal' && isMountedRef.current) {
          console.log('⚠️ Emergency escape triggered - portal screen was active too long');
          window.location.href = '/';
        }
      }, 10000); // 10 seconds max on portal screen
      
      timeoutRefs.current.push(escapeTimeout);
      
      return () => {
        clearTimeout(escapeTimeout);
      };
    }
  }, [currentScreen]);

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
              onClick={() => window.location.href = '/'}
              className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Перейти на главную вручную
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TraeAwakensPage;