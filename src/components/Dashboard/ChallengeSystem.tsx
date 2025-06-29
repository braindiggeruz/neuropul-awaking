import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Trophy, Zap, CheckCircle } from 'lucide-react';
import { logError } from '../../lib/utils/errorLogger';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: string;
  isCompleted: boolean;
  expiresAt?: Date;
}

interface ChallengeSystemProps {
  userXP: number;
  onChallengeComplete: (xpReward: number) => void;
  soundEnabled?: boolean;
}

const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  userXP,
  onChallengeComplete,
  soundEnabled = true
}) => {
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate daily challenge
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const savedDaily = localStorage.getItem(`daily_challenge_${today}`);
      
      if (savedDaily) {
        try {
          const parsedChallenge = JSON.parse(savedDaily);
          // Convert expiresAt string back to Date object if it exists
          if (parsedChallenge.expiresAt) {
            parsedChallenge.expiresAt = new Date(parsedChallenge.expiresAt);
          }
          setDailyChallenge(parsedChallenge);
        } catch (error) {
          logError(error, {
            component: 'ChallengeSystem',
            action: 'parseDailyChallenge'
          });
          const newChallenge = generateDailyChallenge();
          setDailyChallenge(newChallenge);
          localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(newChallenge));
        }
      } else {
        const newChallenge = generateDailyChallenge();
        setDailyChallenge(newChallenge);
        localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(newChallenge));
      }
    } catch (error) {
      logError(error, {
        component: 'ChallengeSystem',
        action: 'initDailyChallenge'
      });
      setError('Не удалось загрузить ежедневный вызов');
    }
  }, []);

  // Generate weekly challenge
  useEffect(() => {
    try {
      const weekStart = getWeekStart();
      const savedWeekly = localStorage.getItem(`weekly_challenge_${weekStart}`);
      
      if (savedWeekly) {
        try {
          const parsedChallenge = JSON.parse(savedWeekly);
          // Convert expiresAt string back to Date object if it exists
          if (parsedChallenge.expiresAt) {
            parsedChallenge.expiresAt = new Date(parsedChallenge.expiresAt);
          }
          setWeeklyChallenge(parsedChallenge);
        } catch (error) {
          logError(error, {
            component: 'ChallengeSystem',
            action: 'parseWeeklyChallenge'
          });
          const newChallenge = generateWeeklyChallenge();
          setWeeklyChallenge(newChallenge);
          localStorage.setItem(`weekly_challenge_${weekStart}`, JSON.stringify(newChallenge));
        }
      } else {
        const newChallenge = generateWeeklyChallenge();
        setWeeklyChallenge(newChallenge);
        localStorage.setItem(`weekly_challenge_${weekStart}`, JSON.stringify(newChallenge));
      }
    } catch (error) {
      logError(error, {
        component: 'ChallengeSystem',
        action: 'initWeeklyChallenge'
      });
      setError('Не удалось загрузить еженедельный вызов');
    }
  }, []);

  const generateDailyChallenge = (): Challenge => {
    const challenges = [
      {
        id: 'daily_mindmap',
        title: 'Картограф Знаний',
        description: 'Создай интеллект-карту на тему, которую ты не знаешь',
        icon: '🗺️',
        xpReward: 50,
        requirement: 'mindmap_created'
      },
      {
        id: 'daily_quiz',
        title: 'Мозговой Штурм',
        description: 'Ответь правильно на 5 вопросов квиза подряд',
        icon: '🧠',
        xpReward: 75,
        requirement: 'quiz_perfect'
      },
      {
        id: 'daily_meme',
        title: 'Мем-Мастер',
        description: 'Создай мем, описывающий твоё текущее состояние',
        icon: '😂',
        xpReward: 40,
        requirement: 'meme_created'
      },
      {
        id: 'daily_trae',
        title: 'Беседа с Мудрецом',
        description: 'Получи совет от Trae по развитию AI-навыков',
        icon: '🧙‍♂️',
        xpReward: 30,
        requirement: 'trae_consulted'
      }
    ];

    // Use deterministic selection based on date
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const challengeIndex = dayOfYear % challenges.length;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      ...challenges[challengeIndex],
      isCompleted: false,
      expiresAt: tomorrow
    };
  };

  const generateWeeklyChallenge = (): Challenge => {
    const challenges = [
      {
        id: 'weekly_explorer',
        title: 'AI-Исследователь',
        description: 'Используй все доступные инструменты в течение недели',
        icon: '🚀',
        xpReward: 200,
        requirement: 'all_tools_used'
      },
      {
        id: 'weekly_master',
        title: 'Мастер Промптов',
        description: 'Создай 10 качественных запросов к AI',
        icon: '⚡',
        xpReward: 150,
        requirement: 'quality_prompts'
      }
    ];

    // Use deterministic selection based on week number
    const now = new Date();
    const weekOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 7));
    const challengeIndex = weekOfYear % challenges.length;
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);

    return {
      ...challenges[challengeIndex],
      isCompleted: false,
      expiresAt: nextWeek
    };
  };

  const getWeekStart = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    return weekStart.toDateString();
  };

  const completeChallenge = (challenge: Challenge) => {
    if (challenge.isCompleted) return;

    try {
      // Play success sound
      if (soundEnabled) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // Vibration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      // Update challenge
      const updatedChallenge = { ...challenge, isCompleted: true };
      
      if (challenge.id.startsWith('daily_')) {
        setDailyChallenge(updatedChallenge);
        const today = new Date().toDateString();
        localStorage.setItem(`daily_challenge_${today}`, JSON.stringify(updatedChallenge));
      } else {
        setWeeklyChallenge(updatedChallenge);
        const weekStart = getWeekStart();
        localStorage.setItem(`weekly_challenge_${weekStart}`, JSON.stringify(updatedChallenge));
      }

      // Award XP
      onChallengeComplete(challenge.xpReward);
    } catch (error) {
      logError(error, {
        component: 'ChallengeSystem',
        action: 'completeChallenge',
        additionalData: { challengeId: challenge.id }
      });
      setError('Не удалось завершить вызов');
    }
  };

  const getTimeRemaining = (expiresAt?: Date): string => {
    if (!expiresAt) return '';
    
    try {
      const now = new Date();
      // Ensure expiresAt is a Date object
      const expDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      
      // Validate that the date is valid
      if (isNaN(expDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      const diff = expDate.getTime() - now.getTime();
      
      if (diff <= 0) return 'Истекло';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}д ${hours % 24}ч`;
      }
      
      return `${hours}ч ${minutes}м`;
    } catch (error) {
      logError(error, {
        component: 'ChallengeSystem',
        action: 'getTimeRemaining',
        additionalData: { expiresAt: expiresAt?.toString() }
      });
      return 'Неизвестно';
    }
  };

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
        <p className="font-semibold">Ошибка загрузки челленджей</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Обновить страницу
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Target className="w-7 h-7 mr-3 text-orange-400" />
          Активные Вызовы
        </h3>
        <div className="text-orange-400 text-sm">
          Испытай себя и получи XP!
        </div>
      </div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-gradient-to-r from-orange-900/30 to-red-900/30 border rounded-xl p-6 ${
            dailyChallenge.isCompleted 
              ? 'border-green-500/50 bg-green-900/20' 
              : 'border-orange-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{dailyChallenge.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-white font-bold text-lg">{dailyChallenge.title}</h4>
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                    ЕЖЕДНЕВНЫЙ
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{dailyChallenge.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Zap className="w-4 h-4 mr-1" />
                    +{dailyChallenge.xpReward} XP
                  </div>
                  <div className="flex items-center text-orange-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {getTimeRemaining(dailyChallenge.expiresAt)}
                  </div>
                </div>
              </div>
            </div>
            
            {dailyChallenge.isCompleted ? (
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="font-semibold">Завершено!</span>
              </div>
            ) : (
              <motion.button
                onClick={() => completeChallenge(dailyChallenge)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Выполнить
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-r from-purple-900/30 to-blue-900/30 border rounded-xl p-6 ${
            weeklyChallenge.isCompleted 
              ? 'border-green-500/50 bg-green-900/20' 
              : 'border-purple-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{weeklyChallenge.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-white font-bold text-lg">{weeklyChallenge.title}</h4>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                    НЕДЕЛЬНЫЙ
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{weeklyChallenge.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Zap className="w-4 h-4 mr-1" />
                    +{weeklyChallenge.xpReward} XP
                  </div>
                  <div className="flex items-center text-purple-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {getTimeRemaining(weeklyChallenge.expiresAt)}
                  </div>
                </div>
              </div>
            </div>
            
            {weeklyChallenge.isCompleted ? (
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="font-semibold">Завершено!</span>
              </div>
            ) : (
              <motion.button
                onClick={() => completeChallenge(weeklyChallenge)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Выполнить
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Challenge Completion Effect */}
      <AnimatePresence>
        {(dailyChallenge?.isCompleted || weeklyChallenge?.isCompleted) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2 }}
              className="text-6xl"
            >
              🏆
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChallengeSystem;