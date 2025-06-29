import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import ArchetypeScreen from './ArchetypeScreen';
import EnhancedDashboard from './EnhancedDashboard';
import { useUserProgress } from '../hooks/useUserProgress';
import { playSound } from '../utils/sounds';

type Screen = 'welcome' | 'archetype' | 'dashboard';

const NeuropulAI: React.FC = () => {
  const {
    userProgress,
    isLoading,
    error,
    updateProgress,
    addXP,
    resetProgress,
    exportProgress,
    importProgress,
    clearError
  } = useUserProgress();

  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [showToast, setShowToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Определение текущего экрана на основе прогресса
  useEffect(() => {
    if (isLoading) return;

    console.log('[NeuropulAI] Enhanced app determining screen based on progress:', {
      userName: userProgress.userName,
      archetype: userProgress.archetype,
      questStep: userProgress.questStep,
      hasCompletedOnboarding: userProgress.userName && userProgress.archetype
    });

    // Логика определения экрана:
    // 1. Если нет имени - Welcome
    // 2. Если есть имя, но нет архетипа - Archetype  
    // 3. Если есть имя и архетип - Dashboard
    if (!userProgress.userName || userProgress.userName.trim() === '') {
      console.log('[NeuropulAI] No username, showing welcome screen');
      setCurrentScreen('welcome');
    } else if (!userProgress.archetype) {
      console.log('[NeuropulAI] Username exists but no archetype, showing archetype screen');
      setCurrentScreen('archetype');
    } else {
      console.log('[NeuropulAI] Username and archetype exist, showing enhanced dashboard');
      setCurrentScreen('dashboard');
    }
  }, [userProgress.userName, userProgress.archetype, userProgress.questStep, isLoading]);

  // Навигация между экранами
  const handleNavigate = (screen: Screen) => {
    console.log(`[NeuropulAI] Enhanced navigation to: ${screen}`);
    playSound('click', userProgress.soundEnabled);
    
    // Дополнительные проверки при навигации
    if (screen === 'dashboard') {
      if (!userProgress.userName) {
        console.warn('[NeuropulAI] Cannot navigate to dashboard without username');
        showNotification('Сначала введите имя', 'error');
        setCurrentScreen('welcome');
        return;
      }
      if (!userProgress.archetype) {
        console.warn('[NeuropulAI] Cannot navigate to dashboard without archetype');
        showNotification('Сначала выберите архетип', 'error');
        setCurrentScreen('archetype');
        return;
      }
    }
    
    if (screen === 'archetype' && !userProgress.userName) {
      console.warn('[NeuropulAI] Cannot navigate to archetype without username');
      showNotification('Сначала введите имя', 'error');
      setCurrentScreen('welcome');
      return;
    }
    
    setCurrentScreen(screen);
  };

  // Показ уведомлений с улучшенной анимацией
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`[NeuropulAI] Enhanced notification: ${type} - ${message}`);
    setShowToast({ message, type });
    
    // Звук для уведомлений
    if (type === 'success') {
      playSound('success', userProgress.soundEnabled);
    } else if (type === 'error') {
      playSound('error', userProgress.soundEnabled);
    } else {
      playSound('click', userProgress.soundEnabled);
    }
    
    setTimeout(() => setShowToast(null), 4000); // Увеличили время показа
  };

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('[NeuropulAI] Enhanced error occurred:', error);
      showNotification(error, 'error');
      clearError();
    }
  }, [error, clearError]);

  // Dev Panel
  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Загрузка NeuropulAI...</p>
          <p className="text-purple-300 text-sm mt-2">Инициализация AI-системы...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen
              userProgress={userProgress}
              onUpdateProgress={updateProgress}
              onNavigate={handleNavigate}
              language={userProgress.language}
            />
          </motion.div>
        )}

        {currentScreen === 'archetype' && (
          <motion.div
            key="archetype"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <ArchetypeScreen
              userProgress={userProgress}
              onUpdateProgress={updateProgress}
              onNavigate={handleNavigate}
              language={userProgress.language}
            />
          </motion.div>
        )}

        {currentScreen === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedDashboard
              userProgress={userProgress}
              onUpdateProgress={updateProgress}
              addXP={addXP}
              onNavigate={handleNavigate}
              language={userProgress.language}
              showNotification={showNotification}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toast уведомления */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, x: 100, scale: 0.8 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white max-w-sm border ${
              showToast.type === 'success' ? 'bg-gradient-to-r from-green-600 to-green-500 border-green-400' :
              showToast.type === 'error' ? 'bg-gradient-to-r from-red-600 to-red-500 border-red-400' : 
              'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">
                {showToast.type === 'success' ? '🎉' : 
                 showToast.type === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <div>
                <div className="font-semibold mb-1">
                  {showToast.type === 'success' ? 'Отлично!' : 
                   showToast.type === 'error' ? 'Внимание!' : 'Информация'}
                </div>
                <div className="text-sm opacity-90">{showToast.message}</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Dev Panel */}
      {isDevMode && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
          <div className="mb-2 font-bold text-green-400">🔧 Enhanced Dev Panel</div>
          <div className="space-y-1">
            <div>Screen: <span className="text-yellow-400">{currentScreen}</span></div>
            <div>Name: <span className="text-blue-400">"{userProgress.userName}"</span></div>
            <div>Archetype: <span className="text-purple-400">{userProgress.archetype || 'none'}</span></div>
            <div>Quest Step: <span className="text-green-400">{userProgress.questStep}</span></div>
            <div>XP: <span className="text-orange-400">{userProgress.xp}</span></div>
            <div>Level: <span className="text-red-400">{userProgress.level}</span></div>
            <div>Tools Used: <span className="text-cyan-400">{userProgress.toolsUsed.length}</span></div>
            <div>Premium: <span className="text-yellow-400">{userProgress.isPremium ? 'Yes' : 'No'}</span></div>
            <div>Streak: <span className="text-pink-400">{userProgress.dailyStreak}</span></div>
          </div>
          <div className="mt-3 space-x-1 flex flex-wrap gap-1">
            <button
              onClick={() => addXP(100)}
              className="bg-green-600 px-2 py-1 rounded text-xs hover:bg-green-700"
            >
              +100 XP
            </button>
            <button
              onClick={() => updateProgress({ isPremium: !userProgress.isPremium })}
              className="bg-yellow-600 px-2 py-1 rounded text-xs hover:bg-yellow-700"
            >
              Toggle Premium
            </button>
            <button
              onClick={resetProgress}
              className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
            >
              Reset
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(exportProgress())}
              className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Export
            </button>
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="bg-purple-600 px-2 py-1 rounded text-xs hover:bg-purple-700"
            >
              → Welcome
            </button>
            <button
              onClick={() => setCurrentScreen('archetype')}
              className="bg-indigo-600 px-2 py-1 rounded text-xs hover:bg-indigo-700"
            >
              → Archetype
            </button>
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="bg-teal-600 px-2 py-1 rounded text-xs hover:bg-teal-700"
            >
              → Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuropulAI;