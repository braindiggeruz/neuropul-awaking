import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Crown, Star, Trophy, Zap, Lock, TrendingUp, Award, Target } from 'lucide-react';
import { UserProgress } from '../types';
import { getTranslation } from '../constants/translations';
import { ARCHETYPES, AI_TOOLS, getUserTitle } from '../constants/gameData';
import { playSound } from '../utils/sounds';
import ToolModal from './ToolModal';

interface DashboardProps {
  userProgress: UserProgress;
  onUpdateProgress: (updates: Partial<UserProgress>) => void;
  addXP: (amount: number) => void;
  onNavigate: (screen: 'welcome' | 'archetype') => void;
  language: 'ru' | 'uz';
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userProgress,
  onUpdateProgress,
  addXP,
  onNavigate,
  language,
  showNotification
}) => {
  const [greeting, setGreeting] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<string>('');

  // Получаем данные архетипа
  const currentArchetype = ARCHETYPES.find(a => a.id === userProgress.archetype);
  const userTitle = getUserTitle(userProgress.level, language);

  // Генерируем приветствие и ежедневный вызов
  useEffect(() => {
    console.log('[Dashboard] Enhanced dashboard mounted with user progress:', userProgress);
    
    if (currentArchetype) {
      const phrases = currentArchetype.phrases[language];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setGreeting(randomPhrase);
      console.log('[Dashboard] Set greeting:', randomPhrase);
    } else {
      console.warn('[Dashboard] No archetype found for user');
      setGreeting(language === 'ru' ? 'Добро пожаловать в мир AI!' : 'AI dunyosiga xush kelibsiz!');
    }

    // Генерируем ежедневный вызов
    const challenges = [
      'Создайте мем про AI и поделитесь с друзьями',
      'Сгенерируйте 3 бизнес-идеи и выберите лучшую',
      'Проанализируйте любое изображение и найдите скрытые детали',
      'Напишите код с помощью AI-ассистента',
      'Создайте план MVP для своей идеи'
    ];
    const todayChallenge = challenges[new Date().getDate() % challenges.length];
    setDailyChallenge(todayChallenge);
  }, [currentArchetype, language, userProgress]);

  // Проверка целостности данных
  useEffect(() => {
    if (!userProgress.userName) {
      console.warn('[Dashboard] No username found, redirecting to welcome');
      showNotification('Необходимо ввести имя', 'error');
      onNavigate('welcome');
      return;
    }

    if (!userProgress.archetype) {
      console.warn('[Dashboard] No archetype found, redirecting to archetype selection');
      showNotification('Необходимо выбрать архетип', 'info');
      onNavigate('archetype');
      return;
    }

    console.log('[Dashboard] Enhanced data integrity check passed');
  }, [userProgress.userName, userProgress.archetype, onNavigate, showNotification]);

  // Обработчик тестового добавления XP
  const handleTestXP = () => {
    console.log('[Dashboard] Adding test XP');
    playSound('success', userProgress.soundEnabled);
    addXP(50);
    showNotification('🎉 +50 XP получено! Продолжайте развиваться!', 'success');
  };

  // Обработчик клика по инструменту
  const handleToolClick = (toolId: string) => {
    console.log(`[Dashboard] Enhanced tool clicked: ${toolId}`);
    
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (!tool) {
      console.error(`[Dashboard] Tool not found: ${toolId}`);
      showNotification('Инструмент не найден', 'error');
      return;
    }

    // Проверка Premium доступа
    if (tool.isPremium && !userProgress.isPremium) {
      console.log(`[Dashboard] Premium tool ${toolId} blocked for free user`);
      showNotification('🔒 Этот инструмент доступен только в Premium версии! Разблокируйте все возможности AI 👑', 'error');
      playSound('error', userProgress.soundEnabled);
      return;
    }

    // Открываем модалку инструмента
    console.log(`[Dashboard] Opening enhanced tool modal for: ${toolId}`);
    setSelectedTool(toolId);
    setIsToolModalOpen(true);
    playSound('click', userProgress.soundEnabled);
  };

  // Обработчик закрытия модалки
  const handleCloseToolModal = () => {
    console.log('[Dashboard] Closing enhanced tool modal');
    setIsToolModalOpen(false);
    setSelectedTool(null);
  };

  // Обработчик использования инструмента (вызывается из модалки)
  const handleToolUsed = (toolId: string, xpReward: number) => {
    console.log(`[Dashboard] Enhanced tool used: ${toolId}, XP reward: ${xpReward}`);
    
    // Добавляем XP
    addXP(xpReward);
    
    // Обновляем список использованных инструментов
    const newToolsUsed = [...userProgress.toolsUsed];
    if (!newToolsUsed.includes(toolId)) {
      newToolsUsed.push(toolId);
      onUpdateProgress({ toolsUsed: newToolsUsed });
      console.log(`[Dashboard] Added ${toolId} to used tools list`);
    }

    // Показываем уведомление с мотивацией
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool) {
      const motivationalMessages = [
        `🎉 Отлично! +${xpReward} XP за ${tool.name[language]}! Вы становитесь AI-мастером!`,
        `⚡ Потрясающе! +${xpReward} XP! Ваши навыки работы с AI растут!`,
        `🚀 Великолепно! +${xpReward} XP! Продолжайте исследовать возможности AI!`,
        `🌟 Браво! +${xpReward} XP! Вы на пути к AI-мастерству!`
      ];
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      showNotification(randomMessage, 'success');
    }
  };

  // Получаем выбранный инструмент для модалки
  const selectedToolData = selectedTool ? AI_TOOLS.find(t => t.id === selectedTool) : null;

  // Расчет прогресса до следующего уровня
  const nextLevelXP = userProgress.level < 9 ? [50, 100, 150, 250, 400, 600, 850, 1200, 1600][userProgress.level] : 9999;
  const currentLevelXP = userProgress.level > 0 ? [0, 50, 100, 150, 250, 400, 600, 850, 1200][userProgress.level - 1] : 0;
  const progressPercent = ((userProgress.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Enhanced Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {getTranslation('appName', language)}
                </h1>
                <div className="flex items-center space-x-2 text-purple-200 text-sm">
                  <span>Привет, <span className="font-semibold text-white">{userProgress.userName}</span>!</span>
                  {currentArchetype && (
                    <span className="flex items-center space-x-1">
                      <span>{currentArchetype.icon}</span>
                      <span>{currentArchetype.name[language]}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProgress.isPremium && (
                <div className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold">PRO</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-white">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{userProgress.dailyStreak}</span>
              </div>

              <div className="flex items-center space-x-1 text-white">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{userProgress.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {greeting}
          </h2>
          <div className="flex justify-center items-center space-x-6 text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>{userTitle}</span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div>Уровень {userProgress.level}</div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div>{userProgress.xp} XP</div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-purple-300 mb-2">
              <span>До уровня {userProgress.level + 1}</span>
              <span>{Math.max(0, nextLevelXP - userProgress.xp)} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Вызов дня
                </h3>
                <p className="text-orange-100">{dailyChallenge}</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Уровень</h3>
                <p className="text-2xl font-bold">{userProgress.level}</p>
                <p className="text-xs text-purple-200">{userTitle}</p>
              </div>
              <Trophy className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Опыт</h3>
                <p className="text-2xl font-bold">{userProgress.xp}</p>
                <p className="text-xs text-green-200">+{Math.floor(userProgress.xp / 10)} сегодня</p>
              </div>
              <Zap className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Streak</h3>
                <p className="text-2xl font-bold">{userProgress.dailyStreak}</p>
                <p className="text-xs text-orange-200">дней подряд</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Мастерство</h3>
                <p className="text-2xl font-bold">{userProgress.toolsUsed.length}</p>
                <p className="text-xs text-indigo-200">из {AI_TOOLS.length} инструментов</p>
              </div>
              <Brain className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Enhanced AI Tools Section */}
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
              <span className="ml-3 text-sm text-purple-300 font-normal">
                ({userProgress.toolsUsed.length}/{AI_TOOLS.length} освоено)
              </span>
            </h3>
            <div className="flex items-center space-x-2 text-purple-300 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Ваш прогресс: {Math.round((userProgress.toolsUsed.length / AI_TOOLS.length) * 100)}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_TOOLS.map((tool, index) => {
              const isUsed = userProgress.toolsUsed.includes(tool.id);
              const isLocked = tool.isPremium && !userProgress.isPremium;
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`relative bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 transition-all duration-300 ${
                    isLocked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-opacity-20 cursor-pointer transform hover:scale-105 hover:shadow-xl'
                  }`}
                  onClick={() => !isLocked && handleToolClick(tool.id)}
                >
                  {/* Premium Lock Overlay */}
                  {isLocked && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 bg-opacity-20 p-2 rounded-full">
                        <Lock className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  )}

                  {/* Used Badge */}
                  {isUsed && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-green-500 bg-opacity-20 p-1 rounded-full">
                        <Award className="w-3 h-3 text-green-400" />
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-4xl mb-3">{tool.icon}</div>
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center justify-center">
                      {tool.name[language]}
                      {tool.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-400 ml-2" />
                      )}
                    </h4>
                    <p className="text-purple-200 text-sm mb-4 leading-relaxed">
                      {tool.description[language]}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-xs mb-3">
                      <span className="bg-purple-500 bg-opacity-30 px-2 py-1 rounded text-purple-300">
                        +{tool.xpReward} XP
                      </span>
                      {isUsed && (
                        <span className="bg-green-500 bg-opacity-30 px-2 py-1 rounded text-green-300">
                          ✓ Освоено
                        </span>
                      )}
                    </div>

                    {isLocked ? (
                      <div className="text-xs text-yellow-400 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                        🔒 Premium инструмент
                      </div>
                    ) : (
                      <div className="text-xs text-purple-300">
                        {isUsed ? '🎯 Нажмите для повторного использования' : '✨ Нажмите для изучения'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Test Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={handleTestXP}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎁 Бонус +50 XP
          </button>
          
          <div className="mt-6 space-x-4">
            <button
              onClick={() => onNavigate('archetype')}
              className="text-purple-300 hover:text-white transition-colors text-sm"
            >
              ← Сменить архетип
            </button>
            <button
              onClick={() => onNavigate('welcome')}
              className="text-purple-300 hover:text-white transition-colors text-sm"
            >
              ← Сменить имя
            </button>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-purple-300 text-sm">
            🎉 Добро пожаловать в мир AI-мастерства! Исследуйте инструменты и развивайтесь!
          </p>
        </div>
      </div>

      {/* Enhanced Tool Modal */}
      {selectedToolData && (
        <ToolModal
          tool={selectedToolData}
          isOpen={isToolModalOpen}
          onClose={handleCloseToolModal}
          onToolUsed={handleToolUsed}
          language={language}
          soundEnabled={userProgress.soundEnabled}
          vibrationEnabled={userProgress.vibrationEnabled}
        />
      )}
    </div>
  );
};

export default Dashboard;