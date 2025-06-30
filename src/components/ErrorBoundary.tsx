import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../lib/utils/errorLogger';

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
    } catch (storageError) {
      console.error('Failed to save error info to localStorage:', storageError);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
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

export default ErrorBoundary;