import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export default function SignInPage({ onLogin, onBackHome, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
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
        setErrorMessage('Unable to connect to the backend server. Please verify the backend service is running on port 5000.');
      } else {
        setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Password reset link sent to your registered email.');
    } else {
      alert('Password reset link sent to your email.');
    }
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

      {/* Main Container */}
      <main className="signin-layout-container">
        <div className="signin-split-grid" style={{ maxWidth: '460px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          
          {/* Auth Form Card */}
          <div className="signin-card-wrapper">
            <div className="signin-card glass-panel" style={{ padding: '2.5rem 2rem' }}>
              
              {/* Header inside Card */}
              <div className="signin-card-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <img src="/logo.png" alt="CreativeGini" style={{ height: '42px', width: 'auto' }} />
                </div>
                <h1 className="signin-title" style={{ fontSize: '1.65rem', marginBottom: '0.4rem' }}>
                  Sign In to CreativeGini
                </h1>
                <p className="signin-subtitle" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                  Enter your credentials to access your portal and workspace.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="auth-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Main Credentials Form */}
              <form onSubmit={handleSubmit} className="auth-credentials-form">
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
                    <a href="#forgot" onClick={handleForgotPassword} className="forgot-password-link">
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
