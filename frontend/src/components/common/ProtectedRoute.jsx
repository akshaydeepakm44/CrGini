import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';

export const getRoleHome = (userOrRole) => {
  if (!userOrRole) return '/portal';
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.role;
  const da = typeof userOrRole === 'object' ? userOrRole.dashboardAccess : null;

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return '/admin';
  }
  if (role === 'USER') {
    return '/portal';
  }

  // Check granular dashboard permissions for team members
  if (da) {
    if (da.companyLead) return '/lead';
    if (da.companyBoost) return '/boost';
    if (da.companyUI) return '/design';
  }

  // Fallback by legacy role
  switch (role) {
    case 'COMPANY_LEAD':
      return '/lead';
    case 'COMPANY_BOOST':
      return '/boost';
    case 'LANDING_PAGE':
      return '/design';
    default:
      return '/access-denied';
  }
};

export const hasDashboardAccess = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
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
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return children;
  }

  // Check role restrictions (e.g. USER-only or ADMIN-only)
  if (allowedRoles) {
    const isRoleAllowed = allowedRoles.includes(user.role) || (allowedRoles.includes('ADMIN') && user.role === 'SUPER_ADMIN');
    const isPermAllowed = requiredPermission ? hasDashboardAccess(user, requiredPermission) : false;
    if (!isRoleAllowed && !isPermAllowed) {
      return <Navigate to={getRoleHome(user)} replace />;
    }
  }

  // Check granular dashboard permission
  if (requiredPermission) {
    const isGranted = hasDashboardAccess(user, requiredPermission);
    if (!isGranted) {
      return <Navigate to={getRoleHome(user)} replace />;
    }
  }

  return children;
}
