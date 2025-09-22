export interface QuizCompletionData {
  score: number;
  totalQuestions: number;
  accuracy: number;
  subscribeToBulletin: boolean;
}

export interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
}

export interface TrackingEvents {
  emailSubmitted: (subscribeToBulletin: boolean) => void;
  quizCompleted: (data: QuizCompletionData) => void;
  sneakPeekViewed: () => void;
  emailValidationError: (error: string) => void;
  mailchimpSubmissionAttempt: (email: string) => void;
  mailchimpSubmissionSuccess: (email: string) => void;
  mailchimpSubmissionError: (email: string, error: string) => void;
  socialShare?: (platform: string, score: number, tier: string) => void;
}
