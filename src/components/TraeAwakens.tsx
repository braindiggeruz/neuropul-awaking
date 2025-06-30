import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Skull, Rocket, AlienIcon } from 'lucide-react';

interface TraeAwakensProps {
  onPathSelect: (path: 'lost' | 'awakening' | 'ready') => void;
}

const TraeAwakens: React.FC<TraeAwakensProps> = ({ onPathSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  // Trae's initial message
  const traeMessage = "Ты здесь. Наконец-то. Я Trae — твой проводник в мире AI. Не буду тратить время на формальности. Мне нужно знать только одно...";
  const traeQuestion = "Кто ты?";

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
        
        // Show the question after a short delay
        setTimeout(() => {
          setMessage(prev => `${prev}\n\n${traeQuestion}`);
          
          // Show options after another delay
          setTimeout(() => {
            setShowOptions(true);
          }, 1000);
        }, 500);
      }
    }, 30); // Typing speed
    
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

  const handleOptionClick = (path: 'lost' | 'awakening' | 'ready') => {
    playSound('click');
    vibrate([50, 30, 50]);
    onPathSelect(path);
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
              
              {/* Options */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      onClick={() => handleOptionClick('lost')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gray-700 group-hover:bg-gray-600 rounded-full flex items-center justify-center">
                        <Skull className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">💀 Я потерян</p>
                        <p className="text-gray-400 text-sm">Не знаю, что такое AI и зачем он мне</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      onClick={() => handleOptionClick('awakening')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full p-4 bg-gradient-to-r from-purple-900 to-blue-900 hover:from-purple-800 hover:to-blue-800 border border-purple-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-purple-800 group-hover:bg-purple-700 rounded-full flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-purple-300 group-hover:text-purple-200" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">🚀 Хочу пробудиться</p>
                        <p className="text-purple-300 text-sm">Готов начать путь AI-мастерства</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      onClick={() => handleOptionClick('ready')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-gray-700 group-hover:bg-gray-600 rounded-full flex items-center justify-center">
                        <AlienIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">👽 Я уже в теме</p>
                        <p className="text-gray-400 text-sm">Знаю, что такое AI и как его использовать</p>
                      </div>
                    </motion.button>
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

export default TraeAwakens;