export interface EmailFormData {
  email: string;
  subscribeToBulletin: boolean;
}

export interface Firearm {
  id: string;
  name: string;
  description: string;
  correctPosition: number;
  year: number;
  image: string;
  imageLarge?: string;
  // Optional fields used in some UIs (e.g., Results viewer)
  correct?: boolean;
  fact?: string;
  facts?: string[];
}

export interface QuizResults {
  correctCount: number;
  totalCount: number;
  percentage: number;
  correctAnswers: ResultAnswer[];
  incorrectAnswers: IncorrectAnswer[];
}

export interface ResultAnswer {
  name: string;
  position: number;
  year: number;
}

export interface IncorrectAnswer {
  name: string;
  userPosition: number;
  correctPosition: number;
  correctYear: number;
  description: string;
}

export interface QuizState {
  bank: Firearm[];
  orderedFirearms: (Firearm | null)[];
  showResults: boolean;
  showSuccess: boolean;
  isLoading: boolean;
  results: QuizResults | null;
  draggedFirearm: Firearm | null;
  selectedFirearm: Firearm | null;
  selectionMode: boolean;
  isMobile: boolean;
  showMobileOrdering: boolean;
  resultsUnlocked?: boolean;
  userEmail?: string;
  currentSection: 'intro' | 'quiz' | 'results';
  historyLength?: number;
  _history?: { bank: Firearm[]; orderedFirearms: (Firearm | null)[] }[];
}

export interface QuizActions {
  setMobile: (isMobile: boolean) => void;
  setShowMobileOrdering: (value: boolean) => void;
  startQuiz: () => void;
  selectFirearm: (firearm: Firearm | null) => void;
  selectPosition: (position: number) => void;
  setDraggedFirearm: (firearm: Firearm | null) => void;
  removeFirearm: (position: number) => void;
  dropFirearm: (firearm: Firearm, position: number) => void;
  completeQuiz: () => void;
  unlockResults: (email: string, subscribeToBulletin: boolean) => Promise<void>;
  resetQuiz: () => void;
  _pushHistory: () => void;
  undoLast: () => void;
  shuffleAndRetry: () => void;
}

export type QuizStore = QuizState & QuizActions;
