import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Share2, Gift, Crown, Star, TrendingUp, Award } from 'lucide-react';
import { useSocialEngine } from '../../hooks/useSocialEngine';

interface ReferralPortalProps {
  tgId: string;
  onClose: () => void;
}

const ReferralPortal: React.FC<ReferralPortalProps> = ({ tgId, onClose }) => {
  const { user, generateReferralLink } = useSocialEngine(tgId);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalXPEarned: 0,
    thisWeekReferrals: 0
  });
  const [copied, setCopied] = useState(false);

  const referralLink = generateReferralLink();

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferralLink = async () => {
    const shareData = {
      title: 'Присоединяйся к NeuropulAI!',
      text: `Открой для себя мир AI-мастерства! Используй мою реферальную ссылку и получи бонус +25 XP при регистрации.`,
      url: referralLink
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
    }
  };

  const referralTiers = [
    { count: 1, reward: '25 XP', icon: '🌟', title: 'Первый друг' },
    { count: 5, reward: '100 XP + Badge', icon: '🏆', title: 'Наставник' },
    { count: 10, reward: '250 XP + NFT', icon: '💎', title: 'Лидер сообщества' },
    { count: 25, reward: '500 XP + Premium', icon: '👑', title: 'Амбассадор' },
    { count: 50, reward: '1000 XP + Exclusive', icon: '⚡', title: 'Легенда' }
  ];

  const getCurrentTier = () => {
    const count = user?.referral_count || 0;
    for (let i = referralTiers.length - 1; i >= 0; i--) {
      if (count >= referralTiers[i].count) {
        return { ...referralTiers[i], isAchieved: true };
      }
    }
    return { ...referralTiers[0], isAchieved: false };
  };

  const getNextTier = () => {
    const count = user?.referral_count || 0;
    return referralTiers.find(tier => count < tier.count);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

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
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Реферальная программа</h2>
                  <p className="text-purple-200 text-sm">Приглашай друзей и получай награды</p>
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

          <div className="p-6 space-y-6">
            {/* Current Status */}
            <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Твой статус</h3>
                <div className="text-2xl">{currentTier.icon}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{user?.referral_count || 0}</div>
                  <div className="text-sm text-gray-300">Приглашено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{referralStats.activeReferrals}</div>
                  <div className="text-sm text-gray-300">Активных</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{referralStats.totalXPEarned}</div>
                  <div className="text-sm text-gray-300">XP заработано</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{referralStats.thisWeekReferrals}</div>
                  <div className="text-sm text-gray-300">На этой неделе</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{currentTier.title}</div>
                  <div className="text-sm text-purple-200">Текущий уровень</div>
                </div>
                {nextTier && (
                  <div className="text-right">
                    <div className="text-sm text-gray-300">До следующего уровня:</div>
                    <div className="text-lg font-bold text-white">
                      {nextTier.count - (user?.referral_count || 0)} рефералов
                    </div>
                  </div>
                )}
              </div>

              {nextTier && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Прогресс до {nextTier.title}</span>
                    <span>{user?.referral_count || 0}/{nextTier.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((user?.referral_count || 0) / nextTier.count) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Referral Link */}
            <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
              <h3 className="text-xl font-bold text-white mb-4">Твоя реферальная ссылка</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-300 overflow-hidden">
                  {referralLink}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
                  title="Копировать ссылку"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={shareReferralLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                  title="Поделиться"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm"
                >
                  ✅ Ссылка скопирована!
                </motion.div>
              )}

              <div className="bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">💡 Как это работает:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Друг переходит по твоей ссылке</li>
                  <li>• Регистрируется и проходит пробуждение</li>
                  <li>• Ты получаешь +25 XP мгновенно</li>
                  <li>• Когда он достигает 100 XP → ты получаешь бонус</li>
                </ul>
              </div>
            </div>

            {/* Referral Tiers */}
            <div className="bg-white bg-opacity-5 rounded-xl p-6 border border-white border-opacity-10">
              <h3 className="text-xl font-bold text-white mb-4">Уровни наград</h3>
              
              <div className="space-y-3">
                {referralTiers.map((tier, index) => {
                  const isAchieved = (user?.referral_count || 0) >= tier.count;
                  const isCurrent = currentTier.count === tier.count;
                  
                  return (
                    <motion.div
                      key={tier.count}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isAchieved 
                          ? 'bg-green-500 bg-opacity-20 border-green-500 border-opacity-50' 
                          : isCurrent
                          ? 'bg-purple-500 bg-opacity-20 border-purple-500 border-opacity-50'
                          : 'bg-gray-500 bg-opacity-20 border-gray-500 border-opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{tier.icon}</div>
                        <div>
                          <div className={`font-semibold ${
                            isAchieved ? 'text-green-400' : isCurrent ? 'text-purple-400' : 'text-gray-400'
                          }`}>
                            {tier.title}
                          </div>
                          <div className="text-sm text-gray-300">
                            {tier.count} {tier.count === 1 ? 'реферал' : 'рефералов'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${
                          isAchieved ? 'text-green-400' : isCurrent ? 'text-purple-400' : 'text-gray-400'
                        }`}>
                          {tier.reward}
                        </div>
                        {isAchieved && (
                          <div className="text-green-400 text-sm">✅ Получено</div>
                        )}
                        {isCurrent && !isAchieved && (
                          <div className="text-purple-400 text-sm">🎯 Текущий</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-6">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Советы для успешных приглашений
              </h3>
              <ul className="text-yellow-200 text-sm space-y-2">
                <li>• Расскажи друзьям о конкретных преимуществах AI-инструментов</li>
                <li>• Поделись своими результатами и достижениями</li>
                <li>• Помоги новичкам пройти первые шаги в платформе</li>
                <li>• Создавай контент о своем опыте в социальных сетях</li>
                <li>• Участвуй в сообществе и стань примером для других</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReferralPortal;