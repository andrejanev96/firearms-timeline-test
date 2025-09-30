import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Firearm } from '@/types/quiz';
import FirearmCard from './FirearmCard';

interface ChronologicalSlotsProps {
  orderedFirearms: (Firearm | null)[];
  onDrop: (firearm: Firearm, position: number) => void;
  onRemoveFirearm: (position: number) => void;
  onPositionSelect: (position: number) => void;
  isSelectionMode: boolean;
  isHighlighted: boolean;
  openViewer?: (firearm: Firearm, returnFocusEl?: HTMLElement | null) => void;
}

const ChronologicalSlots: React.FC<ChronologicalSlotsProps> = React.memo(({
  orderedFirearms,
  onDrop,
  onRemoveFirearm,
  onPositionSelect,
  isSelectionMode,
  isHighlighted,
  openViewer
}) => {
  const [dragOverPosition, setDragOverPosition] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<number | null>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);


  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(null);

    try {
      const firearmData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onDrop(firearmData, position);
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handlePositionClick = (position: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to container
    if (isSelectionMode) {
      onPositionSelect(position);
    }
  };

  const handlePositionKeyDown = (position: number, e: React.KeyboardEvent) => {
    if (!isSelectionMode) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPositionSelect(position);
    }
  };

  const handleFirearmClick = (position: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSelectionMode) {
      onRemoveFirearm(position);
    }
  };

  // Touch handlers for individual slots
  const handleSlotTouchStart = (_position: number, e: React.TouchEvent) => {
    if (isSelectionMode) {
      e.stopPropagation(); // Prevent timeline scroll
    }
  };

  const handleSlotTouchEnd = (position: number, e: React.TouchEvent) => {
    if (isSelectionMode) {
      e.stopPropagation(); // Prevent timeline scroll
      onPositionSelect(position);
    }
  };

  // Scroll navigation functions
  const scrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === timelineRef.current || (e.target as Element).closest('.timeline-track')) {
      setIsDragging(true);
      setDragStart(e.clientX);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !timelineRef.current) return;
    
    const walkX = (e.clientX - dragStart) * 3;
    timelineRef.current.scrollLeft = timelineRef.current.scrollLeft - walkX;
    setDragStart(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === timelineRef.current || (e.target as Element).closest('.timeline-track')) {
      setIsDragging(true);
      setDragStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || !timelineRef.current) return;
    
    const walkX = (e.touches[0].clientX - dragStart) * 3;
    timelineRef.current.scrollLeft = timelineRef.current.scrollLeft - walkX;
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Check scroll position to show/hide buttons
  const checkScrollPosition = () => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll indicators on mount and scroll
  React.useEffect(() => {
    checkScrollPosition();
    const timelineElement = timelineRef.current;
    if (timelineElement) {
      timelineElement.addEventListener('scroll', checkScrollPosition);
      return () => timelineElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  return (
    <div className="chronological-timeline">
      <h3>Drag firearms to their chronological positions (earliest to latest)</h3>
      <div
        id="chronological-instructions"
        className="sr-only"
        aria-live="polite"
      >
        Use drag and drop or keyboard navigation to place firearms in chronological order.
        You can replace an occupied position; the previous firearm returns to the bank. Use the back arrow button to remove items manually.
      </div>
      <div
        className={`timeline-container ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`.trim()}
      >
        <button
          className={`scroll-btn scroll-left ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            scrollLeft();
          }}
          disabled={!canScrollLeft}
          aria-label="Scroll timeline left"
        >
          ←
        </button>
        <div 
          className={`timeline-track ${isDragging ? 'dragging' : ''}`}
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {orderedFirearms.map((firearm, position) => (
          <div
            key={position}
            className={`timeline-slot ${isSelectionMode ? 'selectable' : ''} ${isHighlighted ? 'highlighted' : ''} ${dragOverPosition === position ? 'drag-over' : ''} ${firearm !== null ? 'occupied' : ''}`}
            onDragOver={(e) => handleDragOver(e, position)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, position)}
            onClick={(e) => handlePositionClick(position, e)}
            onTouchStart={(e) => handleSlotTouchStart(position, e)}
            onTouchEnd={(e) => handleSlotTouchEnd(position, e)}
            tabIndex={isSelectionMode ? 0 : -1}
            role={isSelectionMode ? 'button' : 'group'}
            aria-label={
              firearm
                ? isSelectionMode
                  ? `Position ${position + 1}, currently ${firearm.name}. Activate to replace with the selected firearm.`
                  : `Position ${position + 1}, occupied by ${firearm.name}. Press X to remove.`
                : isSelectionMode
                ? `Position ${position + 1}, empty. Activate to place the selected firearm here.`
                : `Position ${position + 1}, empty drop zone`
            }
            aria-describedby={isSelectionMode ? 'chronological-instructions' : undefined}
            onKeyDown={(e) => handlePositionKeyDown(position, e)}
          >
            <div className="slot-number">{position + 1}</div>
            <AnimatePresence initial={false} mode="popLayout">
              {firearm && (
                <motion.div
                  key={firearm.id}
                  layout
                  className="firearm-wrapper"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <FirearmCard
                    firearm={firearm}
                    inTimeline={true}
                    isSelectionMode={isSelectionMode}
                    openViewer={openViewer}
                  />
                  {!isSelectionMode && (
                    <button
                      className="remove-firearm-btn"
                      aria-label={`Remove ${firearm.name} from position ${position + 1}`}
                      onClick={(e) => handleFirearmClick(position, e)}
                      title="Send back to bank"
                    >
                      ↩
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {!firearm && (
              <div className="empty-slot" onClick={(e) => handlePositionClick(position, e)}>
                <div className="slot-placeholder">
                  {isSelectionMode ? 'Click to place here' : 'Drop here'}
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
        <button
          className={`scroll-btn scroll-right ${!canScrollRight ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            scrollRight();
          }}
          disabled={!canScrollRight}
          aria-label="Scroll timeline right"
        >
          →
        </button>
      </div>
    </div>
  );
});

ChronologicalSlots.displayName = 'ChronologicalSlots';

export default ChronologicalSlots;
