import React from 'react';
import { Search, Compass, PenTool, TrendingUp, Palette, Terminal, Award } from 'lucide-react';

const SPECIALISTS = [
  {
    role: 'Lead & ICP Researchers',
    category: 'Research',
    initials: 'LR',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    textColor: '#FFFFFF',
    desc: 'B2B domain researchers specializing in boolean search, org chart mapping, and high-intent prospect verification.',
    tags: ['Verified Emails', 'ICP Mapping', 'Org Intelligence']
  },
  {
    role: 'Strategic Growth Planners',
    category: 'Strategy',
    initials: 'SP',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    textColor: '#FFFFFF',
    desc: 'Senior GTM operators and positioning strategists crafting actionable outbound narratives and quarterly plans.',
    tags: ['GTM Playbooks', 'Competitive Audit', 'Outbound Sequences']
  },
  {
    role: 'Technical & Narrative Writers',
    category: 'Content',
    initials: 'CW',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#FFFFFF',
    desc: 'Expert tech copywriters translating complex software value into high-converting sales collateral and thought leadership.',
    tags: ['Whitepapers', 'Case Studies', 'Executive Copy']
  },
  {
    role: 'Multi-Channel Marketers',
    category: 'Growth',
    initials: 'GM',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    textColor: '#FFFFFF',
    desc: 'Growth marketers optimizing multi-touch demand gen channels, paid acquisition pilots, and email deliverability.',
    tags: ['Demand Gen', 'Paid Pilots', 'Conversion Audits']
  },
  {
    role: 'Product & Brand Designers',
    category: 'Design',
    initials: 'PD',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    textColor: '#FFFFFF',
    desc: 'UI/UX and brand artisans crafting pixel-perfect landing page mockups, visual assets, and investor pitch decks.',
    tags: ['Landing UI', 'Pitch Decks', 'Design Systems']
  },
  {
    role: 'Developer Advocates',
    category: 'DevRel',
    initials: 'DR',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    textColor: '#FFFFFF',
    desc: 'Engineers who build community traction, documentation reviews, technical tutorials, and developer outreach.',
    tags: ['API Docs', 'Technical Demos', 'Open Source Outreach']
  }
];

export default function SpecialistSection() {
  return (
    <section id="specialists" className="cg-section" aria-label="Human Specialists Behind CreativeGini">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Human Specialist Network</span>
          <h2 className="cg-section-title">Specialists behind every project</h2>
          <p className="cg-section-subtitle">
            Behind every CreativeGini deliverable is a dedicated team of human domain experts, research analysts, and creative directors — zero synthetic hallucinations.
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
