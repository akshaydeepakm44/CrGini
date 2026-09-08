import React, { useState } from 'react';
import { Shield, Sparkles, Cpu, Layers, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function PodSquadSection() {
  const [activeRole, setActiveRole] = useState(0);

  const roles = [
    {
      id: '01',
      tag: 'Strategic Core',
      title: 'Strategist Planner',
      subtitle: 'Market Intelligence & Growth Funnel Architecture',
      desc: 'Plans and directs omnichannel growth strategies to maximize product and brand visibility. Uncovers market whitespace, tracks competitor moves, maps high-intent audience funnels, and synthesizes data-backed content roadmaps using frontier AI reasoning models.',
      responsibilities: [
        'Conduct in-depth product, competitor, and market opportunity research using AI semantic intelligence.',
        'Architect multi-stage growth funnels, content roadmaps, and audience positioning frameworks.',
        'Formulate actionable growth hypotheses and perform continuous KPI & engagement analytics.',
        'Synthesize complex market trends into executable creative briefs for the AI Creative Designer.',
        'Deploy AI tools for predictive audience modeling, sentiment tracking, and cross-channel campaign planning.',
      ],
      amplification: [
        'Identifies high-leverage market opportunities 10x faster than traditional research methods.',
        'Ensures zero wasted creative budget by aligning every asset with targeted buyer intent.',
        'Maintains an unbroken pipeline of topical authority content across all priority channels.',
        'Provides executive clarity through continuous weekly growth and impression telemetry.',
      ],
      toolchain: ['DeepSeek-R1', 'Claude 3.7 Sonnet', 'Perplexity Pro', 'Notion AI', 'Gartner/Statista AI Scraping'],
      deliverables: ['Omnichannel Growth Blueprints', 'ICP Persona Matrix', 'Competitive Intelligence Reports', 'Viral Content Calendars'],
    },
    {
      id: '02',
      tag: 'Visual & Motion Engine',
      title: 'AI Creative Designer',
      subtitle: 'Generative SaaS Motion Visuals & Multimodal Content',
      desc: 'Deploys high-resolution diffusion models, vector motion loops, and cinematic rendering pipelines to create high-converting visual assets, SaaS walkthroughs, and branded motion content.',
      responsibilities: [
        'Generate high-fidelity motion graphics, product walkthroughs, and visual lore.',
        'Fine-tune Flux.1, Luma, and Kling AI weights for 100% brand style consistency.',
        'Transform strategic briefs into multi-format carousel, image, and video outputs.',
        'Maintain dynamic visual state graphs across all active digital distribution hubs.',
      ],
      amplification: [
        'Accelerates video & motion production by 20x compared to traditional agency timelines.',
        'Enforces pixel-perfect brand alignment across 100+ monthly generative assets.',
        'Eliminates design bottlenecks with instant AI multi-modal rendering.',
      ],
      toolchain: ['Flux.1 Pro', 'Kling AI', 'Luma Dream Machine', 'Runway Gen-3', 'Midjourney v6'],
      deliverables: ['SaaS Motion Walkthroughs', 'Interactive Product Carousels', 'Brand Lore Visual Assets', 'Omnichannel Ad Creatives'],
    },
    {
      id: '03',
      tag: 'Audience Network',
      title: 'DevRel & Community Lead',
      subtitle: 'Omnichannel Advocacy, Tech Networking & Viral Reach',
      desc: 'Broadcasts high-authority content across developer networks, social channels, tech Twitter, and Discord hubs with active discussion loops, community seeding, and organic engagement amplification.',
      responsibilities: [
        'Deploy content across LinkedIn, X/Twitter, YouTube, Discord, and AI search indexes.',
        'Nurture developer communities, seed technical discussions, and engage target ICPs.',
        'Monitor comment sentiment and loop feedback into real-time prompt optimization.',
        'Expand organic reach and developer advocacy with zero bot spillage.',
      ],
      amplification: [
        'Surges organic reach by +480% through targeted multi-channel distribution.',
        'Builds genuine developer trust with zero bot spillage and authentic technical dialogue.',
        'Establishes permanent brand indexing across AI search tools like Perplexity.',
      ],
      toolchain: ['OpenTelemetry', 'Discord AI Bots', 'Typefully', 'Taplio', 'Perplexity Indexer'],
      deliverables: ['Developer Advocacy Threads', 'Community Engagement Reports', 'Viral Social Broadcasts', 'AI Search Index Feeds'],
    },
  ];

  const currentRole = roles[activeRole];

  return (
    <section className="glass-section" id="pod-squad">
      <div className="section-container">
        <div className="section-tag">Full-Stack Collaborative AI POD Structure</div>
        <h2 className="section-title">The Dedicated Creative AI POD Squad</h2>
        <p className="section-desc">
          Every CreativeGini deployment pairs autonomous multi-agent pipelines with a dedicated 3-member deep-tech creative POD, driving continuous strategic iteration, generative visual production, and omnichannel community expansion.
        </p>

        <div className="pod-lab-subtext">
          <Shield size={14} className="lab-icon" /> Operating out of DATAi2i’s Vizag Applied AI Lab with private enterprise infrastructure. <span className="lab-badge">Active Cohorts 2026</span>
        </div>

        {/* 3-Role Cards Overview Grid */}
        <div className="role-cards-grid">
          {roles.map((role, idx) => (
            <div
              key={role.id}
              className={`glass-card role-overview-card ${activeRole === idx ? 'active-role-card' : ''}`}
              onClick={() => setActiveRole(idx)}
            >
              <div className="role-card-header">
                <span className="role-num-badge">0{idx + 1}</span>
                <span className="role-tag-pill">{role.tag}</span>
              </div>
              <h3 className="role-card-title">{role.title}</h3>
              <p className="role-card-subtitle">{role.subtitle}</p>
              <button className="role-blueprint-link">
                View Role Blueprint &rarr;
              </button>
            </div>
          ))}
        </div>

        {/* Selected Role Detailed Deep-Dive Card */}
        <div className="glass-card role-detail-card">
          <div className="role-detail-header">
            <div>
              <span className="role-badge-pill">ROLE {currentRole.id} • {currentRole.tag}</span>
              <h3 className="role-detail-title">{currentRole.title}</h3>
              <p className="role-detail-subtitle">{currentRole.subtitle}</p>
            </div>
            <a
              href="https://www.datai2i.com/contact?service=CreativeGini+POD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary role-deploy-btn"
            >
              Deploy this POD Capability <ExternalLink size={14} />
            </a>
          </div>

          <p className="role-main-desc">{currentRole.desc}</p>

          <div className="role-grid-details">
            {/* Responsibilities */}
            <div className="role-col">
              <h4 className="detail-col-title"><Cpu size={16} /> Core POD Responsibilities</h4>
              <ul className="bullet-list">
                {currentRole.responsibilities.map((item, idx) => (
                  <li key={idx}><CheckCircle2 size={15} className="check-icon" /> <span>{item}</span></li>
                ))}
              </ul>
            </div>

            {/* Reach Amplification */}
            <div className="role-col">
              <h4 className="detail-col-title"><Sparkles size={16} /> Presence & Reach Amplification</h4>
              <ul className="bullet-list highlight-list">
                {currentRole.amplification.map((item, idx) => (
                  <li key={idx}><CheckCircle2 size={15} className="check-icon-purple" /> <span>{item}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Integrated AI Toolchain & Deliverables */}
          <div className="role-footer-box">
            <div className="toolchain-box">
              <span className="box-label"><Layers size={14} /> Integrated AI Toolchain:</span>
              <div className="tags-flex">
                {currentRole.toolchain.map((tool, idx) => (
                  <span className="tool-tag" key={idx}>{tool}</span>
                ))}
              </div>
            </div>

            <div className="deliverables-box">
              <span className="box-label">Key Weekly Deliverables:</span>
              <div className="tags-flex">
                {currentRole.deliverables.map((item, idx) => (
                  <span className="deliverable-tag" key={idx}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
