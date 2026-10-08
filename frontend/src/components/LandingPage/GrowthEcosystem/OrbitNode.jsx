import React from 'react';

/**
 * OrbitNode Component
 * Renders an interactive service node situated on one of the ecosystem orbital paths.
 */
export default function OrbitNode({
  node,
  isActive = false,
  isHovered = false,
  onClick,
  onHover,
  onLeave,
  center = 280
}) {
  const { id, name, icon: IconComponent, ringRadius, angleDeg, color, floatDelay = 0 } = node;

  // Polar to Cartesian coordinate mapping
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = Math.round(center + ringRadius * Math.cos(angleRad));
  const y = Math.round(center + ringRadius * Math.sin(angleRad));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick && onClick(node);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Service: ${name}`}
      aria-pressed={isActive}
      className={`cg-orbit-node ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        animationDelay: `${floatDelay}s`
      }}
      onClick={() => onClick && onClick(node)}
      onMouseEnter={() => onHover && onHover(node)}
      onMouseLeave={() => onLeave && onLeave(node)}
      onFocus={() => onHover && onHover(node)}
      onBlur={() => onLeave && onLeave(node)}
      onKeyDown={handleKeyDown}
    >
      <div className="cg-orbit-node-inner">
        <div
          className="cg-node-icon-box"
          style={{
            background: color || 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
          }}
        >
          {IconComponent && <IconComponent size={15} />}
        </div>
        <span className="cg-node-label">{name}</span>
      </div>
    </div>
  );
}
