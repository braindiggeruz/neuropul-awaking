import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';
import FocusManager from './components/FocusManager';
import ScrollToTop from './components/ScrollToTop';
import TitleManager from './components/TitleManager';

// Lazy load components
const Home = React.lazy(() => import('./pages/index'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Загрузка NeuropulAI...</p>
    </div>
  </div>
);

// Portal Guard component
const PortalGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we're on the portal screen and it's been shown before
    const currentScreen = localStorage.getItem('neuropul_current_screen');
    const introCompleted = localStorage.getItem('neuropul_intro_completed');
    const navigationInProgress = localStorage.getItem('neuropul_navigation_in_progress');
    
    console.log(`🔍 PortalGuard - currentScreen: ${currentScreen}, introCompleted: ${introCompleted}, pathname: ${location.pathname}, navigationInProgress: ${navigationInProgress}`);
    
    if (currentScreen === 'portal' || navigationInProgress === 'true') {
      console.log('⚠️ PortalGuard - Detected portal screen or navigation in progress, clearing state');
      
      // Clear all navigation flags to prevent loops
      localStorage.removeItem('neuropul_current_screen');
      localStorage.removeItem('neuropul_navigation_in_progress');
      
      // If intro is completed, redirect to home
      if (introCompleted === 'true') {
        console.log('⚠️ PortalGuard - Intro completed, redirecting to home');
        
        // Use setTimeout to ensure this happens after current render cycle
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    }
  }, [location.pathname, navigate]);
  
  return null;
};

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
    
    // Remove initial loader if it's still there
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      console.log('🧹 Removing initial loader from App component');
      initialLoader.style.opacity = '0';
      initialLoader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (initialLoader && initialLoader.parentNode) {
          initialLoader.parentNode.removeChild(initialLoader);
          console.log('🧹 Initial loader removed from App component');
        }
      }, 500);
    }
    
    // CRITICAL FIX: Check for portal screen and clear it if needed
    const currentScreen = localStorage.getItem('neuropul_current_screen');
    if (currentScreen === 'portal') {
      console.log('⚠️ App detected portal screen on mount, clearing to prevent loops');
      localStorage.removeItem('neuropul_current_screen');
    }
    
    // CRITICAL FIX: Check for navigation in progress and clear it if needed
    const navigationInProgress = localStorage.getItem('neuropul_navigation_in_progress');
    if (navigationInProgress === 'true') {
      console.log('⚠️ App detected navigation in progress on mount, clearing to prevent loops');
      localStorage.removeItem('neuropul_navigation_in_progress');
    }
    
    // CRITICAL FIX: Remove all loaders that might be present
    document.querySelectorAll('.initial-loader, .fallback-loader').forEach(el => {
      console.log('🧹 Removing loader element:', el);
      el.remove();
    });
  }, []);

  return (
    <FocusManager>
      <Router>
        <ScrollToTop />
        <PortalGuard />
        <TitleManager>
          <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage onGoHome={() => window.location.href = '/'} />} />
            </Routes>
          </React.Suspense>
        </TitleManager>
      </Router>
    </FocusManager>
  );
}

export default App;