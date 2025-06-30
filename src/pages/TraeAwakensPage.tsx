import React, { useState, useEffect, useRef } from 'react';
import TraeAwakens from '../components/TraeAwakens';
import ResponseLostSoul from '../components/ResponseLostSoul';
import ResponseAwakening from '../components/ResponseAwakening';
import ResponseHackerReady from '../components/ResponseHackerReady';
import { AnimatePresence, motion } from 'framer-motion';
import { saveUserProgress, loadUserProgress, updateUserProgress } from '../utils/progressUtils';

type Screen = 'intro' | 'lost' | 'awakening' | 'ready' | 'portal';

const TraeAwakensPage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [userPath, setUserPath] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [viewCount, setViewCount] = useState(0);
  
  // Refs for cleanup
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Initialize session and tracking
  useEffect(() => {
    // Check if there's a saved path and screen
    const savedPath = localStorage.getItem('neuropul_user_path');
    const savedScreen = localStorage.getItem('neuropul_current_screen');
    
    if (savedPath) {
      setUserPath(savedPath);
      
      // If there's a saved screen that's not 'intro', restore it
      if (savedScreen && savedScreen !== 'intro' && 
          ['lost', 'awakening', 'ready', 'portal'].includes(savedScreen)) {
        console.log(`Restoring saved screen: ${savedScreen}`);
        setCurrentScreen(savedScreen as Screen);
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
    
    // Log user agent for analytics
    const userAgent = navigator.userAgent;
    localStorage.setItem('neuropul_user_agent', userAgent);
    
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
    
    // Cleanup function
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const handlePathSelect = (path: 'lost' | 'awakening' | 'ready') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    
    setCurrentScreen(path);
    setUserPath(path);
    
    // Save current screen and path to localStorage
    localStorage.setItem('neuropul_current_screen', path);
    localStorage.setItem('neuropul_user_path', path);
    
    // Log user selection
    console.log(`User selected path: ${path}`);
    console.log(`Session ID: ${sessionId}`);
    console.log(`View count: ${viewCount}`);
    
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
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  };

  const handleBack = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    
    setCurrentScreen('intro');
    
    // Update localStorage
    localStorage.setItem('neuropul_current_screen', 'intro');
    
    // Log navigation
    console.log('User navigated back to intro');
    
    // Update user progress
    updateUserProgress({
      questStep: 0,
      lastActive: new Date().toISOString()
    });
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  };

  const handleContinueToPortal = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    
    setCurrentScreen('portal');
    
    // Update localStorage
    localStorage.setItem('neuropul_current_screen', 'portal');
    
    // Log completion
    console.log('User completed introduction');
    console.log(`Final path: ${userPath}`);
    
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
    
    // In a real implementation, you would navigate to the awakening portal or dashboard
    // For now, we'll just redirect to the home page after a delay
    const redirectTimeout = setTimeout(() => {
      // Check if we should show CTA
      if (localStorage.getItem('neuropul_show_cta') === 'true' && localStorage.getItem('neuropul_is_paid') !== 'true') {
        // Redirect to CTA page
        window.location.href = '/premium';
      } else {
        // Redirect to main app
        window.location.href = '/';
      }
      
      // Reset navigation lock
      isNavigatingRef.current = false;
    }, 500);
    
    // Cleanup function for the timeout
    return () => clearTimeout(redirectTimeout);
  };

  // Auto-reset session after inactivity
  useEffect(() => {
    // Clear previous timer if it exists
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      // If user has been inactive for 30 minutes, reset session
      const lastActivity = localStorage.getItem('neuropul_last_activity');
      if (lastActivity) {
        const lastActivityTime = new Date(lastActivity).getTime();
        const currentTime = new Date().getTime();
        const inactiveTime = currentTime - lastActivityTime;
        
        // 30 minutes in milliseconds
        if (inactiveTime > 30 * 60 * 1000) {
          console.log('Session reset due to inactivity');
          // Don't clear everything, just reset the current session
          localStorage.removeItem('neuropul_session_id');
          // Generate new session
          const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem('neuropul_session_id', newSessionId);
          setSessionId(newSessionId);
        }
      }
    }, 60000); // Check every minute
    
    // Update last activity timestamp
    localStorage.setItem('neuropul_last_activity', new Date().toISOString());
    
    // Cleanup function
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
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
            className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Переход к порталу пробуждения...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global CSS for cyberpunk effects */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&display=swap');
        
        @keyframes digitalRain {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
        
        .bg-scanline {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.5) 50%
          );
          background-size: 100% 4px;
        }
        
        .glitch-text {
          position: relative;
          animation: glitch 3s infinite;
          color: rgba(139, 92, 246, 0.5);
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .glitch-corner {
          background: linear-gradient(45deg, transparent 48%, #00ffff 49%, transparent 51%);
          animation: cornerGlitch 2s infinite;
        }
        
        @keyframes cornerGlitch {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
          51% { transform: scale(0.8); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TraeAwakensPage;