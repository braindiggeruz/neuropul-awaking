import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageCircle, X, Sparkles, Zap, Target } from 'lucide-react';
import { askOpenAI } from '../utils/openaiService';
import { playSound, vibrate } from '../utils/sounds';
import { UserProgress } from '../types';

interface AITutorProps {
  userProgress: UserProgress;
  isVisible: boolean;
  onClose: () => void;
  context?: string;
  trigger?: 'welcome' | 'tool_used' | 'level_up' | 'challenge' | 'help';
}

const AITutor: React.FC<AITutorProps> = ({
  userProgress,
  isVisible,
  onClose,
  context = '',
  trigger = 'help'
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorPersonality, setTutorPersonality] = useState<'motivational' | 'technical' | 'friendly'>('motivational');

  // Генерация сообщения от Trae на основе контекста
  useEffect(() => {
    if (isVisible) {
      generateTutorMessage();
    }
  }, [isVisible, trigger, context]);

  const generateTutorMessage = async () => {
    setIsLoading(true);
    
    try {
      const archetype = userProgress.archetype || 'новичок';
      const level = userProgress.level;
      const xp = userProgress.xp;
      const toolsUsed = userProgress.toolsUsed.length;
      
      let prompt = '';
      
      switch (trigger) {
        case 'welcome':
          prompt = `Ты - AI-наставник Trae из NeuropulAI. Поприветствуй пользователя ${userProgress.userName} (архетип: ${archetype}, уровень: ${level}). 
          Будь вдохновляющим, дружелюбным и мотивирующим. Объясни, что ты здесь, чтобы помочь освоить AI-инструменты. 
          Используй эмодзи и будь энергичным. Максимум 100 слов.`;
          break;
          
        case 'tool_used':
          prompt = `Ты - AI-наставник Trae. Пользователь ${userProgress.userName} только что использовал AI-инструмент: ${context}. 
          Похвали его, дай короткий совет по улучшению результатов и мотивируй продолжать. 
          Будь воодушевляющим и практичным. Максимум 80 слов.`;
          break;
          
        case 'level_up':
          prompt = `Ты - AI-наставник Trae. Пользователь ${userProgress.userName} достиг уровня ${level}! 
          Поздравь его с достижением, расскажи что это значит и что открывается дальше. 
          Будь очень воодушевляющим и празднично настроенным. Максимум 100 слов.`;
          break;
          
        case 'challenge':
          prompt = `Ты - AI-наставник Trae. Предложи пользователю ${userProgress.userName} (уровень ${level}, освоено ${toolsUsed} инструментов) 
          интересный вызов или задание для развития AI-навыков. Контекст: ${context}. 
          Будь мотивирующим и предложи конкретное действие. Максимум 90 слов.`;
          break;
          
        default:
          prompt = `Ты - AI-наставник Trae из NeuropulAI. Помоги пользователю ${userProgress.userName} с вопросом: ${context}. 
          Будь полезным, дружелюбным и практичным. Дай конкретный совет. Максимум 120 слов.`;
      }
      
      const response = await askOpenAI(prompt);
      
      if (response.success) {
        setMessage(response.content);
        playSound('success', userProgress.soundEnabled);
        vibrate([50], userProgress.vibrationEnabled);
      } else {
        setMessage(getDefaultMessage());
      }
    } catch (error) {
      console.error('Error generating tutor message:', error);
      setMessage(getDefaultMessage());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMessage = (): string => {
    const messages = {
      welcome: `Привет, ${userProgress.userName}! 👋 Я Trae, твой AI-наставник! Готов помочь тебе освоить мир искусственного интеллекта. Вместе мы прокачаем твои навыки до уровня мастера! 🚀`,
      tool_used: `Отлично работаешь! 🎉 Продолжай экспериментировать с AI-инструментами. Каждое использование делает тебя сильнее! 💪`,
      level_up: `Поздравляю с новым уровнем! 🎊 Ты становишься настоящим AI-мастером. Впереди еще больше возможностей! ⭐`,
      challenge: `Вызов дня: попробуй создать что-то креативное с помощью AI! Удиви себя и окружающих! 🎯`,
      help: `Я здесь, чтобы помочь! 🤖 Задавай вопросы, экспериментируй с инструментами и не бойся ошибок. Это путь к мастерству! ✨`
    };
    
    return messages[trigger] || messages.help;
  };

  const handleClose = () => {
    playSound('click', userProgress.soundEnabled);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-end justify-end p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100, y: 100 }}
          className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-sm border border-white border-opacity-20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Trae</h3>
                <p className="text-purple-200 text-xs">AI-Наставник</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white hover:bg-opacity-10 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <div className="mb-4">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-purple-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm">Trae думает...</span>
              </div>
            ) : (
              <p className="text-white text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setTutorPersonality('motivational');
                generateTutorMessage();
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Мотивация</span>
            </button>
            <button
              onClick={() => {
                setTutorPersonality('technical');
                generateTutorMessage();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>Совет</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-purple-300 text-xs">
              💡 Нажми на меня в любое время для помощи!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AITutor;