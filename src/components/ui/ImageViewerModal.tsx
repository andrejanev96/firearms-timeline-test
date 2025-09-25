import React from 'react';
import Portal from './Portal';
import type { Firearm } from '@/types/quiz';

type Props = {
  open: boolean;
  items: Firearm[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  loop?: boolean;
  returnFocusEl?: HTMLElement | null;
};

const clampIndex = (i: number, len: number, loop: boolean) => {
  if (len <= 0) return 0;
  if (!loop) return Math.max(0, Math.min(len - 1, i));
  const mod = ((i % len) + len) % len;
  return mod;
};

export default function ImageViewerModal({ open, items, index, onClose, onNavigate, loop = true, returnFocusEl }: Props) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const startTouchX = React.useRef<number | null>(null);
  const startTouchY = React.useRef<number | null>(null);
  const [localIndex, setLocalIndex] = React.useState(index);
  const len = items.length;

  React.useEffect(() => {
    setLocalIndex(index);
  }, [index]);

  // Focus management: trap focus and restore
  React.useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
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
  }, [open]);

  const navigate = (delta: number) => {
    if (len <= 0) return;
    const next = clampIndex(localIndex + delta, len, loop);
    setLocalIndex(next);
    onNavigate(next);
  };

  // Backdrop click closes
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Touch swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startTouchX.current = t.clientX;
    startTouchY.current = t.clientY;
  };
  const onTouchMove = (_e: React.TouchEvent) => {
    // allow
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const end = e.changedTouches[0];
    const sx = startTouchX.current;
    const sy = startTouchY.current;
    startTouchX.current = null;
    startTouchY.current = null;
    if (sx == null || sy == null) return;
    const dx = end.clientX - sx;
    const dy = end.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) navigate(1);
      else navigate(-1);
    }
  };

  // Preload next/prev images
  React.useEffect(() => {
    if (!open || len <= 1) return;
    const next = clampIndex(localIndex + 1, len, loop);
    const prev = clampIndex(localIndex - 1, len, loop);
    const toLoad = [items[next]?.image, items[prev]?.image].filter(Boolean) as string[];
    toLoad.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [open, localIndex, len, loop, items]);

  if (!open) return null;

  const current = items[localIndex];

  return (
    <Portal>
      <div
        className="image-viewer-overlay"
        ref={overlayRef}
        onMouseDown={onBackdrop}
        role="dialog"
        aria-modal="true"
        aria-label={current?.name ? `Image viewer: ${current.name}` : 'Image viewer'}
      >
        <div
          className="image-viewer-content"
          ref={contentRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <figure className="image-viewer-figure">
            {current && (
              <div className="image-viewer-canvas">
                <img
                  key={current.id}
                  src={current.imageLarge ?? current.image}
                  alt={current.name}
                  className="image-viewer-img"
                  draggable={false}
                />
              </div>
            )}
            {current && <figcaption className="image-viewer-caption">{current.name}</figcaption>}
          </figure>
          {/* Details block for correct items */}
          {current && current.correct && (
            <div className="image-viewer-details" aria-labelledby="viewer-details-heading">
              <h3 id="viewer-details-heading" className="sr-only">Details</h3>
              <div className="details-inner">
                <div className="header-row">
                  <div className="details-label">Fact Unlocked</div>
                  {typeof current.year === 'number' && (
                    <span className="year-badge" aria-label={`Year ${current.year}`}>{current.year}</span>
                  )}
                </div>
                {Array.isArray(current.facts) && current.facts.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {current.facts.slice(0, 3).map((s, i) => (
                      <li key={i} className="fact-text">{s}</li>
                    ))}
                  </ul>
                ) : current.fact ? (
                  <p className="fact-text">{current.fact}</p>
                ) : null}
              </div>
            </div>
          )}
          <div className="image-viewer-controls">
            <button
              className="viewer-btn viewer-prev"
              onClick={() => navigate(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="viewer-btn viewer-next"
              onClick={() => navigate(1)}
              aria-label="Next image"
            >
              ›
            </button>
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
