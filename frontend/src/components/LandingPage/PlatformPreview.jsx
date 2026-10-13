import React, { useState } from 'react';
import { 
  ArrowRight, 
  LayoutDashboard, 
  FolderGit2, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  DownloadCloud,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function PlatformPreview({ onExplorePlatform }) {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <section id="platform" className="cg-section" aria-label="CreativeGini Authenticated Platform Preview">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Client Experience</span>
          <h2 className="cg-section-title">Everything in one place.</h2>
          <p className="cg-section-subtitle">
            One unified client workspace for raising service requests, monitoring research progress, reviewing deliverables, and communicating directly with your assigned specialist team.
          </p>
        </div>

        {/* Visual Mockup Window Frame */}
        <div className="cg-platform-preview-window">
          {/* Window Titlebar */}
          <div className="cg-window-titlebar">
            <div className="cg-window-dots">
              <span className="cg-window-dot red" />
              <span className="cg-window-dot yellow" />
              <span className="cg-window-dot green" />
            </div>
            <div className="cg-window-title-badge">
              <ShieldCheck size={14} color="#7C3AED" />
              <span>app.creativegini.com — Verified Client Workspace</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>256-Bit Encrypted</div>
          </div>

          {/* Mockup Portal Body */}
          <div className="cg-mockup-body">
            {/* Sidebar */}
            <aside className="cg-mockup-sidebar" aria-label="Portal mockup sidebar">
              <div 
                className={`cg-mockup-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              <div 
                className={`cg-mockup-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <FolderGit2 size={16} />
                <span>Active Requests</span>
              </div>
              <div 
                className={`cg-mockup-nav-item ${activeTab === 'deliverables' ? 'active' : ''}`}
                onClick={() => setActiveTab('deliverables')}
              >
                <DownloadCloud size={16} />
                <span>Deliverables</span>
              </div>
              <div 
                className={`cg-mockup-nav-item ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <Layers size={16} />
                <span>Services Catalog</span>
              </div>
              <div 
                className={`cg-mockup-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare size={16} />
                <span>Specialist Chat</span>
              </div>
            </aside>

            {/* Main Mockup Workspace Content */}
            <div className="cg-mockup-content">
              {/* Metric Stat Cards */}
              <div className="cg-mockup-metrics-row">
                <div className="cg-mockup-stat-card">
                  <div className="cg-mockup-stat-title">Active Requests</div>
                  <div className="cg-mockup-stat-num" style={{ color: '#7C3AED' }}>5</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>↑ 2 from last month</div>
                </div>
                <div className="cg-mockup-stat-card">
                  <div className="cg-mockup-stat-title">Completed Sprints</div>
                  <div className="cg-mockup-stat-num" style={{ color: '#10B981' }}>12</div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>100% On Schedule</div>
                </div>
                <div className="cg-mockup-stat-card">
                  <div className="cg-mockup-stat-title">Verified Deliverables</div>
                  <div className="cg-mockup-stat-num" style={{ color: '#2563EB' }}>8</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>Approved by Client</div>
                </div>
                <div className="cg-mockup-stat-card">
                  <div className="cg-mockup-stat-title">Specialist Team</div>
                  <div className="cg-mockup-stat-num" style={{ color: '#F59E0B' }}>4</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>Assigned Specialists</div>
                </div>
              </div>

              {/* Active Requests Table */}
              <div className="cg-mockup-table-card">
                <div className="cg-mockup-table-header">
                  <span className="cg-mockup-table-title">Live Service Requests</span>
                  <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 600 }}>Real-time sync</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="cg-mockup-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Service</th>
                        <th>Scope Title</th>
                        <th>Status</th>
                        <th>Assigned Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#7C3AED' }}>CG-1025</td>
                        <td>Lead Research</td>
                        <td>50 Verified CTOs &amp; VPs - EU Market</td>
                        <td><span className="cg-mockup-status-badge in-progress">In Progress</span></td>
                        <td>Company Lead Team</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#7C3AED' }}>CG-1024</td>
                        <td>Strategic Planner</td>
                        <td>Enterprise Outbound Positioning Playbook</td>
                        <td><span className="cg-mockup-status-badge review">Client Review</span></td>
                        <td>Company Boost Team</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#7C3AED' }}>CG-1023</td>
                        <td>Company Study</td>
                        <td>Tier-1 Cloud Competitor Intelligence Dossier</td>
                        <td><span className="cg-mockup-status-badge completed">Completed</span></td>
                        <td>Research Specialists</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#7C3AED' }}>CG-1022</td>
                        <td>Landing Page UI</td>
                        <td>High-Conversion SaaS Hero Redesign</td>
                        <td><span className="cg-mockup-status-badge in-progress">In Progress</span></td>
                        <td>Landing Page UX Team</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Action CTA */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            type="button"
            className="cg-btn-cta"
            style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '14px' }}
            onClick={onExplorePlatform}
          >
            <span>Explore the Platform</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
