import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Skull, Rocket, PenIcon as AlienIcon } from 'lucide-react';
import { logError } from '../lib/utils/errorLogger';
import { getUserLanguage, setUserLanguage, translate } from '../lib/utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { playSound, vibrate, cleanupAudio } from '../utils/audioUtils';
import { saveUserProgress, loadUserProgress, updateUserProgress } from '../utils/progressUtils';

interface TraeAwakensProps {
  onPathSelect: (path: 'lost' | 'awakening' | 'ready') => void;
}

const TraeAwakens: React.FC<TraeAwakensProps> = ({ onPathSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [userPath, setUserPath] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ru' | 'uz'>(getUserLanguage());
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Refs to prevent stale closures in event handlers
  const isNavigatingRef = useRef(false);
  const languageRef = useRef(language);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when state changes
  useEffect(() => {
    isNavigatingRef.current = isNavigating;
    languageRef.current = language;
  }, [isNavigating, language]);

  // Check for existing path in localStorage
  useEffect(() => {
    const savedPath = localStorage.getItem('neuropul_user_path');
    if (savedPath && (savedPath === 'lost' || savedPath === 'awakening' || savedPath === 'ready')) {
      // If user already selected a path, continue from there
      console.log('Found saved path:', savedPath);
      setUserPath(savedPath);
      
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (!isNavigatingRef.current) {
          onPathSelect(savedPath as 'lost' | 'awakening' | 'ready');
        }
      }, 100);
      
      timeoutRefs.current.push(timer);
    }
  }, [onPathSelect]);

  // Determine language from URL or localStorage
  useEffect(() => {
    try {
      const detectedLanguage = getUserLanguage();
      console.log('Initial language detection:', detectedLanguage);
      setLanguage(detectedLanguage);
    } catch (error) {
      console.error('Error in language detection:', error);
      logError(error, {
        component: 'TraeAwakens',
        action: 'languageDetection'
      });
    }
  }, []);

  // Trae's initial message based on language
  const getTraeMessage = () => {
    return language === 'ru' 
      ? "Ты здесь. Наконец-то. Я Trae — твой проводник в мире AI. Не буду тратить время на формальности. Мне нужно знать только одно..."
      : "Sen bu yerdasаn. Nihoyat. Men Trae — AI dunyosidagi yo'lboshchingman. Rasmiyatchilikka vaqt sarflamayman. Menga faqat bitta narsa bilish kerak...";
  };

  const getTraeQuestion = () => {
    return language === 'ru' ? "Кто ты?" : "Sen kimsan?";
  };

  // Simulate typing effect
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let questionTimeout: NodeJS.Timeout;
    let optionsTimeout: NodeJS.Timeout;
    
    try {
      setIsVisible(true);
      
      // Try to get user name from localStorage
      const savedName = localStorage.getItem('neuropul_user_name');
      if (savedName) {
        console.log(`User name loaded: ${savedName}`);
      }
      
      const traeMessage = getTraeMessage();
      let currentText = '';
      let currentIndex = 0;
      
      typingInterval = setInterval(() => {
        if (currentIndex < traeMessage.length) {
          currentText += traeMessage[currentIndex];
          setMessage(currentText);
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          
          // Show the question after a short delay
          questionTimeout = setTimeout(() => {
            setMessage(prev => `${prev}\n\n${getTraeQuestion()}`);
            
            // Show options after another delay
            optionsTimeout = setTimeout(() => {
              setShowOptions(true);
              
              // Set inactivity timer
              if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
              }
              
              const timer = setTimeout(() => {
                if (!userPath) {
                  setMessage(prev => `${prev}\n\n${language === 'ru' ? 'Эй, ты ещё здесь? Выбери свой путь, чтобы мы могли начать.' : 'Hey, hali ham shu yerdamisan? Boshlashimiz uchun yo\'lingni tanla.'}`);
                  playSound('hover', true);
                  vibrate([100, 50, 100], true);
                }
              }, 15000); // 15 seconds
              
              inactivityTimerRef.current = timer;
              timeoutRefs.current.push(timer);
            }, 1000);
            
            timeoutRefs.current.push(optionsTimeout);
          }, 500);
          
          timeoutRefs.current.push(questionTimeout);
        }
      }, 30); // Typing speed
      
      timeoutRefs.current.push(typingInterval);
      
      return () => {
        // Clean up all timeouts
        clearInterval(typingInterval);
        clearTimeout(questionTimeout);
        clearTimeout(optionsTimeout);
        
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
        
        // Clean up audio resources
        cleanupAudio();
      };
    } catch (error) {
      console.error('Error in typing effect:', error);
      logError(error, {
        component: 'TraeAwakens',
        action: 'typingEffect'
      });
      
      // Cleanup on error
      clearInterval(typingInterval);
      clearTimeout(questionTimeout);
      clearTimeout(optionsTimeout);
      
      // Fallback to show options immediately
      setIsTyping(false);
      setMessage(`${getTraeMessage()}\n\n${getTraeQuestion()}`);
      setShowOptions(true);
    }
  }, [language]);

  // Clean up all timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Clean up audio resources
      cleanupAudio();
    };
  }, []);

  const handleOptionClick = (path: 'lost' | 'awakening' | 'ready') => {
    // Prevent multiple clicks
    if (isNavigatingRef.current) {
      console.log('Navigation already in progress, ignoring click');
      return;
    }
    
    console.log(`Clicked option: ${path}`);
    setIsNavigating(true);
    isNavigatingRef.current = true;
    
    try {
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Save user path to localStorage for future reference
      localStorage.setItem('neuropul_user_path', path);
      localStorage.setItem('neuropul_first_visit_date', new Date().toISOString());
      localStorage.setItem('neuropul_current_screen', path);
      
      // Set user path in state
      setUserPath(path);
      
      // Initialize or update user progress
      const existingProgress = loadUserProgress();
      if (existingProgress) {
        updateUserProgress({
          questStep: 1,
          lastActive: new Date().toISOString(),
          userPath: path
        });
      } else {
        // Create initial progress
        saveUserProgress({
          name: '',
          archetype: null,
          avatarUrl: '',
          xp: 0,
          level: 1,
          prophecy: '',
          awakened: false,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          userPath: path,
          questStep: 1
        });
      }
      
      // Play sound and vibrate
      playSound('click', true);
      vibrate([50, 30, 50], true);
      
      // Call the onPathSelect callback with a small delay
      const navigationTimeout = setTimeout(() => {
        console.log(`Navigating to path: ${path}`);
        onPathSelect(path);
        
        // Reset navigation state after a delay in case the navigation fails
        const resetTimeout = setTimeout(() => {
          setIsNavigating(false);
          isNavigatingRef.current = false;
        }, 1000);
        
        timeoutRefs.current.push(resetTimeout);
      }, 100);
      
      timeoutRefs.current.push(navigationTimeout);
    } catch (error) {
      console.error('Error in handleOptionClick:', error);
      logError(error, {
        component: 'TraeAwakens',
        action: 'handleOptionClick',
        additionalData: { path }
      });
      
      // Reset navigation state
      setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  };

  // Handle custom user input
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCustomInput = () => {
    if (userInput.trim() && !isNavigatingRef.current) {
      setIsNavigating(true);
      isNavigatingRef.current = true;
      
      try {
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
        localStorage.setItem('neuropul_user_path', detectedPath);
        localStorage.setItem('neuropul_current_screen', detectedPath);
        
        // Initialize or update user progress
        const existingProgress = loadUserProgress();
        if (existingProgress) {
          updateUserProgress({
            questStep: 1,
            lastActive: new Date().toISOString(),
            userPath: detectedPath
          });
        } else {
          // Create initial progress
          saveUserProgress({
            name: '',
            archetype: null,
            avatarUrl: '',
            xp: 0,
            level: 1,
            prophecy: '',
            awakened: false,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            userPath: detectedPath,
            questStep: 1
          });
        }
        
        // Play sound and vibrate
        playSound('click', true);
        vibrate([50, 30, 50], true);
        
        // Call the onPathSelect callback with a small delay
        const navigationTimeout = setTimeout(() => {
          onPathSelect(detectedPath);
          
          // Reset navigation state after a delay in case the navigation fails
          const resetTimeout = setTimeout(() => {
            setIsNavigating(false);
            isNavigatingRef.current = false;
          }, 1000);
          
          timeoutRefs.current.push(resetTimeout);
        }, 100);
        
        timeoutRefs.current.push(navigationTimeout);
      } catch (error) {
        console.error('Error in handleCustomInput:', error);
        logError(error, {
          component: 'TraeAwakens',
          action: 'handleCustomInput',
          additionalData: { userInput }
        });
        
        // Reset navigation state
        setIsNavigating(false);
        isNavigatingRef.current = false;
      }
    }
  };

  // Language switcher
  const handleLanguageChange = (newLang: 'ru' | 'uz') => {
    try {
      console.log(`Switching language from ${language} to ${newLang}`);
      
      setLanguage(newLang);
      setUserLanguage(newLang);
      
      // Reset state to restart with new language
      setIsTyping(true);
      setMessage('');
      setShowOptions(false);
      
      // Clear any existing timers
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Restart the typing effect with new language
      const traeMessage = newLang === 'ru' 
        ? "Ты здесь. Наконец-то. Я Trae — твой проводник в мире AI. Не буду тратить время на формальности. Мне нужно знать только одно..."
        : "Sen bu yerdasаn. Nihoyat. Men Trae — AI dunyosidagi yo'lboshchingman. Rasmiyatchilikka vaqt sarflamayman. Menga faqat bitta narsa bilish kerak...";
      
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
          const questionTimeout = setTimeout(() => {
            const traeQuestion = newLang === 'ru' ? "Кто ты?" : "Sen kimsan?";
            setMessage(prev => `${prev}\n\n${traeQuestion}`);
            
            // Show options after another delay
            const optionsTimeout = setTimeout(() => {
              setShowOptions(true);
            }, 1000);
            
            timeoutRefs.current.push(optionsTimeout);
          }, 500);
          
          timeoutRefs.current.push(questionTimeout);
        }
      }, 30);
      
      timeoutRefs.current.push(typingInterval);
    } catch (error) {
      console.error('Error toggling language:', error);
      logError(error, {
        component: 'TraeAwakens',
        action: 'toggleLanguage'
      });
    }
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
                      onMouseEnter={() => playSound('hover', true)}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Я потерян' : 'Men yo\'qolganman'}
                      disabled={isNavigating}
                      id="lost-soul-button"
                      data-testid="lost-soul-button"
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
                      onMouseEnter={() => playSound('hover', true)}
                      className="w-full p-4 bg-gradient-to-r from-purple-900 to-blue-900 hover:from-purple-800 hover:to-blue-800 border border-purple-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Хочу пробудиться' : 'Uyg\'onishni xohlayman'}
                      disabled={isNavigating}
                      id="awakening-button"
                      data-testid="awakening-button"
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
                      onMouseEnter={() => playSound('hover', true)}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all duration-300 flex items-center space-x-3 group relative overflow-hidden"
                      aria-label={language === 'ru' ? 'Я уже в теме' : 'Men allaqachon bilaman'}
                      disabled={isNavigating}
                      id="ready-button"
                      data-testid="ready-button"
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
                            : 'AI nima ekanligini va undan qanday foydalanishni bilaman'}
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
                          onMouseEnter={() => playSound('hover', true)}
                          className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center mx-auto"
                          aria-label={language === 'ru' ? 'Описать свой опыт своими словами' : 'Tajribangizni o\'z so\'zlaringiz bilan tasvirlang'}
                          disabled={isNavigating}
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
                            disabled={isNavigating}
                          />
                          <button
                            onClick={handleCustomInput}
                            onMouseEnter={() => playSound('hover', true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            aria-label={language === 'ru' ? 'Отправить' : 'Yuborish'}
                            disabled={isNavigating}
                          >
                            {language === 'ru' ? 'Отправить' : 'Yuborish'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Loading indicator */}
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-4 h-4 bg-cyan-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </motion.div>
              )}
              
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