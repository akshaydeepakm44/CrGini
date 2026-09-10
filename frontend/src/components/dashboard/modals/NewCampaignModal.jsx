import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function NewCampaignModal({ isOpen, onClose, onLaunch }) {
  const [campaignTopic, setCampaignTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!campaignTopic.trim()) return;
    onLaunch(campaignTopic);
    setCampaignTopic('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card campaign-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Sparkles size={22} className="icon-purple" />
            <h3>Launch New Autonomous AI Campaign</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '8px', marginBottom: '20px' }}>
          Dispatch your 3-member autonomous POD squad (Strategist, Creative Designer, DevRel Lead) to analyze market whitespace, synthesize 4K assets, and schedule distribution.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
              Campaign Target & Value Proposition
            </label>
            <input
              type="text"
              placeholder="e.g. Enterprise Multi-Agent Sovereign Cloud Migration..."
              value={campaignTopic}
              onChange={(e) => setCampaignTopic(e.target.value)}
              className="dash-input"
              style={{ width: '100%' }}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-glass" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Launch Campaign</button>
          </div>
        </form>
      </div>
    </div>
  );
}
