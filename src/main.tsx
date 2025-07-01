import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/cyberpunk.css';
import './styles/global.css';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';

// Set up global error handling
setupGlobalErrorHandling();

// Create a function to handle errors during rendering
const renderApp = () => {
  try {
    console.log('🔍 Initializing NeuropulAI application');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    console.log('🔍 Root element found, creating React root');
    const root = createRoot(rootElement);
    
    console.log('🔍 Rendering React app');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('🔍 React app rendered, removing initial loader');
    
    // Remove the initial loader once the app has loaded
    const removeLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        console.log('🔍 Initial loader found, removing');
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (loader.parentNode) {
            loader.style.display = 'none';
            console.log('🔍 Initial loader hidden');
          }
        }, 500);
      } else {
        console.log('⚠️ Initial loader element not found');
      }
    };
    
    // Try to remove loader immediately and also after a delay
    removeLoader();
    setTimeout(removeLoader, 1000);
    
    console.log('✅ NeuropulAI application initialized successfully');
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
            <p style="margin-bottom: 24px;">Произошла критическая ошибка при запуске NeuropulAI: ${error.message}</p>
            <button onclick="window.location.reload()" style="background: #8b5cf6; border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
              Обновить страницу
            </button>
          </div>
        </div>
      `;
      
      // Also try to remove the loader
      const loader = document.getElementById('initial-loader');
      if (loader && loader.parentNode) {
        loader.style.display = 'none';
      }
    }
  }
};

// Call the render function
console.log('🔍 Starting NeuropulAI application');
renderApp();

// Add a fallback to remove the loader after a timeout
setTimeout(() => {
  const loader = document.getElementById('initial-loader');
  if (loader && loader.style.display !== 'none') {
    console.log('⚠️ Loader still visible after timeout, forcing removal');
    loader.style.display = 'none';
  }
}, 5000);