import React, { useState } from 'react';
import { Settings, Server, Key, ShieldCheck, Check, Copy } from 'lucide-react';

export default function SettingsView() {
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText('cg_live_pod_8839201948571029485');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="dash-tab-container">
      <div className="dash-panel glass-card">
        <div className="panel-header">
          <h3><Settings size={18} className="icon-purple" /> System & Security Settings</h3>
        </div>

        <div className="profile-settings-grid" style={{ marginTop: '20px' }}>
          <div className="setting-box">
            <label><Server size={14} /> Sovereign Compute Cluster Region</label>
            <select className="dash-select">
              <option>US-East (AWS Sovereign Enclave #01)</option>
              <option>EU-Central (Sovereign GPU Cluster #02)</option>
              <option>On-Premises Dedicated Rack Enclave</option>
            </select>
          </div>

          <div className="setting-box">
            <label><Key size={14} /> Enterprise API Key</label>
            <div className="api-key-input-group">
              <input
                type="password"
                value="cg_live_pod_8839201948571029485"
                readOnly
                className="dash-input"
              />
              <button className="btn-glass btn-sm" onClick={handleCopyKey}>
                {copiedKey ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="setting-box">
            <label><ShieldCheck size={14} /> Zero Data Egress Verification</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span className="badge-active">Enabled • 100% On-Premise GPU Execution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
