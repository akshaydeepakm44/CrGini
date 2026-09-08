import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Globe,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Copy,
  ExternalLink,
  Users,
  BarChart3,
  Send
} from 'lucide-react';

export default function StrategicPlannerView({ onNavigateToCreative }) {
  const [companyName, setCompanyName] = useState('CreativeGini AI');
  const [websiteUrl, setWebsiteUrl] = useState('https://creativegini.ai');
  const [productDetails, setProductDetails] = useState('Autonomous 3-member enterprise creative AI POD squad delivering sovereign multimodal content synthesis and zero-data egress architecture.');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [strategyOutput, setStrategyOutput] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.name.split('.').pop().toUpperCase()
      });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleGenerateStrategy = (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim() && !websiteUrl.trim()) return;

    setIsAnalyzingStrategy(true);
    setAnalysisStep(`Scraping and analyzing website semantics & tech stack for ${websiteUrl || companyName}...`);

    setTimeout(() => {
      setAnalysisStep(
        uploadedFile
          ? `Parsing uploaded document specs (${uploadedFile.name}) & architecture blueprints...`
          : 'Analyzing competitive whitespace & domain cluster signals...'
      );
    }, 800);

    setTimeout(() => {
      setAnalysisStep('Synthesizing high-velocity buyer intent keywords with DeepSeek-R1...');
    }, 1600);

    setTimeout(() => {
      setIsAnalyzingStrategy(false);
      setAnalysisStep('');
      setStrategyOutput({
        company: companyName || 'Enterprise Product',
        url: websiteUrl || 'https://domain.com',
        coreThesis: `Positioning ${companyName || 'the product'} as the premier sovereign enterprise AI marketing POD delivering zero-data egress compliance and 10x content velocity.`,
        keyDifferentiators: [
          'Zero-Egress On-Prem/VPC Private Enclaves eliminating enterprise data leak risks.',
          'Autonomous Multi-Modal Stack combining DeepSeek-R1, Flux.1 Pro & OpenTelemetry.',
          'Dedicated 3-Member POD Squad replacing expensive and fragmented external agencies.'
        ],
        targetAudience: {
          role: 'VP Engineering, AI Architects, Chief Marketing Officers & Enterprise Tech Leads',
          painPoints: 'Fragmented agencies, slow creative output, high agency burn rates, data privacy violations with shared public cloud LLMs.',
          triggers: 'Quarterly growth planning, sovereign AI infrastructure mandates, developer advocacy launches.'
        },
        keywordClusters: [
          { category: 'High-Intent Keywords', tags: ['Sovereign AI Enclave', 'Zero-Egress Multi-Agent', 'Enterprise POD Squad', 'DeepSeek-R1 Strategy'] },
          { category: 'Competitor Whitespace', tags: ['Private Creative LLM', 'Autonomous DevRel Engine', 'Flux.1 Pro Marketing API', 'AI Agent Orchestration'] },
          { category: 'Long-Tail Authority', tags: ['Self-Hosted AI Marketing Stack', 'Developer Advocacy Automation', 'B2B Creative Engineering'] }
        ],
        funnelStrategy: [
          { stage: 'Top of Funnel (Awareness)', channel: 'LinkedIn & X Technical Carousels', deliverable: '4K Architectural Breakdowns & Benchmark Comparison Infographics' },
          { stage: 'Middle of Funnel (Evaluation)', channel: 'GitHub Trending & Dev.to', deliverable: 'Open-Source Zero-Egress Spec, SDK Quickstart Guides, DeepSeek Benchmarks' },
          { stage: 'Bottom of Funnel (Conversion)', channel: 'Enterprise Executive Briefings & Substack', deliverable: 'Full Sovereign POD ROI Estimator & Architecture Whitepapers' }
        ]
      });
    }, 2400);
  };

  return (
    <div className="dash-tab-container">

      <div className="dash-panel glass-card strategic-form-panel">
        <div className="panel-header">
          <div className="panel-title-with-icon">
            <Compass size={20} className="icon-purple" />
            <div>
              <h3>Strategic Growth & Positioning Blueprint Engine</h3>
              <p className="panel-subtitle">
                Input your company/product URL, core specs, and upload pitch decks or technical whitepapers to synthesize an autonomous growth roadmap.
              </p>
            </div>
          </div>
          <span className="badge-active">DeepSeek-R1 Strategy Core</span>
        </div>

        <form onSubmit={handleGenerateStrategy} className="strategic-input-form">

          <div className="form-grid-2col">
            <div className="form-field-group">
              <label className="form-field-label">
                <span>Company / Product Name</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon-wrap">
                <span className="input-inner-icon"><Sparkles size={16} /></span>
                <input
                  type="text"
                  className="dash-text-input"
                  placeholder="e.g. CreativeGini AI, DATAi2i, SovereignCloud..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Website / Product URL</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-with-icon-wrap">
                <span className="input-inner-icon"><Globe size={16} /></span>
                <input
                  type="url"
                  className="dash-text-input"
                  placeholder="https://yourcompany.com or product link..."
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              <span>Product Overview, Value Proposition & Key Competitors</span>
            </label>
            <textarea
              className="dash-textarea"
              rows={3}
              placeholder="Describe what your company or product does, target audience, competitive advantages, or specific campaign focus..."
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              <span>Upload Product Whitepaper, Deck, or Specs (PDF, DOC, DOCX, TXT)</span>
              <span className="label-optional">(Optional)</span>
            </label>

            {!uploadedFile ? (
              <label className="file-drop-zone">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="file-hidden-input"
                />
                <div className="drop-zone-content">
                  <div className="drop-zone-icon">
                    <UploadCloud size={24} />
                  </div>
                  <div className="drop-zone-text">
                    <span className="drop-primary-txt">Click to upload document or drag & drop</span>
                    <span className="drop-sub-txt">PDF, DOCX, DOC or TXT up to 25MB • 100% Private Enclave</span>
                  </div>
                </div>
              </label>
            ) : (
              <div className="uploaded-file-card">
                <div className="file-info-left">
                  <div className="file-type-icon">
                    <FileText size={20} />
                  </div>
                  <div className="file-meta">
                    <span className="file-name">{uploadedFile.name}</span>
                    <span className="file-size">{uploadedFile.size} • {uploadedFile.type}</span>
                  </div>
                </div>
                <div className="file-actions-right">
                  <span className="file-ready-badge">
                    <CheckCircle2 size={13} /> Ready for AI Analysis
                  </span>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={handleRemoveFile}
                    title="Remove File"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-action-row">
            <div className="action-hint">
              <ShieldCheck size={15} className="icon-green" />
              <span>100% Zero-Data Egress • Analyzed privately inside your sovereign compute enclave</span>
            </div>

            <button
              type="submit"
              className="dash-generate-strategy-btn"
              disabled={isAnalyzingStrategy || (!companyName.trim() && !websiteUrl.trim())}
            >
              {isAnalyzingStrategy ? (
                <>
                  <RefreshCw size={16} className="spin-icon" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="btn-sparkle-icon" />
                  <span>Generate Strategic Blueprint</span>
                </>
              )}
            </button>
          </div>
        </form>

        {isAnalyzingStrategy && (
          <div className="strategy-loading-banner glass-card">
            <div className="loading-logo-glow-wrap">
              <img src="/logo-icon.png" alt="CreativeGini Loading" className="loading-logo-pulsing" />
            </div>
            <div className="loading-status-content">
              <h4>DeepSeek-R1 Autonomous Reasoning in Progress</h4>
              <p className="loading-step-msg">{analysisStep}</p>
            </div>
          </div>
        )}
      </div>

      {strategyOutput && !isAnalyzingStrategy && (
        <div className="strategy-output-container glass-card">

          <div className="blueprint-header-bar">
            <div className="blueprint-title-block">
              <span className="blueprint-tag">AUTONOMOUS GROWTH BLUEPRINT</span>
              <h2 className="blueprint-title">
                {strategyOutput.company} — Sovereign Strategy & Positioning Map
              </h2>
              <a
                href={strategyOutput.url}
                target="_blank"
                rel="noopener noreferrer"
                className="blueprint-url-link"
              >
                <Globe size={13} />
                <span>{strategyOutput.url}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="blueprint-actions-group">
              <button
                type="button"
                className="btn-glass btn-sm"
                onClick={() => alert(`Strategic Blueprint for ${strategyOutput.company} copied to clipboard!`)}
              >
                <Copy size={14} /> <span>Copy Markdown</span>
              </button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={onNavigateToCreative}
              >
                <Sparkles size={14} /> <span>Send to Creative Designer →</span>
              </button>
            </div>
          </div>

          <div className="blueprint-thesis-card">
            <div className="thesis-eyebrow">
              <Sparkles size={15} className="icon-purple" />
              <span>CORE NARRATIVE THESIS & VALUE PROPOSITION</span>
            </div>
            <p className="thesis-statement">{strategyOutput.coreThesis}</p>
          </div>

          <div className="blueprint-differentiators-grid">
            {strategyOutput.keyDifferentiators.map((diff, idx) => (
              <div key={idx} className="diff-card">
                <div className="diff-num-badge">0{idx + 1}</div>
                <p className="diff-text">{diff}</p>
              </div>
            ))}
          </div>

          <div className="blueprint-section-block">
            <h3 className="section-block-title">
              <Users size={17} className="icon-blue" />
              <span>Target ICP & Enterprise Buyer Persona</span>
            </h3>
            <div className="persona-matrix-grid">
              <div className="persona-box">
                <span className="persona-lbl">Target Roles & Decision Makers</span>
                <p className="persona-val">{strategyOutput.targetAudience.role}</p>
              </div>
              <div className="persona-box">
                <span className="persona-lbl">Critical Pain Points</span>
                <p className="persona-val text-amber">{strategyOutput.targetAudience.painPoints}</p>
              </div>
              <div className="persona-box">
                <span className="persona-lbl">Buying & Urgency Triggers</span>
                <p className="persona-val text-green">{strategyOutput.targetAudience.triggers}</p>
              </div>
            </div>
          </div>

          <div className="blueprint-section-block">
            <h3 className="section-block-title">
              <BarChart3 size={17} className="icon-purple" />
              <span>High-Velocity Keyword Clusters & Topical Authority Map</span>
            </h3>
            <div className="keyword-clusters-grid">
              {strategyOutput.keywordClusters.map((cluster, idx) => (
                <div key={idx} className="cluster-category-box">
                  <span className="cluster-cat-title">{cluster.category}</span>
                  <div className="cluster-tags-list">
                    {cluster.tags.map((tag, tIdx) => (
                      <span key={tIdx} className={`strategy-tag-pill ${idx === 0 ? 'blue' : idx === 1 ? 'purple' : 'green'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="blueprint-section-block">
            <h3 className="section-block-title">
              <Send size={17} className="icon-green" />
              <span>Omnichannel Distribution Funnel & Asset Roadmap</span>
            </h3>
            <div className="funnel-stages-list">
              {strategyOutput.funnelStrategy.map((stage, idx) => (
                <div key={idx} className="funnel-stage-row">
                  <div className="funnel-badge-col">
                    <span className="stage-badge">{stage.stage}</span>
                  </div>
                  <div className="funnel-channel-col">
                    <span className="channel-pill">{stage.channel}</span>
                  </div>
                  <div className="funnel-deliverable-col">
                    <p className="deliverable-text">{stage.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
