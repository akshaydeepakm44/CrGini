import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function SignInPage({ onLogin, onBackHome, showToast, initialView = 'signin' }) {
  const [viewMode, setViewMode] = useState(initialView);
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);

  useEffect(() => {
    if (initialView) {
      setViewMode(initialView);
    }
  }, [initialView]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.login(email.trim(), password);
      setIsSubmitting(false);
      onLogin(response.user);
    } catch (err) {
      setIsSubmitting(false);
      console.error('[CreativeGini Auth Error]:', err);
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setErrorMessage('Unable to connect to the service. Please check your internet connection or try again later.');
      } else {
        setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    const trimmed = forgotEmail.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setForgotError('Please enter a valid work email address.');
      return;
    }

    setIsForgotSubmitting(true);

    try {
      await api.forgotPassword(trimmed);
      setIsForgotSubmitting(false);
      setIsForgotSuccess(true);
    } catch (err) {
      setIsForgotSubmitting(false);
      console.error('[Forgot Password Error]:', err);
      setForgotError(err.message || 'Unable to request password reset. Please try again.');
    }
  };

  const switchToForgot = (e) => {
    if (e) e.preventDefault();
    setViewMode('forgot');
    setErrorMessage('');
    setForgotError('');
    setIsForgotSuccess(false);
    if (email) setForgotEmail(email);
  };

  const switchToSignIn = (e) => {
    if (e) e.preventDefault();
    setViewMode('signin');
    setErrorMessage('');
    setForgotError('');
    setIsForgotSuccess(false);
  };

  return (
    <div className="signin-page-root">
      {/* Subtle Background Ambience */}
      <div className="signin-ambient-glow glow-cyan" />
      <div className="signin-ambient-glow glow-violet" />
      <div className="signin-grid-overlay" />

      {/* Top Header Navigation */}
      <header className="signin-nav-bar">
        <button 
          type="button" 
          className="signin-back-btn" 
          onClick={viewMode === 'forgot' ? switchToSignIn : onBackHome}
          title={viewMode === 'forgot' ? 'Return to Sign In' : 'Return to CreativeGini Homepage'}
        >
          <ArrowLeft size={16} />
          <span>{viewMode === 'forgot' ? 'Back to Sign In' : 'Back to Home'}</span>
        </button>

        <div className="signin-nav-brand" onClick={onBackHome} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="CreativeGini" className="signin-nav-logo" />
        </div>
      </header>

      {/* Main Container */}
      <main className="signin-layout-container">
        <div className="signin-split-grid" style={{ maxWidth: '460px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          
          {/* Auth Form Card */}
          <div className="signin-card-wrapper">
            <div className="signin-card glass-panel" style={{ padding: '2.5rem 2rem' }}>
              
              {/* Header inside Card */}
              <div className="signin-card-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <img src="/logo.png" alt="CreativeGini" style={{ height: '42px', width: 'auto' }} />
                </div>
                <h1 className="signin-title" style={{ fontSize: '1.65rem', marginBottom: '0.4rem' }}>
                  {viewMode === 'signin' ? 'Sign In to CreativeGini' : 'Reset Your Password'}
                </h1>
                <p className="signin-subtitle" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                  {viewMode === 'signin'
                    ? 'Enter your credentials to access your portal and workspace.'
                    : 'Enter your registered email address to receive password recovery instructions.'}
                </p>
              </div>

              {/* ================= VIEW: SIGN IN ================= */}
              {viewMode === 'signin' && (
                <>
                  {/* Error Message Alert */}
                  {errorMessage && (
                    <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Main Credentials Form */}
                  <form onSubmit={handleLoginSubmit} className="auth-credentials-form">
                    <div className="form-field-group">
                      <label htmlFor="email-input" className="field-label">Work Email</label>
                      <div className="input-with-icon">
                        <Mail size={17} className="field-icon" />
                        <input
                          id="email-input"
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="auth-text-input"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <div className="field-label-row">
                        <label htmlFor="password-input" className="field-label">Password</label>
                        <a href="#forgot" onClick={switchToForgot} className="forgot-password-link">
                          Forgot password?
                        </a>
                      </div>
                      <div className="input-with-icon">
                        <Lock size={17} className="field-icon" />
                        <input
                          id="password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="auth-text-input"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-options-row" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                      <label className="remember-checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="custom-checkbox"
                        />
                        <span>Remember this device for 30 days</span>
                      </label>
                    </div>

                    {/* Primary Submit Button */}
                    <button
                      type="submit"
                      className="auth-primary-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="submit-loading-state">
                          Authenticating...
                        </span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ChevronRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* ================= VIEW: FORGOT PASSWORD ================= */}
              {viewMode === 'forgot' && (
                <>
                  {isForgotSuccess ? (
                    <div className="forgot-success-box" style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF', marginBottom: '1rem', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.6rem' }}>
                        Check Your Inbox
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '1rem' }}>
                        If an account exists for <strong>{forgotEmail}</strong>, a password reset link has been sent.
                      </p>
                      <div style={{ background: 'rgba(14, 27, 46, 0.8)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                        The reset link is valid for <strong>60 minutes</strong>. Please check your inbox and spam folder.
                      </div>
                      <button
                        type="button"
                        className="auth-primary-submit-btn"
                        onClick={switchToSignIn}
                      >
                        <span>Back to Sign In</span>
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Error Message Alert */}
                      {forgotError && (
                        <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{forgotError}</span>
                        </div>
                      )}

                      <form onSubmit={handleForgotPasswordSubmit} className="auth-credentials-form">
                        <div className="form-field-group">
                          <label htmlFor="forgot-email-input" className="field-label">Registered Work Email</label>
                          <div className="input-with-icon">
                            <Mail size={17} className="field-icon" />
                            <input
                              id="forgot-email-input"
                              type="email"
                              placeholder="name@company.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="auth-text-input"
                              autoComplete="email"
                              autoFocus
                              disabled={isForgotSubmitting}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.5', margin: 0 }}>
                            A single-use link valid for 60 minutes will be delivered to your registered email address.
                          </p>
                        </div>

                        {/* Send Reset Link Button */}
                        <button
                          type="submit"
                          className="auth-primary-submit-btn"
                          disabled={isForgotSubmitting}
                        >
                          {isForgotSubmitting ? (
                            <span className="submit-loading-state">
                              Sending Reset Link...
                            </span>
                          ) : (
                            <>
                              <span>Send Reset Link</span>
                              <ChevronRight size={17} />
                            </>
                          )}
                        </button>

                        {/* Back to Sign In Option */}
                        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                          <button
                            type="button"
                            onClick={switchToSignIn}
                            className="forgot-back-to-signin-btn"
                            disabled={isForgotSubmitting}
                          >
                            Back to Sign In
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              )}

              {/* Trust Footer inside card */}
              <div className="signin-card-footer" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                <div className="trust-badge-row" style={{ justifyContent: 'center' }}>
                  <ShieldCheck size={14} className="shield-icon" />
                  <span>256-bit SSL · Role-Based Security · Enterprise Privacy</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

