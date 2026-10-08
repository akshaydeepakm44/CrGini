import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Bell,
  Sliders,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [savedNotice, setSavedNotice] = useState(false);

  // Workflow settings state
  const [requireClientSignoff, setRequireClientSignoff] = useState(true);
  const [notifyOnRevision, setNotifyOnRevision] = useState(true);
  const [allowDirectOverriding, setAllowDirectOverriding] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="cg-admin-page">
      <div className="cg-page-header">
        <div className="cg-page-header-left">
          <h1 className="cg-page-title">Platform & Workflow Settings</h1>
          <p className="cg-page-subtitle">
            Configure delivery governance rules, operational thresholds, and system notifications
          </p>
        </div>

        <div className="cg-page-header-actions">
          <button className="cg-btn-primary" onClick={handleSave}>
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="cg-notice-box success mb-4">
          <CheckCircle2 size={16} />
          <span>Workflow configurations updated and applied to active queues.</span>
        </div>
      )}

      <div className="cg-settings-grid">
        {/* SECTION 1: WORKFLOW GOVERNANCE */}
        <div className="cg-card">
          <div className="cg-card-header-flex">
            <div className="cg-card-title-group">
              <Sliders size={18} className="text-primary" />
              <h3 className="cg-card-title">Delivery Workflow Governance</h3>
            </div>
          </div>
          <p className="cg-card-description">
            Enforce quality gates and specialist hand-off rules across service tickets.
          </p>

          <div className="cg-setting-toggle-list mt-3">
            <label className="cg-setting-toggle-item">
              <div className="cg-sti-text">
                <span className="cg-sti-title">Mandatory Client Review Sign-Off</span>
                <span className="cg-sti-desc">
                  Tickets cannot be marked COMPLETED until the client approves the final submission blueprint or an administrator performs an override.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireClientSignoff}
                onChange={(e) => setRequireClientSignoff(e.target.checked)}
              />
            </label>

            <label className="cg-setting-toggle-item">
              <div className="cg-sti-text">
                <span className="cg-sti-title">Administrative Completion Override</span>
                <span className="cg-sti-desc">
                  Permit Super Admins to mark work complete with recorded operational justification in case of offline sign-offs.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowDirectOverriding}
                onChange={(e) => setAllowDirectOverriding(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="cg-card">
          <div className="cg-card-header-flex">
            <div className="cg-card-title-group">
              <Bell size={18} className="text-info" />
              <h3 className="cg-card-title">Notification Channels & Alerts</h3>
            </div>
          </div>
          <p className="cg-card-description">
            Control automated email dispatches and in-app attention center alerts.
          </p>

          <div className="cg-setting-toggle-list mt-3">
            <label className="cg-setting-toggle-item">
              <div className="cg-sti-text">
                <span className="cg-sti-title">Client Revision Escalations</span>
                <span className="cg-sti-desc">
                  Highlight immediately in the Super Admin Attention Required center when a client requests revisions on a deliverable.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnRevision}
                onChange={(e) => setNotifyOnRevision(e.target.checked)}
              />
            </label>

            <label className="cg-setting-toggle-item">
              <div className="cg-sti-text">
                <span className="cg-sti-title">Automated Email Notifications</span>
                <span className="cg-sti-desc">
                  Dispatch email notifications on ticket assignment, progress updates, and deliverable submissions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: SYSTEM SECURITY POLICY */}
        <div className="cg-card">
          <div className="cg-card-header-flex">
            <div className="cg-card-title-group">
              <ShieldCheck size={18} className="text-success" />
              <h3 className="cg-card-title">Security & Tenant Isolation Policy</h3>
            </div>
          </div>
          <p className="cg-card-description">
            Global tenant boundaries and administrative secrets safety.
          </p>

          <div className="cg-security-policy-box mt-3">
            <div className="cg-policy-item">
              <Lock size={15} className="text-neutral" />
              <span>
                <strong>Tenant Boundary Enforced:</strong> Client users can only access tickets, companies, and deliverables belonging to their authorized tenant workspace.
              </span>
            </div>
            <div className="cg-policy-item">
              <Lock size={15} className="text-neutral" />
              <span>
                <strong>Zero Secret Exposure:</strong> Database connection strings, encryption secrets, and API master keys are not exposed via any admin user interface.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
