import React, { useEffect, useRef } from 'react';

/**
 * CREATIVE PARTICLE NEXUS ANIMATION
 * Screen 3 Scene 02: "What Are You Trying to Promote?"
 * 
 * Central Glowing Golden Lightbulb (The Spark / Idea Singularity)
 * Streaming 8 Multicolored Galaxy Particle Arms to 8 Razor-Sharp Creative Outputs:
 * 0. Web App & Interactive Pages (Electric Cyan) - Browser window with landscape & lines
 * 1. 3D Motion & Product Demos (Cosmic Purple) - Isometric 3D wireframe cube
 * 2. Creative Graphics & Posters (Warm Gold) - Picture landscape frame with mountain/sun
 * 3. Mobile Videos, Reels & Shorts (Neon Crimson) - Vertical smartphone with play button
 * 4. Pitch Deck & Sales Slides (Oceanic Cyan) - Presentation monitor with bar chart
 * 5. Technical Blogs & Articles (Emerald Green) - Document sheet with folded corner & lines
 * 6. Product Launch Campaigns (Hot Magenta) - Megaphone / launch horn with audio waves
 * 7. Promotional Creatives & Ads (Energetic Orange) - Ad window with "AD" and cursor pointer
 * 
 * Full Assemble & Dispatch Cinematic Particle System:
 * - Assembles dynamically as user transitions from Scene 01 to Scene 02
 * - Dispatches dynamically as user transitions from Scene 02 to Scene 03
 * - Re-assembles and re-dispatches seamlessly on reverse scroll
 */

const NEXUS_COLORS = {
  webApp: [0, 217, 255],        // Cyan #00d9ff
  motion3d: [168, 85, 247],     // Purple #a855f7
  graphic: [245, 158, 11],      // Gold #f59e0b
  mobileVideo: [244, 63, 94],   // Crimson/Pink #f43f5e
  presentation: [6, 182, 212],  // Cyan/Teal #06b6d4
  blogArticle: [16, 185, 129],  // Emerald #10b981
  productLaunch: [236, 72, 153],// Magenta #ec4899
  adCreative: [255, 107, 0],    // Orange #ff6b00
  bulbGold: [255, 191, 36],     // Gold #fbbf24
  softWhite: [250, 250, 255]
};

// 8 Output Nodes coordinates in a 720 x 560 coordinate space
const OUTPUT_NODES = [
  {
    id: 'webapp',
    title: 'Web App & Interactive Pages',
    tag: 'Web App',
    category: 'Conversion',
    x: 230,
    y: 85,
    color: NEXUS_COLORS.webApp,
    colorHex: '#00d9ff'
  },
  {
    id: 'motion3d',
    title: '3D Motion & Product Demos',
    tag: '3D Motion',
    category: 'Visual Demo',
    x: 490,
    y: 90,
    color: NEXUS_COLORS.motion3d,
    colorHex: '#a855f7'
  },
  {
    id: 'graphic',
    title: 'Creative Graphics & Posters',
    tag: 'Creative Graphic',
    category: 'Brand Social',
    x: 585,
    y: 220,
    color: NEXUS_COLORS.graphic,
    colorHex: '#f59e0b'
  },
  {
    id: 'mobilevideo',
    title: 'Mobile Videos, Reels & Shorts',
    tag: 'Mobile Video',
    category: 'Viral Growth',
    x: 565,
    y: 410,
    color: NEXUS_COLORS.mobileVideo,
    colorHex: '#f43f5e'
  },
  {
    id: 'presentation',
    title: 'Pitch Deck & Sales Slides',
    tag: 'Presentations',
    category: 'Executive Sales',
    x: 430,
    y: 495,
    color: NEXUS_COLORS.presentation,
    colorHex: '#06b6d4'
  },
  {
    id: 'blogarticle',
    title: 'Technical Blogs & Articles',
    tag: 'SEO Inbound',
    category: 'Content Engine',
    x: 270,
    y: 495,
    color: NEXUS_COLORS.blogArticle,
    colorHex: '#10b981'
  },
  {
    id: 'productlaunch',
    title: 'Product Launch Campaigns',
    tag: 'Multi-Channel',
    category: 'GTM Strategy',
    x: 140,
    y: 405,
    color: NEXUS_COLORS.productLaunch,
    colorHex: '#ec4899'
  },
  {
    id: 'adcreative',
    title: 'Promotional Creatives & Ads',
    tag: 'Paid Creative',
    category: 'Ad Acquisition',
    x: 135,
    y: 225,
    color: NEXUS_COLORS.adCreative,
    colorHex: '#ff6b00'
  }
];

// =========================================================================
// 8 HIGH-PRECISION ILLUMINATED VECTOR WIREFRAME ICONS
// =========================================================================

// 0. Web App: Sleek browser window with header, 3 dots, landscape & text lines
const WebAppWireframe = ({ color = '#00d9ff', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <rect x="3" y="4" width="26" height="24" rx="4" stroke={color} strokeWidth="1.8" />
    <line x1="3" y1="10" x2="29" y2="10" stroke={color} strokeWidth="1.5" />
    <circle cx="7" cy="7" r="1.2" fill={color} />
    <circle cx="11" cy="7" r="1.2" fill={color} />
    <circle cx="15" cy="7" r="1.2" fill={color} />
    <rect x="6" y="14" width="10" height="10" rx="2" stroke={color} strokeWidth="1.4" />
    <polyline points="7 21 10 18 14 22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="13" cy="16.5" r="1" fill={color} />
    <line x1="19" y1="15" x2="26" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19" y1="19" x2="25" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19" y1="23" x2="23" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 1. 3D Motion: Isometric 3D wireframe cube
const Cube3DWireframe = ({ color = '#a855f7', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <polygon points="16 3 28 9.5 16 16 4 9.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <polygon points="4 9.5 16 16 16 29 4 22.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <polygon points="28 9.5 16 16 16 29 28 22.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="16" cy="16" r="2.2" fill={color} />
  </svg>
);

// 2. Creative Graphics: Picture landscape frame with mountain and sun
const GraphicWireframe = ({ color = '#f59e0b', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <rect x="3" y="5" width="26" height="22" rx="3.5" stroke={color} strokeWidth="1.8" />
    <circle cx="10" cy="11.5" r="2.5" stroke={color} strokeWidth="1.4" fill={`${color}33`} />
    <path d="M4 23L12 15L20 22L24 18L28 22.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3. Mobile Video: Smartphone frame with active play triangle & recording dot
const MobileVideoWireframe = ({ color = '#f43f5e', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <rect x="7" y="2" width="18" height="28" rx="4.5" stroke={color} strokeWidth="1.8" />
    <circle cx="16" cy="6" r="1" fill={color} />
    <line x1="13" y1="27.5" x2="19" y2="27.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <polygon points="14 12 21 16 14 20" fill={color} />
  </svg>
);

// 4. Presentations: Executive widescreen monitor with analytics bars
const PresentationWireframe = ({ color = '#06b6d4', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <rect x="3" y="4" width="26" height="18" rx="3" stroke={color} strokeWidth="1.8" />
    <line x1="16" y1="22" x2="16" y2="28" stroke={color} strokeWidth="2" />
    <line x1="10" y1="28" x2="22" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="14" width="3" height="5" rx="0.8" fill={color} />
    <rect x="12" y="10" width="3" height="9" rx="0.8" fill={color} />
    <rect x="17" y="7" width="3" height="12" rx="0.8" fill={color} />
    <rect x="22" y="12" width="3" height="7" rx="0.8" fill={color} />
  </svg>
);

// 5. Technical Blogs: Document with folded corner & crisp lines
const BlogArticleWireframe = ({ color = '#10b981', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M6 3H20L26 9V27C26 28.1 25.1 29 24 29H6C4.9 29 4 28.1 4 27V5C4 3.9 4.9 3 6 3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <polyline points="20 3 20 9 26 9" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="8" y1="14" x2="18" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="8" y1="18" x2="22" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 6. Product Launch: Hot hot hot megaphone / acoustic blast
const ProductLaunchWireframe = ({ color = '#ec4899', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M4 12V18H7L15 23V7L7 12H4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={`${color}22`} />
    <path d="M19 11C20.5 12.5 20.5 17.5 19 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M22.5 8C25.5 11 25.5 21 22.5 24" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="9" y1="18" x2="8" y2="25" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 7. Promotional Creatives & Ads: Display window with bold "AD" and pointer
const AdCreativeWireframe = ({ color = '#ff6b00', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <rect x="3" y="4" width="26" height="22" rx="3.5" stroke={color} strokeWidth="1.8" />
    <line x1="3" y1="9" x2="29" y2="9" stroke={color} strokeWidth="1.3" />
    <circle cx="6" cy="6.5" r="0.9" fill={color} />
    <circle cx="9" cy="6.5" r="0.9" fill={color} />
    <circle cx="12" cy="6.5" r="0.9" fill={color} />
    <text x="8.5" y="21" fill={color} fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">AD</text>
    <polygon points="19 15 24 20 22 21 24 24 22 25 20 22 18 24" fill={color} stroke={color} strokeWidth="0.8" />
  </svg>
);

// Center: Glowing Golden Idea Lightbulb
const IdeaLightbulbIcon = ({ color = '#fbbf24', size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})` }}>
    <path d="M16 3C10.5 3 6 7.5 6 13C6 16.5 8 19.5 11 21.2V24C11 24.6 11.4 25 12 25H20C20.6 25 21 24.6 21 24V21.2C24 19.5 26 16.5 26 13C26 7.5 21.5 3 16 3Z" stroke={color} strokeWidth="2.2" fill={`${color}22`} />
    <line x1="12" y1="28" x2="20" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="13.5" y1="25" x2="18.5" y2="25" stroke={color} strokeWidth="1.8" />
    {/* Inner filament */}
    <path d="M13 15C13 12 14.5 10 16 10C17.5 10 19 12 19 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="10" x2="16" y2="18" stroke={color} strokeWidth="1.6" />
  </svg>
);

export default function CreativeNexusAnimation({
  activeIndex = null,
  onHoverNode = () => {},
  assembleProgressRef: assembleProgressRefProp = null,
  dispatchProgressRef: dispatchProgressRefProp = null,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const centralBulbRef = useRef(null);
  const hubRefs = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, radius: 120 });
  const activeIndexRef = useRef(activeIndex);

  // Smooth scroll progression refs
  const internalAssembleProgressRef = useRef(0);
  const targetAssembleProgressRef = useRef(0);
  const internalDispatchProgressRef = useRef(0);
  const targetDispatchProgressRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Dual-tracking scroll listener: detects assembly on entry into Scene 02 and dispatch on exit to Scene 03
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scene2 = container.closest('.journey-scene.scene-02-outputs') || container.closest('.scene-02-outputs');
      if (scene2) {
        const sceneRect = scene2.getBoundingClientRect();
        const winW = window.innerWidth;

        // 1. Scene 01 -> Scene 02 assemble window:
        // As Scene 02 approaches center from the right, sceneRect.left moves from winW down to 0
        if (sceneRect.left >= winW) {
          targetAssembleProgressRef.current = 0;
        } else if (sceneRect.left <= 0) {
          targetAssembleProgressRef.current = 1;
        } else {
          targetAssembleProgressRef.current = 1 - (sceneRect.left / winW);
        }

        // 2. Scene 02 -> Scene 03 dispatch window:
        // As Scene 02 moves left towards Scene 03, sceneRect.left moves from 0 down to -winW * 0.85
        const dispatchDist = Math.max(250, winW * 0.85);
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

    const width = 720;
    const height = 560;
    const cx = 360;
    const cy = 280;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // =========================================================================
    // 1. GENERATE PLANETARY STARDUST HALOS (Orbiting each of the 8 output nodes)
    // =========================================================================
    const haloParticles = [];
    const PARTICLES_PER_NODE = 30;

    for (let nodeIdx = 0; nodeIdx < OUTPUT_NODES.length; nodeIdx++) {
      const node = OUTPUT_NODES[nodeIdx];
      for (let i = 0; i < PARTICLES_PER_NODE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 26 + 32; // Orbit around the 56px icon disc
        const speed = (Math.random() * 0.018 + 0.008) * (Math.random() > 0.5 ? 1 : -1);
        const isWhite = Math.random() < 0.22;
        const rgb = isWhite ? NEXUS_COLORS.softWhite : node.color;

        haloParticles.push({
          nodeIdx,
          angle,
          radius,
          speed,
          rgb,
          size: isWhite ? (Math.random() * 2.0 + 1.2) : (Math.random() * 1.6 + 0.9),
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
    // 2. GENERATE 8 STREAMING GALAXY ARMS (From Center Lightbulb to each Node)
    // =========================================================================
    const armParticles = [];
    const PARTICLES_PER_ARM = 70;

    for (let arm = 0; arm < OUTPUT_NODES.length; arm++) {
      const target = OUTPUT_NODES[arm];
      for (let i = 0; i < PARTICLES_PER_ARM; i++) {
        const t = Math.random();
        const spread = (Math.random() - 0.5) * (6 + t * 26);
        const speed = 0.0035 + Math.random() * 0.0065;
        const isWhite = Math.random() < 0.18;
        const rgb = isWhite
          ? NEXUS_COLORS.softWhite
          : (Math.random() < 0.7 ? target.color : NEXUS_COLORS.bulbGold);

        armParticles.push({
          arm,
          t,
          speed,
          spread,
          rgb,
          size: Math.random() * 1.9 + 0.9,
          baseAlpha: Math.random() * 0.4 + 0.55,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.045 + 0.02,
          scatterDist: Math.random() * 320 + 100,
          scatterSwirl: (Math.random() - 0.5) * 3
        });
      }
    }

    // =========================================================================
    // 3. GENERATE CENTRAL LIGHTBULB CELESTIAL STARDUST & SUNBURST RAYS
    // =========================================================================
    const centerParticles = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.75) * 65 + 4;
      const speed = (0.016 + (1 - radius / 75) * 0.038) * (Math.random() > 0.5 ? 1 : -1);
      const isWhite = Math.random() < 0.28;
      const rgb = isWhite ? NEXUS_COLORS.softWhite : NEXUS_COLORS.bulbGold;

      centerParticles.push({
        angle,
        radius,
        speed,
        rgb,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.45 + 0.55,
        twinklePhase: Math.random() * Math.PI * 2,
        scatterDist: Math.random() * 260 + 80,
        scatterSwirl: (Math.random() - 0.5) * 4
      });
    }

    // 30 Sunburst Ray Particles radiating outward
    const rayParticles = [];
    for (let i = 0; i < 30; i++) {
      const rayAngle = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const dist = 55 + Math.random() * 45;
      rayParticles.push({
        angle: rayAngle,
        dist,
        length: 8 + Math.random() * 18,
        speed: 0.25 + Math.random() * 0.4,
        alpha: 0.3 + Math.random() * 0.5,
        scatterDist: Math.random() * 200 + 60
      });
    }

    // =========================================================================
    // 4. GENERATE AMBIENT ESCAPING COSMIC STARDUST (Full Bleed Overflow)
    // =========================================================================
    const ambientDust = [];
    const AMBIENT_COUNT = 100;
    const BOUND_PAD = 80;

    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const tier = Math.random();
      ambientDust.push({
        x: Math.random() * (width + BOUND_PAD * 2) - BOUND_PAD,
        y: Math.random() * (height + BOUND_PAD * 2) - BOUND_PAD,
        vx: (Math.random() - 0.46) * 0.38,
        vy: (Math.random() - 0.5) * 0.35,
        size: tier < 0.5 ? (Math.random() * 1.1 + 0.6) : (Math.random() * 1.8 + 0.9),
        alpha: tier < 0.5 ? (Math.random() * 0.25 + 0.15) : (Math.random() * 0.4 + 0.3),
        rgb: Math.random() < 0.4 ? NEXUS_COLORS.webApp : (Math.random() < 0.75 ? NEXUS_COLORS.bulbGold : NEXUS_COLORS.softWhite),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.035 + 0.015
      });
    }

    // =========================================================================
    // 5. ANIMATION, ASSEMBLE, DISPATCH & CURSOR PHYSICS LOOP
    // =========================================================================
    let animId;
    let frame = 0;

    const render = () => {
      frame++;

      // 1. Combine timeline prop reference with scroll tracking
      let targetA = targetAssembleProgressRef.current;
      if (assembleProgressRefProp && assembleProgressRefProp.current !== undefined) {
        targetA = Math.max(targetA, assembleProgressRefProp.current);
      }

      let targetD = targetDispatchProgressRef.current;
      if (dispatchProgressRefProp && dispatchProgressRefProp.current !== undefined) {
        targetD = Math.max(targetD, dispatchProgressRefProp.current);
      }

      // Smooth interpolation for assemble and dispatch
      internalAssembleProgressRef.current += (targetA - internalAssembleProgressRef.current) * 0.20;
      if (Math.abs(targetA - internalAssembleProgressRef.current) < 0.002) {
        internalAssembleProgressRef.current = targetA;
      }
      const aProg = Math.max(0, Math.min(1, internalAssembleProgressRef.current));

      internalDispatchProgressRef.current += (targetD - internalDispatchProgressRef.current) * 0.18;
      if (Math.abs(targetD - internalDispatchProgressRef.current) < 0.002) {
        internalDispatchProgressRef.current = targetD;
      }
      const dProg = Math.max(0, Math.min(1, internalDispatchProgressRef.current));

      // If outside Scene 02: completely hidden
      if (aProg <= 0.005 || dProg >= 0.98) {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
          containerRef.current.style.pointerEvents = 'none';
        }
        ctx.clearRect(0, 0, width, height);

        // Hide central bulb
        if (centralBulbRef.current) {
          centralBulbRef.current.style.setProperty('--bulb-scale', '0');
          centralBulbRef.current.style.setProperty('--bulb-opacity', '0');
        }

        // Hide all 8 output hubs
        for (let i = 0; i < OUTPUT_NODES.length; i++) {
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
        d.x += d.vx * (1.0 + dEase * 2.0);
        d.y += d.vy * (1.0 + dEase * 2.0);
        if (d.x < -BOUND_PAD) d.x = width + BOUND_PAD;
        if (d.x > width + BOUND_PAD) d.x = -BOUND_PAD;
        if (d.y < -BOUND_PAD) d.y = height + BOUND_PAD;
        if (d.y > height + BOUND_PAD) d.y = -BOUND_PAD;

        const twinkle = Math.sin(frame * d.twinkleSpeed + d.twinklePhase) * 0.18;
        const a = Math.max(0.06, Math.min(0.85, (d.alpha + twinkle) * overallAlpha));
        ctx.fillStyle = `rgba(${d.rgb[0]}, ${d.rgb[1]}, ${d.rgb[2]}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- B. Draw Central Idea Lightbulb Singularity & Sunburst Rays ---
      // Convergence on assemble, explosive spiral expansion on dispatch
      const coreConvergence = Math.min(1.0, aProg * 2.2);
      const coreEase = coreConvergence * coreConvergence * (3 - 2 * coreConvergence);
      const coreScatterMult = 1.0 + (1.0 - coreEase) * 4.5;
      const coreSwirlOffset = (1.0 - coreEase) * Math.PI * 3.0;

      const coreDispatchExpand = 1.0 + dEase * 4.8;
      const coreDispatchSwirl = dEase * Math.PI * 2.2;

      // Sunburst Rays radiating outward
      if (aProg > 0.12 && dProg < 0.85) {
        const rayBloom = Math.min(1.0, (aProg - 0.12) / 0.45) * Math.max(0, 1.0 - dProg * 1.5);
        for (let i = 0; i < rayParticles.length; i++) {
          const r = rayParticles[i];
          const rad = (r.dist + Math.sin(frame * 0.05 + i) * 6) * rayBloom * (1.0 + dEase * 2.5);
          const x1 = cx + Math.cos(r.angle) * 38 * rayBloom;
          const y1 = cy + Math.sin(r.angle) * 38 * rayBloom;
          const x2 = cx + Math.cos(r.angle) * rad;
          const y2 = cy + Math.sin(r.angle) * rad;

          ctx.strokeStyle = `rgba(255, 191, 36, ${(r.alpha * 0.35 * rayBloom).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Concentric orbiting particles around center
      for (let i = 0; i < centerParticles.length; i++) {
        const p = centerParticles[i];
        p.angle += p.speed;

        const curAngle = p.angle + coreSwirlOffset + coreDispatchSwirl + p.scatterSwirl * dEase;
        const curRadius = (p.radius * coreScatterMult + (1.0 - coreEase) * 40) * coreDispatchExpand + dEase * p.scatterDist;

        const px = cx + Math.cos(curAngle) * curRadius;
        const py = cy + Math.sin(curAngle) * curRadius;

        const twinkle = Math.sin(frame * 0.04 + p.twinklePhase) * 0.2;
        const alpha = Math.max(0.04, Math.min(1, (p.alpha + twinkle) * overallAlpha * coreEase));

        ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + 0.4 * coreEase) * (1.0 + dEase * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // Singularity Central Radiant Bloom
      if (aProg > 0.10 && dProg < 0.85) {
        const bloomProg = Math.min(1.0, (aProg - 0.10) / 0.40) * Math.max(0, 1.0 - dProg * 1.6);
        const corePulse = (24 + Math.sin(frame * 0.05) * 5) * bloomProg * (1.0 + dEase * 1.5);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, corePulse * 1.8));
        coreGrad.addColorStop(0, `rgba(255, 230, 150, ${(0.95 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(0.3, `rgba(255, 191, 36, ${(0.7 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(0.7, `rgba(255, 120, 20, ${(0.28 * bloomProg).toFixed(3)})`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, corePulse * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update Central Lightbulb Core in DOM
      if (centralBulbRef.current) {
        const bulbProg = Math.min(1.0, Math.max(0, (aProg - 0.12) / 0.45));
        const bulbPop = Math.sin(bulbProg * Math.PI * 0.5) * (bulbProg < 1 ? 1 + Math.sin(bulbProg * Math.PI) * 0.18 : 1);
        const bulbDispatchFade = Math.max(0, 1.0 - dProg * 1.3);

        if (bulbProg <= 0.005 || bulbDispatchFade <= 0.005) {
          centralBulbRef.current.style.setProperty('--bulb-scale', '0');
          centralBulbRef.current.style.setProperty('--bulb-opacity', '0');
        } else {
          centralBulbRef.current.style.setProperty('--bulb-scale', (bulbPop * bulbDispatchFade).toFixed(3));
          centralBulbRef.current.style.setProperty('--bulb-opacity', (bulbProg * bulbDispatchFade).toFixed(3));
        }
      }

      // --- C. Draw 8 Streaming Galaxy Arms ---
      const armReach = Math.min(1.0, Math.max(0, (aProg - 0.10) / 0.55));
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

          const target = OUTPUT_NODES[p.arm];

          const t = effectiveT;
          const mt = 1 - t;
          const twistX = -(target.y - cy) * 0.38 * (1.0 + (1.0 - armEase) * 1.4);
          const twistY = (target.x - cx) * 0.38 * (1.0 + (1.0 - armEase) * 1.4);
          const ctrlX = cx + (target.x - cx) * 0.45 + twistX;
          const ctrlY = cy + (target.y - cy) * 0.45 + twistY;

          const bx = mt * mt * cx + 2 * mt * t * ctrlX + t * t * target.x;
          const by = mt * mt * cy + 2 * mt * t * ctrlY + t * t * target.y;

          const dist = Math.hypot(target.x - cx, target.y - cy) || 1;
          const perpX = -(target.y - cy) / dist;
          const perpY = (target.x - cx) / dist;

          // Dispatch burst along expansion vector
          let px = bx + perpX * p.spread;
          let py = by + perpY * p.spread;

          if (dProg > 0.001) {
            const armDispatchDist = dEase * 380;
            const armAngle = Math.atan2(by - cy, bx - cx) + p.scatterSwirl * dEase;
            px = bx + Math.cos(armAngle) * armDispatchDist + perpX * p.spread * (1 + dEase * 2.2);
            py = by + Math.sin(armAngle) * armDispatchDist + perpY * p.spread * (1 + dEase * 2.2);
          }

          const alpha = Math.sin(t * Math.PI) * p.baseAlpha * (isArmActive ? 1.5 : 1.0) * overallAlpha * armEase;
          const pSize = p.size * (isArmActive ? 1.35 : 1.0) * (0.8 + 0.2 * armEase);

          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${Math.min(1, Math.max(0, alpha))})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- D. Draw Planetary Stardust Halos Orbiting Each Node ---
      const haloReach = Math.min(1.0, Math.max(0, (aProg - 0.35) / 0.45));
      const haloEase = haloReach * haloReach * (3 - 2 * haloReach);
      const haloDispatchExpand = 1.0 + dEase * 3.5;

      if (haloEase > 0.005) {
        for (let i = 0; i < haloParticles.length; i++) {
          const p = haloParticles[i];
          const isNodeActive = activeIdx === p.nodeIdx;
          const node = OUTPUT_NODES[p.nodeIdx];

          p.angle += p.speed * (isNodeActive ? 1.8 : 1.0);

          const curR = p.radius * haloEase * haloDispatchExpand;
          const baseX = node.x + Math.cos(p.angle) * curR + p.scatterVx * dEase * 240;
          const baseY = node.y + Math.sin(p.angle) * curR + p.scatterVy * dEase * 240;

          // Interactive Cursor Physics
          if (mouse.active && aProg > 0.75 && dProg < 0.25) {
            const dx = (baseX + p.dispX) - mouse.x;
            const dy = (baseY + p.dispY) - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < mouse.radius && dist > 0.01) {
              const factor = (1 - dist / mouse.radius) * 20;
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
          const alpha = Math.max(0.04, Math.min(1, (p.alpha + twinkle) * (isNodeActive ? 1.5 : 1.0) * overallAlpha * haloEase));
          const pSize = p.size * (isNodeActive ? 1.45 : 1.0);

          ctx.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- E. Update 8 Razor-Sharp Wireframe Output Hubs in DOM ---
      const totalHubs = OUTPUT_NODES.length;
      for (let i = 0; i < totalHubs; i++) {
        const hubEl = hubRefs.current[i];
        if (!hubEl) continue;

        // Staggered bloom: blooms as galaxy arm reaches destination
        const hubStart = 0.35 + (i / totalHubs) * 0.30; // 0.35 to 0.61
        const hubProg = Math.max(0, Math.min(1, (aProg - hubStart) / 0.18));
        const hubDispatchFade = Math.max(0, 1.0 - dProg * 1.25);
        const hubPop = Math.sin(hubProg * Math.PI * 0.5) * (hubProg < 1 ? 1 + Math.sin(hubProg * Math.PI) * 0.16 : 1);

        if (hubProg <= 0.005 || hubDispatchFade <= 0.005) {
          hubEl.style.setProperty('--hub-scale', '0');
          hubEl.style.setProperty('--hub-opacity', '0');
          hubEl.style.pointerEvents = 'none';
        } else {
          const finalScale = (hubPop * hubDispatchFade).toFixed(3);
          const finalOpacity = (hubProg * hubDispatchFade).toFixed(3);
          hubEl.style.setProperty('--hub-scale', finalScale);
          hubEl.style.setProperty('--hub-opacity', finalOpacity);
          hubEl.style.pointerEvents = (hubProg > 0.85 && dProg < 0.25) ? 'auto' : 'none';
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
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={`creative-nexus-fluid-container ${className}`}
      style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
    >
      {/* 1. Fluid Star-Particle Canvas (8 Galaxy Arms, Singularity Lightbulb Halo, Stardust Halos) */}
      <canvas ref={canvasRef} className="creative-nexus-canvas" />

      {/* 2. Central Glowing Idea Lightbulb Core */}
      <div
        ref={centralBulbRef}
        className="nexus-central-bulb-spark"
        style={{
          '--bulb-scale': 0,
          '--bulb-opacity': 0
        }}
      >
        <div className="central-bulb-bloom" />
        <div className="central-bulb-disc">
          <IdeaLightbulbIcon size={38} color="#fbbf24" />
        </div>
        <span className="central-bulb-badge">Creative Core</span>
      </div>

      {/* 3. 8 Razor-Sharp Illuminated Vector Wireframe Hubs */}
      {OUTPUT_NODES.map((node, i) => {
        const isActive = activeIndex === i;
        const leftPercent = (node.x / 720) * 100;
        const topPercent = (node.y / 560) * 100;

        return (
          <div
            key={node.id}
            ref={(el) => (hubRefs.current[i] = el)}
            className={`nexus-output-hub ${isActive ? 'is-active-nexus-hub' : ''}`}
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
            <div className="nexus-glow-aura" />

            {/* Central Crisp Illuminated Vector Wireframe Icon */}
            <div className="nexus-icon-disc">
              {node.id === 'webapp' && <WebAppWireframe color={node.colorHex} size={30} />}
              {node.id === 'motion3d' && <Cube3DWireframe color={node.colorHex} size={30} />}
              {node.id === 'graphic' && <GraphicWireframe color={node.colorHex} size={30} />}
              {node.id === 'mobilevideo' && <MobileVideoWireframe color={node.colorHex} size={30} />}
              {node.id === 'presentation' && <PresentationWireframe color={node.colorHex} size={30} />}
              {node.id === 'blogarticle' && <BlogArticleWireframe color={node.colorHex} size={30} />}
              {node.id === 'productlaunch' && <ProductLaunchWireframe color={node.colorHex} size={30} />}
              {node.id === 'adcreative' && <AdCreativeWireframe color={node.colorHex} size={30} />}
            </div>

            {/* Crisp Identification Name Tag */}
            <div className="nexus-name-tag">
              <span className="nexus-tag-category">{node.category}</span>
              <span className="nexus-tag-title">{node.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
