import React from 'react';
import type { Firearm } from '@/types/quiz';

interface FirearmCardProps {
  firearm: Firearm;
  isDragging?: boolean;
  inTimeline?: boolean;
  onDragStart?: (e: React.DragEvent, firearm: Firearm) => void;
  onDragEnd?: () => void;
  onClick?: (firearm: Firearm, e?: React.SyntheticEvent) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isMobile?: boolean;
  isTopCard?: boolean;
  hideName?: boolean;
  // Viewer support
  openViewer?: (firearm: Firearm, returnFocusEl?: HTMLElement | null) => void;
}

const FirearmCard: React.FC<FirearmCardProps> = React.memo(({
  firearm,
  isDragging = false,
  inTimeline = false,
  onDragStart,
  onDragEnd,
  onClick,
  isSelected = false,
  isSelectionMode = false,
  isMobile = false,
  isTopCard = false,
  openViewer,
  hideName = false
}) => {
  
  const handleNativeDragStart = (e: React.DragEvent) => {
    if (onDragStart && !isSelectionMode && !isMobile) {
      onDragStart(e, firearm);
    } else if (isSelectionMode || isMobile) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only stop propagation if NOT in timeline during selection mode
    // (we want clicks to bubble up to trigger swaps in selection mode)
    if (!(inTimeline && isSelectionMode)) {
      e.stopPropagation(); // Prevent click from bubbling to container
    }
    if (onClick && !(inTimeline && isSelectionMode)) {
      onClick(firearm, e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (inTimeline) return;
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(firearm);
    }
  };

  const viewBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const handleOpenViewer = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!openViewer) return;
    openViewer(firearm, viewBtnRef.current);
  };
  return (
    <div
      className={`firearm-card ${isDragging ? 'dragging' : ''} ${inTimeline ? 'in-timeline' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode && !isSelected ? 'dimmed' : ''} ${isMobile ? 'mobile-card' : ''} ${isTopCard ? 'top-card' : ''}`}
      onClick={handleClick}
      tabIndex={!inTimeline ? 0 : -1}
      role={!inTimeline ? 'button' : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        draggable={!inTimeline && !isSelectionMode && !isMobile}
        onDragStart={handleNativeDragStart}
        onDragEnd={onDragEnd}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {isSelected && !isMobile && (
          <div className="selection-indicator">
            ✓ Selected
          </div>
        )}
        <div 
          className="firearm-image"
        >
          <img
            src={firearm.image}
            alt={firearm.name}
            style={{ width: '100%', height: 'auto' }}
            loading={isMobile && isTopCard ? 'eager' : undefined}
          />
          {openViewer && (
            <button
              className="magnifier-btn"
              aria-label={`View larger image of ${firearm.name}`}
              title="View larger"
              onClick={handleOpenViewer}
              ref={viewBtnRef}
            >
              🔍
            </button>
          )}
        </div>
        {!hideName && (
          <div className="firearm-name">{firearm.name}</div>
        )}
        {/* Mobile swipe hint moved outside the card in MobileCardStack */}
      </div>
    </div>
  );
});

FirearmCard.displayName = 'FirearmCard';

export default FirearmCard;
