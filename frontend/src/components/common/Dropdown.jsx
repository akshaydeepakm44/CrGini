import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';

/**
 * Reusable Dropdown Component
 * Supports trigger node or default trigger button
 */
export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  className = '',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`cg-dropdown ${className}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      <div onClick={() => setIsOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {trigger || (
          <button
            type="button"
            className="cg-dropdown-trigger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--cg-radius-md)',
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--cg-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--cg-transition-fast)',
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="cg-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'right' ? 'right' : 'left']: 0,
            minWidth: '180px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--cg-radius-md)',
            boxShadow: 'var(--cg-shadow-modal)',
            border: '1px solid var(--cg-border-light)',
            padding: '6px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={index}
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--cg-border-light)',
                    margin: '6px 0',
                  }}
                />
              );
            }

            const Icon = item.icon;

            return (
              <button
                key={index}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--cg-radius-sm)',
                  fontSize: '0.84375rem',
                  fontWeight: 500,
                  fontFamily: 'var(--cg-font-family)',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  color: item.danger
                    ? 'var(--cg-coral-600)'
                    : item.disabled
                    ? 'var(--cg-text-disabled)'
                    : 'var(--cg-text-primary)',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  transition: 'background var(--cg-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = item.danger
                      ? 'var(--cg-coral-50)'
                      : 'var(--cg-purple-50)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {Icon && <Icon size={16} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
