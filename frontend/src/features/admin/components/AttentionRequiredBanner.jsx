import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AttentionRequiredBanner({ observations = [] }) {
  const navigate = useNavigate();

  if (!observations || observations.length === 0) {
    return (
      <div className="cg-attention-box healthy">
        <div className="cg-attention-icon healthy">
          <CheckCircle2 size={18} />
        </div>
        <div className="cg-attention-content">
          <h4 className="cg-attention-title">All Operational Queues Healthy</h4>
          <p className="cg-attention-desc">
            No unassigned tickets, overdue client reviews, or revision bottlenecks detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-attention-container" id="attention">
      <div className="cg-attention-header">
        <div className="cg-attention-header-left">
          <AlertTriangle size={18} className="cg-attention-main-icon" />
          <h3 className="cg-section-title">Attention Required</h3>
          <span className="cg-badge-counter">{observations.length}</span>
        </div>
        <span className="cg-attention-note">Rule-based operational alerts derived from PostgreSQL state</span>
      </div>

      <div className="cg-attention-grid">
        {observations.map((item) => (
          <div
            key={item.id}
            className={`cg-attention-card severity-${item.severity?.toLowerCase() || 'medium'}`}
            onClick={() => item.link && navigate(item.link)}
          >
            <div className="cg-attention-card-top">
              <span className={`cg-severity-tag severity-${item.severity?.toLowerCase() || 'medium'}`}>
                {item.severity}
              </span>
              <span className="cg-category-tag">{item.category}</span>
            </div>

            <h4 className="cg-attention-card-title">{item.title}</h4>
            <p className="cg-attention-card-message">{item.message}</p>

            <div className="cg-attention-card-footer">
              <span className="cg-action-text">{item.actionLabel || 'Inspect Records'}</span>
              <ArrowRight size={14} className="cg-action-arrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
