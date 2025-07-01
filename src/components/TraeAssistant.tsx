import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Lightbulb, Zap, MessageCircle } from 'lucide-react';
import { callGPT } from '../lib/api/callGpt';

interface TraeAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userArchetype: string;
  userXP: number;
  soundEnabled?: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const TraeAssistant: React.FC<TraeAssistantProps> = ({
  isOpen,
  onClose,
  userName,
  userArchetype,
  userXP,
  soundEnabled = true
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  // Ref to prevent multiple AI calls
  const hasCompletedAIRef = useRef(false);

  // Initial greeting when opened
  React.useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greetingMessage: Message = {
        id: Date.now().toString(),
        text: `Ну что, ${userName}? Ты пробудился как ${userArchetype}. Теперь время действовать. Мир ждёт твоих идей. А я рядом. Всегда. У тебя уже ${userXP} XP - неплохое начало! Чем могу помочь?`,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([greetingMessage]);
      setHasGreeted(true);
      
      if (soundEnabled) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    }
  }, [isOpen, hasGreeted, userName, userArchetype, userXP, soundEnabled]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    // Guard against multiple calls
    if (hasCompletedAIRef.current) return;
    hasCompletedAIRef.current = true;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const prompt = `Ты - Trae, дерзкий но мудрый AI-наставник из NeuropulAI. Твоя личность:
      - Говоришь как опытный "батя" - прямо, с юмором, но с заботой
      - Используешь сленг и современные выражения
      - Даёшь конкретные советы, не воду
      - Мотивируешь и подбадриваешь
      - Знаешь всё об AI-инструментах и промптах
      
      Контекст пользователя:
      - Имя: ${userName}
      - Архетип: ${userArchetype}
      - XP: ${userXP}
      
      Вопрос пользователя: "${inputText}"
      
      Ответь в стиле Trae - дружелюбно, практично, с мотивацией. Максимум 150 слов.`;

      const systemPrompt = "You are Trae, a wise but edgy AI mentor. Speak like a caring but direct mentor who knows AI inside out. Use modern slang and be motivational.";

      const response = await callGPT(prompt, systemPrompt);

      if (response.success && response.data) {
        const traeMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, traeMessage]);
        
        if (soundEnabled) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Trae response failed:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Упс, что-то с моими нейронами... Попробуй ещё раз, я тут же!",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Reset AI completion flag to allow new messages
      hasCompletedAIRef.current = false;
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  // Reset AI state
  const resetAI = () => {
    hasCompletedAIRef.current = false;
  };

  const handleClose = () => {
    setMessages([]);
    setHasGreeted(false);
    setInputText('');
    resetAI();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl w-full max-w-2xl h-[600px] border border-white border-opacity-20 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Trae</h2>
                <p className="text-purple-300 text-sm">AI-Наставник • Всегда на связи</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-purple-500/30'
                }`}>
                  {!message.isUser && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-semibold">Trae</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 border border-purple-500/30 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-semibold">Trae</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-6 py-3 border-t border-white border-opacity-10">
              <p className="text-gray-400 text-sm mb-3">Быстрые вопросы:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Как улучшить промпты?",
                  "Какой мой следующий шаг?",
                  "Идеи для заработка на AI",
                  "Как развивать навыки?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-3 py-1 rounded-full text-xs transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-white border-opacity-10">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Спроси Trae о чём угодно..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TraeAssistant;