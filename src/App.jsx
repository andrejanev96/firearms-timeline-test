import React, { useState, useEffect } from 'react';
import './App.css';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_jq7svch',
  TEMPLATE_ID: 'template_n2xk2fj', 
  PUBLIC_KEY: 'k-gNX0g2hgBW5TZAR'
};

// Ammunition data - historically significant cartridges
const ammunition = [
  { id: '1', name: '.69 Caliber Ball', description: 'Brown Bess musket ammunition', correctPeriod: 0, image: '🔸' },
  { id: '2', name: '.50 Caliber Ball', description: 'Kentucky Long Rifle ammunition', correctPeriod: 0, image: '🔸' },
  { id: '3', name: '.58 Caliber', description: 'Civil War rifle-musket ammunition', correctPeriod: 1, image: '🔸' },
  { id: '4', name: '.56-50 Spencer', description: 'Spencer repeating rifle cartridge', correctPeriod: 1, image: '🔸' },
  { id: '5', name: '.44-40 Winchester', description: 'Winchester Model 1873 cartridge', correctPeriod: 2, image: '🔸' },
  { id: '6', name: '.45 Colt', description: 'Single Action Army revolver cartridge', correctPeriod: 2, image: '🔸' },
  { id: '7', name: '.30-06 Springfield', description: 'M1903 and M1 Garand cartridge', correctPeriod: 3, image: '🔸' },
  { id: '8', name: '.45 ACP', description: 'Thompson SMG and M1911 pistol', correctPeriod: 4, image: '🔸' },
  { id: '9', name: '9mm Luger', description: 'WWII and modern sidearm cartridge', correctPeriod: 4, image: '🔸' },
  { id: '10', name: '7.62×39mm', description: 'AK-47 assault rifle cartridge', correctPeriod: 5, image: '🔸' },
  { id: '11', name: '5.56×45mm NATO', description: 'M16 and AR-15 cartridge', correctPeriod: 5, image: '🔸' },
  { id: '12', name: '.22 LR', description: 'Modern training and sporting cartridge', correctPeriod: 6, image: '🔸' }
];

const timePeriods = [
  { name: 'Revolutionary War', years: '1775-1783', id: 'revolutionary' },
  { name: 'Civil War', years: '1861-1865', id: 'civil' },
  { name: 'Wild West', years: '1865-1890', id: 'wildwest' },
  { name: 'World War I', years: '1914-1918', id: 'wwi' },
  { name: 'World War II', years: '1939-1945', id: 'wwii' },
  { name: 'Cold War', years: '1945-1991', id: 'coldwar' },
  { name: 'Modern Era', years: '1990-Present', id: 'modern' }
];

// Ammunition Card Component
const AmmoCard = ({ ammo, isDragging = false, inTimeline = false, onDragStart, onDragEnd, onClick, isSelected = false, isSelectionMode = false, isMobile = false, isTopCard = false }) => {
  
  const handleDragStart = (e) => {
    if (onDragStart && !isSelectionMode && !isMobile) {
      onDragStart(e, ammo);
    } else if (isSelectionMode || isMobile) {
      e.preventDefault();
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(ammo, e);
    }
  };

  return (
    <div
      className={`ammo-card ${isDragging ? 'dragging' : ''} ${inTimeline ? 'in-timeline' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode && !isSelected ? 'dimmed' : ''} ${isMobile ? 'mobile-card' : ''} ${isTopCard ? 'top-card' : ''}`}
      draggable={!inTimeline && !isSelectionMode && !isMobile}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      {isSelected && !isMobile && (
        <div className="selection-indicator">
          ✓ Selected - Choose a time period
        </div>
      )}
      <div className="ammo-image">{ammo.image}</div>
      <div className="ammo-name">{ammo.name}</div>
      <div className="ammo-description">{ammo.description}</div>
      {isMobile && isTopCard && (
        <div className="mobile-card-actions">
          <div className="swipe-hint">👈 Swipe to browse • Tap to select 👆</div>
        </div>
      )}
    </div>
  );
};

// Mobile Card Stack Component
const MobileCardStack = ({ ammunition, onAmmoSelect, onPeriodSelect, selectedAmmo, showTimeline }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentCardIndex < ammunition.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const currentAmmo = ammunition[currentCardIndex];

  if (showTimeline) {
    return (
      <div className="mobile-timeline-overlay">
        <div className="mobile-timeline-header">
          <h3>Selected: {selectedAmmo?.name}</h3>
          <p>Choose the correct time period</p>
        </div>
        <div className="mobile-timeline-periods">
          {timePeriods.map((period, index) => (
            <div
              key={period.id}
              className="mobile-timeline-period"
              onClick={() => onPeriodSelect(index)}
            >
              <div className="mobile-period-label">{period.name}</div>
              <div className="mobile-period-years">{period.years}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-card-container">
      <div className="mobile-progress">
        <div className="progress-dots">
          {ammunition.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentCardIndex ? 'active' : ''} ${index < currentCardIndex ? 'completed' : ''}`}
            />
          ))}
        </div>
        <p className="progress-text">Card {currentCardIndex + 1} of {ammunition.length}</p>
      </div>

      <div 
        className="card-stack"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {ammunition.map((ammo, index) => {
          const offset = index - currentCardIndex;
          const isVisible = Math.abs(offset) <= 2;
          
          if (!isVisible) return null;

          return (
            <div
              key={ammo.id}
              className={`stacked-card ${offset === 0 ? 'current' : offset > 0 ? 'next' : 'prev'}`}
              style={{
                transform: `translateX(${offset * 20}px) translateY(${Math.abs(offset) * 5}px) scale(${1 - Math.abs(offset) * 0.05})`,
                zIndex: ammunition.length - Math.abs(offset),
                opacity: offset === 0 ? 1 : 0.7 - Math.abs(offset) * 0.2
              }}
            >
              <AmmoCard
                ammo={ammo}
                isMobile={true}
                isTopCard={offset === 0}
                onClick={() => offset === 0 && onAmmoSelect(ammo)}
              />
            </div>
          );
        })}
      </div>

      <div className="mobile-navigation">
        <button 
          className="nav-btn prev-btn"
          onClick={() => currentCardIndex > 0 && setCurrentCardIndex(currentCardIndex - 1)}
          disabled={currentCardIndex === 0}
        >
          ←
        </button>
        <button 
          className="select-btn"
          onClick={() => onAmmoSelect(currentAmmo)}
        >
          Select This Ammo
        </button>
        <button 
          className="nav-btn next-btn"
          onClick={() => currentCardIndex < ammunition.length - 1 && setCurrentCardIndex(currentCardIndex + 1)}
          disabled={currentCardIndex === ammunition.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
};

// Timeline Period Component
const TimelinePeriod = ({ period, periodIndex, ammunition, onDrop, onRemoveAmmo, onPeriodSelect, isSelectionMode, isHighlighted }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const ammoData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onDrop(ammoData, periodIndex);
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleClick = (e) => {
    if (isSelectionMode && (e.target === e.currentTarget || e.target.classList.contains('drop-placeholder'))) {
      onPeriodSelect(periodIndex);
    }
  };

  const handleAmmoClick = (ammo, e) => {
    e.stopPropagation();
    
    if (!isSelectionMode) {
      onRemoveAmmo(ammo, periodIndex);
    }
  };

  return (
    <div className="timeline-period">
      <div className="period-marker"></div>
      <div className="period-label">{period.name}</div>
      <div className="period-years">{period.years}</div>
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${isSelectionMode ? 'selectable' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {ammunition.map((ammo) => (
          <div
            key={ammo.id}
            onClick={(e) => handleAmmoClick(ammo, e)}
            className={isSelectionMode ? 'disabled-interaction' : ''}
          >
            <AmmoCard
              ammo={ammo}
              inTimeline={true}
            />
          </div>
        ))}
        {ammunition.length === 0 && (
          <div className="drop-placeholder" onClick={handleClick}>
            {isSelectionMode ? 'Click to place here' : 'Drop ammunition here'}
          </div>
        )}
      </div>
    </div>
  );
};

// Results Modal Component
const ResultsModal = ({ results, onSubmitEmail, isLoading, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    optIn: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmitEmail(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Your Results</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="score-display">
            <div className="score-circle">
              <span>{results.percentage}%</span>
            </div>
            <p>You correctly placed {results.correctCount} out of 12 ammunition types!</p>
          </div>
          
          <div className="email-form">
            <h3>Get Your Detailed Results</h3>
            <p>Receive timeline corrections, historical context, and fascinating stories about these iconic ammunition types.</p>
            
            <div className="form-container">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label" onClick={() => setFormData({...formData, optIn: !formData.optIn})}>
                  <input
                    type="checkbox"
                    checked={formData.optIn}
                    onChange={() => {}}
                  />
                  <span className="checkmark"></span>
                  I would like to receive the Ammo.com BULLETin for weekly ammo discounts
                </label>
              </div>
              <button onClick={handleSubmit} className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send My Results'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [gameState, setGameState] = useState({
    bank: ammunition,
    timeline: Array(7).fill().map(() => []),
    showResults: false,
    showSuccess: false,
    isLoading: false,
    results: null,
    draggedAmmo: null,
    selectedAmmo: null,
    selectionMode: false,
    // Mobile-specific state
    isMobile: false,
    showMobileTimeline: false
  });

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setGameState(prev => ({ ...prev, isMobile: window.innerWidth <= 768 }));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize EmailJS
  useEffect(() => {
    if (typeof window.emailjs !== 'undefined') {
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  }, []);

  // Calculate progress
  const totalPlaced = gameState.timeline.flat().length;
  const progress = (totalPlaced / ammunition.length) * 100;
  const isComplete = totalPlaced === ammunition.length;

  // Handle ammunition selection (both desktop and mobile)
  const handleAmmoSelect = (ammo) => {
    if (gameState.isMobile) {
      // Mobile: Show timeline overlay
      setGameState(prev => ({
        ...prev,
        selectedAmmo: ammo,
        showMobileTimeline: true
      }));
    } else {
      // Desktop: Selection mode
      if (gameState.selectionMode && gameState.selectedAmmo?.id === ammo.id) {
        setGameState(prev => ({
          ...prev,
          selectedAmmo: null,
          selectionMode: false
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          selectedAmmo: ammo,
          selectionMode: true
        }));
      }
    }
  };

  // Handle period selection
  const handlePeriodSelect = (periodIndex) => {
    if (!gameState.selectedAmmo) return;
    
    const ammo = gameState.selectedAmmo;
    
    setGameState(prev => {
      const newBank = prev.bank.filter(a => a.id !== ammo.id);
      const newTimeline = prev.timeline.map((periodAmmo) => 
        periodAmmo.filter(a => a.id !== ammo.id)
      );
      
      newTimeline[periodIndex] = [...newTimeline[periodIndex], ammo];
      
      return {
        ...prev,
        bank: newBank,
        timeline: newTimeline,
        selectedAmmo: null,
        selectionMode: false,
        showMobileTimeline: false
      };
    });
  };

  // Handle drag start
  const handleDragStart = (e, ammo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(ammo));
    setGameState(prev => ({ ...prev, draggedAmmo: ammo }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setGameState(prev => ({ 
      ...prev, 
      draggedAmmo: null,
    }));
  };

  // Handle drop on timeline (for drag and drop)
  const handleDrop = (ammo, periodIndex) => {
    setGameState(prev => {
      const newBank = prev.bank.filter(a => a.id !== ammo.id);
      const newTimeline = prev.timeline.map((periodAmmo) => 
        periodAmmo.filter(a => a.id !== ammo.id)
      );
      
      newTimeline[periodIndex] = [...newTimeline[periodIndex], ammo];
      
      return {
        ...prev,
        bank: newBank,
        timeline: newTimeline,
        draggedAmmo: null,
        selectedAmmo: null,
        selectionMode: false
      };
    });
  };

  // Handle remove from timeline
  const handleRemoveAmmo = (ammo, periodIndex) => {
    setGameState(prev => {
      const newTimeline = [...prev.timeline];
      newTimeline[periodIndex] = newTimeline[periodIndex].filter(a => a.id !== ammo.id);
      
      return {
        ...prev,
        bank: [...prev.bank, ammo].sort((a, b) => parseInt(a.id) - parseInt(b.id)),
        timeline: newTimeline
      };
    });
  };

  // Calculate results
  const calculateResults = () => {
    let correctCount = 0;
    const correctAnswers = [];
    const incorrectAnswers = [];
    
    gameState.timeline.forEach((periodAmmo, periodIndex) => {
      periodAmmo.forEach(ammo => {
        if (ammo.correctPeriod === periodIndex) {
          correctCount++;
          correctAnswers.push({
            name: ammo.name,
            period: timePeriods[periodIndex].name,
            years: timePeriods[periodIndex].years
          });
        } else {
          incorrectAnswers.push({
            name: ammo.name,
            userPeriod: timePeriods[periodIndex].name,
            correctPeriod: timePeriods[ammo.correctPeriod].name,
            correctYears: timePeriods[ammo.correctPeriod].years,
            description: ammo.description
          });
        }
      });
    });
    
    return {
      correctCount,
      totalCount: ammunition.length,
      percentage: Math.round((correctCount / ammunition.length) * 100),
      correctAnswers,
      incorrectAnswers
    };
  };

  // Show results
  const handleCompleteTest = () => {
    const results = calculateResults();
    setGameState(prev => ({
      ...prev,
      showResults: true,
      results
    }));
  };

  // Send email
  const handleEmailSubmit = async (formData) => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await sendResultsEmail(formData, gameState.results);
      setGameState(prev => ({
        ...prev,
        showResults: false,
        showSuccess: true,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending email:', error);
      alert('There was an error sending your results. Please try again.');
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // EmailJS send function
  const sendResultsEmail = async (formData, results) => {
    if (typeof window.emailjs === 'undefined') {
      console.log('EmailJS not configured - simulating email send');
      console.log('Email would be sent to:', formData.email);
      console.log('Results:', results);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }

    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
      final_score: `${results.percentage}%`,
      correct_count: results.correctCount,
      total_count: results.totalCount,
      correct_answers: results.correctAnswers.map(item => 
        `• ${item.name} - ${item.period} (${item.years})`
      ).join('\n') || 'None',
      incorrect_answers: results.incorrectAnswers.map(item => 
        `• ${item.name}\n  Your answer: ${item.userPeriod}\n  Correct answer: ${item.correctPeriod} (${item.correctYears})`
      ).join('\n\n') || 'None - Perfect score!',
      email_opt_in: formData.optIn ? 'Yes' : 'No',
      timestamp: new Date().toLocaleString()
    };

    await window.emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>Historical Ammunition Timeline Test</h1>
          <p className="subtitle">
            From musket balls to modern cartridges: Can you correctly place these 12 iconic American ammunition types on our timeline?
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
              {totalPlaced} of 12 ammunition types placed
            </p>
          </div>
        </header>

        {/* Mobile Card Stack Interface */}
        {gameState.isMobile ? (
          <MobileCardStack
            ammunition={gameState.bank}
            onAmmoSelect={handleAmmoSelect}
            onPeriodSelect={handlePeriodSelect}
            selectedAmmo={gameState.selectedAmmo}
            showTimeline={gameState.showMobileTimeline}
          />
        ) : (
          <>
            {/* Desktop: Ammunition Bank */}
            <section className="ammunition-bank">
              <h2>
                {gameState.selectionMode 
                  ? `Selected: ${gameState.selectedAmmo?.name} - Now choose a time period below` 
                  : 'Click or drag the ammunition to their correct time periods'
                }
              </h2>
              {gameState.selectionMode && (
                <div className="selection-help">
                  <p>Click on a time period below to place your selected ammunition, or click the ammunition again to cancel.</p>
                </div>
              )}
              <div className="ammunition-grid">
                {gameState.bank.map((ammo) => (
                  <AmmoCard
                    key={ammo.id}
                    ammo={ammo}
                    isDragging={gameState.draggedAmmo?.id === ammo.id}
                    isSelected={gameState.selectedAmmo?.id === ammo.id}
                    isSelectionMode={gameState.selectionMode}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={handleAmmoSelect}
                  />
                ))}
                {gameState.bank.length === 0 && (
                  <div className="empty-bank">
                    All ammunition has been placed on the timeline!
                  </div>
                )}
              </div>
            </section>

            {/* Desktop: Timeline */}
            <section className="timeline-section">
              <div className="timeline-container">
                <div className="timeline-line"></div>
                <div className="timeline-periods">
                  {timePeriods.map((period, index) => (
                    <TimelinePeriod
                      key={period.id}
                      period={period}
                      periodIndex={index}
                      ammunition={gameState.timeline[index]}
                      onDrop={handleDrop}
                      onRemoveAmmo={handleRemoveAmmo}
                      onPeriodSelect={handlePeriodSelect}
                      isSelectionMode={gameState.selectionMode}
                      isHighlighted={gameState.selectionMode}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Complete Button */}
        {isComplete && !gameState.isMobile && (
          <div className="complete-section">
            <button
              onClick={handleCompleteTest}
              className="complete-btn"
            >
              Complete Test & See Results
            </button>
          </div>
        )}

        {/* Mobile Complete Button */}
        {isComplete && gameState.isMobile && (
          <div className="mobile-complete-section">
            <div className="mobile-completion-message">
              <h2>🎉 Test Complete!</h2>
              <p>You've placed all 12 ammunition types. Ready to see your results?</p>
              <button
                onClick={handleCompleteTest}
                className="mobile-complete-btn"
              >
                Get My Results
              </button>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {gameState.showResults && (
          <ResultsModal
            results={gameState.results}
            onSubmitEmail={handleEmailSubmit}
            isLoading={gameState.isLoading}
            onClose={() => setGameState(prev => ({ ...prev, showResults: false }))}
          />
        )}

        {/* Success Overlay */}
        {gameState.showSuccess && (
          <div className="success-overlay">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Results Sent Successfully!</h2>
              <p>Check your email for detailed timeline corrections and historical insights.</p>
              <button
                onClick={() => window.location.reload()}
                className="close-btn"
              >
                Take Test Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;