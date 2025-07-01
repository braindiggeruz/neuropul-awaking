import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';
import FocusManager from './components/FocusManager';
import ScrollToTop from './components/ScrollToTop';
import TitleManager from './components/TitleManager';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const Home = lazy(() => import('./pages/index'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Загрузка NeuropulAI...</p>
    </div>
  </div>
);

// Set up global error handling
setupGlobalErrorHandling();

function App() {
  // Check for redirect from 404 page
  useEffect(() => {
    const url = new URL(window.location.href);
    const redirectPath = url.searchParams.get('redirect');
    
    if (redirectPath) {
      // Remove the redirect parameter to prevent loops
      url.searchParams.delete('redirect');
      window.history.replaceState({}, '', url.toString());
      
      // Store the path for potential use after authentication
      sessionStorage.setItem('redirectAfterAuth', redirectPath);
    }
    
    // CRITICAL: Remove initial loader
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      console.log('🚀 Removing initial loader');
      initialLoader.style.opacity = '0';
      initialLoader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (initialLoader.parentNode) {
          initialLoader.parentNode.removeChild(initialLoader);
          console.log('✅ Initial loader removed from DOM');
        }
      }, 500);
    }
    
    // CRITICAL: Clear any portal state to prevent navigation loops
    const isPortalScreen = localStorage.getItem('neuropul_current_screen') === 'portal';
    if (isPortalScreen) {
      console.log('🔄 Detected portal screen in storage, clearing to prevent loops');
      localStorage.removeItem('neuropul_current_screen');
      sessionStorage.removeItem('neuropul_current_screen');
      localStorage.removeItem('neuropul_navigation_in_progress');
      localStorage.removeItem('hasPassedPortal'); // ADDED: Clear hasPassedPortal flag
    }
    
    // Log current path for debugging
    console.log('[NAV] Current path:', window.location.pathname);
  }, []);

  return (
    <ErrorBoundary>
      <FocusManager>
        <Router>
          <ScrollToTop />
          <TitleManager>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage onGoHome={() => window.location.href = '/'} />} />
              </Routes>
            </Suspense>
          </TitleManager>
        </Router>
      </FocusManager>
    </ErrorBoundary>
  );
}

export default App;