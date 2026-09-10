import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';

export default function SignInPage({ onLogin, onBackHome, showToast }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please provide your full name to set up your profile.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const nameToUse = mode === 'signup' 
        ? fullName.trim() 
        : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      onLogin({
        name: nameToUse || 'Creative Founder',
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        plan: 'Enterprise Autonomous'
      });
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin({
        name: 'Alex Morgan',
        email: 'alex.morgan@growth.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        provider: 'google'
      });
    }, 500);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Password reset link sent! Check your inbox in a moment.');
    } else {
      alert('Password reset link sent to your email.');
    }
  };

  return (
    <div className="signin-page-root">
      {/* Background Ambience & Lighting */}
      <div className="signin-ambient-glow glow-cyan" />
      <div className="signin-ambient-glow glow-violet" />
      <div className="signin-grid-overlay" />

      {/* Top Header Navigation */}
      <header className="signin-nav-bar">
        <button 
          type="button" 
          className="signin-back-btn" 
          onClick={onBackHome}
          title="Return to CreativeGini Homepage"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="signin-nav-brand" onClick={onBackHome} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="CreativeGini" className="signin-nav-logo" />
        </div>
      </header>

      {/* Main Two-Column Auth Container */}
      <main className="signin-layout-container">
        <div className="signin-split-grid">
          
          {/* LEFT: Auth Form Card */}
          <div className="signin-card-wrapper">
            <div className="signin-card glass-panel">
              
              {/* Header inside Card */}
              <div className="signin-card-header">
                <div className="brand-badge-pill">
                  <span className="live-pulse-dot" />
                  <span>Secure AI Access Portal</span>
                </div>
                <h1 className="signin-title">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="signin-subtitle">
                  {mode === 'signin' 
                    ? 'Enter your credentials or use instant demo to access the platform' 
                    : 'Start scaling your autonomous growth engine with 12+ channels'}
                </p>
              </div>

              {/* Toggle Mode Switcher (Sign In / Create Account) */}
              <div className="signin-mode-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={`mode-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => { setMode('signin'); setErrorMessage(''); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={`mode-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setErrorMessage(''); }}
                >
                  Create Account
                </button>
              </div>

              {/* Social Login: Google Auth Button */}
              <button 
                type="button" 
                className="google-oauth-button" 
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <svg className="google-svg-icon" width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Or Divider */}
              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-label">or continue with email</span>
                <span className="divider-line" />
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="auth-error-banner" role="alert">
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Main Credentials Form */}
              <form onSubmit={handleSubmit} className="auth-credentials-form">
                {mode === 'signup' && (
                  <div className="form-field-group">
                    <label htmlFor="fullname-input" className="field-label">Full Name</label>
                    <div className="input-with-icon">
                      <User size={17} className="field-icon" />
                      <input
                        id="fullname-input"
                        type="text"
                        placeholder="Alex Morgan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="auth-text-input"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="form-field-group">
                  <label htmlFor="email-input" className="field-label">Work Email</label>
                  <div className="input-with-icon">
                    <Mail size={17} className="field-icon" />
                    <input
                      id="email-input"
                      type="email"
                      placeholder="founder@company.com"
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
                    {mode === 'signin' && (
                      <a href="#forgot" onClick={handleForgotPassword} className="forgot-password-link">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="input-with-icon">
                    <Lock size={17} className="field-icon" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signin' ? '••••••••' : 'At least 6 characters'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-text-input"
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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

                <div className="form-options-row">
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
                      <span className="spinner-dots" /> Connecting to Neural Engine...
                    </span>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Get Started Free'}</span>
                      <ChevronRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Footer inside card */}
              <div className="signin-card-footer">
                <div className="trust-badge-row">
                  <ShieldCheck size={14} className="shield-icon" />
                  <span>256-bit SSL · SOC-2 Type II Certified · Enterprise Privacy</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
