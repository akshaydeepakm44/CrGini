import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  ArrowLeft,
  LayoutDashboard, 
  Search, 
  Sparkles, 
  FileText, 
  DownloadCloud, 
  CheckCircle2, 
  Users, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Eye, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  Code,
  Terminal,
  Send,
  Check
} from 'lucide-react';
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

gsap.registerPlugin(ScrollTrigger);

export default function ClientExperienceJourney({ onExplorePlatform, onExploreService }) {
  const { isChannelActive } = useServiceVisibility();
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const pinTargetRef = useRef(null);
  const activeStepRef = useRef(0);

  const steps = [
    {
      id: 'platform',
      stepNum: '01',
      badge: '01 // SEAMLESS CLIENT WORKSPACE',
      title: 'Enter Your Private Client Portal',
      subtitle: 'Instantly access your workspace with custom service requests, live project timelines, transparent pricing, and direct specialist collaboration.'
    },
    {
      id: 'boosting',
      stepNum: '02',
      badge: '02 // BRAND & GROWTH BOOSTING',
      title: 'When the Client Requires Boosting',
      subtitle: 'When you need market traction, our Boosting specialists execute go-to-market playbooks, high-conversion copywriting, paid campaigns, and developer advocacy sprints.'
    },
    {
      id: 'design-dev',
      stepNum: '03',
      badge: '03 // UI/UX DESIGN & APP DEVELOPMENT',
      title: 'Modern UI/UX & Turnkey App Development',
      subtitle: 'From pixel-perfect Figma design systems and clickable prototypes to production-grade full-stack MVP code engineered by senior developers.'
    }
  ];

  // Keep activeStepRef in sync with state
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // GSAP ScrollTrigger Pinning Setup
  useEffect(() => {
    const container = containerRef.current;
    const pinTarget = pinTargetRef.current;
    if (!container || !pinTarget) return;

    const mm = gsap.matchMedia();

    // On screens > 768px (Desktop and Laptops): Solid Pinning with Smooth Card Stacking
    mm.add('(min-width: 769px)', () => {
      const pinTrigger = ScrollTrigger.create({
        id: 'cg-client-journey-pin',
        trigger: container,
        pin: pinTarget,
        start: 'top top+=65', // Pin right below sticky navbar
        end: '+=2000',        // Pinned scroll runway
        scrub: 0.25,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Map progress [0, 1] to 3 cards (0, 1, 2)
          const p = self.progress;
          let step = 0;
          if (p < 0.33) step = 0;
          else if (p < 0.66) step = 1;
          else step = 2;

          if (step !== activeStepRef.current) {
            setActiveStep(step);
          }
        }
      });

      return () => {
        pinTrigger.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Jump to specific card and sync scroll position
  const handleStepClick = (index) => {
    setActiveStep(index);
    const st = ScrollTrigger.getById('cg-client-journey-pin');
    if (st) {
      // Position scroll near the center of the step's segment
      const targetProgress = (index + 0.35) / 3;
      const targetY = st.start + (st.end - st.start) * targetProgress;
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      ref={containerRef} 
      id="client-journey" 
      className="cg-journey-section-wrapper"
      aria-label="Client Experience Process Journey"
    >
      <div ref={pinTargetRef} className="cg-journey-pinned-container">
        <div className="cg-container">
          {/* Section Header with Step Navigation Tabs */}
          <div className="cg-journey-header">
            <div className="cg-journey-step-pill">
              <span className="cg-step-pill-dot" />
              <span>{steps[activeStep].badge}</span>
            </div>
            
            <h2 className="cg-journey-main-title">{steps[activeStep].title}</h2>
            <p className="cg-journey-main-subtitle">{steps[activeStep].subtitle}</p>

            {/* Interactive Step Selector Tabs */}
            <div className="cg-journey-tabs-bar" role="tablist">
              {steps.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStep === idx}
                  className={`cg-journey-tab-btn ${activeStep === idx ? 'is-active' : ''}`}
                  onClick={() => handleStepClick(idx)}
                >
                  <span className="cg-tab-num">{st.stepNum}</span>
                  <span className="cg-tab-label">
                    {idx === 0 && 'Client Portal'}
                    {idx === 1 && 'Boosting Channel'}
                    {idx === 2 && 'Design & App Dev'}
                  </span>
                  {activeStep === idx && <span className="cg-tab-indicator" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Display Stage */}
          <div className="cg-journey-stage">
            {/* CARD 1: The Client Views & Requests Leads */}
            <div className={`cg-journey-card ${activeStep === 0 ? 'card-active' : activeStep > 0 ? 'card-prev' : 'card-next'}`}>
              <div className="cg-window-chrome">
                <div className="cg-window-dots">
                  <span className="cg-window-dot red" />
                  <span className="cg-window-dot yellow" />
                  <span className="cg-window-dot green" />
                </div>
                <div className="cg-window-address">
                  <Search size={13} color="#2563EB" />
                  <span>app.creativegini.com/leads &mdash; Verified ICP Database</span>
                </div>
                <div className="cg-window-status">100% Human Verified</div>
              </div>

              <div className="cg-mockup-canvas">
                {/* Search & Intake Control Bar */}
                <div className="cg-leads-control-bar">
                  <div className="cg-leads-search-box">
                    <Search size={15} color="#6B7280" />
                    <span>Search 150+ verified prospects in healthcare, AI &amp; enterprise SaaS...</span>
                  </div>
                  <div className="cg-leads-actions-bar">
                    <span className="cg-filter-chip active">All Verified (150)</span>
                    <span className="cg-filter-chip">VP &amp; C-Level (82)</span>
                    <button type="button" className="cg-request-sprint-btn">
                      <Sparkles size={13} />
                      <span>+ Request New Lead Sprint</span>
                    </button>
                  </div>
                </div>

                {/* Verified Leads Table */}
                <div className="cg-card-panel" style={{ marginTop: '12px' }}>
                  <div className="cg-panel-header">
                    <div>
                      <span className="cg-panel-title">Delivered Prospects &mdash; Ticket CG-1024</span>
                      <span className="cg-panel-meta">50 Accounts verified by Lead Specialist &bull; European Expansion</span>
                    </div>
                    <button type="button" className="cg-export-btn">
                      <DownloadCloud size={13} />
                      <span>Export to CSV / CRM</span>
                    </button>
                  </div>

                  <div className="cg-mini-table-wrapper">
                    <table className="cg-mini-table leads-table">
                      <thead>
                        <tr>
                          <th>Lead Name &amp; Title</th>
                          <th>Company &amp; Industry</th>
                          <th>Location</th>
                          <th>Verified Corporate Email</th>
                          <th>LinkedIn Profile</th>
                          <th>Validation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>Sarah Jenkins</strong>
                            <div className="cg-sub-text">VP of Data Architecture</div>
                          </td>
                          <td>
                            <div>Snowflake Labs</div>
                            <div className="cg-sub-text">Enterprise Data Cloud</div>
                          </td>
                          <td>San Francisco, CA</td>
                          <td><code className="cg-email-pill">sarah.j@snowflakelabs.io</code></td>
                          <td><span className="cg-linkedin-link">linkedin.com/in/sarah-jenkins</span></td>
                          <td><span className="cg-status-pill completed"><Check size={11} /> Verified</span></td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Marcus Sterling</strong>
                            <div className="cg-sub-text">Chief Data Officer</div>
                          </td>
                          <td>
                            <div>Veloce Data</div>
                            <div className="cg-sub-text">AI Automation Infrastructure</div>
                          </td>
                          <td>London, UK</td>
                          <td><code className="cg-email-pill">marcus@velocedata.com</code></td>
                          <td><span className="cg-linkedin-link">linkedin.com/in/marcus-sterling</span></td>
                          <td><span className="cg-status-pill completed"><Check size={11} /> Verified</span></td>
                        </tr>
                        <tr>
                          <td>
                            <strong>Elena Rostov</strong>
                            <div className="cg-sub-text">Head of Cloud Infrastructure</div>
                          </td>
                          <td>
                            <div>NexaScale Global</div>
                            <div className="cg-sub-text">Cloud Migration &amp; Security</div>
                          </td>
                          <td>Berlin, Germany</td>
                          <td><code className="cg-email-pill">elena.r@nexascale.de</code></td>
                          <td><span className="cg-linkedin-link">linkedin.com/in/elena-rostov</span></td>
                          <td><span className="cg-status-pill completed"><Check size={11} /> Verified</span></td>
                        </tr>
                        <tr>
                          <td>
                            <strong>David Chen</strong>
                            <div className="cg-sub-text">VP of Engineering</div>
                          </td>
                          <td>
                            <div>Datacore Solutions</div>
                            <div className="cg-sub-text">Workflow Intelligence</div>
                          </td>
                          <td>Austin, TX</td>
                          <td><code className="cg-email-pill">dchen@datacoresolutions.com</code></td>
                          <td><span className="cg-linkedin-link">linkedin.com/in/david-chen</span></td>
                          <td><span className="cg-status-pill completed"><Check size={11} /> Verified</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: When the Client Requires Boosting */}
            <div className={`cg-journey-card ${activeStep === 1 ? 'card-active' : activeStep > 1 ? 'card-prev' : 'card-next'}`}>
              <div className="cg-window-chrome">
                <div className="cg-window-dots">
                  <span className="cg-window-dot red" />
                  <span className="cg-window-dot yellow" />
                  <span className="cg-window-dot green" />
                </div>
                <div className="cg-window-address">
                  <Sparkles size={13} color="#DB2777" />
                  <span>app.creativegini.com/boosting &mdash; Brand, Copy &amp; GTM Sprints</span>
                </div>
                <div className="cg-window-status">Human Marketing Specialists</div>
              </div>

              <div className="cg-mockup-canvas">
                {/* Channel Header Banner */}
                <div className="cg-boosting-header-banner">
                  <div>
                    <span className="cg-boosting-pill">BOOSTING CHANNEL</span>
                    <h3 className="cg-boosting-title">Active Sprints &amp; Deliverables</h3>
                    <p className="cg-boosting-desc">Strategic messaging, technical thought leadership, DevRel advocacy, and high-conversion assets.</p>
                  </div>
                  <button type="button" className="cg-boost-action-btn">
                    <span>+ New Boosting Request</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 4 Boosting Delivery Sprint Cards */}
                <div className="cg-boosting-grid">
                  <div className="cg-boost-item-card">
                    <div className="cg-boost-card-top">
                      <span className="cg-boost-ticket">CG-1018</span>
                      <span className="cg-status-pill completed">Deliverable Ready</span>
                    </div>
                    <h4 className="cg-boost-card-heading">Enterprise GTM Positioning &amp; Outbound Playbook</h4>
                    <p className="cg-boost-card-summary">Complete messaging audit, ICP value proposition matrix, and high-conversion outbound sequence templates.</p>
                    <div className="cg-boost-card-footer">
                      <div className="cg-specialist-chip">
                        <div className="cg-chip-avatar">BS</div>
                        <span>Growth Strategist</span>
                      </div>
                      <a href="#download" onClick={(e) => e.preventDefault()} className="cg-card-action-link">
                        <DownloadCloud size={13} />
                        <span>Download .PDF</span>
                      </a>
                    </div>
                  </div>

                  <div className="cg-boost-item-card">
                    <div className="cg-boost-card-top">
                      <span className="cg-boost-ticket">CG-1022</span>
                      <span className="cg-status-pill in-progress">In Production</span>
                    </div>
                    <h4 className="cg-boost-card-heading">Product Narrative &amp; Video Script (2 mins)</h4>
                    <p className="cg-boost-card-summary">Storyboard breakdown, voiceover script, and conversion hook designed for LinkedIn organic video marketing.</p>
                    <div className="cg-boost-card-footer">
                      <div className="cg-specialist-chip">
                        <div className="cg-chip-avatar" style={{ background: '#EC4899' }}>CC</div>
                        <span>Content Creator</span>
                      </div>
                      <span className="cg-delivery-eta">Delivery in 24 hrs</span>
                    </div>
                  </div>

                  <div className="cg-boost-item-card">
                    <div className="cg-boost-card-top">
                      <span className="cg-boost-ticket">CG-1027</span>
                      <span className="cg-status-pill review">Client Review</span>
                    </div>
                    <h4 className="cg-boost-card-heading">DevRel Technical Tutorial &amp; Quickstart Guide</h4>
                    <p className="cg-boost-card-summary">Hands-on developer walkthrough for cloud engineers, SDK setup examples, and open-source GitHub starter template.</p>
                    <div className="cg-boost-card-footer">
                      <div className="cg-specialist-chip">
                        <div className="cg-chip-avatar" style={{ background: '#0EA5E9' }}>DA</div>
                        <span>Developer Advocate</span>
                      </div>
                      <a href="#review" onClick={(e) => e.preventDefault()} className="cg-card-action-link">
                        <Eye size={13} />
                        <span>Review Draft</span>
                      </a>
                    </div>
                  </div>

                  <div className="cg-boost-item-card">
                    <div className="cg-boost-card-top">
                      <span className="cg-boost-ticket">CG-1031</span>
                      <span className="cg-status-pill completed">Completed</span>
                    </div>
                    <h4 className="cg-boost-card-heading">Landing Page UI &amp; Interactive Capability Calculator</h4>
                    <p className="cg-boost-card-summary">Interactive component mockup, modern light lavender aesthetic, and conversion-optimized hero layouts.</p>
                    <div className="cg-boost-card-footer">
                      <div className="cg-specialist-chip">
                        <div className="cg-chip-avatar" style={{ background: '#8B5CF6' }}>UX</div>
                        <span>UI/UX Designer</span>
                      </div>
                      <a href="#figma" onClick={(e) => e.preventDefault()} className="cg-card-action-link">
                        <ExternalLink size={13} />
                        <span>View Deliverables</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: UI/UX Design & Full-Stack App Development */}
            <div className={`cg-journey-card ${activeStep === 2 ? 'card-active' : activeStep > 2 ? 'card-prev' : 'card-next'}`}>
              <div className="cg-window-chrome">
                <div className="cg-window-dots">
                  <span className="cg-window-dot red" />
                  <span className="cg-window-dot yellow" />
                  <span className="cg-window-dot green" />
                </div>
                <div className="cg-window-address">
                  <Code size={13} color="#059669" />
                  <span>app.creativegini.com/development &mdash; Production UI &amp; App MVP Core</span>
                </div>
                <div className="cg-window-status">Production Ready</div>
              </div>

              <div className="cg-mockup-canvas">
                <div className="cg-dossier-layout">
                  {/* Left Column: Project Profile */}
                  <div className="cg-dossier-sidebar">
                    <div className="cg-dossier-account-header">
                      <div className="cg-account-logo-box" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>MVP</div>
                      <div>
                        <h4 className="cg-account-name">Acme Cloud Core</h4>
                        <span className="cg-account-industry">SaaS Platform &amp; Responsive Web App</span>
                      </div>
                    </div>

                    <div className="cg-dossier-meta-list">
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Tech Stack:</span>
                        <span className="cg-meta-val">React, Node, PostgreSQL</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Sprint Type:</span>
                        <span className="cg-meta-val">Full-Stack POC + V1 Build</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Deliverable:</span>
                        <span className="cg-meta-val">Clean GitHub Repo &amp; Live URL</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Status:</span>
                        <span className="cg-meta-val" style={{ color: '#059669', fontWeight: 700 }}>100% Shipped &amp; Verified</span>
                      </div>
                    </div>

                    <div className="cg-dossier-files-box">
                      <span className="cg-files-heading">Attached Deliverable Files</span>
                      <div className="cg-file-item">
                        <FileText size={14} color="#0284C7" />
                        <div className="cg-file-info">
                          <span className="cg-file-name">figma-design-system-v2.fig</span>
                          <span className="cg-file-sz">42 MB &bull; Design Tokens</span>
                        </div>
                        <DownloadCloud size={13} className="cg-file-dl" />
                      </div>
                      <div className="cg-file-item">
                        <FileText size={14} color="#059669" />
                        <div className="cg-file-info">
                          <span className="cg-file-name">production-mvp-repo.zip</span>
                          <span className="cg-file-sz">12.4 MB &bull; Clean Code</span>
                        </div>
                        <DownloadCloud size={13} className="cg-file-dl" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Deliverable Telemetry & Milestone Verification */}
                  <div className="cg-dossier-main">
                    <div className="cg-panel-header">
                      <div>
                        <span className="cg-panel-title">Specialist Architecture &amp; Deliverable Telemetry</span>
                        <span className="cg-panel-meta">Production-ready design assets, OpenAPI contracts, and full source code</span>
                      </div>
                      <span className="cg-status-pill completed">100% Deployed</span>
                    </div>

                    <div className="cg-people-cards-list">
                      <div className="cg-person-row">
                        <div className="cg-person-avatar" style={{ background: '#0284C7' }}>UI</div>
                        <div className="cg-person-details">
                          <div className="cg-person-name-row">
                            <strong>Elena Vance</strong>
                            <span className="cg-role-badge champion">Senior UI/UX Architect</span>
                          </div>
                          <div className="cg-person-reach">
                            <code>Figma Component Library &bull; Auto-Layout Specs</code>
                            <span>&bull; Design System Verified</span>
                          </div>
                          <p className="cg-person-insight">"Complete high-converting design system, interactive prototypes, and responsive mobile layouts engineered for rapid developer implementation."</p>
                        </div>
                      </div>

                      <div className="cg-person-row">
                        <div className="cg-person-avatar" style={{ background: '#059669' }}>DEV</div>
                        <div className="cg-person-details">
                          <div className="cg-person-name-row">
                            <strong>David Chen</strong>
                            <span className="cg-role-badge decision-maker">Full-Stack Lead Engineer</span>
                          </div>
                          <div className="cg-person-reach">
                            <code>Clean Architecture &bull; Docker &bull; CI/CD Pipelines</code>
                            <span>&bull; Automated Tests Passing</span>
                          </div>
                          <p className="cg-person-insight">"Full-stack MVP application core built with modular database schemas, JWT authentication engine, and interactive Swagger API documentation."</p>
                        </div>
                      </div>
                    </div>

                    <div className="cg-recommendation-box">
                      <Sparkles size={15} color="#059669" />
                      <div>
                        <strong>CreativeGini Production Handoff:</strong>
                        <span> Source code deployed to staging, database migrations verified, and repository ownership transferred seamlessly to client.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Progress Indicator (Buttons Removed) */}
          <div className="cg-journey-footer-controls">
            <div className="cg-journey-scroll-pill">
              <span className="cg-journey-scroll-indicator-text">
                Step {steps[activeStep].stepNum} of 03 &bull; Scroll to explore next process
              </span>
              <div className="cg-journey-dots-indicator">
                {steps.map((st, i) => (
                  <button
                    key={st.id}
                    type="button"
                    aria-label={`Jump to step ${i + 1}`}
                    className={`cg-journey-dot ${activeStep === i ? 'is-active' : ''}`}
                    onClick={() => handleStepClick(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
