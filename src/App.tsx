import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/index';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling } from './lib/utils/errorLogger';
import NotFoundPage from './pages/NotFoundPage';
import FocusManager from './components/FocusManager';

// Set up global error handling
setupGlobalErrorHandling();

function App() {
  return (
    <ErrorBoundary>
      <FocusManager>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage onGoHome={() => window.location.href = '/'} />} />
          </Routes>
        </Router>
      </FocusManager>
    </ErrorBoundary>
  );
}

export default App;