import React from 'react';

/**
 * OrbitRing Component
 * Renders an SVG orbital track with soft dashed styling, gentle glow, and highlight state.
 */
export default function OrbitRing({
  radius = 160,
  stroke = 'rgba(196, 181, 253, 0.45)',
  strokeDasharray = '5 7',
  strokeWidth = 1.2,
  isHighlighted = false,
  rotationClass = ''
}) {
  const center = 280; // Assuming 560x560 viewBox

  return (
    <g className={rotationClass}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={isHighlighted ? '#8B5CF6' : stroke}
        strokeWidth={isHighlighted ? 2 : strokeWidth}
        strokeDasharray={strokeDasharray}
        className={`cg-orbit-ring-svg ${isHighlighted ? 'highlighted' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))' : 'none'
        }}
      />
    </g>
  );
}
