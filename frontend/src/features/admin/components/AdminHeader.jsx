import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Bell,
  AlertTriangle,
  LogOut,
  ChevronDown,
  Layers,
  ArrowRight,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export default function AdminHeader({
  user,
  onLogout,
  onOpenSearch,
  attentionCount = 0,
  unreadNotifs = 0
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleLabel = user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMINISTRATOR';

  return (
    <header className="cg-admin-header">
      <div className="cg-admin-header-left">
        <div className="cg-admin-brand" onClick={() => navigate('/admin')}>
          <div className="cg-admin-brand-icon">
            <ShieldAlert size={20} />
          </div>
          <div className="cg-admin-brand-text">
            <span className="cg-admin-brand-title">CREATIVEGINI</span>
            <span className="cg-admin-brand-subtitle">CONTROL CENTER</span>
          </div>
        </div>

        <div className="cg-admin-status-pill">
          <span className="cg-admin-status-dot" />
          <span className="cg-admin-status-label">POSTGRESQL LIVE</span>
        </div>
      </div>

      <div className="cg-admin-header-center">
        <button
          className="cg-admin-search-bar"
          onClick={onOpenSearch}
          title="Search tickets, clients, specialists (Ctrl + K)"
        >
          <Search size={15} className="cg-search-icon" />
          <span className="cg-search-placeholder">Quick search tickets, clients, specialists...</span>
          <kbd className="cg-search-kbd">Ctrl K</kbd>
        </button>
      </div>

      <div className="cg-admin-header-right">
        {attentionCount > 0 && (
          <button
            className="cg-admin-attention-trigger"
            onClick={() => navigate('/admin/dashboard#attention')}
            title={`${attentionCount} action items require attention`}
          >
            <AlertTriangle size={15} />
            <span>{attentionCount} Action{attentionCount === 1 ? '' : 's'} Required</span>
          </button>
        )}

        {/* User Profile dropdown */}
        <div className="cg-admin-user-menu-wrapper">
          <button
            className="cg-admin-user-btn"
            onClick={() => setShowProfileMenu(prev => !prev)}
            aria-expanded={showProfileMenu}
          >
            <div className="cg-admin-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="cg-admin-user-meta">
              <span className="cg-admin-user-name">{user?.name || 'Administrator'}</span>
              <span className="cg-admin-user-role">{roleLabel}</span>
            </div>
            <ChevronDown size={14} className="cg-admin-chevron" />
          </button>

          {showProfileMenu && (
            <div className="cg-admin-dropdown">
              <div className="cg-dropdown-header">
                <div className="cg-dropdown-email">{user?.email}</div>
                <div className="cg-dropdown-badge">{user?.role}</div>
              </div>
              <div className="cg-dropdown-divider" />
              <button
                className="cg-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/team/permissions');
                }}
              >
                <UserCheck size={14} />
                <span>Permissions & Governance</span>
              </button>
              <button
                className="cg-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/settings');
                }}
              >
                <Layers size={14} />
                <span>Platform Settings</span>
              </button>
              <div className="cg-dropdown-divider" />
              <button
                className="cg-dropdown-item cg-dropdown-danger"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
