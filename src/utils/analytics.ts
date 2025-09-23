import type { TrackingEvents, QuizCompletionData } from '@/types/analytics';

// Define window types for analytics services
interface WindowWithAnalytics extends Window {
  gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  mixpanel?: {
    track: (event: string, properties?: Record<string, unknown>) => void;
  };
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
  };
}

// Analytics tracking implementation
// This is a placeholder implementation - replace with your actual analytics service
const trackEvent = (event: string, data?: Record<string, unknown>) => {
  const win = window as WindowWithAnalytics;

  // Example implementations:
  // Google Analytics 4
  if (typeof window !== 'undefined' && win.gtag) {
    win.gtag('event', event, data);
  }

  // Mixpanel
  if (typeof window !== 'undefined' && win.mixpanel) {
    win.mixpanel.track(event, data);
  }

  // Posthog
  if (typeof window !== 'undefined' && win.posthog) {
    win.posthog.capture(event, data);
  }
  
  // Analytics events are tracked silently
};

export const trackQuizEvents: TrackingEvents = {
  emailSubmitted: (subscribeToBulletin: boolean) => {
    trackEvent('quiz_email_submitted', {
      subscribed_to_bulletin: subscribeToBulletin,
      timestamp: new Date().toISOString(),
    });
  },

  quizCompleted: (data: QuizCompletionData) => {
    trackEvent('quiz_completed', {
      score: data.score,
      total_questions: data.totalQuestions,
      accuracy_percentage: data.accuracy,
      subscribed_to_bulletin: data.subscribeToBulletin,
      timestamp: new Date().toISOString(),
    });
  },

  sneakPeekViewed: () => {
    trackEvent('quiz_sneak_peek_viewed', {
      timestamp: new Date().toISOString(),
    });
  },

  emailValidationError: (error: string) => {
    trackEvent('quiz_email_validation_error', {
      error_type: error,
      timestamp: new Date().toISOString(),
    });
  },

  mailchimpSubmissionAttempt: (email: string) => {
    const emailParts = email.split('@');
    trackEvent('mailchimp_submission_attempt', {
      email_domain: emailParts.length > 1 ? emailParts[1] : 'unknown',
      timestamp: new Date().toISOString(),
    });
  },

  mailchimpSubmissionSuccess: (email: string) => {
    const emailParts = email.split('@');
    trackEvent('mailchimp_submission_success', {
      email_domain: emailParts.length > 1 ? emailParts[1] : 'unknown',
      timestamp: new Date().toISOString(),
    });
  },

  mailchimpSubmissionError: (email: string, error: string) => {
    const emailParts = email.split('@');
    trackEvent('mailchimp_submission_error', {
      email_domain: emailParts.length > 1 ? emailParts[1] : 'unknown',
      error: error,
      timestamp: new Date().toISOString(),
    });
  },
  socialShare: (platform: string, score: number, tier: string) => {
    trackEvent('social_share', {
      platform,
      score,
      tier,
      timestamp: new Date().toISOString(),
    });
  },
};
