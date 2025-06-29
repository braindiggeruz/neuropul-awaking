import React from 'react';
import { motion } from 'framer-motion';

interface ProphecyProps {
  prophecy: string | null;
  isLoading: boolean;
}

const Prophecy: React.FC<ProphecyProps> = ({ prophecy, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-yellow-400 text-lg mb-4"
        >
          🔮 Древний оракул говорит...
        </motion.div>
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-yellow-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!prophecy) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-8"
    >
      {/* Prophecy Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="text-yellow-400 text-xl font-semibold mb-2">
          🔮 Пророчество Оракула
        </h3>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto" />
      </motion.div>

      {/* Prophecy Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6 max-w-lg mx-auto backdrop-blur-sm">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-yellow-200 text-lg font-medium leading-relaxed italic"
          >
            "{prophecy}"
          </motion.p>
        </div>

        {/* Mystical Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-yellow-400/10 rounded-lg blur-xl -z-10"
        />
      </motion.div>

      {/* Mystical Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex justify-center space-x-4 text-yellow-400/60"
      >
        {['✨', '🌟', '✨'].map((star, index) => (
          <motion.span
            key={index}
            animate={{
              opacity: [0.4, 1, 0.4],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3
            }}
            className="text-xl"
          >
            {star}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Prophecy;