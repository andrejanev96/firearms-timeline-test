import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/stores/quizStore';

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
          <p className="intro-subtitle">
            Can you correctly order these 12 American-made firearms chronologically?
          </p>
          <p className="intro-description">
            Test your knowledge of American-made firearms history by placing iconic weapons in chronological order
          </p>
        </motion.div>

        <motion.div 
          className="intro-instructions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3>How it works:</h3>
          <div className="instruction-steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>Drag firearms from the bank to the timeline positions</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>Order them from earliest invention date (1750s) to latest (2010s)</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>Submit your timeline when all 12 positions are filled</p>
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
