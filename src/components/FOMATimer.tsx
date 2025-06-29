import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Crown, X, Zap, Star } from 'lucide-react';
import { UserProgress } from '../types';
import { playSound, vibrate } from '../utils/sounds';

interface FOMATimerProps {
  userProgress: UserProgress;
  onUpdateProgress: (updates: Partial<UserProgress>) => void;
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const FOMATimer: React.FC<FOMATimerProps> = ({
  userProgress,
  onUpdateProgress,
  isVisible,
  onClose,
  onUpgrade
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 минут
  const [spotsLeft, setSpotsLeft] = useState(3);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        
        if (prev <= 120) { // Последние 2 минуты
          setIsUrgent(true);
          if (prev % 30 === 0) { // Каждые 30 секунд
            playSound('error', userProgress.soundEnabled);
            vibrate([100, 100, 100], userProgress.vibrationEnabled);
          }
        }
        
        return prev - 1;
      });
    }, 1000);

    // Симуляция уменьшения мест
    const spotsTimer = setInterval(() => {
      setSpotsLeft(prev => Math.max(1, prev - 1));
    }, 180000); // Каждые 3 минуты

    return () => {
      clearInterval(timer);
      clearInterval(spotsTimer);
    };
  }, [isVisible, userProgress.soundEnabled, userProgress.vibrationEnabled, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpgrade = () => {
    playSound('success', userProgress.soundEnabled);
    vibrate([100, 50, 100], userProgress.vibrationEnabled);
    
    onUpdateProgress({
      isPremium: true,
      premiumTier: 'pro',
      hasSeenFomo: true,
      fomoStart: null
    });
    
    onUpgrade();
    onClose();
  };

  const handleClose = () => {
    playSound('click', userProgress.soundEnabled);
    onUpdateProgress({ hasSeenFomo: true });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className={`bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border-2 ${
            isUrgent ? 'border-red-500 animate-pulse' : 'border-yellow-500'
          } shadow-2xl`}
        >
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white hover:bg-opacity-10 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: isUrgent ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
              className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className={`text-2xl font-bold mb-2 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
              {isUrgent ? '🚨 ПОСЛЕДНИЙ ШАНС!' : '⚡ ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ!'}
            </h2>
            
            <p className="text-white text-lg">
              Разблокируй все AI-инструменты
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
              <Clock className="w-8 h-8 inline mr-2" />
              {formatTime(timeLeft)}
            </div>
            <p className="text-purple-200 text-sm">
              до окончания предложения
            </p>
          </div>

          {/* Urgency Indicators */}
          <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Осталось мест:</span>
              <span className={`font-bold ${spotsLeft <= 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                {spotsLeft}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Скидка:</span>
              <span className="text-green-400 font-bold">-70%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Бонус XP:</span>
              <span className="text-blue-400 font-bold">+500 XP</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Что получишь:
            </h3>
            <ul className="space-y-2 text-sm text-purple-200">
              <li className="flex items-center">
                <Zap className="w-3 h-3 mr-2 text-blue-400" />
                Все AI-инструменты разблокированы
              </li>
              <li className="flex items-center">
                <Zap className="w-3 h-3 mr-2 text-green-400" />
                +50% больше XP за каждое действие
              </li>
              <li className="flex items-center">
                <Zap className="w-3 h-3 mr-2 text-purple-400" />
                Приоритетная поддержка от Trae
              </li>
              <li className="flex items-center">
                <Zap className="w-3 h-3 mr-2 text-yellow-400" />
                Эксклюзивные челленджи и награды
              </li>
              <li className="flex items-center">
                <Zap className="w-3 h-3 mr-2 text-red-400" />
                Сертификат AI-мастера
              </li>
            </ul>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-gray-400 line-through text-lg">$29.99</span>
              <span className="text-green-400 text-3xl font-bold">$8.99</span>
            </div>
            <p className="text-purple-200 text-sm">
              Навсегда! Без подписки.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgrade}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                isUrgent 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
              } text-white shadow-lg`}
            >
              🚀 РАЗБЛОКИРОВАТЬ СЕЙЧАС
            </motion.button>
            
            <button
              onClick={handleClose}
              className="w-full py-2 text-purple-300 hover:text-white transition-colors text-sm"
            >
              Может быть позже
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-purple-300 text-xs">
              💎 Присоединяйся к {1247 - spotsLeft} AI-мастерам!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FOMATimer;