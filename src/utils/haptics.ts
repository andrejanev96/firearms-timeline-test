export const hapticFeedback = (type: 'light' | 'medium' | 'success' = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(20);
        break;
      case 'medium':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(20);
    }
  }
};