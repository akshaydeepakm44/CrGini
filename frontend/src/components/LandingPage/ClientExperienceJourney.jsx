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

gsap.registerPlugin(ScrollTrigger);

export default function ClientExperienceJourney({ onExplorePlatform, onExploreService }) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const pinTargetRef = useRef(null);
  const activeStepRef = useRef(0);

  const steps = [
    {
      id: 'overview',
      stepNum: '01',
      badge: '01 // WORKSPACE OVERVIEW',
      title: 'Everything in one place.',
      subtitle: 'The client logs into a unified workspace. Review active tickets, track deliverables, explore services, and view real-time account status without messy email chains.'
    },
    {
      id: 'leads',
      stepNum: '02',
      badge: '02 // LEAD RESEARCH & DISCOVERY',
      title: 'The Client Views & Requests Leads',
      subtitle: 'Request bespoke prospect lists in minutes. Filter by industry, tech stack, and seniority. Every contact is human-verified with direct work emails and LinkedIn profiles.'
    },
    {
      id: 'boosting',
      stepNum: '03',
      badge: '03 // BRAND & GROWTH BOOSTING',
      title: 'When the Client Requires Boosting',
      subtitle: 'When you need market traction, our Boosting specialists execute go-to-market playbooks, high-conversion copywriting, paid campaigns, and developer advocacy sprints.'
    },
    {
      id: 'digitalising',
      stepNum: '04',
      badge: '04 // BUSINESS INTELLIGENCE & DIGITALISATION',
      title: 'Digitalising Market Intelligence & Org Insights',
      subtitle: 'Deep organizational studies and executive mapping. Understand target company hierarchies, technology vendor footprints, and buying committees before pitching.'
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
          // Map progress [0, 1] to 4 cards (0, 1, 2, 3)
          const p = self.progress;
          let step = 0;
          if (p < 0.25) step = 0;
          else if (p < 0.50) step = 1;
          else if (p < 0.75) step = 2;
          else step = 3;

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
      const targetProgress = (index + 0.35) / 4;
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
                    {idx === 0 && 'Workspace Overview'}
                    {idx === 1 && 'Request Leads'}
                    {idx === 2 && 'Boosting Services'}
                    {idx === 3 && 'Digitalising Intel'}
                  </span>
                  {activeStep === idx && <span className="cg-tab-indicator" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Display Stage */}
          <div className="cg-journey-stage">
            {/* CARD 1: Everything in One Place (Dashboard Mockup from Reference Image) */}
            <div className={`cg-journey-card ${activeStep === 0 ? 'card-active' : activeStep > 0 ? 'card-prev' : 'card-next'}`}>
              <div className="cg-window-chrome">
                <div className="cg-window-dots">
                  <span className="cg-window-dot red" />
                  <span className="cg-window-dot yellow" />
                  <span className="cg-window-dot green" />
                </div>
                <div className="cg-window-address">
                  <ShieldCheck size={13} color="#7C3AED" />
                  <span>app.creativegini.com/dashboard &mdash; Acme Corporation</span>
                </div>
                <div className="cg-window-status">Live Workspace</div>
              </div>

              <div className="cg-mockup-canvas">
                {/* Greeting Hero Banner */}
                <div className="cg-card-hero-banner">
                  <div className="cg-card-hero-text">
                    <span className="cg-card-hero-greeting">Good morning,</span>
                    <h3 className="cg-card-hero-company">Acme Corporation</h3>
                    <p className="cg-card-hero-sub">Here's what's happening with your CreativeGini account.</p>
                  </div>
                  <div className="cg-card-hero-tag">
                    <Sparkles size={14} />
                    <span>Your Growth, Our Priority</span>
                  </div>
                </div>

                {/* 4 Metric Status Cards */}
                <div className="cg-card-metrics-grid">
                  <div className="cg-card-stat purple">
                    <div className="cg-card-stat-header">
                      <FolderGit2 size={15} />
                      <span className="cg-card-stat-num">5</span>
                    </div>
                    <div className="cg-card-stat-name">Active Requests</div>
                    <div className="cg-card-stat-delta">↑ 2 from last month</div>
                  </div>

                  <div className="cg-card-stat green">
                    <div className="cg-card-stat-header">
                      <CheckCircle2 size={15} />
                      <span className="cg-card-stat-num">12</span>
                    </div>
                    <div className="cg-card-stat-name">Completed</div>
                    <div className="cg-card-stat-delta">↑ 4 from last month</div>
                  </div>

                  <div className="cg-card-stat blue">
                    <div className="cg-card-stat-header">
                      <ShieldCheck size={15} />
                      <span className="cg-card-stat-num">8</span>
                    </div>
                    <div className="cg-card-stat-name">Verified / Approved</div>
                    <div className="cg-card-stat-delta">↑ 3 from last month</div>
                  </div>

                  <div className="cg-card-stat coral">
                    <div className="cg-card-stat-header">
                      <Clock size={15} />
                      <span className="cg-card-stat-num">3</span>
                    </div>
                    <div className="cg-card-stat-name">Pending Payment</div>
                    <div className="cg-card-stat-delta">↓ 1 from last month</div>
                  </div>
                </div>

                {/* Split Content: Active Requests & Quick Actions */}
                <div className="cg-card-split-grid">
                  <div className="cg-card-panel">
                    <div className="cg-panel-header">
                      <span className="cg-panel-title">My Active Requests</span>
                      <span className="cg-panel-link">View All →</span>
                    </div>
                    <div className="cg-mini-table-wrapper">
                      <table className="cg-mini-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Title</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="cg-ticket-cell">CG-1025</td>
                            <td>Lead Research</td>
                            <td>Healthcare Leads - US</td>
                            <td><span className="cg-status-pill in-progress">In Progress</span></td>
                          </tr>
                          <tr>
                            <td className="cg-ticket-cell">CG-1024</td>
                            <td>Strategic Plan</td>
                            <td>Growth Strategy Plan</td>
                            <td><span className="cg-status-pill review">Client Review</span></td>
                          </tr>
                          <tr>
                            <td className="cg-ticket-cell">CG-1023</td>
                            <td>Company Study</td>
                            <td>Competitor Analysis</td>
                            <td><span className="cg-status-pill completed">Completed</span></td>
                          </tr>
                          <tr>
                            <td className="cg-ticket-cell">CG-1022</td>
                            <td>Content Creation</td>
                            <td>Product Video (2 mins)</td>
                            <td><span className="cg-status-pill in-progress">In Progress</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="cg-card-panel">
                    <div className="cg-panel-header">
                      <span className="cg-panel-title">Quick Actions</span>
                    </div>
                    <div className="cg-quick-actions-list">
                      <div className="cg-action-item">
                        <div className="cg-action-icon purple"><FolderGit2 size={15} /></div>
                        <div className="cg-action-info">
                          <span className="cg-action-title">Request a Service</span>
                          <span className="cg-action-desc">Start a new scoped request</span>
                        </div>
                        <ChevronRight size={13} className="cg-action-arrow" />
                      </div>
                      <div className="cg-action-item">
                        <div className="cg-action-icon blue"><Search size={15} /></div>
                        <div className="cg-action-info">
                          <span className="cg-action-title">View Leads</span>
                          <span className="cg-action-desc">Explore verified company leads</span>
                        </div>
                        <ChevronRight size={13} className="cg-action-arrow" />
                      </div>
                      <div className="cg-action-item">
                        <div className="cg-action-icon pink"><Building2 size={15} /></div>
                        <div className="cg-action-info">
                          <span className="cg-action-title">View Company Study</span>
                          <span className="cg-action-desc">Access study reports &amp; dossiers</span>
                        </div>
                        <ChevronRight size={13} className="cg-action-arrow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: The Client Views & Requests Leads */}
            <div className={`cg-journey-card ${activeStep === 1 ? 'card-active' : activeStep > 1 ? 'card-prev' : 'card-next'}`}>
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

            {/* CARD 3: When the Client Requires Boosting */}
            <div className={`cg-journey-card ${activeStep === 2 ? 'card-active' : activeStep > 2 ? 'card-prev' : 'card-next'}`}>
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

            {/* CARD 4: Digitalising Market Intelligence & Org Insights */}
            <div className={`cg-journey-card ${activeStep === 3 ? 'card-active' : activeStep > 3 ? 'card-prev' : 'card-next'}`}>
              <div className="cg-window-chrome">
                <div className="cg-window-dots">
                  <span className="cg-window-dot red" />
                  <span className="cg-window-dot yellow" />
                  <span className="cg-window-dot green" />
                </div>
                <div className="cg-window-address">
                  <Building2 size={13} color="#7C3AED" />
                  <span>app.creativegini.com/digitalising &mdash; Account Dossiers &amp; Org Mapping</span>
                </div>
                <div className="cg-window-status">Company Intelligence</div>
              </div>

              <div className="cg-mockup-canvas">
                <div className="cg-dossier-layout">
                  {/* Left Column: Target Account Profile */}
                  <div className="cg-dossier-sidebar">
                    <div className="cg-dossier-account-header">
                      <div className="cg-account-logo-box">NS</div>
                      <div>
                        <h4 className="cg-account-name">NexaScale Global</h4>
                        <span className="cg-account-industry">Cloud &amp; DevOps Infrastructure</span>
                      </div>
                    </div>

                    <div className="cg-dossier-meta-list">
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Headquarters:</span>
                        <span className="cg-meta-val">Berlin, Germany</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Headcount:</span>
                        <span className="cg-meta-val">450 &mdash; 600 Employees</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Tech Stack:</span>
                        <span className="cg-meta-val">AWS, Snowflake, K8s</span>
                      </div>
                      <div className="cg-meta-row">
                        <span className="cg-meta-lbl">Buying Stage:</span>
                        <span className="cg-meta-val" style={{ color: '#10B981', fontWeight: 700 }}>Active RFP / High Intent</span>
                      </div>
                    </div>

                    <div className="cg-dossier-files-box">
                      <span className="cg-files-heading">Attached Deliverable Files</span>
                      <div className="cg-file-item">
                        <FileText size={14} color="#7C3AED" />
                        <div className="cg-file-info">
                          <span className="cg-file-name">nexascale-dossier-v2.pdf</span>
                          <span className="cg-file-sz">1.8 MB &bull; Verified</span>
                        </div>
                        <DownloadCloud size={13} className="cg-file-dl" />
                      </div>
                      <div className="cg-file-item">
                        <FileText size={14} color="#2563EB" />
                        <div className="cg-file-info">
                          <span className="cg-file-name">org-decision-makers.xlsx</span>
                          <span className="cg-file-sz">840 KB &bull; Verified</span>
                        </div>
                        <DownloadCloud size={13} className="cg-file-dl" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key People & Buying Committee Mapping */}
                  <div className="cg-dossier-main">
                    <div className="cg-panel-header">
                      <div>
                        <span className="cg-panel-title">Buying Committee &amp; Key People Telemetry</span>
                        <span className="cg-panel-meta">Direct verified contacts for enterprise outreach</span>
                      </div>
                      <span className="cg-status-pill completed">100% Validated</span>
                    </div>

                    <div className="cg-people-cards-list">
                      <div className="cg-person-row">
                        <div className="cg-person-avatar">CTO</div>
                        <div className="cg-person-details">
                          <div className="cg-person-name-row">
                            <strong>Dr. Klaus Weber</strong>
                            <span className="cg-role-badge decision-maker">Chief Technology Officer</span>
                          </div>
                          <div className="cg-person-reach">
                            <code>klaus.weber@nexascale.de</code>
                            <span>&bull; Direct Phone: +49 30 555-0192</span>
                          </div>
                          <p className="cg-person-insight">"Overseeing multi-region sovereignty cloud migrations. Currently reviewing enterprise data workflow automation."</p>
                        </div>
                      </div>

                      <div className="cg-person-row">
                        <div className="cg-person-avatar" style={{ background: '#3B82F6' }}>VP</div>
                        <div className="cg-person-details">
                          <div className="cg-person-name-row">
                            <strong>Elena Rostov</strong>
                            <span className="cg-role-badge champion">Head of Cloud Infrastructure</span>
                          </div>
                          <div className="cg-person-reach">
                            <code>elena.r@nexascale.de</code>
                            <span>&bull; LinkedIn Profile Verified</span>
                          </div>
                          <p className="cg-person-insight">"Primary technical champion evaluating API response times, latency, and compliance benchmarks."</p>
                        </div>
                      </div>
                    </div>

                    <div className="cg-recommendation-box">
                      <Sparkles size={15} color="#7C3AED" />
                      <div>
                        <strong>CreativeGini Strategic Recommendation:</strong>
                        <span> Focus outreach on European data sovereignty and automated pipeline orchestration. Contact Dr. Weber directly on Tuesday mornings.</span>
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
                Step {steps[activeStep].stepNum} of 04 &bull; Scroll to explore next process
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
