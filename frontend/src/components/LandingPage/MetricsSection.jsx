import React from 'react';

const DEFAULT_METRICS = [
  {
    id: 'companies',
    value: '50+',
    label: 'Companies Supported',
    subtext: 'B2B & SaaS Growth Partners'
  },
  {
    id: 'research',
    value: '100+',
    label: 'Research Projects',
    subtext: 'Deep ICP & Account Dossiers'
  },
  {
    id: 'deliverables',
    value: '250+',
    label: 'Deliverables Completed',
    subtext: 'Verified Sprints & Playbooks'
  },
  {
    id: 'services',
    value: '10+',
    label: 'Growth Services',
    subtext: 'Boosting & Digitalising Channels'
  }
];

export default function MetricsSection({ metrics = DEFAULT_METRICS }) {
  return (
    <section className="cg-metrics-section" aria-label="Platform Trust & Impact Metrics">
      <div className="cg-container">
        <div className="cg-metrics-grid">
          {metrics.map((item) => (
            <div key={item.id} className="cg-metric-card">
              <div className="cg-metric-value">{item.value}</div>
              <div className="cg-metric-label">{item.label}</div>
              <div className="cg-metric-subtext">{item.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
