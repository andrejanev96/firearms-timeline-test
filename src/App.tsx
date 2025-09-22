import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/stores/quizStore';
import { preloadImages } from '@/utils/images';
import { hapticFeedback } from '@/utils/haptics';
import IntroScreen from '@/components/sections/IntroScreen';
import Results from '@/components/sections/Results';
import FirearmCard from '@/components/ui/FirearmCard';
import ChronologicalSlots from '@/components/ui/ChronologicalSlots';
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
  selectedFirearm: Firearm | null;
  showTimeline: boolean;
  orderedFirearms: (Firearm | null)[];
}> = ({ firearmsList, onFirearmSelect, onPeriodSelect, selectedFirearm, showTimeline, orderedFirearms }) => {
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
    const distance = touchStart - currentTouch;
    
    if (Math.abs(distance) > 10) {
      e.preventDefault();
    }
    
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
          >
            ← Back
          </button>
          <div className="selected-firearm-info">
            <div className="selected-firearm-image">
              <img src={selectedFirearm?.image} alt={selectedFirearm?.name} />
            </div>
            <div className="selected-firearm-text">
              <h3>{selectedFirearm?.name}</h3>
              <p>Choose the correct time period</p>
            </div>
          </div>
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
                  if (!isOccupied) {
                    onPeriodSelect(index);
                    hapticFeedback('success');
                  } else {
                    hapticFeedback('error');
                  }
                }}
              >
                <div className="mobile-period-label">Position {index + 1}</div>
                <div className="mobile-period-years">
                  {isOccupied ? `Occupied by ${occupiedFirearm?.name}` : 'Available'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-card-container">
      <div className="mobile-progress">
        <div className="progress-dots">
          {firearmsList.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentCardIndex ? 'active' : ''} ${index < currentCardIndex ? 'completed' : ''}`}
            />
          ))}
        </div>
        <p className="progress-text">Card {currentCardIndex + 1} of {firearmsList.length}</p>
      </div>

      <div 
        className="card-stack"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {firearmsList.map((firearm, index) => {
          const offset = index - currentCardIndex;
          const isVisible = Math.abs(offset) <= 2;
          
          if (!isVisible) return null;

          return (
            <div
              key={firearm.id}
              className={`stacked-card ${offset === 0 ? 'current' : offset > 0 ? 'next' : 'prev'}`}
              style={{
                transform: `translateX(${offset * 20}px) translateY(${Math.abs(offset) * 5}px) scale(${1 - Math.abs(offset) * 0.05})`,
                zIndex: firearmsList.length - Math.abs(offset),
                opacity: offset === 0 ? 1 : 0.7 - Math.abs(offset) * 0.2
              }}
            >
              <FirearmCard
                firearm={firearm}
                isMobile={true}
                isTopCard={offset === 0}
                animationDelay={0}
                onClick={() => {
                  if (offset === 0) {
                    onFirearmSelect(firearm);
                    hapticFeedback('medium');
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mobile-navigation">
        <button 
          className="nav-btn prev-btn"
          onClick={() => {
            if (currentCardIndex > 0) {
              setCurrentCardIndex(currentCardIndex - 1);
              hapticFeedback('light');
            }
          }}
          disabled={currentCardIndex === 0}
        >
          ←
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
        <button 
          className="nav-btn next-btn"
          onClick={() => {
            if (currentCardIndex < firearmsList.length - 1) {
              setCurrentCardIndex(currentCardIndex + 1);
              hapticFeedback('light');
            }
          }}
          disabled={currentCardIndex === firearmsList.length - 1}
        >
          →
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
    completeQuiz
  } = useQuizStore();
  
  const [showQuizAnimation, setShowQuizAnimation] = useState(false);

  // Trigger animation when entering quiz section
  useEffect(() => {
    if (currentSection === 'quiz') {
      setShowQuizAnimation(true);
    }
  }, [currentSection]);

  // Check if mobile/tablet on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobile]);

  // Preload images (safe even if assets are pending)
  useEffect(() => {
    const imageUrls = firearms.map(firearm => firearm.image);
    preloadImages(imageUrls).then((results) => {
      if (import.meta.env.DEV) {
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Preloaded ${successCount}/${imageUrls.length} images`);
      }
    });
  }, []);

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

  // Show intro section
  if (currentSection === 'intro') {
    return <IntroScreen />;
  }

  // Show results section
  if (currentSection === 'results' && showResults) {
    return <Results />;
  }

  return (
    <motion.div 
      className="app"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: showQuizAnimation ? 1 : 0, y: showQuizAnimation ? 0 : 30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="title-with-flag">
            <svg className="american-flag" width="32" height="24" viewBox="0 0 32 24" fill="none">
              <rect width="32" height="24" fill="#B22234"/>
              <rect width="32" height="1.85" y="1.85" fill="white"/>
              <rect width="32" height="1.85" y="5.54" fill="white"/>
              <rect width="32" height="1.85" y="9.23" fill="white"/>
              <rect width="32" height="1.85" y="12.92" fill="white"/>
              <rect width="32" height="1.85" y="16.61" fill="white"/>
              <rect width="32" height="1.85" y="20.31" fill="white"/>
              <rect width="12.8" height="12.92" fill="#3C3B6E"/>
              <g fill="white">
                <circle cx="2.13" cy="1.85" r="0.5"/>
                <circle cx="6.4" cy="1.85" r="0.5"/>
                <circle cx="10.67" cy="1.85" r="0.5"/>
                <circle cx="4.27" cy="3.69" r="0.5"/>
                <circle cx="8.53" cy="3.69" r="0.5"/>
                <circle cx="2.13" cy="5.54" r="0.5"/>
                <circle cx="6.4" cy="5.54" r="0.5"/>
                <circle cx="10.67" cy="5.54" r="0.5"/>
                <circle cx="4.27" cy="7.38" r="0.5"/>
                <circle cx="8.53" cy="7.38" r="0.5"/>
                <circle cx="2.13" cy="9.23" r="0.5"/>
                <circle cx="6.4" cy="9.23" r="0.5"/>
                <circle cx="10.67" cy="9.23" r="0.5"/>
                <circle cx="4.27" cy="11.08" r="0.5"/>
                <circle cx="8.53" cy="11.08" r="0.5"/>
              </g>
            </svg>
            <h1>American Firearms Timeline Challenge</h1>
            <svg className="american-flag" width="32" height="24" viewBox="0 0 32 24" fill="none">
              <rect width="32" height="24" fill="#B22234"/>
              <rect width="32" height="1.85" y="1.85" fill="white"/>
              <rect width="32" height="1.85" y="5.54" fill="white"/>
              <rect width="32" height="1.85" y="9.23" fill="white"/>
              <rect width="32" height="1.85" y="12.92" fill="white"/>
              <rect width="32" height="1.85" y="16.61" fill="white"/>
              <rect width="32" height="1.85" y="20.31" fill="white"/>
              <rect width="12.8" height="12.92" fill="#3C3B6E"/>
              <g fill="white">
                <circle cx="2.13" cy="1.85" r="0.5"/>
                <circle cx="6.4" cy="1.85" r="0.5"/>
                <circle cx="10.67" cy="1.85" r="0.5"/>
                <circle cx="4.27" cy="3.69" r="0.5"/>
                <circle cx="8.53" cy="3.69" r="0.5"/>
                <circle cx="2.13" cy="5.54" r="0.5"/>
                <circle cx="6.4" cy="5.54" r="0.5"/>
                <circle cx="10.67" cy="5.54" r="0.5"/>
                <circle cx="4.27" cy="7.38" r="0.5"/>
                <circle cx="8.53" cy="7.38" r="0.5"/>
                <circle cx="2.13" cy="9.23" r="0.5"/>
                <circle cx="6.4" cy="9.23" r="0.5"/>
                <circle cx="10.67" cy="9.23" r="0.5"/>
                <circle cx="4.27" cy="11.08" r="0.5"/>
                <circle cx="8.53" cy="11.08" r="0.5"/>
              </g>
            </svg>
          </div>
          <p className="subtitle">
            Can you correctly order these 12 American-made firearms chronologically?
          </p>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-text">
              {bank.length} card{bank.length !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </header>

        {/* Mobile Card Stack Interface */}
        {isMobile ? (
          <MobileCardStack
            firearmsList={bank}
            onFirearmSelect={selectFirearm}
            onPeriodSelect={selectPosition}
            selectedFirearm={selectedFirearm}
            showTimeline={showMobileOrdering}
            orderedFirearms={orderedFirearms}
          />
        ) : (
          <div className="quiz-sections">
            {/* Desktop: Firearms Bank */}
            <section className="firearms-bank">
              <div className="firearms-bank-header">
                <h2 className={selectionMode ? 'hidden' : 'visible'}>
                  Click or drag the firearms to order them chronologically
                </h2>
                <div className={`selection-help ${selectionMode ? 'visible' : 'hidden'}`}>
                  <p>Selected: <strong>{selectedFirearm?.name || ''}</strong> - Click on a position on the timeline to place it, or click the firearm again to cancel.</p>
                </div>
              </div>
              <div className={`firearms-grid ${selectionMode ? 'selection-mode' : ''}`}>
                {bank.map((firearm, index) => (
                  <FirearmCard
                    key={firearm.id}
                    firearm={firearm}
                    isDragging={draggedFirearm?.id === firearm.id}
                    isSelected={selectedFirearm?.id === firearm.id}
                    isSelectionMode={selectionMode}
                    animationDelay={showQuizAnimation ? index * 0.05 + 0.2 : 0}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={selectFirearm}
                  />
                ))}
                {bank.length === 0 && (
                  <div className="empty-bank">
                    All firearms have been placed in chronological order!
                  </div>
                )}
              </div>
            </section>

            {/* Desktop: Chronological Ordering */}
            <section className={`chronological-section ${selectionMode ? 'selection-active' : ''}`}>
              <ChronologicalSlots
                orderedFirearms={orderedFirearms}
                onDrop={dropFirearm}
                onRemoveFirearm={removeFirearm}
                onPositionSelect={selectPosition}
                isSelectionMode={selectionMode}
                isHighlighted={selectionMode}
              />
            </section>
          </div>
        )}

        {/* Complete Button */}
        {isComplete && !isMobile && (
          <div className="complete-section">
            <button
              onClick={completeQuiz}
              className="complete-btn"
            >
              Complete Test & See Results
            </button>
          </div>
        )}

        {/* Mobile Complete Button */}
        {isComplete && isMobile && (
          <div className="mobile-complete-section">
            <div className="mobile-completion-message">
              <h2>🎉 Timeline Complete!</h2>
              <p>You've ordered all 12 American firearms. Ready to see your results?</p>
              <button
                onClick={completeQuiz}
                className="mobile-complete-btn"
              >
                Get My Results
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default App;
