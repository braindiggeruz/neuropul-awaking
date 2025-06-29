import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Sword, Crown, Gift, Target, TrendingUp } from 'lucide-react';
import ReferralPortal from './ReferralPortal';
import LeaderBoard from './LeaderBoard';
import ChallengeArena from './ChallengeArena';
import MonetizationModule from './MonetizationModule';
import PvPArena from './PvPArena';
import { useSocialEngine } from '../../hooks/useSocialEngine';

interface SocialHubProps {
  tgId: string;
}

const SocialHub: React.FC<SocialHubProps> = ({ tgId }) => {
  const { user } = useSocialEngine(tgId);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const socialFeatures = [
    {
      id: 'referrals',
      name: 'Рефералы',
      description: 'Приглашай друзей и получай награды',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      stats: `${user?.referral_count || 0} приглашено`,
      component: ReferralPortal
    },
    {
      id: 'leaderboard',
      name: 'Лидерборд',
      description: 'Соревнуйся с лучшими',
      icon: Trophy,
      color: 'from-yellow-600 to-orange-600',
      stats: 'Топ-100 игроков',
      component: LeaderBoard
    },
    {
      id: 'challenges',
      name: 'Вызовы',
      description: 'Испытай себя в челленджах',
      icon: Target,
      color: 'from-green-600 to-teal-600',
      stats: '5 активных вызовов',
      component: ChallengeArena
    },
    {
      id: 'pvp',
      name: 'PvP Арена',
      description: 'Сражайся с другими игроками',
      icon: Sword,
      color: 'from-red-600 to-pink-600',
      stats: 'Онлайн матчи',
      component: PvPArena
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Разблокируй все возможности',
      icon: Crown,
      color: 'from-purple-600 to-indigo-600',
      stats: user?.subscription_status === 'premium' ? 'Активна' : 'Доступно',
      component: MonetizationModule
    }
  ];

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const getActiveComponent = () => {
    const feature = socialFeatures.find(f => f.id === activeModal);
    if (!feature) return null;

    const Component = feature.component;
    return <Component tgId={tgId} onClose={closeModal} />;
  };

  return (
    <div className="space-y-6">
      {/* Social Stats Overview */}
      <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
          Социальная активность
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{user?.referral_count || 0}</div>
            <div className="text-sm text-gray-300">Рефералов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">#{Math.floor(Math.random() * 100) + 1}</div>
            <div className="text-sm text-gray-300">Место в рейтинге</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.floor(Math.random() * 10) + 1}</div>
            <div className="text-sm text-gray-300">Вызовов выполнено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{Math.floor(Math.random() * 5)}</div>
            <div className="text-sm text-gray-300">PvP побед</div>
          </div>
        </div>
      </div>

      {/* Social Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialFeatures.map((feature, index) => {
          const Icon = feature.icon;
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => openModal(feature.id)}
              className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-10 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2">
                  {feature.name}
                </h4>
                
                <p className="text-purple-200 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="text-xs text-purple-300 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                  {feature.stats}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">🚀 Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => openModal('referrals')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-lg transition-colors text-sm"
          >
            📤 Пригласить друга
          </button>
          <button
            onClick={() => openModal('challenges')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-lg transition-colors text-sm"
          >
            🎯 Принять вызов
          </button>
          <button
            onClick={() => openModal('pvp')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-lg transition-colors text-sm"
          >
            ⚔️ Найти соперника
          </button>
        </div>
      </div>

      {/* Render Active Modal */}
      {getActiveComponent()}
    </div>
  );
};

export default SocialHub;