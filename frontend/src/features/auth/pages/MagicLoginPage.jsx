import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { api } from '../../../services/api';

export default function MagicLoginPage({ onLogin, showToast }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No magic access token provided in the URL.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        setStatus('verifying');
        const data = await api.verifyMagicLink(token);

        if (!isMounted) return;

        setStatus('success');
        setUserData(data.user);

        // Notify parent App component to update auth state
        if (onLogin) {
          onLogin(data.user, data.token);
        }

        if (showToast) {
          showToast(`Welcome back, ${data.user?.name || 'Client'}!`);
        }

        // Brief delay for visual confirmation, then navigate
        setTimeout(() => {
          navigate(data.redirectUrl || '/portal', { replace: true });
        }, 1200);
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(err.message || 'This magic link is invalid or has expired.');
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px 36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* LOGO */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: '#0F172A',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
            }}
          >
            <Sparkles size={22} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            CreativeGini
          </span>
        </div>

        {/* 1. VERIFYING STATE */}
        {status === 'verifying' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={28} className="cg-spin" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
              Verifying Magic Access Link...
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Securing passwordless session and preparing your client dashboard.
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === 'success' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
              Access Granted!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
              Authenticated as <strong>{userData?.name || userData?.email}</strong>.<br />
              Redirecting to your dashboard right now...
            </p>
            <button
              onClick={() => navigate('/portal')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <span>Continue to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* 3. ERROR STATE */}
        {status === 'error' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
              Invalid or Expired Link
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/signin?tab=magic')}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Request a New Magic Link
              </button>
              <button
                onClick={() => navigate('/signin')}
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Back to Password Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
