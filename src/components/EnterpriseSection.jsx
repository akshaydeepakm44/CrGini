import React from 'react';
import { Lock, Sparkles, BarChart3 } from 'lucide-react';

export default function EnterpriseSection() {
  const pillars = [
    {
      icon: Lock,
      title: 'Zero-Data Egress Privacy',
      desc: 'All prompt intelligence, brand lore, proprietary product documentation, and campaign assets are processed on private, sovereign GPUs with strict enterprise NDA boundaries.',
      badge: 'Sovereign GPU Infrastructure',
    },
    {
      icon: Sparkles,
      title: 'Multimodal Generative Pipeline',
      desc: 'Seamlessly leverages top-tier open and frontier weights (DeepSeek, Flux.1, Kling, Luma) fine-tuned on your exact brand guidelines and high-converting creative patterns.',
      badge: 'Frontier AI Weights',
    },
    {
      icon: BarChart3,
      title: 'Closed-Loop ROI Telemetry',
      desc: 'Automated OpenTelemetry tracing maps impression velocity, community growth, and inbound pipeline conversions directly back to specific AI POD creative outputs.',
      badge: 'Real-time ROI Tracing',
    },
  ];

  return (
    <section className="glass-section" id="enterprise">
      <div className="section-container">
        <div className="section-tag">Enterprise Security & Architecture</div>
        <h2 className="section-title">Built For Scale, Privacy & Precision</h2>
        <p className="section-desc">
          Uncompromised data privacy, air-gapped models, and continuous ROI Telemetry.
        </p>

        <div className="cards-grid enterprise-grid">
          {pillars.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div className="glass-card enterprise-card" key={idx}>
                <div className="ent-badge">{p.badge}</div>
                <div className="ent-icon-wrapper">
                  <IconComp size={24} className="ent-icon" />
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
