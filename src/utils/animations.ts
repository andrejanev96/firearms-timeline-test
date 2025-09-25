// Animation utilities for tablet interactions
export const addTemporaryClass = (
  element: HTMLElement | null,
  className: string,
  duration: number = 1000
): void => {
  if (!element) return;

  element.classList.add(className);

  // Remove the class after the specified duration
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
};

// Add animation class and trigger haptic feedback
export const triggerPlacementAnimation = (element: HTMLElement | null): void => {
  if (!element) return;

  // Add the animation class for 1.8 seconds (matches slideInPlace + gentlePulse duration)
  addTemporaryClass(element, 'newly-placed', 1800);
};