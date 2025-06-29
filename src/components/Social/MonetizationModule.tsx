import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Gift, Star, Zap, Check, X, CreditCard, Smartphone } from 'lucide-react';
import { useSocialEngine } from '../../hooks/useSocialEngine';

interface MonetizationModuleProps {
  tgId: string;
  onClose: () => void;
}

const MonetizationModule: React.FC<MonetizationModuleProps> = ({ tgId, onClose }) => {
  const { user } = useSocialEngine(tgId);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro' | 'master'>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'telegram' | 'local'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      price: 4.99,
      originalPrice: 9.99,
      color: 'from-blue-600 to-cyan-600',
      icon: '⭐',
      features: [
        'Все AI-инструменты разблокированы',
        '+50% больше XP за действия',
        'Приоритетная поддержка',
        'Без рекламы',
        'Расширенная статистика',
        'Эксклюзивные челленджи'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      originalPrice: 19.99,
      color: 'from-purple-600 to-pink-600',
      icon: '👑',
      popular: true,
      features: [
        'Все возможности Basic',
        'Безлимитные запросы к AI',
        'Персональный AI-наставник Trae',
        'Генерация NFT-сертификатов',
        'Экспорт результатов в PDF',
        'Доступ к премиум-челленджам',
        'Эксклюзивные шаблоны',
        'Приоритет в PvP-матчах'
      ]
    },
    {
      id: 'master',
      name: 'Master',
      price: 19.99,
      originalPrice: 39.99,
      color: 'from-yellow-600 to-orange-600',
      icon: '⚡',
      features: [
        'Все возможности Pro',
        'MVP-генератор для бизнеса',
        'Белая метка для компаний',
        'API доступ к платформе',
        'Персональные консультации',
        'Ранний доступ к новым функциям',
        'Кастомные интеграции',
        'Титул "AI-Архитектор"'
      ]
    }
  ];

  const donationAmounts = [
    { amount: 1, label: '☕ Кофе', description: 'Поддержи разработку' },
    { amount: 5, label: '🍕 Пицца', description: '+50 XP бонус' },
    { amount: 10, label: '🎁 Подарок', description: '+100 XP + стикер' },
    { amount: 25, label: '🚀 Буст', description: '+300 XP + NFT' },
    { amount: 50, label: '💎 Премиум', description: '+500 XP + эксклюзив' }
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tg_id: tgId,
          tier: selectedTier,
          payment_method: paymentMethod
        })
      });

      const { url } = await response.json();
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDonate = async (amount: number) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tg_id: tgId,
          amount,
          payment_method: paymentMethod
        })
      });

      const { url } = await response.json();
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTierData = tiers.find(tier => tier.id === selectedTier);

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
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">NeuropulAI Premium</h2>
                  <p className="text-purple-200 text-sm">Разблокируй полную мощь AI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Current Status */}
            {user?.subscription_status !== 'free' && (
              <div className="mb-6 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Crown className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-green-400 font-bold">
                      Активная подписка: {user.subscription_tier.toUpperCase()}
                    </div>
                    <div className="text-green-200 text-sm">
                      Статус: {user.subscription_status === 'trial' ? 'Пробный период' : 'Активна'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tiers */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Выбери свой уровень мастерства
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative rounded-xl p-6 border-2 cursor-pointer transition-all ${
                      selectedTier === tier.id
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                    }`}
                    onClick={() => setSelectedTier(tier.id as any)}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Популярный
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{tier.icon}</div>
                      <h4 className="text-xl font-bold text-white">{tier.name}</h4>
                      <div className="mt-2">
                        <span className="text-gray-400 line-through text-lg">${tier.originalPrice}</span>
                        <span className="text-white text-3xl font-bold ml-2">${tier.price}</span>
                        <span className="text-gray-300 text-sm">/месяц</span>
                      </div>
                      <div className="text-green-400 text-sm font-semibold">
                        Скидка {Math.round((1 - tier.price / tier.originalPrice) * 100)}%
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedTier === tier.id && (
                      <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none">
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Способ оплаты</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Карта</div>
                  <div className="text-gray-300 text-sm">Visa, MasterCard</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('telegram')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'telegram'
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Telegram Stars</div>
                  <div className="text-gray-300 text-sm">Через Telegram</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('local')}
                  className={`p-4 rounded-lg border transition-all ${
                    paymentMethod === 'local'
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-white border-opacity-20 bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <Gift className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Click/Payme</div>
                  <div className="text-gray-300 text-sm">Узбекистан</div>
                </button>
              </div>
            </div>

            {/* Subscribe Button */}
            <div className="mb-8">
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                  selectedTierData
                    ? `bg-gradient-to-r ${selectedTierData.color} hover:scale-105 text-white`
                    : 'bg-gray-600 text-gray-400'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Обработка...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-5 h-5" />
                    <span>Подписаться на {selectedTierData?.name} - ${selectedTierData?.price}/мес</span>
                  </div>
                )}
              </button>
              
              <p className="text-center text-gray-400 text-sm mt-2">
                7 дней бесплатно • Отмена в любое время
              </p>
            </div>

            {/* Donations Section */}
            <div className="border-t border-white border-opacity-10 pt-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Или поддержи разработку
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Помоги нам создавать лучшие AI-инструменты для сообщества
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {donationAmounts.map((donation) => (
                  <button
                    key={donation.amount}
                    onClick={() => handleDonate(donation.amount)}
                    disabled={isProcessing}
                    className="p-4 bg-white bg-opacity-5 hover:bg-opacity-10 border border-white border-opacity-20 rounded-lg transition-all text-center"
                  >
                    <div className="text-2xl mb-1">{donation.label.split(' ')[0]}</div>
                    <div className="text-white font-bold">${donation.amount}</div>
                    <div className="text-gray-300 text-xs">{donation.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits Summary */}
            <div className="mt-8 bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-30 border border-purple-500 border-opacity-30 rounded-xl p-6">
              <h4 className="text-purple-400 font-bold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Почему стоит выбрать Premium?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-200 text-sm">
                <div>
                  <div className="font-semibold mb-1">🚀 Ускоренное развитие</div>
                  <div>+50% XP за все действия, быстрее достигай новых уровней</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">🎯 Эксклюзивный контент</div>
                  <div>Доступ к премиум-челленджам и инструментам</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">🏆 NFT-сертификаты</div>
                  <div>Получай уникальные NFT за достижения</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">💬 Персональный наставник</div>
                  <div>Расширенные возможности AI-помощника Trae</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MonetizationModule;