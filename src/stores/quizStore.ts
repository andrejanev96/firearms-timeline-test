import { create } from 'zustand';
import type { QuizStore, QuizResults, ResultAnswer, IncorrectAnswer } from '@/types/quiz';
import { firearms } from '@/data/firearms';
import { subscribeToMailChimp } from '@/utils/mailchimp';
import { trackQuizEvents } from '@/utils/analytics';
import { QUIZ_CONFIG, STORAGE_KEYS } from '@/constants/breakpoints';

// Fisher-Yates shuffle function for proper randomization
const secureRandomIndex = (limit: number): number => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const max = Math.floor(0x100000000 / limit) * limit;
    let value = 0;
    do {
      window.crypto.getRandomValues(array);
      value = array[0];
    } while (value >= max);
    return value % limit;
  }
  return Math.floor(Math.random() * limit);
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// LocalStorage persistence helpers
const saveProgressToStorage = (bank: typeof firearms, orderedFirearms: (typeof firearms[number] | null)[]) => {
  try {
    const progress = {
      bank: bank.map(f => f.id),
      orderedFirearms: orderedFirearms.map(f => f?.id || null),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save quiz progress:', error);
  }
};

const loadProgressFromStorage = (): { bank: typeof firearms; orderedFirearms: (typeof firearms[number] | null)[] } | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    if (!saved) return null;

    const progress = JSON.parse(saved);
    // Expire progress after 7 days
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - progress.timestamp > SEVEN_DAYS) {
      localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
      return null;
    }

    // Reconstruct firearms from IDs
    const bank = progress.bank
      .map((id: string) => firearms.find(f => f.id === id))
      .filter(Boolean);
    const orderedFirearms = progress.orderedFirearms.map((id: string | null) =>
      id ? firearms.find(f => f.id === id) || null : null
    );

    return { bank, orderedFirearms };
  } catch (error) {
    console.warn('Failed to load quiz progress:', error);
    return null;
  }
};

const clearProgressFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
  } catch (error) {
    console.warn('Failed to clear quiz progress:', error);
  }
};

// Load initial state with progress restoration
const loadedProgress = loadProgressFromStorage();
const initialBank = loadedProgress?.bank || shuffleArray(firearms);
const initialOrderedFirearms = loadedProgress?.orderedFirearms || Array(QUIZ_CONFIG.TIMELINE_SLOTS).fill(null);

const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state - try to restore progress, otherwise randomize
  bank: initialBank,
  orderedFirearms: initialOrderedFirearms,
  showResults: false,
  showSuccess: false,
  isLoading: false,
  results: null,
  draggedFirearm: null,
  selectedFirearm: null,
  selectionMode: false,
  isMobile: false,
  showMobileOrdering: false,
  resultsUnlocked: false,
  userEmail: undefined,
  currentSection: 'intro',
  // History for undo
  _history: [],
  historyLength: 0,

  // Actions
  setMobile: (isMobile: boolean) => {
    set({ isMobile });
  },

  setShowMobileOrdering: (value: boolean) => {
    set({ showMobileOrdering: value });
  },

  startQuiz: () => {
    set({ currentSection: 'quiz' });
  },

  selectFirearm: (firearm) => {
    const state = get();
    
    if (state.isMobile) {
      if (firearm === null) {
        // Mobile: Go back to card stack
        set({
          selectedFirearm: null,
          showMobileOrdering: false
        });
      } else {
        // Mobile: Show ordering overlay
        set({
          selectedFirearm: firearm,
          showMobileOrdering: true
        });
      }
    } else {
      // Desktop: Selection mode
      if (state.selectionMode && state.selectedFirearm?.id === firearm?.id) {
        set({
          selectedFirearm: null,
          selectionMode: false
        });
      } else {
        set({
          selectedFirearm: firearm,
          selectionMode: !!firearm
        });
      }
    }
  },

  selectPosition: (position: number) => {
    const state = get();
    if (!state.selectedFirearm) return;

    const firearm = state.selectedFirearm;

    // If position is occupied, allow swapping on both desktop and mobile

    state._pushHistory();
    set((state) => {
      const newBank = state.bank.filter(f => f.id !== firearm.id);
      const newOrderedFirearms = [...state.orderedFirearms];

      // Remove firearm from any existing position
      for (let i = 0; i < newOrderedFirearms.length; i++) {
        if (newOrderedFirearms[i]?.id === firearm.id) {
          newOrderedFirearms[i] = null;
        }
      }

      // If position is occupied, move that firearm back to bank
      if (newOrderedFirearms[position]) {
        newBank.push(newOrderedFirearms[position]!);
      }

      // Place firearm in new position
      newOrderedFirearms[position] = firearm;

      const sortedBank = newBank.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      // Save progress
      saveProgressToStorage(sortedBank, newOrderedFirearms);

      return {
        bank: sortedBank,
        orderedFirearms: newOrderedFirearms,
        selectedFirearm: null,
        selectionMode: false,
        showMobileOrdering: false,
      };
    });
  },

  setDraggedFirearm: (firearm) => {
    set({ draggedFirearm: firearm });
  },

  removeFirearm: (position) => {
    get()._pushHistory();
    set((state) => {
      const firearm = state.orderedFirearms[position];
      if (!firearm) return state;

      const newOrderedFirearms = [...state.orderedFirearms];
      newOrderedFirearms[position] = null;

      const sortedBank = [...state.bank, firearm].sort((a, b) => parseInt(a.id) - parseInt(b.id));

      // Save progress
      saveProgressToStorage(sortedBank, newOrderedFirearms);

      return {
        bank: sortedBank,
        orderedFirearms: newOrderedFirearms
      };
    });
  },

  dropFirearm: (firearm, position) => {
    get()._pushHistory();
    set((state) => {
      const newBank = state.bank.filter(f => f.id !== firearm.id);
      const newOrderedFirearms = [...state.orderedFirearms];

      // Remove firearm from any existing position
      for (let i = 0; i < newOrderedFirearms.length; i++) {
        if (newOrderedFirearms[i]?.id === firearm.id) {
          newOrderedFirearms[i] = null;
        }
      }

      // If position is occupied, move that firearm back to bank
      if (newOrderedFirearms[position]) {
        newBank.push(newOrderedFirearms[position]!);
      }

      // Place firearm in new position
      newOrderedFirearms[position] = firearm;

      const sortedBank = newBank.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      // Save progress
      saveProgressToStorage(sortedBank, newOrderedFirearms);

      return {
        bank: sortedBank,
        orderedFirearms: newOrderedFirearms,
        draggedFirearm: null,
        selectedFirearm: null,
        selectionMode: false,
      };
    });
  },

  completeQuiz: () => {
    const state = get();
    let correctCount = 0;
    const correctAnswers: ResultAnswer[] = [];
    const incorrectAnswers: IncorrectAnswer[] = [];

    state.orderedFirearms.forEach((firearm, position) => {
      if (firearm) {
        if (firearm.correctPosition === position) {
          correctCount++;
          correctAnswers.push({
            name: firearm.name,
            position: position + 1,
            year: firearm.year
          });
        } else {
          incorrectAnswers.push({
            name: firearm.name,
            userPosition: position + 1,
            correctPosition: firearm.correctPosition + 1,
            correctYear: firearm.year,
            description: firearm.description
          });
        }
      }
    });

    const results: QuizResults = {
      correctCount,
      totalCount: firearms.length,
      percentage: Math.round((correctCount / firearms.length) * 100),
      correctAnswers,
      incorrectAnswers
    };

    // Clear saved progress when quiz is completed
    clearProgressFromStorage();

    set({
      showResults: true,
      results,
      currentSection: 'results'
    });
  },

  unlockResults: async (email: string, subscribeToBulletin: boolean) => {
    const state = get();

    // Track analytics events
    trackQuizEvents.emailSubmitted(subscribeToBulletin);
    
    if (state.results) {
      trackQuizEvents.quizCompleted({
        score: state.results.correctCount,
        totalQuestions: state.results.totalCount,
        accuracy: state.results.percentage,
        subscribeToBulletin,
      });
    }

    try {
      // Handle MailChimp subscription (only if user opted in)
      if (subscribeToBulletin) {
        trackQuizEvents.mailchimpSubmissionAttempt(email);
        const success = await subscribeToMailChimp(email, subscribeToBulletin);
        
        if (success) {
          trackQuizEvents.mailchimpSubmissionSuccess(email);
        } else {
          trackQuizEvents.mailchimpSubmissionError(email, 'Subscription failed');
        }
      }
    } catch (error) {
      // Non-blocking - don't fail results unlock if MailChimp fails
      trackQuizEvents.mailchimpSubmissionError(email, error instanceof Error ? error.message : 'Unknown error');
    }

    set({
      resultsUnlocked: true,
      userEmail: email,
    });
  },

  resetQuiz: () => {
    // Clear saved progress when resetting
    clearProgressFromStorage();

    set({
      bank: shuffleArray(firearms),
      orderedFirearms: Array(QUIZ_CONFIG.TIMELINE_SLOTS).fill(null),
      showResults: false,
      showSuccess: false,
      isLoading: false,
      results: null,
      draggedFirearm: null,
      selectedFirearm: null,
      selectionMode: false,
      showMobileOrdering: false,
      resultsUnlocked: false,
      userEmail: undefined,
      currentSection: 'intro',
      _history: [],
      historyLength: 0,
    });
  },

  // Internal: save snapshot for undo
  _pushHistory: () => {
    const state = get();
    const snapshot = {
      bank: [...state.bank],
      orderedFirearms: [...state.orderedFirearms] as (typeof state.orderedFirearms[number])[],
    };
    const next = [...(state._history || []), snapshot].slice(-QUIZ_CONFIG.MAX_UNDO_HISTORY);
    set({ _history: next, historyLength: next.length });
  },

  undoLast: () => {
    const state = get();
    const hist = state._history || [];
    if (hist.length === 0) return;
    const prev = hist[hist.length - 1];
    const nextHist = hist.slice(0, -1);
    set({
      bank: [...prev.bank],
      orderedFirearms: [...prev.orderedFirearms],
      selectedFirearm: null,
      selectionMode: false,
      draggedFirearm: null,
      historyLength: nextHist.length,
      _history: nextHist,
    });
  },

  shuffleAndRetry: () => {
    // Clear saved progress when starting fresh
    clearProgressFromStorage();

    // Use the shared shuffle function for consistency
    const shuffled = shuffleArray(firearms);
    set({
      bank: shuffled,
      orderedFirearms: Array(QUIZ_CONFIG.TIMELINE_SLOTS).fill(null),
      showResults: false,
      showSuccess: false,
      isLoading: false,
      results: null,
      draggedFirearm: null,
      selectedFirearm: null,
      selectionMode: false,
      showMobileOrdering: false,
      resultsUnlocked: false,
      userEmail: undefined,
      currentSection: 'quiz',
      _history: [],
      historyLength: 0,
    });
  },
}));

export { useQuizStore };
