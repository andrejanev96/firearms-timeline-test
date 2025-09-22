import { create } from 'zustand';
import type { QuizStore, QuizResults, ResultAnswer, IncorrectAnswer } from '@/types/quiz';
import { firearms } from '@/data/firearms';
import { subscribeToMailChimp } from '@/utils/mailchimp';
import { trackQuizEvents } from '@/utils/analytics';

const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  bank: firearms,
  orderedFirearms: Array(12).fill(null),
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

    // Check if position is occupied (reject placement for occupied positions)
    if (state.orderedFirearms[position] !== null) {
      // Position is occupied - reject placement and provide feedback
      if (state.isMobile) {
        // On mobile, stay in selection mode and show error feedback
        // TODO: Add error feedback mechanism
        return;
      } else {
        // On desktop, allow swapping (existing behavior)
        // Continue with swap logic below
      }
    }

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

      // If position is occupied and we're on desktop, move that firearm back to bank
      if (newOrderedFirearms[position] && !state.isMobile) {
        newBank.push(newOrderedFirearms[position]!);
      }

      // Place firearm in new position
      newOrderedFirearms[position] = firearm;

      return {
        bank: newBank.sort((a, b) => parseInt(a.id) - parseInt(b.id)),
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
      
      return {
        bank: [...state.bank, firearm].sort((a, b) => parseInt(a.id) - parseInt(b.id)),
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
      
      return {
        bank: newBank.sort((a, b) => parseInt(a.id) - parseInt(b.id)),
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
    set({
      bank: firearms,
      orderedFirearms: Array(12).fill(null),
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
    const MAX = 10;
    const next = [...(state._history || []), snapshot].slice(-MAX);
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
    const shuffled = [...firearms].sort(() => Math.random() - 0.5);
    set({
      bank: shuffled,
      orderedFirearms: Array(12).fill(null),
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
