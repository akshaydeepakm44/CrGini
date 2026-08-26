import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  Sparkles,
  BarChart3,
  ShieldCheck,
  User,
  LogOut,
  ArrowLeft,
  Zap,
  Globe,
  Activity,
  Layers,
  Send,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  Plus,
  Key,
  Server,
  Settings,
  Radio
} from 'lucide-react';

export default function Dashboard({ user, onGoToLanding, onLogout }) {
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'squad' | 'pipeline' | 'assets' | 'analytics' | 'security' | 'profile'
  const [logs, setLogs] = useState([
    { id: 1, time: '17:14:02', agent: 'Strategist AI', msg: 'Analyzed 42 competitor trend clusters across TechCrunch & GitHub Trending.', type: 'info' },
    { id: 2, time: '17:14:15', agent: 'Creative AI', msg: 'Rendered 4K visual carousel via Flux.1 Pro (Zero Egress Enclave).', type: 'success' },
    { id: 3, time: '17:14:28', agent: 'DevRel AI', msg: 'Optimized technical copy & code snippets for LinkedIn & X distribution.', type: 'info' },
    { id: 4, time: '17:14:40', agent: 'Telemetry', msg: 'Omnichannel sync completed: 185 assets queued for auto-posting.', type: 'success' },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignTopic, setCampaignTopic] = useState('');

  // Periodically push simulated live telemetry logs
  useEffect(() => {
    const agents = ['Strategist AI', 'Creative AI', 'DevRel AI', 'Telemetry'];
    const messages = [
      'Evaluating real-time engagement velocity on latest technical deep-dive post.',
      'Generating high-converting carousel infographics via Flux.1 Schnell.',
      'Auto-formatting code blocks and markdown for Substack & Medium syndication.',
      'Zero-Data Egress Privacy audit: 100% sovereign compute verified.',
      'Re-balancing multi-agent state graph pipeline throughput.'
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const type = Math.random() > 0.3 ? 'info' : 'success';

      setLogs((prev) => [
        { id: Date.now(), time: timeStr, agent: randomAgent, msg: randomMsg, type },
        ...prev.slice(0, 14)
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    if (!campaignTopic.trim()) return;

    setIsGenerating(true);
    const now = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      { id: Date.now(), time: now, agent: 'POD Commander', msg: `Initiated new AI Campaign: "${campaignTopic}"`, type: 'success' },
      ...prev
    ]);

    setTimeout(() => {
      setIsGenerating(false);
      setCampaignTopic('');
    }, 2000);
  };

  return (
    <div className="dashboard-layout">
      {/* ==========================================================================
         LEFT GLASS SIDEBAR
         ========================================================================== */}
      <aside className="dash-sidebar">
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand-box">
          <img src="/logo.png" alt="CreativeGini Logo" className="sidebar-logo-img" />
          <span className="sidebar-pod-pill"><Radio size={11} className="pulse-icon" /> LIVE POD #01</span>
        </div>

        {/* Main Navigation Menu */}
        <nav className="sidebar-menu">
          <div className="menu-group-label">MAIN NAVIGATION</div>

          {/* 1st: Dashboard */}
          <button
            className={`sidebar-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* 2nd: POD Squad */}
          <button
            className={`sidebar-item ${activeNav === 'squad' ? 'active' : ''}`}
            onClick={() => setActiveNav('squad')}
          >
            <Users size={18} />
            <span>POD Squad</span>
          </button>

          {/* 3rd: AI Pipeline */}
          <button
            className={`sidebar-item ${activeNav === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveNav('pipeline')}
          >
            <GitMerge size={18} />
            <span>AI Pipeline</span>
          </button>

          {/* 4th: Generative Assets */}
          <button
            className={`sidebar-item ${activeNav === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveNav('assets')}
          >
            <Sparkles size={18} />
            <span>Generative Assets</span>
          </button>

          {/* 5th: Analytics & ROI */}
          <button
            className={`sidebar-item ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveNav('analytics')}
          >
            <BarChart3 size={18} />
            <span>Analytics & ROI</span>
          </button>

          {/* 6th: Enterprise Security */}
          <button
            className={`sidebar-item ${activeNav === 'security' ? 'active' : ''}`}
            onClick={() => setActiveNav('security')}
          >
            <ShieldCheck size={18} />
            <span>Enterprise Security</span>
          </button>
        </nav>

        {/* Sidebar Bottom Profile Footer */}
        <div className="sidebar-footer">
          <div className="menu-group-label">ACCOUNT</div>
          <button
            className={`sidebar-item profile-sidebar-item ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveNav('profile')}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="sidebar-avatar"
            />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Enterprise Admin'}</span>
              <span className="sidebar-user-role">POD Admin</span>
            </div>
            <User size={16} className="profile-link-icon" />
          </button>
        </div>
      </aside>

      {/* ==========================================================================
         RIGHT MAIN CONTENT AREA
         ========================================================================== */}
      <div className="dash-body">
        {/* Top Header Bar */}
        <header className="dash-top-bar">
          <div className="top-bar-left">
            <button className="dash-back-btn" onClick={onGoToLanding} title="Return to Public Landing Page">
              <ArrowLeft size={16} /> <span>Landing Page</span>
            </button>
            <span className="current-view-title">
              {activeNav === 'dashboard' && 'Command Center Overview'}
              {activeNav === 'squad' && 'Dedicated 3-Member POD Squad'}
              {activeNav === 'pipeline' && 'Multi-Agent 5-Phase State Graph'}
              {activeNav === 'assets' && 'Omnichannel Content Asset Library'}
              {activeNav === 'analytics' && 'Reach Surge & Growth Telemetry'}
              {activeNav === 'security' && 'Zero-Data Egress Privacy Security'}
              {activeNav === 'profile' && 'User Profile & Account Settings'}
            </span>
          </div>

          <div className="top-bar-right">
            <div className="dash-telemetry-pill">
              <ShieldCheck size={14} className="icon-green" />
              <span>Sovereign Enclave • 0% Egress</span>
            </div>

            <button className="dash-logout-btn" onClick={onLogout} title="Sign Out">
              <LogOut size={16} /> <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Views */}
        <main className="dash-content-area">
          {/* TAB 1: DASHBOARD COMMAND CENTER OVERVIEW */}
          {activeNav === 'dashboard' && (
            <div className="dash-tab-container">
              {/* Quick AI Campaign Launcher */}
              <div className="dash-panel glass-card prompt-launcher-panel">
                <form className="dash-quick-campaign" onSubmit={handleLaunchCampaign}>
                  <div className="launcher-title">
                    <Sparkles size={18} className="icon-purple" />
                    <span>Prompt AI POD Commander:</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter campaign topic e.g. 'Enterprise Multi-Agent Scaling Architecture'..."
                    value={campaignTopic}
                    onChange={(e) => setCampaignTopic(e.target.value)}
                    className="dash-input"
                  />
                  <button type="submit" className="dash-submit-btn" disabled={isGenerating}>
                    {isGenerating ? <RefreshCw size={15} className="spin-icon" /> : <Send size={15} />}
                    <span>{isGenerating ? 'Generating...' : 'Launch Campaign'}</span>
                  </button>
                </form>
              </div>

              {/* 4 Metric Telemetry Cards */}
              <div className="dash-metrics-grid">
                <div className="dash-metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Content Velocity</span>
                    <div className="metric-icon-box purple"><Zap size={18} /></div>
                  </div>
                  <div className="metric-big-val">185 Assets/Day</div>
                  <div className="metric-sub-text green"><Activity size={13} /> +24% increase this week</div>
                </div>

                <div className="dash-metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Organic Impressions</span>
                    <div className="metric-icon-box blue"><Globe size={18} /></div>
                  </div>
                  <div className="metric-big-val">1.42M</div>
                  <div className="metric-sub-text green"><BarChart3 size={13} /> +480% organic reach surge</div>
                </div>

                <div className="dash-metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Brand Consistency</span>
                    <div className="metric-icon-box green"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="metric-big-val">99.8%</div>
                  <div className="metric-sub-text text-muted">DeepSeek Guard Active</div>
                </div>

                <div className="dash-metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Active AI Agents</span>
                    <div className="metric-icon-box pink"><Layers size={18} /></div>
                  </div>
                  <div className="metric-big-val">3 Squad Roles</div>
                  <div className="metric-sub-text green"><CheckCircle2 size={13} /> 100% Pipeline Health</div>
                </div>
              </div>

              {/* Two Column Grid: POD Nodes & Live Log Console */}
              <div className="dash-two-col">
                {/* POD Squad Agent Status Card */}
                <div className="dash-panel glass-card">
                  <div className="panel-header">
                    <h3><Cpu size={18} className="icon-purple" /> Dedicated POD Squad Nodes</h3>
                    <span className="badge-live">3 Nodes Active</span>
                  </div>

                  <div className="agent-nodes-list">
                    <div className="agent-node-item active-node">
                      <div className="node-icon-box">01</div>
                      <div className="node-details">
                        <div className="node-title-row">
                          <span className="node-title">Strategist & Planner AI</span>
                          <span className="node-status-pill green">Executing</span>
                        </div>
                        <p className="node-activity">Analyzing HackerNews & GitHub Trending for Q3 AI architecture keyword clusters.</p>
                        <div className="node-tech-tags">
                          <span className="tag">DeepSeek-R1</span>
                          <span className="tag">SerpAPI</span>
                          <span className="tag">TrendEngine</span>
                        </div>
                      </div>
                    </div>

                    <div className="agent-node-item active-node">
                      <div className="node-icon-box">02</div>
                      <div className="node-details">
                        <div className="node-title-row">
                          <span className="node-title">AI Creative Designer</span>
                          <span className="node-status-pill purple">Rendering 4K</span>
                        </div>
                        <p className="node-activity">Generating 12 visual carousel slides & video reels with exact brand color tokens.</p>
                        <div className="node-tech-tags">
                          <span className="tag">Flux.1 Pro</span>
                          <span className="tag">Kling AI</span>
                          <span className="tag">Luma Dream</span>
                        </div>
                      </div>
                    </div>

                    <div className="agent-node-item active-node">
                      <div className="node-icon-box">03</div>
                      <div className="node-details">
                        <div className="node-title-row">
                          <span className="node-title">DevRel & Distribution Lead</span>
                          <span className="node-status-pill blue">Broadcasting</span>
                        </div>
                        <p className="node-activity">Scheduling omnichannel auto-posts & monitoring real-time sentiment telemetry.</p>
                        <div className="node-tech-tags">
                          <span className="tag">LinkedIn API</span>
                          <span className="tag">X / Twitter</span>
                          <span className="tag">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Multi-Agent Log Console */}
                <div className="dash-panel glass-card">
                  <div className="panel-header">
                    <h3><Activity size={18} className="icon-green" /> Live Telemetry Console Stream</h3>
                    <button className="clear-logs-btn" onClick={() => setLogs([])}>Clear Log</button>
                  </div>

                  <div className="log-console-box">
                    {logs.map((log) => (
                      <div key={log.id} className={`log-line ${log.type}`}>
                        <span className="log-time">[{log.time}]</span>
                        <span className="log-agent">[{log.agent}]</span>
                        <span className="log-msg">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generative Asset Queue Table */}
              <div className="dash-panel glass-card asset-table-panel">
                <div className="panel-header">
                  <h3><Sparkles size={18} className="icon-purple" /> Recent Generative Content Pipeline Queue</h3>
                  <button className="btn-primary btn-sm"><Plus size={14} /> Trigger Manual Pipeline</button>
                </div>

                <div className="table-responsive">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Topic / Asset Headline</th>
                        <th>Omnichannel Target</th>
                        <th>AI Engine Stack</th>
                        <th>Status</th>
                        <th>Predicted Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="table-topic-cell">
                            <strong>Autonomous AI POD Architecture for Scale</strong>
                            <span className="topic-sub">Technical Whitepaper & Carousel</span>
                          </div>
                        </td>
                        <td><span className="channel-pill linkedin">LinkedIn & X</span></td>
                        <td><span className="engine-pill">DeepSeek + Flux.1</span></td>
                        <td><span className="status-pill status-ready"><CheckCircle2 size={12} /> Auto-Published</span></td>
                        <td><span className="score-high">98% High Velocity</span></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="table-topic-cell">
                            <strong>Zero-Data Egress Privacy Enclaves Explained</strong>
                            <span className="topic-sub">4K Video Motion Reel</span>
                          </div>
                        </td>
                        <td><span className="channel-pill youtube">YouTube & X</span></td>
                        <td><span className="engine-pill">Kling AI + Luma</span></td>
                        <td><span className="status-pill status-scheduled"><Clock size={12} /> Scheduled 18:00</span></td>
                        <td><span className="score-high">94% High Velocity</span></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="table-topic-cell">
                            <strong>Multi-Agent State Graph Optimization Patterns</strong>
                            <span className="topic-sub">Technical Blog & Code Snippets</span>
                          </div>
                        </td>
                        <td><span className="channel-pill medium">Medium & Dev.to</span></td>
                        <td><span className="engine-pill">DeepSeek-R1</span></td>
                        <td><span className="status-pill status-review"><RefreshCw size={12} className="spin-icon" /> In Review</span></td>
                        <td><span className="score-high">91% High Velocity</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POD SQUAD */}
          {activeNav === 'squad' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card">
                <div className="panel-header">
                  <h3><Users size={18} className="icon-purple" /> Dedicated Deep-Tech POD Squad Roles</h3>
                </div>

                <div className="role-grid-details" style={{ margin: 0 }}>
                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <div className="role-badge-pill">ROLE 01</div>
                    <h4 className="role-card-title">Strategist & Growth Planner</h4>
                    <p className="role-card-subtitle">Engineers domain-specific content strategies & keyword clusters.</p>
                    <ul className="bullet-list" style={{ marginTop: '16px' }}>
                      <li><CheckCircle2 size={14} className="check-icon" /> Competitor sentiment & SERP tracking</li>
                      <li><CheckCircle2 size={14} className="check-icon" /> Autonomous trend discovery pipeline</li>
                    </ul>
                  </div>

                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <div className="role-badge-pill">ROLE 02</div>
                    <h4 className="role-card-title">AI Creative & Media Designer</h4>
                    <p className="role-card-subtitle">Transforms strategy into 4K video clips, carousel infographics & diagrams.</p>
                    <ul className="bullet-list" style={{ marginTop: '16px' }}>
                      <li><CheckCircle2 size={14} className="check-icon" /> Flux.1 & Kling AI 4K media rendering</li>
                      <li><CheckCircle2 size={14} className="check-icon" /> 100% Brand Token Consistency Guard</li>
                    </ul>
                  </div>

                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <div className="role-badge-pill">ROLE 03</div>
                    <h4 className="role-card-title">DevRel & Omnichannel Lead</h4>
                    <p className="role-card-subtitle">Broadcasts technical content & engages developer communities 24/7.</p>
                    <ul className="bullet-list" style={{ marginTop: '16px' }}>
                      <li><CheckCircle2 size={14} className="check-icon" /> LinkedIn, X, Medium & Substack sync</li>
                      <li><CheckCircle2 size={14} className="check-icon" /> Real-time sentiment & comment telemetry</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI PIPELINE */}
          {activeNav === 'pipeline' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card">
                <div className="panel-header">
                  <h3><GitMerge size={18} className="icon-purple" /> 5-Phase Multi-Agent State Graph Execution Flow</h3>
                </div>
                <div className="pipeline-stepper-grid">
                  <div className="pipeline-card active-pipeline-card">
                    <div className="pipeline-phase-badge">Phase 1</div>
                    <div className="pipeline-title">Trend Ingestion</div>
                    <p className="pipeline-desc">Harvests technical feeds, GitHub releases & SERP signals.</p>
                  </div>
                  <div className="pipeline-card active-pipeline-card">
                    <div className="pipeline-phase-badge">Phase 2</div>
                    <div className="pipeline-title">Deep Research</div>
                    <p className="pipeline-desc">DeepSeek-R1 reasoning engine structures technical outlines.</p>
                  </div>
                  <div className="pipeline-card active-pipeline-card">
                    <div className="pipeline-phase-badge">Phase 3</div>
                    <div className="pipeline-title">Media Synthesis</div>
                    <p className="pipeline-desc">Flux.1 & Kling AI render 4K infographics & video reels.</p>
                  </div>
                  <div className="pipeline-card active-pipeline-card">
                    <div className="pipeline-phase-badge">Phase 4</div>
                    <div className="pipeline-title">Brand Verification</div>
                    <p className="pipeline-desc">Zero-egress verification guard checks terminology & links.</p>
                  </div>
                  <div className="pipeline-card active-pipeline-card">
                    <div className="pipeline-phase-badge">Phase 5</div>
                    <div className="pipeline-title">Omnichannel Sync</div>
                    <p className="pipeline-desc">DevRel lead broadcasts queued posts to LinkedIn, X & Medium.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERATIVE ASSETS */}
          {activeNav === 'assets' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card">
                <div className="panel-header">
                  <h3><Sparkles size={18} className="icon-purple" /> Omnichannel Generative Content Library</h3>
                  <button className="btn-primary btn-sm"><Plus size={14} /> New Asset</button>
                </div>
                <div className="dash-metrics-grid">
                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <span className="results-badge">Carousel Infographic</span>
                    <h4 style={{ color: '#fff', margin: '10px 0 6px 0' }}>Multi-Agent System Blueprint</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>12 visual slides rendered via Flux.1 Pro</p>
                  </div>
                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <span className="results-badge">4K Motion Reel</span>
                    <h4 style={{ color: '#fff', margin: '10px 0 6px 0' }}>Sovereign GPU Compute Demo</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>30s video synthesized via Kling AI</p>
                  </div>
                  <div className="dash-metric-card" style={{ textAlign: 'left' }}>
                    <span className="results-badge">Technical Article</span>
                    <h4 style={{ color: '#fff', margin: '10px 0 6px 0' }}>Zero Egress Privacy Spec</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Markdown & code blocks formatted for Substack</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & ROI */}
          {activeNav === 'analytics' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card">
                <div className="panel-header">
                  <h3><BarChart3 size={18} className="icon-purple" /> Organic Reach Surge & Velocity Telemetry</h3>
                </div>
                <div className="dash-metrics-grid">
                  <div className="dash-metric-card">
                    <span className="metric-title">Monthly Organic Impressions</span>
                    <div className="metric-big-val">1,420,000</div>
                    <span className="metric-sub-text green">+480% surge benchmark</span>
                  </div>
                  <div className="dash-metric-card">
                    <span className="metric-title">Daily Content Velocity</span>
                    <div className="metric-big-val">185 Posts</div>
                    <span className="metric-sub-text green">10x industry average</span>
                  </div>
                  <div className="dash-metric-card">
                    <span className="metric-title">Audience Sentiment Score</span>
                    <div className="metric-big-val">98.4 / 100</div>
                    <span className="metric-sub-text green">Positive developer sentiment</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ENTERPRISE SECURITY */}
          {activeNav === 'security' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card">
                <div className="panel-header">
                  <h3><ShieldCheck size={18} className="icon-green" /> Sovereign GPU Compute & Zero Egress Privacy</h3>
                </div>
                <div className="agent-nodes-list">
                  <div className="agent-node-item active-node">
                    <Server size={24} className="icon-green" style={{ marginTop: '4px' }} />
                    <div className="node-details">
                      <span className="node-title">Isolated On-Premises / Dedicated Cloud GPU Cluster</span>
                      <p className="node-activity">All generative model weights (DeepSeek-R1, Flux.1) execute strictly inside sovereign enterprise enclaves.</p>
                      <span className="node-status-pill green">0% Data Egress Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE & ACCOUNT (LAST IN SIDEBAR) */}
          {activeNav === 'profile' && (
            <div className="dash-tab-container">
              <div className="dash-panel glass-card profile-panel">
                <div className="panel-header">
                  <h3><User size={18} className="icon-purple" /> Enterprise Admin Account Profile</h3>
                  <button className="dash-logout-btn" onClick={onLogout} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '999px' }}>
                    <LogOut size={14} /> <span>Sign Out</span>
                  </button>
                </div>

                <div className="profile-card-body">
                  <div className="profile-main-info">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name || 'User'}
                      className="profile-lg-avatar"
                    />
                    <div className="profile-text-details">
                      <h2>{user?.name || 'Enterprise Admin'}</h2>
                      <p className="profile-email">{user?.email || 'admin@creativegini.ai'}</p>
                      <div className="profile-badges">
                        <span className="role-tag-pill">POD Commander</span>
                        <span className="badge-active">Sovereign Tier #01</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-settings-grid">
                    <div className="setting-box">
                      <label><Server size={14} /> Sovereign Compute Cluster Region</label>
                      <select className="dash-select">
                        <option>US-East (AWS Sovereign Enclave #01)</option>
                        <option>EU-Central (Sovereign GPU Cluster #02)</option>
                        <option>On-Premises Dedicated Rack</option>
                      </select>
                    </div>

                    <div className="setting-box">
                      <label><Key size={14} /> Enterprise Multi-Agent API Key</label>
                      <div className="api-key-input-group">
                        <input type="password" value="cg_live_pod_8839201948571029485" readOnly className="dash-input" />
                        <button className="btn-glass btn-sm">Copy Key</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
