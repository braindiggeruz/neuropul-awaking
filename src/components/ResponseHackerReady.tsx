import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Code, Zap, Terminal, Lock } from 'lucide-react';
import { logError } from '../lib/utils/errorLogger';
import { getUserLanguage, setUserLanguage } from '../lib/utils/i18n';
import { playSound, vibrate, cleanupAudio } from '../utils/audioUtils';
import { navigateSafely } from '../utils/navigationUtils';

interface ResponseHackerReadyProps {
  onContinue: () => void;
  onBack: () => void;
}

const ResponseHackerReady: React.FC<ResponseHackerReadyProps> = ({ onContinue, onBack }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);
  const [userName, setUserName] = useState('');
  const [xp, setXp] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [language, setLanguage] = useState<'ru' | 'uz'>(getUserLanguage());
  
  // Refs for preventing multiple executions
  const printedOnceRef = useRef(false);
  const hasRenderedRef = useRef(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const languageRef = useRef(language);

  // Update refs when state changes
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Load language preference
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      
      if (langParam === 'uz' || langParam === 'ru') {
        setLanguage(langParam);
        console.log(`Language set from URL: ${langParam}`);
      } else {
        const savedLang = localStorage.getItem('neuropul_language');
        if (savedLang === 'uz' || savedLang === 'ru') {
          setLanguage(savedLang);
          console.log(`Language set from localStorage: ${savedLang}`);
        } else {
          // Default to Russian
          setLanguage('ru');
          console.log('Language defaulted to Russian');
        }
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      logError(error, {
        component: 'ResponseHackerReady',
        action: 'loadLanguage'
      });
      // Default to Russian on error
      setLanguage('ru');
    }
  }, []);

  // Trae's response to those who are already familiar with AI
  const getTraeMessage = () => {
    return language === 'ru' 
      ? "Вот это я понимаю. Хакер в доме.\n\nРаз ты уже в теме, давай без лишних слов. У меня есть набор продвинутых AI-инструментов, которые выведут твои навыки на новый уровень.\n\nМы определим твой архетип, чтобы персонализировать опыт. Затем ты получишь доступ к генераторам идей, кода, контента и многому другому.\n\nПлюс, тут есть система XP и уровней. Каждое использование AI приносит опыт и разблокирует новые возможности."
      : "Mana buni tushunaman. Xaker uyda.\n\nAgar siz allaqachon mavzuda bo'lsangiz, ortiqcha so'zlarsiz. Menda sizning ko'nikmalaringizni yangi darajaga ko'taradigan ilg'or AI vositalari to'plami bor.\n\nTajribani shaxsiylashtirish uchun arxetipingizni aniqlaymiz. Keyin siz g'oya, kod, kontent generatorlari va boshqa ko'p narsalarga kirish huquqini olasiz.\n\nBundan tashqari, bu yerda XP va darajalar tizimi mavjud. AI-dan har bir foydalanish tajriba keltiradi va yangi imkoniyatlarni ochadi.";
  };

  // Simulate typing effect
  useEffect(() => {
    // Guard against multiple executions
    if (printedOnceRef.current) return;
    printedOnceRef.current = true;
    
    let typingInterval: NodeJS.Timeout;
    
    try {
      setIsVisible(true);
      
      // Try to get user name from localStorage
      const savedName = localStorage.getItem('neuropul_user_name');
      if (savedName) {
        setUserName(savedName);
        console.log(`User name loaded: ${savedName}`);
      }
      
      // Check if user has paid status
      const userPaid = localStorage.getItem('neuropul_is_paid') === 'true'; // FIXED: Check for string "true"
      setIsPaid(userPaid);
      
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
            const currentXp = parseInt(localStorage.getItem('neuropul_xp') || '0');
            const newXp = currentXp + 15; // More XP for advanced users
            localStorage.setItem('neuropul_xp', newXp.toString());
            setXp(newXp);
            
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
        cleanupAudio();
      };
    } catch (error) {
      console.error('Error in typing effect:', error);
      logError(error, {
        component: 'ResponseHackerReady',
        action: 'typingEffect'
      });
      
      // Fallback to show message immediately
      setMessage(getTraeMessage());
      setIsTyping(false);
      setShowContinue(true);
    }
  }, [language]);

  const handleContinue = () => {
    try {
      console.log('Continue button clicked');
      
      playSound('click', true);
      vibrate([50, 30, 50], true);
      
      // Save user experience level
      localStorage.setItem('neuropul_user_experience', 'advanced');
      localStorage.setItem('neuropul_user_path', 'ready');
      
      // FIXED: Use string "true" instead of boolean true
      localStorage.setItem('hasPassedPortal', 'true');
      
      // Track progress
      const visitCount = parseInt(localStorage.getItem('neuropul_visit_count') || '0');
      localStorage.setItem('neuropul_visit_count', (visitCount + 1).toString());
      
      // Set flag for potential CTA later
      localStorage.setItem('neuropul_viewed_messages', '3');
      
      // Set flag for advanced tools
      localStorage.setItem('neuropul_advanced_tools_unlocked', 'true');
      
      // Call onContinue
      onContinue();
    } catch (error) {
      console.error('Error in handleContinue:', error);
      logError(error, {
        component: 'ResponseHackerReady',
        action: 'handleContinue'
      });
    }
  };

  const handleBack = () => {
    try {
      console.log('Back button clicked');
      
      playSound('click', true);
      vibrate([30], true);
      
      // Call onBack
      onBack();
    } catch (error) {
      console.error('Error in handleBack:', error);
      logError(error, {
        component: 'ResponseHackerReady',
        action: 'handleBack'
      });
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
        
        // Award XP for setting name
        const currentXp = parseInt(localStorage.getItem('neuropul_xp') || '0');
        const newXp = currentXp + 5;
        localStorage.setItem('neuropul_xp', newXp.toString());
        setXp(newXp);
      }
    } catch (error) {
      console.error('Error in handleNameSubmit:', error);
      logError(error, {
        component: 'ResponseHackerReady',
        action: 'handleNameSubmit'
      });
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      cleanupAudio();
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
        
        {/* Hacker video background (if available) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50"></div>
          <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3oKIPtjEDVUQv1GE4U/giphy.gif')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
        </div>
      </div>
      
      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => {
            const newLang = language === 'ru' ? 'uz' : 'ru';
            setLanguage(newLang);
            setUserLanguage(newLang);
            // Update URL with language parameter
            const url = new URL(window.location.href);
            url.searchParams.set('lang', newLang);
            window.history.replaceState({}, '', url.toString());
          }}
          className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-70 transition-colors focus-ring"
          aria-label={language === 'ru' ? 'Переключить на узбекский' : 'Rus tiliga o\'tish'}
        >
          {language === 'ru' ? 'O\'zbekcha' : 'Русский'}
        </button>
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
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm focus-ring"
                    aria-label={language === 'ru' ? 'Как мне к тебе обращаться, хакер?' : 'Sizga qanday murojaat qilishim kerak, xaker?'}
                  >
                    {language === 'ru' 
                      ? 'Как мне к тебе обращаться, хакер?' 
                      : 'Sizga qanday murojaat qilishim kerak, xaker?'}
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
                    placeholder={language === 'ru' 
                      ? 'Введи своё имя или хендл...' 
                      : 'Ismingizni yoki taxallusingizni kiriting...'}
                    className="flex-1 bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                    autoFocus
                    aria-label={language === 'ru' ? 'Ваше имя или хендл' : 'Ismingiz yoki taxallusingiz'}
                  />
                  <button
                    onClick={handleNameSubmit}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors focus-ring"
                    aria-label={language === 'ru' ? 'Сохранить' : 'Saqlash'}
                  >
                    {language === 'ru' ? 'Сохранить' : 'Saqlash'}
                  </button>
                </motion.div>
              )}
              
              {/* Advanced Tools with enhanced visual style */}
              <AnimatePresence>
                {showContinue && !hasRenderedRef.current && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-cyan-400 font-semibold mb-4 flex items-center font-['Orbitron',sans-serif]">
                      <Terminal className="w-5 h-5 mr-2" />
                      {language === 'ru' ? 'Доступные инструменты:' : 'Mavjud vositalar:'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors group relative overflow-hidden"
                      >
                        {/* Tool hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center space-x-3 mb-2 relative z-10">
                          <Code className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                          <span className="text-white font-semibold">
                            {language === 'ru' ? 'Генератор кода' : 'Kod generatori'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm relative z-10">
                          {language === 'ru' 
                            ? 'Создавай код на любом языке программирования' 
                            : 'Istalgan dasturlash tilida kod yarating'}
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors group relative overflow-hidden"
                      >
                        {/* Premium tool indicator */}
                        {!isPaid && (
                          <div className="absolute top-2 right-2 z-20">
                            <div className="bg-yellow-500 bg-opacity-20 p-1 rounded-full">
                              <Lock className="w-3 h-3 text-yellow-400" />
                            </div>
                          </div>
                        )}
                        
                        {/* Tool hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center space-x-3 mb-2 relative z-10">
                          <Zap className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                          <span className="text-white font-semibold">
                            {language === 'ru' ? 'MVP-генератор' : 'MVP-generator'}
                          </span>
                          {!isPaid && <span className="text-xs text-yellow-400">PRO</span>}
                        </div>
                        <p className="text-gray-300 text-sm relative z-10">
                          {language === 'ru' 
                            ? 'Быстрое создание минимально жизнеспособного продукта' 
                            : 'Minimal hayotiy mahsulotni tez yaratish'}
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors group relative overflow-hidden"
                      >
                        {/* Tool hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center space-x-3 mb-2 relative z-10">
                          <Terminal className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                          <span className="text-white font-semibold">
                            {language === 'ru' ? 'Промпт-инженер' : 'Prompt-muhandis'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm relative z-10">
                          {language === 'ru' 
                            ? 'Создание и оптимизация промптов для лучших результатов' 
                            : 'Eng yaxshi natijalar uchun promptlarni yaratish va optimallashtirish'}
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors group relative overflow-hidden"
                      >
                        {/* Tool hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center space-x-3 mb-2 relative z-10">
                          <Brain className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <span className="text-white font-semibold">
                            {language === 'ru' ? 'AI-ассистент' : 'AI-yordamchi'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm relative z-10">
                          {language === 'ru' 
                            ? 'Персональный помощник для решения любых задач' 
                            : 'Har qanday vazifani hal qilish uchun shaxsiy yordamchi'}
                        </p>
                      </motion.div>
                    </div>
                    {hasRenderedRef.current = true}
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
                    <span>{language === 'ru' ? 'Начало' : 'Boshlanish'}</span>
                    <span>{language === 'ru' ? 'Пробуждение' : 'Uyg\'onish'}</span>
                    <span>{language === 'ru' ? 'Мастерство' : 'Mahorat'}</span>
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
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center space-x-2 border border-gray-700 hover:border-purple-500 group relative overflow-hidden focus-ring"
                      aria-label={language === 'ru' ? 'Назад' : 'Orqaga'}
                    >
                      {/* Button hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      
                      <ArrowRight className="w-5 h-5 rotate-180" />
                      <span>{language === 'ru' ? 'Назад' : 'Orqaga'}</span>
                    </button>
                    
                    <button
                      onClick={handleContinue}
                      onMouseEnter={() => playSound('hover', true)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 relative overflow-hidden group focus-ring"
                      aria-label={language === 'ru' ? 'Перейти к инструментам' : 'Vositalarga o\'tish'}
                    >
                      {/* Button glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative z-10 flex items-center justify-center space-x-2">
                        <Terminal className="w-5 h-5" />
                        <span>
                          {language === 'ru' ? 'Перейти к инструментам' : 'Vositalarga o\'tish'}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* CTA for premium */}
              {showContinue && !isPaid && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-500/30"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                      <Lock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-1">
                        {language === 'ru' ? 'Разблокируй полную мощь AI' : 'AI-ning to\'liq kuchini ochib bering'}
                      </h4>
                      <p className="text-yellow-200 text-sm mb-2">
                        {language === 'ru' 
                          ? 'Получи доступ ко всем продвинутым инструментам и функциям' 
                          : 'Barcha ilg\'or vositalar va funksiyalarga kirish huquqini oling'}
                      </p>
                      <button
                        onClick={() => {
                          // Set flag for CTA view
                          localStorage.setItem('neuropul_cta_viewed', 'true');
                          // Continue to next step
                          handleContinue();
                        }}
                        className="text-sm bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2 focus-ring"
                        aria-label={language === 'ru' ? 'Узнать больше' : 'Ko\'proq bilish'}
                      >
                        <Zap className="w-4 h-4" />
                        <span>
                          {language === 'ru' ? 'Узнать больше' : 'Ko\'proq bilish'}
                        </span>
                      </button>
                    </div>
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

export default ResponseHackerReady;