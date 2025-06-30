import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getUserLanguage, setUserLanguage, Language } from '../lib/utils/i18n';
import { logError } from '../lib/utils/errorLogger';

interface LanguageSwitcherProps {
  onLanguageChange?: (language: Language) => void;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  onLanguageChange,
  className = ''
}) => {
  const [language, setLanguage] = useState<Language>(getUserLanguage());
  const [isChanging, setIsChanging] = useState(false);
  
  // Use ref to prevent multiple rapid clicks
  const isChangingRef = useRef(false);

  // Update language state when component mounts
  useEffect(() => {
    setLanguage(getUserLanguage());
  }, []);

  const toggleLanguage = () => {
    try {
      // Prevent multiple rapid clicks
      if (isChangingRef.current) return;
      
      isChangingRef.current = true;
      setIsChanging(true);
      
      const newLanguage: Language = language === 'ru' ? 'uz' : 'ru';
      
      // Update local state
      setLanguage(newLanguage);
      
      // Save to localStorage and update URL
      setUserLanguage(newLanguage);
      
      // Notify parent component
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
      
      // Add a small delay to prevent rapid toggling
      setTimeout(() => {
        setIsChanging(false);
        isChangingRef.current = false;
      }, 500);
    } catch (error) {
      logError(error, {
        component: 'LanguageSwitcher',
        action: 'toggleLanguage'
      });
      setIsChanging(false);
      isChangingRef.current = false;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      disabled={isChanging}
      className={`px-3 py-1 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white text-sm transition-colors ${isChanging ? 'opacity-50' : ''} ${className}`}
      aria-label={language === 'ru' ? 'Switch to Uzbek' : 'Переключиться на русский'}
      role="button"
      tabIndex={0}
    >
      {language === 'ru' ? '🇺🇿 O\'zbekcha' : '🇷🇺 Русский'}
    </motion.button>
  );
};

export default LanguageSwitcher;