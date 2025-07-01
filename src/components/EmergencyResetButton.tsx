import React, { useState } from 'react';
import { emergencyReset } from '../utils/navigationUtils';

interface EmergencyResetButtonProps {
  className?: string;
}

const EmergencyResetButton: React.FC<EmergencyResetButtonProps> = ({ className = '' }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const handleClick = () => {
    if (showConfirm) {
      setIsResetting(true);
      try {
        // Log the action
        console.log('🧹 Emergency reset triggered by user');
        
        // Clear all navigation state
        localStorage.removeItem('neuropul_current_screen');
        sessionStorage.removeItem('neuropul_current_screen');
        localStorage.removeItem('neuropul_navigation_in_progress');
        localStorage.removeItem('hasPassedPortal');
        
        // Perform full reset
        emergencyReset();
      } catch (error) {
        console.error('Error during emergency reset:', error);
        // Force reload as last resort
        window.location.reload();
      }
    } else {
      setShowConfirm(true);
      
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirm(false);
      }, 5000);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isResetting}
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-sm transition-all ${
        isResetting 
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
          : showConfirm 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700'
      } ${className}`}
    >
      {isResetting 
        ? 'Сброс...' 
        : showConfirm 
          ? 'Подтвердить сброс' 
          : '🔄 Сбросить данные'}
    </button>
  );
};

export default EmergencyResetButton;