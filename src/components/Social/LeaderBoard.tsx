import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Star, TrendingUp, Users, Zap, Gift, Medal } from 'lucide-react';
import { useSocialEngine, LeaderboardEntry } from '../../hooks/useSocialEngine';

interface LeaderBoardProps {
  tgId: string;
  onClose: () => void;
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({ tgId, onClose }) => {
  const { leaderboard, loadLeaderboard, user } = useSocialEngine(tgId);
  const [selectedCategory, setSelectedCategory] = useState<'xp' | 'referrals' | 'donations' | 'pvp_wins'>('xp');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');
  const [userRank, setUserRank] = useState<number | null>(null);

  const categories = [
    { id: 'xp', name: 'Опыт', icon: Zap, color: 'text-yellow-400' },
    { id: 'referrals', name: 'Рефералы', icon: Users, color: 'text-blue-400' },
    { id: 'donations', name: 'Донаты', icon: Gift, color: 'text-green-400' },
    { id: 'pvp_wins', name: 'PvP', icon: Medal, color: 'text-red-400' }
  ];

  const periods = [
    { id: 'daily', name: 'День' },
    { id: 'weekly', name: 'Неделя' },
    { id: 'monthly', name: 'Месяц' },
    { id: 'all_time', name: 'Всё время' }
  ];

  useEffect(() => {
    loadLeaderboard(selectedCategory, selectedPeriod);
  }, [selectedCategory, selectedPeriod, loadLeaderboard]);

  useEffect(() => {
    if (user && leaderboard.length > 0) {
      const rank = leaderboard.findIndex(entry => entry.user_id === user.id) + 1;
      setUserRank(rank > 0 ? rank : null);
    }
  }, [user, leaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getArchetypeIcon = (archetype?: string) => {
    const archetypes: Record<string, string> = {
      'warrior': '⚔️',
      'mage': '🔮',
      'hacker': '💻',
      'sage': '🦉'
    };
    return archetypes[archetype || ''] || '🤖';
  };

  const formatScore = (score: number, category: string) => {
    switch (category) {
      case 'xp':
        return `${score.toLocaleString()} XP`;
      case 'referrals':
        return `${score} рефералов`;
      case 'donations':
        return `$${score.toFixed(2)}`;
      case 'pvp_wins':
        return `${score} побед`;
      default:
        return score.toString();
    }
  };

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
          className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white border-opacity-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Таблица лидеров</h2>
                  <p className="text-purple-200 text-sm">Соревнуйся с лучшими AI-мастерами</p>
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
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Категория</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Period Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Период</h3>
                <div className="flex flex-wrap gap-2">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id as any)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedPeriod === period.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                      }`}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User's Position */}
            {userRank && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getRankIcon(userRank)}</div>
                    <div>
                      <div className="text-white font-bold">Твоя позиция</div>
                      <div className="text-purple-200 text-sm">
                        {userRank} место из {leaderboard.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {formatScore(user?.xp || 0, selectedCategory)}
                    </div>
                    <div className="text-purple-200 text-sm">
                      {getArchetypeIcon(user?.archetype)} {user?.archetype}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-6">
                <h3 className="text-white font-bold mb-4 text-center">🏆 Топ-3 лидера</h3>
                <div className="flex justify-center items-end space-x-4">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-16 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">
                        {getArchetypeIcon(leaderboard[1]?.archetype)}
                      </div>
                      <div className="text-white text-sm font-semibold">{leaderboard[1]?.name}</div>
                      <div className="text-gray-300 text-xs">{formatScore(leaderboard[1]?.score, selectedCategory)}</div>
                    </div>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="w-24 h-20 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2 relative">
                      <Crown className="absolute -top-3 w-6 h-6 text-yellow-300" />
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl border-4 border-yellow-300">
                        {getArchetypeIcon(leaderboard[0]?.archetype)}
                      </div>
                      <div className="text-white font-bold">{leaderboard[0]?.name}</div>
                      <div className="text-yellow-400 text-sm font-semibold">{formatScore(leaderboard[0]?.score, selectedCategory)}</div>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="w-20 h-12 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-12 h-12 bg-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">
                        {getArchetypeIcon(leaderboard[2]?.archetype)}
                      </div>
                      <div className="text-white text-sm font-semibold">{leaderboard[2]?.name}</div>
                      <div className="text-gray-300 text-xs">{formatScore(leaderboard[2]?.score, selectedCategory)}</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-white font-bold mb-4">Полная таблица</h3>
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    entry.user_id === user?.id
                      ? 'bg-purple-600 bg-opacity-30 border-purple-500'
                      : 'bg-white bg-opacity-5 border-white border-opacity-10 hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-xl font-bold w-8 text-center ${getRankColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-lg">
                      {getArchetypeIcon(entry.archetype)}
                    </div>
                    
                    <div>
                      <div className="text-white font-semibold">{entry.name}</div>
                      <div className="text-gray-300 text-sm">
                        {entry.username && `@${entry.username} • `}
                        Уровень {entry.level} • {entry.archetype}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {formatScore(entry.score, selectedCategory)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Пока нет данных</h3>
                <p className="text-gray-400">Будь первым в этой категории!</p>
              </div>
            )}

            {/* Rewards Info */}
            <div className="mt-6 bg-gradient-to-r from-yellow-900 to-orange-900 bg-opacity-30 border border-yellow-500 border-opacity-30 rounded-xl p-4">
              <h4 className="text-yellow-400 font-bold mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Награды за лидерство
              </h4>
              <div className="text-yellow-200 text-sm space-y-1">
                <div>🥇 1 место: NFT + 500 XP + эксклюзивный бейдж</div>
                <div>🥈 2-10 место: 200 XP + премиум-доступ на неделю</div>
                <div>🥉 11-100 место: 50 XP + особый статус</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaderBoard;