import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';

export const getRoleHome = (userOrRole) => {
  if (!userOrRole) return '/dashboard';
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.role;
  const da = typeof userOrRole === 'object' ? userOrRole.dashboardAccess : null;

  if (role === 'ADMIN') {
    return '/admin';
  }
  if (role === 'USER') {
    return '/dashboard';
  }

  // Check granular dashboard permissions for team members
  if (da) {
    if (da.companyLead) return '/company-lead';
    if (da.companyBoost) return '/company-boost';
    if (da.companyUI) return '/landing-page-enhancement';
  }

  // Fallback by legacy role
  switch (role) {
    case 'COMPANY_LEAD':
      return '/company-lead';
    case 'COMPANY_BOOST':
      return '/company-boost';
    case 'LANDING_PAGE':
      return '/landing-page-enhancement';
    default:
      return '/access-denied';
  }
};

export const hasDashboardAccess = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'USER') return false;

  const da = user.dashboardAccess;
  if (da && typeof da[permissionKey] === 'boolean') {
    return da[permissionKey];
  }

  // Fallback for legacy role
  if (permissionKey === 'companyLead' && user.role === 'COMPANY_LEAD') return true;
  if (permissionKey === 'companyBoost' && user.role === 'COMPANY_BOOST') return true;
  if (permissionKey === 'companyUI' && user.role === 'LANDING_PAGE') return true;

  return false;
};

export default function ProtectedRoute({
  user,
  allowedRoles,
  requiredPermission,
  children,
  isAuthChecking,
  onLogout
}) {
  const navigate = useNavigate();

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="CreativeGini" style={{ height: '36px' }} />
          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Verifying secure session...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Super Admin bypasses all internal dashboard permission restrictions
  if (user.role === 'ADMIN') {
    return children;
  }

  // Check role restrictions (e.g. USER-only or ADMIN-only)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user)} replace />;
  }

  // Check granular dashboard permission
  if (requiredPermission) {
    const isGranted = hasDashboardAccess(user, requiredPermission);
    if (!isGranted) {
      const home = getRoleHome(user);
      const readableName = requiredPermission === 'companyBoost'
        ? 'Company Boost Dashboard'
        : requiredPermission === 'companyLead'
        ? 'Company Lead Dashboard'
        : 'Landing Page Enhancement Dashboard';

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
          padding: '2rem',
          color: '#F5F5F5'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#06111A',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <ShieldAlert size={34} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              403 — Access Denied
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              You do not have permission to access the <span style={{ color: '#00D9FF', fontWeight: '600' }}>{readableName}</span>.
              <br />
              Dashboard permissions are strictly managed by your Super Administrator.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {home && home !== '/access-denied' && (
                <button
                  onClick={() => navigate(home)}
                  className="portal-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LayoutDashboard size={16} />
                  <span>Go to My Available Dashboard</span>
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="portal-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ArrowLeft size={16} />
                <span>Return to Home</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign out of this account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
