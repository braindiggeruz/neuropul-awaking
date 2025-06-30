import React, { useState, useEffect } from 'react';
import TraeAwakens from '../components/TraeAwakens';
import ResponseLostSoul from '../components/ResponseLostSoul';
import ResponseAwakening from '../components/ResponseAwakening';
import ResponseHackerReady from '../components/ResponseHackerReady';
import { AnimatePresence, motion } from 'framer-motion';
import { logError } from '../lib/utils/errorLogger';
import ErrorBoundary from '../components/ErrorBoundary';

type Screen = 'intro' | 'lost' | 'awakening' | 'ready' | 'portal';

const TraeAwakensPage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [userPath, setUserPath] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [viewCount, setViewCount] = useState(0);
  const [language, setLanguage] = useState<'ru' | 'uz'>('ru');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // Initialize session and tracking
  useEffect(() => {
    try {
      console.log('Initializing TraeAwakensPage');
      
      // Load language preference
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      
      if (langParam === 'uz' || langParam === 'ru') {
        setLanguage(langParam);
        localStorage.setItem('neuropul_language', langParam);
        console.log(`Language set from URL: ${langParam}`);
      } else {
        const savedLang = localStorage.getItem('neuropul_language');
        if (savedLang === 'uz' || savedLang === 'ru') {
          setLanguage(savedLang);
          console.log(`Language set from localStorage: ${savedLang}`);
        } else {
          // Try browser language
          const browserLang = navigator.language.startsWith('uz') ? 'uz' : 'ru';
          setLanguage(browserLang);
          localStorage.setItem('neuropul_language', browserLang);
          console.log(`Language set from browser: ${browserLang}`);
        }
      }
      
      // Generate session ID if not exists
      const existingSessionId = localStorage.getItem('neuropul_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log(`Using existing session ID: ${existingSessionId}`);
      } else {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('neuropul_session_id', newSessionId);
        setSessionId(newSessionId);
        console.log(`Created new session ID: ${newSessionId}`);
      }
      
      // Track view count
      const views = parseInt(localStorage.getItem('neuropul_view_count') || '0');
      const newViewCount = views + 1;
      localStorage.setItem('neuropul_view_count', newViewCount.toString());
      setViewCount(newViewCount);
      console.log(`View count: ${newViewCount}`);
      
      // Track first visit date if not set
      if (!localStorage.getItem('neuropul_first_visit')) {
        localStorage.setItem('neuropul_first_visit', new Date().toISOString());
        console.log('First visit date set');
      }
      
      // Track last visit date
      localStorage.setItem('neuropul_last_visit', new Date().toISOString());
      
      // Check for returning user
      const savedPath = localStorage.getItem('neuropul_user_path');
      if (savedPath) {
        setUserPath(savedPath);
        console.log(`Returning user with path: ${savedPath}`);
      }
      
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
      
      console.log('TraeAwakensPage initialization complete');
    } catch (error) {
      console.error('Error initializing TraeAwakensPage:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'initialize'
      });
    }
  }, []);

  const handlePathSelect = (path: 'lost' | 'awakening' | 'ready') => {
    try {
      if (isNavigating) {
        console.log('Navigation already in progress, ignoring');
        return;
      }
      
      console.log(`Path selected: ${path}`);
      setIsNavigating(true);
      setCurrentScreen(path);
      setUserPath(path);
      
      // Log user selection
      console.log(`User selected path: ${path}`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`View count: ${viewCount}`);
      
      // Track path selection
      localStorage.setItem('neuropul_user_path', path);
      localStorage.setItem('neuropul_path_selected_at', new Date().toISOString());
      
      // Set level_selected flag
      localStorage.setItem('neuropul_level_selected', 'true');
      
      // Reset navigation state after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    } catch (error) {
      console.error('Error in handlePathSelect:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handlePathSelect',
        additionalData: { path }
      });
      
      setNavigationError('Ошибка при выборе пути. Пожалуйста, попробуйте снова.');
      setIsNavigating(false);
    }
  };

  const handleBack = () => {
    try {
      if (isNavigating) {
        console.log('Navigation already in progress, ignoring');
        return;
      }
      
      console.log('User navigated back to intro');
      setIsNavigating(true);
      setCurrentScreen('intro');
      
      // Reset navigation state after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    } catch (error) {
      console.error('Error in handleBack:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleBack'
      });
      
      setNavigationError('Ошибка при возврате. Пожалуйста, попробуйте снова.');
      setIsNavigating(false);
    }
  };

  const handleContinueToPortal = () => {
    try {
      if (isNavigating) {
        console.log('Navigation already in progress, ignoring');
        return;
      }
      
      console.log('User completed introduction');
      console.log(`Final path: ${userPath}`);
      
      setIsNavigating(true);
      setCurrentScreen('portal');
      
      // Set completion flag
      localStorage.setItem('neuropul_intro_completed', 'true');
      localStorage.setItem('neuropul_intro_completed_at', new Date().toISOString());
      
      // Check if this is the third message viewed (for CTA trigger)
      const messagesViewed = parseInt(localStorage.getItem('neuropul_viewed_messages') || '0');
      if (messagesViewed >= 3) {
        // Set flag for CTA
        localStorage.setItem('neuropul_show_cta', 'true');
      }
      
      // In a real implementation, you would navigate to the awakening portal or dashboard
      // For now, we'll just redirect to the home page after a delay
      setTimeout(() => {
        // Check if we should show CTA
        if (localStorage.getItem('neuropul_show_cta') === 'true' && localStorage.getItem('neuropul_is_paid') !== 'true') {
          // Redirect to CTA page
          window.location.href = '/premium';
        } else {
          // Redirect to main app
          window.location.href = '/';
        }
      }, 2000);
    } catch (error) {
      console.error('Error in handleContinueToPortal:', error);
      logError(error, {
        component: 'TraeAwakensPage',
        action: 'handleContinueToPortal'
      });
      
      setNavigationError('Ошибка при переходе к порталу. Пожалуйста, попробуйте снова.');
      setIsNavigating(false);
    }
  };

  // Auto-reset session after inactivity
  useEffect(() => {
    const inactivityTimeout = setTimeout(() => {
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
    
    return () => clearTimeout(inactivityTimeout);
  }, [currentScreen]);

  return (
    <ErrorBoundary>
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
                <p className="text-white text-lg">
                  {language === 'ru' 
                    ? 'Переход к порталу пробуждения...' 
                    : 'Uyg\'onish portaliga o\'tish...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation Error */}
        {navigationError && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-900 bg-opacity-80 text-white p-4 rounded-lg z-50 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <span>{navigationError}</span>
              </div>
              <button 
                onClick={() => setNavigationError(null)}
                className="text-white hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
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
    </ErrorBoundary>
  );
};

export default TraeAwakensPage;