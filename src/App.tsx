import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AwakeningPortal from './components/AwakeningPortal/AwakeningPortal';
import EnhancedDashboard from './components/EnhancedDashboard';
import SystemHealthCheck from './components/SystemHealthCheck';
import { UserProgress } from './types';
import { useStorage } from './lib/utils/storage';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-black bg-opacity-50 rounded-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Что-то пошло не так</h2>
            <p className="text-gray-300 mb-6">
              Произошла ошибка в приложении. Пожалуйста, обновите страницу.
            </p>
            <p className="text-red-400 text-sm mb-6 bg-red-900 bg-opacity-30 p-3 rounded-lg">
              {this.state.error?.message || 'Неизвестная ошибка'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const { loadProgress } = useStorage();

  useEffect(() => {
    // Check for existing progress
    const savedProgress = loadProgress();
    const awakeningCompleted = localStorage.getItem('neuropul_awakening_completed') === 'true';
    
    console.log('🔍 App initialization:', {
      savedProgress,
      awakeningCompleted,
      hasValidProgress: savedProgress && savedProgress.awakened
    });
    
    if (savedProgress && savedProgress.awakened && awakeningCompleted) {
      console.log('✅ Valid awakened user found, loading dashboard');
      setUserProgress(savedProgress);
    } else {
      console.log('🌟 New user or incomplete awakening, showing portal');
      setUserProgress(null);
    }
    
    setIsLoading(false);
    
    // Check for debug mode
    const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
    if (isDebugMode) {
      console.log('🔍 Debug mode activated');
      setShowHealthCheck(true);
    }
  }, [loadProgress]);

  const handleAwakeningComplete = (progress: UserProgress) => {
    console.log('🎉 Awakening completed:', progress);
    setUserProgress(progress);
    
    // Ensure awakening completion is marked
    localStorage.setItem('neuropul_awakening_completed', 'true');
  };

  const toggleHealthCheck = () => {
    setShowHealthCheck(prev => !prev);
  };

  // Secret key combination for health check
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+H
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        toggleHealthCheck();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Инициализация портала...</p>
          <p className="text-purple-300 text-sm mt-2">Проверяем состояние пробуждения...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <AnimatePresence mode="wait">
          {!userProgress?.awakened ? (
            <AwakeningPortal
              key="awakening"
              onComplete={handleAwakeningComplete}
            />
          ) : (
            <EnhancedDashboard
              key="dashboard"
              userProgress={userProgress}
            />
          )}
        </AnimatePresence>
        
        {/* Debug button in corner */}
        {import.meta.env.MODE === 'development' && (
          <button
            onClick={toggleHealthCheck}
            className="fixed bottom-4 right-4 bg-gray-800 text-gray-300 hover:text-white p-2 rounded-full opacity-50 hover:opacity-100 transition-opacity z-50"
            title="System Health Check (Ctrl+Shift+H)"
          >
            🔍
          </button>
        )}
        
        {/* System Health Check */}
        <AnimatePresence>
          {showHealthCheck && (
            <SystemHealthCheck onClose={() => setShowHealthCheck(false)} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

export default App;