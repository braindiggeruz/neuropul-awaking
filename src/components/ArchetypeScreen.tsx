import React from 'react';
import { motion } from 'framer-motion';
import { ARCHETYPES } from '../constants/gameData';
import { getTranslation } from '../constants/translations';
import { UserProgress } from '../types';
import { playSound, vibrate } from '../utils/sounds';

interface ArchetypeScreenProps {
  userProgress: UserProgress;
  onUpdateProgress: (updates: Partial<UserProgress>) => void;
  onNavigate: (screen: 'welcome' | 'dashboard') => void;
  language: 'ru' | 'uz';
}

const ArchetypeScreen: React.FC<ArchetypeScreenProps> = ({
  userProgress,
  onUpdateProgress,
  onNavigate,
  language
}) => {
  const handleArchetypeSelect = (archetypeId: string) => {
    const archetype = ARCHETYPES.find(a => a.id === archetypeId);
    if (!archetype) {
      console.error(`[ArchetypeScreen] Archetype not found: ${archetypeId}`);
      return;
    }

    console.log(`[ArchetypeScreen] Selecting archetype: ${archetypeId}`);
    console.log(`[ArchetypeScreen] Current user progress:`, userProgress);

    playSound('success', userProgress.soundEnabled);
    vibrate([100], userProgress.vibrationEnabled);

    // Подготавливаем обновления
    const updates: Partial<UserProgress> = {
      archetype: archetypeId,
      xp: userProgress.xp + 25, // Бонус за выбор архетипа
      questStep: Math.max(userProgress.questStep, 2) // Переходим к шагу 2 (dashboard)
    };

    console.log(`[ArchetypeScreen] Prepared updates:`, updates);

    onUpdateProgress(updates);

    // Переход к дашборду с задержкой для плавности
    setTimeout(() => {
      console.log(`[ArchetypeScreen] Navigating to dashboard`);
      onNavigate('dashboard');
    }, 500);
  };

  const handleBackToWelcome = () => {
    console.log(`[ArchetypeScreen] Going back to welcome screen`);
    playSound('click', userProgress.soundEnabled);
    onNavigate('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            {getTranslation('chooseArchetype', language)}
          </h1>
          <p className="text-purple-200 mb-2">
            {getTranslation('archetypeDescription', language)}
          </p>
          <p className="text-purple-300 text-sm">
            Привет, <span className="font-semibold text-white">{userProgress.userName}</span>! 
            Выбери свой путь развития 🚀
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ARCHETYPES.map((archetype, index) => (
            <motion.button
              key={archetype.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleArchetypeSelect(archetype.id)}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${archetype.gradient} rounded-full flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {archetype.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {archetype.name[language]}
                </h3>
                <p className="text-purple-200 text-sm">
                  {archetype.description[language]}
                </p>
                <div className="mt-3 text-xs text-purple-300">
                  +25 XP за выбор
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleBackToWelcome}
            className="text-purple-300 hover:text-white transition-colors duration-300 flex items-center justify-center mx-auto space-x-2"
          >
            <span>←</span>
            <span>{getTranslation('back', language)}</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
          <p className="text-purple-300 text-sm">
            Шаг 2 из 3: Выбор архетипа
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchetypeScreen;