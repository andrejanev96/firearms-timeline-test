import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/stores/quizStore';
import AmericanFlag from '@/components/ui/AmericanFlag';

const IntroScreen: React.FC = () => {
  const { startQuiz } = useQuizStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStartQuiz = () => {
    setIsTransitioning(true);
    // Start quiz after transition animation completes
    setTimeout(() => {
      startQuiz();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="intro-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isTransitioning ? 0 : 1, 
          scale: isTransitioning ? 1.1 : 1,
          y: isTransitioning ? -50 : 0
        }}
        exit={{ opacity: 0, scale: 1.1, y: -50 }}
        transition={{ duration: isTransitioning ? 0.8 : 0.6 }}
      >
      <div className="intro-content">
        <motion.div
          className="intro-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="title-with-flag">
            <AmericanFlag />
            <h1>American Firearms Timeline Challenge</h1>
            <AmericanFlag />
          </div>
          <p className="intro-subtitle">
            Think you know firearms history? Prove it by putting these 12 iconic weapons in chronological order!
          </p>
          <p className="intro-description">
            Challenge yourself with America's most legendary firearms - from colonial muskets to modern sporting rifles. Don't worry, you can retry as many times as needed to master the timeline!
          </p>
        </motion.div>

        <motion.div
          className="timeline-preview"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <p className="preview-label">Your Timeline Challenge:</p>
          <div className="preview-timeline">
            <div className="preview-slot">1750s</div>
            <div className="preview-arrow">→</div>
            <div className="preview-slot">?</div>
            <div className="preview-arrow">→</div>
            <div className="preview-slot">?</div>
            <div className="preview-arrow">→</div>
            <div className="preview-slot">?</div>
            <div className="preview-dots">...</div>
            <div className="preview-slot">2010s</div>
          </div>
        </motion.div>

        <motion.div
          className="intro-instructions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3>🎯 Ready for the Challenge?</h3>
          <div className="instruction-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <svg className="step-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 6l6 6-6 6m-8-6h14" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Drag firearms from the bank to the timeline positions</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <svg className="step-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DAA520" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="#DAA520" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p>Order them from earliest invention date (1750s) to latest (2010s)</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <svg className="step-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#DAA520" strokeWidth="2"/>
                </svg>
                <p>Submit your timeline when all 12 positions are filled</p>
              </div>
            </div>
          </div>
        </motion.div>


        <motion.div 
          className="intro-actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button 
            className={`start-quiz-btn ${isTransitioning ? 'transitioning' : ''}`}
            onClick={handleStartQuiz}
            disabled={isTransitioning}
          >
            {isTransitioning ? 'Loading Rifles...' : 'Start Timeline Challenge 🚀'}
          </button>
          <p className="time-estimate">Takes about 5-10 minutes</p>
        </motion.div>
      </div>
    </motion.div>
    </AnimatePresence>
  );
};

export default IntroScreen;
