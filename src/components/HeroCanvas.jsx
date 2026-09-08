import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 155;

export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);

  // Mouse cursor tracking refs with smooth dampening
  const mouseTargetRef = useRef({ x: 0, y: 0 }); // normalized -0.5 to 0.5
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Update cursor target on mouse movement
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseTargetRef.current = { x, y };
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const x = (e.touches[0].clientX / window.innerWidth) - 0.5;
        const y = (e.touches[0].clientY / window.innerHeight) - 0.5;
        mouseTargetRef.current = { x, y };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Preload frames
    const images = new Array(TOTAL_FRAMES);
    imagesRef.current = images;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const index = i - 1;
      const numStr = String(i).padStart(3, '0');
      const filename = i === 147 ? '/ezgif-frame147.jpg' : `/ezgif-frame-${numStr}.jpg`;

      img.onload = () => {
        images[index] = img;
      };
      img.src = filename;
    }

    function getImageForIndex(targetIdx) {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, targetIdx));
      let drawImg = images[idx];

      if (!drawImg || !drawImg.complete || drawImg.naturalWidth === 0) {
        for (let i = idx; i >= 0; i--) {
          if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
            drawImg = images[i];
            break;
          }
        }
      }
      if (!drawImg || !drawImg.complete || drawImg.naturalWidth === 0) {
        for (let i = idx + 1; i < TOTAL_FRAMES; i++) {
          if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
            drawImg = images[i];
            break;
          }
        }
      }
      return drawImg;
    }

    function drawSingleImage(drawImg, alpha = 1.0) {
      if (!drawImg || !drawImg.complete || drawImg.naturalWidth === 0) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;
      const imgRatio = drawImg.naturalWidth / drawImg.naturalHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      // 1.10x zoom for smooth parallax pan
      const zoom = 1.10;

      let drawWidth, drawHeight;
      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth * zoom;
        drawHeight = (canvasWidth / imgRatio) * zoom;
      } else {
        drawHeight = canvasHeight * zoom;
        drawWidth = (canvasHeight * imgRatio) * zoom;
      }

      const baseX = (canvasWidth - drawWidth) / 2;
      const baseY = (canvasHeight - drawHeight) / 2;

      const maxPanX = 45;
      const maxPanY = 30;

      const panX = mouseCurrentRef.current.x * maxPanX;
      const panY = mouseCurrentRef.current.y * maxPanY;

      ctx.globalAlpha = alpha;
      ctx.drawImage(drawImg, baseX + panX, baseY + panY, drawWidth, drawHeight);
    }

    function renderSubFrame(frameVal) {
      if (!canvas || !ctx) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const clampedVal = Math.min(TOTAL_FRAMES - 1, Math.max(0, frameVal));
      const floorIndex = Math.floor(clampedVal);
      const ceilIndex = Math.min(TOTAL_FRAMES - 1, floorIndex + 1);
      const fraction = clampedVal - floorIndex;

      const imgFloor = getImageForIndex(floorIndex);
      const imgCeil = getImageForIndex(ceilIndex);

      // Render base floor frame
      if (imgFloor) {
        drawSingleImage(imgFloor, 1.0);
      }

      // Smooth alpha blend ceil frame over floor frame for continuous 60fps motion
      if (fraction > 0.01 && floorIndex !== ceilIndex && imgCeil && imgCeil !== imgFloor) {
        drawSingleImage(imgCeil, fraction);
      }

      ctx.globalAlpha = 1.0;
    }

    function resizeCanvas() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      renderSubFrame(currentFrameRef.current);
    }

    let animationFrameId;

    function animateLoop() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

      // Ultra-smooth lerp mouse coordinates (0.06 factor for fluid pan)
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.06;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.06;

      // Cursor movement scrub influence
      const mouseScrubOffset = mouseCurrentRef.current.x * 10;
      const baseFrame = scrollProgress * (TOTAL_FRAMES - 1);
      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, baseFrame + mouseScrubOffset));

      // Ultra-smooth frame dampening (0.08 factor for silky frame transitions)
      currentFrameRef.current += (targetFrame - currentFrameRef.current) * 0.08;

      renderSubFrame(currentFrameRef.current);

      animationFrameId = requestAnimationFrame(animateLoop);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animationFrameId = requestAnimationFrame(animateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="hero-canvas" ref={canvasRef} />;
}
