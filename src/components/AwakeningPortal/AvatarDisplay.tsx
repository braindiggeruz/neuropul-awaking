import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AvatarDisplayProps {
  name: string;
  onNameChange: (name: string) => void;
  avatarUrl: string;
  archetype: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  name, 
  onNameChange, 
  avatarUrl, 
  archetype 
}) => {
  const [isEditing, setIsEditing] = useState(!name);
  const [tempName, setTempName] = useState(name);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-8"
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="w-32 h-32 mx-auto relative">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full rounded-full border-4 border-cyan-500 shadow-2xl"
          />
          
          {/* Glowing Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-60"
            style={{
              background: 'conic-gradient(from 0deg, #06b6d4, #8b5cf6, #06b6d4)',
              mask: 'radial-gradient(circle, transparent 60px, black 62px)',
              WebkitMask: 'radial-gradient(circle, transparent 60px, black 62px)'
            }}
          />
        </div>
      </motion.div>

      {/* Name Input/Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4"
      >
        {isEditing ? (
          <div className="space-y-4">
            <h3 className="text-white text-lg">Как тебя зовут, пробуждённый?</h3>
            <div className="flex items-center justify-center space-x-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введи своё имя"
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
                maxLength={20}
              />
              <motion.button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white"
            >
              {name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-cyan-400 text-lg"
            >
              Архетип: {archetype}
            </motion.p>
            <motion.button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              (изменить имя)
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Mystical Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center space-x-8 text-cyan-400/40"
      >
        {['⚡', '🔮', '⚡'].map((symbol, index) => (
          <motion.span
            key={index}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5
            }}
            className="text-2xl"
          >
            {symbol}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AvatarDisplay;