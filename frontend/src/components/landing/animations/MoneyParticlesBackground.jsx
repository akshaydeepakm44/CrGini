import React, { useEffect, useRef } from 'react';

/**
 * MoneyParticlesBackground
 * Scene 04 Clean & Elegant Background FX Engine:
 * - Curated flanking 3D luxury banknotes & luminous dollar glyphs framing the cards
 * - Center reading zone kept clean, elegant, and unobstructed
 * - Smooth scroll-driven particle assembly on entry and radial dispatch on exit
 * - Serene aerodynamic drift & realistic flutter
 */
export default function MoneyParticlesBackground({
  assembleProgressRef = null,
  dispatchProgressRef = null
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  // Smooth scroll progression refs
  const internalAssembleProgressRef = useRef(0);
  const targetAssembleProgressRef = useRef(0);
  const internalDispatchProgressRef = useRef(0);
  const targetDispatchProgressRef = useRef(0);

  // Dual-tracking scroll listener: detects assembly on entry and dispatch on exit
  useEffect(() => {
    const handleScroll = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const section = canvas.closest('.scene4-pinned-section') || canvas.closest('#scene-04-costs-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      // 1. Entry Assemble Window:
      const startAssemble = windowH * 0.95;
      const endAssemble = windowH * 0.10;

      let aProg = 0;
      if (rect.top >= startAssemble) {
        aProg = 0;
      } else if (rect.top <= endAssemble) {
        aProg = 1;
      } else {
        aProg = (startAssemble - rect.top) / (startAssemble - endAssemble);
      }
      targetAssembleProgressRef.current = Math.max(0, Math.min(1, aProg));

      // 2. Exit Dispatch Window:
      const dispatchDist = windowH * 0.8;
      if (rect.top < -40) {
        targetDispatchProgressRef.current = Math.min(1, (-40 - rect.top) / dispatchDist);
      } else {
        targetDispatchProgressRef.current = 0;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse tracking for aerodynamic turbulence
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      mouseRef.current.vx = (currentX - mouseRef.current.lastX) * 0.3;
      mouseRef.current.vy = (currentY - mouseRef.current.lastY) * 0.3;
      mouseRef.current.lastX = currentX;
      mouseRef.current.lastY = currentY;
      mouseRef.current.x = currentX;
      mouseRef.current.y = currentY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // ==========================================
    // 1. CURATED BANKNOTE DEFINITIONS (7 LUXURY BILLS)
    // Strategically positioned in flanking corridors to keep center clean
    // ==========================================
    const NOTE_COUNT = 7;
    const banknotes = [];

    const BILL_COLOR_SCHEMES = [
      {
        // Emerald Reserve ($100)
        bgStart: '#06281b',
        bgMid: '#0d4a32',
        bgEnd: '#041f15',
        border: 'rgba(251, 191, 36, 0.85)',
        innerBorder: 'rgba(52, 211, 153, 0.55)',
        sealBg: 'rgba(16, 185, 129, 0.25)',
        sealBorder: 'rgba(251, 191, 36, 0.75)',
        text: '#fef08a',
        subText: '#6ee7b7',
        glow: 'rgba(16, 185, 129, 0.45)',
        denomination: '100'
      },
      {
        // Dark Obsidian Gold ($1000)
        bgStart: '#181507',
        bgMid: '#382f0d',
        bgEnd: '#130f04',
        border: 'rgba(251, 191, 36, 0.95)',
        innerBorder: 'rgba(245, 158, 11, 0.65)',
        sealBg: 'rgba(245, 158, 11, 0.3)',
        sealBorder: 'rgba(251, 191, 36, 0.9)',
        text: '#fef3c7',
        subText: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.45)',
        denomination: '1000'
      },
      {
        // Cosmic Cyan Mint ($50)
        bgStart: '#04222a',
        bgMid: '#084353',
        bgEnd: '#031920',
        border: 'rgba(0, 240, 255, 0.85)',
        innerBorder: 'rgba(56, 189, 248, 0.55)',
        sealBg: 'rgba(0, 240, 255, 0.25)',
        sealBorder: 'rgba(251, 191, 36, 0.75)',
        text: '#e0f2fe',
        subText: '#38bdf8',
        glow: 'rgba(0, 240, 255, 0.45)',
        denomination: '50'
      }
    ];

    const wRef = width || 1200;
    const hRef = height || 800;

    for (let i = 0; i < NOTE_COUNT; i++) {
      const isLeft = i % 2 === 0;
      const isDeep = i === 6;

      const depth = isDeep ? 0.35 : (0.55 + (i % 3) * 0.15);
      const baseW = 110 * depth;
      const baseH = 58 * depth;

      // Strict flanking corridor bounds
      let minX, maxX;
      if (isDeep) {
        minX = wRef * 0.35;
        maxX = wRef * 0.65;
      } else if (isLeft) {
        minX = wRef * 0.03;
        maxX = wRef * 0.22;
      } else {
        minX = wRef * 0.78;
        maxX = wRef * 0.97;
      }

      const initX = minX + Math.random() * (maxX - minX);
      const initY = (hRef * 0.1) + (i / NOTE_COUNT) * (hRef * 0.8);

      // Clean assembly particles (8 anchor points per bill, no messy spiderwebs)
      const assemblyParticles = [];
      const pCount = 8;
      for (let j = 0; j < pCount; j++) {
        let relX = (j % 2 === 0 ? -1 : 1) * (baseW * 0.45);
        let relY = (j < 4 ? -1 : 1) * (baseH * 0.4);
        if (j >= 4) {
          relX = (j === 4 ? -1 : j === 5 ? 1 : 0) * (baseW * 0.3);
          relY = (j === 6 ? -1 : 1) * (baseH * 0.35);
        }

        assemblyParticles.push({
          targetRelX: relX,
          targetRelY: relY,
          scatterAngle: Math.random() * Math.PI * 2,
          scatterDist: 160 + Math.random() * 180,
          spiralTurns: 2.0 + Math.random() * 1.5,
          size: Math.random() * 1.8 + 1.2,
          sparklePhase: Math.random() * Math.PI * 2
        });
      }

      const dispatchAngle = isLeft ? (-Math.PI * 0.8 + (Math.random() - 0.5) * 0.6) : (-Math.PI * 0.2 + (Math.random() - 0.5) * 0.6);
      const dispatchDist = 350 + Math.random() * 250;

      banknotes.push({
        id: i,
        x: initX,
        y: initY,
        minX,
        maxX,
        width: baseW,
        height: baseH,
        depth,
        isDeep,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.35 + 0.25) * (0.6 + depth * 0.4), // Tranquil, serene float
        rotX: (Math.random() - 0.5) * 0.3,
        rotY: (Math.random() - 0.5) * 0.4,
        rotZ: (Math.random() - 0.5) * 0.3,
        vRotX: (Math.random() - 0.5) * 0.008,
        vRotY: (Math.random() - 0.5) * 0.012,
        vRotZ: (Math.random() - 0.5) * 0.006,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterSpeed: Math.random() * 0.025 + 0.015,
        scheme: BILL_COLOR_SCHEMES[i % BILL_COLOR_SCHEMES.length],
        alpha: isDeep ? 0.22 : (0.45 + depth * 0.45),
        assemblyParticles,
        dispatchAngle,
        dispatchDist
      });
    }

    // ==========================================
    // 2. CURATED GLOWING DOLLAR SYMBOLS ($) (7 GLYPHS)
    // ==========================================
    const DOLLAR_COUNT = 7;
    const dollarGlyphs = [];

    const GLYPH_PALETTES = [
      { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.75)' },
      { color: '#34d399', glow: 'rgba(52, 211, 153, 0.75)' },
      { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.65)' },
      { color: '#fef08a', glow: 'rgba(254, 240, 138, 0.75)' }
    ];

    for (let i = 0; i < DOLLAR_COUNT; i++) {
      const palette = GLYPH_PALETTES[i % GLYPH_PALETTES.length];
      const isLeft = i % 2 === 0;
      const isTopCorner = i === 6;

      let minX, maxX;
      if (isTopCorner) {
        minX = wRef * 0.30;
        maxX = wRef * 0.70;
      } else if (isLeft) {
        minX = wRef * 0.04;
        maxX = wRef * 0.24;
      } else {
        minX = wRef * 0.76;
        maxX = wRef * 0.96;
      }

      const scale = Math.random() * 0.45 + 0.45;
      const size = Math.round((Math.random() * 16 + 16) * scale);

      const assemblyParticles = [];
      const gCount = 6;
      for (let j = 0; j < gCount; j++) {
        const t = j / (gCount - 1);
        assemblyParticles.push({
          targetRelX: Math.sin(t * Math.PI * 2) * (size * 0.3),
          targetRelY: (t - 0.5) * size * 0.8,
          scatterAngle: Math.random() * Math.PI * 2,
          scatterDist: 120 + Math.random() * 140,
          spiralTurns: 1.8 + Math.random() * 1.5,
          size: Math.random() * 1.6 + 1.0,
          sparklePhase: Math.random() * Math.PI * 2
        });
      }

      const dispatchAngle = isLeft ? (-Math.PI * 0.75) : (-Math.PI * 0.25);

      dollarGlyphs.push({
        x: minX + Math.random() * (maxX - minX),
        y: (hRef * 0.15) + (i / DOLLAR_COUNT) * (hRef * 0.75),
        minX,
        maxX,
        size,
        scale,
        rot: (Math.random() - 0.5) * 0.3,
        vRot: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.4 + 0.3),
        pulsePhase: Math.random() * Math.PI * 2,
        color: palette.color,
        glow: palette.glow,
        opacity: Math.random() * 0.35 + 0.35,
        driftOffset: Math.random() * 100,
        assemblyParticles,
        dispatchAngle,
        dispatchDist: 280 + Math.random() * 200
      });
    }

    // ==========================================
    // 3. CURATED AMBIENT STARDUST (40 PARTICLES)
    // ==========================================
    const PARTICLE_COUNT = 40;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isGold = Math.random() < 0.55;
      const rgb = isGold ? '251, 191, 36' : (Math.random() < 0.5 ? '0, 240, 255' : '52, 211, 153');

      particles.push({
        x: Math.random() * wRef,
        y: Math.random() * hRef,
        size: Math.random() * 1.8 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.45 + 0.2),
        rgb,
        alpha: Math.random() * 0.55 + 0.2,
        sparkleSpeed: Math.random() * 0.04 + 0.02,
        sparklePhase: Math.random() * Math.PI * 2,
        isGlint: Math.random() < 0.12
      });
    }

    // ==========================================
    // DRAW HELPERS
    // ==========================================
    const drawBanknote = (note, time, aProg, dProg) => {
      const {
        x,
        y,
        width: w,
        height: h,
        rotX,
        rotY,
        rotZ,
        flutterPhase,
        scheme,
        alpha,
        assemblyParticles,
        dispatchAngle,
        dispatchDist
      } = note;

      const invA = 1 - aProg;
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // 1. Draw Assembly Particles (only when converging or dispatching)
      if (aProg < 0.98 || dProg > 0.01) {
        ctx.save();
        for (let j = 0; j < assemblyParticles.length; j++) {
          const p = assemblyParticles[j];
          let px, py;

          if (dProg > 0) {
            const curDist = Math.pow(dProg, 1.3) * (dispatchDist * 0.7);
            px = x + p.targetRelX + Math.cos(p.scatterAngle) * curDist;
            py = y + p.targetRelY + Math.sin(p.scatterAngle) * curDist;
          } else {
            const curSpiral = invA * p.spiralTurns;
            const curAngle = p.scatterAngle + curSpiral;
            const curDist = p.scatterDist * Math.pow(invA, 1.4);

            const rotatedRelX = (p.targetRelX * cosZ - p.targetRelY * sinZ) * aProg;
            const rotatedRelY = (p.targetRelX * sinZ + p.targetRelY * cosZ) * aProg;

            px = x + rotatedRelX + Math.cos(curAngle) * curDist;
            py = y + rotatedRelY + Math.sin(curAngle) * curDist;
          }

          const sparkle = (Math.sin(p.sparklePhase + time * 3) + 1) * 0.5;
          const pAlpha = (1 - dProg * 0.85) * (0.3 + aProg * 0.7) * (0.6 + sparkle * 0.4);

          ctx.fillStyle = scheme.text;
          ctx.shadowColor = scheme.glow;
          ctx.shadowBlur = 6;
          ctx.globalAlpha = Math.max(0, Math.min(1, pAlpha));
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 + sparkle * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (aProg < 0.20 && dProg === 0) return;

      // 2. Materialize Solid 3D Banknote
      ctx.save();

      let renderX = x;
      let renderY = y;
      if (dProg > 0) {
        const dOffset = Math.pow(dProg, 1.35) * dispatchDist;
        renderX += Math.cos(dispatchAngle) * dOffset;
        renderY += Math.sin(dispatchAngle) * dOffset;
      }

      ctx.translate(renderX, renderY);
      ctx.rotate(rotZ + dProg * 0.3);

      const cosY = Math.cos(rotY + Math.sin(flutterPhase) * 0.3);
      const cosX = Math.cos(rotX + Math.cos(flutterPhase) * 0.18);

      const scaleEmerge = Math.min(1, (aProg - 0.20) / 0.80);
      const curScale = (scaleEmerge * 0.95 + 0.05) * (1 + dProg * 0.35);
      const curAlpha = Math.min(1, (aProg - 0.24) / 0.68) * (1 - Math.min(1, dProg * 1.5)) * alpha;

      if (curAlpha <= 0.01) {
        ctx.restore();
        return;
      }

      ctx.scale(
        (Math.abs(cosY) * 0.95 + 0.05) * curScale,
        (Math.abs(cosX) * 0.9 + 0.1) * curScale
      );
      ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));

      const rx = -w / 2;
      const ry = -h / 2;
      const pad = Math.max(2, w * 0.035);

      // Subtle ambient outer glow
      ctx.shadowColor = scheme.glow;
      ctx.shadowBlur = 12 * Math.abs(cosY);

      // 1. Banknote Body Gradient
      const bgGrad = ctx.createLinearGradient(rx, ry, rx + w, ry + h);
      bgGrad.addColorStop(0, scheme.bgStart);
      bgGrad.addColorStop(0.5, scheme.bgMid);
      bgGrad.addColorStop(1, scheme.bgEnd);

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(rx, ry, w, h, 4);
      } else {
        ctx.rect(rx, ry, w, h);
      }
      ctx.fill();

      ctx.shadowBlur = 0;

      // 2. Guilloche Border
      ctx.strokeStyle = scheme.border;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.strokeStyle = scheme.innerBorder;
      ctx.lineWidth = 0.7;
      ctx.strokeRect(rx + pad, ry + pad, w - pad * 2, h - pad * 2);

      // Corner rosettes
      const rSize = pad * 1.4;
      ctx.fillStyle = scheme.border;
      ctx.fillRect(rx + pad, ry + pad, rSize, rSize);
      ctx.fillRect(rx + w - pad - rSize, ry + pad, rSize, rSize);
      ctx.fillRect(rx + pad, ry + h - pad - rSize, rSize, rSize);
      ctx.fillRect(rx + w - pad - rSize, ry + h - pad - rSize, rSize, rSize);

      // 3. Security Holographic Foil Ribbon Strip
      const stripX = rx + w * 0.3;
      const stripW = Math.max(4, w * 0.11);
      const holoGrad = ctx.createLinearGradient(stripX, ry, stripX + stripW, ry + h);
      const shimmer = (Math.sin(time * 2.5 + note.id * 1.2) + 1) * 0.5;
      holoGrad.addColorStop(0, `rgba(0, 240, 255, ${0.4 + shimmer * 0.3})`);
      holoGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.5 + shimmer * 0.3})`);
      holoGrad.addColorStop(1, `rgba(16, 185, 129, ${0.4 + shimmer * 0.3})`);
      ctx.fillStyle = holoGrad;
      ctx.fillRect(stripX, ry + pad, stripW, h - pad * 2);

      // 4. Central Cameo & Dollar Seal
      const sealR = Math.max(7, h * 0.25);
      const sealX = rx + w * 0.58;
      const sealY = ry + h * 0.5;

      ctx.fillStyle = scheme.sealBg;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = scheme.sealBorder;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.fillStyle = scheme.text;
      ctx.font = `800 ${Math.round(h * 0.32)}px 'Space Grotesk', 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', sealX, sealY);

      // 5. Corner Denominations
      ctx.font = `700 ${Math.max(7, Math.round(h * 0.19))}px 'Space Grotesk', 'JetBrains Mono', monospace`;
      ctx.fillStyle = scheme.text;
      ctx.fillText(scheme.denomination, rx + pad + rSize + 6, ry + pad + 6);
      ctx.fillText(scheme.denomination, rx + w - pad - rSize - 6, ry + h - pad - 6);

      // 6. Micro-Engraving Header
      ctx.font = `600 ${Math.max(5, Math.round(h * 0.09))}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = scheme.subText;
      ctx.fillText('CREATIVEGINI', rx + w * 0.56, ry + pad + 5);

      // 7. Specular Sheen
      const sheenGrad = ctx.createLinearGradient(rx, ry, rx + w, ry);
      let sheenPos = (Math.cos(rotY * 2 + time * 1.8) + 1) * 0.5;

      if (aProg >= 0.90 && aProg <= 1.0 && dProg === 0) {
        sheenPos = (aProg - 0.90) / 0.10;
        sheenGrad.addColorStop(Math.max(0, sheenPos - 0.2), 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(sheenPos, 'rgba(255, 255, 255, 0.45)');
        sheenGrad.addColorStop(Math.min(1, sheenPos + 0.2), 'rgba(255, 255, 255, 0)');
      } else {
        sheenGrad.addColorStop(Math.max(0, sheenPos - 0.2), 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(sheenPos, 'rgba(255, 255, 255, 0.2)');
        sheenGrad.addColorStop(Math.min(1, sheenPos + 0.2), 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(rx, ry, w, h);

      ctx.restore();
    };

    const drawDollar = (dollar, time, aProg, dProg) => {
      const {
        x,
        y,
        size,
        rot,
        color,
        glow,
        opacity,
        pulsePhase,
        assemblyParticles,
        dispatchAngle,
        dispatchDist
      } = dollar;

      const invA = 1 - aProg;

      if (aProg < 0.98 || dProg > 0.01) {
        ctx.save();
        for (let j = 0; j < assemblyParticles.length; j++) {
          const p = assemblyParticles[j];
          let px, py;

          if (dProg > 0) {
            const curDist = Math.pow(dProg, 1.3) * (dispatchDist * 0.65);
            px = x + p.targetRelX + Math.cos(p.scatterAngle) * curDist;
            py = y + p.targetRelY + Math.sin(p.scatterAngle) * curDist;
          } else {
            const curSpiral = invA * p.spiralTurns;
            const curAngle = p.scatterAngle + curSpiral;
            const curDist = p.scatterDist * Math.pow(invA, 1.35);

            px = x + p.targetRelX * aProg + Math.cos(curAngle) * curDist;
            py = y + p.targetRelY * aProg + Math.sin(curAngle) * curDist;
          }

          const sparkle = (Math.sin(p.sparklePhase + time * 3) + 1) * 0.5;
          const pAlpha = (1 - dProg * 0.85) * (0.3 + aProg * 0.7) * (0.5 + sparkle * 0.4);

          ctx.fillStyle = color;
          ctx.shadowColor = glow;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = Math.max(0, Math.min(1, pAlpha));
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 + sparkle * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (aProg < 0.20 && dProg === 0) return;

      let renderX = x;
      let renderY = y;
      if (dProg > 0) {
        const dOffset = Math.pow(dProg, 1.35) * dispatchDist;
        renderX += Math.cos(dispatchAngle) * dOffset;
        renderY += Math.sin(dispatchAngle) * dOffset;
      }

      const pulse = Math.sin(pulsePhase + time * 2) * 0.12 + 1;
      const scaleEmerge = Math.min(1, (aProg - 0.20) / 0.80);
      const curScale = scaleEmerge * pulse * (1 + dProg * 0.35);
      const curAlpha = Math.min(1, (aProg - 0.22) / 0.65) * (1 - Math.min(1, dProg * 1.5)) * opacity;

      if (curAlpha <= 0.01) return;

      ctx.save();
      ctx.translate(renderX, renderY);
      ctx.rotate(rot + dProg * 0.25);
      ctx.scale(curScale, curScale);
      ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));

      ctx.shadowColor = glow;
      ctx.shadowBlur = size * 0.7;

      ctx.font = `800 ${size}px 'Space Grotesk', 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText('$', 0, 0);

      ctx.shadowBlur = size * 0.2;
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = curAlpha * 0.8;
      ctx.fillText('$', 0, 0);

      ctx.restore();
    };

    const drawParticle = (p, time, aProg, dProg) => {
      const sparkle = (Math.sin(p.sparklePhase + time * 2.5) + 1) * 0.5;
      const curAlpha = p.alpha * (0.6 + sparkle * 0.4) * (1 - dProg * 0.7) * (0.4 + aProg * 0.6);

      if (curAlpha <= 0.01) return;

      ctx.save();
      ctx.fillStyle = `rgba(${p.rgb}, ${curAlpha})`;
      ctx.shadowColor = `rgba(${p.rgb}, 0.7)`;
      ctx.shadowBlur = p.size * 2.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.isGlint && sparkle > 0.65 && aProg > 0.5) {
        const glintLen = p.size * (2.5 + sparkle * 2.5);
        ctx.strokeStyle = `rgba(${p.rgb}, ${curAlpha * 0.85})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - glintLen, p.y);
        ctx.lineTo(p.x + glintLen, p.y);
        ctx.moveTo(p.x, p.y - glintLen);
        ctx.lineTo(p.x, p.y + glintLen);
        ctx.stroke();
      }

      ctx.restore();
    };

    // ==========================================
    // MAIN RENDER & PHYSICS LOOP
    // ==========================================
    let time = 0;

    const render = () => {
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      let targetA = targetAssembleProgressRef.current;
      if (assembleProgressRef && assembleProgressRef.current !== undefined) {
        targetA = Math.max(targetA, assembleProgressRef.current);
      }

      let targetD = targetDispatchProgressRef.current;
      if (dispatchProgressRef && dispatchProgressRef.current !== undefined) {
        targetD = Math.max(targetD, dispatchProgressRef.current);
      }

      internalAssembleProgressRef.current += (targetA - internalAssembleProgressRef.current) * 0.20;
      if (Math.abs(targetA - internalAssembleProgressRef.current) < 0.002) {
        internalAssembleProgressRef.current = targetA;
      }

      internalDispatchProgressRef.current += (targetD - internalDispatchProgressRef.current) * 0.20;
      if (Math.abs(targetD - internalDispatchProgressRef.current) < 0.002) {
        internalDispatchProgressRef.current = targetD;
      }

      const aProg = Math.max(0, Math.min(1, internalAssembleProgressRef.current));
      const dProg = Math.max(0, Math.min(1, internalDispatchProgressRef.current));

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;

      mouseRef.current.vx *= 0.90;
      mouseRef.current.vy *= 0.90;

      // 1. Ambient Stardust Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mx > -500 && aProg > 0.5) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < 16000) {
            const dist = Math.sqrt(distSq) || 1;
            const force = (1 - dist / 126) * 1.2;
            p.x += (dx / dist) * force + mvx * 0.1;
            p.y += (dy / dist) * force + mvy * 0.1;
          }
        }

        p.x += p.vx + Math.sin(time + p.sparklePhase) * 0.2;
        p.y += p.vy;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        drawParticle(p, time, aProg, dProg);
      }

      // 2. Floating Dollar Glyphs ($)
      for (let i = 0; i < dollarGlyphs.length; i++) {
        const d = dollarGlyphs[i];

        if (mx > -500 && aProg > 0.6) {
          const dx = d.x - mx;
          const dy = d.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < 25000) {
            const dist = Math.sqrt(distSq) || 1;
            const force = (1 - dist / 158) * 1.6;
            d.x += (dx / dist) * force + mvx * 0.15;
            d.y += (dy / dist) * force + mvy * 0.15;
            d.rot += (dx > 0 ? 0.015 : -0.015);
          }
        }

        d.x += d.vx + Math.cos(time * 1.1 + d.driftOffset) * 0.35;
        d.y += d.vy;
        d.rot += d.vRot;

        if (d.y < -50) {
          d.y = height + 40;
          d.x = d.minX + Math.random() * (d.maxX - d.minX);
        }
        if (d.x < d.minX - 30) d.x = d.minX;
        if (d.x > d.maxX + 30) d.x = d.maxX;

        drawDollar(d, time, aProg, dProg);
      }

      // 3. 3D Tumbling Luxury Banknotes
      for (let i = 0; i < banknotes.length; i++) {
        const n = banknotes[i];

        if (mx > -500 && aProg > 0.6) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < 36000) {
            const dist = Math.sqrt(distSq) || 1;
            const force = (1 - dist / 189) * 2.2;
            n.x += (dx / dist) * force + mvx * 0.18;
            n.y += (dy / dist) * force + mvy * 0.18;
            n.rotX += (dy / dist) * 0.03;
            n.rotY += (dx / dist) * 0.03;
          }
        }

        n.x += n.vx + Math.sin(time + n.id) * 0.3;
        n.y += n.vy;
        n.rotX += n.vRotX;
        n.rotY += n.vRotY;
        n.rotZ += n.vRotZ;
        n.flutterPhase += n.flutterSpeed;

        if (n.y < -90) {
          n.y = height + 70;
          n.x = n.minX + Math.random() * (n.maxX - n.minX);
        }
        if (n.x < n.minX - 40) n.x = n.minX;
        if (n.x > n.maxX + 40) n.x = n.maxX;

        drawBanknote(n, time, aProg, dProg);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [assembleProgressRef, dispatchProgressRef]);

  return (
    <canvas
      ref={canvasRef}
      className="scene4-money-particles-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
