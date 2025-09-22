export function fireConfettiOnce(durationMs = 1200, count = 100) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.transform = 'translateZ(0)';
  document.body.appendChild(canvas);

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  };
  resize();

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const colors = ['#DAA520', '#F44336', '#4CAF50', '#ffffff'];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const particles = Array.from({ length: Math.max(30, count) }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 6;
    return {
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
    };
  });

  const start = performance.now();
  const gravity = 0.12;
  const drag = 0.995;

  function frame(now: number) {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      // fade out over time
      p.life = Math.max(0, 1 - t / (durationMs + 400));
      ctx.globalAlpha = p.life;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
      ctx.globalAlpha = 1;
    });
    if (t < durationMs + 500) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
