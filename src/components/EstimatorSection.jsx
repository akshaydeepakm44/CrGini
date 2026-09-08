import React, { useState } from 'react';
import { Rocket, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EstimatorSection() {
  const [profile, setProfile] = useState('B2B SaaS / DeepTech');
  const [selectedChannels, setSelectedChannels] = useState([
    'LinkedIn Authority',
    'X / Tech Twitter',
    'YouTube / Video Reels',
    'Developer & Discord Hubs',
  ]);

  const profiles = [
    'B2B SaaS / DeepTech',
    'Early-Stage AI Startup',
    'Global Enterprise Unit',
    'Founder / Executive Brand',
  ];

  const channels = [
    'LinkedIn Authority',
    'X / Tech Twitter',
    'YouTube / Video Reels',
    'Developer & Discord Hubs',
    'AI Search / Perplexity Index',
  ];

  const toggleChannel = (ch) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((item) => item !== ch));
      }
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  // Dynamic estimation calculation
  const multiplier = profile === 'Global Enterprise Unit' ? 1.5 : profile === 'Early-Stage AI Startup' ? 0.9 : 1.2;
  const assetCount = Math.round(selectedChannels.length * 8.5 * multiplier);
  const impressionCount = Math.round(selectedChannels.length * 85 * multiplier);

  return (
    <section className="glass-section" id="estimator">
      <div className="section-container">
        <div className="section-tag">Interactive Estimation</div>
        <h2 className="section-title">Simulate Your CreativeGini Growth Velocity</h2>
        <p className="section-desc">
          Select your organization profile and target distribution channels to estimate monthly asset throughput and reach momentum.
        </p>

        <div className="estimator-wrapper">
          {/* Controls Panel */}
          <div className="glass-card estimator-controls">
            {/* Step 1 */}
            <div className="est-step">
              <label className="est-label">1. Organization / Entity Profile</label>
              <div className="est-options-grid">
                {profiles.map((p, idx) => (
                  <button
                    key={idx}
                    className={`est-chip ${profile === p ? 'active' : ''}`}
                    onClick={() => setProfile(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="est-step">
              <label className="est-label">2. Targeted Omnichannel Footprint</label>
              <div className="est-options-grid">
                {channels.map((ch, idx) => {
                  const isSelected = selectedChannels.includes(ch);
                  return (
                    <button
                      key={idx}
                      className={`est-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleChannel(ch)}
                    >
                      {isSelected ? '✓ ' : '+ '}{ch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Impact Panel */}
          <div className="glass-card estimator-results">
            <div className="results-header">
              <span className="results-badge">Projected Monthly Impact</span>
              <h3 className="results-pod-tag">1 POD Deployment</h3>
            </div>

            <div className="results-metrics">
              <div className="res-stat-item">
                <div className="res-stat-val">{assetCount}+</div>
                <div className="res-stat-title">Multi-Modal Assets / Month</div>
                <div className="res-stat-sub">Motion, Carousels, Articles & Video</div>
              </div>

              <div className="res-stat-item">
                <div className="res-stat-val">{impressionCount}K+</div>
                <div className="res-stat-title">Targeted Monthly Impressions</div>
                <div className="res-stat-sub">Zero Bot Spillage • True ICP Reach</div>
              </div>
            </div>

            <ul className="res-features-list">
              <li><CheckCircle2 size={16} className="check-icon" /> <span>3-Member Dedicated Creative AI POD (Strategist, Designer, DevRel)</span></li>
              <li><CheckCircle2 size={16} className="check-icon" /> <span>Air-Gapped Private Model Fine-Tuning for Brand Voice Alignment</span></li>
              <li><CheckCircle2 size={16} className="check-icon" /> <span>Daily Autonomous State Telemetry & ROI Dashboards</span></li>
            </ul>

            <a
              href="https://www.datai2i.com/contact?service=CreativeGini+POD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary est-cta-btn"
            >
              <Rocket size={16} /> Reserve Your Dedicated CreativeGini POD
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
