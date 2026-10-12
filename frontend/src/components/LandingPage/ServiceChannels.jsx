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
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

export default function ServiceChannels({ onSelectChannel }) {
  const { isChannelActive } = useServiceVisibility();
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

  const designFeatures = [
    { name: 'UI/UX Audit', icon: Palette },
    { name: 'Figma Project', icon: PenTool },
    { name: 'Landing Redesign', icon: Sparkles },
    { name: 'Design Systems', icon: Layers }
  ];

  const devFeatures = [
    { name: 'Technical Discovery', icon: Code },
    { name: 'Clickable Prototype', icon: Rocket },
    { name: 'MVP Development', icon: Layers },
    { name: 'Full-Stack Apps', icon: ArrowRight }
  ];

  return (
    <section id="services" className="cg-section" aria-label="CreativeGini Service Channels">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Service Channels</span>
          <h2 className="cg-section-title">Dedicated Specialist Channels to Scale Your Business</h2>
          <p className="cg-section-subtitle">
            Whether you need strategic momentum, high-converting product design, or full-stack software development, CreativeGini provides scoped execution.
          </p>
        </div>

        <div className="cg-channels-grid">
          {/* Channel 1: BOOSTING */}
          {isChannelActive('boosting') && (
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
          )}

          {/* Channel 2: DIGITALISING */}
          {isChannelActive('digitalising') && (
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
          )}

          {/* Channel 3: UI / DESIGN */}
          {isChannelActive('design') && (
            <div className="cg-channel-card" style={{ borderColor: '#E0F2FE' }}>
              <span className="cg-channel-badge" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                <Palette size={14} />
                <span>Channel 03 // UI &amp; Design</span>
              </span>

              <h3 className="cg-channel-title" style={{ color: '#0284C7' }}>UI / DESIGN</h3>
              <p className="cg-channel-desc">
                High-converting product interfaces, heuristic UX audits, production Figma systems, and end-to-end design sprints engineered for conversion.
              </p>

              <div className="cg-channel-features-list">
                {designFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.name} className="cg-channel-feature-item">
                      <Icon size={16} className="cg-channel-feature-icon" style={{ color: '#0284C7' }} />
                      <span>{feat.name}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="cg-channel-btn"
                style={{ background: '#0284C7', color: '#FFFFFF' }}
                onClick={() => onSelectChannel && onSelectChannel('DESIGN')}
              >
                <span>Explore UI / Design</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Channel 4: APP DEVELOPMENT */}
          {isChannelActive('development') && (
            <div className="cg-channel-card" style={{ borderColor: '#D1FAE5' }}>
              <span className="cg-channel-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                <Code size={14} />
                <span>Channel 04 // App Development</span>
              </span>

              <h3 className="cg-channel-title" style={{ color: '#059669' }}>APP DEVELOPMENT</h3>
              <p className="cg-channel-desc">
                Turnkey web applications, clickable interactive prototypes, and production software MVP engineering built by senior specialists.
              </p>

              <div className="cg-channel-features-list">
                {devFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.name} className="cg-channel-feature-item">
                      <Icon size={16} className="cg-channel-feature-icon" style={{ color: '#059669' }} />
                      <span>{feat.name}</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="cg-channel-btn"
                style={{ background: '#059669', color: '#FFFFFF' }}
                onClick={() => onSelectChannel && onSelectChannel('DEVELOPMENT')}
              >
                <span>Explore App Dev</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
