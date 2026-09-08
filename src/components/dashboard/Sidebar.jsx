import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Compass,
  Palette,
  Terminal,
  Settings,
  UserPlus,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Sidebar({
  activeNav,
  setActiveNav,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  credits,
  onOpenTopUp,
  onLogout
}) {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  return (
    <aside className={`dash-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>

      <button
        type="button"
        className="sidebar-edge-toggle-btn"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label="Toggle sidebar"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      <div className="sidebar-brand-box">
        <div className="sidebar-brand-logo-wrap" title="CreativeGini AI POD">
          {isSidebarCollapsed ? (
            <img src="/logo-icon.png" alt="CreativeGini Icon" className="sidebar-logo-icon-img" />
          ) : (
            <img src="/logo.png" alt="CreativeGini Logo" className="sidebar-logo-img" />
          )}
        </div>
      </div>

      <div className="sidebar-scroll-area">

        <div className="sidebar-nav-section">
          {!isSidebarCollapsed ? (
            <div className="menu-group-label">MAIN MENU</div>
          ) : (
            <div className="sidebar-menu-divider" />
          )}
          <button
            className={`sidebar-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={19} className="sidebar-item-icon" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
        </div>

        <div className="sidebar-nav-section">
          {!isSidebarCollapsed ? (
            <div className="menu-group-label">AI AGENTS</div>
          ) : (
            <div className="sidebar-menu-divider" />
          )}
          <button
            className={`sidebar-item ${activeNav === 'squad' ? 'active' : ''}`}
            onClick={() => setActiveNav('squad')}
            title="Pod squad"
          >
            <Users size={19} className="sidebar-item-icon" />
            {!isSidebarCollapsed && <span>Pod squad</span>}
          </button>
        </div>

        <div className="sidebar-nav-section">
          {!isSidebarCollapsed ? (
            <div className="menu-group-label">ADD ONS</div>
          ) : (
            <div className="sidebar-menu-divider" />
          )}
          <button
            className={`sidebar-item ${activeNav === 'strategic-planner' ? 'active' : ''}`}
            onClick={() => setActiveNav('strategic-planner')}
            title="Strategic Planner"
          >
            <Compass size={19} className="sidebar-item-icon" />
            {!isSidebarCollapsed && <span>Strategic Planner</span>}
          </button>

          <button
            className={`sidebar-item ${activeNav === 'creative-planner' ? 'active' : ''}`}
            onClick={() => setActiveNav('creative-planner')}
            title="Creative Content Planner"
          >
            <Palette size={19} className="sidebar-item-icon" />
            {!isSidebarCollapsed && <span>Creative Content Planner</span>}
          </button>

          <button
            className={`sidebar-item ${activeNav === 'devrel-planner' ? 'active' : ''}`}
            onClick={() => setActiveNav('devrel-planner')}
            title="DevRel Planner"
          >
            <Terminal size={19} className="sidebar-item-icon" />
            {!isSidebarCollapsed && <span>DevRel Planner</span>}
          </button>
        </div>
      </div>

      <div className="sidebar-bottom-area">

        {!isSidebarCollapsed ? (
          <div className="sidebar-credits-card">
            <div className="credits-header-row">
              <span className="credits-label">CREDITS</span>
              <span className="credits-count">{credits.toLocaleString()}</span>
            </div>
            <div className="credits-progress-bar">
              <div
                className="credits-progress-fill"
                style={{ width: `${Math.min(100, (credits / 5000) * 100)}%` }}
              ></div>
            </div>
            <button
              type="button"
              className="credits-topup-btn"
              onClick={onOpenTopUp}
            >
              + Top Up Credits
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="sidebar-credits-mini"
            onClick={onOpenTopUp}
            title={`Credits: ${credits.toLocaleString()} (Click to Top Up)`}
          >
            <Zap size={15} className="credits-mini-icon" />
            <span className="credits-mini-val">{(credits / 1000).toFixed(1)}k</span>
          </button>
        )}

        <div className="sidebar-account-group">
          {!isSidebarCollapsed ? (
            <button
              type="button"
              className="account-settings-header-btn"
              onClick={() => setIsAccountSettingsOpen(!isAccountSettingsOpen)}
            >
              <div className="account-header-left">
                <Settings size={15} className="account-header-icon" />
                <span>ACCOUNT & SETTINGS</span>
              </div>
              {isAccountSettingsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          ) : (
            <div className="sidebar-menu-divider" />
          )}

          {(isAccountSettingsOpen || ['settings', 'team', 'billing'].includes(activeNav) || isSidebarCollapsed) && (
            <div className="account-sub-items">
              <button
                className={`sidebar-item sub-item ${activeNav === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveNav('settings')}
                title="Settings"
              >
                <Settings size={18} className="sidebar-item-icon" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>

              <button
                className={`sidebar-item sub-item ${activeNav === 'team' ? 'active' : ''}`}
                onClick={() => setActiveNav('team')}
                title="Team"
              >
                <UserPlus size={18} className="sidebar-item-icon" />
                {!isSidebarCollapsed && <span>Team</span>}
              </button>

              <button
                className={`sidebar-item sub-item ${activeNav === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveNav('billing')}
                title="Billing"
              >
                <CreditCard size={18} className="sidebar-item-icon" />
                {!isSidebarCollapsed && <span>Billing</span>}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-signout-btn"
          onClick={onLogout}
          title="Sign Out"
        >
          <LogOut size={16} className="signout-icon" />
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
