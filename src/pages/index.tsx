import React, { useEffect, useState } from 'react';
import TraeAwakensPage from './TraeAwakensPage';
import { setupGlobalErrorHandling } from '../lib/utils/errorLogger';
import { getUserLanguage, setUserLanguage } from '../lib/utils/i18n';
import { logError } from '../lib/utils/errorLogger';

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set up global error handling and initialize system
  useEffect(() => {
    try {
      console.log('[Home] Page initializing');
      setupGlobalErrorHandling();
      
      // Track page view
      console.log('[Home] Page viewed:', window.location.pathname);
      
      // Clear any portal state to prevent navigation issues
      localStorage.removeItem('neuropul_current_screen');
      sessionStorage.removeItem('neuropul_current_screen');
      
      // Initialize system
      const isPaid = localStorage.getItem('neuropul_is_paid') === 'true';
      const userPath = localStorage.getItem('neuropul_user_path');
      const userName = localStorage.getItem('neuropul_user_name');
      const xp = parseInt(localStorage.getItem('neuropul_xp') || '0');
      const language = getUserLanguage();
      
      console.log('[Home] System initialized:', {
        isPaid,
        userPath,
        userName,
        xp,
        language
      });
      
      // Set default language
      if (!localStorage.getItem('neuropul_language')) {
        // Detect browser language
        const browserLang = navigator.language.startsWith('uz') ? 'uz' : 
                            navigator.language.startsWith('ru') ? 'ru' : 'ru';
        setUserLanguage(browserLang);
        console.log('[Home] Language set to:', browserLang);
      }
      
      // Set default theme
      if (!localStorage.getItem('neuropul_theme')) {
        localStorage.setItem('neuropul_theme', 'dark');
      }
      
      // Set default sound settings
      if (!localStorage.getItem('neuropul_sound_enabled')) {
        localStorage.setItem('neuropul_sound_enabled', 'true');
      }
      
      // Set default vibration settings
      if (!localStorage.getItem('neuropul_vibration_enabled')) {
        localStorage.setItem('neuropul_vibration_enabled', 'true');
      }
      
      // Set document title
      document.title = "NeuropulAI - Твой путь к AI-мастерству";
      
      // Set HTML lang attribute
      document.documentElement.lang = language;
      
      // Mark initialization as complete
      setIsInitialized(true);
      console.log('[Home] Initialization complete');
    } catch (error) {
      console.error('[Home] Error initializing app:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      logError(error, {
        component: 'Home',
        action: 'initialize'
      });
    }
  }, []);
  
  // Emergency reset function
  const handleEmergencyReset = () => {
    try {
      console.log('🧠 SYSTEM CLEAR INITIATED');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during emergency reset:', error);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-8 border border-red-500 border-opacity-30 shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка инициализации</h1>
          <p className="text-gray-300 mb-6">{errorMessage || 'Произошла ошибка при загрузке приложения'}</p>
          <button
            onClick={handleEmergencyReset}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Сбросить и перезагрузить
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Инициализация NeuropulAI...</p>
        </div>
      </div>
    );
  }
  
  return <TraeAwakensPage />;
}