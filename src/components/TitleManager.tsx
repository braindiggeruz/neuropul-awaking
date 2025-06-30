import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface TitleManagerProps {
  children: React.ReactNode;
}

/**
 * Component to manage document title based on current route
 */
const TitleManager: React.FC<TitleManagerProps> = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Set default title
    let title = "NeuropulAI - Твой путь к AI-мастерству";
    
    // Update title based on route
    switch (location.pathname) {
      case '/':
        title = "NeuropulAI - Твой путь к AI-мастерству";
        break;
      case '/awakening':
        title = "Пробуждение - NeuropulAI";
        break;
      case '/dashboard':
        title = "Дашборд - NeuropulAI";
        break;
      case '/premium':
        title = "Premium - NeuropulAI";
        break;
      default:
        if (location.pathname.startsWith('/tools/')) {
          const toolName = location.pathname.split('/').pop();
          title = `${toolName ? toolName.charAt(0).toUpperCase() + toolName.slice(1) : 'Инструмент'} - NeuropulAI`;
        } else if (location.pathname === '/404' || location.pathname === '*') {
          title = "Страница не найдена - NeuropulAI";
        }
    }
    
    // Set the document title
    document.title = title;
    
    // Cleanup function to reset title
    return () => {
      document.title = "NeuropulAI - Твой путь к AI-мастерству";
    };
  }, [location]);
  
  return <>{children}</>;
};

export default TitleManager;