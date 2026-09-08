import React, { useState } from 'react';
import {
  Users,
  Compass,
  Palette,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Sliders,
  Play,
  RotateCw
} from 'lucide-react';

export default function PodSquadView() {
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const agents = [
    {
      id: 'strategy',
      num: '01',
      name: 'Strategy Agent',
      tagline: "Gini's Strategist",
      role: 'Market Intelligence & GTM Strategy',
      desc: 'Plans how, where, and when your product should be marketed to identify ideal buyers and unlock market demand.',
      accent: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.35)',
      icon: Compass,
      status: 'AUTONOMOUS ACTIVE',
      metrics: [
        { label: 'Competitors Tracked', val: '8 Active' },
        { label: 'Target ICP Personas', val: '3 Defined' },
        { label: 'Clarity Score', val: '94.8%' }
      ],
      capabilities: [
        'Automated competitor positioning & SERP gap analysis',
        'High-intent buyer persona & ICP discovery',
        'Multi-channel go-to-market campaign blueprinting',
        'Weekly messaging optimization & value proposition tuning'
      ],
      recentAction: 'Mapped 3 high-intent buyer pools for Q3 product launch',
      actionTime: '3 mins ago'
    },
    {
      id: 'content',
      num: '02',
      name: 'Content Agent',
      tagline: "Gini's Creative Mind",
      role: 'Visual Design & High-Impact Media',
      desc: 'Transforms marketing strategy into attention-grabbing posters, short-form reels, 4K demo videos, and ad creatives.',
      accent: '#C084FC',
      glow: 'rgba(192, 132, 252, 0.35)',
      icon: Palette,
      status: 'RENDERING QUEUE READY',
      metrics: [
        { label: 'Media Assets Rendered', val: '48 Assets' },
        { label: 'Brand Consistency', val: '100%' },
        { label: 'Video Engine', val: '4K UHD' }
      ],
      capabilities: [
        'High-converting product announcement posters',
        'Viral short-form reels scripted & produced for social feeds',
        'Dynamic product demo & feature walkthrough videos',
        'Automated multi-platform creative resizing & token guard'
      ],
      recentAction: 'Generated 3 high-contrast Instagram & X launch graphics',
      actionTime: '18 mins ago'
    },
    {
      id: 'growth',
      num: '03',
      name: 'Community & Growth Agent',
      tagline: "Gini's Growth Partner",
      role: 'Audience Education & Customer Scale',
      desc: 'Discovers niche communities, educates prospective buyers with organic storytelling, and drives compounding customer acquisition.',
      accent: '#34D399',
      glow: 'rgba(52, 211, 153, 0.35)',
      icon: Users,
      status: 'MONITORING CHANNELS',
      metrics: [
        { label: 'Communities Connected', val: '14 Channels' },
        { label: 'Weekly Leads Found', val: '+340 Leads' },
        { label: 'Conversion Lift', val: '4.8x Avg' }
      ],
      capabilities: [
        'High-relevance forum & developer community discovery',
        'Direct prospect identification & purchase intent tracking',
        'Audience education & organic product storytelling',
        'Compounding customer acquisition & retention loops'
      ],
      recentAction: 'Identified 120 qualified leads from target niche subreddits',
      actionTime: '45 mins ago'
    }
  ];

  const recentLogs = [
    {
      agent: 'Strategy Agent',
      accent: '#38BDF8',
      action: 'Completed competitive analysis against 8 industry rivals',
      time: '12m ago',
      badge: 'SUCCESS'
    },
    {
      agent: 'Content Agent',
      accent: '#C084FC',
      action: 'Generated 4 promotional reels for upcoming feature announcement',
      time: '28m ago',
      badge: 'RENDERED'
    },
    {
      agent: 'Community Agent',
      accent: '#34D399',
      action: 'Monitored 14 discussion threads across Reddit & Discord niches',
      time: '52m ago',
      badge: 'SYNCED'
    },
    {
      agent: 'Strategy Agent',
      accent: '#38BDF8',
      action: 'Updated Ideal Customer Profile (ICP) criteria based on recent signups',
      time: '1h 15m ago',
      badge: 'OPTIMIZED'
    }
  ];

  return (
    <div className="squad-dashboard-container">
      {/* HEADER HERO CARD */}
      <div className="squad-header-card">
        <div className="squad-header-top">
          <div className="squad-brand-tag">
            <Sparkles size={14} className="icon-sparkle" />
            <span>GINI AI MARKETING SQUAD</span>
          </div>

          <div className="squad-status-cluster">
            <div className="squad-live-indicator">
              <span className="live-pulse-dot" />
              <span>3 Autonomous Agents Online</span>
            </div>
            <button
              className={`squad-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              title="Sync Squad Status"
            >
              <RotateCw size={14} />
              <span>Sync Status</span>
            </button>
          </div>
        </div>

        <div className="squad-header-main">
          <h2 className="squad-heading">
            Three Parts of Gini. <span className="squad-gradient-text">One Unified Team.</span>
          </h2>
          <p className="squad-subheading">
            Your dedicated AI marketing squad works in real-time synergy. Gini analyzes your product, creates attention-grabbing content, engages high-intent communities, and drives continuous customer acquisition.
          </p>
        </div>

        {/* WORKFLOW PIPELINE STRIP */}
        <div className="squad-pipeline-track">
          <div className="pipeline-node active">
            <span className="node-step">01</span>
            <span className="node-txt">Product Analysis</span>
          </div>
          <span className="pipeline-arrow">→</span>
          <div className="pipeline-node active">
            <span className="node-step">02</span>
            <span className="node-txt">Gini Strategy</span>
          </div>
          <span className="pipeline-arrow">→</span>
          <div className="pipeline-node active">
            <span className="node-step">03</span>
            <span className="node-txt">Gini Content</span>
          </div>
          <span className="pipeline-arrow">→</span>
          <div className="pipeline-node active">
            <span className="node-step">04</span>
            <span className="node-txt">Gini Community</span>
          </div>
          <span className="pipeline-arrow">→</span>
          <div className="pipeline-node highlight">
            <span className="node-step">05</span>
            <span className="node-txt">Customer Growth</span>
          </div>
        </div>
      </div>

      {/* 3 COMMAND MODULE CARDS */}
      <div className="squad-agents-grid">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="squad-agent-card"
              style={{ '--agent-accent': agent.accent, '--agent-glow': agent.glow }}
            >
              <div className="agent-card-top-bar">
                <div className="agent-role-pill">
                  AGENT {agent.num} • {agent.tagline}
                </div>
                <div className="agent-status-badge" style={{ color: agent.accent, borderColor: `${agent.accent}40`, background: `${agent.accent}15` }}>
                  <span className="agent-status-dot-inner" style={{ background: agent.accent }} />
                  {agent.status}
                </div>
              </div>

              <div className="agent-identity-row">
                <div className="agent-icon-halo-box" style={{ color: agent.accent, borderColor: agent.accent, background: `${agent.accent}18` }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="agent-title-text">{agent.name}</h3>
                  <span className="agent-role-subtitle">{agent.role}</span>
                </div>
              </div>

              <p className="agent-desc-text">{agent.desc}</p>

              {/* METRIC CHIPS */}
              <div className="agent-metrics-row">
                {agent.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="metric-chip-box">
                    <span className="metric-chip-label">{m.label}</span>
                    <span className="metric-chip-val" style={{ color: agent.accent }}>{m.val}</span>
                  </div>
                ))}
              </div>

              {/* CAPABILITIES CHECKLIST */}
              <div className="agent-capabilities-section">
                <div className="cap-label">CORE CAPABILITIES</div>
                <div className="cap-list">
                  {agent.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="cap-item">
                      <CheckCircle2 size={14} style={{ color: agent.accent, flexShrink: 0, marginTop: '2px' }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT OPERATION */}
              <div className="agent-recent-action-box">
                <div className="action-box-header">
                  <Activity size={12} style={{ color: agent.accent }} />
                  <span>LATEST AGENT OPERATION</span>
                  <span className="action-timestamp">{agent.actionTime}</span>
                </div>
                <p className="action-box-txt">{agent.recentAction}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT SQUAD ACTIVITY LOG */}
      <div className="squad-activity-panel">
        <div className="activity-panel-header">
          <div className="panel-title-left">
            <Activity size={18} className="icon-sparkle" />
            <h3>Autonomous Squad Execution Stream</h3>
          </div>
          <span className="activity-pulse-tag">Real-Time Telemetry</span>
        </div>

        <div className="activity-log-table">
          {recentLogs.map((log, lIdx) => (
            <div key={lIdx} className="log-row-item">
              <div className="log-agent-info">
                <span className="log-dot" style={{ background: log.accent }} />
                <strong style={{ color: log.accent }}>{log.agent}</strong>
              </div>
              <div className="log-action-text">{log.action}</div>
              <div className="log-meta">
                <span className="log-badge">{log.badge}</span>
                <span className="log-time">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
