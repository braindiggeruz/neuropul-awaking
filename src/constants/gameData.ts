import { ArchetypeData, AITool, PremiumTier } from '../types';

export const XP_THRESHOLDS = [0, 50, 100, 150, 250, 400, 600, 850, 1200, 1600];
export const FOMO_TIMER_DURATION = 10 * 60 * 1000; // 10 минут
export const DAILY_XP_BONUS = 10;
export const MAX_XP = 9999;

export const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'warrior',
    name: { ru: 'Воин', uz: 'Jangchi' },
    icon: '⚔️',
    description: { ru: 'Сила и решимость ведут к победе', uz: 'Kuch va qatiyat g\'alabaga olib boradi' },
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    phrases: {
      ru: [
        'Ты крушишь преграды, как стена!',
        'Воин не знает поражений!',
        'Твоя сила растёт с каждым шагом!',
        'Победа за победой - твой путь!'
      ],
      uz: [
        'Siz to\'siqlarni devor kabi buzasiz!',
        'Jangchi mag\'lubiyatni bilmaydi!',
        'Sizning kuchingiz har qadamda o\'sadi!',
        'G\'alaba ortidan g\'alaba - sizning yo\'lingiz!'
      ]
    }
  },
  {
    id: 'mage',
    name: { ru: 'Маг', uz: 'Sehrgar' },
    icon: '🔮',
    description: { ru: 'Знания и интуиция - твоя магия', uz: 'Bilim va sezgi - sizning sehringiz' },
    color: 'purple',
    gradient: 'from-purple-500 to-blue-500',
    phrases: {
      ru: [
        'Вижу, ты управляешь словами, как заклинаниями',
        'Твоя магия становится сильнее!',
        'Знания - твоя истинная сила!',
        'Мудрость течёт через тебя!'
      ],
      uz: [
        'Ko\'ryapmanki, siz so\'zlarni sehr kabi boshqarasiz',
        'Sizning sehringiz kuchliroq bo\'lmoqda!',
        'Bilim - sizning haqiqiy kuchingiz!',
        'Donolik siz orqali oqadi!'
      ]
    }
  },
  {
    id: 'hacker',
    name: { ru: 'Хакер', uz: 'Xaker' },
    icon: '💻',
    description: { ru: 'Хаки и AI-инструменты в твоих руках', uz: 'Xaklar va AI asboblari sizning qo\'lingizda' },
    color: 'green',
    gradient: 'from-green-500 to-teal-500',
    phrases: {
      ru: [
        'Одна строка кода — и мир меняется',
        'Ты взламываешь реальность!',
        'Код подчиняется твоей воле!',
        'Цифровой мир в твоих руках!'
      ],
      uz: [
        'Bitta kod qatori - va dunyo o\'zgaradi',
        'Siz haqiqatni buzasiz!',
        'Kod sizning irodangizga bo\'ysunadi!',
        'Raqamli dunyo sizning qo\'lingizda!'
      ]
    }
  },
  {
    id: 'sage',
    name: { ru: 'Мудрец', uz: 'Donishmand' },
    icon: '🦉',
    description: { ru: 'Понимание и смысл - твой путь', uz: 'Tushunish va ma\'no - sizning yo\'lingiz' },
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-500',
    phrases: {
      ru: [
        'Ты познаёшь смысл за смыслом',
        'Мудрость освещает твой путь!',
        'Глубина понимания растёт!',
        'Истина открывается тебе!'
      ],
      uz: [
        'Siz ma\'noni ma\'no ortidan bilib olasiz',
        'Donolik sizning yo\'lingizni yoritadi!',
        'Tushunish chuqurligi o\'sadi!',
        'Haqiqat sizga ochiladi!'
      ]
    }
  }
];

export const AI_TOOLS: AITool[] = [
  {
    id: 'idea-generator',
    name: { ru: 'Генератор идей', uz: 'G\'oya generatori' },
    icon: '💡',
    description: { ru: 'Создавай революционные идеи для заработка', uz: 'Daromad uchun inqilobiy g\'oyalar yarating' },
    xpReward: 25,
    isPremium: false
  },
  {
    id: 'image-analyzer',
    name: { ru: 'Анализатор изображений', uz: 'Rasm analizatori' },
    icon: '🔍',
    description: { ru: 'Анализируй изображения с помощью ИИ', uz: 'AI yordamida rasmlarni tahlil qiling' },
    xpReward: 25,
    isPremium: false
  },
  {
    id: 'code-assistant',
    name: { ru: 'Код-ассистент', uz: 'Kod yordamchisi' },
    icon: '💻',
    description: { ru: 'Программируй с помощью ИИ', uz: 'AI yordamida dasturlash' },
    xpReward: 25,
    isPremium: false
  },
  {
    id: 'meme-generator',
    name: { ru: 'Мем-генератор', uz: 'Mem generatori' },
    icon: '😂',
    description: { ru: 'Создавай вирусные мемы с DALL-E', uz: 'DALL-E bilan viral memlar yarating' },
    xpReward: 30,
    isPremium: false
  },
  {
    id: 'mvp-generator',
    name: { ru: 'MVP-генератор', uz: 'MVP generatori' },
    icon: '🚀',
    description: { ru: 'Создай свой AI-бизнес план', uz: 'O\'zingizning AI biznes rejangizni yarating' },
    xpReward: 50,
    isPremium: true,
    premiumTier: 'master'
  }
];

export const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: 'basic',
    name: { ru: 'Basic', uz: 'Asosiy' },
    price: 9,
    originalPrice: 19,
    color: 'blue',
    features: {
      ru: [
        '+50% больше XP',
        'Приоритетная поддержка',
        'Без рекламы',
        'Расширенная статистика'
      ],
      uz: [
        '+50% ko\'proq XP',
        'Ustuvor qo\'llab-quvvatlash',
        'Reklamasiz',
        'Kengaytirilgan statistika'
      ]
    }
  },
  {
    id: 'pro',
    name: { ru: 'Pro', uz: 'Pro' },
    price: 19,
    originalPrice: 39,
    color: 'purple',
    popular: true,
    features: {
      ru: [
        'Все возможности Basic',
        'Все AI-инструменты',
        'Безлимитные запросы',
        'Экспорт результатов',
        'Персональный наставник'
      ],
      uz: [
        'Barcha Basic imkoniyatlar',
        'Barcha AI asboblar',
        'Cheksiz so\'rovlar',
        'Natijalarni eksport qilish',
        'Shaxsiy murabbiy'
      ]
    }
  },
  {
    id: 'master',
    name: { ru: 'Master', uz: 'Usta' },
    price: 29,
    originalPrice: 59,
    color: 'gold',
    features: {
      ru: [
        'Все возможности Pro',
        'MVP-генератор',
        'Эксклюзивные инструменты',
        'Белая метка',
        'API доступ',
        'Титул "Хранитель ИИ"'
      ],
      uz: [
        'Barcha Pro imkoniyatlar',
        'MVP generator',
        'Eksklyuziv asboblar',
        'Oq yorliq',
        'API kirish',
        '"AI Qo\'riqchisi" unvoni'
      ]
    }
  }
];

export const getLevelByXP = (xp: number): number => {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
};

export const getXPForNextLevel = (level: number): number => {
  return XP_THRESHOLDS[level + 1] || MAX_XP;
};

export const getXPProgress = (xp: number, level: number): number => {
  const currentLevelXP = XP_THRESHOLDS[level];
  const nextLevelXP = getXPForNextLevel(level);
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

export const getUserTitle = (level: number, lang: 'ru' | 'uz'): string => {
  if (level <= 2) return lang === 'ru' ? 'Новичок' : 'Yangi boshlovchi';
  if (level <= 4) return lang === 'ru' ? 'Искатель' : 'Izlovchi';
  if (level <= 6) return lang === 'ru' ? 'Искусный' : 'Mohir';
  if (level <= 8) return lang === 'ru' ? 'Архитектор' : 'Arxitektor';
  return lang === 'ru' ? 'Хранитель ИИ' : 'AI Qo\'riqchisi';
};