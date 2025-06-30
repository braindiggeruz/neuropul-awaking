import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, HelpCircle, Zap, Lightbulb } from 'lucide-react';

interface ResponseLostSoulProps {
  onContinue: () => void;
  onBack: () => void;
}

const ResponseLostSoul: React.FC<ResponseLostSoulProps> = ({ onContinue, onBack }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  // Trae's response to lost souls
  const traeMessage = "Не парься, бро. Все мы когда-то были потеряны. AI — это просто инструмент, как молоток или отвёртка, только для мозга.\n\nПредставь, что у тебя есть умный помощник, который может писать тексты, создавать картинки, анализировать данные и отвечать на вопросы. Это и есть AI.\n\nНе нужно быть программистом или гением. Просто скажи, что тебе нужно — и AI сделает это за тебя. Это как иметь суперсилу.";

  // Simulate typing effect
  useEffect(() => {
    setIsVisible(true);
    
    let currentText = '';
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < traeMessage.length) {
        currentText += traeMessage[currentIndex];
        setMessage(currentText);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Show continue button after message is fully typed
        setTimeout(() => {
          setShowContinue(true);
        }, 500);
      }
    }, 20); // Typing speed
    
    return () => clearInterval(typingInterval);
  }, []);

  // Sound effects
  const playSound = (type: 'click' | 'hover') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'click') {
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Vibration feedback
  const vibrate = (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleContinue = () => {
    playSound('click');
    vibrate([50, 30, 50]);
    onContinue();
  };

  const handleBack = () => {
    playSound('click');
    vibrate([30]);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background cyberpunk elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-3xl w-full">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-8 border border-purple-500 border-opacity-30 shadow-2xl"
            >
              {/* Trae Header */}
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trae</h2>
                  <p className="text-purple-300 text-sm">AI-Наставник</p>
                </div>
              </div>
              
              {/* Message */}
              <div className="mb-8">
                <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                  {message}
                  {isTyping && (
                    <span className="inline-block ml-1 animate-pulse">|</span>
                  )}
                </p>
              </div>
              
              {/* AI Benefits */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-cyan-400 font-semibold mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Что AI может сделать для тебя:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">Сэкономить время</span>
                        </div>
                        <p className="text-gray-300 text-sm">Автоматизируй рутинные задачи и сосредоточься на важном</p>
                      </div>
                      <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">Генерировать идеи</span>
                        </div>
                        <p className="text-gray-300 text-sm">Получай свежие идеи для бизнеса, контента или творчества</p>
                      </div>
                      <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">Создавать контент</span>
                        </div>
                        <p className="text-gray-300 text-sm">Тексты, изображения, код — всё за считанные секунды</p>
                      </div>
                      <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">Учиться быстрее</span>
                        </div>
                        <p className="text-gray-300 text-sm">Получай объяснения сложных тем простым языком</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Buttons */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4"
                  >
                    <button
                      onClick={handleBack}
                      onMouseEnter={() => playSound('hover')}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      <span>Назад</span>
                    </button>
                    
                    <button
                      onClick={handleContinue}
                      onMouseEnter={() => playSound('hover')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Хочу пробудиться</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => window.open('https://chat.openai.com', '_blank')}
                      onMouseEnter={() => playSound('hover')}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span>Узнать больше про AI</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Cyberpunk decorative elements */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-r-2 border-b-2 border-cyan-500 opacity-50"></div>
              <div className="absolute -top-3 -left-3 w-24 h-24 border-l-2 border-t-2 border-purple-500 opacity-50"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResponseLostSoul;