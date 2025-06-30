import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserLanguage, setUserLanguage, Language } from '../lib/utils/i18n';

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

  // Update language state when component mounts
  useEffect(() => {
    setLanguage(getUserLanguage());
  }, []);

  const toggleLanguage = () => {
    if (isChanging) return;
    
    setIsChanging(true);
    const newLanguage: Language = language === 'ru' ? 'uz' : 'ru';
    
    // Update local state
    setLanguage(newLanguage);
    
    // Save to localStorage
    setUserLanguage(newLanguage);
    
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    
    // Add a small delay to prevent rapid toggling
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
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
    >
      {language === 'ru' ? '🇺🇿 O\'zbekcha' : '🇷🇺 Русский'}
    </motion.button>
  );
};

export default LanguageSwitcher;