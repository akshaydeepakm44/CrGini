import React, { useEffect, useRef } from 'react';

/**
 * STAR-PARTICLE MARKET CONSTELLATION
 * 
 * Re-assembles dynamically as user scrolls from Screen 2 to Screen 3:
 * 1. Screen 2 Globe particles dispatch into deep space.
 * 2. As Screen 3 enters view, particles swirl inward and re-assemble:
 *    - Central singularity ignites and accretion disk condenses
 *    - Galaxy arms stream outward along curved bezier trajectories
 *    - Planetary stardust halos spin into orbit around each node
 *    - 6 illuminated vector icon hubs bloom outward into position
 * 3. Razor-sharp illuminated vector icons with live audience signal metrics
 * 4. Interactive cursor physics once fully assembled
 */

const GLOBE_COLORS = {
  electricBlue: [0, 174, 239],
  cyan: [0, 235, 255],
  warmGold: [255, 185, 20],
  warmOrange: [255, 130, 20],
  redditOrange: [255, 69, 0],
  devEmerald: [0, 242, 254],
  enterprisePurple: [168, 85, 247],
  pubPink: [236, 72, 153],
  softWhite: [250, 250, 255]
};

// Node Hub Coordinates in a fluid 680 x 540 space
const NODE_COORDINATES = [
  { id: 'forums', x: 170, y: 95, color: GLOBE_COLORS.cyan, title: 'Forums & Discussions', metric: '10M+ discussions' },
  { id: 'reddit', x: 500, y: 100, color: GLOBE_COLORS.redditOrange, title: 'Niche Subreddit Groups', metric: '850M+ visitors' },
  { id: 'search', x: 120, y: 270, color: GLOBE_COLORS.warmGold, title: 'Active Search Demand', metric: '8.5B+ queries/day' },
  { id: 'developers', x: 550, y: 270, color: GLOBE_COLORS.devEmerald, title: 'Developer & Tech Hubs', metric: '100M+ developers' },
  { id: 'enterprise', x: 190, y: 440, color: GLOBE_COLORS.enterprisePurple, title: 'Enterprise Networks', metric: '1B+ professionals' },
  { id: 'publications', x: 480, y: 435, color: GLOBE_COLORS.pubPink, title: 'Industry Publications', metric: 'High-authority domains' }
];

// 100% Crisp Illuminated Vector Icons
const ForumsIcon = ({ size = 28, color = '#00d9ff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M14 9a2 2 0 0 1-2 2H6l-3 3V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z" />
    <path d="M18 9h1a2 2 0 0 1 2 2v8l-3-3h-5a2 2 0 0 1-2-2v-1" />
  </svg>
);

const RedditIcon = ({ size = 30, color = '#ff4500' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <circle cx="12" cy="13.5" r="6.8" />
    <path d="M12 6.7v-3.5l3.5 1" />
    <circle cx="16.5" cy="4.2" r="1.4" fill={color} />
    <circle cx="9.2" cy="12.5" r="1.4" fill={color} />
    <circle cx="14.8" cy="12.5" r="1.4" fill={color} />
    <path d="M9.5 15.5c1.2 1.2 3.8 1.2 5 0" />
    <circle cx="4.5" cy="13" r="1.5" />
    <circle cx="19.5" cy="13" r="1.5" />
  </svg>
);

const SearchIcon = ({ size = 28, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CodeIcon = ({ size = 28, color = '#00f2fe' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const EnterpriseIcon = ({ size = 28, color = '#a855f7' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PublicationIcon = ({ size = 28, color = '#ec4899' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function MarketVortexAnimation({
  activeIndex = null,
  onHoverNode = () => {},
  dispatchProgressRef = null,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, radius: 110 });
  const activeIndexRef = useRef(activeIndex);
  const assembleProgressRef = useRef(0);
  const targetAssembleProgressRef = useRef(0);
  const internalDispatchProgressRef = useRef(0);
  const targetDispatchProgressRef = useRef(0);
  const hubRefs = useRef([]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Scroll listener: detects assembly on entry into Screen 3 and dispatch on transition to Scene 02
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const journeySection = container.closest('.marketing-journey-pinned-section') || container;
      const rect = journeySection.getBoundingClientRect();
      const windowH = window.innerHeight;

      // 1. Screen 2 -> Screen 3 assembly window:
      // Starts assembling as user starts scrolling towards Screen 3 (rect.top <= windowH * 0.95)
      // Exactly when user completes entering Screen 3 (rect.top <= 0), the formation is 100% COMPLETELY DONE!
      const startAssemble = windowH * 0.95;
      const endAssemble = 0;

      let prog = 0;
      if (rect.top >= startAssemble) {
        prog = 0;
      } else if (rect.top <= endAssemble) {
        prog = 1;
      } else {
        prog = (startAssemble - rect.top) / (startAssemble - endAssemble);
      }
      targetAssembleProgressRef.current = Math.max(0, Math.min(1, prog));

      // 2. Screen 3: Scene 01 -> Scene 02 dispatch window:
      // When user starts scrolling from Scene 01 towards Scene 02, dispatch particles outward
      const scene1 = container.closest('.journey-scene.scene-01-market') || container.closest('.scene-01-market');
      if (scene1) {
        const sceneRect = scene1.getBoundingClientRect();
        // Resting in Scene 01: sceneRect.left === 0.
        // Transitioning to Scene 02: sceneRect.left moves from 0 to -window.innerWidth.
        const dispatchDist = Math.max(250, window.innerWidth * 0.85);
        if (sceneRect.left < 0) {
          targetDispatchProgressRef.current = Math.min(1, -sceneRect.left / dispatchDist);
        } else {
          targetDispatchProgressRef.current = 0;
        }
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

    const width = 680;
    const height = 540;
    const cx = 340;
    const cy = 270;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // =========================================================================
    // 1. GENERATE PLANETARY STARDUST HALOS (Orbiting each icon node)
    // =========================================================================
    const haloParticles = [];
    const PARTICLES_PER_NODE = 36;

    for (let nodeIdx = 0; nodeIdx < NODE_COORDINATES.length; nodeIdx++) {
      const node = NODE_COORDINATES[nodeIdx];
      for (let i = 0; i < PARTICLES_PER_NODE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 26 + 28; // Orbit outside the 50px icon circle
        const speed = (Math.random() * 0.016 + 0.008) * (Math.random() > 0.5 ? 1 : -1);
        const isWhite = Math.random() < 0.2;
        const rgb = isWhite ? GLOBE_COLORS.softWhite : node.color;

        haloParticles.push({
          nodeIdx,
          angle,
          radius,
          speed,
          rgb,
          size: isWhite ? (Math.random() * 2.0 + 1.2) : (Math.random() * 1.5 + 0.9),
          alpha: Math.random() * 0.4 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.02,
          dispX: 0,
          dispY: 0,
          vx: 0,
          vy: 0,
          scatterVx: (Math.random() - 0.5) * 2,
          scatterVy: (Math.random() - 0.5) * 2
        });
      }
    }

    // =========================================================================
    // 2. GENERATE SWIRLING GALAXY ARMS (Streaming stardust from center to nodes)
    // =========================================================================
    const armParticles = [];
    const ARMS_COUNT = 6;
    const PARTICLES_PER_ARM = 80;

    for (let arm = 0; arm < ARMS_COUNT; arm++) {
      const target = NODE_COORDINATES[arm];
      for (let i = 0; i < PARTICLES_PER_ARM; i++) {
        const t = Math.random();
        const spread = (Math.random() - 0.5) * (8 + t * 24);
        const speed = 0.003 + Math.random() * 0.006;
        const isWhite = Math.random() < 0.16;
        const rgb = isWhite ? GLOBE_COLORS.softWhite : (Math.random() < 0.65 ? target.color : GLOBE_COLORS.electricBlue);

        armParticles.push({
          arm,
          t,
          speed,
          spread,
          rgb,
          size: Math.random() * 1.9 + 0.9,
          baseAlpha: Math.random() * 0.4 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.02,
          scatterDirX: (Math.random() - 0.5) * 2,
          scatterDirY: (Math.random() - 0.5) * 2
        });
      }
    }

    // =========================================================================
    // 3. GENERATE CENTRAL ACCRETION DISK (Singularity Stardust Swirl)
    // =========================================================================
    const coreParticles = [];
    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.75) * 58 + 2;
      const speed = (0.015 + (1 - radius / 65) * 0.04) * (Math.random() > 0.5 ? 1 : -1);
      const isWhite = Math.random() < 0.25;
      const rgb = isWhite
        ? GLOBE_COLORS.softWhite
        : (Math.random() < 0.5 ? GLOBE_COLORS.cyan : GLOBE_COLORS.electricBlue);

      coreParticles.push({
        angle,
        radius,
        speed,
        rgb,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.45 + 0.55,
        twinklePhase: Math.random() * Math.PI * 2,
        scatterDist: Math.random() * 260 + 80,
        scatterSwirl: (Math.random() - 0.5) * Math.PI * 2
      });
    }

    // =========================================================================
    // 4. GENERATE AMBIENT ESCAPING STARDUST (Multi-Depth Full Bleed)
    // =========================================================================
    const ambientDust = [];
    const AMBIENT_PARTICLE_COUNT = 120;
    const BOUND_PAD = 80;

    for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
      const depthTier = Math.random();
      ambientDust.push({
        x: Math.random() * (width + BOUND_PAD * 2) - BOUND_PAD,
        y: Math.random() * (height + BOUND_PAD * 2) - BOUND_PAD,
        vx: (Math.random() - 0.44) * 0.42,
        vy: (Math.random() - 0.5) * 0.38,
        size: depthTier < 0.45 ? (Math.random() * 1.1 + 0.6) : (Math.random() * 1.8 + 0.9),
        alpha: depthTier < 0.45 ? (Math.random() * 0.3 + 0.18) : (Math.random() * 0.45 + 0.3),
        rgb: Math.random() < 0.35 ? GLOBE_COLORS.cyan : (Math.random() < 0.7 ? GLOBE_COLORS.warmGold : GLOBE_COLORS.softWhite),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.035 + 0.015
      });
    }

    // =========================================================================
    // 5. ANIMATION & RE-ASSEMBLY PHYSICS LOOP
    // =========================================================================
    let animId;
    let frame = 0;

    const render = () => {
      frame++;

      // Smoothly interpolate scroll assembly progress directly with user scrolling
      assembleProgressRef.current += (targetAssembleProgressRef.current - assembleProgressRef.current) * 0.25;
      if (Math.abs(targetAssembleProgressRef.current - assembleProgressRef.current) < 0.002) {
        assembleProgressRef.current = targetAssembleProgressRef.current;
      }
      const aProg = Math.max(0, Math.min(1, assembleProgressRef.current));

      // Determine dispatch progress (combining external GSAP timeline ref & live scene position)
      let targetD = targetDispatchProgressRef.current;
      if (dispatchProgressRef && typeof dispatchProgressRef.current === 'number') {
        targetD = Math.max(targetD, dispatchProgressRef.current);
      }
      const scene1 = containerRef.current?.closest('.scene-01-market');
      if (scene1) {
        const sLeft = scene1.getBoundingClientRect().left;
        if (sLeft < 0) {
          const dDist = Math.max(250, window.innerWidth * 0.85);
          targetD = Math.max(targetD, Math.min(1, -sLeft / dDist));
        }
      }

      internalDispatchProgressRef.current += (targetD - internalDispatchProgressRef.current) * 0.18;
      if (Math.abs(targetD - internalDispatchProgressRef.current) < 0.002) {
        internalDispatchProgressRef.current = targetD;
      }
      const dProg = Math.max(0, Math.min(1, internalDispatchProgressRef.current));

      // On Screen 2 before scrolling to Screen 3, or when fully dispatched to Scene 02: element hidden
      if (aProg <= 0.005 || dProg >= 0.98) {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
          containerRef.current.style.pointerEvents = 'none';
        }
        ctx.clearRect(0, 0, width, height);

        // Ensure all 6 node hubs are hidden
        for (let i = 0; i < NODE_COORDINATES.length; i++) {
          const hubEl = hubRefs.current[i];
          if (hubEl) {
            hubEl.style.setProperty('--hub-scale', '0');
            hubEl.style.setProperty('--hub-opacity', '0');
            hubEl.style.pointerEvents = 'none';
          }
        }
        animId = requestAnimationFrame(render);
        return;
      }

      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.pointerEvents = (aProg > 0.7 && dProg < 0.3) ? 'auto' : 'none';
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const activeIdx = activeIndexRef.current;
      const dispatchFade = Math.max(0, 1.0 - dProg * 1.15);
      const overallAlpha = Math.min(1.0, (aProg - 0.005) * 2.5) * dispatchFade;
      const dEase = dProg * dProg * (3 - 2 * dProg);

      // --- A. Draw Ambient Escaping Stardust ---
      for (let i = 0; i < ambientDust.length; i++) {
        const d = ambientDust[i];
        d.x += d.vx * (1.0 + dEase * 2.2);
        d.y += d.vy * (1.0 + dEase * 2.2);
        if (d.x < -BOUND_PAD) d.x = width + BOUND_PAD;
        if (d.x > width + BOUND_PAD) d.x = -BOUND_PAD;
        if (d.y < -BOUND_PAD) d.y = height + BOUND_PAD;
        if (d.y > height + BOUND_PAD) d.y = -BOUND_PAD;

        const twinkle = Math.sin(frame * d.twinkleSpeed + d.twinklePhase) * 0.18;
        const a = Math.max(0.04, Math.min(0.88, (d.alpha + twinkle) * overallAlpha));
        ctx.fillStyle = `rgba(${d.rgb[0]}, ${d.rgb[1]}, ${d.rgb[2]}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- B. Draw Central Singularity Accretion Disk (Swirls inward on assemble, explodes outward on dispatch) ---
      const coreConvergence = Math.min(1.0, aProg * 2.2);
      const coreEase = coreConvergence * coreConvergence * (3 - 2 * coreConvergence);
      const coreScatterMult = 1.0 + (1.0 - coreEase) * 5.0;
      const coreSwirlOffset = (1.0 - coreEase) * Math.PI * 3.2;

      const coreDispatchExpand = 1.0 + dEase * 5.2;
      const coreDispatchSwirl = dEase * Math.PI * 2.5;

      for (let i = 0; i < coreParticles.length; i++) {
        const p = coreParticles[i];
        p.angle += p.speed;

        const curAngle = p.angle + coreSwirlOffset + coreDispatchSwirl + p.scatterSwirl * dEase;
        const curRadius = (p.radius * coreScatterMult + (1.0 - coreEase) * 45) * coreDispatchExpand + dEase * p.scatterDist;

        const px = cx + Math.cos(curAngle) * curRadius;
        const py = cy + Math.sin(curAngle) * curRadius;

        const twinkle = Math.sin(frame * 0.04 + p.twinklePhase) * 0.2;
        const alpha = Math.max(0.04, Math.min(1, (p.alpha + twinkle) * overallAlpha * coreEase));

        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + 0.4 * coreEase) * (1.0 + dEase * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // Singularity Center Core Radiant Bloom (ignites as core condenses, dissolves on dispatch)
      if (aProg > 0.08 && dProg < 0.85) {
        const bloomProg = Math.min(1.0, (aProg - 0.08) / 0.38) * Math.max(0, 1.0 - dProg * 1.8);
        const corePulse = (18 + Math.sin(frame * 0.05) * 4) * bloomProg * (1.0 + dEase * 1.5);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, corePulse));
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.95 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(0.3, `rgba(0, 235, 255, ${(0.7 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(0.7, `rgba(168, 85, 247, ${(0.35 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- C. Draw Swirling Galaxy Arms (Stream outward towards nodes on assemble, fling outward on dispatch) ---
      const armReach = Math.min(1.0, Math.max(0, (aProg - 0.10) / 0.54));
      const armEase = armReach * armReach * (3 - 2 * armReach);

      if (armEase > 0.005) {
        for (let i = 0; i < armParticles.length; i++) {
          const p = armParticles[i];
          const isArmActive = activeIdx === p.arm;
          const currentSpeed = p.speed * (isArmActive ? 1.6 : 1.0);
          p.t += currentSpeed;
          if (p.t > 1) p.t = 0;

          // Particle extends along the arm up to armEase
          const effectiveT = p.t * armEase;
          if (effectiveT <= 0.001) continue;

          const target = NODE_COORDINATES[p.arm];

          const t = effectiveT;
          const mt = 1 - t;
          const twistX = -(target.y - cy) * 0.45 * (1.0 + (1.0 - armEase) * 1.5);
          const twistY = (target.x - cx) * 0.45 * (1.0 + (1.0 - armEase) * 1.5);
          const ctrlX = cx + (target.x - cx) * 0.4 + twistX;
          const ctrlY = cy + (target.y - cy) * 0.4 + twistY;

          const bx = mt * mt * cx + 2 * mt * t * ctrlX + t * t * target.x;
          const by = mt * mt * cy + 2 * mt * t * ctrlY + t * t * target.y;

          const perpX = -(target.y - cy) / Math.hypot(target.x - cx, target.y - cy);
          const perpY = (target.x - cx) / Math.hypot(target.x - cx, target.y - cy);

          let px = bx + perpX * p.spread * armEase;
          let py = by + perpY * p.spread * armEase;

          // Dispatch burst along expansion and scatter vectors
          if (dProg > 0.001) {
            const armDistX = px - cx;
            const armDistY = py - cy;
            const armExp = 1.0 + dEase * 2.4;
            px = cx + armDistX * armExp + p.scatterDirX * dEase * 170;
            py = cy + armDistY * armExp + p.scatterDirY * dEase * 170;
          }

          const alpha = Math.sin(t * Math.PI) * p.baseAlpha * (isArmActive ? 1.5 : 1.0) * armEase * overallAlpha;
          const pSize = p.size * (isArmActive ? 1.3 : 1.0);

          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${Math.min(1, alpha)})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- D. Draw Planetary Stardust Halos Orbiting Each Node (Converge on assemble, scatter on dispatch) ---
      const haloProgress = Math.min(1.0, Math.max(0, (aProg - 0.24) / 0.48));
      const haloEase = haloProgress * haloProgress * (3 - 2 * haloProgress);

      if (haloEase > 0.005) {
        for (let i = 0; i < haloParticles.length; i++) {
          const p = haloParticles[i];
          const isNodeActive = activeIdx === p.nodeIdx;
          const node = NODE_COORDINATES[p.nodeIdx];

          p.angle += p.speed * (isNodeActive ? 1.8 : 1.0);

          // Halos swirl inward from wider space on assemble, then fling outward on dispatch
          const currentRadius = p.radius * (1.0 + (1.0 - haloEase) * 2.8 + dEase * 3.6);
          const swirlAngle = p.angle + (1.0 - haloEase) * Math.PI * 2.0 + dEase * Math.PI * 1.4;

          let baseX = node.x + Math.cos(swirlAngle) * currentRadius + (dProg > 0.001 ? p.scatterVx * dEase * 140 : 0);
          let baseY = node.y + Math.sin(swirlAngle) * currentRadius + (dProg > 0.001 ? p.scatterVy * dEase * 140 : 0);

          // Interactive Cursor Physics
          if (mouse.active && haloEase > 0.8 && dProg < 0.2) {
            const dx = (baseX + p.dispX) - mouse.x;
            const dy = (baseY + p.dispY) - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < mouse.radius && dist > 0.01) {
              const factor = (1 - dist / mouse.radius) * 22;
              p.vx += (dx / dist) * factor * 0.18;
              p.vy += (dy / dist) * factor * 0.18;
            }
          }

          // Spring physics
          p.vx += -p.dispX * 0.08;
          p.vy += -p.dispY * 0.08;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.dispX += p.vx;
          p.dispY += p.vy;

          const px = baseX + p.dispX;
          const py = baseY + p.dispY;

          const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinklePhase) * 0.22;
          const alpha = Math.max(0.04, Math.min(1, (p.alpha + twinkle) * (isNodeActive ? 1.5 : 1.0) * haloEase * overallAlpha));
          const pSize = p.size * (isNodeActive ? 1.5 : 1.0) * (0.6 + 0.4 * haloEase);

          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- E. Update 6 Vector Icon Hubs Bloom (Blooms on assemble, retracts & fades on dispatch) ---
      for (let i = 0; i < NODE_COORDINATES.length; i++) {
        const hubEl = hubRefs.current[i];
        if (!hubEl) continue;

        const nodeTriggerStart = 0.38 + (i / NODE_COORDINATES.length) * 0.28; // 0.38 to 0.61
        const nodeProg = Math.max(0, Math.min(1, (aProg - nodeTriggerStart) / 0.16));
        const hubDispatchFade = Math.max(0, 1.0 - dProg * 1.25);

        if (nodeProg <= 0.005 || hubDispatchFade <= 0.005) {
          hubEl.style.setProperty('--hub-scale', '0');
          hubEl.style.setProperty('--hub-opacity', '0');
          hubEl.style.pointerEvents = 'none';
        } else {
          const easePop = Math.sin(nodeProg * Math.PI * 0.5) * (nodeProg < 1 ? 1 + Math.sin(nodeProg * Math.PI) * 0.22 : 1);
          const finalScale = easePop * hubDispatchFade * (1.0 - dEase * 0.25);
          const finalAlpha = nodeProg * hubDispatchFade;
          hubEl.style.setProperty('--hub-scale', finalScale.toFixed(3));
          hubEl.style.setProperty('--hub-opacity', finalAlpha.toFixed(3));
          hubEl.style.pointerEvents = (nodeProg > 0.8 && dProg < 0.3) ? 'auto' : 'none';
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * (width / rect.width);
      mouseRef.current.y = (e.clientY - rect.top) * (height / rect.height);
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`star-particle-vortex-fluid ${className}`}
      style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
    >
      {/* 1. Fluid Star-Particle Canvas (Galaxy Arms, Accretion Disk, Planetary Stardust Halos) */}
      <canvas ref={canvasRef} className="star-particle-vortex-canvas" />

      {/* 2. Razor-Sharp Illuminated Vector Icons Hosted Inside Cosmic Glass Hubs */}
      {NODE_COORDINATES.map((node, i) => {
        const isActive = activeIndex === i;
        const leftPercent = (node.x / 680) * 100;
        const topPercent = (node.y / 540) * 100;

        return (
          <div
            key={node.id}
            ref={(el) => (hubRefs.current[i] = el)}
            className={`constellation-star-hub ${isActive ? 'is-active-constellation' : ''}`}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              '--hub-rgb': `${node.color[0]}, ${node.color[1]}, ${node.color[2]}`,
              '--hub-scale': 0,
              '--hub-opacity': 0
            }}
            onMouseEnter={() => onHoverNode(i)}
            onMouseLeave={() => onHoverNode(null)}
            onClick={() => onHoverNode(i)}
          >
            {/* Ambient Cosmic Bloom Aura */}
            <div className="constellation-glow-aura" />

            {/* Central Crisp Illuminated Vector Icon */}
            <div className="constellation-icon-disc">
              {node.id === 'forums' && <ForumsIcon size={28} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
              {node.id === 'reddit' && <RedditIcon size={30} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
              {node.id === 'search' && <SearchIcon size={28} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
              {node.id === 'developers' && <CodeIcon size={28} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
              {node.id === 'enterprise' && <EnterpriseIcon size={28} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
              {node.id === 'publications' && <PublicationIcon size={28} color={`rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})`} />}
            </div>

            {/* Clean, Identifiable Name Tag */}
            <div className="constellation-name-tag">
              <span className="name-tag-title">{node.title}</span>
              <span className="name-tag-metric">{node.metric}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
