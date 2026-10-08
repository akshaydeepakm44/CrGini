import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Compass, Search, CheckCircle2 } from 'lucide-react';

const TITLES = [
  {
    id: 0,
    text: "CREATIVE GINI",
    subtext: "The Autonomous AI Growth Engine for Strategy, Content & Multi-Channel Scaling.",
    stateName: "SCENE 01 // COSMIC ORIGIN",
    icon: Compass,
    accent: "#00D9FF",
    glow: "rgba(0, 217, 255, 0.35)"
  },
  {
    id: 1,
    text: "CREATIVE GINI",
    subtext: "Discover hidden market intelligence & unleash 12+ automated growth channels in real-time.",
    stateName: "SCENE 02 // THE GENIE MATRIX",
    icon: CheckCircle2,
    accent: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.4)"
  }
];

function TypewriterSubtext({ text, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="typewriter-subtext-container">
      <span className="typewriter-prompt-symbol">&gt;&nbsp;</span>
      <span className="typewriter-text">{displayedText}</span>
      <span className="typewriter-cursor">|</span>
    </div>
  );
}

// Multi-stage gradient color waypoints along the continuous journey
// p in [0.0, 2.0]
const COLOR_WAYPOINTS = [
  // p = 0.0 (State 1: Discovery - Architectural Dark / Silver Depth)
  {
    p: 0.0,
    stop0: [9, 9, 11],
    stop1: [14, 14, 17],
    stop2: [18, 18, 22],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.035],
    node: [255, 255, 255]
  },
  // p = 0.25 (Stage 1.25)
  {
    p: 0.25,
    stop0: [9, 9, 11],
    stop1: [15, 15, 19],
    stop2: [20, 20, 24],
    stop3: [9, 9, 11],
    orb1: [244, 244, 245],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.035],
    node: [228, 228, 231]
  },
  // p = 0.5 (Stage 1.5)
  {
    p: 0.5,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [228, 228, 231],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.04],
    node: [255, 255, 255]
  },
  // p = 0.75 (Stage 1.75)
  {
    p: 0.75,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.04],
    node: [244, 244, 245]
  },
  // p = 1.0 (State 2: Searching)
  {
    p: 1.0,
    stop0: [9, 9, 11],
    stop1: [18, 18, 22],
    stop2: [24, 24, 28],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.045],
    node: [255, 255, 255]
  },
  // p = 1.25 (Stage 2.25)
  {
    p: 1.25,
    stop0: [9, 9, 11],
    stop1: [16, 16, 20],
    stop2: [22, 22, 26],
    stop3: [9, 9, 11],
    orb1: [244, 244, 245],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.04],
    node: [228, 228, 231]
  },
  // p = 1.5 (Stage 2.5)
  {
    p: 1.5,
    stop0: [9, 9, 11],
    stop1: [15, 15, 19],
    stop2: [20, 20, 24],
    stop3: [9, 9, 11],
    orb1: [228, 228, 231],
    orb2: [161, 161, 170],
    grid: [255, 255, 255, 0.035],
    node: [255, 255, 255]
  },
  // p = 1.75 (Stage 2.75)
  {
    p: 1.75,
    stop0: [9, 9, 11],
    stop1: [14, 14, 18],
    stop2: [19, 19, 23],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [113, 113, 122],
    grid: [255, 255, 255, 0.035],
    node: [244, 244, 245]
  },
  // p = 2.0 (State 3: Resolution)
  {
    p: 2.0,
    stop0: [9, 9, 11],
    stop1: [14, 14, 17],
    stop2: [18, 18, 22],
    stop3: [9, 9, 11],
    orb1: [255, 255, 255],
    orb2: [255, 59, 48],
    grid: [255, 255, 255, 0.04],
    node: [255, 255, 255]
  }
];

// Helper: Multi-point continuous color interpolation
function sampleColorChannel(val, getRGB) {
  const count = COLOR_WAYPOINTS.length;
  if (val <= COLOR_WAYPOINTS[0].p) return getRGB(COLOR_WAYPOINTS[0]);
  if (val >= COLOR_WAYPOINTS[count - 1].p) return getRGB(COLOR_WAYPOINTS[count - 1]);

  for (let i = 0; i < count - 1; i++) {
    const w1 = COLOR_WAYPOINTS[i];
    const w2 = COLOR_WAYPOINTS[i + 1];
    if (val >= w1.p && val <= w2.p) {
      const t = (val - w1.p) / (w2.p - w1.p);
      const c1 = getRGB(w1);
      const c2 = getRGB(w2);
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      return [r, g, b];
    }
  }
  return [9, 9, 11];
}

export default function IntroExperience({ isComplete, setIsComplete, isActive = true, onReverseToBrandIntro }) {
  const [currentState, setCurrentState] = useState(0);
  const stateRef = useRef(0);
  const isCompleteRef = useRef(isComplete);
  const isActiveRef = useRef(isActive);
  const onReverseRef = useRef(onReverseToBrandIntro);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(null);

  // Smooth continuous transition progress (0.0 to 2.0)
  const progressRef = useRef(0);
  const morphTweenRef = useRef(null);

  // DOM Refs
  const canvasRef = useRef(null);
  const world3dRef = useRef(null);
  const titleContainerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    stateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    onReverseRef.current = onReverseToBrandIntro;
  }, [onReverseToBrandIntro]);

  // Lock / unlock body scroll depending on isComplete & isActive
  useEffect(() => {
    if (!isActive) return;

    if (!isComplete) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    return () => {
      if (isActive) {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    };
  }, [isComplete, isActive]);

  // Unified Multi-Stage Continuous Gradient & Stationary Title Transition (In-Place Text Change, No Frame Movement)
  const animateToState = (targetState, direction = 'down') => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const fromProg = progressRef.current;
    const toProg = targetState;

    // 1. Title fade out strictly in-place (no vertical shift, no scale, no tilt)
    if (titleContainerRef.current) {
      const currentChars = titleContainerRef.current.querySelectorAll('.roll-char-span');
      if (currentChars.length) {
        gsap.to(currentChars, {
          y: 0,
          scale: 1,
          opacity: 0,
          duration: 0.3,
          stagger: 0.008,
          ease: 'power2.out'
        });
      }
    }

    // 2. Stationary timeline transition (keep world stage locked without 3D rotation/scale)
    const proxy = { p: fromProg };
    if (morphTweenRef.current) morphTweenRef.current.kill();

    morphTweenRef.current = gsap.to(proxy, {
      p: toProg,
      duration: 0.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        progressRef.current = proxy.p;
        if (world3dRef.current) {
          world3dRef.current.style.transform = 'none';
        }
      },
      onComplete: () => {
        progressRef.current = toProg;
        if (world3dRef.current) {
          world3dRef.current.style.transform = 'none';
        }
        isAnimatingRef.current = false;
      }
    });

    // 3. Switch React state midway for smooth in-place text swap
    setTimeout(() => {
      setCurrentState(targetState);
    }, 320);
  };

  // In-Place Title Entrance (Fade in without vertical movement or scaling)
  useEffect(() => {
    if (!titleContainerRef.current) return;
    const chars = titleContainerRef.current.querySelectorAll('.roll-char-span');
    if (!chars.length) return;

    gsap.fromTo(
      chars,
      {
        y: 0,
        scale: 1,
        opacity: 0,
        filter: 'blur(0px)'
      },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.4,
        stagger: 0.01,
        ease: 'power2.out',
        delay: 0.02
      }
    );
  }, [currentState]);

  const [scrollFade, setScrollFade] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Natural Page Scroll & Interactive Title Transition
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      // Smoothly dissolve and gently float screen 1 content as user scrolls towards screen 2
      const fade = Math.max(0, Math.min(1, 1 - scrollY / 360));
      setScrollFade(fade);
      setScrollOffset(scrollY * 0.22);

      if (scrollY > 120 && stateRef.current === 0 && !isAnimatingRef.current) {
        animateToState(1, 'down');
      } else if (scrollY < 60 && stateRef.current === 1 && !isAnimatingRef.current) {
        animateToState(0, 'up');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Continuous Fluid Multi-Stage Gradient Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 45 Nodes for ambient & structured network
    const nodeCount = 45;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x0: Math.random() * width,
        y0: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.5,
        alpha: Math.random() * 0.5 + 0.35,
        angle: (i / nodeCount) * Math.PI * 2,
        dist1: 140 + (i % 6) * 55,
        dist2: 200 + (i % 4) * 45
      });
    }

    let time = 0;
    let pulseRadius = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current; // 0.0 to 2.0 continuous float
      const centerX = width * 0.5;
      const centerY = height * 0.48;

      // 1. Transparent Cosmic Atmosphere Radial Gradient (reveals underlying multi-layer starfield)
      const maxAtmosphereRadius = Math.min(centerX, centerY, height * 0.5) * 1.1;
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        30,
        centerX,
        centerY,
        maxAtmosphereRadius
      );
      grad.addColorStop(0, 'rgba(15, 20, 45, 0.28)');
      grad.addColorStop(0.5, 'rgba(8, 12, 28, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Fluid Traveling Gradient Light Orbs
      const orb1RGB = sampleColorChannel(p, (w) => w.orb1);
      const orb2RGB = sampleColorChannel(p, (w) => w.orb2);

      // Moving Orb 1: Orbits smoothly based on progress & time
      const orb1X = centerX + Math.cos(p * Math.PI * 0.8 + time * 0.3) * (width * 0.26);
      const orb1Y = centerY + Math.sin(p * Math.PI * 0.6 + time * 0.25) * (height * 0.20);
      const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 320);
      orb1Grad.addColorStop(0, `rgba(${orb1RGB[0]}, ${orb1RGB[1]}, ${orb1RGB[2]}, 0.14)`);
      orb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb1Grad;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 320, 0, Math.PI * 2);
      ctx.fill();

      // Moving Orb 2: Counter-orbit
      const orb2X = centerX - Math.cos(p * Math.PI * 0.9 - time * 0.2) * (width * 0.30);
      const orb2Y = centerY - Math.sin(p * Math.PI * 0.7 - time * 0.3) * (height * 0.22);
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 340);
      orb2Grad.addColorStop(0, `rgba(${orb2RGB[0]}, ${orb2RGB[1]}, ${orb2RGB[2]}, 0.11)`);
      orb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb2Grad;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 340, 0, Math.PI * 2);
      ctx.fill();

      // 4. Searching Radar Pulse Waves (smooth bell curve around p = 1.0)
      if (p > 0.08 && p < 1.92) {
        const searchWeight = p <= 1.0 ? p : (2.0 - p); // 0 -> 1 -> 0
        ctx.save();
        // Constrain max radar radius so pulse wave dissolves naturally before touching screen borders
        const maxRadarR = Math.min(centerY - 30, height - centerY - 45, width * 0.42, 340);
        pulseRadius = (pulseRadius + 1.6) % maxRadarR;

        for (let r = 0; r < 3; r++) {
          const currentR = (pulseRadius + r * (maxRadarR / 3)) % maxRadarR;
          const ratio = currentR / maxRadarR;
          // Smooth quadratic falloff ensuring complete evaporation before boundary
          const alpha = Math.pow(1 - ratio, 2) * 0.28 * searchWeight;
          if (alpha > 0.005) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. Resolution Radiant Energy Bloom (smooth growth for p > 1.0)
      if (p > 1.0) {
        const resWeight = p - 1.0; // 0 to 1
        ctx.save();
        const maxBloom = Math.min(centerY - 20, height - centerY - 40, 360);
        const bloomRadius = maxBloom * resWeight;
        const bloomGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, bloomRadius);
        bloomGrad.addColorStop(0, `rgba(52, 211, 153, ${0.25 * resWeight})`);
        bloomGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.12 * resWeight})`);
        bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bloomRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Smoothly Interpolating Nodes & Interconnecting Lines
      const nodeRGB = sampleColorChannel(p, (w) => w.node);
      const nodeFillStr = `rgb(${nodeRGB[0]}, ${nodeRGB[1]}, ${nodeRGB[2]})`;

      ctx.save();
      nodes.forEach((node, i) => {
        node.x0 += node.vx;
        node.y0 += node.vy;
        if (node.x0 < 0) node.x0 = width;
        if (node.x0 > width) node.x0 = 0;
        if (node.y0 < 0) node.y0 = height;
        if (node.y0 > height) node.y0 = 0;

        const posX0 = node.x0;
        const posY0 = node.y0;

        const angle1 = node.angle + time * 0.4;
        const posX1 = centerX + Math.cos(angle1) * node.dist1;
        const posY1 = centerY + Math.sin(angle1) * node.dist1;

        const angle2 = node.angle - time * 0.25;
        const posX2 = centerX + Math.cos(angle2) * node.dist2;
        const posY2 = centerY + Math.sin(angle2) * node.dist2;

        let curX, curY;
        if (p <= 1.0) {
          curX = posX0 + (posX1 - posX0) * p;
          curY = posY0 + (posY1 - posY0) * p;
        } else {
          const t = p - 1.0;
          curX = posX1 + (posX2 - posX1) * t;
          curY = posY1 + (posY2 - posY1) * t;
        }

        const edgeFade = Math.max(0, Math.min(1, (height - curY) / 100));

        ctx.beginPath();
        ctx.arc(curX, curY, node.size * (1 + 0.15 * (p / 2)), 0, Math.PI * 2);
        ctx.fillStyle = nodeFillStr;
        ctx.globalAlpha = node.alpha * edgeFade;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          let otherX, otherY;
          if (p <= 1.0) {
            const ox0 = other.x0;
            const oy0 = other.y0;
            const oAng1 = other.angle + time * 0.4;
            const ox1 = centerX + Math.cos(oAng1) * other.dist1;
            const oy1 = centerY + Math.sin(oAng1) * other.dist1;
            otherX = ox0 + (ox1 - ox0) * p;
            otherY = oy0 + (oy1 - oy0) * p;
          } else {
            const t = p - 1.0;
            const oAng1 = other.angle + time * 0.4;
            const ox1 = centerX + Math.cos(oAng1) * other.dist1;
            const oy1 = centerY + Math.sin(oAng1) * other.dist1;
            const oAng2 = other.angle - time * 0.25;
            const ox2 = centerX + Math.cos(oAng2) * other.dist2;
            const oy2 = centerY + Math.sin(oAng2) * other.dist2;
            otherX = ox1 + (ox2 - ox1) * t;
            otherY = oy1 + (oy2 - oy1) * t;
          }

          const dx = curX - otherX;
          const dy = curY - otherY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120 + (p >= 1.0 ? 30 : 0);

          const otherEdgeFade = Math.max(0, Math.min(1, (height - otherY) / 100));
          const lineEdgeFade = Math.min(edgeFade, otherEdgeFade);

          if (dist < maxDist && lineEdgeFade > 0.01) {
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = nodeFillStr;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.25 * lineEdgeFade;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      });
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const activeTitle = TITLES[currentState];

  return (
    <div className="intro-experience-wrapper fixed-intro-stage" id="intro-experience-viewport">
      {/* Stationary World Stage (No frame movement/tilting) */}
      <div ref={world3dRef} className="intro-3d-world-stage" style={{ transform: 'none' }}>
        {/* Continuous Fluid Multi-Stage Gradient Canvas */}
        <canvas ref={canvasRef} className="intro-experience-canvas" />

        {/* Ambient Vignette Overlay */}
        <div className="intro-vignette-overlay" />

        {/* Stationary Title Stage with fluid scroll-driven cosmic fade */}
        <div
          className="intro-content-container"
          style={{
            opacity: scrollFade,
            transform: `translateY(${-scrollOffset}px)`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
            pointerEvents: scrollFade < 0.1 ? 'none' : 'auto'
          }}
        >
          <div className="intro-3d-stage">
            <div
              key={activeTitle.id}
              ref={titleContainerRef}
              className="title-3d-card active-roll-card"
              style={{
                '--title-accent': activeTitle.accent,
                '--title-glow': activeTitle.glow,
                transform: 'none',
                boxShadow: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              {/* Official CreativeGini Logo Image */}
              <div className="screen1-logo-container">
                <img src="/logo.png" alt="CreativeGini Logo" className="screen1-hero-logo-img" />
              </div>

              {/* Related Matter in Typewriter Format */}
              <TypewriterSubtext text={activeTitle.subtext} speed={25} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
