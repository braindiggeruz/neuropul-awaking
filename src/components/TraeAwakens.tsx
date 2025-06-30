import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Skull, Rocket, PenIcon as AlienIcon } from 'lucide-react';
import { getUserLanguage, translate } from '../lib/utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface TraeAwakensProps {
  onPathSelect: (path: 'lost' | 'awakening' | 'ready') => void;
}

const TraeAwakens: React.FC<TraeAwakensProps> = ({ onPathSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [userPath, setUserPath] = useState<string | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [language, setLanguage] = useState(getUserLanguage());

  // Trae's initial message based on language
  const getTraeMessage = () => {
    return language === 'ru' 
      ? "Ты здесь. Наконец-то. Я Trae — твой проводник в мире AI. Не буду тратить время на формальности. Мне нужно знать только одно..."
      : "Sen bu yerdasanmi. Nihoyat. Men Trae — AI dunyosidagi yo'lboshchingman. Rasmiyatchilikka vaqt sarflamayman. Menga faqat bitta narsa kerak...";
  };
  
  const getTraeQuestion = () => {
    return language === 'ru' ? "Кто ты?" : "Sen kimsan?";
  };

  // Simulate typing effect
  useEffect(() => {
    setIsVisible(true);
    
    const traeMessage = getTraeMessage();
    const traeQuestion = getTraeQuestion();
    
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
            
            // Set inactivity timer
            const timer = setTimeout(() => {
              if (!userPath) {
                const reminderText = language === 'ru' 
                  ? `${prev}\n\nЭй, ты ещё здесь? Выбери свой путь, чтобы мы могли начать.`
                  : `${prev}\n\nHey, hali ham shu yerdamisan? Boshlashimiz uchun yo'lingni tanla.`;
                setMessage(reminderText);
                playSound('hover');
                vibrate([100, 50, 100]);
              }
            }, 15000); // 15 seconds
            
            setInactivityTimer(timer);
          }, 1000);
        }, 500);
      }
    }, 30); // Typing speed
    
    return () => {
      clearInterval(typingInterval);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [language]);

  // Clean up inactivity timer when component unmounts
  useEffect(() => {
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [inactivityTimer]);

  // Sound effects with more cyberpunk feel
  const playSound = (type: 'click' | 'hover') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'click') {
        // More digital, cyberpunk click sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else {
        // More digital, cyberpunk hover sound
        oscillator.type = 'square';
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
    // Clear inactivity timer
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    // Save user path to localStorage for future reference
    localStorage.setItem('neuropul_user_path', path);
    localStorage.setItem('neuropul_first_visit_date', new Date().toISOString());
    
    // Set user path in state
    setUserPath(path);
    
    // Play sound and vibrate
    playSound('click');
    vibrate([50, 30, 50]);
    
    // Call the onPathSelect callback
    onPathSelect(path);
  };

  // Handle custom user input
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCustomInput = () => {
    if (userInput.trim()) {
      // Process user input to determine path
      const input = userInput.toLowerCase();
      let detectedPath: 'lost' | 'awakening' | 'ready' = 'awakening'; // Default
      
      if (input.includes('не знаю') || input.includes('потерян') || input.includes('новичок') || 
          input.includes('bilmayman') || input.includes('yo\'qolgan') || input.includes('yangi')) {
        detectedPath = 'lost';
      } else if (input.includes('опыт') || input.includes('знаю') || input.includes('эксперт') ||
                input.includes('tajriba') || input.includes('bilaman') || input.includes('ekspert')) {
        detectedPath = 'ready';
      }
      
      // Save user input for context
      localStorage.setItem('neuropul_user_input', userInput);
      
      // Handle the detected path
      handleOptionClick(detectedPath);
    }
  };

  const handleLanguageChange = (newLanguage: 'ru' | 'uz') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background cyberpunk elements with enhanced effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cyberpunk grid */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')]"></div>
        
        {/* Animated glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Digital rain effect (matrix-like) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className="absolute text-cyan-500 text-xs font-mono"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: 0,
                  opacity: 0.5 + Math.random() * 0.5,
                  animation: `digitalRain ${5 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              >
                {Array.from({ length: 20 }).map((_, j) => (
                  <div key={j} className="my-1">
                    {Math.random() > 0.5 ? '1' : '0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Scanlines effect */}
        <div className="absolute inset-0 bg-scanline opacity-5 pointer-events-none"></div>
      </div>
      
      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher onLanguageChange={handleLanguageChange} />
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
              {/* Trae Header with enhanced cyberpunk style */}
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(139,92,246,0.5)] relative">
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-full border border-purple-500 animate-ping opacity-30"></div>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Orbitron',sans-serif]">Trae</h2>
                  <p className="text-purple-300 text-sm">
                    {language === 'ru' ? 'AI-Наставник' : 'AI-Murabbiy'}
                  </p>
                </div>
                
                {/* Connection status indicator */}
                <div className="ml-auto flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-green-400 text-xs">ONLINE</span>
                </div>
              </div>
              
              {/* Message with glitch effect */}
              <div className="mb-8 relative">
                <p className="text-white text-lg leading-relaxed whitespace-pre-line font-['Courier_New',monospace] relative">
                  {message}
                  {isTyping && (
                    <span className="inline-block ml-1 animate-pulse">|</span>
                  )}
                </p>
                
                {/* Glitch effect overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <div className="glitch-text">{message}</div>
                </div>
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
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Я потерян' : 'Men yo\'qolganman'}
                      role="button"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      
                      <div className="w-10 h-10 bg-gray-700 group-hover:bg-gray-600 rounded-full flex items-center justify-center relative z-10">
                        <Skull className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                      </div>
                      <div className="text-left relative z-10">
                        <p className="text-white font-semibold">
                          {language === 'ru' ? '💀 Я потерян' : '💀 Men yo\'qolganman'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {language === 'ru' 
                            ? 'Не знаю, что такое AI и зачем он мне' 
                            : 'AI nima ekanligini va nima uchun kerakligini bilmayman'}
                        </p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      onClick={() => handleOptionClick('awakening')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full p-4 bg-gradient-to-r from-purple-900 to-blue-900 hover:from-purple-800 hover:to-blue-800 border border-purple-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Хочу пробудиться' : 'Uyg\'onishni xohlayman'}
                      role="button"
                    >
                      {/* Animated highlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      
                      <div className="w-10 h-10 bg-purple-800 group-hover:bg-purple-700 rounded-full flex items-center justify-center relative z-10">
                        <Rocket className="w-5 h-5 text-purple-300 group-hover:text-purple-200" />
                      </div>
                      <div className="text-left relative z-10">
                        <p className="text-white font-semibold">
                          {language === 'ru' ? '🚀 Хочу пробудиться' : '🚀 Uyg\'onishni xohlayman'}
                        </p>
                        <p className="text-purple-300 text-sm">
                          {language === 'ru' 
                            ? 'Готов начать путь AI-мастерства' 
                            : 'AI-mahorat yo\'lini boshlashga tayyorman'}
                        </p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      onClick={() => handleOptionClick('ready')}
                      onMouseEnter={() => playSound('hover')}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Я уже в теме' : 'Men allaqachon bilaman'}
                      role="button"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      
                      <div className="w-10 h-10 bg-gray-700 group-hover:bg-gray-600 rounded-full flex items-center justify-center relative z-10">
                        <AlienIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                      </div>
                      <div className="text-left relative z-10">
                        <p className="text-white font-semibold">
                          {language === 'ru' ? '👽 Я уже в теме' : '👽 Men allaqachon bilaman'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {language === 'ru' 
                            ? 'Знаю, что такое AI и как его использовать' 
                            : 'AI nima ekanligini va qanday ishlatishni bilaman'}
                        </p>
                      </div>
                    </motion.button>
                    
                    {/* Custom input option */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="mt-4"
                    >
                      {!showInput ? (
                        <button
                          onClick={() => setShowInput(true)}
                          onMouseEnter={() => playSound('hover')}
                          className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center mx-auto"
                          aria-label={language === 'ru' ? 'Описать свой опыт' : 'Tajribangizni tasvirlang'}
                          role="button"
                        >
                          <span>
                            {language === 'ru' 
                              ? 'Или опиши свой опыт своими словами...' 
                              : 'Yoki tajribangizni o\'z so\'zlaringiz bilan tasvirlang...'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={language === 'ru' 
                              ? 'Расскажи о своём опыте с AI...' 
                              : 'AI bilan tajribangiz haqida gapiring...'}
                            className="flex-1 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleCustomInput()}
                            aria-label={language === 'ru' ? 'Ваш опыт с AI' : 'AI bilan tajribangiz'}
                          />
                          <button
                            onClick={handleCustomInput}
                            onMouseEnter={() => playSound('hover')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            aria-label={language === 'ru' ? 'Отправить' : 'Yuborish'}
                            role="button"
                          >
                            {language === 'ru' ? 'Отправить' : 'Yuborish'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Cyberpunk decorative elements with enhanced effects */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-r-2 border-b-2 border-cyan-500 opacity-50 animate-pulse"></div>
              <div className="absolute -top-3 -left-3 w-24 h-24 border-l-2 border-t-2 border-purple-500 opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Glitch corner effect */}
              <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute inset-0 glitch-corner"></div>
              </div>
              
              {/* Neuropul logo/branding */}
              <div className="absolute bottom-4 left-4 text-xs text-purple-500 opacity-50 font-['Orbitron',sans-serif]">
                NEUROPUL.AI
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Global CSS for cyberpunk effects */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&display=swap');
        
        @keyframes digitalRain {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
        
        .bg-scanline {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.5) 50%
          );
          background-size: 100% 4px;
        }
        
        .glitch-text {
          position: relative;
          animation: glitch 3s infinite;
          color: rgba(139, 92, 246, 0.5);
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .glitch-corner {
          background: linear-gradient(45deg, transparent 48%, #00ffff 49%, transparent 51%);
          animation: cornerGlitch 2s infinite;
        }
        
        @keyframes cornerGlitch {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
          51% { transform: scale(0.8); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TraeAwakens;