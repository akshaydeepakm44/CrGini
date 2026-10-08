import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export default function ResetPasswordPage({ onBackHome, showToast }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  // Verification states
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token.trim()) {
      setIsVerifying(false);
      setTokenValid(false);
      setVerificationError('This password reset link is invalid or missing. Please request a new one.');
      return;
    }

    let isMounted = true;

    api.verifyResetToken(token)
      .then(() => {
        if (isMounted) {
          setTokenValid(true);
          setIsVerifying(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setTokenValid(false);
          setVerificationError(err.message || 'This password reset link is invalid or has expired. Please request a new one.');
          setIsVerifying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Live checklist criteria
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isFormValid) {
      if (!hasMinLength || !hasLetter || !hasNumber) {
        setSubmitError('Password must be at least 8 characters long and contain at least one letter and one number.');
      } else if (!passwordsMatch) {
        setSubmitError('Passwords do not match.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await api.resetPassword(token, newPassword);
      try {
        localStorage.removeItem('cg_auth_token');
      } catch (_) {}
      setIsSubmitting(false);
      setIsSuccess(true);
      if (showToast) {
        showToast('Password updated successfully. You can now sign in.');
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('[Reset Password Error]:', err);
      setSubmitError(err.message || 'Unable to reset password. The link may have expired.');
    }
  };

  const handleNavigateToSignIn = () => {
    navigate('/signin');
  };

  const handleRequestNewLink = () => {
    navigate('/signin');
  };

  return (
    <div className="signin-page-root">
      {/* Subtle Background Ambience */}
      <div className="signin-ambient-glow glow-cyan" />
      <div className="signin-ambient-glow glow-violet" />
      <div className="signin-grid-overlay" />

      {/* Top Navigation */}
      <header className="signin-nav-bar">
        <button 
          type="button" 
          className="signin-back-btn" 
          onClick={handleNavigateToSignIn}
          title="Return to Sign In"
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>

        <div className="signin-nav-brand" onClick={onBackHome || (() => navigate('/'))} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="CreativeGini" className="signin-nav-logo" />
        </div>
      </header>

      {/* Main Container */}
      <main className="signin-layout-container">
        <div className="signin-split-grid" style={{ maxWidth: '460px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          
          <div className="signin-card-wrapper">
            <div className="signin-card glass-panel" style={{ padding: '2.5rem 2rem' }}>

              {/* Header inside Card */}
              <div className="signin-card-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <img src="/logo.png" alt="CreativeGini" style={{ height: '42px', width: 'auto' }} />
                </div>
                <h1 className="signin-title" style={{ fontSize: '1.65rem', marginBottom: '0.4rem' }}>
                  {isSuccess ? 'Password Updated' : 'Create New Password'}
                </h1>
                <p className="signin-subtitle" style={{ fontSize: '0.9rem', color: '#5B527E' }}>
                  {isSuccess
                    ? 'Your account security credentials have been updated.'
                    : 'Set a strong, secure password for your CreativeGini account.'}
                </p>
              </div>

              {/* ================= STATE 1: VERIFYING TOKEN ================= */}
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                  <div className="portal-spinner" style={{ margin: '0 auto 1.25rem' }} />
                  <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    Verifying security recovery link...
                  </p>
                </div>
              )}

              {/* ================= STATE 2: INVALID OR EXPIRED TOKEN ================= */}
              {!isVerifying && !tokenValid && !isSuccess && (
                <div className="forgot-invalid-box" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', marginBottom: '1rem', border: '1px solid #FECACA' }}>
                    <AlertCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1040', marginBottom: '0.6rem' }}>
                    Link Expired or Invalid
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#5B527E', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {verificationError || 'This password reset link is invalid or has expired. Please request a new one.'}
                  </p>
                  <button
                    type="button"
                    className="auth-primary-submit-btn"
                    onClick={handleRequestNewLink}
                  >
                    <RefreshCw size={16} />
                    <span>Request a New Reset Link</span>
                  </button>
                </div>
              )}

              {/* ================= STATE 3: SUCCESSFUL RESET ================= */}
              {!isVerifying && isSuccess && (
                <div className="forgot-success-box" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', marginBottom: '1rem', border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1040', marginBottom: '0.6rem' }}>
                    Password Updated Successfully
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#5B527E', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Your password has been updated successfully. You can now sign in using your new password.
                  </p>
                  <button
                    type="button"
                    className="auth-primary-submit-btn"
                    onClick={handleNavigateToSignIn}
                  >
                    <span>Continue to Sign In</span>
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}

              {/* ================= STATE 4: PASSWORD RESET FORM ================= */}
              {!isVerifying && tokenValid && !isSuccess && (
                <>
                  {submitError && (
                    <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetSubmit} className="auth-credentials-form">
                    
                    {/* New Password Field */}
                    <div className="form-field-group">
                      <label htmlFor="new-password-input" className="field-label">New Password</label>
                      <div className="input-with-icon">
                        <Lock size={17} className="field-icon" />
                        <input
                          id="new-password-input"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="auth-text-input"
                          autoComplete="new-password"
                          autoFocus
                          disabled={isSubmitting}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-field-group">
                      <label htmlFor="confirm-password-input" className="field-label">Confirm New Password</label>
                      <div className="input-with-icon">
                        <Lock size={17} className="field-icon" />
                        <input
                          id="confirm-password-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="auth-text-input"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="password-checklist-box">
                      <div className="checklist-title">Password Requirements:</div>
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
                    </div>

                    {/* Reset Submit Button */}
                    <button
                      type="submit"
                      className="auth-primary-submit-btn"
                      disabled={isSubmitting || !isFormValid}
                      style={{ marginTop: '0.5rem' }}
                    >
                      {isSubmitting ? (
                        <span className="submit-loading-state">
                          Updating Password...
                        </span>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <ChevronRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Trust Footer inside card */}
              <div className="signin-card-footer" style={{ marginTop: '2rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
                <div className="trust-badge-row" style={{ justifyContent: 'center' }}>
                  <ShieldCheck size={14} className="shield-icon" />
                  <span>256-bit SSL · Single-Use Token · Enterprise Privacy</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
