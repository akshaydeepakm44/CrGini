import React from 'react';

export default function CreativeGiniMagic({ progress = 0 }) {
  // progress from 0.0 to 1.0
  // Starts appearing around p = 0.25, full at p >= 0.50
  if (progress <= 0.05) return null;

  // Normalized intensity t: 0.0 at p = 0.15, reaches 1.0 at p = 0.50
  const t = Math.max(0, Math.min(1, (progress - 0.15) / 0.35));
  const scale = 0.35 + t * 0.8;
  const opacity = Math.min(1, t * 1.25);

  return (
    <div
      className="creativegini-magic-portal-wrapper"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: 3,
        transition: 'opacity 0.15s ease, transform 0.2s ease'
      }}
    >
      {/* Radiant Central Light Glow */}
      <div className="magic-core-glow" />

      {/* Swirling SVG Energy Rings */}
      <svg className="magic-energy-rings-svg" viewBox="0 0 500 500" width="460" height="460">
        <defs>
          <linearGradient id="magicRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="magicRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.75" />
          </linearGradient>
          <filter id="magicBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Outer Pulsing Ring */}
        <circle
          cx="250"
          cy="250"
          r="180"
          fill="none"
          stroke="url(#magicRingGrad1)"
          strokeWidth="2.5"
          strokeDasharray="14 10"
          className="magic-rotate-clockwise"
        />

        {/* Middle Counter-Rotating Ring */}
        <circle
          cx="250"
          cy="250"
          r="140"
          fill="none"
          stroke="url(#magicRingGrad2)"
          strokeWidth="3"
          strokeDasharray="20 12"
          className="magic-rotate-counter"
        />

        {/* Inner Glowing Swirl */}
        <circle
          cx="250"
          cy="250"
          r="90"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          filter="url(#magicBlur)"
          className="magic-pulse-core"
        />

        {/* Four Star Sparkle Anchors */}
        <path d="M 250 40 Q 250 70 270 70 Q 250 70 250 100 Q 250 70 230 70 Q 250 70 250 40 Z" fill="#fbbf24" />
        <path d="M 250 400 Q 250 430 270 430 Q 250 430 250 460 Q 250 430 230 430 Q 250 430 250 400 Z" fill="#38bdf8" />
        <path d="M 70 250 Q 100 250 100 270 Q 100 250 130 250 Q 100 250 100 230 Q 100 250 70 250 Z" fill="#ec4899" />
        <path d="M 370 250 Q 400 250 400 270 Q 400 250 430 250 Q 400 250 400 230 Q 400 250 370 250 Z" fill="#a855f7" />
      </svg>
    </div>
  );
}
