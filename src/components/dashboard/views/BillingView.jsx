import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function BillingView({ credits, onOpenTopUp, onTopUpCredits }) {
  return (
    <div className="dash-tab-container">
      <div className="dash-panel glass-card">
        <div className="panel-header">
          <h3><CreditCard size={18} className="icon-purple" /> Subscription Tier & Credits Balance</h3>
          <button className="btn-primary btn-sm" onClick={onOpenTopUp}>
            + Top Up Credits
          </button>
        </div>

        <div className="dash-metrics-grid" style={{ marginTop: '20px' }}>
          <div className="dash-metric-card">
            <span className="metric-title">Available Credits</span>
            <div className="metric-big-val" style={{ color: '#38bdf8' }}>{credits.toLocaleString()}</div>
            <span className="metric-sub-text text-muted">Refreshes every billing cycle</span>
          </div>

          <div className="dash-metric-card">
            <span className="metric-title">Current Plan</span>
            <div className="metric-big-val">Enterprise Sovereign POD</div>
            <span className="metric-sub-text green"><CheckCircle2 size={13} /> Active & Renews Oct 01</span>
          </div>
        </div>

        <div className="topup-packs-grid" style={{ marginTop: '24px' }}>
          <div className="pack-card">
            <h4>Starter Top-Up</h4>
            <div className="pack-credits">+1,000 Credits</div>
            <div className="pack-price">$49</div>
            <button className="btn-glass" onClick={() => onTopUpCredits(1000)}>Purchase Pack</button>
          </div>
          <div className="pack-card featured">
            <div className="featured-badge">MOST POPULAR</div>
            <h4>Growth Top-Up</h4>
            <div className="pack-credits">+5,000 Credits</div>
            <div className="pack-price">$199</div>
            <button className="btn-primary" onClick={() => onTopUpCredits(5000)}>Purchase Pack</button>
          </div>
          <div className="pack-card">
            <h4>Scale Top-Up</h4>
            <div className="pack-credits">+20,000 Credits</div>
            <div className="pack-price">$699</div>
            <button className="btn-glass" onClick={() => onTopUpCredits(20000)}>Purchase Pack</button>
          </div>
        </div>
      </div>
    </div>
  );
}
