import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/cyberpunk.css';
import './styles/global.css';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Set up global error handling
setupGlobalErrorHandling();

// Create a function to handle errors during rendering
const renderApp = () => {
  try {
    console.log('🚀 React rendering started');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    // CRITICAL: Remove initial loader if it still exists
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader && initialLoader.parentNode) {
      console.log('🧹 Removing initial loader from main.tsx');
      initialLoader.parentNode.removeChild(initialLoader);
    }
    
    // Clear any portal state to prevent navigation issues
    localStorage.removeItem('neuropul_current_screen');
    sessionStorage.removeItem('neuropul_current_screen');
    
    const root = createRoot(rootElement);
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('✅ React rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    
    // Display a minimal fallback UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); display: flex; align-items: center; justify-content: center; padding: 20px; color: white; font-family: sans-serif;">
          <div style="background: rgba(0,0,0,0.5); border-radius: 12px; padding: 24px; max-width: 500px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="font-size: 24px; margin-bottom: 16px;">Ошибка запуска приложения</h2>
            <p style="margin-bottom: 24px;">Произошла критическая ошибка при запуске NeuropulAI. Пожалуйста, сбросьте данные и обновите страницу.</p>
            <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload()" style="background: #8b5cf6; border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
              Сбросить данные и перезагрузить
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Call the render function
renderApp();