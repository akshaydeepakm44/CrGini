import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Edit3, KeyRound, UserCheck, UserX, Trash2 } from 'lucide-react';

export default function ActionMenu({ user, onView, onEdit, onResetPassword, onToggleStatus, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerButtonRef = useRef(null);
  const popoverRef = useRef(null);

  const updatePosition = () => {
    if (!triggerButtonRef.current) return;
    const rect = triggerButtonRef.current.getBoundingClientRect();
    const popoverWidth = 190;
    const popoverHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < popoverHeight && spaceAbove > popoverHeight;

    let top = openUpward ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    let left = rect.right - popoverWidth;

    // Safety check against viewport bounds
    if (left < 10) left = 10;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10;
    }

    setCoords({ top, left });
  };

  const toggleMenu = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event) => {
      if (
        popoverRef.current && !popoverRef.current.contains(event.target) &&
        triggerButtonRef.current && !triggerButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="portal-action-menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        className="portal-btn-secondary"
        style={{ padding: '4px 10px', fontSize: '0.75rem', height: '30px' }}
        onClick={() => onView(user._id || user.id)}
        title="View User Details"
      >
        <Eye size={13} /> View
      </button>

      <button
        type="button"
        className="portal-btn-secondary"
        style={{ padding: '4px 10px', fontSize: '0.75rem', height: '30px' }}
        onClick={() => onEdit(user)}
        title="Edit User Information"
      >
        <Edit3 size={13} /> Edit
      </button>

      <button
        ref={triggerButtonRef}
        type="button"
        className="portal-btn-secondary"
        style={{ 
          padding: '4px 8px', 
          fontSize: '0.75rem', 
          height: '30px',
          background: isOpen ? 'rgba(0, 217, 255, 0.15)' : undefined,
          borderColor: isOpen ? 'rgba(0, 217, 255, 0.4)' : undefined
        }}
        onClick={toggleMenu}
        title="More Actions"
      >
        <MoreVertical size={14} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="portal-action-popover portal-action-portal"
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 999999,
            minWidth: '190px'
          }}
        >
          <button
            type="button"
            className="portal-action-item"
            style={{ color: '#fbbf24' }}
            onClick={() => {
              setIsOpen(false);
              onResetPassword(user);
            }}
          >
            <KeyRound size={14} />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            className="portal-action-item"
            style={{ color: user.status === 'DISABLED' ? '#34d399' : '#f87171' }}
            onClick={() => {
              setIsOpen(false);
              onToggleStatus(user);
            }}
          >
            {user.status === 'DISABLED' ? <UserCheck size={14} /> : <UserX size={14} />}
            <span>{user.status === 'DISABLED' ? 'Enable Account' : 'Disable Account'}</span>
          </button>

          {user.role !== 'ADMIN' && (
            <button
              type="button"
              className="portal-action-item danger"
              onClick={() => {
                setIsOpen(false);
                onDelete(user);
              }}
            >
              <Trash2 size={14} />
              <span>Delete User</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
