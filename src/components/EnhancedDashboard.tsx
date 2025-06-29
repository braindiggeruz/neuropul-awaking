import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Trophy, Star, Map, Smile, HelpCircle, FileText, MessageCircle, Target } from 'lucide-react';
import { UserProgress } from '../types';
import { useStorage } from '../lib/utils/storage';
import XPLevelTracker from './Dashboard/XPLevelTracker';
import ChallengeSystem from './Dashboard/ChallengeSystem';
import QuizModule from './Dashboard/QuizModule';
import MindMapModule from './Dashboard/MindMapModule';
import MemeGenerator from './Dashboard/MemeGenerator';
import TraeAssistant from './Dashboard/TraeAssistant';

interface EnhancedDashboardProps {
  userProgress: UserProgress;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ userProgress: initialProgress }) => {
  const [userProgress, setUserProgress] = useState(initialProgress);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { saveProgress, addXP } = useStorage();

  // Update progress when XP changes
  useEffect(() => {
    const newLevel = Math.floor(userProgress.xp / 100) + 1;
    if (newLevel > userProgress.level) {
      // Level up!
      const updatedProgress = { ...userProgress, level: newLevel };
      setUserProgress(updatedProgress);
      saveProgress(updatedProgress);
      
      // Play level up sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [userProgress.xp]);

  const handleXPEarned = (amount: number) => {
    const updatedProgress = { ...userProgress, xp: userProgress.xp + amount };
    setUserProgress(updatedProgress);
    saveProgress(updatedProgress);
  };

  const handleChallengeComplete = (xpReward: number) => {
    handleXPEarned(xpReward);
  };

  const openModule = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const closeModule = () => {
    setActiveModule(null);
  };

  const progressPercent = (userProgress.xp % 100);
  const nextLevelXP = 100 - progressPercent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Enhanced Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={userProgress.avatarUrl}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-cyan-500"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  NeuropulAI
                </h1>
                <p className="text-cyan-400 text-sm">
                  Добро пожаловать, {userProgress.name}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Trae Button */}
              <button
                onClick={() => openModule('trae')}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Trae</span>
              </button>

              <div className="flex items-center space-x-2 bg-purple-600/20 px-3 py-1 rounded-full">
                <span className="text-purple-400 text-sm">{userProgress.archetype}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-white">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{userProgress.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Твой путь {userProgress.archetype} продолжается
          </h2>
          <div className="flex justify-center items-center space-x-6 text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Уровень {userProgress.level}</span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div>{userProgress.xp} XP</div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div>До следующего: {nextLevelXP} XP</div>
          </div>
        </motion.div>

        {/* Prophecy */}
        {userProgress.prophecy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
              <h3 className="text-yellow-400 text-lg font-semibold mb-3">
                🔮 Твоё Пророчество
              </h3>
              <p className="text-yellow-200 text-lg italic">
                "{userProgress.prophecy}"
              </p>
            </div>
          </motion.div>
        )}

        {/* XP Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <XPLevelTracker
            xp={userProgress.xp}
            level={userProgress.level}
            soundEnabled={true}
          />
        </motion.div>

        {/* Challenge System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <ChallengeSystem
            userXP={userProgress.xp}
            onChallengeComplete={handleChallengeComplete}
            soundEnabled={true}
          />
        </motion.div>

        {/* AI Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Brain className="w-8 h-8 mr-3 text-purple-400" />
              AI-Инструменты
            </h3>
            <div className="text-purple-300 text-sm">
              Используй инструменты для получения XP!
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mind Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => openModule('mindmap')}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <Map className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Mind Map
                </h4>
                <p className="text-purple-200 text-sm mb-4">
                  Создавай интеллект-карты с помощью AI
                </p>
                <div className="text-xs text-purple-300">
                  +20 XP за использование
                </div>
              </div>
            </motion.div>

            {/* Meme Generator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={() => openModule('meme')}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <Smile className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Мем-Генератор
                </h4>
                <p className="text-purple-200 text-sm mb-4">
                  Создавай вирусные мемы
                </p>
                <div className="text-xs text-purple-300">
                  +15 XP за создание
                </div>
              </div>
            </motion.div>

            {/* Quiz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => openModule('quiz')}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  Trivia Quiz
                </h4>
                <p className="text-purple-200 text-sm mb-4">
                  Проверь свои знания
                </p>
                <div className="text-xs text-purple-300">
                  +10 XP за правильный ответ
                </div>
              </div>
            </motion.div>

            {/* AI Helper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={() => openModule('trae')}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  AI-Помощник Trae
                </h4>
                <p className="text-purple-200 text-sm mb-4">
                  Получи совет от AI-наставника
                </p>
                <div className="text-xs text-purple-300">
                  Бесплатные консультации
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* PDF Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">
              📜 Создать PDF-отчёт
            </h3>
            <p className="text-green-100 mb-6">
              Сгенерируй детальный отчёт о своём прогрессе и достижениях
            </p>
            <button className="bg-white text-green-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto">
              <FileText className="w-5 h-5" />
              <span>Создать Отчёт</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <QuizModule
        isOpen={activeModule === 'quiz'}
        onClose={closeModule}
        onXPEarned={handleXPEarned}
        soundEnabled={true}
      />

      <MindMapModule
        isOpen={activeModule === 'mindmap'}
        onClose={closeModule}
        onXPEarned={handleXPEarned}
        soundEnabled={true}
      />

      <MemeGenerator
        isOpen={activeModule === 'meme'}
        onClose={closeModule}
        onXPEarned={handleXPEarned}
        userXP={userProgress.xp}
        soundEnabled={true}
      />

      <TraeAssistant
        isOpen={activeModule === 'trae'}
        onClose={closeModule}
        userName={userProgress.name}
        userArchetype={userProgress.archetype}
        userXP={userProgress.xp}
        soundEnabled={true}
      />
    </div>
  );
};

export default EnhancedDashboard;