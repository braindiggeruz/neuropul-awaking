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
  userName?: string; // For backward compatibility
  dailyStreak?: number;
  lastVisit?: string;
  toolsUsed?: string[];
  isPremium?: boolean;
  premiumTier?: 'none' | 'basic' | 'pro' | 'master';
  fomoStart?: string | null;
  hasSeenFomo?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  language?: 'ru' | 'uz';
  refCode?: string | null;
  referralUsed?: boolean;
  dailyXPDate?: string;
  certificateIssued?: boolean;
  questStep?: number;
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
  premiumTier?: 'basic' | 'pro' | 'master';
}

export interface PremiumTier {
  id: 'basic' | 'pro' | 'master';
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
  ru: Record<string, any>;
  uz: Record<string, any>;
}