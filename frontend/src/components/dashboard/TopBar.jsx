import React, { useState } from 'react';
import { HelpCircle, Bell } from 'lucide-react';

export default function TopBar({
  activeNav,
  user,
  onOpenHelp,
  onOpenSettings
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return 'Command Center Overview';
      case 'squad':
        return 'Dedicated 3-Member POD Squad';
      case 'strategic-planner':
        return 'Strategic Planner Add-On Model';
      case 'creative-planner':
        return 'Creative Content Planner Add-On Model';
      case 'devrel-planner':
        return 'DevRel Technical Content Planner Add-On Model';
      case 'settings':
        return 'Account & Sovereign System Settings';
      case 'team':
        return 'Team Members & Role Access Control';
      case 'billing':
        return 'Credits Balance & Enterprise Subscription';
      default:
        return 'Command Center';
    }
  };

  return (
    <header className="dash-top-bar">
      <div className="top-bar-left">
        <span className="current-view-title">{getTitle()}</span>
      </div>

      <div className="top-bar-right">

        <button
          type="button"
          className="dash-help-btn"
          onClick={onOpenHelp}
          title="Get Help & Documentation"
        >
          <HelpCircle size={16} className="help-icon" />
          <span>Get Help</span>
        </button>

        <div className="dash-notifications-wrapper">
          <button
            type="button"
            className="dash-bell-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications & Alerts"
          >
            <Bell size={18} className="bell-icon" />
            <span className="bell-badge-dot"></span>
          </button>

          {isNotificationsOpen && (
            <div className="notifications-dropdown glass-card">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <span className="notifications-count">2 New</span>
              </div>
              <div className="notifications-list">
                <div className="notification-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-content">
                    <p className="notif-title">4K Carousel Generation Complete</p>
                    <span className="notif-time">2 mins ago</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-content">
                    <p className="notif-title">Sovereign Enclave Audit: 0% Egress Verified</p>
                    <span className="notif-time">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dash-user-avatar-wrapper">
          <button
            type="button"
            className="dash-user-avatar-btn"
            onClick={onOpenSettings}
            title={`${user?.name || 'Enterprise Admin'} (Account & Settings)`}
          >
            <span className="avatar-initial">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
