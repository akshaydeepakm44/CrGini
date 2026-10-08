import React from 'react';

/**
 * Reusable Avatar Component
 * Displays initials or image with status dot
 */
export default function Avatar({
  name = 'User',
  src,
  size = 'md',
  status, // 'online' | 'busy' | 'offline' | null
  className = '',
  style = {},
  ...props
}) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeMap = {
    xs: { dimension: 24, fontSize: '0.625rem', dot: 6 },
    sm: { dimension: 32, fontSize: '0.75rem', dot: 8 },
    md: { dimension: 40, fontSize: '0.875rem', dot: 10 },
    lg: { dimension: 48, fontSize: '1.0625rem', dot: 12 },
    xl: { dimension: 64, fontSize: '1.375rem', dot: 14 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const statusColors = {
    online: 'var(--cg-mint-500)',
    busy: 'var(--cg-coral-500)',
    offline: 'var(--cg-neutral-400)',
  };

  return (
    <div
      className={`cg-avatar cg-avatar-${size} ${className}`}
      style={{
        position: 'relative',
        width: `${currentSize.dimension}px`,
        height: `${currentSize.dimension}px`,
        borderRadius: 'var(--cg-radius-pill)',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--cg-purple-200), var(--cg-purple-300))',
        color: 'var(--cg-purple-800)',
        fontFamily: 'var(--cg-font-heading)',
        fontWeight: 700,
        fontSize: currentSize.fontSize,
        boxShadow: 'var(--cg-shadow-xs)',
        userSelect: 'none',
        ...style,
      }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: `${currentSize.dot}px`,
            height: `${currentSize.dot}px`,
            borderRadius: '50%',
            backgroundColor: statusColors[status] || statusColors.online,
            border: '2px solid #FFFFFF',
            boxSizing: 'content-box',
          }}
        />
      )}
    </div>
  );
}
