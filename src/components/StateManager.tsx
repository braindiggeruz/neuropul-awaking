import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserLanguage, setUserLanguage, Language } from '../lib/utils/i18n';
import { logError } from '../lib/utils/errorLogger';

interface StateContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  userPath: string | null;
  setUserPath: (path: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  xp: number;
  addXP: (amount: number) => void;
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  vibrationEnabled: boolean;
  toggleVibration: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getUserLanguage());
  const [userPath, setUserPathState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string>('');
  const [xp, setXP] = useState<number>(0);
  const [isNavigating, setIsNavigatingState] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  // Initialize state from localStorage
  useEffect(() => {
    try {
      // Load language
      const detectedLanguage = getUserLanguage();
      setLanguageState(detectedLanguage);
      
      // Load user path
      const savedPath = localStorage.getItem('neuropul_user_path');
      if (savedPath) {
        setUserPathState(savedPath);
      }
      
      // Load user name
      const savedName = localStorage.getItem('neuropul_user_name');
      if (savedName) {
        setUserNameState(savedName);
      }
      
      // Load XP
      const savedXP = parseInt(localStorage.getItem('neuropul_xp') || '0');
      setXP(savedXP);
      
      // Load sound preference
      const savedSound = localStorage.getItem('neuropul_sound_enabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
      
      // Load vibration preference
      const savedVibration = localStorage.getItem('neuropul_vibration_enabled');
      if (savedVibration !== null) {
        setVibrationEnabled(savedVibration === 'true');
      }
      
      console.log('State initialized from localStorage');
    } catch (error) {
      console.error('Error initializing state from localStorage:', error);
      logError(error, {
        component: 'StateManager',
        action: 'initialize'
      });
    }
  }, []);

  // Set language and update localStorage
  const setLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      setUserLanguage(lang);
    } catch (error) {
      console.error('Error setting language:', error);
      logError(error, {
        component: 'StateManager',
        action: 'setLanguage'
      });
    }
  };

  // Set user path and update localStorage
  const setUserPath = (path: string | null) => {
    try {
      setUserPathState(path);
      if (path) {
        localStorage.setItem('neuropul_user_path', path);
      }
    } catch (error) {
      console.error('Error setting user path:', error);
      logError(error, {
        component: 'StateManager',
        action: 'setUserPath'
      });
    }
  };

  // Set user name and update localStorage
  const setUserName = (name: string) => {
    try {
      setUserNameState(name);
      localStorage.setItem('neuropul_user_name', name);
    } catch (error) {
      console.error('Error setting user name:', error);
      logError(error, {
        component: 'StateManager',
        action: 'setUserName'
      });
    }
  };

  // Add XP and update localStorage
  const addXP = (amount: number) => {
    try {
      if (typeof amount !== 'number' || amount <= 0) {
        console.warn('Invalid XP amount:', amount);
        return;
      }
      
      setXP(prev => {
        const newXP = prev + amount;
        localStorage.setItem('neuropul_xp', newXP.toString());
        return newXP;
      });
    } catch (error) {
      console.error('Error adding XP:', error);
      logError(error, {
        component: 'StateManager',
        action: 'addXP'
      });
    }
  };

  // Set navigation state
  const setIsNavigating = (value: boolean) => {
    setIsNavigatingState(value);
  };

  // Toggle sound and update localStorage
  const toggleSound = () => {
    try {
      setSoundEnabled(prev => {
        const newValue = !prev;
        localStorage.setItem('neuropul_sound_enabled', newValue.toString());
        return newValue;
      });
    } catch (error) {
      console.error('Error toggling sound:', error);
      logError(error, {
        component: 'StateManager',
        action: 'toggleSound'
      });
    }
  };

  // Toggle vibration and update localStorage
  const toggleVibration = () => {
    try {
      setVibrationEnabled(prev => {
        const newValue = !prev;
        localStorage.setItem('neuropul_vibration_enabled', newValue.toString());
        return newValue;
      });
    } catch (error) {
      console.error('Error toggling vibration:', error);
      logError(error, {
        component: 'StateManager',
        action: 'toggleVibration'
      });
    }
  };

  return (
    <StateContext.Provider
      value={{
        language,
        setLanguage,
        userPath,
        setUserPath,
        userName,
        setUserName,
        xp,
        addXP,
        isNavigating,
        setIsNavigating,
        soundEnabled,
        toggleSound,
        vibrationEnabled,
        toggleVibration
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};