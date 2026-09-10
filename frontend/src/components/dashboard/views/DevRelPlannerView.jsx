import React, { useState } from 'react';
import { Terminal, RefreshCw, Code } from 'lucide-react';

export default function DevRelPlannerView() {
  const [devrelCodeTopic, setDevrelCodeTopic] = useState('DeepSeek-R1 Sovereign GPU Integration Script');
  const [isGeneratingDevRel, setIsGeneratingDevRel] = useState(false);

  const handleGenerate = () => {
    setIsGeneratingDevRel(true);
    setTimeout(() => setIsGeneratingDevRel(false), 1500);
  };

  return (
    <div className="dash-tab-container">
      <div className="dash-panel glass-card">
        <div className="panel-header">
          <h3><Terminal size={18} className="icon-purple" /> DevRel & Technical Content Planner</h3>
          <span className="badge-active">Code & Technical Syndication Engine</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          Generate high-authority technical blogs, API documentation, GitHub release briefs, and copy tailored for developer audiences.
        </p>

        <div className="model-action-box">
          <div className="input-row">
            <input
              type="text"
              className="dash-input"
              value={devrelCodeTopic}
              onChange={(e) => setDevrelCodeTopic(e.target.value)}
              placeholder="Topic e.g. 'Writing Custom Tool Calling Agents in Node.js'..."
            />
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isGeneratingDevRel}
            >
              {isGeneratingDevRel ? <RefreshCw size={15} className="spin-icon" /> : <Code size={15} />}
              <span>{isGeneratingDevRel ? 'Synthesizing Snippets...' : 'Generate Technical Spec'}</span>
            </button>
          </div>
          {isGeneratingDevRel && (
            <div className="strategy-loading-banner glass-card" style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div className="loading-logo-glow-wrap">
                <img src="/logo-icon.png" alt="CreativeGini Loading" className="loading-logo-pulsing" />
              </div>
              <div className="loading-status-content">
                <h4>DevRel Multi-Agent Code Generation Active</h4>
                <p className="loading-step-msg">Synthesizing TypeScript SDK bindings & zero-egress dispatch queue...</p>
              </div>
            </div>
          )}

          <div className="devrel-code-preview">
            <div className="code-header">
              <span className="code-filename">agent_orchestrator.ts</span>
              <span className="code-lang">TypeScript / Sovereign API</span>
            </div>
            <pre className="code-block">
              <code>{`import { CreativeGiniPod } from '@creativegini/sovereign-sdk';

const pod = new CreativeGiniPod({
  enclaveRegion: 'us-east-sovereign-1',
  dataEgressMode: 'ZERO_EGRESS_ENCLAVE',
  apiKey: process.env.CREATIVEGINI_API_KEY
});

// Autonomous multi-agent pipeline dispatch
const pipeline = await pod.dispatch({
  topic: '${devrelCodeTopic}',
  squad: ['strategist', 'creative_designer', 'devrel_lead'],
  channels: ['linkedin', 'x', 'medium', 'github_release']
});

console.log(\`✅ Pipeline Queued: \${pipeline.id} - Velocity: 185 assets/day\`);`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
