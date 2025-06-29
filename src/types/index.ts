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