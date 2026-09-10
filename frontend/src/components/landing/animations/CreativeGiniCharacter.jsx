import React from 'react';

export default function CreativeGiniCharacter({ progress = 0 }) {
  // progress from 0.0 to 1.0
  // Begins emerging around p = 0.45, fully settled at p >= 0.75
  if (progress <= 0.42) return null;

  // Normalized emergence t: 0.0 at p = 0.45 -> 1.0 at p = 0.75
  const t = Math.max(0, Math.min(1, (progress - 0.45) / 0.30));

  const scale = 0.45 + t * 0.55;
  const opacity = Math.min(1, t * 1.3);
  const translateY = (1 - t) * 45;
  const rotateDeg = (1 - t) * -8;
  const blurVal = (1 - t) * 12;
  const brightnessVal = 1 + (1 - t) * 0.8;

  return (
    <div
      className="creativegini-character-container"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale}) rotate(${rotateDeg}deg)`,
        opacity: opacity,
        zIndex: 5,
        filter: `blur(${blurVal}px) brightness(${brightnessVal})`,
        pointerEvents: 'none',
        transition: 'opacity 0.15s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Dynamic Luminous Aura behind Character */}
      <div className="gini-character-aura" />

      {/* Official Exact CreativeGini Mark Asset */}
      <img
        src="/logo-icon.png"
        alt="CreativeGini Genie"
        className="gini-character-official-img"
      />
    </div>
  );
}
