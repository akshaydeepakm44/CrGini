import React, { useEffect, useRef } from 'react';

export default function CreativeGiniParticles({ introProgress = 0, width, height }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const progressRef = useRef(introProgress);
  const particlesRef = useRef(null);

  useEffect(() => {
    progressRef.current = introProgress;
  }, [introProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = width || window.innerWidth);
    const h = (canvas.height = height || window.innerHeight);

    // Initialize 80 particles ONCE with deterministic seed
    if (!particlesRef.current) {
      const PARTICLE_COUNT = 80;
      const particles = [];

      const corners = [
        { x: w * 0.08, y: h * 0.12, color: [56, 189, 248] }, // Top-Left: Cyan / Sky
        { x: w * 0.92, y: h * 0.12, color: [168, 85, 247] }, // Top-Right: Violet / Purple
        { x: w * 0.08, y: h * 0.88, color: [245, 158, 11] }, // Bottom-Left: Warm Gold
        { x: w * 0.92, y: h * 0.88, color: [236, 72, 153] }  // Bottom-Right: Magenta / Pink
      ];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const corner = corners[i % 4];
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const radius = 30 + (i % 6) * 22;

        particles.push({
          cornerX: corner.x + Math.cos(angle) * radius,
          cornerY: corner.y + Math.sin(angle) * radius,
          x: corner.x + Math.cos(angle) * radius,
          y: corner.y + Math.sin(angle) * radius,
          baseSize: 1.6 + (i % 4) * 0.6,
          alpha: 0.45 + (i % 5) * 0.1,
          color: corner.color,
          orbitAngle: angle,
          orbitSpeed: (0.015 + (i % 3) * 0.006) * (i % 2 === 0 ? 1 : -1),
          orbitRadius: 45 + (i % 7) * 22,
          zDepth: ((i % 10) - 5) / 5
        });
      }
      particlesRef.current = particles;
    }

    const particles = particlesRef.current;
    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // p is normalized between 0.0 and 1.0
      const p = Math.max(0, Math.min(1, progressRef.current));
      const centerX = w * 0.5;
      const centerY = h * 0.5;

      particles.forEach((pt, idx) => {
        pt.orbitAngle += pt.orbitSpeed;

        // Smooth cartoon trajectory interpolation forward & backward
        if (p <= 0.35) {
          // p in [0.0, 0.35]: Smooth curved glide from corner toward center
          const t = p / 0.35;
          const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          const targetX = centerX + Math.cos(pt.orbitAngle) * (pt.orbitRadius + (1 - easeT) * 280);
          const targetY = centerY + Math.sin(pt.orbitAngle) * (pt.orbitRadius + (1 - easeT) * 220);

          pt.x = pt.cornerX + (targetX - pt.cornerX) * easeT + Math.sin(time + idx) * 6;
          pt.y = pt.cornerY + (targetY - pt.cornerY) * easeT + Math.cos(time + idx) * 6;
        } else if (p <= 0.70) {
          // p in [0.35, 0.70]: Vortex portal convergence
          const t = (p - 0.35) / 0.35;
          const currentRadius = pt.orbitRadius * (1 - t * 0.35) + Math.sin(time * 2 + idx) * 10;
          pt.x = centerX + Math.cos(pt.orbitAngle + time * 1.6) * currentRadius;
          pt.y = centerY + Math.sin(pt.orbitAngle + time * 1.6) * currentRadius;
        } else {
          // p in [0.70, 1.00]: Radiant aura halo around Gini
          const currentRadius = pt.orbitRadius * 0.75 + Math.sin(time * 1.5 + idx) * 8;
          pt.x = centerX + Math.cos(pt.orbitAngle + time * 0.9) * currentRadius;
          pt.y = centerY + Math.sin(pt.orbitAngle + time * 0.9) * currentRadius;
        }

        // 3D Depth scaling
        const depthScale = 1 + pt.zDepth * 0.3 * p;
        const drawSize = pt.baseSize * depthScale;
        const drawAlpha = pt.alpha * (0.4 + 0.6 * p);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pt.color[0]}, ${pt.color[1]}, ${pt.color[2]}, ${drawAlpha})`;
        ctx.shadowBlur = 8 * depthScale;
        ctx.shadowColor = `rgb(${pt.color[0]}, ${pt.color[1]}, ${pt.color[2]})`;
        ctx.fill();

        // Subtle glowing tail during convergence
        if (p > 0.15 && p < 0.85) {
          const tailLen = 14 * Math.sin(p * Math.PI);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(
            pt.x - Math.cos(pt.orbitAngle) * tailLen,
            pt.y - Math.sin(pt.orbitAngle) * tailLen
          );
          ctx.strokeStyle = `rgba(${pt.color[0]}, ${pt.color[1]}, ${pt.color[2]}, ${drawAlpha * 0.45})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="creativegini-particles-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  );
}
