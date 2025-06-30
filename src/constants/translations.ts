import { Translations } from '../types';

export const translations: Translations = {
  ru: {
    // Общие
    welcome: "Добро пожаловать",
    continue: "Продолжить",
    back: "Назад",
    next: "Далее",
    close: "Закрыть",
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    
    // Заголовки
    appName: "NeuropulAI",
    tagline: "Твой путь к AI-мастерству",
    
    // Приветствие
    welcomeTitle: "Добро пожаловать в NeuropulAI",
    welcomeSubtitle: "Геймифицированная платформа для изучения ИИ",
    enterName: "Введи своё имя",
    enterNameError: "Введи своё имя!",
    startJourney: "Начать путь",
    
    // Архетипы
    chooseArchetype: "Выбери свой архетип",
    archetypeDescription: "Это определит твой стиль прохождения",
    
    // Инструменты
    tools: "AI-Инструменты",
    useTools: "Использовать",
    premium: "Premium",
    locked: "Заблокировано",
    
    // Уровни и XP
    level: "Уровень",
    xp: "Опыт",
    dailyBonus: "Ежедневный бонус",
    streak: "Серия",
    
    // Premium
    upgradeToPremium: "Обновиться до Premium",
    premiumFeatures: "Premium возможности",
    buyNow: "Купить сейчас",
    limitedOffer: "Ограниченное предложение!",
    
    // Сертификат
    certificate: "Сертификат",
    downloadCertificate: "Скачать сертификат",
    certificateUnlocked: "Сертификат разблокирован!",
    
    // Уведомления
    levelUp: "Повышение уровня!",
    xpGained: "Получено XP",
    dailyBonusReceived: "Ежедневный бонус получен!",
    
    // Trae Awakens
    whoAreYou: "Кто ты?",
    lostSoul: "💀 Я потерян",
    lostSoulDesc: "Не знаю, что такое AI и зачем он мне",
    wantToAwaken: "🚀 Хочу пробудиться",
    wantToAwakenDesc: "Готов начать путь AI-мастерства",
    alreadyKnow: "👽 Я уже в теме",
    alreadyKnowDesc: "Знаю, что такое AI и как его использовать",
    describeExperience: "Или опиши свой опыт своими словами...",
    send: "Отправить",
    stillHere: "Эй, ты ещё здесь? Выбери свой путь, чтобы мы могли начать.",
    
    // Титулы
    titles: {
      novice: "Новичок",
      seeker: "Искатель", 
      skilled: "Искусный",
      architect: "Архитектор",
      keeper: "Хранитель ИИ"
    }
  },
  
  uz: {
    // Общие
    welcome: "Xush kelibsiz",
    continue: "Davom etish",
    back: "Orqaga",
    next: "Keyingi",
    close: "Yopish",
    loading: "Yuklanmoqda...",
    error: "Xatolik",
    success: "Muvaffaqiyat",
    
    // Заголовки
    appName: "NeuropulAI",
    tagline: "AI ustaxonligiga yo'lingiz",
    
    // Приветствие
    welcomeTitle: "NeuropulAI ga xush kelibsiz",
    welcomeSubtitle: "AI o'rganish uchun geymifikatsiya platformasi",
    enterName: "Ismingizni kiriting",
    enterNameError: "Ismingizni kiriting!",
    startJourney: "Yo'lni boshlash",
    
    // Архетипы
    chooseArchetype: "Arxetipingizni tanlang",
    archetypeDescription: "Bu sizning o'tish uslubingizni belgilaydi",
    
    // Инструменты
    tools: "AI-Asboblar",
    useTools: "Ishlatish",
    premium: "Premium",
    locked: "Bloklangan",
    
    // Уровни и XP
    level: "Daraja",
    xp: "Tajriba",
    dailyBonus: "Kunlik bonus",
    streak: "Ketma-ketlik",
    
    // Premium
    upgradeToPremium: "Premium ga yangilash",
    premiumFeatures: "Premium imkoniyatlar",
    buyNow: "Hozir sotib olish",
    limitedOffer: "Cheklangan taklif!",
    
    // Сертификат
    certificate: "Sertifikat",
    downloadCertificate: "Sertifikatni yuklab olish",
    certificateUnlocked: "Sertifikat ochildi!",
    
    // Уведомления
    levelUp: "Daraja oshdi!",
    xpGained: "XP olindi",
    dailyBonusReceived: "Kunlik bonus olindi!",
    
    // Trae Awakens
    whoAreYou: "Sen kimsan?",
    lostSoul: "💀 Men yo'qolganman",
    lostSoulDesc: "AI nima ekanligini va nima uchun kerakligini bilmayman",
    wantToAwaken: "🚀 Uyg'onishni xohlayman",
    wantToAwakenDesc: "AI mahoratini o'rganishga tayyorman",
    alreadyKnow: "👽 Men allaqachon bilaman",
    alreadyKnowDesc: "AI nima ekanligini va qanday ishlatishni bilaman",
    describeExperience: "Yoki tajribangizni o'z so'zlaringiz bilan tasvirlang...",
    send: "Yuborish",
    stillHere: "Hey, hali ham shu yerdamisan? Boshlashimiz uchun yo'lingni tanla.",
    
    // Титулы
    titles: {
      novice: "Yangi boshlovchi",
      seeker: "Izlovchi",
      skilled: "Mohir",
      architect: "Arxitektor", 
      keeper: "AI Qo'riqchisi"
    }
  }
};

export const getTranslation = (key: string, lang: 'ru' | 'uz'): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return typeof value === 'string' ? value : key;
};