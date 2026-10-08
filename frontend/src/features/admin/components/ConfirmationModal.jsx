import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Administrative Action',
  message = 'Are you sure you want to proceed with this action? This operation will be permanently recorded in the platform audit log.',
  confirmText = 'Confirm Action',
  requireReason = false,
  reasonPlaceholder = 'Please enter an operational justification for this change...',
  isDestructive = false,
  isSubmitting = false,
}) {
  const [reason, setReason] = useState('');
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    if (isDestructive && !confirmedCheckbox) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="cg-modal-backdrop">
      <div className="cg-modal-box cg-confirm-modal">
        <div className="cg-modal-header">
          <div className="cg-modal-header-icon">
            {isDestructive ? <AlertTriangle size={20} className="text-danger" /> : <ShieldAlert size={20} className="text-warning" />}
          </div>
          <div className="cg-modal-header-text">
            <h3 className="cg-modal-title">{title}</h3>
            <span className="cg-modal-subtitle">Governance Confirmation Required</span>
          </div>
          <button className="cg-modal-close" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <div className="cg-modal-body">
          <p className="cg-confirm-message">{message}</p>

          {requireReason && (
            <div className="cg-form-group">
              <label className="cg-form-label">
                Operational Justification <span className="cg-required">*</span>
              </label>
              <textarea
                className="cg-form-textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                disabled={isSubmitting}
              />
            </div>
          )}

          {isDestructive && (
            <label className="cg-checkbox-label">
              <input
                type="checkbox"
                checked={confirmedCheckbox}
                onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>I acknowledge the impact of this operation and confirm its immediate execution.</span>
            </label>
          )}
        </div>

        <div className="cg-modal-footer">
          <button className="cg-btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={`cg-btn-primary ${isDestructive ? 'btn-danger' : ''}`}
            onClick={handleConfirm}
            disabled={isSubmitting || (requireReason && !reason.trim()) || (isDestructive && !confirmedCheckbox)}
          >
            {isSubmitting ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
