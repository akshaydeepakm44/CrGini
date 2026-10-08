import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading Spinner & Skeleton Loaders
 */
export function Spinner({ size = 28, color = 'var(--cg-purple-600)', className = '', style = {} }) {
  return (
    <div
      className={`cg-spinner-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Loader2
        size={size}
        style={{
          color,
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--cg-radius-sm)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--cg-neutral-100)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--cg-radius-lg)',
            padding: '24px',
            border: '1px solid var(--cg-border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="12px" />
            </div>
          </div>
          <Skeleton width="100%" height="14px" />
          <Skeleton width="80%" height="14px" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingState({ message = 'Loading details...', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: '16px',
        ...style,
      }}
    >
      <Spinner size={36} />
      <span style={{ fontSize: '0.9375rem', color: 'var(--cg-text-secondary)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
}
