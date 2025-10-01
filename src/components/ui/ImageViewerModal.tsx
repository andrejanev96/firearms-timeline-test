import React from 'react';
import Portal from './Portal';
import type { Firearm } from '@/types/quiz';

type Props = {
  open: boolean;
  firearm: Firearm | null;
  onClose: () => void;
  returnFocusEl?: HTMLElement | null;
};

export default function ImageViewerModal({ open, firearm, onClose, returnFocusEl }: Props) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        // Simple focus trap
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
      // restore focus
      if (returnFocusEl && typeof returnFocusEl.focus === 'function') {
        returnFocusEl.focus();
      } else {
        prevActive?.focus?.();
      }
    };
  }, [open, onClose, returnFocusEl]);

  // Backdrop click closes - handle both overlay and content area clicks
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current || e.target === contentRef.current) {
      onClose();
    }
  };

  if (!open || !firearm) return null;

  return (
    <Portal>
      <div
        className="image-viewer-overlay"
        ref={overlayRef}
        onClick={onBackdrop}
        role="dialog"
        aria-modal="true"
        aria-label={`Image viewer: ${firearm.name}`}
      >
        <div
          className="image-viewer-content"
          ref={contentRef}
          onClick={onBackdrop}
        >
          <figure className="image-viewer-figure">
            <div className="image-viewer-canvas">
              <img
                key={firearm.id}
                src={firearm.imageLarge ?? firearm.image}
                alt={firearm.name}
                className="image-viewer-img"
                draggable={false}
                loading="lazy"
              />
            </div>
            <figcaption className="image-viewer-caption">{firearm.name}</figcaption>
          </figure>
          {/* Details block for correct items */}
          {firearm.correct && (
            <div className="image-viewer-details" aria-labelledby="viewer-details-heading">
              <h3 id="viewer-details-heading" className="sr-only">Details</h3>
              <div className="details-inner">
                <div className="details-label">✨ Fact Unlocked</div>
                {typeof firearm.year === 'number' && (
                  <div className="year-introduced">
                    <span className="year-label">Introduced In:</span>
                    <span className="year-badge" aria-label={`Year ${firearm.year}`}>{firearm.year}</span>
                  </div>
                )}
                <div className="fact-content">
                  {Array.isArray(firearm.facts) && firearm.facts.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {firearm.facts.slice(0, 3).map((s, i) => (
                        <li key={i} className="fact-text">{s}</li>
                      ))}
                    </ul>
                  ) : firearm.fact ? (
                    <p className="fact-text">{firearm.fact}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
          <div className="image-viewer-controls">
            <button
              className="viewer-btn viewer-close"
              onClick={onClose}
              aria-label="Close viewer"
              ref={closeBtnRef}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
