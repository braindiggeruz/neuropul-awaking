import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Users, Clock, Trophy, Zap, Target, Crown, Star } from 'lucide-react';
import { useSocialEngine, PvPMatch } from '../../hooks/useSocialEngine';

interface PvPArenaProps {
  tgId: string;
  onClose: () => void;
}

const PvPArena: React.FC<PvPArenaProps> = ({ tgId, onClose }) => {
  const { user, joinPvPQueue, leavePvPQueue, currentMatch } = useSocialEngine(tgId);
  const [selectedMatchType, setSelectedMatchType] = useState<'quiz' | 'mindmap' | 'meme_battle'>('quiz');
  const [xpStake, setXpStake] = useState(25);
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [matchHistory, setMatchHistory] = useState<PvPMatch[]>([]);

  const matchTypes = [
    {
      id: 'quiz',
      name: 'Quiz Дуэль',
      description: 'Соревнование на скорость и знания',
      icon: '🧠',
      color: 'from-blue-600 to-cyan-600',
      duration: '2-3 мин'
    },
    {
      id: 'mindmap',
      name: 'Mind Map Битва',
      description: 'Создай лучшую интеллект-карту',
      icon: '🗺️',
      color: 'from-green-600 to-teal-600',
      duration: '5-7 мин'
    },
    {
      id: 'meme_battle',
      name: 'Мем Сражение',
      description: 'Битва креативности и юмора',
      icon: '😂',
      color: 'from-purple-600 to-pink-600',
      duration: '3-5 мин'
    }
  ];

  const stakeOptions = [25, 50, 100, 200, 500];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInQueue]);

  const handleJoinQueue = async () => {
    if (!user || user.xp < xpStake) return;

    try {
      setIsInQueue(true);
      setQueueTime(0);
      
      const result = await joinPvPQueue(selectedMatchType, xpStake);
      
      if (result.match_found) {
        setIsInQueue(false);
        // Match found, handle match start
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      setIsInQueue(false);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leavePvPQueue(selectedMatchType);
      setIsInQueue(false);
      setQueueTime(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSkillRating = () => {
    if (!user) return 1000;
    return user.level * 100 + (user.xp % 100);
  };

  const selectedMatch = matchTypes.find(match => match.id === selectedMatchType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-red-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white border-opacity-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Sword className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">PvP Арена</h2>
                  <p className="text-purple-200 text-sm">Сражайся с другими AI-мастерами</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Player Stats */}
            <div className="mb-6 bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl">
                    {user?.archetype === 'warrior' ? '⚔️' : 
                     user?.archetype === 'mage' ? '🔮' : 
                     user?.archetype === 'hacker' ? '💻' : '🦉'}
                  </div>
                  <div>
                    <div className="text-white font-bold">{user?.name}</div>
                    <div className="text-gray-300 text-sm">
                      Уровень {user?.level} • {user?.archetype}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-bold">{user?.xp} XP</div>
                  <div className="text-gray-300 text-sm">
                    Рейтинг: {getSkillRating()}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Type Selection */}
            <div className="mb-6">
              <h3 className="text-white font-bold mb-4">Выбери тип сражения</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchTypes.map((matchType) => (
                  <button
                    key={matchType.id}
                    onClick={() => setSelectedMatchType(matchType.id as any)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedMatchType === matchType.id
                        ? 'border-red-500 bg-red-500 bg-opacity-20'
                        : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{matchType.icon}</div>
                      <div className="text-white font-bold">{matchType.name}</div>
                      <div className="text-gray-300 text-sm mb-2">{matchType.description}</div>
                      <div className="text-orange-400 text-xs">⏱️ {matchType.duration}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* XP Stake Selection */}
            <div className="mb-6">
              <h3 className="text-white font-bold mb-4">Ставка XP</h3>
              <div className="flex flex-wrap gap-3">
                {stakeOptions.map((stake) => (
                  <button
                    key={stake}
                    onClick={() => setXpStake(stake)}
                    disabled={!user || user.xp < stake}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      xpStake === stake
                        ? 'bg-yellow-600 text-white'
                        : user && user.xp >= stake
                        ? 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                        : 'bg-gray-600 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {stake} XP
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Победитель забирает всю ставку. У тебя: {user?.xp || 0} XP
              </p>
            </div>

            {/* Queue Status */}
            {isInQueue ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-center"
              >
                <div className="text-white text-xl font-bold mb-2">
                  🔍 Поиск противника...
                </div>
                <div className="text-orange-200 mb-4">
                  {selectedMatch?.name} • Ставка: {xpStake} XP
                </div>
                <div className="text-white text-2xl font-mono mb-4">
                  {formatTime(queueTime)}
                </div>
                <button
                  onClick={handleLeaveQueue}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Покинуть очередь
                </button>
              </motion.div>
            ) : (
              <div className="mb-6">
                <button
                  onClick={handleJoinQueue}
                  disabled={!user || user.xp < xpStake}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    user && user.xp >= xpStake
                      ? `bg-gradient-to-r ${selectedMatch?.color} hover:scale-105 text-white`
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {user && user.xp >= xpStake ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Sword className="w-5 h-5" />
                      <span>Найти противника</span>
                      <span className="text-sm">({xpStake} XP)</span>
                    </div>
                  ) : (
                    'Недостаточно XP'
                  )}
                </button>
              </div>
            )}

            {/* Current Match */}
            {currentMatch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6"
              >
                <div className="text-center">
                  <div className="text-white text-xl font-bold mb-2">
                    ⚔️ Матч найден!
                  </div>
                  <div className="text-green-200 mb-4">
                    {matchTypes.find(m => m.id === currentMatch.match_type)?.name}
                  </div>
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                    Начать сражение
                  </button>
                </div>
              </motion.div>
            )}

            {/* Match Rules */}
            <div className="mb-6 bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-xl p-4">
              <h4 className="text-blue-400 font-bold mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Правила PvP
              </h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Матчмейкинг по уровню навыков (±200 рейтинга)</li>
                <li>• Победитель забирает всю ставку XP</li>
                <li>• Максимальное время ожидания: 5 минут</li>
                <li>• Отключение во время матча = поражение</li>
                <li>• Честная игра обязательна</li>
              </ul>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
              <h4 className="text-white font-bold mb-3 flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Топ PvP бойцы
              </h4>
              <div className="space-y-2">
                {[
                  { name: 'AI_Warrior', wins: 47, rating: 1850 },
                  { name: 'CodeMaster', wins: 42, rating: 1820 },
                  { name: 'MindHacker', wins: 38, rating: 1780 }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">#{index + 1}</span>
                      <span className="text-white">{player.name}</span>
                    </div>
                    <div className="text-gray-300">
                      {player.wins} побед • {player.rating} рейтинг
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PvPArena;