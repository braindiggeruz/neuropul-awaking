import React from 'react';
import { motion } from 'framer-motion';
import { ArchetypeResult } from '../../types';

interface ArchetypeAnalysisProps {
  archetype: ArchetypeResult | null;
  isLoading: boolean;
}

const ARCHETYPE_ICONS = {
  'Воин': '⚔️',
  'Маг': '🔮',
  'Искатель': '🗺️',
  'Тень': '🌙'
};

const ARCHETYPE_COLORS = {
  'Воин': 'from-red-500 to-orange-500',
  'Маг': 'from-purple-500 to-blue-500',
  'Искатель': 'from-green-500 to-teal-500',
  'Тень': 'from-gray-500 to-purple-500'
};

const ArchetypeAnalysis: React.FC<ArchetypeAnalysisProps> = ({ archetype, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-cyan-400 text-lg">🧠 Анализирую твою сущность...</p>
        <p className="text-gray-400 text-sm mt-2">AI-оракул изучает твои ответы</p>
      </motion.div>
    );
  }

  if (!archetype) {
    return null;
  }

  const icon = ARCHETYPE_ICONS[archetype.type as keyof typeof ARCHETYPE_ICONS] || '🤖';
  const gradient = ARCHETYPE_COLORS[archetype.type as keyof typeof ARCHETYPE_COLORS] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="text-center py-8"
    >
      {/* Archetype Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-6xl shadow-2xl`}
      >
        {icon}
      </motion.div>

      {/* Archetype Name */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold text-white mb-4"
      >
        Ты — <span className="text-cyan-400">{archetype.type}</span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-gray-300 text-lg mb-6 max-w-md mx-auto leading-relaxed"
      >
        {archetype.description}
      </motion.p>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-800 border border-cyan-500 rounded-lg p-4 max-w-md mx-auto"
      >
        <p className="text-cyan-400 font-semibold">
          {archetype.CTA}
        </p>
      </motion.div>

      {/* Glitch Effect */}
      <motion.div
        animate={{
          opacity: [1, 0.8, 1],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-cyan-500 opacity-5 rounded-lg" />
      </motion.div>
    </motion.div>
  );
};

export default ArchetypeAnalysis;