import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Star } from 'lucide-react';

interface XPLevelTrackerProps {
  xp: number;
  level: number;
  soundEnabled?: boolean;
}

const XPLevelTracker: React.FC<XPLevelTrackerProps> = ({ 
  xp, 
  level, 
  soundEnabled = true 
}) => {
  const currentLevelXP = level * 100;
  const nextLevelXP = (level + 1) * 100;
  const progressXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - xp;
  const progressPercent = (progressXP / 100) * 100;

  // QuickChart URL for XP visualization
  const chartUrl = `https://quickchart.io/chart?c={
    type: 'doughnut',
    data: {
      datasets: [{
        data: [${progressXP}, ${100 - progressXP}],
        backgroundColor: ['%2300ffff', '%23374151'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false }
      }
    }
  }&w=120&h=120&backgroundColor=transparent`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-cyan-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg flex items-center">
          <Zap className="w-5 h-5 text-yellow-400 mr-2" />
          Прогресс Мастерства
        </h3>
        <div className="text-cyan-400 text-sm font-mono">
          LVL {level}
        </div>
      </div>

      {/* XP Chart and Stats */}
      <div className="flex items-center space-x-6">
        {/* Chart */}
        <div className="relative">
          <img 
            src={chartUrl} 
            alt="XP Progress"
            className="w-24 h-24"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-sm">{Math.round(progressPercent)}%</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Текущий XP:</span>
            <span className="text-white font-bold">{xp}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">До уровня {level + 1}:</span>
            <span className="text-yellow-400 font-bold">{neededXP} XP</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Level Benefits */}
      <div className="mt-4 p-3 bg-black/30 rounded-lg">
        <div className="flex items-center text-purple-400 text-sm mb-2">
          <Star className="w-4 h-4 mr-1" />
          Бонусы уровня {level}:
        </div>
        <div className="text-gray-300 text-xs">
          {level >= 5 ? '🔓 Все инструменты разблокированы' :
           level >= 3 ? '🔓 Доступ к Quiz и Meme Generator' :
           level >= 2 ? '🔓 Доступ к Mind Map' :
           '🔒 Используй инструменты для повышения уровня'}
        </div>
      </div>
    </motion.div>
  );
};

export default XPLevelTracker;