/**
 * Breakpoint constants for responsive design
 */
export const BREAKPOINTS = {
  /** Mobile layout threshold - devices below this width use mobile interface */
  MOBILE_MAX: 1399,

  /** Tablet minimum width */
  TABLET_MIN: 768,

  /** Desktop minimum width */
  DESKTOP_MIN: 1024,

  /** Large desktop minimum width */
  DESKTOP_LARGE_MIN: 1200,
} as const;

/**
 * Quiz configuration constants
 */
export const QUIZ_CONFIG = {
  /** Total number of timeline slots */
  TIMELINE_SLOTS: 12,

  /** Maximum undo history depth */
  MAX_UNDO_HISTORY: 10,

  /** Minimum swipe distance in pixels for mobile gestures */
  MIN_SWIPE_DISTANCE: 50,

  /** Image viewer tooltip display duration in ms */
  VIEWER_TIP_DURATION: 3500,

  /** Info button pulse animation duration in ms */
  INFO_PULSE_DURATION: 1200,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  VIEWER_TIP_SEEN: 'viewerTipSeen',
  KEYBOARD_TIP_SEEN: 'keyboardTipSeen',
  QUIZ_PROGRESS: 'quizProgress',
} as const;