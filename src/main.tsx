import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/cyberpunk.css';
import './styles/global.css';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';

// Set up global error handling
setupGlobalErrorHandling();

console.log('🌐 main.tsx запускается');

// CRITICAL FIX: Clear portal screen and navigation flags on app start
console.log('🧹 Cleaning up navigation state on app start');
localStorage.removeItem('neuropul_current_screen');
localStorage.removeItem('neuropul_navigation_in_progress');

// Удаление лоадера если он остался висеть
const removeLoader = () => {
  console.log('🧹 Attempting to remove initial loader');
  const loader = document.getElementById('initial-loader');
  if (loader) {
    console.log('🧹 Initial loader found, removing');
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
        console.log('🧹 Initial loader removed');
      }
    }, 500);
  } else {
    console.log('🧹 Initial loader not found');
  }
};

// На всякий случай удалим через 3 сек (если что-то пошло не так)
setTimeout(removeLoader, 3000);

// Событие полной загрузки окна
window.addEventListener('load', removeLoader);

// DOMContentLoaded (на всякий случай)
document.addEventListener('DOMContentLoaded', removeLoader);

// Create a function to handle errors during rendering
const renderApp = () => {
  try {
    console.log('🔍 Finding root element');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    console.log('🔍 Creating React root');
    const root = createRoot(rootElement);
    
    console.log('🔍 Rendering React app');
    root.render(
      // Temporarily remove StrictMode to avoid double mounting effects
      <App />
    );
    
    console.log('✅ React rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    
    // Display a minimal fallback UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); display: flex; align-items: center; justify-content: center; padding: 20px; color: white; font-family: sans-serif;">
          <div style="background: rgba(0,0,0,0.5); border-radius: 12px; padding: 24px; max-width: 500px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="font-size: 24px; margin-bottom: 16px;">Ошибка запуска приложения</h2>
            <p style="margin-bottom: 24px;">Произошла критическая ошибка при запуске NeuropulAI. Пожалуйста, обновите страницу.</p>
            <button onclick="window.location.reload()" style="background: #8b5cf6; border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
              Обновить страницу
            </button>
            <div style="margin-top: 16px;">
              <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href = '/';" style="background: #ef4444; border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px;">
                Сбросить данные и перезагрузить
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    // Also remove the loader
    removeLoader();
  }
};

// Call the render function
renderApp();

console.log('🚀 React отрендерен');

// CRITICAL FIX: Add emergency escape hatch
window.addEventListener('error', (event) => {
  console.error('🚨 Uncaught error:', event.error);
  
  // If there's an error, clear navigation state
  localStorage.removeItem('neuropul_current_screen');
  localStorage.removeItem('neuropul_navigation_in_progress');
});