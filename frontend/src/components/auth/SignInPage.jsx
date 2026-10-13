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
  AlertCircle,
  User,
  Building
} from 'lucide-react';
import { api } from '../../services/api';
import { BRAND_LOGO } from '../../assets/branding';

export default function SignInPage({ onLogin, onBackHome, showToast, initialView = 'signin' }) {
  const [viewMode, setViewMode] = useState(initialView);
  
  // Sign In state (Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sign Up / Registration state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('mode');
    if (viewParam === 'signup' || viewParam === 'register') {
      setViewMode('signup');
    } else if (initialView) {
      setViewMode(initialView);
    }
  }, [initialView]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid work email address.');
      return;
    }
    if (!signupCompany.trim()) {
      setSignupError('Please enter your company or workspace name.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    setIsSignupSubmitting(true);
    try {
      const response = await api.register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        companyName: signupCompany.trim(),
        password: signupPassword,
        phone: signupPhone.trim() || undefined,
      });
      setIsSignupSubmitting(false);
      if (showToast) showToast('Account created successfully! Welcome to CreativeGini.');
      onLogin(response.user);
    } catch (err) {
      setIsSignupSubmitting(false);
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setSignupError('Unable to connect to the server. Please verify backend server is running on port 5000.');
      } else {
        setSignupError(err.message || 'Registration failed. Please try again.');
      }
    }
  };

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
          <img src={BRAND_LOGO} alt="CreativeGini" className="signin-nav-logo" />
        </div>
      </header>

      {/* Main Container */}
      <main className="signin-layout-container">
        <div className="signin-split-grid" style={{ maxWidth: '480px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          
          {/* Auth Form Card */}
          <div className="signin-card-wrapper">
            <div className="signin-card glass-panel" style={{ padding: '2.25rem 2rem' }}>
              
              {/* Header inside Card */}
              <div className="signin-card-header" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <img src={BRAND_LOGO} alt="CreativeGini" style={{ height: '38px', width: 'auto' }} />
                </div>
                <h1 className="signin-title" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                  {viewMode === 'signin' ? 'Sign In to CreativeGini' : viewMode === 'signup' ? 'Create Your Account' : 'Reset Your Password'}
                </h1>
                <p className="signin-subtitle" style={{ fontSize: '0.875rem', color: '#5B527E' }}>
                  {viewMode === 'signin'
                    ? 'Access your client workspace, deliverables, and projects.'
                    : viewMode === 'signup'
                    ? 'Register your organization to access curated lead intelligence & specialist deliverables.'
                    : 'Enter your registered email address to receive password recovery instructions.'}
                </p>
              </div>

              {/* TOP MODE TOGGLE TABS (Sign In / Sign Up) */}
              {viewMode !== 'forgot' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    background: '#F1F5F9',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '1.25rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setViewMode('signin'); setErrorMessage(''); }}
                    style={{
                      padding: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'signin' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'signin' ? '#1E293B' : '#64748B',
                      boxShadow: viewMode === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('signup'); setSignupError(''); }}
                    style={{
                      padding: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'signup' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'signup' ? '#1E293B' : '#64748B',
                      boxShadow: viewMode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* ================= VIEW: SIGN IN ================= */}
              {viewMode === 'signin' && (
                <>
                  {/* Direct Password Sign-In Form */}
                  {errorMessage && (
                    <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="auth-credentials-form">
                    <div className="form-field-group">
                      <label htmlFor="email-input" className="field-label">Work Email</label>
                      <div className="input-with-icon">
                        <Mail size={17} className="field-icon" />
                        <input
                          id="email-input"
                          type="email"
                          placeholder="testclient@datai2i.com"
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

                    <button
                      type="submit"
                      className="auth-primary-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="submit-loading-state">Authenticating...</span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ChevronRight size={17} />
                        </>
                      )}
                    </button>
                  </form>



                  {/* Toggle Link to Sign Up */}
                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Need a client workspace? </span>
                    <button
                      type="button"
                      onClick={() => { setViewMode('signup'); setSignupError(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1D4ED8',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}

              {/* ================= VIEW: SIGN UP (REGISTRATION) ================= */}
              {viewMode === 'signup' && (
                <div>
                  {signupError && (
                    <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignupSubmit} className="auth-credentials-form">
                    <div className="form-field-group">
                      <label htmlFor="signup-name" className="field-label">Full Name</label>
                      <div className="input-with-icon">
                        <User size={17} className="field-icon" />
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="auth-text-input"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-email" className="field-label">Work Email</label>
                      <div className="input-with-icon">
                        <Mail size={17} className="field-icon" />
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="sarah@meridian.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="auth-text-input"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-company" className="field-label">Company / Workspace Name</label>
                      <div className="input-with-icon">
                        <Building size={17} className="field-icon" />
                        <input
                          id="signup-company"
                          type="text"
                          placeholder="e.g. Meridian Financial Systems"
                          value={signupCompany}
                          onChange={(e) => setSignupCompany(e.target.value)}
                          className="auth-text-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-password" className="field-label">Password</label>
                      <div className="input-with-icon">
                        <Lock size={17} className="field-icon" />
                        <input
                          id="signup-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="auth-text-input"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-primary-submit-btn"
                      disabled={isSignupSubmitting}
                      style={{ marginTop: '0.75rem' }}
                    >
                      {isSignupSubmitting ? (
                        <span className="submit-loading-state">Creating Client Account...</span>
                      ) : (
                        <>
                          <span>Create Account & Enter Portal</span>
                          <ChevronRight size={17} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => { setViewMode('signin'); setSignupError(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1D4ED8',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= VIEW: FORGOT PASSWORD ================= */}
              {viewMode === 'forgot' && (
                <>
                  {isForgotSuccess ? (
                    <div className="forgot-success-box" style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', marginBottom: '1rem', border: '1px solid #A7F3D0' }}>
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1040', marginBottom: '0.6rem' }}>
                        Check Your Inbox
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#5B527E', lineHeight: '1.6', marginBottom: '1rem' }}>
                        If an account exists for <strong style={{ color: '#1A1040' }}>{forgotEmail}</strong>, a password reset link has been sent.
                      </p>
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
                              placeholder="testclient@datai2i.com"
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

                        <button
                          type="submit"
                          className="auth-primary-submit-btn"
                          disabled={isForgotSubmitting}
                          style={{ marginTop: '1rem' }}
                        >
                          {isForgotSubmitting ? (
                            <span className="submit-loading-state">Sending Reset Link...</span>
                          ) : (
                            <>
                              <span>Send Reset Link</span>
                              <ChevronRight size={17} />
                            </>
                          )}
                        </button>

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
              <div className="signin-card-footer" style={{ marginTop: '1.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
                <div className="trust-badge-row" style={{ justifyContent: 'center' }}>
                  <ShieldCheck size={14} className="shield-icon" />
                  <span>256-bit SSL · Passwordless Magic Access · Enterprise Privacy</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
