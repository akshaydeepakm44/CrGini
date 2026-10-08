import React from 'react';
import { MousePointerClick, FileText, Users, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Choose a service',
    desc: 'Select from our curated menu of Boosting or Digitalising services based on your immediate growth goals.',
    icon: MousePointerClick
  },
  {
    number: '02',
    title: 'Tell us what you need',
    desc: 'Submit your requirements, ICP criteria, target industries, or creative brief through our intuitive intake wizard.',
    icon: FileText
  },
  {
    number: '03',
    title: 'Our specialist team works on it',
    desc: 'Dedicated human research analysts and growth marketers execute your request with rigorous quality checks.',
    icon: Users
  },
  {
    number: '04',
    title: 'Review and receive deliverables',
    desc: 'Access verified spreadsheets, dossiers, or creative files directly in your portal. Request revisions or scale up with 1-click.',
    icon: CheckCircle
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="cg-section" aria-label="How CreativeGini Works">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Simple 4-Step Process</span>
          <h2 className="cg-section-title">How It Works</h2>
          <p className="cg-section-subtitle">
            From initial scoping to verified deliverable handoff, our streamlined process removes friction and agency bloat.
          </p>
        </div>

        <div className="cg-how-it-works-steps">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="cg-step-card">
                <div className="cg-step-number">{step.number}</div>
                <div className="cg-step-icon-wrap">
                  <Icon size={22} />
                </div>
                <h3 className="cg-step-title">{step.title}</h3>
                <p className="cg-step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
