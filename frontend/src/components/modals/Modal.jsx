import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Accessible Modal Component
 * Backdrop blur, scale animation, escape key support, scroll containment
 */
export default function Modal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick = true,
  className = '',
  style = {},
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: '440px',
    md: '560px',
    lg: '740px',
    xl: '960px',
  };

  const maxWidth = sizeMap[size] || sizeMap.md;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="cg-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 16, 64, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`cg-modal-content ${className}`}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--cg-radius-xl)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--cg-shadow-modal)',
          border: '1px solid var(--cg-border-light)',
          animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--cg-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontFamily: 'var(--cg-font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--cg-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.84375rem',
                  color: 'var(--cg-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--cg-neutral-100)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cg-text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--cg-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--cg-purple-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--cg-neutral-100)')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--cg-border-light)',
              backgroundColor: 'var(--cg-bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
