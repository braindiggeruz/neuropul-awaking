import { useState, useCallback, useEffect } from 'react';
import { UserProgress } from '../types';
import { APP_VERSION } from '../constants/version';
import { getLevelByXP } from '../constants/gameData';

const STORAGE_KEY = 'neuropul_userProgress';

const defaultProgress: UserProgress = {
  version: APP_VERSION,
  language: 'ru',
  xp: 0,
  level: 0,
  archetype: null,
  questStep: 0,
  isPremium: false,
  premiumTier: 'none',
  referralUsed: false,
  dailyXPDate: '',
  toolsUsed: [],
  certificateIssued: false,
  userName: '',
  dailyStreak: 0,
  lastVisit: new Date().toISOString().split('T')[0],
  fomoStart: null,
  hasSeenFomo: false,
  soundEnabled: true,
  vibrationEnabled: true,
  refCode: null,
  createdAt: new Date().toISOString()
};

export const useUserProgress = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из localStorage
  const loadProgress = useCallback(() => {
    try {
      console.log('[useUserProgress] Loading progress from localStorage...');
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (!saved) {
        console.log('[useUserProgress] No saved data found, using defaults');
        setUserProgress(defaultProgress);
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(saved) as UserProgress;
      console.log('[useUserProgress] Loaded data:', parsed);

      // Миграция версий
      if (parsed.version !== APP_VERSION) {
        console.log(`[useUserProgress] Migrating from ${parsed.version} to ${APP_VERSION}`);
        const migrated = { ...defaultProgress, ...parsed, version: APP_VERSION };
        setUserProgress(migrated);
        saveProgress(migrated);
      } else {
        setUserProgress(parsed);
      }

      // Проверка daily streak
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastVisit !== today) {
        const lastVisit = new Date(parsed.lastVisit);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`[useUserProgress] Days since last visit: ${daysDiff}`);
        
        if (daysDiff === 1) {
          // Consecutive day
          const newStreak = parsed.dailyStreak + 1;
          console.log(`[useUserProgress] Streak continued: ${newStreak}`);
          updateProgress({ dailyStreak: newStreak, lastVisit: today });
        } else if (daysDiff > 1) {
          // Streak broken
          console.log(`[useUserProgress] Streak broken, resetting to 1`);
          updateProgress({ dailyStreak: 1, lastVisit: today });
        } else {
          // Same day
          updateProgress({ lastVisit: today });
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('[useUserProgress] Error loading progress:', err);
      setError('Ошибка загрузки данных');
      setUserProgress(defaultProgress);
      setIsLoading(false);
    }
  }, []);

  // Сохранение данных в localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    try {
      console.log('[useUserProgress] Saving progress:', progress);
      
      // Валидация данных перед сохранением
      if (!progress.version) {
        console.warn('[useUserProgress] Missing version, adding default');
        progress.version = APP_VERSION;
      }
      
      if (typeof progress.xp !== 'number' || progress.xp < 0) {
        console.warn('[useUserProgress] Invalid XP value, resetting to 0');
        progress.xp = 0;
      }
      
      if (typeof progress.level !== 'number' || progress.level < 0) {
        console.warn('[useUserProgress] Invalid level value, recalculating');
        progress.level = getLevelByXP(progress.xp);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      console.log('[useUserProgress] Progress saved successfully');
    } catch (err) {
      console.error('[useUserProgress] Error saving progress:', err);
      setError('Ошибка сохранения данных');
    }
  }, []);

  // Обновление прогресса
  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    console.log('[useUserProgress] Updating progress with:', updates);
    
    setUserProgress(prev => {
      const newProgress = { ...prev, ...updates };
      
      // Автоматический пересчет уровня при изменении XP
      if (updates.xp !== undefined) {
        newProgress.level = getLevelByXP(newProgress.xp);
        console.log(`[useUserProgress] XP updated: ${prev.xp} -> ${newProgress.xp}, Level: ${prev.level} -> ${newProgress.level}`);
      }
      
      // Обновляем questStep на основе прогресса
      if (updates.userName && !prev.userName) {
        newProgress.questStep = Math.max(newProgress.questStep, 1);
        console.log('[useUserProgress] Username set, questStep updated to 1');
      }
      
      if (updates.archetype && !prev.archetype) {
        newProgress.questStep = Math.max(newProgress.questStep, 2);
        console.log('[useUserProgress] Archetype set, questStep updated to 2');
      }
      
      console.log('[useUserProgress] New progress state:', newProgress);
      
      // Сохраняем асинхронно, чтобы не блокировать UI
      setTimeout(() => saveProgress(newProgress), 0);
      
      return newProgress;
    });
  }, [saveProgress]);

  // Добавление XP
  const addXP = useCallback((amount: number) => {
    console.log(`[useUserProgress] Adding ${amount} XP`);
    
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn(`[useUserProgress] Invalid XP amount: ${amount}`);
      return;
    }
    
    setUserProgress(prev => {
      const newXP = Math.min(prev.xp + amount, 9999); // Максимум XP
      const newLevel = getLevelByXP(newXP);
      const leveledUp = newLevel > prev.level;
      
      const newProgress = {
        ...prev,
        xp: newXP,
        level: newLevel
      };
      
      console.log(`[useUserProgress] XP: ${prev.xp} -> ${newXP}, Level: ${prev.level} -> ${newLevel}, Leveled up: ${leveledUp}`);
      
      // Сохраняем асинхронно
      setTimeout(() => saveProgress(newProgress), 0);
      
      return newProgress;
    });
  }, [saveProgress]);

  // Сброс прогресса
  const resetProgress = useCallback(() => {
    console.log('[useUserProgress] Resetting progress');
    try {
      localStorage.removeItem(STORAGE_KEY);
      setUserProgress(defaultProgress);
      setError(null);
      console.log('[useUserProgress] Progress reset successfully');
    } catch (err) {
      console.error('[useUserProgress] Error resetting progress:', err);
      setError('Ошибка сброса данных');
    }
  }, []);

  // Экспорт данных
  const exportProgress = useCallback(() => {
    console.log('[useUserProgress] Exporting progress');
    return JSON.stringify(userProgress, null, 2);
  }, [userProgress]);

  // Импорт данных
  const importProgress = useCallback((data: string) => {
    try {
      console.log('[useUserProgress] Importing progress');
      const parsed = JSON.parse(data) as UserProgress;
      
      // Валидация импортируемых данных
      if (!parsed.version) parsed.version = APP_VERSION;
      if (typeof parsed.xp !== 'number') parsed.xp = 0;
      if (typeof parsed.level !== 'number') parsed.level = getLevelByXP(parsed.xp);
      if (!parsed.userName) parsed.userName = '';
      if (!Array.isArray(parsed.toolsUsed)) parsed.toolsUsed = [];
      
      setUserProgress(parsed);
      saveProgress(parsed);
      setError(null);
      console.log('[useUserProgress] Progress imported successfully');
    } catch (err) {
      console.error('[useUserProgress] Error importing progress:', err);
      setError('Ошибка импорта данных');
    }
  }, [saveProgress]);

  // Инициализация при монтировании
  useEffect(() => {
    console.log('[useUserProgress] Hook initialized');
    loadProgress();
  }, [loadProgress]);

  return {
    userProgress,
    isLoading,
    error,
    updateProgress,
    addXP,
    resetProgress,
    exportProgress,
    importProgress,
    clearError: () => setError(null)
  };
};