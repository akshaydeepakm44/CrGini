import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound 
} from 'lucide-react';
import { api } from '../../services/api';

export default function ChangePasswordSection({ onPasswordChanged, showToast }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live validation checklist
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = currentPassword.length === 0 || newPassword.length === 0 || currentPassword !== newPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLetter &&
    hasNumber &&
    passwordsMatch &&
    isDifferentFromCurrent;

  const handleResetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one letter and one number.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.changePassword(currentPassword, newPassword);
      setIsSubmitting(false);
      setSuccessMessage(response.message || 'Your password has been changed successfully.');
      handleResetForm();

      if (showToast) {
        showToast('Your password has been changed successfully.');
      }
      if (onPasswordChanged) {
        onPasswordChanged();
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('[Change Password Error]:', err);
      setErrorMessage(err.message || 'Unable to change password. Please verify your current password.');
    }
  };

  return (
    <div className="portal-card" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <KeyRound size={18} style={{ color: '#00D9FF' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#F5F5F5' }}>
              Change Password
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
            Keep your account secure by using a strong, unique password.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          color: '#34D399',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#F87171',
          fontSize: '0.85rem',
          fontWeight: '500',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          
          {/* Current Password */}
          <div>
            <label className="portal-form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className="portal-form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrorMessage(''); }}
                disabled={isSubmitting}
                autoComplete="current-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="portal-form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="portal-form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="portal-form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="portal-form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(''); }}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

        </div>

        {/* Live Validation Checklist */}
        {newPassword.length > 0 && (
          <div className="password-checklist-box" style={{ maxWidth: '480px', marginBottom: '1.25rem' }}>
            <div className="checklist-title">Password Security Requirements:</div>
            <div className="checklist-item">
              {hasMinLength ? (
                <CheckCircle2 size={14} className="check-icon success" />
              ) : (
                <span className="check-dot" />
              )}
              <span className={hasMinLength ? 'text-success' : 'text-pending'}>
                At least 8 characters
              </span>
            </div>
            <div className="checklist-item">
              {hasLetter ? (
                <CheckCircle2 size={14} className="check-icon success" />
              ) : (
                <span className="check-dot" />
              )}
              <span className={hasLetter ? 'text-success' : 'text-pending'}>
                Contains at least one letter
              </span>
            </div>
            <div className="checklist-item">
              {hasNumber ? (
                <CheckCircle2 size={14} className="check-icon success" />
              ) : (
                <span className="check-dot" />
              )}
              <span className={hasNumber ? 'text-success' : 'text-pending'}>
                Contains at least one number
              </span>
            </div>
            {confirmPassword.length > 0 && (
              <div className="checklist-item">
                {passwordsMatch ? (
                  <CheckCircle2 size={14} className="check-icon success" />
                ) : (
                  <XCircle size={14} className="check-icon error" />
                )}
                <span className={passwordsMatch ? 'text-success' : 'text-error'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
            {currentPassword.length > 0 && newPassword === currentPassword && (
              <div className="checklist-item">
                <XCircle size={14} className="check-icon error" />
                <span className="text-error">
                  New password must be different from current password
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="submit"
            className="portal-btn-primary"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? 'Updating Password...' : 'Change Password'}
          </button>
          
          {(currentPassword || newPassword || confirmPassword) && (
            <button
              type="button"
              className="portal-btn-secondary"
              onClick={handleResetForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
