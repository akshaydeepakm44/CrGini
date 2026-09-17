import React, { useEffect, useRef } from 'react';

/**
 * PortalCosmicBackground
 * Scoped ambient cosmic starfield layer exclusively for internal dashboards.
 * Runs independently with pointer-events: none, z-index: 0, and zero scroll interference.
 */
export default function PortalCosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 160 ambient stars with slow drifting and subtle pulsing
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      color: Math.random() > 0.4 ? 'rgba(0, 217, 255, ' : Math.random() > 0.5 ? 'rgba(255, 176, 0, ' : 'rgba(245, 245, 245, '
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Subtle deep radial cosmic gradient
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        50,
        width * 0.5,
        height * 0.4,
        Math.max(width, height)
      );
      grad.addColorStop(0, 'rgba(6, 17, 26, 0.95)');
      grad.addColorStop(0.5, 'rgba(4, 12, 18, 0.98)');
      grad.addColorStop(1, '#030303');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render gentle drifting cosmic particles
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const currentAlpha = s.baseAlpha + Math.sin(frame * s.pulseSpeed + s.pulseOffset) * 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${Math.max(0.05, Math.min(0.9, currentAlpha))})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
      aria-hidden="true"
    />
  );
}
