import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hapticFeedback } from '@/utils/haptics';
import FirearmCard from '@/components/ui/FirearmCard';
import { QUIZ_CONFIG } from '@/constants/breakpoints';
import type { Firearm } from '@/types/quiz';

interface MobileCardStackProps {
  firearmsList: Firearm[];
  onFirearmSelect: (firearm: Firearm | null) => void;
  onPeriodSelect: (periodIndex: number) => void;
  onRemovePosition: (periodIndex: number) => void;
  onOpenTimeline: () => void;
  onComplete: () => void;
  selectedFirearm: Firearm | null;
  showTimeline: boolean;
  orderedFirearms: (Firearm | null)[];
  openViewer: (firearm: Firearm, returnFocusEl?: HTMLElement | null) => void;
}

const MobileCardStack: React.FC<MobileCardStackProps> = ({
  firearmsList,
  onFirearmSelect,
  onPeriodSelect,
  onRemovePosition,
  onOpenTimeline,
  onComplete,
  selectedFirearm,
  showTimeline,
  orderedFirearms,
  openViewer
}) => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = React.useState<'forward' | 'backward'>('forward');

  const minSwipeDistance = QUIZ_CONFIG.MIN_SWIPE_DISTANCE;

  React.useEffect(() => {
    if (currentCardIndex >= firearmsList.length) {
      setCurrentCardIndex(Math.max(0, firearmsList.length - 1));
    }
  }, [firearmsList.length, currentCardIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = e.targetTouches[0].clientX;

    // CSS touch-action handles scroll prevention instead of preventDefault()
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentCardIndex < firearmsList.length - 1) {
      setSwipeDirection('forward');
      setCurrentCardIndex((prev) => Math.min(prev + 1, firearmsList.length - 1));
      hapticFeedback('light');
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setSwipeDirection('backward');
      setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
      hapticFeedback('light');
    }
  };

  const currentFirearm = firearmsList[currentCardIndex];

  const cardVariants = React.useMemo(() => ({
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 56 : -56,
      opacity: 0,
      rotate: direction === 'forward' ? 1.8 : -1.8,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -48 : 48,
      opacity: 0,
      rotate: direction === 'forward' ? -1.8 : 1.8,
      scale: 0.97,
    }),
  }), []);

  if (showTimeline) {
    return (
      <motion.div
        className="mobile-timeline-overlay"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="mobile-timeline-header">
          <button
            className="back-btn"
            onClick={() => {
              onFirearmSelect(null);
              hapticFeedback('light');
            }}
            aria-label="Back"
          >
            ←
          </button>
          {selectedFirearm ? (
            <div className="selected-firearm-info">
              <div className="selected-firearm-image">
                <img src={selectedFirearm?.image} alt={selectedFirearm?.name} />
              </div>
              <div className="selected-firearm-text">
                <h3>{selectedFirearm?.name}</h3>
                <p>Order from earliest to latest</p>
              </div>
            </div>
          ) : (
            <div className="selected-firearm-text" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>Timeline Review</h3>
              <p>Tap a position to view or swap after selecting a firearm.</p>
            </div>
          )}
        </div>
        <div className="mobile-timeline-periods">
          {Array.from({length: 12}, (_, index) => {
            const isOccupied = orderedFirearms[index] !== null;
            const occupiedFirearm = orderedFirearms[index];

            return (
              <motion.div
                key={index}
                className={`mobile-timeline-period ${isOccupied ? 'occupied' : 'available'}`}
                data-period-index={index}
                layout
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                onClick={(e) => {
                  // Allow selecting either empty or occupied (swap) when a firearm is selected
                  if (selectedFirearm) {
                    onPeriodSelect(index);
                    hapticFeedback('success');
                    // Trigger placement animation
                    const target = e.currentTarget as HTMLElement;
                    target.classList.add('placement-success');
                    setTimeout(() => target.classList.remove('placement-success'), 600);
                  }
                }}
              >
                <div className="mobile-period-label">Position {index + 1}</div>
                {isOccupied ? (
                  <div className="mobile-period-occupied">
                    <div className="mobile-period-content">{occupiedFirearm?.name}</div>
                    <button
                      className="remove-period-btn mobile-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePosition(index);
                        hapticFeedback('light');
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="mobile-period-content">Available</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // If all cards placed, show centered completion prompt with Timeline shortcut
  if (firearmsList.length === 0) {
    return (
      <div className="mobile-card-container">
        <div className="empty-stack-panel">
          <h3>All cards placed</h3>
          <p>You can still review or change your answers.</p>
          <div className="empty-stack-actions">
            <button className="timeline-btn" onClick={onOpenTimeline}>Timeline</button>
            <button className="mobile-complete-btn" onClick={onComplete}>Complete Challenge</button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: if no current firearm, don't render the card interface
  if (!currentFirearm) {
    return (
      <div className="mobile-card-container">
        <div className="empty-stack-panel">
          <h3>No more cards</h3>
          <p>All firearms have been placed or there are no cards available.</p>
          <div className="empty-stack-actions">
            <button className="timeline-btn" onClick={onOpenTimeline}>Timeline</button>
            <button className="mobile-complete-btn" onClick={onComplete}>Complete Challenge</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-card-container">
      {/* Progress hidden on mobile/tablet to free space */}

      <div className="mobile-main">
        <div className="image-nav-wrap" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <button
            className="nav-btn prev-btn"
            aria-label="Previous card"
            onClick={(e) => {
              e.stopPropagation();
              if (currentCardIndex > 0) {
                setSwipeDirection('backward');
                setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
                hapticFeedback('light');
              }
            }}
            disabled={currentCardIndex === 0}
            tabIndex={currentCardIndex === 0 ? -1 : 0}
          >
            ←
          </button>
          <div className="media-shell">
            <AnimatePresence initial={false} mode="popLayout" custom={swipeDirection}>
              <motion.div
                key={currentFirearm?.id ?? 'placeholder-card'}
                className="mobile-card-motion-wrapper"
                custom={swipeDirection}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.55 }}
                onTouchStart={() => hapticFeedback('light')}
                whileTap={{ scale: 0.98 }}
              >
                <FirearmCard
                  firearm={currentFirearm}
                  isMobile={true}
                  isTopCard
                  hideName={true}
                  openViewer={openViewer}
                  onClick={() => {
                    onFirearmSelect(currentFirearm);
                    hapticFeedback('medium');
                  }}
                />
              </motion.div>
            </AnimatePresence>
            <button
              type="button"
              className="view-image-btn"
              aria-label="View full image"
              onClick={() => {
                if (currentFirearm) {
                  openViewer(currentFirearm);
                  hapticFeedback('light');
                }
              }}
            >
              🔍
            </button>
          </div>
          <button
            className="nav-btn next-btn"
            aria-label="Next card"
            onClick={(e) => {
              e.stopPropagation();
              if (currentCardIndex < firearmsList.length - 1) {
                setSwipeDirection('forward');
                setCurrentCardIndex((prev) => Math.min(prev + 1, firearmsList.length - 1));
                hapticFeedback('light');
              }
            }}
            disabled={currentCardIndex === firearmsList.length - 1}
            tabIndex={currentCardIndex === firearmsList.length - 1 ? -1 : 0}
          >
            →
          </button>
        </div>

        {/* Title below the image container to avoid affecting container height */}
        <div className="mobile-image-title">{currentFirearm?.name}</div>

        {/* Hint above the primary action */}
        <motion.div
          className="swipe-hint-row"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          👈 Swipe to browse • Tap to select 👆
        </motion.div>
      </div>

      <div className="mobile-navigation">
        <button
          className="timeline-btn"
          onClick={() => {
            onOpenTimeline();
            hapticFeedback('light');
          }}
          aria-label="View Timeline"
        >
          📋 Timeline
        </button>
        <button
          className="select-btn"
            onClick={() => {
            onFirearmSelect(currentFirearm);
            hapticFeedback('medium');
          }}
        >
          Select This Firearm
        </button>
      </div>
    </div>
  );
};

export default MobileCardStack;
