import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Zap, Trophy, Star, Shield, Wand2, Code, AArrowDown as Owl, Download, Crown, Settings, Plus, RotateCcw, Copy, Clock, Sparkles, Image, Palette, Rocket, Lock, CheckCircle, X, Award, CreditCard } from 'lucide-react';
import { askOpenAI, generateMemeImage, getToolPrompt, getToolResultTitle, OpenAIResponse, MemeImageResponse } from './utils/openaiService';
import { APP_VERSION } from './constants/version';

// Types
interface UserProgress {
  xp: number;
  level: number;
  archetype: string | null;
  userName: string;
  isPaid: boolean;
  dailyStreak: number;
  lastVisit: string;
  questStep: number;
  certificateUnlocked: boolean;
  version: string;
  hasCompletedOnboarding: boolean;
  hasSeenFomo: boolean;
  fomoTimerStart: number | null;
  toolsUsed: string[];
  lastMeme?: {
    imageUrl?: string;
    textContent?: string;
    theme: string;
    timestamp: number;
  };
}

interface ArchetypeData {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  gradient: string;
  phrases: string[];
}

interface ToolModalState {
  isOpen: boolean;
  toolId: string | null;
  userInput: string;
  output: string;
  isLoading: boolean;
  hasUsedTool: boolean;
  generatedImage?: string;
  showImageActions: boolean;
}

// Constants
const XP_THRESHOLDS = [0, 100, 250, 400, 600, 850, 1150, 1500, 1900, 2350];
const FOMO_TIMER_DURATION = 15 * 60 * 1000; // 15 minutes

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'warrior',
    name: 'Воин',
    icon: <Shield className="w-8 h-8" />,
    description: 'Сила и решимость ведут к победе',
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    phrases: [
      'Ты крушишь преграды, как стена!',
      'Воин не знает поражений!',
      'Твоя сила растёт с каждым шагом!',
      'Победа за победой - твой путь!'
    ]
  },
  {
    id: 'mage',
    name: 'Маг',
    icon: <Wand2 className="w-8 h-8" />,
    description: 'Знания и интуиция - твоя магия',
    color: 'purple',
    gradient: 'from-purple-500 to-blue-500',
    phrases: [
      'Вижу, ты управляешь словами, как заклинаниями',
      'Твоя магия становится сильнее!',
      'Знания - твоя истинная сила!',
      'Мудрость течёт через тебя!'
    ]
  },
  {
    id: 'hacker',
    name: 'Хакер',
    icon: <Code className="w-8 h-8" />,
    description: 'Хаки и AI-инструменты в твоих руках',
    color: 'green',
    gradient: 'from-green-500 to-teal-500',
    phrases: [
      'Одна строка кода — и мир меняется',
      'Ты взламываешь реальность!',
      'Код подчиняется твоей воле!',
      'Цифровой мир в твоих руках!'
    ]
  },
  {
    id: 'sage',
    name: 'Мудрец',
    icon: <Owl className="w-8 h-8" />,
    description: 'Понимание и смысл - твой путь',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-500',
    phrases: [
      'Ты познаёшь смысл за смыслом',
      'Мудрость освещает твой путь!',
      'Глубина понимания растёт!',
      'Истина открывается тебе!'
    ]
  }
];

const AI_TOOLS = [
  {
    id: 'idea-generator',
    name: 'Генератор AI-идей',
    icon: <Brain className="w-6 h-6" />,
    description: 'Создавай революционные идеи',
    xpReward: 25,
    isPremium: false,
    requiresInput: false
  },
  {
    id: 'image-analyzer',
    name: 'AI-анализатор картинки',
    icon: <Image className="w-6 h-6" />,
    description: 'Анализируй изображения с ИИ',
    xpReward: 25,
    isPremium: false,
    requiresInput: true
  },
  {
    id: 'code-assistant',
    name: 'Код-ассистент',
    icon: <Code className="w-6 h-6" />,
    description: 'Программируй с помощью ИИ',
    xpReward: 25,
    isPremium: false,
    requiresInput: true
  },
  {
    id: 'meme-generator',
    name: 'Мем-генератор',
    icon: <Palette className="w-6 h-6" />,
    description: 'Создавай вирусные мемы',
    xpReward: 25,
    isPremium: false,
    requiresInput: true
  },
  {
    id: 'mvp-generator',
    name: 'MVP-генератор',
    icon: <Rocket className="w-6 h-6" />,
    description: 'Создай свой AI-бизнес',
    xpReward: 50,
    isPremium: true,
    requiresInput: true
  }
];

// Utility functions
const getLevelByXP = (xp: number): number => {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
};

const getXPForNextLevel = (level: number): number => {
  return XP_THRESHOLDS[level + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
};

const getXPProgress = (xp: number, level: number): number => {
  const currentLevelXP = XP_THRESHOLDS[level];
  const nextLevelXP = getXPForNextLevel(level);
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

const generateCertificateId = (): string => {
  return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const playSound = (type: 'levelup' | 'success' | 'error') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'levelup':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio not supported');
  }
};

const vibrate = (pattern: number[]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Components
const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick();
  };

  return (
    <button
      className={`relative overflow-hidden ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};

const XPBar: React.FC<{ xp: number; level: number; archetype: ArchetypeData | null }> = ({ xp, level, archetype }) => {
  const progress = getXPProgress(xp, level);
  const nextLevelXP = getXPForNextLevel(level);
  const currentLevelXP = XP_THRESHOLDS[level];
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-semibold">Уровень {level}</span>
        </div>
        <span className="text-gray-300 text-sm">{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${archetype?.gradient || 'from-blue-500 to-purple-500'} transition-all duration-500 ease-out relative`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const LevelUpAnimation: React.FC<{ level: number; onClose: () => void; archetype: ArchetypeData | null }> = ({ level, onClose, archetype }) => {
  useEffect(() => {
    playSound('levelup');
    vibrate([100, 50, 100, 50, 200]);
    
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 animate-bounce">
          LEVEL UP!
        </h1>
        <p className="text-2xl text-yellow-400 mb-4">Уровень {level}</p>
        
        {archetype && (
          <div className="flex items-center justify-center space-x-2 text-white">
            {archetype.icon}
            <span className="text-lg">{archetype.phrases[Math.floor(Math.random() * archetype.phrases.length)]}</span>
          </div>
        )}
        
        <div className="mt-8">
          <RippleButton
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Продолжить путь
          </RippleButton>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right`}>
      <div className="flex items-center space-x-2">
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        {type === 'error' && <X className="w-5 h-5" />}
        {type === 'info' && <Sparkles className="w-5 h-5" />}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Tool Modal Component
const ToolModal: React.FC<{
  isOpen: boolean;
  toolId: string | null;
  onClose: () => void;
  onSubmit: (input: string) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  output: string;
  isLoading: boolean;
  hasUsedTool: boolean;
  generatedImage?: string;
  showImageActions: boolean;
  onDownloadImage: () => void;
  onCopyImageLink: () => void;
}> = ({ 
  isOpen, 
  toolId, 
  onClose, 
  onSubmit, 
  userInput, 
  setUserInput, 
  output, 
  isLoading, 
  hasUsedTool,
  generatedImage,
  showImageActions,
  onDownloadImage,
  onCopyImageLink
}) => {
  if (!isOpen || !toolId) return null;

  const tool = AI_TOOLS.find(t => t.id === toolId);
  if (!tool) return null;

  const handleSubmit = () => {
    if (tool.requiresInput && !userInput.trim()) return;
    if (isLoading) return;
    onSubmit(userInput);
  };

  const isSubmitDisabled = (tool.requiresInput && !userInput.trim()) || isLoading;

  // Проверка длины ввода для мем-генератора
  const isInputTooLong = toolId === 'meme-generator' && userInput.length > 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              {tool.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tool.name}</h2>
              <p className="text-gray-400 text-sm">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input Section */}
        {tool.requiresInput && (
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              {toolId === 'meme-generator' ? 'Тема для мема:' : 
               toolId === 'image-analyzer' ? 'Описание изображения:' :
               toolId === 'code-assistant' ? 'Код или техническая задача:' :
               toolId === 'mvp-generator' ? 'Идея для MVP:' : 'Ваш запрос:'}
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={
                toolId === 'meme-generator' ? 'Например: Нейросети и лень' :
                toolId === 'image-analyzer' ? 'Опишите изображение для анализа...' :
                toolId === 'code-assistant' ? 'Вставьте код или опишите задачу...' :
                toolId === 'mvp-generator' ? 'Опишите вашу бизнес-идею...' : 'Введите ваш запрос...'
              }
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={toolId === 'mvp-generator' ? 4 : 3}
              maxLength={toolId === 'meme-generator' ? 100 : 1000}
            />
            {toolId === 'meme-generator' && (
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${isInputTooLong ? 'text-red-400' : 'text-gray-400'}`}>
                  {userInput.length}/100 символов
                </span>
                {isInputTooLong && (
                  <span className="text-red-400 text-sm">Слишком длинная тема!</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="mb-6">
          <RippleButton
            onClick={handleSubmit}
            disabled={isSubmitDisabled || isInputTooLong}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {toolId === 'meme-generator' ? '🤖 Мем создаётся...' : '🤖 Генерация ответа...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>
                  {toolId === 'meme-generator' ? '🎨 Сгенерировать мем' : 
                   toolId === 'idea-generator' ? '💡 Генерировать идеи' : 
                   '🚀 Сгенерировать'}
                </span>
                <span className="text-yellow-300">+{tool.xpReward} XP</span>
              </div>
            )}
          </RippleButton>
        </div>

        {/* Output Section */}
        {(output || generatedImage) && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              {getToolResultTitle(toolId)}
            </h3>
            
            {/* Generated Image for Meme Generator */}
            {generatedImage && toolId === 'meme-generator' && (
              <div className="mb-4">
                <img 
                  src={generatedImage} 
                  alt="Generated meme"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('Image failed to load:', generatedImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Image Action Buttons */}
                {showImageActions && (
                  <div className="flex space-x-3 mt-4 justify-center">
                    <RippleButton
                      onClick={onDownloadImage}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Скачать мем</span>
                      </div>
                    </RippleButton>
                    
                    <RippleButton
                      onClick={onCopyImageLink}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Copy className="w-4 h-4" />
                        <span>Копировать ссылку</span>
                      </div>
                    </RippleButton>
                  </div>
                )}
              </div>
            )}
            
            {/* Text Output */}
            {output && (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {output}
              </div>
            )}
            
            {hasUsedTool && (
              <div className="mt-3 text-green-400 text-sm flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>XP начислен за первое использование!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const NeuropulAI: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'archetype' | 'dashboard'>('welcome');
  const [showModal, setShowModal] = useState<'certificate' | 'premium' | 'dev' | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [fomoTimeLeft, setFomoTimeLeft] = useState(0);
  
  // Tool Modal State
  const [toolModal, setToolModal] = useState<ToolModalState>({
    isOpen: false,
    toolId: null,
    userInput: '',
    output: '',
    isLoading: false,
    hasUsedTool: false,
    generatedImage: undefined,
    showImageActions: false
  });
  
  // Default user progress
  const defaultProgress: UserProgress = {
    xp: 0,
    level: 0,
    archetype: null,
    userName: '',
    isPaid: false,
    dailyStreak: 0,
    lastVisit: new Date().toISOString().split('T')[0],
    questStep: 0,
    certificateUnlocked: false,
    version: APP_VERSION,
    hasCompletedOnboarding: false,
    hasSeenFomo: false,
    fomoTimerStart: null,
    toolsUsed: []
  };

  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neuropul_userProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Version migration
        if (parsed.version !== APP_VERSION) {
          const migrated = { ...defaultProgress, ...parsed, version: APP_VERSION };
          setUserProgress(migrated);
          localStorage.setItem('neuropul_userProgress', JSON.stringify(migrated));
        } else {
          setUserProgress(parsed);
        }
        
        // Check daily streak
        const today = new Date().toISOString().split('T')[0];
        const lastVisit = new Date(parsed.lastVisit);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          const newStreak = parsed.dailyStreak + 1;
          const streakBonus = 100;
          setUserProgress(prev => ({
            ...prev,
            dailyStreak: newStreak,
            lastVisit: today,
            xp: prev.xp + streakBonus
          }));
          showToast(`Streak ${newStreak} дней! +${streakBonus} XP`, 'success');
        } else if (daysDiff > 1) {
          // Streak broken
          setUserProgress(prev => ({
            ...prev,
            dailyStreak: 1,
            lastVisit: today
          }));
          if (parsed.dailyStreak > 1) {
            showToast('Streak потерян! Начинаем заново', 'error');
          }
        }
        
        // Set initial screen
        if (parsed.hasCompletedOnboarding) {
          setCurrentScreen('dashboard');
        } else if (parsed.userName && !parsed.archetype) {
          setCurrentScreen('archetype');
        }
      }
      
      // Check dev mode
      const urlParams = new URLSearchParams(window.location.search);
      setIsDevMode(urlParams.get('dev') === 'true');
      
    } catch (error) {
      console.error('Error loading progress:', error);
      showToast('Ошибка загрузки данных. Начинаем заново.', 'error');
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: UserProgress) => {
    try {
      localStorage.setItem('neuropul_userProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
      showToast('⚠️ Данные не сохраняются в этом браузере', 'error');
    }
  }, []);

  // Update progress and save
  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    setUserProgress(prev => {
      const newProgress = { ...prev, ...updates };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  // Add XP and check for level up
  const addXP = useCallback((amount: number) => {
    setUserProgress(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevelByXP(newXP);
      const leveledUp = newLevel > prev.level;
      
      const newProgress = {
        ...prev,
        xp: newXP,
        level: newLevel
      };
      
      saveProgress(newProgress);
      
      if (leveledUp) {
        setShowLevelUp(true);
        
        // Level rewards
        if (newLevel === 5) {
          newProgress.certificateUnlocked = true;
          showToast('Сертификат разблокирован!', 'success');
        }
      }
      
      return newProgress;
    });
  }, [saveProgress]);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    playSound(type === 'success' ? 'success' : 'error');
  }, []);

  // Get current archetype data
  const currentArchetype = userProgress.archetype 
    ? ARCHETYPES.find(a => a.id === userProgress.archetype) || null
    : null;

  // FOMO timer effect
  useEffect(() => {
    if (showModal === 'premium' && userProgress.fomoTimerStart && !userProgress.hasSeenFomo) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - userProgress.fomoTimerStart!;
        const remaining = Math.max(0, FOMO_TIMER_DURATION - elapsed);
        setFomoTimeLeft(remaining);
        
        if (remaining === 0) {
          updateProgress({ hasSeenFomo: true });
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showModal, userProgress.fomoTimerStart, userProgress.hasSeenFomo, updateProgress]);

  // Format FOMO timer
  const formatFomoTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle tool usage
  const useTool = useCallback((toolId: string) => {
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    
    if (tool.isPremium && !userProgress.isPaid) {
      setShowModal('premium');
      return;
    }
    
    // Check if we have a cached result for this tool
    const lastMeme = userProgress.lastMeme;
    const showLastMeme = toolId === 'meme-generator' && lastMeme && 
                         (lastMeme.imageUrl || lastMeme.textContent);
    
    setToolModal({
      isOpen: true,
      toolId,
      userInput: showLastMeme ? lastMeme.theme : '',
      output: showLastMeme ? (lastMeme.textContent || '') : '',
      isLoading: false,
      hasUsedTool: userProgress.toolsUsed.includes(toolId),
      generatedImage: showLastMeme ? lastMeme.imageUrl : undefined,
      showImageActions: showLastMeme && !!lastMeme.imageUrl
    });
  }, [userProgress]);

  // Handle tool submission
  const handleToolSubmit = useCallback(async (userInput: string) => {
    if (!toolModal.toolId) return;
    
    const tool = AI_TOOLS.find(t => t.id === toolModal.toolId);
    if (!tool) return;
    
    // Prevent duplicate requests
    if (toolModal.isLoading) return;
    
    setToolModal(prev => ({ ...prev, isLoading: true, output: '', generatedImage: undefined, showImageActions: false }));
    
    try {
      let result: OpenAIResponse | null = null;
      let imageResult: MemeImageResponse | null = null;
      
      // For meme generator, try to generate image first
      if (toolModal.toolId === 'meme-generator') {
        imageResult = await generateMemeImage(userInput);
        
        if (imageResult.success && imageResult.imageUrl) {
          // Image generation successful
          const textPrompt = getToolPrompt(toolModal.toolId, userInput);
          result = await askOpenAI(textPrompt);
          
          setToolModal(prev => ({
            ...prev,
            isLoading: false,
            output: result?.success ? result.content : 'Описание мема сгенерировано!',
            generatedImage: imageResult.imageUrl,
            showImageActions: true
          }));
          
          // Save last meme
          updateProgress({
            lastMeme: {
              imageUrl: imageResult.imageUrl,
              textContent: result?.success ? result.content : '',
              theme: userInput,
              timestamp: Date.now()
            }
          });
          
        } else {
          // Image generation failed, fallback to text meme
          const textPrompt = getToolPrompt(toolModal.toolId, userInput);
          result = await askOpenAI(textPrompt);
          
          setToolModal(prev => ({
            ...prev,
            isLoading: false,
            output: result?.success ? result.content : '⚠️ Не удалось сгенерировать мем. Попробуй позже.',
            generatedImage: undefined,
            showImageActions: false
          }));
          
          if (result?.success) {
            updateProgress({
              lastMeme: {
                textContent: result.content,
                theme: userInput,
                timestamp: Date.now()
              }
            });
            showToast('⚠️ Мем не удалось сгенерировать — вот текстовый вариант', 'info');
          } else {
            showToast(imageResult?.error || 'Ошибка генерации мема', 'error');
          }
        }
      } else {
        // Regular AI tools
        const prompt = getToolPrompt(toolModal.toolId, userInput);
        result = await askOpenAI(prompt);
        
        setToolModal(prev => ({
          ...prev,
          isLoading: false,
          output: result?.success ? result.content : '⚠️ Ошибка генерации. Попробуй позже.',
          generatedImage: undefined,
          showImageActions: false
        }));
        
        if (!result?.success) {
          showToast(result?.error || 'Ошибка генерации ответа', 'error');
        }
      }
      
      // Award XP only on first successful use
      if ((result?.success || (imageResult?.success && imageResult.imageUrl)) && 
          !userProgress.toolsUsed.includes(toolModal.toolId)) {
        
        const xpAmount = userProgress.isPaid ? tool.xpReward : Math.floor(tool.xpReward * 0.5);
        
        updateProgress({
          questStep: userProgress.questStep + 1,
          toolsUsed: [...userProgress.toolsUsed, toolModal.toolId],
          certificateUnlocked: userProgress.questStep + 1 >= 4
        });
        
        addXP(xpAmount);
        
        setToolModal(prev => ({ ...prev, hasUsedTool: true }));
        
        const phrase = currentArchetype?.phrases[Math.floor(Math.random() * currentArchetype.phrases.length)] || 'Отличная работа!';
        showToast(`${phrase} +${xpAmount} XP`, 'success');
        
        vibrate([50]);
      }
      
    } catch (error) {
      console.error('Tool submission error:', error);
      setToolModal(prev => ({
        ...prev,
        isLoading: false,
        output: '⚠️ Произошла ошибка. Проверь интернет-соединение.',
        generatedImage: undefined,
        showImageActions: false
      }));
      showToast('Ошибка выполнения запроса', 'error');
    }
  }, [toolModal.toolId, toolModal.isLoading, userProgress, currentArchetype, addXP, updateProgress, showToast]);

  // Handle image download
  const handleDownloadImage = useCallback(async () => {
    if (!toolModal.generatedImage) return;
    
    try {
      const response = await fetch(toolModal.generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-neuropul-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast('✅ Мем скачан!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Ошибка скачивания мема', 'error');
    }
  }, [toolModal.generatedImage, showToast]);

  // Handle copy image link
  const handleCopyImageLink = useCallback(async () => {
    if (!toolModal.generatedImage) return;
    
    try {
      await navigator.clipboard.writeText(toolModal.generatedImage);
      showToast('✅ Ссылка скопирована', 'success');
    } catch (error) {
      console.error('Copy error:', error);
      showToast('Ошибка копирования ссылки', 'error');
    }
  }, [toolModal.generatedImage, showToast]);

  // Generate and download PDF certificate
  const downloadCertificate = useCallback(() => {
    if (!userProgress.certificateUnlocked) {
      showToast('Сертификат ещё не разблокирован!', 'error');
      return;
    }
    
    const certificateId = generateCertificateId();
    const date = formatDate(new Date());
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Сертификат NeuropulAI</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .certificate { background: white; padding: 60px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; }
          .title { font-size: 48px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .subtitle { font-size: 24px; color: #666; }
          .content { text-align: center; margin: 40px 0; }
          .name { font-size: 36px; font-weight: bold; color: #4F46E5; margin: 20px 0; }
          .archetype { font-size: 24px; color: #7C3AED; margin: 10px 0; }
          .details { margin: 40px 0; font-size: 18px; color: #555; }
          .footer { margin-top: 60px; text-align: center; font-size: 14px; color: #888; }
          .id { font-family: monospace; background: #f3f4f6; padding: 5px 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">СЕРТИФИКАТ</div>
            <div class="subtitle">NeuropulAI Mastery</div>
          </div>
          
          <div class="content">
            <p style="font-size: 20px; margin-bottom: 20px;">Настоящим подтверждается, что</p>
            <div class="name">${userProgress.userName}</div>
            <div class="archetype">Архетип: ${currentArchetype?.name || 'Не выбран'}</div>
            
            <div class="details">
              <p>успешно освоил AI-инструменты и достиг:</p>
              <p><strong>Уровень ${userProgress.level}</strong> • <strong>${userProgress.xp} XP</strong></p>
              <p>Использовано инструментов: <strong>${userProgress.questStep}</strong></p>
              <p>Дата выдачи: <strong>${date}</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>Сертификат ID: <span class="id">${certificateId}</span></p>
            <p>NeuropulAI • Твой путь к AI-мастерству</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeuropulAI_Certificate_${userProgress.userName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Сертификат скачан!', 'success');
  }, [userProgress, currentArchetype, showToast]);

  // Dev Panel functions
  const devAddXP = () => {
    addXP(100);
    showToast('Добавлено 100 XP', 'info');
  };

  const devReset = () => {
    localStorage.removeItem('neuropul_userProgress');
    setUserProgress(defaultProgress);
    setCurrentScreen('welcome');
    setToolModal({
      isOpen: false,
      toolId: null,
      userInput: '',
      output: '',
      isLoading: false,
      hasUsedTool: false,
      generatedImage: undefined,
      showImageActions: false
    });
    showToast('Прогресс сброшен', 'info');
  };

  const devClearLocalStorage = () => {
    localStorage.clear();
    showToast('🧹 localStorage очищен', 'info');
  };

  const devExport = () => {
    const data = JSON.stringify(userProgress, null, 2);
    navigator.clipboard.writeText(data).then(() => {
      showToast('Данные скопированы в буфер', 'info');
    });
  };

  const devTogglePremium = () => {
    updateProgress({ isPaid: !userProgress.isPaid });
    showToast(`Premium ${!userProgress.isPaid ? 'включен' : 'отключен'}`, 'info');
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">NeuropulAI</h1>
          <p className="text-xl text-purple-200 mb-8">Твой путь к AI-мастерству начинается здесь</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Введи своё имя"
            value={userProgress.userName}
            onChange={(e) => updateProgress({ userName: e.target.value })}
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <RippleButton
          onClick={() => {
            if (!userProgress.userName.trim()) {
              showToast('Введи своё имя!', 'error');
              return;
            }
            addXP(25);
            setCurrentScreen('archetype');
            showToast('Добро пожаловать! +25 XP за смелость', 'success');
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Начать путь</span>
          </div>
        </RippleButton>
        
        <p className="text-purple-300 text-sm mt-4">Ты на пути Пробуждения</p>
      </div>
    </div>
  );

  // Archetype Selection Screen
  const ArchetypeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Выбери свой архетип</h1>
          <p className="text-purple-200">Это определит твой стиль прохождения</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ARCHETYPES.map((archetype) => (
            <RippleButton
              key={archetype.id}
              onClick={() => {
                updateProgress({ 
                  archetype: archetype.id,
                  hasCompletedOnboarding: true 
                });
                setCurrentScreen('dashboard');
                showToast(`Архетип ${archetype.name} выбран!`, 'success');
              }}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${archetype.gradient} rounded-full flex items-center justify-center text-white`}>
                  {archetype.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{archetype.name}</h3>
                <p className="text-purple-200 text-sm">{archetype.description}</p>
              </div>
            </RippleButton>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Назад
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard Screen
  const DashboardScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NeuropulAI</h1>
                <p className="text-purple-200 text-sm">Привет, {userProgress.userName}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userProgress.isPaid && (
                <div className="flex items-center space-x-1 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold">PRO</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-white">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{userProgress.dailyStreak}</span>
              </div>
              
              {isDevMode && (
                <button
                  onClick={() => setShowModal('dev')}
                  className="p-2 bg-red-500 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <Settings className="w-5 h-5 text-red-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* XP Bar */}
        <XPBar xp={userProgress.xp} level={userProgress.level} archetype={currentArchetype} />
        
        {/* Archetype Badge */}
        {currentArchetype && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${currentArchetype.gradient} rounded-full flex items-center justify-center text-white`}>
                {currentArchetype.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold">{currentArchetype.name}</h3>
                <p className="text-gray-300 text-sm">{currentArchetype.description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {AI_TOOLS.map((tool) => (
            <div key={tool.id} className="bg-gray-800 rounded-lg p-6 relative overflow-hidden">
              {tool.isPremium && !userProgress.isPaid && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-5 h-5 text-yellow-400" />
                </div>
              )}
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{tool.name}</h3>
                  <p className="text-gray-400 text-sm">{tool.description}</p>
                </div>
              </div>
              
              <RippleButton
                onClick={() => useTool(tool.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                disabled={tool.isPremium && !userProgress.isPaid}
              >
                {tool.isPremium && !userProgress.isPaid ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Использовать</span>
                    <span className="text-yellow-300">+{tool.xpReward} XP</span>
                  </div>
                )}
              </RippleButton>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RippleButton
            onClick={() => setShowModal('certificate')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
            disabled={!userProgress.certificateUnlocked}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Сертификат</span>
              {!userProgress.certificateUnlocked && <Lock className="w-4 h-4" />}
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={() => {
              if (!userProgress.fomoTimerStart) {
                updateProgress({ fomoTimerStart: Date.now() });
              }
              setShowModal('premium');
            }}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Premium</span>
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={() => {
              addXP(25);
              showToast('Инструментарий открыт! +25 XP', 'success');
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Инструментарий</span>
            </div>
          </RippleButton>
        </div>
        
        {/* Progress Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProgress.questStep}</div>
            <div className="text-gray-400 text-sm">Инструментов</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProgress.dailyStreak}</div>
            <div className="text-gray-400 text-sm">Дней подряд</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProgress.level}</div>
            <div className="text-gray-400 text-sm">Уровень</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProgress.xp}</div>
            <div className="text-gray-400 text-sm">Опыта</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Certificate Modal
  const CertificateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Сертификат мастерства</h2>
          <button
            onClick={() => setShowModal(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          
          {userProgress.certificateUnlocked ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-2">Поздравляем!</h3>
              <p className="text-gray-300 mb-4">
                Ты успешно использовал {userProgress.questStep} AI-инструментов и заслужил сертификат!
              </p>
              <RippleButton
                onClick={downloadCertificate}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Скачать PDF</span>
                </div>
              </RippleButton>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white mb-2">Почти готово!</h3>
              <p className="text-gray-300 mb-4">
                Используй ещё {4 - userProgress.questStep} инструментов для получения сертификата
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userProgress.questStep / 4) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{userProgress.questStep}/4 инструментов</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Premium Modal
  const PremiumModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Premium доступ</h2>
          <button
            onClick={() => setShowModal(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">Разблокируй знания. Стартуй как ПРО</h3>
          
          {fomoTimeLeft > 0 && !userProgress.hasSeenFomo && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Ограниченное предложение!</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatFomoTime(fomoTimeLeft)}</div>
              <div className="text-sm text-red-300">до окончания скидки 50%</div>
            </div>
          )}
          
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>MVP-генератор для бизнеса</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Полный XP за все действия</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Расширенная аналитика</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Приоритетная поддержка</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-center">
              {fomoTimeLeft > 0 && !userProgress.hasSeenFomo ? (
                <>
                  <div className="text-gray-400 line-through">29$</div>
                  <div className="text-2xl font-bold text-yellow-400">14.99$</div>
                </>
              ) : (
                <div className="text-2xl font-bold text-white">29$</div>
              )}
            </div>
            
            <RippleButton
              onClick={() => {
                // Simulate payment
                updateProgress({ isPaid: true });
                setShowModal(null);
                showToast('Premium активирован!', 'success');
              }}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Оплатить Stripe</span>
              </div>
            </RippleButton>
            
            <RippleButton
              onClick={() => {
                showToast('Перенаправление на Payme...', 'info');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Оплатить Payme</span>
              </div>
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );

  // Dev Panel Modal
  const DevModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Dev Panel v{APP_VERSION}</h2>
          <button
            onClick={() => setShowModal(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3">
          <RippleButton
            onClick={devAddXP}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>+100 XP</span>
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={devTogglePremium}
            className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Toggle Premium</span>
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={devClearLocalStorage}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>🧹 Очистить localStorage</span>
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={devExport}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <Copy className="w-4 h-4" />
              <span>Export JSON</span>
            </div>
          </RippleButton>
          
          <RippleButton
            onClick={devReset}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset All</span>
            </div>
          </RippleButton>
        </div>
        
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <div className="text-xs text-gray-400 font-mono">
            Version: {APP_VERSION}<br/>
            Tools Used: {userProgress.toolsUsed.length}<br/>
            Last Meme: {userProgress.lastMeme ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Main Content */}
      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'archetype' && <ArchetypeScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
      
      {/* Tool Modal */}
      <ToolModal
        isOpen={toolModal.isOpen}
        toolId={toolModal.toolId}
        onClose={() => setToolModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleToolSubmit}
        userInput={toolModal.userInput}
        setUserInput={(input) => setToolModal(prev => ({ ...prev, userInput: input }))}
        output={toolModal.output}
        isLoading={toolModal.isLoading}
        hasUsedTool={toolModal.hasUsedTool}
        generatedImage={toolModal.generatedImage}
        showImageActions={toolModal.showImageActions}
        onDownloadImage={handleDownloadImage}
        onCopyImageLink={handleCopyImageLink}
      />
      
      {/* Modals */}
      {showModal === 'certificate' && <CertificateModal />}
      {showModal === 'premium' && <PremiumModal />}
      {showModal === 'dev' && <DevModal />}
      
      {/* Level Up Animation */}
      {showLevelUp && (
        <LevelUpAnimation
          level={userProgress.level}
          onClose={() => setShowLevelUp(false)}
          archetype={currentArchetype}
        />
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default NeuropulAI;