import type { TrackingEvents, QuizCompletionData } from '@/types/analytics';

// Analytics tracking implementation
// This is a placeholder implementation - replace with your actual analytics service
const trackEvent = (event: string, data?: Record<string, any>) => {
  // Example implementations:
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
  
  // Mixpanel
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(event, data);
  }
  
  // Posthog
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(event, data);
  }
  
  // Console logging for development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', event, data);
  }
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
    trackEvent('mailchimp_submission_attempt', {
      email_domain: email.split('@')[1],
      timestamp: new Date().toISOString(),
    });
  },

  mailchimpSubmissionSuccess: (email: string) => {
    trackEvent('mailchimp_submission_success', {
      email_domain: email.split('@')[1],
      timestamp: new Date().toISOString(),
    });
  },

  mailchimpSubmissionError: (email: string, error: string) => {
    trackEvent('mailchimp_submission_error', {
      email_domain: email.split('@')[1],
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
