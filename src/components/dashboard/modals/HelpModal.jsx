import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card topup-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <HelpCircle size={22} className="icon-purple" />
            <h3>CreativeGini Help & Documentation</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '8px', marginBottom: '20px' }}>
          Access enterprise documentation, API tutorials, and 24/7 sovereign deployment engineering support.
        </p>

        <div className="modal-packs-list">
          <a
            href="https://www.datai2i.com"
            target="_blank"
            rel="noopener noreferrer"
            className="modal-pack-item"
            style={{ textDecoration: 'none' }}
          >
            <div className="pack-info">
              <span className="pack-title">📖 Developer Docs & API Specs</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Multi-agent SDK, Python & Node.js guides</span>
            </div>
          </a>

          <a
            href="mailto:support@creativegini.ai"
            className="modal-pack-item popular"
            style={{ textDecoration: 'none' }}
          >
            <div className="pack-info">
              <span className="pack-title">💬 Priority POD Support (24/7)</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct channel to AI POD infrastructure engineers</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
