import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Users, Clock, Trophy, Star, Zap, Target, Crown, Gift } from 'lucide-react';
import { useSocialEngine, Challenge } from '../../hooks/useSocialEngine';

interface ChallengeArenaProps {
  tgId: string;
  onClose: () => void;
}

const ChallengeArena: React.FC<ChallengeArenaProps> = ({ tgId, onClose }) => {
  const { activeChallenges, user, grantXP } = useSocialEngine(tgId);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'individual' | 'community' | 'competitive'>('all');
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'Все', icon: Target },
    { id: 'individual', name: 'Личные', icon: Star },
    { id: 'community', name: 'Сообщество', icon: Users },
    { id: 'competitive', name: 'Соревнования', icon: Sword }
  ];

  const filteredChallenges = activeChallenges.filter(challenge => 
    selectedCategory === 'all' || challenge.category === selectedCategory
  );

  const getChallengeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'daily': '📅',
      'weekly': '📊',
      'community': '👥',
      'pvp': '⚔️',
      'premium': '👑'
    };
    return icons[type] || '🎯';
  };

  const getChallengeColor = (type: string) => {
    const colors: Record<string, string> = {
      'daily': 'from-blue-600 to-cyan-600',
      'weekly': 'from-purple-600 to-pink-600',
      'community': 'from-green-600 to-teal-600',
      'pvp': 'from-red-600 to-orange-600',
      'premium': 'from-yellow-600 to-amber-600'
    };
    return colors[type] || 'from-gray-600 to-gray-700';
  };

  const isEligible = (challenge: Challenge) => {
    if (challenge.is_premium && user?.subscription_status === 'free') {
      return false;
    }
    return true;
  };

  const isCompleted = (challengeId: string) => {
    return completedChallenges.includes(challengeId);
  };

  const completeChallenge = async (challenge: Challenge) => {
    if (isCompleted(challenge.id) || !isEligible(challenge)) return;

    try {
      // Grant XP
      await grantXP(challenge.reward_xp, 'challenge', `Completed challenge: ${challenge.title}`);
      
      // Mark as completed
      setCompletedChallenges(prev => [...prev, challenge.id]);
      
      // Store completion in localStorage
      const completed = JSON.parse(localStorage.getItem('completed_challenges') || '[]');
      completed.push({
        id: challenge.id,
        completed_at: new Date().toISOString(),
        xp_earned: challenge.reward_xp
      });
      localStorage.setItem('completed_challenges', JSON.stringify(completed));

    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  // Load completed challenges from localStorage
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completed_challenges') || '[]');
    const today = new Date().toDateString();
    
    // Filter out old daily challenges
    const validCompleted = completed.filter((c: any) => {
      const completedDate = new Date(c.completed_at).toDateString();
      const challenge = activeChallenges.find(ch => ch.id === c.id);
      
      if (challenge?.type === 'daily') {
        return completedDate === today;
      }
      return true;
    });
    
    setCompletedChallenges(validCompleted.map((c: any) => c.id));
  }, [activeChallenges]);

  const getTimeRemaining = (endDate?: string) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Завершено';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}д ${hours % 24}ч`;
    }
    
    return `${hours}ч ${minutes}м`;
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
          className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
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
                  <h2 className="text-2xl font-bold text-white">Арена вызовов</h2>
                  <p className="text-purple-200 text-sm">Испытай себя и получи награды</p>
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
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Категории вызовов</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-red-600 text-white'
                          : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge, index) => {
                const eligible = isEligible(challenge);
                const completed = isCompleted(challenge.id);
                const timeRemaining = getTimeRemaining(challenge.end_date);
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-xl p-6 border transition-all ${
                      completed
                        ? 'bg-green-900 bg-opacity-30 border-green-500'
                        : eligible
                        ? 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-opacity-10'
                        : 'bg-gray-900 bg-opacity-50 border-gray-600 opacity-60'
                    }`}
                  >
                    {/* Challenge Type Badge */}
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getChallengeColor(challenge.type)}`}>
                      {getChallengeIcon(challenge.type)} {challenge.type.toUpperCase()}
                    </div>

                    {/* Premium Badge */}
                    {challenge.is_premium && (
                      <div className="absolute top-4 left-4 bg-yellow-500 bg-opacity-20 p-1 rounded">
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}

                    {/* Challenge Content */}
                    <div className="mt-8">
                      <h3 className="text-white font-bold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        {challenge.description}
                      </p>

                      {/* Progress for community challenges */}
                      {challenge.category === 'community' && challenge.max_participants && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>Участников</span>
                            <span>{challenge.current_participants}/{challenge.max_participants}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(challenge.current_participants / challenge.max_participants) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">+{challenge.reward_xp} XP</span>
                          {challenge.reward_nft && (
                            <>
                              <span className="text-gray-400">+</span>
                              <Gift className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 font-semibold">NFT</span>
                            </>
                          )}
                        </div>
                        
                        {timeRemaining && (
                          <div className="flex items-center space-x-1 text-orange-400 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{timeRemaining}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => completeChallenge(challenge)}
                        disabled={!eligible || completed}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          completed
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : eligible
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white transform hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {completed ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Trophy className="w-4 h-4" />
                            <span>Завершено!</span>
                          </div>
                        ) : !eligible ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Crown className="w-4 h-4" />
                            <span>Требуется Premium</span>
                          </div>
                        ) : (
                          'Принять вызов'
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredChallenges.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Нет активных вызовов</h3>
                <p className="text-gray-400">Новые вызовы появятся скоро!</p>
              </div>
            )}

            {/* Challenge Creation Hint */}
            <div className="mt-8 bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-30 border border-blue-500 border-opacity-30 rounded-xl p-6">
              <h4 className="text-blue-400 font-bold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Создавай собственные вызовы
              </h4>
              <p className="text-blue-200 text-sm mb-4">
                Достигни уровня 5 и получи возможность создавать собственные вызовы для сообщества!
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-blue-300">
                  Твой уровень: <span className="font-bold">{user?.level || 1}</span>
                </div>
                <div className="text-blue-300">
                  До разблокировки: <span className="font-bold">{Math.max(0, 5 - (user?.level || 1))} уровней</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeArena;