import React from 'react';
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CreativeGini Dashboard ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030303',
          color: '#F5F5F5',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 17, 26, 0.98) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#EF4444'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              margin: '0 0 10px 0',
              color: '#F8FAFC'
            }}>
              Dashboard Interface Notice
            </h2>

            <p style={{
              fontSize: '0.9rem',
              color: '#94A3B8',
              lineHeight: '1.6',
              margin: '0 0 20px 0'
            }}>
              An unexpected render issue occurred while loading this view. Your session and data are secure.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                color: '#CBD5E1',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: '24px',
                overflowX: 'auto',
                maxHeight: '100px'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)',
                  color: '#030303',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshCw size={16} />
                Reload View
              </button>

              <button
                onClick={() => { window.location.href = '/signin'; }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#E2E8F0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={16} />
                Sign In
              </button>

              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: '#94A3B8',
                  border: 'none',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Home size={16} />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
