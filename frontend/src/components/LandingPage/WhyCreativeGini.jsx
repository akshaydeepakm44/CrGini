import React from 'react';
import { Users2, CheckSquare2, Layers3, LineChart } from 'lucide-react';

const VALUE_PROPS = [
  {
    icon: Users2,
    title: 'Human Specialists',
    desc: 'Experienced research analysts, tech copywriters, and GTM operators executing your requests — no generic hallucinated AI output.'
  },
  {
    icon: CheckSquare2,
    title: 'Clear Deliverables',
    desc: 'Transparent deliverables with defined acceptance criteria, verifiable spreadsheet databases, and clear sprint deadlines.'
  },
  {
    icon: Layers3,
    title: 'One Place for Every Request',
    desc: 'Consolidate multiple agencies into one unified platform. Move from market research to content creation to DevRel seamlessly.'
  },
  {
    icon: LineChart,
    title: 'Research-Driven Growth',
    desc: 'Every marketing channel, outbound sequence, and strategic decision is backed by verified company intelligence and real market data.'
  }
];

export default function WhyCreativeGini() {
  return (
    <section id="why-us" className="cg-section" aria-label="Why Choose CreativeGini">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">Why CreativeGini</span>
          <h2 className="cg-section-title">Built for Founders and Growth Leaders Who Value Precision</h2>
          <p className="cg-section-subtitle">
            We replaced bloated retainer agencies and chaotic freelance boards with a transparent, sprint-based service delivery platform.
          </p>
        </div>

        <div className="cg-why-grid">
          {VALUE_PROPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="cg-why-card">
                <div className="cg-why-icon-wrap">
                  <Icon size={22} />
                </div>
                <h3 className="cg-why-title">{item.title}</h3>
                <p className="cg-why-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
