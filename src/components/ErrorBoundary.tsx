import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../lib/utils/errorLogger';
import { getUserLanguage } from '../lib/utils/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error tracking system
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Log to centralized error system
    logError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      additionalData: {
        componentStack: errorInfo.componentStack
      }
    });
    
    // Try to recover by resetting some state
    try {
      // Clear any potentially corrupted state
      localStorage.setItem('neuropul_error_occurred', 'true');
      localStorage.setItem('neuropul_error_timestamp', new Date().toISOString());
      localStorage.setItem('neuropul_error_message', error.message);
      
      // Clear navigation state
      localStorage.removeItem('neuropul_current_screen');
      sessionStorage.removeItem('neuropul_current_screen');
      localStorage.removeItem('neuropul_navigation_in_progress');
      localStorage.removeItem('hasPassedPortal');
    } catch (storageError) {
      console.error('Failed to save error info to localStorage:', storageError);
    }
  }

  handleReset = () => {
    console.log('🧠 SYSTEM CLEAR INITIATED');
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during emergency reset:', error);
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Get user language
      const language = getUserLanguage();
      
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
          <div className="bg-black bg-opacity-50 rounded-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {language === 'ru' ? 'Что-то пошло не так' : 'Nimadir noto\'g\'ri bajarildi'}
            </h2>
            <p className="text-gray-300 mb-6">
              {language === 'ru' 
                ? 'Произошла ошибка в приложении. Пожалуйста, сбросьте данные и перезагрузите страницу.' 
                : 'Ilovada xatolik yuz berdi. Iltimos, ma\'lumotlarni tiklang va sahifani yangilang.'}
            </p>
            <p className="text-red-400 text-sm mb-6 bg-red-900 bg-opacity-30 p-3 rounded-lg">
              {this.state.error?.message || (language === 'ru' ? 'Неизвестная ошибка' : 'Noma\'lum xato')}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {language === 'ru' ? 'Сбросить данные и перезагрузить' : 'Ma\'lumotlarni tiklash va qayta yuklash'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;