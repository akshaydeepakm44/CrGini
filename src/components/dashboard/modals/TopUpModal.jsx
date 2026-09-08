import React from 'react';
import { Zap } from 'lucide-react';

export default function TopUpModal({ isOpen, onClose, onTopUp }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card topup-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Zap size={22} className="icon-gold" />
            <h3>Top Up CreativeGini Credits</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '8px', marginBottom: '20px' }}>
          Credits power 4K visual synthesis via Flux.1 Pro, deep market intelligence queries, and omnichannel autonomous distributions.
        </p>

        <div className="modal-packs-list">
          <div className="modal-pack-item" onClick={() => onTopUp(1000)}>
            <div className="pack-info">
              <span className="pack-title">Starter Pack</span>
              <span className="pack-amount">+1,000 Credits</span>
            </div>
            <button className="btn-glass btn-sm">$49</button>
          </div>

          <div className="modal-pack-item popular" onClick={() => onTopUp(5000)}>
            <div className="pack-info">
              <span className="pack-title">Growth Pack (Popular)</span>
              <span className="pack-amount">+5,000 Credits</span>
            </div>
            <button className="btn-primary btn-sm">$199</button>
          </div>

          <div className="modal-pack-item" onClick={() => onTopUp(20000)}>
            <div className="pack-info">
              <span className="pack-title">Scale Enterprise Pack</span>
              <span className="pack-amount">+20,000 Credits</span>
            </div>
            <button className="btn-glass btn-sm">$699</button>
          </div>
        </div>
      </div>
    </div>
  );
}
