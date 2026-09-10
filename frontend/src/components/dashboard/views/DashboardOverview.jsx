import React from 'react';
import {
  Globe,
  Palette,
  Send,
  Sparkles,
  Zap,
  Terminal,
  Plus
} from 'lucide-react';

export default function DashboardOverview({
  user,
  credits,
  onOpenNewCampaign,
  onOpenTopUp,
  onNavigate
}) {
  return (
    <div className="dash-overview-container">

      <div className="dash-welcome-row">
        <div className="dash-welcome-text">
          <span className="dash-eyebrow">✦ CREATIVEGINI AI POD COMMAND CENTER</span>
          <h1 className="dash-welcome-heading">
            Good morning, {user?.name ? user.name.split(' ')[0] : 'Enterprise Lead'}
          </h1>
          <p className="dash-welcome-sub">
            Your dedicated sovereign AI marketing POD is live. Here's your overview for today.
          </p>
        </div>
        <button
          type="button"
          className="dash-new-campaign-btn"
          onClick={onOpenNewCampaign}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New AI Campaign</span>
        </button>
      </div>

      <div className="dash-kpi-grid">

        <div className="dash-kpi-card glass-card">
          <div className="kpi-card-header">
            <span className="kpi-title">GROWTH SIGNALS & TRENDS</span>
            <div className="kpi-icon-pill">
              <Globe size={16} />
            </div>
          </div>
          <div className="kpi-main-val">142</div>
          <div className="kpi-sub-label">Market intelligence & keyword clusters</div>
          <div className="kpi-status-row">
            <span className="status-item">New: <strong>42</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item text-green">Analyzed: <strong>94</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item text-blue">Queued: <strong>6</strong></span>
          </div>
        </div>

        <div className="dash-kpi-card glass-card">
          <div className="kpi-card-header">
            <span className="kpi-title">4K CREATIVE ASSETS SYNTHESIZED</span>
            <div className="kpi-icon-pill">
              <Palette size={16} />
            </div>
          </div>
          <div className="kpi-main-val">185</div>
          <div className="kpi-sub-label">4K visual carousels & video drafts</div>
          <div className="kpi-status-row">
            <span className="status-item">Rendered: <strong>124</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item text-amber">In Enclave: <strong>48</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item text-green">Approved: <strong>13</strong></span>
          </div>
        </div>

        <div className="dash-kpi-card glass-card">
          <div className="kpi-card-header">
            <span className="kpi-title">OMNICHANNEL POSTS DISPATCHED</span>
            <div className="kpi-icon-pill">
              <Send size={16} />
            </div>
          </div>
          <div className="kpi-main-val">58</div>
          <div className="kpi-sub-label">100% Zero-Egress privacy verified</div>
          <div className="kpi-status-row">
            <span className="status-item">LinkedIn: <strong>24</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item">X / Twitter: <strong>22</strong></span>
            <span className="status-bullet">•</span>
            <span className="status-item text-blue">Dev.to: <strong>12</strong></span>
          </div>
        </div>
      </div>

      <div className="dash-agents-section">
        <div className="section-label-row">
          <span className="live-dot-green"></span>
          <span className="agents-section-title">DEDICATED AI POD SQUAD AGENTS — CLICK TO CONFIGURE</span>
        </div>

        <div className="dash-agents-grid">

          <div className="dash-agent-card glass-card">
            <div className="agent-card-header">
              <div className="agent-icon-box">
                <Globe size={18} />
              </div>
              <span className="agent-tag-pill prospecting">STRATEGIC CORE</span>
            </div>

            <h3 className="agent-card-name">Strategist Planner</h3>
            <p className="agent-card-desc">
              Uncovers market whitespace, maps high-intent audience funnels, and synthesizes data-backed content roadmaps using DeepSeek-R1 reasoning.
            </p>

            <div className="agent-live-feed-box">
              <div className="feed-header">
                <span className="feed-pulse-dot blue"></span>
                <span>LIVE FEED</span>
              </div>
              <p className="feed-main-status">Synthesizing market trend clusters...</p>
              <p className="feed-sub-status">DeepSeek-R1 competitor intelligence & persona mapping active</p>
            </div>

            <div className="agent-card-footer">
              <span className="footer-role-label">MARKET INTELLIGENCE & FUNNELS</span>
              <button
                type="button"
                className="agent-configure-btn"
                onClick={() => onNavigate('strategic-planner')}
              >
                Configure →
              </button>
            </div>
          </div>

          <div className="dash-agent-card glass-card">
            <div className="agent-card-header">
              <div className="agent-icon-box">
                <Palette size={18} />
              </div>
              <span className="agent-tag-pill copywriting">VISUAL & MOTION</span>
            </div>

            <h3 className="agent-card-name">AI Creative Designer</h3>
            <p className="agent-card-desc">
              Deploys Flux.1 Pro diffusion models and motion rendering pipelines to generate 4K visual carousels and branded SaaS walkthroughs.
            </p>

            <div className="agent-live-feed-box">
              <div className="feed-header">
                <span className="feed-pulse-dot blue"></span>
                <span>LIVE FEED</span>
              </div>
              <p className="feed-main-status">Rendering 4K carousel slides via Flux.1 Pro...</p>
              <p className="feed-sub-status">Synthesizing brand color tokens & vector diagrams</p>
            </div>

            <div className="agent-card-footer">
              <span className="footer-role-label">4K VISUAL SYNTHESIS & REELS</span>
              <button
                type="button"
                className="agent-configure-btn"
                onClick={() => onNavigate('creative-planner')}
              >
                Configure →
              </button>
            </div>
          </div>

          <div className="dash-agent-card glass-card">
            <div className="agent-card-header">
              <div className="agent-icon-box">
                <Terminal size={18} />
              </div>
              <span className="agent-tag-pill outreach">AUDIENCE NETWORK</span>
            </div>

            <h3 className="agent-card-name">DevRel & Community Lead</h3>
            <p className="agent-card-desc">
              Broadcasts high-authority content across developer networks, social channels, and Discord hubs with active discussion loops.
            </p>

            <div className="agent-live-feed-box">
              <div className="feed-header">
                <span className="feed-pulse-dot blue"></span>
                <span>LIVE FEED</span>
              </div>
              <p className="feed-main-status">Omnichannel broadcast queue ready...</p>
              <p className="feed-sub-status">Zero-Egress sovereign privacy enclave verified</p>
            </div>

            <div className="agent-card-footer">
              <span className="footer-role-label">OMNICHANNEL ADVOCACY & REACH</span>
              <button
                type="button"
                className="agent-configure-btn"
                onClick={() => onNavigate('devrel-planner')}
              >
                Configure →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-bottom-grid">

        <div className="dash-campaigns-panel glass-card">
          <div className="campaigns-panel-header">
            <div className="header-title-left">
              <Sparkles size={16} className="icon-blue" />
              <h3>Active AI Campaigns</h3>
            </div>
            <button
              type="button"
              className="view-all-link-btn"
              onClick={onOpenNewCampaign}
            >
              View all →
            </button>
          </div>

          <div className="campaigns-empty-state">
            <div className="empty-icon-circle">
              <Zap size={20} className="icon-blue" />
            </div>
            <h4 className="empty-title">No active campaigns queued</h4>
            <p className="empty-desc">
              Launch an AI campaign to dispatch the Strategist, Creative Designer, and DevRel Lead across your distribution channels.
            </p>
            <button
              type="button"
              className="dash-launch-campaign-cta"
              onClick={onOpenNewCampaign}
            >
              <Sparkles size={16} className="btn-sparkle-icon" />
              <span>Launch AI Campaign</span>
            </button>
          </div>
        </div>

        <div className="dash-wallet-card glass-card">
          <div className="wallet-header-banner">
            <div className="wallet-banner-left">
              <span className="wallet-banner-eyebrow">ACCOUNT WALLET</span>
              <h3 className="wallet-plan-title">Enterprise Sovereign POD</h3>
            </div>
            <span className="wallet-active-badge">
              <span className="dot-white"></span> ACTIVE
            </span>
          </div>

          <div className="wallet-body">
            <div className="wallet-balance-row">
              <span className="wallet-balance-lbl">CREDITS BALANCE</span>
              <span className="wallet-used-pct">
                {Math.round((credits / 5000) * 100)}% remaining
              </span>
            </div>

            <div className="wallet-count-row">
              <span className="wallet-big-val">{credits.toLocaleString()}</span>
              <span className="wallet-total-val">/ 5,000</span>
            </div>

            <div className="wallet-progress-bar">
              <div
                className="wallet-progress-fill"
                style={{ width: `${Math.min(100, Math.round((credits / 5000) * 100))}%` }}
              ></div>
            </div>

            <button
              type="button"
              className="wallet-topup-btn"
              onClick={onOpenTopUp}
            >
              + Top Up Credits
            </button>

            <p className="wallet-sub-note">Credits never expire • 0% Data Egress Enclave</p>
          </div>
        </div>
      </div>
    </div>
  );
}
