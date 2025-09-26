import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/stores/quizStore';
import { preloadImages } from '@/utils/images';
import { hapticFeedback } from '@/utils/haptics';
import IntroScreen from '@/components/sections/IntroScreen';
import Results from '@/components/sections/Results';
import FirearmCard from '@/components/ui/FirearmCard';
import ChronologicalSlots from '@/components/ui/ChronologicalSlots';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { firearms } from '@/data/firearms';
import type { Firearm } from '@/types/quiz';
import './App.css';
import './styles/intro.css';
import './styles/results.css';
import './styles/chronological.css';

// Mobile Card Stack Component
const MobileCardStack: React.FC<{
  firearmsList: Firearm[];
  onFirearmSelect: (firearm: Firearm | null) => void;
  onPeriodSelect: (periodIndex: number) => void;
  onRemovePosition: (periodIndex: number) => void;
  onOpenTimeline: () => void;
  onComplete: () => void;
  selectedFirearm: Firearm | null;
  showTimeline: boolean;
  orderedFirearms: (Firearm | null)[];
}> = ({ firearmsList, onFirearmSelect, onPeriodSelect, onRemovePosition, onOpenTimeline, onComplete, selectedFirearm, showTimeline, orderedFirearms }) => {
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

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
      setCurrentCardIndex(currentCardIndex + 1);
      hapticFeedback('light');
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      hapticFeedback('light');
    }
  };

  const currentFirearm = firearmsList[currentCardIndex];

  if (showTimeline) {
    return (
      <div className="mobile-timeline-overlay">
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
                <p>Choose the correct time period</p>
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
              <div
                key={index}
                className={`mobile-timeline-period ${isOccupied ? 'occupied' : 'available'}`}
                onClick={() => {
                  // Allow selecting either empty or occupied (swap) when a firearm is selected
                  if (selectedFirearm) {
                    onPeriodSelect(index);
                    hapticFeedback('success');
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
              </div>
            );
          })}
        </div>
      </div>
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
                setCurrentCardIndex(currentCardIndex - 1);
                hapticFeedback('light');
              }
            }}
            disabled={currentCardIndex === 0}
            tabIndex={currentCardIndex === 0 ? -1 : 0}
          >
            ←
          </button>
          <div className="media-shell">
            <FirearmCard
              firearm={currentFirearm}
              isMobile={true}
              isTopCard
              hideName={true}
              onClick={() => {
                onFirearmSelect(currentFirearm);
                hapticFeedback('medium');
              }}
            />
          </div>
          <button 
            className="nav-btn next-btn"
            aria-label="Next card"
            onClick={(e) => {
              e.stopPropagation();
              if (currentCardIndex < firearmsList.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
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
        <div className="swipe-hint-row">👈 Swipe to browse • Tap to select 👆</div>
      </div>

      <div className="mobile-navigation">
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


// Main App Component
const App: React.FC = () => {
  const {
    bank,
    orderedFirearms,
    showResults,
    draggedFirearm,
    selectedFirearm,
    selectionMode,
    isMobile,
    showMobileOrdering,
    currentSection,
    setMobile,
    selectFirearm,
    selectPosition,
    setDraggedFirearm,
    removeFirearm,
    dropFirearm,
    completeQuiz,
    setShowMobileOrdering
  } = useQuizStore();
  const timelineSectionRef = useRef<HTMLElement | null>(null);
  
  const [showQuizAnimation, setShowQuizAnimation] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItems, setViewerItems] = useState<Firearm[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerReturnFocusRef = useRef<HTMLElement | null>(null);
  // First-load tooltip for discoverability
  const [showViewerTip, setShowViewerTip] = useState(false);
  const viewerTipTimerRef = useRef<number | null>(null);

  // Trigger animation when entering quiz section
  useEffect(() => {
    if (currentSection === 'quiz') {
      setShowQuizAnimation(true);
    }
  }, [currentSection]);

  // Check if mobile/tablet on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      // Force mobile layout for:
      // 1. Screen width <= 1399px (covers most tablets/smaller desktops)
      // 2. Touch-capable devices (tablets, phones)
      // 3. Devices with coarse pointer (touch-based)
      const isMobileLayout =
        window.innerWidth <= 1399 ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      setMobile(isMobileLayout);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobile]);

  // Preload images (safe even if assets are pending)
  useEffect(() => {
    const imageUrls = firearms.map(firearm => firearm.image);
    preloadImages(imageUrls).then(() => {
      // Images preloaded successfully
    });
  }, []);

  // Discoverability tooltip on first page load
  useEffect(() => {
    const shown = localStorage.getItem('viewerTipSeen');
    if (!shown) {
      setShowViewerTip(true);
      viewerTipTimerRef.current = window.setTimeout(() => {
        setShowViewerTip(false);
        localStorage.setItem('viewerTipSeen', '1');
      }, 3500);
    }
    return () => {
      if (viewerTipTimerRef.current) window.clearTimeout(viewerTipTimerRef.current);
    };
  }, []);

  const markViewerTipSeen = () => {
    if (viewerTipTimerRef.current) window.clearTimeout(viewerTipTimerRef.current);
    setShowViewerTip(false);
    localStorage.setItem('viewerTipSeen', '1');
  };

  // Viewer wiring
  const openViewer = (items: Firearm[], index: number, returnFocusEl?: HTMLElement | null) => {
    setViewerItems(items);
    setViewerIndex(index);
    viewerReturnFocusRef.current = returnFocusEl ?? null;
    setViewerOpen(true);
    markViewerTipSeen();
  };
  const closeViewer = () => setViewerOpen(false);
  const handleNavigate = (nextIndex: number) => setViewerIndex(nextIndex);


  // Calculate progress
  const totalPlaced = orderedFirearms.filter(f => f !== null).length;
  const progress = (totalPlaced / firearms.length) * 100;
  const isComplete = totalPlaced === firearms.length;

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, firearm: Firearm) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(firearm));
    setDraggedFirearm(firearm);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedFirearm(null);
  };

  // Completion flow
  const handleComplete = () => setShowConfirm(true);
  const confirmComplete = () => { setShowConfirm(false); completeQuiz(); };
  const cancelComplete = () => setShowConfirm(false);

  // Show intro section
  if (currentSection === 'intro') {
    return <IntroScreen />;
  }

  // Show results section
  if (currentSection === 'results' && showResults) {
    return <Results />;
  }

  return (
    <>
    <motion.div 
      className="app"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: showQuizAnimation ? 1 : 0, y: showQuizAnimation ? 0 : 30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className={`progress-fill ${bank.length === 0 ? 'complete' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`progress-text ${bank.length === 0 ? 'complete' : ''}`}>
            {bank.length === 0
              ? 'Bullseye! All firearms placed'
              : `${bank.length} card${bank.length !== 1 ? 's' : ''} remaining`}
          </p>
        </div>

        {/* Mobile Card Stack Interface */}
        {(isMobile || window.innerWidth <= 1399 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) ? (
          <MobileCardStack
            firearmsList={bank}
            onFirearmSelect={selectFirearm}
            onPeriodSelect={selectPosition}
            onRemovePosition={removeFirearm}
            onOpenTimeline={() => setShowMobileOrdering(true)}
            onComplete={handleComplete}
            selectedFirearm={selectedFirearm}
            showTimeline={showMobileOrdering}
            orderedFirearms={orderedFirearms}
          />
        ) : (
          <div className="quiz-sections">
            {/* Desktop: Firearms Bank */}
            <section className="firearms-bank">
              {bank.length > 0 && (
                <div className="firearms-bank-header">
                  <h2 className={selectionMode ? 'hidden' : 'visible'}>
                    Click or drag the firearms to order them chronologically
                  </h2>
                  <div className={`selection-help ${selectionMode ? 'visible' : 'hidden'}`}>
                    <p>Selected: <strong>{selectedFirearm?.name || ''}</strong> - Click on a position on the timeline to place it, or click the firearm again to cancel.</p>
                  </div>
                </div>
              )}
              {bank.length > 0 && (
                <div className={`firearms-grid ${selectionMode ? 'selection-mode' : ''}`}>
                  {bank.map((firearm, index) => (
                    <FirearmCard
                      key={firearm.id}
                      firearm={firearm}
                      isDragging={draggedFirearm?.id === firearm.id}
                      isSelected={selectedFirearm?.id === firearm.id}
                      isSelectionMode={selectionMode}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={selectFirearm}
                      openViewer={openViewer}
                      viewerItems={bank}
                      viewerIndex={index}
                    />
                  ))}
                </div>
              )}
                {bank.length === 0 && (
                  <div className="empty-bank">
                    <div className="empty-bank-content">
                      <h3>All firearms placed!</h3>
                      <p>Review your timeline and complete when ready.</p>
                      <button
                        onClick={handleComplete}
                        className="complete-btn"
                      >
                        Complete Test & See Results
                      </button>
                    </div>
                  </div>
                )}
              {/* Discoverability tooltip below the bank on first load */}
              {showViewerTip && (
                <div className="viewer-tip" role="status" aria-live="polite">
                  Tip: Click any firearm image to view it larger.
                </div>
              )}
            </section>

            {/* Desktop: Chronological Ordering */}
            <section ref={timelineSectionRef as React.RefObject<HTMLDivElement>} className={`chronological-section ${selectionMode ? 'selection-active' : ''}`}>
              {/* Completion Encouragement */}
              {bank.length > 0 && bank.length <= 3 && (
                <div className="completion-encouragement">
                  {bank.length === 1 ? (
                    <p>🎯 Almost there — just 1 more card!</p>
                  ) : (
                    <p>🎯 Almost there — just {bank.length} more cards!</p>
                  )}
                </div>
              )}

              <ChronologicalSlots
                orderedFirearms={orderedFirearms}
                onDrop={dropFirearm}
                onRemoveFirearm={removeFirearm}
                onPositionSelect={selectPosition}
                isSelectionMode={selectionMode}
                isHighlighted={selectionMode}
                openViewer={openViewer}
              />
            </section>
          </div>
        )}


        {/* Mobile Complete CTA (non-blocking) */}
        {isComplete && (isMobile || window.innerWidth <= 1399 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) && bank.length > 0 && (
          <div className="mobile-complete-cta">
            <button
              onClick={handleComplete}
              className="mobile-complete-btn"
            >
              Complete Challenge
            </button>
          </div>
        )}
      </div>
      {showConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-dialog">
            <h3 id="confirm-title">Complete Challenge?</h3>
            <p>You can no longer edit once you continue to results.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={cancelComplete}>Cancel</button>
              <button className="btn-primary" onClick={confirmComplete}>Yes, Complete</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
    {/* Image Viewer Modal */}
    <ImageViewerModal
      open={viewerOpen}
      items={viewerItems}
      index={viewerIndex}
      onClose={closeViewer}
      onNavigate={handleNavigate}
      loop={true}
      returnFocusEl={viewerReturnFocusRef.current}
    />
    </>
  );
};

export default App;
