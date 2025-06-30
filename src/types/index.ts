export interface UserProgress {
  name: string;
  archetype: string | null;
  avatarUrl: string;
  xp: number;
  level: number;
  prophecy: string;
  awakened: boolean;
  createdAt: string;
  lastActive: string;
  language?: 'ru' | 'uz';
  userName?: string; // For backward compatibility
  dailyStreak?: number;
  toolsUsed?: string[];
  isPremium?: boolean;
  premiumTier?: string;
  questStep?: number;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  fomoStart?: string | null;
  hasSeenFomo?: boolean;
  referralUsed?: boolean;
  dailyXPDate?: string;
  certificateIssued?: boolean;
  lastVisit?: string;
  refCode?: string | null;
  version?: string;
}

export interface ArchetypeResult {
  type: string;
  description: string;
  CTA: string;
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  weight: {
    warrior: number;
    mage: number;
    seeker: number;
    shadow: number;
  };
}

export interface QuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  completed: boolean;
  scores: {
    warrior: number;
    mage: number;
    seeker: number;
    shadow: number;
  };
}

export interface PDFData {
  name: string;
  archetype: string;
  prophecy: string;
  avatarUrl: string;
  xp: number;
  certificateId: string;
  date: string;
}

export interface ArchetypeData {
  id: string;
  name: { ru: string; uz: string };
  icon: string;
  description: { ru: string; uz: string };
  color: string;
  gradient: string;
  phrases: {
    ru: string[];
    uz: string[];
  };
}

export interface AITool {
  id: string;
  name: { ru: string; uz: string };
  icon: string;
  description: { ru: string; uz: string };
  xpReward: number;
  isPremium: boolean;
  premiumTier?: string;
}

export interface PremiumTier {
  id: string;
  name: { ru: string; uz: string };
  price: number;
  originalPrice: number;
  color: string;
  popular?: boolean;
  features: {
    ru: string[];
    uz: string[];
  };
}

export interface Translations {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
}