import React from 'react';
import { Search, Compass, PenTool, TrendingUp, Palette, Terminal, Award } from 'lucide-react';

const SPECIALISTS = [
  {
    role: 'Lead Discovery Specialists',
    category: 'Lead Discovery',
    initials: 'LD',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    textColor: '#FFFFFF',
    desc: 'B2B domain researchers specializing in boolean queries, ICP filtering, and verified executive contact discovery.',
    tags: ['Verified Emails', 'ICP Mapping', 'Domain Telemetry']
  },
  {
    role: 'Company Intelligence Analysts',
    category: 'Company Studies',
    initials: 'CA',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    textColor: '#FFFFFF',
    desc: 'Deep account researchers analyzing revenue profiles, org structures, technology vendor stacks, and growth initiatives.',
    tags: ['Account Dossiers', 'Tech Stack Audit', 'Competitive Matrix']
  },
  {
    role: 'Key People & Committee Mappers',
    category: 'Org Intelligence',
    initials: 'KP',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    textColor: '#FFFFFF',
    desc: 'Specialists mapping internal enterprise decision trees, procurement champions, and VP/C-level stakeholders.',
    tags: ['Buying Committees', 'C-Suite Profiles', 'Direct Dial Verification']
  },
  {
    role: 'Pitch & Presentation Strategists',
    category: 'Pitch Support',
    initials: 'PS',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    textColor: '#FFFFFF',
    desc: 'Strategic analysts crafting data-backed competitive battlecards, executive decks, and bespoke pitch research.',
    tags: ['Pitch Dossiers', 'Win-Loss Analysis', 'Sales Decks']
  },
  {
    role: 'Executive Contact Verification Ops',
    category: 'Data Quality',
    initials: 'VQ',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    textColor: '#FFFFFF',
    desc: 'Data hygiene specialists conducting dual-layer SMTP ping validation, domain MX records checks, and phone verification.',
    tags: ['Zero Bounce Rate', 'SMTP Validation', 'Phone Screening']
  },
  {
    role: 'Research Workspace Directors',
    category: 'Delivery',
    initials: 'RD',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#FFFFFF',
    desc: 'Senior project leads coordinating live research sprints, client revisions, and on-time portal deliverable releases.',
    tags: ['Sprint Coordination', 'SLA Guarantee', 'QA Review']
  }
];

export default function SpecialistSection() {
  return (
    <section id="specialists" className="cg-section" aria-label="Human Specialists Behind DizitalGini">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Human Specialist Network</span>
          <h2 className="cg-section-title">Specialists behind every project</h2>
          <p className="cg-section-subtitle">
            Behind every DiziGini deliverable is a dedicated team of human domain experts, research analysts, and company intelligence specialists — zero synthetic hallucinations.
          </p>
        </div>

        <div className="cg-specialists-grid">
          {SPECIALISTS.map((spec) => (
            <div key={spec.role} className="cg-specialist-card">
              <div 
                className="cg-specialist-avatar"
                style={{ background: spec.gradient, color: spec.textColor }}
              >
                {spec.initials}
              </div>

              <div className="cg-specialist-info">
                <div className="cg-specialist-category">{spec.category}</div>
                <h3 className="cg-specialist-role">{spec.role}</h3>
                <p className="cg-specialist-desc">{spec.desc}</p>
                
                <div className="cg-specialist-tags">
                  {spec.tags.map((tag) => (
                    <span key={tag} className="cg-specialist-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
