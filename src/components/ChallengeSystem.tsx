import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, Clock, Star, Zap, CheckCircle, Lock } from 'lucide-react';
import { UserProgress } from '../types';
import { playSound, vibrate } from '../utils/sounds';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: 'tools_used' | 'xp_earned' | 'daily_streak' | 'level_reached';
    value: number;
  };
  timeLimit?: number; // в часах
  isDaily?: boolean;
  isPremium?: boolean;
}

interface ChallengeSystemProps {
  userProgress: UserProgress;
  onUpdateProgress: (updates: Partial<UserProgress>) => void;
  addXP: (amount: number) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'first_tool',
    title: 'Первые шаги',
    description: 'Используй любой AI-инструмент',
    icon: '🚀',
    xpReward: 50,
    requirement: { type: 'tools_used', value: 1 }
  },
  {
    id: 'tool_explorer',
    title: 'Исследователь',
    description: 'Попробуй 3 разных инструмента',
    icon: '🔍',
    xpReward: 100,
    requirement: { type: 'tools_used', value: 3 }
  },
  {
    id: 'ai_master',
    title: 'AI-Мастер',
    description: 'Освой все инструменты',
    icon: '👑',
    xpReward: 300,
    requirement: { type: 'tools_used', value: 5 }
  },
  {
    id: 'xp_hunter',
    title: 'Охотник за опытом',
    description: 'Набери 200 XP',
    icon: '⚡',
    xpReward: 75,
    requirement: { type: 'xp_earned', value: 200 }
  },
  {
    id: 'streak_master',
    title: 'Постоянство',
    description: 'Заходи 3 дня подряд',
    icon: '🔥',
    xpReward: 150,
    requirement: { type: 'daily_streak', value: 3 }
  },
  {
    id: 'level_up',
    title: 'Восхождение',
    description: 'Достигни 3 уровня',
    icon: '📈',
    xpReward: 200,
    requirement: { type: 'level_reached', value: 3 }
  },
  {
    id: 'daily_creator',
    title: 'Ежедневный творец',
    description: 'Создай 5 работ за день',
    icon: '🎨',
    xpReward: 100,
    requirement: { type: 'tools_used', value: 5 },
    timeLimit: 24,
    isDaily: true
  },
  {
    id: 'premium_explorer',
    title: 'Premium исследователь',
    description: 'Используй MVP-генератор',
    icon: '💎',
    xpReward: 250,
    requirement: { type: 'tools_used', value: 1 },
    isPremium: true
  }
];

const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  userProgress,
  onUpdateProgress,
  addXP,
  showNotification
}) => {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newlyCompleted, setNewlyCompleted] = useState<Challenge | null>(null);

  // Загрузка завершенных челленджей из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('neuropul_completed_challenges');
    if (saved) {
      setCompletedChallenges(JSON.parse(saved));
    }
  }, []);

  // Сохранение завершенных челленджей
  useEffect(() => {
    localStorage.setItem('neuropul_completed_challenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  // Обновление доступных челленджей
  useEffect(() => {
    const available = CHALLENGES.filter(challenge => {
      // Исключаем уже завершенные
      if (completedChallenges.includes(challenge.id)) return false;
      
      // Проверяем Premium требования
      if (challenge.isPremium && !userProgress.isPremium) return false;
      
      return true;
    });
    
    setAvailableChallenges(available);
  }, [completedChallenges, userProgress.isPremium]);

  // Проверка завершения челленджей
  useEffect(() => {
    availableChallenges.forEach(challenge => {
      if (isChallengeCompleted(challenge)) {
        completeChallenge(challenge);
      }
    });
  }, [userProgress, availableChallenges]);

  const isChallengeCompleted = (challenge: Challenge): boolean => {
    switch (challenge.requirement.type) {
      case 'tools_used':
        if (challenge.id === 'premium_explorer') {
          return userProgress.toolsUsed.includes('mvp-generator');
        }
        return userProgress.toolsUsed.length >= challenge.requirement.value;
      case 'xp_earned':
        return userProgress.xp >= challenge.requirement.value;
      case 'daily_streak':
        return userProgress.dailyStreak >= challenge.requirement.value;
      case 'level_reached':
        return userProgress.level >= challenge.requirement.value;
      default:
        return false;
    }
  };

  const completeChallenge = (challenge: Challenge) => {
    if (completedChallenges.includes(challenge.id)) return;
    
    console.log(`[ChallengeSystem] Challenge completed: ${challenge.id}`);
    
    // Добавляем в завершенные
    setCompletedChallenges(prev => [...prev, challenge.id]);
    
    // Добавляем XP
    addXP(challenge.xpReward);
    
    // Показываем уведомление
    setNewlyCompleted(challenge);
    setShowChallengeModal(true);
    
    // Звук и вибрация
    playSound('levelup', userProgress.soundEnabled);
    vibrate([100, 50, 100, 50, 100], userProgress.vibrationEnabled);
    
    // Уведомление
    showNotification(
      `🏆 Челлендж "${challenge.title}" завершен! +${challenge.xpReward} XP!`,
      'success'
    );
  };

  const getProgressPercent = (challenge: Challenge): number => {
    switch (challenge.requirement.type) {
      case 'tools_used':
        if (challenge.id === 'premium_explorer') {
          return userProgress.toolsUsed.includes('mvp-generator') ? 100 : 0;
        }
        return Math.min(100, (userProgress.toolsUsed.length / challenge.requirement.value) * 100);
      case 'xp_earned':
        return Math.min(100, (userProgress.xp / challenge.requirement.value) * 100);
      case 'daily_streak':
        return Math.min(100, (userProgress.dailyStreak / challenge.requirement.value) * 100);
      case 'level_reached':
        return Math.min(100, (userProgress.level / challenge.requirement.value) * 100);
      default:
        return 0;
    }
  };

  const getCurrentValue = (challenge: Challenge): number => {
    switch (challenge.requirement.type) {
      case 'tools_used':
        return challenge.id === 'premium_explorer' ? 
          (userProgress.toolsUsed.includes('mvp-generator') ? 1 : 0) :
          userProgress.toolsUsed.length;
      case 'xp_earned':
        return userProgress.xp;
      case 'daily_streak':
        return userProgress.dailyStreak;
      case 'level_reached':
        return userProgress.level;
      default:
        return 0;
    }
  };

  const handleCloseModal = () => {
    setShowChallengeModal(false);
    setNewlyCompleted(null);
    playSound('click', userProgress.soundEnabled);
  };

  return (
    <>
      {/* Challenge List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Target className="w-6 h-6 mr-2 text-orange-400" />
            Челленджи
          </h3>
          <div className="text-sm text-purple-300">
            {completedChallenges.length}/{CHALLENGES.length} завершено
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Активные челленджи */}
          {availableChallenges.slice(0, 4).map((challenge) => {
            const progress = getProgressPercent(challenge);
            const currentValue = getCurrentValue(challenge);
            const isCompleted = progress >= 100;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-4 ${
                  isCompleted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{challenge.icon}</div>
                    <div>
                      <h4 className="text-white font-semibold">{challenge.title}</h4>
                      <p className="text-purple-200 text-sm">{challenge.description}</p>
                    </div>
                  </div>
                  {challenge.isPremium && (
                    <div className="bg-yellow-500 bg-opacity-20 p-1 rounded">
                      <Lock className="w-3 h-3 text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-purple-300 mb-1">
                    <span>{currentValue}/{challenge.requirement.value}</span>
                    <span>+{challenge.xpReward} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-purple-300">
                    {challenge.isDaily && (
                      <span className="bg-orange-500 bg-opacity-20 px-2 py-1 rounded text-orange-400 mr-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Ежедневный
                      </span>
                    )}
                    {challenge.timeLimit && (
                      <span>⏰ {challenge.timeLimit}ч</span>
                    )}
                  </div>
                  {isCompleted && (
                    <div className="text-green-400 text-sm font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Готово!
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completed Challenges Summary */}
        {completedChallenges.length > 0 && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">
                  Завершено челленджей: {completedChallenges.length}
                </span>
              </div>
              <div className="text-green-400 text-sm">
                +{CHALLENGES.filter(c => completedChallenges.includes(c.id))
                  .reduce((sum, c) => sum + c.xpReward, 0)} XP
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Completion Modal */}
      <AnimatePresence>
        {showChallengeModal && newlyCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-green-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border border-green-500 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  🎉 Челлендж завершен!
                </h2>

                <div className="text-4xl mb-4">{newlyCompleted.icon}</div>

                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  {newlyCompleted.title}
                </h3>

                <p className="text-purple-200 mb-6">
                  {newlyCompleted.description}
                </p>

                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-green-400 text-xl font-bold">
                    <Zap className="w-6 h-6" />
                    <span>+{newlyCompleted.xpReward} XP</span>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Продолжить путь! 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChallengeSystem;