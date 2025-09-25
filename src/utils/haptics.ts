export const hapticFeedback = (type: 'light' | 'medium' | 'success' | 'strong' | 'error' = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'strong':
        navigator.vibrate([30, 10, 30]);
        break;
      case 'success':
        navigator.vibrate([50, 20, 50, 20, 100]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

// Helper to check if device supports haptics
export const supportsHaptics = (): boolean => {
  return 'vibrate' in navigator &&
         ('ontouchstart' in window || navigator.maxTouchPoints > 0);
};