import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';
import { playSound, vibrate } from '../utils/sounds';
import { getTranslation } from '../constants/translations';
import { UserProgress } from '../types';

interface WelcomeScreenProps {
  userProgress: UserProgress;
  onUpdateProgress: (updates: Partial<UserProgress>) => void;
  onNavigate: (screen: 'archetype' | 'dashboard') => void;
  language: 'ru' | 'uz';
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userProgress,
  onUpdateProgress,
  onNavigate,
  language
}) => {
  // Локальное состояние для input
  const [inputValue, setInputValue] = useState(userProgress.userName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Debug logging функция
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(`[WelcomeScreen Debug]: ${logMessage}`);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]);
  }, []);

  // Инициализация
  useEffect(() => {
    addDebugLog('WelcomeScreen mounted');
    addDebugLog(`Initial userName: "${userProgress.userName}"`);
    addDebugLog(`Initial inputValue: "${inputValue}"`);
    addDebugLog(`User archetype: "${userProgress.archetype}"`);
    addDebugLog(`User XP: ${userProgress.xp}`);
    addDebugLog(`Quest step: ${userProgress.questStep}`);
  }, [addDebugLog, userProgress, inputValue]);

  // Валидация имени
  const validateName = useCallback((name: string): { isValid: boolean; error: string } => {
    addDebugLog(`Validating name: "${name}"`);
    
    if (!name || name.trim().length === 0) {
      const errorMsg = getTranslation('enterNameError', language) || 'Введи своё имя!';
      addDebugLog(`Validation failed: empty name`);
      return { isValid: false, error: errorMsg };
    }
    
    if (name.trim().length < 2) {
      addDebugLog(`Validation failed: name too short (${name.trim().length} chars)`);
      return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
    }
    
    if (name.trim().length > 50) {
      addDebugLog(`Validation failed: name too long (${name.trim().length} chars)`);
      return { isValid: false, error: 'Имя слишком длинное (максимум 50 символов)' };
    }
    
    // Проверка на недопустимые символы
    const invalidChars = /[<>{}[\]\\\/]/;
    if (invalidChars.test(name)) {
      addDebugLog(`Validation failed: invalid characters`);
      return { isValid: false, error: 'Имя содержит недопустимые символы' };
    }
    
    addDebugLog('Name validation passed successfully');
    return { isValid: true, error: '' };
  }, [language, addDebugLog]);

  // Обработчик изменения input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newValue = e.target.value;
      addDebugLog(`Input change: "${inputValue}" -> "${newValue}"`);
      
      // Очищаем ошибку при вводе
      if (error) {
        setError('');
        addDebugLog('Error cleared on input change');
      }
      
      // Обновляем локальное состояние
      setInputValue(newValue);
      addDebugLog('Input value updated successfully');
      
    } catch (err) {
      addDebugLog(`ERROR in handleInputChange: ${err}`);
      console.error('Error in handleInputChange:', err);
      setError('Ошибка при вводе текста');
    }
  }, [error, addDebugLog, inputValue]);

  // Обработчик продолжения
  const handleContinue = useCallback(async () => {
    try {
      addDebugLog('=== CONTINUE BUTTON CLICKED ===');
      addDebugLog(`Current input value: "${inputValue}"`);
      addDebugLog(`Current user progress: ${JSON.stringify(userProgress, null, 2)}`);
      
      setIsLoading(true);
      setError('');
      
      // Валидация
      const validation = validateName(inputValue);
      if (!validation.isValid) {
        addDebugLog(`VALIDATION FAILED: ${validation.error}`);
        setError(validation.error);
        setIsLoading(false);
        playSound('error', userProgress.soundEnabled);
        return;
      }
      
      const trimmedName = inputValue.trim();
      addDebugLog(`Validated name: "${trimmedName}"`);
      
      // Подготавливаем обновления
      const updates: Partial<UserProgress> = {
        userName: trimmedName,
        xp: userProgress.xp + 10, // Бонус за ввод имени
        questStep: Math.max(userProgress.questStep, 1) // Переходим к шагу 1 (выбор архетипа)
      };
      
      addDebugLog(`Prepared updates: ${JSON.stringify(updates, null, 2)}`);
      
      // Сохраняем имя в прогресс
      addDebugLog('Calling onUpdateProgress...');
      onUpdateProgress(updates);
      
      // Звук успеха
      playSound('success', userProgress.soundEnabled);
      vibrate([50], userProgress.vibrationEnabled);
      
      addDebugLog('Progress updated successfully');
      addDebugLog('Playing success sound and vibration');
      
      // Определяем следующий экран
      const nextScreen = userProgress.archetype ? 'dashboard' : 'archetype';
      addDebugLog(`Next screen determined: ${nextScreen}`);
      
      // Небольшая задержка для плавности и завершения сохранения
      setTimeout(() => {
        addDebugLog(`Navigating to: ${nextScreen}`);
        onNavigate(nextScreen);
        addDebugLog('Navigation completed successfully');
      }, 200);
      
    } catch (err) {
      addDebugLog(`CRITICAL ERROR in handleContinue: ${err}`);
      console.error('Critical error in handleContinue:', err);
      setError('Произошла критическая ошибка. Попробуй перезагрузить страницу.');
      playSound('error', userProgress.soundEnabled);
    } finally {
      setIsLoading(false);
      addDebugLog('handleContinue completed (finally block)');
    }
  }, [inputValue, validateName, onUpdateProgress, onNavigate, userProgress, addDebugLog]);

  // Обработчик Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      addDebugLog('Enter key pressed, triggering continue');
      handleContinue();
    }
  }, [handleContinue, isLoading, addDebugLog]);

  // Dev Panel для отладки
  const showDebugPanel = new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Логотип */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {getTranslation('appName', language)}
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            {getTranslation('tagline', language)}
          </p>
        </motion.div>
        
        {/* Форма ввода имени */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder={getTranslation('enterName', language)}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={50}
              className={`w-full px-4 py-3 bg-white bg-opacity-10 border ${
                error ? 'border-red-500' : 'border-white border-opacity-20'
              } rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              autoComplete="given-name"
              autoFocus
            />
            {inputValue && (
              <div className="absolute right-3 top-3 text-purple-300 text-sm">
                {inputValue.length}/50
              </div>
            )}
          </div>
          
          {/* Ошибка */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-500 bg-opacity-20 rounded-lg p-3 border border-red-500 border-opacity-30"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </motion.div>
        
        {/* Кнопка продолжения */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleContinue}
          disabled={isLoading || !inputValue.trim()}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform ${
            isLoading || !inputValue.trim()
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 active:scale-95'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>{getTranslation('startJourney', language)}</span>
              </>
            )}
          </div>
        </motion.button>
        
        <p className="text-purple-300 text-sm mt-4">
          Ты на пути Пробуждения ✨
        </p>
        
        {/* Debug Panel */}
        {showDebugPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-black bg-opacity-80 rounded-lg text-left max-h-96 overflow-y-auto"
          >
            <h3 className="text-white font-bold mb-2">🔧 Debug Panel:</h3>
            <div className="text-xs text-green-400 font-mono space-y-1">
              <div>Input Value: "{inputValue}"</div>
              <div>User Name: "{userProgress.userName}"</div>
              <div>Archetype: {userProgress.archetype || 'none'}</div>
              <div>Quest Step: {userProgress.questStep}</div>
              <div>Is Loading: {isLoading.toString()}</div>
              <div>Error: "{error}"</div>
              <div>XP: {userProgress.xp}</div>
              <div>Level: {userProgress.level}</div>
              <div className="mt-2">
                <div className="text-yellow-400">Recent Logs:</div>
                {debugInfo.map((log, index) => (
                  <div key={index} className="text-gray-300 text-xs">{log}</div>
                ))}
              </div>
            </div>
            <div className="mt-3 space-x-2">
              <button
                onClick={() => {
                  setInputValue('');
                  setError('');
                  setDebugInfo([]);
                  addDebugLog('Debug panel reset');
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Reset Debug
              </button>
              <button
                onClick={() => {
                  const testName = 'TestUser' + Math.floor(Math.random() * 1000);
                  setInputValue(testName);
                  addDebugLog(`Set test name: ${testName}`);
                }}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Test Name
              </button>
              <button
                onClick={() => {
                  addDebugLog('Manual continue test');
                  handleContinue();
                }}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Test Continue
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;