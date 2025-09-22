import React from 'react';
import { motion } from 'framer-motion';
import type { Firearm } from '@/types/quiz';

interface FirearmCardProps {
  firearm: Firearm;
  isDragging?: boolean;
  inTimeline?: boolean;
  onDragStart?: (e: React.DragEvent, firearm: Firearm) => void;
  onDragEnd?: () => void;
  onClick?: (firearm: Firearm, e: React.MouseEvent) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isMobile?: boolean;
  isTopCard?: boolean;
  animationDelay?: number;
}

const FirearmCard: React.FC<FirearmCardProps> = ({ 
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
  animationDelay = 0
}) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && !isSelectionMode && !isMobile) {
      onDragStart(e, firearm);
    } else if (isSelectionMode || isMobile) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !(inTimeline && isSelectionMode)) {
      onClick(firearm, e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (inTimeline) return;
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(firearm, e as unknown as React.MouseEvent);
    }
  };

  return (
    <motion.div
      className={`firearm-card ${isDragging ? 'dragging' : ''} ${inTimeline ? 'in-timeline' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode && !isSelected ? 'dimmed' : ''} ${isMobile ? 'mobile-card' : ''} ${isTopCard ? 'top-card' : ''}`}
      draggable={!inTimeline && !isSelectionMode && !isMobile}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      tabIndex={!inTimeline ? 0 : -1}
      role={!inTimeline ? 'button' : undefined}
      onKeyDown={handleKeyDown}
      initial={animationDelay > 0 ? { opacity: 0, scale: 0.9, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: animationDelay,
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      whileHover={!isDragging && !inTimeline && !isSelected ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!isDragging && !inTimeline ? { scale: 0.98 } : undefined}
    >
      {isSelected && !isMobile && (
        <div className="selection-indicator">
          ✓ Selected - Click a position on the timeline
        </div>
      )}
      <div className="firearm-image">
        <img src={firearm.image} alt={firearm.name} style={{ width: '100%', height: 'auto' }} />
      </div>
      <div className="firearm-name">{firearm.name}</div>
      <div className="firearm-description">{firearm.description}</div>
      {isMobile && isTopCard && (
        <div className="mobile-card-actions">
          <div className="swipe-hint">👈 Swipe to browse • Tap to select 👆</div>
        </div>
      )}
    </motion.div>
  );
};

export default FirearmCard;
