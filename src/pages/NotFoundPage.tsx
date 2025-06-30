import React from 'react';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { getUserLanguage } from '../lib/utils/i18n';

interface NotFoundPageProps {
  onGoHome: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const language = getUserLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-8 border border-purple-500 border-opacity-30 shadow-2xl max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center"
        >
          <AlertTriangle className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-6">
          {language === 'ru' ? 'Страница не найдена' : 'Sahifa topilmadi'}
        </h2>
        
        <p className="text-gray-300 mb-8">
          {language === 'ru' 
            ? 'Запрошенная страница не существует или была перемещена.' 
            : 'So\'ralgan sahifa mavjud emas yoki ko\'chirilgan.'}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoHome}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          <span>
            {language === 'ru' ? 'Вернуться на главную' : 'Bosh sahifaga qaytish'}
          </span>
        </motion.button>
        
        {/* Cyberpunk decorative elements */}
        <div className="absolute -bottom-3 -right-3 w-24 h-24 border-r-2 border-b-2 border-red-500 opacity-50 animate-pulse"></div>
        <div className="absolute -top-3 -left-3 w-24 h-24 border-l-2 border-t-2 border-purple-500 opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;