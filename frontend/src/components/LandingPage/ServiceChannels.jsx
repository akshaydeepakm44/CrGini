import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Search, 
  BarChart3, 
  Target, 
  Building2, 
  Users, 
  Presentation,
  Compass,
  PenTool,
  Code,
  Rocket,
  Palette,
  Megaphone
} from 'lucide-react';

export default function ServiceChannels({ onSelectChannel }) {
  const boostingFeatures = [
    { name: 'Strategic Planner', icon: Compass },
    { name: 'Content Creator', icon: PenTool },
    { name: 'DevRel Advocacy', icon: Code },
    { name: 'GTM Strategy', icon: Rocket },
    { name: 'Creative Design', icon: Palette },
    { name: 'High-Impact Ads', icon: Megaphone }
  ];

  const digitalisingFeatures = [
    { name: 'Lead Research', icon: Target },
    { name: 'Company Study', icon: Building2 },
    { name: 'Key People Research', icon: Users },
    { name: 'Pitch & Deck Support', icon: Presentation }
  ];

  return (
    <section id="services" className="cg-section" aria-label="CreativeGini Service Channels">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Service Channels</span>
          <h2 className="cg-section-title">Two Dedicated Paths to Scale Your Business</h2>
          <p className="cg-section-subtitle">
            Whether you need strategic momentum and marketing firepower or deep intelligence and lead research, CreativeGini provides scoped execution.
          </p>
        </div>

        <div className="cg-channels-grid">
          {/* Channel 1: BOOSTING */}
          <div className="cg-channel-card boosting">
            <span className="cg-channel-badge">
              <Sparkles size={14} />
              <span>Channel 01 // Brand &amp; Outreach</span>
            </span>

            <h3 className="cg-channel-title">BOOSTING</h3>
            <p className="cg-channel-desc">
              Build your brand, content and growth strategy. Accelerate market presence with high-conversion creative sprints, technical advocacy, and omnichannel narratives.
            </p>

            <div className="cg-channel-features-list">
              {boostingFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.name} className="cg-channel-feature-item">
                    <Icon size={16} className="cg-channel-feature-icon" />
                    <span>{feat.name}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="cg-channel-btn"
              onClick={() => onSelectChannel && onSelectChannel('BOOSTING')}
            >
              <span>Explore Boosting</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Channel 2: DIGITALISING */}
          <div className="cg-channel-card digitalising">
            <span className="cg-channel-badge">
              <Search size={14} />
              <span>Channel 02 // Market Intelligence</span>
            </span>

            <h3 className="cg-channel-title">DIGITALISING</h3>
            <p className="cg-channel-desc">
              Research, insights and business intelligence. Equip your sales and executive team with verified prospect databases, company dossiers, and org intelligence.
            </p>

            <div className="cg-channel-features-list">
              {digitalisingFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.name} className="cg-channel-feature-item">
                    <Icon size={16} className="cg-channel-feature-icon" />
                    <span>{feat.name}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="cg-channel-btn"
              onClick={() => onSelectChannel && onSelectChannel('DIGITALISING')}
            >
              <span>Explore Digitalising</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
