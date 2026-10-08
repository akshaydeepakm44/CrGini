import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FolderCheck,
  Building2,
  Users,
  ShieldCheck,
  Sparkles,
  Receipt,
  MessageSquare,
  BarChart3,
  ScrollText,
  Settings,
  AlertCircle,
  Compass
} from 'lucide-react';

export default function AdminSidebar({
  unassignedCount = 0,
  reviewCount = 0,
  changesCount = 0,
  pendingPaymentsCount = 0
}) {
  return (
    <aside className="cg-admin-sidebar">
      <div className="cg-sidebar-inner">

        {/* SECTION: COMMAND */}
        <div className="cg-nav-group">
          <div className="cg-nav-group-title">COMMAND</div>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
            end
          >
            <LayoutDashboard size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Overview</span>
          </NavLink>
        </div>

        {/* SECTION: OPERATIONS */}
        <div className="cg-nav-group">
          <div className="cg-nav-group-title">OPERATIONS</div>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Operations Queue</span>
            {unassignedCount > 0 && (
              <span className="cg-nav-badge warning" title={`${unassignedCount} unassigned`}>
                {unassignedCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/deliverables"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <FolderCheck size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Deliverables</span>
            {reviewCount > 0 && (
              <span className="cg-nav-badge info" title={`${reviewCount} in review`}>
                {reviewCount}
              </span>
            )}
            {changesCount > 0 && (
              <span className="cg-nav-badge alert" title={`${changesCount} revisions requested`}>
                {changesCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/services"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <Sparkles size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Services</span>
          </NavLink>
        </div>

        {/* SECTION: RELATIONSHIPS */}
        <div className="cg-nav-group">
          <div className="cg-nav-group-title">RELATIONSHIPS</div>
          <NavLink
            to="/admin/clients"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <Building2 size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Clients & Companies</span>
          </NavLink>

          <NavLink
            to="/admin/samples"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <Compass size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Sample Showcases</span>
          </NavLink>

          <NavLink
            to="/admin/team"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
            end
          >
            <Users size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Team & Specialists</span>
          </NavLink>

          <NavLink
            to="/admin/team/permissions"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Portal Access & Roles</span>
          </NavLink>
        </div>

        {/* SECTION: FINANCE & COMMS */}
        <div className="cg-nav-group">
          <div className="cg-nav-group-title">FINANCE & COMMS</div>
          <NavLink
            to="/admin/billing"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <Receipt size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Billing & Revenue</span>
            {pendingPaymentsCount > 0 && (
              <span className="cg-nav-badge warning" title={`${pendingPaymentsCount} pending`}>
                {pendingPaymentsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/messages"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <MessageSquare size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Communications</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Reports</span>
          </NavLink>
        </div>

        {/* SECTION: GOVERNANCE */}
        <div className="cg-nav-group">
          <div className="cg-nav-group-title">GOVERNANCE</div>
          <NavLink
            to="/admin/audit"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <ScrollText size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Audit & Security</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={17} className="cg-nav-icon" />
            <span className="cg-nav-label">Settings</span>
          </NavLink>
        </div>

      </div>
    </aside>
  );
}
