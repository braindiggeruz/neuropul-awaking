import React from 'react';
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
  const [language, setLanguage] = React.useState<Language>(getUserLanguage());

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ru' ? 'uz' : 'ru';
    setLanguage(newLanguage);
    setUserLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    
    // Force reload to apply language changes throughout the app
    window.location.reload();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className={`px-3 py-1 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full text-white text-sm transition-colors ${className}`}
      aria-label={language === 'ru' ? 'Switch to Uzbek' : 'Переключиться на русский'}
      role="button"
    >
      {language === 'ru' ? '🇺🇿 O\'zbekcha' : '🇷🇺 Русский'}
    </motion.button>
  );
};

export default LanguageSwitcher;