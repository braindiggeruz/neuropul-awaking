import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { logError } from '../lib/utils/errorLogger';
import { getUserLanguage, translate } from '../lib/utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { saveUserProgress, loadUserProgress, updateUserProgress, addUserXP } from '../utils/progressUtils';
import { playSound, vibrate } from '../utils/sounds';

interface ResponseAwakeningProps {
  onContinue: () => void;
  onBack: () => void;
}

const ResponseAwakening: React.FC<ResponseAwakeningProps> = ({ onContinue, onBack }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [userName, setUserName] = useState('');
  const [xp, setXp] = useState(0);
  const [language, setLanguage] = useState<'ru' | 'uz'>(getUserLanguage());
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Refs to prevent stale closures in event handlers
  const isNavigatingRef = useRef(false);
  const languageRef = useRef(language);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Update refs when state changes
  useEffect(() => {
    isNavigatingRef.current = isNavigating;
    languageRef.current = language;
  }, [isNavigating, language]);

  // Load language preference
  useEffect(() => {
    try {
      const detectedLanguage = getUserLanguage();
      console.log('Initial language detection:', detectedLanguage);
      setLanguage(detectedLanguage);
    } catch (error) {
      console.error('Error in language detection:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'languageDetection'
      });
    }
  }, []);

  // Trae's response to those who want to awaken
  const getTraeMessage = () => {
    return language === 'ru' 
      ? "Отлично. Я уважаю тех, кто готов к действию.\n\nПробуждение — это не просто слова. Это путь трансформации. Ты станешь тем, кто использует AI как продолжение своего разума.\n\nЯ проведу тебя через ритуал пробуждения. Ты узнаешь свой архетип, получишь персональное пророчество и доступ к инструментам AI-мастерства.\n\nГотов начать?"
      : "Ajoyib. Men harakatga tayyor odamlarni hurmat qilaman.\n\nUyg'onish - bu shunchaki so'zlar emas. Bu o'zgarish yo'li. Siz AI-ni o'z ongingizning davomi sifatida ishlatadiganlardan biriga aylanasiz.\n\nMen sizni uyg'onish marosimi orqali olib o'taman. Siz o'z arxetipingizni bilib olasiz, shaxsiy bashorat va AI-mahorat vositalariga kirish huquqini olasiz.\n\nBoshlashga tayyormisiz?";
  };

  // Simulate typing effect
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    
    try {
      setIsVisible(true);
      
      // Try to get user name from localStorage
      const savedName = localStorage.getItem('neuropul_user_name');
      if (savedName) {
        setUserName(savedName);
        console.log(`User name loaded: ${savedName}`);
      }
      
      // Load user progress
      const userProgress = loadUserProgress();
      if (userProgress) {
        setXp(userProgress.xp || 0);
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
          
          // Show continue button after message is fully typed
          const continueTimeout = setTimeout(() => {
            setShowContinue(true);
            
            // Award XP for reaching this step
            const currentXp = userProgress?.xp || 0;
            const newXp = currentXp + 10;
            
            // Update XP in state and localStorage
            setXp(newXp);
            
            // Update user progress
            if (userProgress) {
              updateUserProgress({
                xp: newXp,
                questStep: 1,
                lastActive: new Date().toISOString()
              });
            } else {
              // Create initial progress
              saveUserProgress({
                name: userName || '',
                archetype: null,
                avatarUrl: '',
                xp: newXp,
                level: 1,
                prophecy: '',
                awakened: false,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                questStep: 1,
                userPath: 'awakening'
              });
            }
            
            // Play XP sound
            playSound('xp', true);
            vibrate([50, 30, 50], true);
          }, 500);
          
          timeoutRefs.current.push(continueTimeout);
        }
      }, 20); // Typing speed
      
      timeoutRefs.current.push(typingInterval);
      
      return () => {
        clearInterval(typingInterval);
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      };
    } catch (error) {
      console.error('Error in typing effect:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'typingEffect'
      });
      
      // Cleanup on error
      clearInterval(typingInterval);
      
      // Fallback to show message immediately
      setMessage(getTraeMessage());
      setIsTyping(false);
      setShowContinue(true);
    }
  }, [language]);

  const handleContinue = () => {
    try {
      if (isNavigatingRef.current) {
        console.log('Navigation already in progress, ignoring');
        return;
      }
      
      console.log('Continue button clicked');
      setIsNavigating(true);
      isNavigatingRef.current = true;
      
      playSound('click', true);
      vibrate([50, 30, 50], true);
      
      // Save user experience level
      localStorage.setItem('neuropul_user_experience', 'intermediate');
      localStorage.setItem('neuropul_user_path', 'awakening');
      
      // Save current screen
      localStorage.setItem('neuropul_current_screen', 'portal');
      
      // Set hasPassedPortal flag - CRITICAL FIX: Use string "true" instead of boolean
      localStorage.setItem('hasPassedPortal', 'true');
      
      // Track progress
      const visitCount = parseInt(localStorage.getItem('neuropul_visit_count') || '0');
      localStorage.setItem('neuropul_visit_count', (visitCount + 1).toString());
      
      // Set flag for potential CTA later
      localStorage.setItem('neuropul_viewed_messages', '2');
      
      // Set flag for awakening
      localStorage.setItem('neuropul_awakening_started', 'true');
      
      // Update user progress
      updateUserProgress({
        questStep: 2,
        lastActive: new Date().toISOString()
      });
      
      // Call onContinue with a small delay
      const continueTimeout = setTimeout(() => {
        onContinue();
        
        // Reset navigation state after a delay in case the navigation fails
        const resetTimeout = setTimeout(() => {
          setIsNavigating(false);
          isNavigatingRef.current = false;
        }, 1000);
        
        timeoutRefs.current.push(resetTimeout);
      }, 300);
      
      timeoutRefs.current.push(continueTimeout);
    } catch (error) {
      console.error('Error in handleContinue:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'handleContinue'
      });
      
      // Reset navigation state
      setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  };

  const handleBack = () => {
    try {
      if (isNavigatingRef.current) {
        console.log('Navigation already in progress, ignoring');
        return;
      }
      
      console.log('Back button clicked');
      setIsNavigating(true);
      isNavigatingRef.current = true;
      
      playSound('click', true);
      vibrate([30], true);
      
      // Save current screen
      localStorage.setItem('neuropul_current_screen', 'intro');
      
      // Update user progress
      updateUserProgress({
        questStep: 0,
        lastActive: new Date().toISOString()
      });
      
      // Call onBack with a small delay
      const backTimeout = setTimeout(() => {
        onBack();
        
        // Reset navigation state after a delay in case the navigation fails
        const resetTimeout = setTimeout(() => {
          setIsNavigating(false);
          isNavigatingRef.current = false;
        }, 1000);
        
        timeoutRefs.current.push(resetTimeout);
      }, 300);
      
      timeoutRefs.current.push(backTimeout);
    } catch (error) {
      console.error('Error in handleBack:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'handleBack'
      });
      
      // Reset navigation state
      setIsNavigating(false);
      isNavigatingRef.current = false;
    }
  };

  // Handle name input
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleNameSubmit = () => {
    try {
      if (nameInput.trim()) {
        localStorage.setItem('neuropul_user_name', nameInput.trim());
        setUserName(nameInput.trim());
        setShowNameInput(false);
        playSound('click', true);
        vibrate([50, 30, 50], true);
        
        // Update user progress
        updateUserProgress({
          name: nameInput.trim(),
          lastActive: new Date().toISOString()
        });
        
        // Award XP for setting name
        const newXp = addUserXP(5);
        if (newXp) {
          setXp(newXp.xp);
        }
      }
    } catch (error) {
      console.error('Error in handleNameSubmit:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'handleNameSubmit'
      });
    }
  };

  // Language change handler
  const handleLanguageChange = (newLang: 'ru' | 'uz') => {
    try {
      console.log(`Language changed from ${language} to ${newLang}`);
      setLanguage(newLang);
      
      // Reset message and typing state to show message in new language
      setIsTyping(true);
      setMessage('');
      setShowContinue(false);
      
      // Restart typing effect with new language
      const traeMessage = getTraeMessage();
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
          const continueTimeout = setTimeout(() => {
            setShowContinue(true);
          }, 500);
          
          timeoutRefs.current.push(continueTimeout);
        }
      }, 20);
      
      timeoutRefs.current.push(typingInterval);
    } catch (error) {
      console.error('Error changing language:', error);
      logError(error, {
        component: 'ResponseAwakening',
        action: 'handleLanguageChange'
      });
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

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
        
        {/* Awakening video background (if available) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50"></div>
          <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7aDdSjGlUbmwFCQo/giphy.gif')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
        </div>
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
                
                {/* XP indicator */}
                {xp > 0 && (
                  <div className="ml-auto flex items-center bg-purple-900/50 px-3 py-1 rounded-full border border-purple-500/30">
                    <Zap className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 text-xs font-bold">{xp} XP</span>
                  </div>
                )}
              </div>
              
              {/* Message with glitch effect */}
              <div className="mb-8 relative">
                <p className="text-white text-lg leading-relaxed whitespace-pre-line font-['Courier_New',monospace] relative">
                  {userName ? `${userName}, ` : ''}
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
              
              {/* Name input */}
              {showContinue && !userName && !showNameInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <button
                    onClick={() => setShowNameInput(true)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                    aria-label={language === 'ru' ? 'Как мне к тебе обращаться?' : 'Sizga qanday murojaat qilishim kerak?'}
                    disabled={isNavigating}
                  >
                    {language === 'ru' 
                      ? 'Как мне к тебе обращаться?' 
                      : 'Sizga qanday murojaat qilishim kerak?'}
                  </button>
                </motion.div>
              )}
              
              {showNameInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex space-x-2"
                >
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={language === 'ru' ? 'Введи своё имя...' : 'Ismingizni kiriting...'}
                    className="flex-1 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                    autoFocus
                    aria-label={language === 'ru' ? 'Ваше имя' : 'Ismingiz'}
                    disabled={isNavigating}
                  />
                  <button
                    onClick={handleNameSubmit}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                    aria-label={language === 'ru' ? 'Сохранить' : 'Saqlash'}
                    disabled={isNavigating}
                  >
                    {language === 'ru' ? 'Сохранить' : 'Saqlash'}
                  </button>
                </motion.div>
              )}
              
              {/* Awakening Journey with enhanced visual style */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-cyan-400 font-semibold mb-4 flex items-center font-['Orbitron',sans-serif]">
                      <Sparkles className="w-5 h-5 mr-2" />
                      {translate('awakeningPath', language)}
                    </h3>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500"></div>
                      
                      <div className="ml-10 space-y-6">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="relative"
                        >
                          <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.7)]"></div>
                          <h4 className="text-white font-semibold font-['Orbitron',sans-serif]">
                            {translate('archetypeDetermination', language)}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {translate('archetypeDesc', language)}
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative"
                        >
                          <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]"></div>
                          <h4 className="text-white font-semibold font-['Orbitron',sans-serif]">
                            {translate('getProphecy', language)}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {translate('prophecyDesc', language)}
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative"
                        >
                          <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.7)]"></div>
                          <h4 className="text-white font-semibold font-['Orbitron',sans-serif]">
                            {translate('toolsAccess', language)}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {translate('toolsDesc', language)}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Progress indicator */}
              {showContinue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full w-1/3 rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{translate('beginning', language)}</span>
                    <span>{translate('awakening', language)}</span>
                    <span>{translate('mastery', language)}</span>
                  </div>
                </motion.div>
              )}
              
              {/* Buttons with enhanced cyberpunk style */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex space-x-4"
                  >
                    <button
                      onClick={handleBack}
                      onMouseEnter={() => playSound('hover', true)}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2 border border-gray-700 hover:border-purple-500 group relative overflow-hidden"
                      aria-label={translate('back', language)}
                      disabled={isNavigating}
                    >
                      {/* Button hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      <span>{translate('back', language)}</span>
                    </button>
                    
                    <button
                      onClick={handleContinue}
                      onMouseEnter={() => playSound('hover', true)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 relative overflow-hidden group"
                      aria-label={translate('startAwakening', language)}
                      disabled={isNavigating}
                      id="start-awakening-button"
                      data-testid="start-awakening-button"
                    >
                      {/* Button glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative z-10 flex items-center justify-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>{translate('startAwakening', language)}</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
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
    </div>
  );
};

export default ResponseAwakening;