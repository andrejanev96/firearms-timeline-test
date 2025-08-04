import React, { useState, useEffect } from 'react';
import './App.css';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_jq7svch',
  TEMPLATE_ID: 'template_n2xk2fj', 
  PUBLIC_KEY: 'k-gNX0g2hgBW5TZAR'
};

// Firearm data
const firearms = [
  { id: '1', name: 'Brown Bess Musket', description: 'British military musket', correctPeriod: 0, image: '🔫' },
  { id: '2', name: 'Kentucky Long Rifle', description: 'American frontier rifle', correctPeriod: 0, image: '🔫' },
  { id: '3', name: 'Springfield Model 1861', description: 'Union Army rifle-musket', correctPeriod: 1, image: '🔫' },
  { id: '4', name: 'Spencer Repeating Rifle', description: 'Civil War lever-action', correctPeriod: 1, image: '🔫' },
  { id: '5', name: 'Winchester Model 1873', description: 'The Gun That Won the West', correctPeriod: 2, image: '🔫' },
  { id: '6', name: 'Colt Single Action Army', description: 'Peacemaker revolver', correctPeriod: 2, image: '🔫' },
  { id: '7', name: 'Springfield M1903', description: 'WWI service rifle', correctPeriod: 3, image: '🔫' },
  { id: '8', name: 'Thompson Submachine Gun', description: 'Tommy Gun', correctPeriod: 4, image: '🔫' },
  { id: '9', name: 'M1 Garand', description: 'WWII semi-automatic rifle', correctPeriod: 4, image: '🔫' },
  { id: '10', name: 'AK-47', description: 'Soviet assault rifle', correctPeriod: 5, image: '🔫' },
  { id: '11', name: 'M16', description: 'Vietnam War service rifle', correctPeriod: 5, image: '🔫' },
  { id: '12', name: 'AR-15', description: 'Modern sporting rifle', correctPeriod: 6, image: '🔫' }
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

// Firearm Card Component
const FirearmCard = ({ firearm, isDragging = false, inTimeline = false, onDragStart, onDragEnd, onClick, isSelected = false, isSelectionMode = false }) => {
  return (
    <div
      className={`firearm-card ${isDragging ? 'dragging' : ''} ${inTimeline ? 'in-timeline' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode && !isSelected ? 'dimmed' : ''}`}
      draggable={!inTimeline && !isSelectionMode}
      onDragStart={(e) => onDragStart && onDragStart(e, firearm)}
      onDragEnd={onDragEnd}
      onClick={() => onClick && onClick(firearm)}
    >
      {isSelected && (
        <div className="selection-indicator">
          ✓ Selected - Choose a time period
        </div>
      )}
      <div className="firearm-image">{firearm.image}</div>
      <div className="firearm-name">{firearm.name}</div>
      <div className="firearm-description">{firearm.description}</div>
    </div>
  );
};

// Timeline Period Component
const TimelinePeriod = ({ period, periodIndex, firearms, onDrop, onRemoveFirearm, onPeriodSelect, isSelectionMode, isHighlighted }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const firearmData = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop(firearmData, periodIndex);
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onPeriodSelect(periodIndex);
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
        {firearms.map((firearm) => (
          <FirearmCard
            key={firearm.id}
            firearm={firearm}
            inTimeline={true}
            onClick={() => onRemoveFirearm(firearm, periodIndex)}
          />
        ))}
        {firearms.length === 0 && (
          <div className="drop-placeholder">
            {isSelectionMode ? 'Click to place here' : 'Drop firearms here'}
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
            <p>You correctly placed {results.correctCount} out of 12 firearms!</p>
          </div>
          
          <div className="email-form">
            <h3>Get Your Detailed Results</h3>
            <p>Receive timeline corrections, historical context, and fascinating stories about these iconic firearms.</p>
            
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
    bank: firearms,
    timeline: Array(7).fill().map(() => []),
    showResults: false,
    showSuccess: false,
    isLoading: false,
    results: null,
    draggedFirearm: null,
    selectedFirearm: null,
    selectionMode: false
  });

  // Initialize EmailJS
  useEffect(() => {
    if (typeof window.emailjs !== 'undefined') {
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  }, []);

  // Calculate progress
  const totalPlaced = gameState.timeline.flat().length;
  const progress = (totalPlaced / firearms.length) * 100;
  const isComplete = totalPlaced === firearms.length;

  // Handle firearm selection (new click-to-place feature)
  const handleFirearmSelect = (firearm) => {
    if (gameState.selectionMode && gameState.selectedFirearm?.id === firearm.id) {
      // Deselect if clicking the same firearm
      setGameState(prev => ({
        ...prev,
        selectedFirearm: null,
        selectionMode: false
      }));
    } else {
      // Select new firearm
      setGameState(prev => ({
        ...prev,
        selectedFirearm: firearm,
        selectionMode: true
      }));
    }
  };

  // Handle period selection (when in selection mode)
  const handlePeriodSelect = (periodIndex) => {
    if (!gameState.selectionMode || !gameState.selectedFirearm) return;
    
    const firearm = gameState.selectedFirearm;
    
    setGameState(prev => {
      // Remove from bank if it's there
      const newBank = prev.bank.filter(f => f.id !== firearm.id);
      
      // Remove from other timeline positions
      const newTimeline = prev.timeline.map((periodFirearms) => 
        periodFirearms.filter(f => f.id !== firearm.id)
      );
      
      // Add to new position
      newTimeline[periodIndex] = [...newTimeline[periodIndex], firearm];
      
      return {
        ...prev,
        bank: newBank,
        timeline: newTimeline,
        selectedFirearm: null,
        selectionMode: false
      };
    });
  };

  // Handle drag start
  const handleDragStart = (e, firearm) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(firearm));
    setGameState(prev => ({ ...prev, draggedFirearm: firearm }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setGameState(prev => ({ ...prev, draggedFirearm: null }));
  };

  // Handle drop on timeline
  const handleDrop = (firearm, periodIndex) => {
    setGameState(prev => {
      // Remove from bank if it's there
      const newBank = prev.bank.filter(f => f.id !== firearm.id);
      
      // Remove from other timeline positions
      const newTimeline = prev.timeline.map((periodFirearms) => 
        periodFirearms.filter(f => f.id !== firearm.id)
      );
      
      // Add to new position
      newTimeline[periodIndex] = [...newTimeline[periodIndex], firearm];
      
      return {
        ...prev,
        bank: newBank,
        timeline: newTimeline,
        draggedFirearm: null
      };
    });
  };

  // Handle remove from timeline
  const handleRemoveFirearm = (firearm, periodIndex) => {
    setGameState(prev => {
      const newTimeline = [...prev.timeline];
      newTimeline[periodIndex] = newTimeline[periodIndex].filter(f => f.id !== firearm.id);
      
      return {
        ...prev,
        bank: [...prev.bank, firearm].sort((a, b) => parseInt(a.id) - parseInt(b.id)),
        timeline: newTimeline
      };
    });
  };

  // Calculate results
  const calculateResults = () => {
    let correctCount = 0;
    const correctAnswers = [];
    const incorrectAnswers = [];
    
    gameState.timeline.forEach((periodFirearms, periodIndex) => {
      periodFirearms.forEach(firearm => {
        if (firearm.correctPeriod === periodIndex) {
          correctCount++;
          correctAnswers.push({
            name: firearm.name,
            period: timePeriods[periodIndex].name,
            years: timePeriods[periodIndex].years
          });
        } else {
          incorrectAnswers.push({
            name: firearm.name,
            userPeriod: timePeriods[periodIndex].name,
            correctPeriod: timePeriods[firearm.correctPeriod].name,
            correctYears: timePeriods[firearm.correctPeriod].years,
            description: firearm.description
          });
        }
      });
    });
    
    return {
      correctCount,
      totalCount: firearms.length,
      percentage: Math.round((correctCount / firearms.length) * 100),
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
          <h1>Historical Firearms Timeline Test</h1>
          <p className="subtitle">
            From flintlocks to modern arms: Can you correctly place these 12 iconic American pieces on our timeline?
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
              {totalPlaced} of 12 firearms placed
            </p>
          </div>
        </header>

        {/* Firearms Bank */}
        <section className="firearms-bank">
          <h2>
            {gameState.selectionMode 
              ? `Selected: ${gameState.selectedFirearm?.name} - Now choose a time period below` 
              : 'Click or drag the firearms to their correct time periods'
            }
          </h2>
          {gameState.selectionMode && (
            <div className="selection-help">
              <p>Click on a time period below to place your selected firearm, or click the firearm again to cancel.</p>
            </div>
          )}
          <div className="firearms-grid">
            {gameState.bank.map((firearm) => (
              <FirearmCard
                key={firearm.id}
                firearm={firearm}
                isDragging={gameState.draggedFirearm?.id === firearm.id}
                isSelected={gameState.selectedFirearm?.id === firearm.id}
                isSelectionMode={gameState.selectionMode}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={handleFirearmSelect}
              />
            ))}
            {gameState.bank.length === 0 && (
              <div className="empty-bank">
                All firearms have been placed on the timeline!
              </div>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline-section">
          <div className="timeline-container">
            <div className="timeline-line"></div>
            <div className="timeline-periods">
              {timePeriods.map((period, index) => (
                <TimelinePeriod
                  key={period.id}
                  period={period}
                  periodIndex={index}
                  firearms={gameState.timeline[index]}
                  onDrop={handleDrop}
                  onRemoveFirearm={handleRemoveFirearm}
                  onPeriodSelect={handlePeriodSelect}
                  isSelectionMode={gameState.selectionMode}
                  isHighlighted={gameState.selectionMode}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Complete Button */}
        {isComplete && (
          <div className="complete-section">
            <button
              onClick={handleCompleteTest}
              className="complete-btn"
            >
              Complete Test & See Results
            </button>
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