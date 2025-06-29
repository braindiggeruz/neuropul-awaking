export const XP_REWARDS = {
  QUIZ_CORRECT: 10,
  QUIZ_PERFECT: 50,
  MINDMAP_CREATED: 20,
  MEME_CREATED: 15,
  TRAE_CONSULTATION: 5,
  DAILY_CHALLENGE: 50,
  WEEKLY_CHALLENGE: 200,
  LEVEL_UP_BONUS: 25
};

export const LEVEL_THRESHOLDS = [
  0,    // Level 1: 0 XP
  100,  // Level 2: 100 XP
  200,  // Level 3: 200 XP
  350,  // Level 4: 350 XP
  550,  // Level 5: 550 XP
  800,  // Level 6: 800 XP
  1100, // Level 7: 1100 XP
  1450, // Level 8: 1450 XP
  1850, // Level 9: 1850 XP
  2300  // Level 10: 2300 XP
];

export const calculateLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const getXPForNextLevel = (currentLevel) => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500;
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

export const getProgressToNextLevel = (xp, level) => {
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = getXPForNextLevel(level);
  const progress = xp - currentLevelXP;
  const total = nextLevelXP - currentLevelXP;
  
  return {
    current: progress,
    total: total,
    percentage: (progress / total) * 100
  };
};

export const getLevelTitle = (level) => {
  const titles = {
    1: 'Новичок',
    2: 'Ученик',
    3: 'Практик',
    4: 'Искусный',
    5: 'Эксперт',
    6: 'Мастер',
    7: 'Гуру',
    8: 'Архитектор',
    9: 'Легенда',
    10: 'Хранитель ИИ'
  };
  
  return titles[level] || 'AI-Мастер';
};

export const getLevelBenefits = (level) => {
  const benefits = {
    1: ['Доступ к базовым инструментам'],
    2: ['Разблокирован Mind Map Generator'],
    3: ['Разблокирован Quiz Module', 'Ежедневные челленджи'],
    4: ['Разблокирован Meme Generator'],
    5: ['Все инструменты разблокированы', 'Недельные челленджи'],
    6: ['Бонус +25% XP за все действия'],
    7: ['Приоритетная поддержка Trae'],
    8: ['Эксклюзивные челленджи'],
    9: ['Статус "Легенда" в сообществе'],
    10: ['Титул "Хранитель ИИ"', 'Максимальные привилегии']
  };
  
  return benefits[level] || ['Продолжай развиваться!'];
};