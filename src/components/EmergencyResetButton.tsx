import React, { useState } from 'react';
import { emergencyReset } from '../utils/navigationUtils';

interface EmergencyResetButtonProps {
  className?: string;
}

const EmergencyResetButton: React.FC<EmergencyResetButtonProps> = ({ className = '' }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleClick = () => {
    if (showConfirm) {
      emergencyReset();
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
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-sm transition-all ${
        showConfirm 
          ? 'bg-red-600 text-white' 
          : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700'
      } ${className}`}
    >
      {showConfirm ? 'Подтвердить сброс' : '🔄 Сбросить данные'}
    </button>
  );
};

export default EmergencyResetButton;