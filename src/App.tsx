import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';
import FocusManager from './components/FocusManager';
import ScrollToTop from './components/ScrollToTop';
import TitleManager from './components/TitleManager';

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
    
    // Log app initialization
    console.log('🚀 App initialized');
  }, []);

  return (
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
  );
}

export default App;