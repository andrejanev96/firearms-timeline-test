import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type { EmailFormData } from '@/types/quiz';
import { useQuizStore } from '@/stores/quizStore';
import { trackQuizEvents } from '@/utils/analytics';
import { getShareUrls, openShareWindow } from '@/utils/share';

const Results: React.FC = () => {
  const { 
    results, 
    resultsUnlocked, 
    userEmail, 
    unlockResults,
    orderedFirearms,
  } = useQuizStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSneakPeek, setShowSneakPeek] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid }, 
    setFocus 
  } = useForm<EmailFormData>({
    defaultValues: { 
      subscribeToBulletin: true 
    },
  });

  useEffect(() => { 
    if (!resultsUnlocked) {
      setFocus('email'); 
    }
  }, [setFocus, resultsUnlocked]);

  // Scroll helpers for results timeline
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

  const checkScrollPosition = () => {
    if (timelineRef.current) {
      const el = timelineRef.current;
      const sl = Math.round(el.scrollLeft);
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      setCanScrollLeft(sl > 0);
      setCanScrollRight(sl < max);
    }
  };

  useLayoutEffect(() => {
    // Initial measurement after layout
    const raf = requestAnimationFrame(checkScrollPosition);
    const el = timelineRef.current;
    const onResize = () => checkScrollPosition();
    if (el) el.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      if (el) el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Fire confetti after results mount (lazy-load)
  useEffect(() => {
    if (!results) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@/utils/confetti');
        if (!cancelled && 'fireConfettiOnce' in mod && typeof mod.fireConfettiOnce === 'function') {
          mod.fireConfettiOnce();
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [results]);

  if (!results) {
    return (
      <div className="results-container">
        <div className="error-message">
          <h2>No Results Available</h2>
          <p>Please complete the quiz first.</p>
        </div>
      </div>
    );
  }

  // Get performance message based on score
  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { message: "Excellent knowledge of US firearms history!", color: "#4CAF50" };
    if (percentage >= 75) return { message: "Great understanding of the timeline!", color: "#8BC34A" };
    if (percentage >= 60) return { message: "Good grasp of firearms chronology!", color: "#FFC107" };
    if (percentage >= 45) return { message: "Keep studying US firearms history!", color: "#FF9800" };
    return { message: "Time to brush up on firearms history!", color: "#FF5722" };
  };

  const performance = getPerformanceMessage(results.percentage);
  const getTierName = () => {
    const s = results.correctCount;
    if (s === results.totalCount) return 'Historian';
    if (s >= 9) return 'Sharpshooter';
    if (s >= 5) return 'Marksman';
    return 'Novice';
  };

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      await unlockResults(data.email, data.subscribeToBulletin);
    } catch (error) {
      console.error('Error unlocking results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email Gate Section (when !resultsUnlocked)
  if (!resultsUnlocked) {
    return (
      <div className="results-container">
        <div className="email-gate">
          <motion.div 
            className="email-gate-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="gate-header">
              <h2>American Firearms Timeline Challenge Complete!</h2>
              <p>You've placed all 12 US firearms on the historical timeline. Enter your email to unlock your detailed results and see how accurately you traced American firearms history.</p>
            </div>

            {/* Quick Preview Button */}
            <div className="preview-section">
              <button 
                className="preview-btn"
                onClick={() => {
                  setShowSneakPeek(!showSneakPeek);
                  if (!showSneakPeek) {
                    trackQuizEvents.sneakPeekViewed();
                  }
                }}
              >
                {showSneakPeek ? '🔍 Hide Preview' : '👀 Quick Preview'}
              </button>
            </div>

            {/* Sneak Peek Feature */}
            {showSneakPeek && (
              <motion.div 
                className="sneak-peek"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="results-breakdown">
                  <h4>Quick Summary</h4>
                  <div className="breakdown-item">
                    <span>Score:</span>
                    <span>{results.correctCount} / {results.totalCount}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Percentage:</span>
                    <span>{results.percentage}%</span>
                  </div>

                  {/* Blurred performance preview */}
                  <div className="breakdown-item" style={{ position: 'relative' }}>
                    <span>Assessment:</span>
                    <span style={{ 
                      filter: 'blur(4px)', 
                      userSelect: 'none',
                      fontWeight: 'bold',
                      color: performance.color
                    }}>
                      {performance.message}
                    </span>
                    <div style={{ position: 'absolute', right: '10px', fontSize: '12px' }}>🔒</div>
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '10px' }}>
                    Enter your email above to unlock your full results and detailed breakdown.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="email-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register('email', {
                    required: 'Email is required',
                    validate: {
                      validFormat: (value: string) => {
                        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                        return emailRegex.test(value) || 'Please enter a valid email address';
                      },
                      validLength: (value: string) => {
                        return value.length <= 254 || 'Email address is too long';
                      },
                      validDomain: (value: string) => {
                        const domain = value.split('@')[1];
                        return (domain && domain.length >= 3 && domain.includes('.')) || 'Please enter a valid email domain';
                      },
                      noDisposable: (value: string) => {
                        const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com', '0-mail.com'];
                        const domain = value.split('@')[1]?.toLowerCase();
                        return !disposableDomains.includes(domain) || 'Please use a permanent email address';
                      }
                    }
                  })}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('subscribeToBulletin')}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    Yes, I'd like to receive the Ammo.com BULLETin newsletter with:
                    <ul>
                      <li>Weekly ammunition deals and discounts</li>
                      <li>Historical firearms content and educational articles</li>
                      <li>New product launches and ammunition reviews</li>
                    </ul>
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Unlocking Results...' : 'Unlock My Results 🔓'}
              </button>

              <p className="privacy-note">
                Your email will be used only for sending your results and the optional newsletter. 
                We respect your privacy and won't share your information.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // Full Results Section (when resultsUnlocked)
  return (
    <motion.div 
      className="results-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-content">
        {/* Header */}
        <div className="results-header">
          <h2>Your American Firearms Timeline Results</h2>
          <p>Results for: <strong>{userEmail}</strong></p>
        </div>

        {/* Score Display */}
        <div className="score-display">
          <div className="score-circle" style={{ borderColor: performance.color }}>
            <span className="percentage">{results.percentage}%</span>
            <span className="score-details">{results.correctCount} / {results.totalCount} correct</span>
          </div>
          
          <div className="performance-info">
            <h3 style={{ color: performance.color }}>Timeline Assessment</h3>
            <p>{performance.message}</p>
          </div>
        </div>

        {/* Timeline Results View */}
        <div className="results-timeline">
          <h3>Your Timeline Results</h3>
          <p className="timeline-instructions">
            Green positions show correct placements with historical details. 
            Red positions were incorrect - try the quiz again to learn more!
          </p>
          
          <div className="timeline-results-container">
            <button
              className={`scroll-btn scroll-left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll timeline left"
            >
              ←
            </button>
            <div className="timeline-track" ref={timelineRef} onScroll={checkScrollPosition}>
              {Array.from({ length: 12 }, (_, index) => {
                const position = index;
                const userFirearm = orderedFirearms[position];
                const isCorrect = userFirearm?.correctPosition === position;

                return (
                  <div
                    key={position}
                    className={`timeline-result-slot ${isCorrect ? 'correct' : 'incorrect'} ${userFirearm ? 'filled' : 'empty'}`}
                  >
                    <div className="slot-number">{position + 1}</div>
                    {userFirearm ? (
                      <div className="result-firearm-card">
                        <div className="firearm-image">
                          <img src={userFirearm.image} alt={userFirearm.name} />
                        </div>
                        <div className="firearm-info">
                          <h4>{userFirearm.name}</h4>
                          {isCorrect ? (
                            <div className="correct-info">
                              <span className="year-badge">{userFirearm.year}</span>
                              <div className="status-indicator">✅</div>
                            </div>
                          ) : (
                            <div className="incorrect-info">
                              <div className="status-indicator">❌</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="result-firearm-card">
                        <div className="firearm-image" />
                        <div className="firearm-info">
                          <h4>No firearm placed</h4>
                          <div className="incorrect-info">
                            <div className="status-indicator">❌</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className={`scroll-btn scroll-right ${!canScrollRight ? 'disabled' : ''}`}
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll timeline right"
            >
              →
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <div className="share-actions">
            <button
              className="share-btn share-btn-x"
              onClick={() => {
                const tier = getTierName();
                trackQuizEvents.socialShare?.('x', results.correctCount, tier);
                const { x } = getShareUrls({ score: results.correctCount, total: results.totalCount, tierName: tier });
                openShareWindow(x);
              }}
              aria-label="Share on X"
              title="Share on X"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button
              className="share-btn share-btn-facebook"
              onClick={() => {
                const tier = getTierName();
                trackQuizEvents.socialShare?.('facebook', results.correctCount, tier);
                const { facebook } = getShareUrls({ score: results.correctCount, total: results.totalCount, tierName: tier });
                openShareWindow(facebook);
              }}
              aria-label="Share on Facebook"
              title="Share on Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              className="share-btn share-btn-reddit"
              onClick={() => {
                const tier = getTierName();
                trackQuizEvents.socialShare?.('reddit', results.correctCount, tier);
                const { reddit } = getShareUrls({ score: results.correctCount, total: results.totalCount, tierName: tier });
                openShareWindow(reddit);
              }}
              aria-label="Share on Reddit"
              title="Share on Reddit"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4500">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </button>
          </div>
          <p className="retake-intro">Ready to improve your score and learn more?</p>
          <div className="retake-actions">
            <button
              onClick={() => useQuizStore.getState().resetQuiz()}
              className="retake-btn"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => useQuizStore.getState().shuffleAndRetry()}
              className="retake-btn"
            >
              🔀 Shuffle and Retry
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Results;
