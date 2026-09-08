import React, { useState } from 'react';
import { ArrowRight, Activity, Code, Eye, RefreshCw, Radio } from 'lucide-react';

export default function PipelineSection() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      phase: 'PHASE 01',
      title: 'Signal Ingestion & Trend Radar',
      actor: 'Strategist Planner + AI Crawlers',
      icon: Radio,
      desc: 'Monitors real-time search trends, industry discussions, competitor gaps, and algorithmic shifts to pinpoint high-leverage growth opportunities.',
      nodeDetails: 'Node 01: Multi-source Scraping & Semantic Clustering Active. Extracts keyword velocity and intent vectors 24/7.',
    },
    {
      phase: 'PHASE 02',
      title: 'Strategic Funnel & Intent Architecture',
      actor: 'Strategist Planner',
      icon: Activity,
      desc: 'Formulates multi-channel conversion roadmaps, narrative frameworks, and structured creative briefs optimized for target personas.',
      nodeDetails: 'Node 02: Narrative Graph Generation & ICP Funnel Mapping. Produces structured JSON creative briefs for diffusion engines.',
    },
    {
      phase: 'PHASE 03',
      title: 'Generative Motion & Visual Synthesis',
      actor: 'AI Creative Designer',
      icon: Eye,
      desc: 'Deploys diffusion models and motion rendering pipelines to produce high-impact SaaS walkthroughs, concept graphics, and cinematic video assets.',
      nodeDetails: 'Node 03: Multi-modal Rendering Loop (Flux.1 / Kling / Luma). Enforces 100% brand voice & visual consistency.',
    },
    {
      phase: 'PHASE 04',
      title: 'Omnichannel Infiltration & DevRel',
      actor: 'DevRel & Community Lead',
      icon: Code,
      desc: 'Broadcasts content across developer networks, social channels, and private forums with active discussion loops and community seeding.',
      nodeDetails: 'Node 04: Multi-channel Dispatcher & Developer Hub Seeding. Distributes assets across X, LinkedIn, Discord & YouTube.',
    },
    {
      phase: 'PHASE 05',
      title: 'Continuous Telemetry & Prompt Feedback',
      actor: 'Autonomous Feedback Loop',
      icon: RefreshCw,
      desc: 'Tracks impression velocity, engagement rate, and inbound conversions in real-time, self-tuning future prompts and creative strategies.',
      nodeDetails: 'Node 05: Closed-Loop Telemetry & Prompt Self-Tuning. OpenTelemetry tracing optimizes subsequent campaign prompts.',
    },
  ];

  return (
    <section className="glass-section" id="pipeline">
      <div className="section-container">
        <div className="section-tag">Logical Execution Flow</div>
        <h2 className="section-title">The CreativeGini Autonomous Pipeline</h2>
        <p className="section-desc">
          How CreativeGini transforms raw brand signals into omnichannel domination through continuous closed-loop state machines.
        </p>

        {/* Organized 5-Phase Horizontal / Grid Stepper */}
        <div className="pipeline-stepper-grid">
          {phases.map((item, idx) => {
            const IconComp = item.icon;
            const isActive = activePhase === idx;
            return (
              <div
                key={idx}
                className={`glass-card pipeline-card ${isActive ? 'active-pipeline-card' : ''}`}
                onClick={() => setActivePhase(idx)}
              >
                <div className="pipeline-card-top">
                  <span className="pipeline-phase-badge">{item.phase}</span>
                  <div className="pipeline-icon-circle">
                    <IconComp size={16} />
                  </div>
                </div>
                <h3 className="pipeline-title">{item.title}</h3>
                <div className="pipeline-actor">{item.actor}</div>
                <p className="pipeline-desc">{item.desc}</p>
                <button className="node-explore-btn">
                  <span>Explore State Node</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Node Detailed Telemetry Banner */}
        <div className="active-node-drawer">
          <div className="node-drawer-header">
            <span className="pulse-dot"></span>
            <strong>ACTIVE STATE NODE TELEMETRY:</strong> {phases[activePhase].phase} — {phases[activePhase].title}
          </div>
          <p className="node-drawer-text">{phases[activePhase].nodeDetails}</p>
        </div>
      </div>
    </section>
  );
}
