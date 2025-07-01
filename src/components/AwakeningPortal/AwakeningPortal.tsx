import React, { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Zap, FileText } from 'lucide-react';
import Quiz from './Quiz';
import ArchetypeAnalysis from './ArchetypeAnalysis';
import Prophecy from './Prophecy';
import AvatarDisplay from './AvatarDisplay';
import { QuizState, QuizAnswer, ArchetypeResult, UserProgress, PDFData } from '../../types';
import { getArchetypeAnalysis, getProphecy, analyzeFallbackArchetype } from '../../lib/api/callGpt';
import { generatePDF } from '../../lib/api/callPictify';
import { useStorage } from '../../lib/utils/storage';
import { logError } from '../../lib/utils/errorLogger';

interface AwakeningPortalProps {
  onComplete: (progress: UserProgress) => void;
}

type PortalStep = 'intro' | 'quiz' | 'analysis' | 'prophecy' | 'avatar' | 'ceremony' | 'pdf' | 'complete';

interface PortalState {
  step: PortalStep;
  quiz: QuizState;
  archetype: ArchetypeResult | null;
  prophecy: string | null;
  name: string;
  avatarUrl: string;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  analysisStrategy: string | null;
}

type PortalAction = 
  | { type: 'SET_STEP'; payload: PortalStep }
  | { type: 'ANSWER_QUIZ'; payload: QuizAnswer }
  | { type: 'SET_ARCHETYPE'; payload: ArchetypeResult; strategy?: string }
  | { type: 'SET_PROPHECY'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_PORTAL' };

const initialState: PortalState = {
  step: 'intro',
  quiz: {
    currentQuestion: 0,
    answers: [],
    completed: false,
    scores: { warrior: 0, mage: 0, seeker: 0, shadow: 0 }
  },
  archetype: null,
  prophecy: null,
  name: '',
  avatarUrl: '',
  isLoading: false,
  error: null,
  retryCount: 0,
  analysisStrategy: null
};

const portalReducer = (state: PortalState, action: PortalAction): PortalState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, error: null };
    
    case 'ANSWER_QUIZ':
      const newAnswers = [...state.quiz.answers, action.payload];
      const newScores = { ...state.quiz.scores };
      
      // Add weights to scores
      Object.entries(action.payload.weight).forEach(([key, value]) => {
        newScores[key as keyof typeof newScores] += value;
      });
      
      const isCompleted = newAnswers.length >= 3;
      
      return {
        ...state,
        quiz: {
          ...state.quiz,
          currentQuestion: state.quiz.currentQuestion + 1,
          answers: newAnswers,
          scores: newScores,
          completed: isCompleted
        }
      };
    
    case 'SET_ARCHETYPE':
      return { 
        ...state, 
        archetype: action.payload, 
        error: null,
        analysisStrategy: action.strategy || state.analysisStrategy 
      };
    
    case 'SET_PROPHECY':
      return { ...state, prophecy: action.payload, error: null };
    
    case 'SET_NAME':
      const avatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(action.payload)}&backgroundColor=1a1a2e&radius=50`;
      return { ...state, name: action.payload, avatarUrl, error: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    
    case 'RESET_PORTAL':
      return initialState;
    
    default:
      return state;
  }
};

const AwakeningPortal: React.FC<AwakeningPortalProps> = ({ onComplete }) => {
  const [state, dispatch] = useReducer(portalReducer, initialState);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [pdfGenerationAttempted, setPdfGenerationAttempted] = useState(false);
  const { saveProgress } = useStorage();
  
  // Refs to prevent multiple AI calls
  const hasArchetypeFetchedRef = useRef(false);
  const hasProphecyFetchedRef = useRef(false);

  // 🔍 GOD LEVEL DEBUG: Enhanced logging system
  const addDebugLog = (message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(`🔍 [AWAKENING DEBUG] ${logMessage}`);
    setDebugInfo(prev => [...prev.slice(-19), logMessage]);
    
    // Log errors to centralized system
    if (level === 'ERROR') {
      logError(message, {
        component: 'AwakeningPortal',
        additionalData: { state: JSON.stringify(state) }
      });
    }
  };

  // 🔍 GOD LEVEL DEBUG: System health check
  useEffect(() => {
    addDebugLog('🚀 AwakeningPortal initialized', 'SUCCESS');
    addDebugLog(`Environment: ${import.meta.env.MODE}`);
    addDebugLog(`API Keys present: OpenAI=${!!import.meta.env.VITE_OPENAI_API_KEY}`);
    addDebugLog(`Initial state: step=${initialState.step}, retryCount=0`);
    
    // Check for required dependencies
    if (typeof fetch === 'undefined') {
      addDebugLog('❌ Fetch API not available', 'ERROR');
    }
    if (typeof localStorage === 'undefined') {
      addDebugLog('❌ LocalStorage not available', 'ERROR');
    }
    
    addDebugLog('✅ System health check completed', 'SUCCESS');
  }, []);

  // Sound effects with error handling
  const playSound = (type: 'success' | 'transition' | 'mystical' | 'error') => {
    try {
      addDebugLog(`🔊 Playing sound: ${type}`);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
          break;
        case 'transition':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          break;
        case 'mystical':
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.2);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      addDebugLog(`✅ Sound played successfully: ${type}`, 'SUCCESS');
    } catch (error) {
      addDebugLog(`❌ Sound playback failed: ${error}`, 'ERROR');
    }
  };

  // Vibration feedback with error handling
  const vibrate = (pattern: number[]) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
        addDebugLog(`📳 Vibration triggered: ${pattern}`, 'SUCCESS');
      } else {
        addDebugLog('📳 Vibration not supported', 'WARN');
      }
    } catch (error) {
      addDebugLog(`❌ Vibration failed: ${error}`, 'ERROR');
    }
  };

  // 🔍 GOD LEVEL DEBUG: Enhanced auto-progress with comprehensive error handling
  useEffect(() => {
    if (state.quiz.completed && state.step === 'quiz') {
      addDebugLog('🎯 Quiz completed, starting archetype analysis', 'SUCCESS');
      addDebugLog(`Quiz answers: ${JSON.stringify(state.quiz.answers.map(a => a.answer))}`);
      addDebugLog(`Quiz scores: ${JSON.stringify(state.quiz.scores)}`);
      
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: 'analysis' });
        analyzeArchetype();
      }, 1000);
    }
  }, [state.quiz.completed, state.step]);

  // 🔍 GOD LEVEL DEBUG: Bulletproof archetype analysis
  const analyzeArchetype = useCallback(async () => {
    // Guard against multiple calls
    if (hasArchetypeFetchedRef.current) {
      addDebugLog('🛡️ Archetype analysis already performed, skipping', 'INFO');
      return;
    }
    
    addDebugLog('🔮 Starting enhanced archetype analysis', 'INFO');
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const answers = state.quiz.answers.map(a => a.answer);
      addDebugLog(`📝 Analyzing answers: ${JSON.stringify(answers)}`);
      
      // 🔍 VALIDATION: Check answers exist and are valid
      if (!answers || answers.length === 0) {
        throw new Error('No quiz answers available for analysis');
      }
      
      if (answers.some(answer => !answer || answer.trim().length === 0)) {
        throw new Error('Invalid quiz answers detected');
      }
      
      // Set timeout for API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      addDebugLog('📤 Sending request to GPT API with 15s timeout', 'INFO');
      
      try {
        const response = await getArchetypeAnalysis(answers);
        clearTimeout(timeoutId);
        
        addDebugLog(`📥 GPT response received: success=${response.success}, strategy=${response.strategy || 'unknown'}`, 'INFO');
        
        if (response.success && response.data) {
          addDebugLog(`✅ Archetype analysis successful using strategy: ${response.strategy || 'unknown'}`, 'SUCCESS');
          
          // 🔍 VALIDATION: Verify archetype data structure
          if (!response.data.type) {
            addDebugLog('❌ Invalid archetype data - missing type', 'ERROR');
            throw new Error('Invalid archetype data received - missing type field');
          }
          
          // Validate against whitelist of archetypes
          const validArchetypes = ['Воин', 'Маг', 'Искатель', 'Тень'];
          if (!validArchetypes.includes(response.data.type)) {
            addDebugLog(`❌ Invalid archetype type: ${response.data.type}`, 'ERROR');
            throw new Error(`Invalid archetype type: ${response.data.type}`);
          }
          
          if (!response.data.description) {
            addDebugLog('⚠️ Archetype missing description, using fallback', 'WARN');
            response.data.description = `Ты - ${response.data.type}. Твой путь уникален и полон возможностей.`;
          }
          
          if (!response.data.CTA) {
            addDebugLog('⚠️ Archetype missing CTA, using fallback', 'WARN');
            response.data.CTA = 'Готовься к великим свершениям в мире AI!';
          }
          
          addDebugLog(`🎭 Archetype determined: ${response.data.type}`, 'SUCCESS');
          dispatch({ 
            type: 'SET_ARCHETYPE', 
            payload: response.data,
            strategy: response.strategy || 'unknown'
          });
          playSound('mystical');
          vibrate([100, 50, 100]);
          
          // Mark as fetched
          hasArchetypeFetchedRef.current = true;
          
          setTimeout(() => {
            addDebugLog('🔮 Moving to prophecy step', 'INFO');
            dispatch({ type: 'SET_STEP', payload: 'prophecy' });
            generateProphecy(response.data.type);
          }, 3000);
        } else {
          addDebugLog(`❌ Archetype analysis failed: ${response.error}`, 'ERROR');
          throw new Error(response.error || 'Failed to analyze archetype');
        }
      } catch (apiError) {
        clearTimeout(timeoutId);
        
        if (apiError.name === 'AbortError') {
          addDebugLog('⏱️ API request timed out after 15 seconds', 'ERROR');
          throw new Error('API request timed out. Please try again.');
        }
        
        throw apiError;
      }
    } catch (error) {
      addDebugLog(`💀 Archetype analysis error: ${error}`, 'ERROR');
      
      // 🔍 GOD LEVEL DEBUG: Enhanced fallback with local analysis
      if (state.retryCount < 1) {
        addDebugLog(`🔄 Auto-retry attempt ${state.retryCount + 1}/1`, 'WARN');
        dispatch({ type: 'INCREMENT_RETRY' });
        
        // Short delay before retry
        setTimeout(() => {
          addDebugLog('🔄 Retrying archetype analysis', 'INFO');
          analyzeArchetype();
        }, 2000);
        return;
      }
      
      addDebugLog('🔄 Max retries reached, using local fallback analysis', 'WARN');
      
      try {
        const fallbackArchetype = analyzeFallbackArchetype(state.quiz.answers);
        addDebugLog(`🎭 Fallback archetype: ${fallbackArchetype.type}`, 'SUCCESS');
        
        dispatch({ 
          type: 'SET_ARCHETYPE', 
          payload: fallbackArchetype,
          strategy: 'local_fallback_after_retry'
        });
        playSound('mystical');
        vibrate([100, 50, 100]);
        
        // Mark as fetched
        hasArchetypeFetchedRef.current = true;
        
        setTimeout(() => {
          dispatch({ type: 'SET_STEP', payload: 'prophecy' });
          generateProphecy(fallbackArchetype.type);
        }, 3000);
        
      } catch (fallbackError) {
        addDebugLog(`💀 Fallback analysis failed: ${fallbackError}`, 'ERROR');
        dispatch({ type: 'SET_ERROR', payload: 'Не удалось определить архетип. Попробуй снова.' });
        playSound('error');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.quiz.answers, state.retryCount]);

  // 🔍 GOD LEVEL DEBUG: Enhanced prophecy generation
  const generateProphecy = useCallback(async (archetype: string) => {
    // Guard against multiple calls
    if (hasProphecyFetchedRef.current) {
      addDebugLog('🛡️ Prophecy already generated, skipping', 'INFO');
      return;
    }
    
    addDebugLog(`🔮 Generating prophecy for: ${archetype}`, 'INFO');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await getProphecy(archetype);
      
      if (response.success && response.data) {
        // Validate prophecy is not empty
        if (!response.data || (typeof response.data === 'string' && response.data.trim().length === 0)) {
          addDebugLog('⚠️ Empty prophecy received, using fallback', 'WARN');
          
          const fallbackProphecy = 'Твой путь уникален. Следуй своему сердцу и интуиции.';
          dispatch({ type: 'SET_PROPHECY', payload: fallbackProphecy });
        } else {
          addDebugLog(`✅ Prophecy generated: "${response.data}"`, 'SUCCESS');
          dispatch({ type: 'SET_PROPHECY', payload: response.data });
        }
        
        // Mark as fetched
        hasProphecyFetchedRef.current = true;
        
        playSound('mystical');
        
        setTimeout(() => {
          dispatch({ type: 'SET_STEP', payload: 'avatar' });
        }, 4000);
      } else {
        addDebugLog(`❌ Prophecy generation failed: ${response.error}`, 'ERROR');
        throw new Error(response.error || 'Failed to generate prophecy');
      }
    } catch (error) {
      addDebugLog(`💀 Prophecy generation error: ${error}`, 'ERROR');
      
      // Enhanced fallback prophecies
      const fallbackProphecies = {
        'Воин': 'Твоя сила растёт с каждым вызовом. Иди вперёд, сокрушая препятствия на пути к AI-мастерству.',
        'Маг': 'Знания текут через тебя, как река мудрости. Используй магию AI для создания невозможного.',
        'Искатель': 'Твой путь полон открытий и чудес. Каждый шаг ведёт к новым горизонтам познания.',
        'Тень': 'В глубинах сознания скрыты великие тайны. Раскрой силу скрытого знания.'
      };
      
      const prophecy = fallbackProphecies[archetype as keyof typeof fallbackProphecies] || 
                      'Твой путь уникален и полон возможностей. Следуй своему сердцу и интуиции в мире AI.';
      
      addDebugLog(`🔄 Using fallback prophecy: "${prophecy}"`, 'WARN');
      dispatch({ type: 'SET_PROPHECY', payload: prophecy });
      
      // Mark as fetched
      hasProphecyFetchedRef.current = true;
      
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: 'avatar' });
      }, 4000);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // 🔍 GOD LEVEL DEBUG: Enhanced name validation
  const handleNameSet = (name: string) => {
    addDebugLog(`👤 Setting name: "${name}"`, 'INFO');
    
    // Enhanced validation
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      const error = 'Имя должно содержать минимум 2 символа';
      addDebugLog(`❌ Name validation failed: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: error });
      playSound('error');
      return;
    }
    
    if (trimmedName.length > 50) {
      const error = 'Имя слишком длинное (максимум 50 символов)';
      addDebugLog(`❌ Name validation failed: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: error });
      playSound('error');
      return;
    }
    
    // Check for invalid characters
    const invalidChars = /[<>{}[\]\\\/]/;
    if (invalidChars.test(trimmedName)) {
      const error = 'Имя содержит недопустимые символы';
      addDebugLog(`❌ Name validation failed: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: error });
      playSound('error');
      return;
    }
    
    addDebugLog(`✅ Name validation passed: "${trimmedName}"`, 'SUCCESS');
    dispatch({ type: 'SET_NAME', payload: trimmedName });
    playSound('success');
    vibrate([50, 50, 50]);
  };

  // 🔍 GOD LEVEL DEBUG: Enhanced destiny acceptance
  const acceptDestiny = async () => {
    if (!state.name.trim()) {
      const error = 'Введи своё имя для завершения пробуждения';
      addDebugLog(`❌ Destiny acceptance failed: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: error });
      playSound('error');
      return;
    }
    
    addDebugLog('🎉 Accepting destiny and completing awakening', 'SUCCESS');
    dispatch({ type: 'SET_STEP', payload: 'ceremony' });
    playSound('success');
    vibrate([100, 50, 100, 50, 200]);
    
    // Create comprehensive user progress
    const progress: UserProgress = {
      name: state.name,
      archetype: state.archetype?.type || 'Искатель',
      avatarUrl: state.avatarUrl,
      xp: 50, // Initial XP bonus
      level: 1,
      prophecy: state.prophecy || '',
      awakened: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    addDebugLog(`💾 Saving progress: ${JSON.stringify(progress)}`, 'INFO');
    
    // Save progress with error handling
    try {
      saveProgress(progress);
      addDebugLog('✅ Progress saved successfully', 'SUCCESS');
    } catch (error) {
      addDebugLog(`❌ Failed to save progress: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка сохранения прогресса' });
      return;
    }
    
    // Generate PDF
    setTimeout(() => {
      generateAwakeningPDF(progress);
    }, 2000);
  };

  // 🔍 GOD LEVEL DEBUG: Enhanced PDF generation
  const generateAwakeningPDF = async (progress: UserProgress) => {
    addDebugLog('📜 Starting PDF generation', 'INFO');
    dispatch({ type: 'SET_STEP', payload: 'pdf' });
    dispatch({ type: 'SET_LOADING', payload: true });
    setPdfGenerationAttempted(true);
    
    try {
      // Validate all required fields are present
      if (!progress.name || !progress.archetype) {
        throw new Error('Missing required user data for PDF generation');
      }
      
      const pdfData: PDFData = {
        name: progress.name,
        archetype: progress.archetype,
        prophecy: progress.prophecy,
        avatarUrl: progress.avatarUrl,
        xp: progress.xp,
        certificateId: `AWAKEN-${Date.now()}`,
        date: progress.createdAt
      };
      
      addDebugLog(`📄 PDF data prepared: ${JSON.stringify(pdfData)}`, 'INFO');
      
      // Set timeout for PDF generation
      const pdfPromise = generatePDF(pdfData);
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error('PDF generation timed out after 30 seconds')), 30000);
      });
      
      // Race between PDF generation and timeout
      const response = await Promise.race([pdfPromise, timeoutPromise]);
      
      if (response.success && response.url) {
        addDebugLog('✅ PDF generated successfully', 'SUCCESS');
        setPdfUrl(response.url);
        playSound('success');
        vibrate([200, 100, 200]);
        
        // Store PDF generation status
        localStorage.setItem('neuropul_pdf_generated', 'true');
        
        setTimeout(() => {
          dispatch({ type: 'SET_STEP', payload: 'complete' });
        }, 3000);
      } else {
        addDebugLog(`❌ PDF generation failed: ${response.error}`, 'ERROR');
        throw new Error(response.error || 'PDF generation failed');
      }
    } catch (error) {
      addDebugLog(`💀 PDF generation error: ${error}`, 'ERROR');
      dispatch({ type: 'SET_ERROR', payload: 'Не удалось создать сертификат. Но твоё пробуждение состоялось!' });
      
      // Store PDF generation status
      localStorage.setItem('neuropul_pdf_generated', 'false');
      
      // In development mode, use a fallback PDF for testing
      if (import.meta.env.MODE === 'development') {
        addDebugLog('🔄 Using fallback PDF in development mode', 'WARN');
        setPdfUrl('data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKE5ldXJvcHVsQUkgQ2VydGlmaWNhdGUpCi9Qcm9kdWNlciAoTmV1cm9wdWxBSSBQb3J0YWwpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDEyMjcpCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjAgMCAwIHJnCjcyIDc1MCA3MiAxMiBUZAooTmV1cm9wdWxBSSBDZXJ0aWZpY2F0ZSkgVGoKUQpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDAxODEgMDAwMDAgbiAKMDAwMDAwMDIzOCAwMDAwMCBuIAowMDAwMDAwMzM1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKNDI5CiUlRU9G');
      }
      
      setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: 'complete' });
      }, 2000);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 🔍 GOD LEVEL DEBUG: Enhanced completion
  const completeAwakening = () => {
    addDebugLog('🎊 Completing awakening process', 'SUCCESS');
    
    const progress: UserProgress = {
      name: state.name,
      archetype: state.archetype?.type || 'Искатель',
      avatarUrl: state.avatarUrl,
      xp: 50,
      level: 1,
      prophecy: state.prophecy || '',
      awakened: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    // Final save before transition
    saveProgress(progress);
    
    // Mark awakening as completed
    localStorage.setItem('neuropul_awakening_completed', 'true');
    
    // Store PDF generation status
    localStorage.setItem('neuropul_pdf_generated', pdfGenerationAttempted && !!pdfUrl ? 'true' : 'false');
    
    addDebugLog('✅ Awakening completed successfully', 'SUCCESS');
    onComplete(progress);
  };

  // 🔍 GOD LEVEL DEBUG: Enhanced retry
  const handleRetry = () => {
    addDebugLog('🔄 Retrying awakening process', 'INFO');
    dispatch({ type: 'RESET_PORTAL' });
    setPdfUrl(null);
    setPdfGenerationAttempted(false);
    setDebugInfo([]);
    
    // Reset AI fetch flags
    hasArchetypeFetchedRef.current = false;
    hasProphecyFetchedRef.current = false;
    
    // Clear localStorage flags for a complete reset
    localStorage.removeItem('neuropul_awakening_completed');
    localStorage.removeItem('neuropul_pdf_generated');
    
    addDebugLog('✅ Portal state reset successfully', 'SUCCESS');
  };

  // 🔍 GOD LEVEL DEBUG: Show debug panel in development
  const showDebugPanel = import.meta.env.MODE === 'development' || new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Intro */}
            {state.step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Brain className="w-16 h-16 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-5xl font-bold text-white mb-6"
                >
                  Ты готов <span className="text-cyan-400">проснуться</span>?
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                >
                  Добро пожаловать в портал трансформации. Здесь ты откроешь свой истинный архетип и получишь силу AI-мастерства.
                </motion.p>
                
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  onClick={() => {
                    dispatch({ type: 'SET_STEP', payload: 'quiz' });
                    playSound('transition');
                    vibrate([50]);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Начать Пробуждение
                </motion.button>
              </motion.div>
            )}

            {/* Quiz */}
            {state.step === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ритуал Познания
                  </h2>
                  <p className="text-gray-300">
                    Ответь на вопросы, чтобы раскрыть свою истинную сущность
                  </p>
                </div>
                
                <Quiz
                  currentQuestion={state.quiz.currentQuestion}
                  onAnswer={(answer) => {
                    dispatch({ type: 'ANSWER_QUIZ', payload: answer });
                    playSound('transition');
                    vibrate([30]);
                  }}
                  isCompleted={state.quiz.completed}
                />
              </motion.div>
            )}

            {/* Analysis */}
            {state.step === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Откровение Архетипа
                  </h2>
                  {state.analysisStrategy && showDebugPanel && (
                    <p className="text-xs text-cyan-400 bg-black/30 px-2 py-1 rounded-full inline-block">
                      Стратегия: {state.analysisStrategy}
                    </p>
                  )}
                </div>
                
                <ArchetypeAnalysis
                  archetype={state.archetype}
                  isLoading={state.isLoading}
                />
              </motion.div>
            )}

            {/* Prophecy */}
            {state.step === 'prophecy' && (
              <motion.div
                key="prophecy"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Слово Оракула
                  </h2>
                </div>
                
                <Prophecy
                  prophecy={state.prophecy}
                  isLoading={state.isLoading}
                />
              </motion.div>
            )}

            {/* Avatar */}
            {state.step === 'avatar' && (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Воплощение Сущности
                  </h2>
                </div>
                
                <AvatarDisplay
                  name={state.name}
                  onNameChange={handleNameSet}
                  avatarUrl={state.avatarUrl}
                  archetype={state.archetype?.type || ''}
                />
                
                {state.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-8"
                  >
                    <motion.button
                      onClick={acceptDestiny}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-5 h-5" />
                      <span>Принять Судьбу</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Ceremony */}
            {state.step === 'ceremony' && (
              <motion.div
                key="ceremony"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Zap className="w-20 h-20 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-bold text-white mb-6">
                  🔥 Ритуал Завершён! 🔥
                </h2>
                
                <p className="text-xl text-yellow-400 mb-4">
                  +50 XP за Пробуждение!
                </p>
                
                <p className="text-gray-300 text-lg">
                  Создаём твой сертификат пробуждения...
                </p>
              </motion.div>
            )}

            {/* PDF Generation */}
            {state.step === 'pdf' && (
              <motion.div
                key="pdf"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-8"
                />
                
                <h2 className="text-3xl font-bold text-white mb-6">
                  Создание Сертификата
                </h2>
                
                <p className="text-gray-300 text-lg mb-4">
                  📜 Генерируем твой уникальный сертификат пробуждения...
                </p>
                
                {pdfUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <motion.a
                      href={pdfUrl}
                      download="NeuropulAI_Certificate.pdf"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Скачать Сертификат</span>
                    </motion.a>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Complete */}
            {state.step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-6xl">🎉</span>
                </motion.div>
                
                <h2 className="text-4xl font-bold text-white mb-6">
                  Пробуждение Завершено!
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Добро пожаловать в мир AI-мастерства, <span className="text-cyan-400 font-bold">{state.name}</span>! 
                  Твой путь как <span className="text-purple-400 font-bold">{state.archetype?.type}</span> только начинается.
                </p>
                
                {pdfUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <motion.a
                      href={pdfUrl}
                      download="NeuropulAI_Certificate.pdf"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Скачать Сертификат</span>
                    </motion.a>
                  </motion.div>
                )}
                
                <motion.button
                  onClick={completeAwakening}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Войти в Мир AI</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 🔍 GOD LEVEL DEBUG: Enhanced Error Display */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-4 left-4 right-4 bg-red-900/95 border border-red-500 rounded-lg p-4 text-white backdrop-blur-sm max-w-2xl mx-auto shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold mb-1 flex items-center">
                    ⚠️ Ошибка
                    <span className="ml-2 text-xs bg-red-700 px-2 py-1 rounded">
                      {state.step}
                    </span>
                  </div>
                  <div className="text-sm mb-3">{state.error}</div>
                  
                  {/* 🔍 GOD LEVEL DEBUG: Enhanced Debug Info */}
                  {showDebugPanel && (
                    <details className="text-xs text-red-200 mb-3">
                      <summary className="cursor-pointer hover:text-white">
                        🔍 Диагностическая информация
                      </summary>
                      <div className="mt-2 space-y-1 bg-black bg-opacity-30 p-2 rounded">
                        <div>Шаг: <span className="text-yellow-400">{state.step}</span></div>
                        <div>Ответы квиза: <span className="text-blue-400">{state.quiz.answers.length}</span></div>
                        <div>Архетип: <span className="text-purple-400">{state.archetype?.type || 'не определен'}</span></div>
                        <div>Стратегия: <span className="text-green-400">{state.analysisStrategy || 'не использована'}</span></div>
                        <div>Попытки: <span className="text-orange-400">{state.retryCount}</span></div>
                        <div>Время: <span className="text-cyan-400">{new Date().toLocaleTimeString()}</span></div>
                        <div>Браузер: <span className="text-pink-400">{navigator.userAgent.split(' ')[0]}</span></div>
                      </div>
                    </details>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Повторить
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
                    className="text-red-300 hover:text-white transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 🔍 GOD LEVEL DEBUG: Debug Panel */}
          {showDebugPanel && (
            <div className="fixed top-4 right-4 bg-black bg-opacity-95 text-green-400 p-4 rounded-lg text-xs z-50 max-w-md max-h-96 overflow-y-auto font-mono">
              <div className="mb-2 font-bold text-green-300 flex items-center justify-between">
                <span>🔍 GOD LEVEL DEBUG PANEL</span>
                <button
                  onClick={() => setDebugInfo([])}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  🗑️
                </button>
              </div>
              <div className="space-y-1">
                <div>🎯 Step: <span className="text-yellow-400">{state.step}</span></div>
                <div>🧠 Archetype: <span className="text-purple-400">{state.archetype?.type || 'none'}</span></div>
                <div>🔍 Strategy: <span className="text-cyan-400">{state.analysisStrategy || 'none'}</span></div>
                <div>👤 Name: <span className="text-blue-400">"{state.name}"</span></div>
                <div>📊 Quiz: <span className="text-orange-400">{state.quiz.answers.length}/3</span></div>
                <div>🔄 Retry: <span className="text-red-400">{state.retryCount}/1</span></div>
                <div>⚡ Loading: <span className="text-red-400">{state.isLoading.toString()}</span></div>
                <div>🔮 Prophecy: <span className="text-cyan-400">{state.prophecy ? 'set' : 'none'}</span></div>
                <div>🖼️ Avatar: <span className="text-pink-400">{state.avatarUrl ? 'set' : 'none'}</span></div>
                <div>📄 PDF: <span className="text-green-400">{pdfUrl ? 'ready' : 'none'}</span></div>
                <div>📄 PDF Attempted: <span className="text-yellow-400">{pdfGenerationAttempted ? 'yes' : 'no'}</span></div>
                <div>🛡️ Archetype Fetched: <span className="text-blue-400">{hasArchetypeFetchedRef.current ? 'yes' : 'no'}</span></div>
                <div>🛡️ Prophecy Fetched: <span className="text-blue-400">{hasProphecyFetchedRef.current ? 'yes' : 'no'}</span></div>
              </div>
              
              <div className="mt-3 border-t border-gray-700 pt-2">
                <div className="text-green-300 font-bold mb-1">📋 Debug Log:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.slice(-10).map((log, index) => (
                    <div key={index} className="text-gray-300 text-xs break-words">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AwakeningPortal;