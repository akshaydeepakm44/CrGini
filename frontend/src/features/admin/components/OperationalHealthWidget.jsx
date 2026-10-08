import React from 'react';
import { Activity, Clock, CheckCircle2, AlertTriangle, Users, ShieldAlert } from 'lucide-react';

export default function OperationalHealthWidget({ health = {} }) {
  const {
    systemStatus = 'HEALTHY',
    unassignedCount = 0,
    reviewCount = 0,
    changesCount = 0,
    pendingPaymentsCount = 0,
    activeSpecialistsCount = 0,
    workloadRatio = '0.0'
  } = health;

  return (
    <div className="cg-health-widget">
      <div className="cg-health-header">
        <div className="cg-health-title-group">
          <Activity size={18} className="cg-health-icon" />
          <h3 className="cg-section-title">Operational Health</h3>
        </div>
        <div className={`cg-status-badge ${systemStatus.toLowerCase()}`}>
          {systemStatus === 'HEALTHY' ? (
            <>
              <CheckCircle2 size={13} />
              <span>STABLE</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} />
              <span>ATTENTION NEEDED</span>
            </>
          )}
        </div>
      </div>

      <div className="cg-health-metrics-grid">
        <div className="cg-health-metric-box">
          <div className="cg-metric-label">Unassigned Work</div>
          <div className={`cg-metric-value ${unassignedCount > 0 ? 'text-warning' : 'text-neutral'}`}>
            {unassignedCount}
          </div>
          <div className="cg-metric-subtext">Tickets awaiting lead allocation</div>
        </div>

        <div className="cg-health-metric-box">
          <div className="cg-metric-label">Deliverables in Review</div>
          <div className="cg-metric-value text-info">{reviewCount}</div>
          <div className="cg-metric-subtext">Waiting on client approval</div>
        </div>

        <div className="cg-health-metric-box">
          <div className="cg-metric-label">Revisions Requested</div>
          <div className={`cg-metric-value ${changesCount > 0 ? 'text-alert' : 'text-neutral'}`}>
            {changesCount}
          </div>
          <div className="cg-metric-subtext">Active revision loops</div>
        </div>

        <div className="cg-health-metric-box">
          <div className="cg-metric-label">Team Capacity Ratio</div>
          <div className="cg-metric-value text-neutral">{workloadRatio}</div>
          <div className="cg-metric-subtext">{activeSpecialistsCount} active specialists available</div>
        </div>
      </div>
    </div>
  );
}
