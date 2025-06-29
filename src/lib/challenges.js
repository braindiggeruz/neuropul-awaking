export const generateDailyChallenge = () => {
  const challenges = [
    {
      id: 'daily_mindmap',
      title: 'Картограф Знаний',
      description: 'Создай интеллект-карту на тему, которую ты не знаешь',
      icon: '🗺️',
      xpReward: 50,
      requirement: 'mindmap_created'
    },
    {
      id: 'daily_quiz',
      title: 'Мозговой Штурм',
      description: 'Ответь правильно на 5 вопросов квиза подряд',
      icon: '🧠',
      xpReward: 75,
      requirement: 'quiz_perfect'
    },
    {
      id: 'daily_meme',
      title: 'Мем-Мастер',
      description: 'Создай мем, описывающий твоё текущее состояние',
      icon: '😂',
      xpReward: 40,
      requirement: 'meme_created'
    },
    {
      id: 'daily_trae',
      title: 'Беседа с Мудрецом',
      description: 'Получи совет от Trae по развитию AI-навыков',
      icon: '🧙‍♂️',
      xpReward: 30,
      requirement: 'trae_consulted'
    },
    {
      id: 'daily_explorer',
      title: 'AI-Исследователь',
      description: 'Попробуй новый AI-инструмент сегодня',
      icon: '🚀',
      xpReward: 60,
      requirement: 'new_tool_used'
    }
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const challengeIndex = dayOfYear % challenges.length;
  
  return challenges[challengeIndex];
};

export const generateWeeklyChallenge = () => {
  const challenges = [
    {
      id: 'weekly_master',
      title: 'AI-Мастер',
      description: 'Используй все доступные инструменты в течение недели',
      icon: '👑',
      xpReward: 200,
      requirement: 'all_tools_used'
    },
    {
      id: 'weekly_creator',
      title: 'Творческий Гений',
      description: 'Создай 10 различных работ с помощью AI',
      icon: '🎨',
      xpReward: 150,
      requirement: 'creative_works'
    },
    {
      id: 'weekly_scholar',
      title: 'Учёный',
      description: 'Изучи 5 новых концепций AI через квизы',
      icon: '📚',
      xpReward: 180,
      requirement: 'knowledge_gained'
    }
  ];

  const now = new Date();
  const weekOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 7));
  const challengeIndex = weekOfYear % challenges.length;
  
  return challenges[challengeIndex];
};