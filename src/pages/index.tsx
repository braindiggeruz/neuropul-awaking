import React, { useEffect } from 'react';
import TraeAwakensPage from './TraeAwakensPage';
import { setupGlobalErrorHandling } from '../lib/utils/errorLogger';
import { getUserLanguage, setUserLanguage } from '../lib/utils/i18n';
import { logError } from '../lib/utils/errorLogger';

export default function Home() {
  // Set up global error handling
  useEffect(() => {
    try {
      setupGlobalErrorHandling();
      
      // Track page view
      console.log('Page viewed:', window.location.pathname);
      
      // Initialize system
      const isPaid = localStorage.getItem('neuropul_is_paid') === 'true';
      const userPath = localStorage.getItem('neuropul_user_path');
      const userName = localStorage.getItem('neuropul_user_name');
      const xp = parseInt(localStorage.getItem('neuropul_xp') || '0');
      const language = getUserLanguage();
      
      console.log('System initialized:', {
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
        console.log('Language set to:', browserLang);
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
    } catch (error) {
      console.error('Error initializing app:', error);
      logError(error, {
        component: 'Home',
        action: 'initialize'
      });
    }
  }, []);
  
  return <TraeAwakensPage />;
}