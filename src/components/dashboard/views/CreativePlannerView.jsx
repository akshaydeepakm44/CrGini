import React, { useState } from 'react';
import {
  Palette,
  RefreshCw,
  Sparkles,
  Download,
  Copy,
  Check,
  FileImage,
  Cpu
} from 'lucide-react';

export default function CreativePlannerView() {

  const [companyName, setCompanyName] = useState('CreativeGini AI');
  const [industryTarget, setIndustryTarget] = useState('Enterprise B2B Tech & AI Engineering');
  const [productContext, setProductContext] = useState('Autonomous 3-member enterprise creative AI POD squad delivering sovereign multimodal content synthesis and zero-data egress architecture.');
  const [visualTheme, setVisualTheme] = useState('glassmorphism'); 

  const [strategicAngle, setStrategicAngle] = useState('Democratizing Sovereign Enterprise Agent Pipelines via Zero-Egress AI PODs');
  const [contentFormat, setContentFormat] = useState('carousel-5'); 
  const [callToAction, setCallToAction] = useState('Deploy Your Sovereign POD Enclave at datai2i.com');

  const [isRendering, setIsRendering] = useState(false);
  const [renderStep, setRenderStep] = useState('');
  const [selectedSlide, setSelectedSlide] = useState(1);
  const [copiedSlide, setCopiedSlide] = useState(false);
  const [slidesData, setSlidesData] = useState([
    {
      id: 1,
      tag: 'SLIDE 01 • THE HOOK',
      title: 'Why Sovereign Multi-Agent AI PODs Dominate 2026',
      subtitle: 'The shift from fragmented creative agencies to dedicated on-prem autonomous squads.',
      bullets: [
        '94% faster asset delivery with 100% brand token compliance',
        'Zero-Data Egress Enclave guarantees zero training leaks',
        'Single API orchestrating Strategist, Designer & DevRel'
      ],
      prompt: 'Flux.1 Pro, 4K resolution, sovereign AI pod architecture visual, glowing cybernetic nodes, glassmorphism dark mode, octane render',
      accentColor: '#38bdf8'
    },
    {
      id: 2,
      tag: 'SLIDE 02 • THE PROBLEM',
      title: 'The Hidden Risks of Public Cloud Creative LLMs',
      subtitle: 'Why Fortune 500 CISOs are blocking un-enclaved marketing generation tools.',
      bullets: [
        'Proprietary brand assets leaking to public training sets',
        'Inconsistent visual identity across external contractors',
        'Agency fatigue: 3-week turnaround for standard 4K motion reels'
      ],
      prompt: 'Flux.1 Pro, dark security telemetry map, data egress prevention shield, neon red & purple highlights, 4K octane render',
      accentColor: '#f87171'
    },
    {
      id: 3,
      tag: 'SLIDE 03 • THE ARCHITECTURE',
      title: 'Inside the 3-Member Sovereign POD Graph',
      subtitle: 'How DeepSeek-R1, Flux.1 Pro & OpenTelemetry work in unified state harmony.',
      bullets: [
        'Strategist AI: Maps market whitespace & buyer intent keywords',
        'Creative AI: Synthesizes 4K carousels & vector diagrams',
        'DevRel AI: Formats code blocks & syndicates omnichannel'
      ],
      prompt: 'Flux.1 Pro, 3-node multi-agent graph orchestration diagram, glowing cyan and violet data pipelines, clean minimalism',
      accentColor: '#c084fc'
    },
    {
      id: 4,
      tag: 'SLIDE 04 • BENCHMARK PROOF',
      title: '10x Content Velocity Without Sacrificing Brand Integrity',
      subtitle: 'Real enterprise benchmarks across LinkedIn, X, Substack & Dev.to.',
      bullets: [
        '185 Production-grade assets generated per week',
        '4.2x increase in developer engagement velocity',
        '$140,000 annual agency retainer savings per POD'
      ],
      prompt: 'Flux.1 Pro, futuristic analytics dashboard hologram, glowing growth curves, emerald green metrics, dark glass UI',
      accentColor: '#34d399'
    },
    {
      id: 5,
      tag: 'SLIDE 05 • CALL TO ACTION',
      title: 'Deploy Your Enterprise Sovereign POD Today',
      subtitle: 'Zero setup friction • VPC Dedicated Rack • 100% On-Premise GPU Execution.',
      bullets: [
        'Instant deployment into AWS Sovereign Enclaves or Private VPC',
        'Free 14-day sovereign benchmark audit for enterprise teams',
        'Includes 5,000 monthly Flux.1 Pro 4K creative synthesis credits'
      ],
      prompt: 'Flux.1 Pro, glowing launch rocket portal, enterprise sovereign cloud badge, deep space gradient, pristine typography',
      accentColor: '#fbbf24'
    }
  ]);

  const presetAngles = [
    'Why Multi-Agent PODs Beat Traditional Creative Agencies',
    'The Hidden Cost of Public Cloud LLM Data Leaks',
    '10x Content Velocity Architecture Breakdown',
    'How Top 1% DevRel Teams Automate Technical Content'
  ];

  const handleSynthesizeStoryboard = (e) => {
    if (e) e.preventDefault();
    setIsRendering(true);
    setRenderStep('Parsing company brand identity & token guidelines...');

    setTimeout(() => {
      setRenderStep(`Aligning custom strategic angle: "${strategicAngle}"...`);
    }, 700);

    setTimeout(() => {
      setRenderStep('Dispatching Flux.1 Pro & Kling AI 4K rendering pipelines...');
    }, 1400);

    setTimeout(() => {
      setIsRendering(false);
      setRenderStep('');

      setSlidesData([
        {
          id: 1,
          tag: 'SLIDE 01 • THE HOOK',
          title: `How ${companyName} Delivers Next-Gen ${industryTarget}`,
          subtitle: strategicAngle,
          bullets: [
            `${companyName} engineered for maximum ROI and speed`,
            'Zero-Data Egress guarantee protecting enterprise IP',
            'Full autonomous pipeline from research to distribution'
          ],
          prompt: `Flux.1 Pro, 4K ${visualTheme} canvas for ${companyName}, modern glowing accents, crisp typography`,
          accentColor: '#38bdf8'
        },
        {
          id: 2,
          tag: 'SLIDE 02 • THE PROBLEM',
          title: 'The Critical Bottlenecks in Modern Workflows',
          subtitle: `Why existing legacy tools fail to scale ${industryTarget}.`,
          bullets: [
            'Fragmented manual workflows slowing output velocity',
            'High operational overhead and vendor lock-in',
            'Lack of unified strategic and creative alignment'
          ],
          prompt: `Flux.1 Pro, dark security and performance analytics, ${visualTheme} aesthetic, high contrast`,
          accentColor: '#f87171'
        },
        {
          id: 3,
          tag: 'SLIDE 03 • THE SOLUTION',
          title: `The ${companyName} Sovereign Architecture`,
          subtitle: productContext,
          bullets: [
            'Autonomous intelligent nodes operating 24/7',
            'Strict adherence to brand color and visual guidelines',
            'Seamless omnichannel broadcast across developer networks'
          ],
          prompt: `Flux.1 Pro, 3-node agent execution graph, glowing ${visualTheme} pipeline, 4K render`,
          accentColor: '#c084fc'
        },
        {
          id: 4,
          tag: 'SLIDE 04 • THE IMPACT',
          title: 'Measurable Velocity & Proven Outcomes',
          subtitle: 'Real-world benchmarks and operational performance gains.',
          bullets: [
            '10x faster asset delivery without compromise',
            '100% data sovereign compute on your private cloud',
            'Significant reduction in CAC and customer acquisition lag'
          ],
          prompt: `Flux.1 Pro, high-contrast metrics chart hologram, green growth signals, ${visualTheme} theme`,
          accentColor: '#34d399'
        },
        {
          id: 5,
          tag: 'SLIDE 05 • THE CTA',
          title: `Get Started with ${companyName}`,
          subtitle: callToAction,
          bullets: [
            'Instant enterprise setup and API onboarding',
            'Full documentation and sovereign support team',
            'Reserve your dedicated sovereign AI cluster now'
          ],
          prompt: `Flux.1 Pro, launch portal visual, gold and cyan highlights, ${visualTheme} finish`,
          accentColor: '#fbbf24'
        }
      ]);
    }, 2200);
  };

  const handleCopySlide = () => {
    const current = slidesData.find((s) => s.id === selectedSlide);
    if (!current) return;
    const text = `${current.tag}\nHeadline: ${current.title}\nSubtitle: ${current.subtitle}\nKey Points:\n- ${current.bullets.join('\n- ')}\nCTA: ${callToAction}`;
    navigator.clipboard.writeText(text);
    setCopiedSlide(true);
    setTimeout(() => setCopiedSlide(false), 2000);
  };

  const activeSlideData = slidesData.find((s) => s.id === selectedSlide) || slidesData[0];

  return (
    <div className="dash-tab-container">

      <div className="dash-panel glass-card creative-form-panel">
        <div className="panel-header">
          <div className="panel-title-with-icon">
            <Palette size={22} className="icon-purple" />
            <div>
              <h3>Creative Content & 4K Carousel Storyboard Planner</h3>
              <p className="panel-subtitle">
                Step 1: Enter your company & product details. Step 2: Define your custom strategic angle to generate 4K carousels via Flux.1 Pro.
              </p>
            </div>
          </div>
          <span className="badge-active">Flux.1 Pro & Kling AI Engine</span>
        </div>

        <form onSubmit={handleSynthesizeStoryboard} className="creative-planner-form">

          <div className="planner-step-card">
            <div className="step-badge-row">
              <span className="step-num-pill">STEP 01</span>
              <span className="step-title-txt">Company & Product Details</span>
            </div>

            <div className="form-grid-2col">
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Company / Product Name</span>
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="dash-text-input"
                  placeholder="e.g. CreativeGini AI, DATAi2i, SovereignCloud..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Industry / Target Audience</span>
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="dash-text-input"
                  placeholder="e.g. Enterprise B2B SaaS, AI Engineers, Tech Leads..."
                  value={industryTarget}
                  onChange={(e) => setIndustryTarget(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field-group" style={{ marginTop: '14px' }}>
              <label className="form-field-label">
                <span>Product Overview, Key Value Proposition & Capabilities</span>
              </label>
              <textarea
                className="dash-textarea"
                rows={2}
                placeholder="Describe your product core capabilities, pain points solved, and value proposition..."
                value={productContext}
                onChange={(e) => setProductContext(e.target.value)}
              />
            </div>

            <div className="form-field-group" style={{ marginTop: '14px' }}>
              <label className="form-field-label">
                <span>Visual Brand Theme & Aesthetics</span>
              </label>
              <div className="visual-themes-selector">
                <button
                  type="button"
                  className={`theme-option-btn ${visualTheme === 'glassmorphism' ? 'active' : ''}`}
                  onClick={() => setVisualTheme('glassmorphism')}
                >
                  <span className="theme-dot blue"></span>
                  <span>Sovereign Glassmorphism</span>
                </button>
                <button
                  type="button"
                  className={`theme-option-btn ${visualTheme === 'cyberpunk' ? 'active' : ''}`}
                  onClick={() => setVisualTheme('cyberpunk')}
                >
                  <span className="theme-dot purple"></span>
                  <span>Cyberpunk Dark Tech</span>
                </button>
                <button
                  type="button"
                  className={`theme-option-btn ${visualTheme === 'neo-saas' ? 'active' : ''}`}
                  onClick={() => setVisualTheme('neo-saas')}
                >
                  <span className="theme-dot green"></span>
                  <span>Minimalist Neo-SaaS</span>
                </button>
                <button
                  type="button"
                  className={`theme-option-btn ${visualTheme === 'vibrant' ? 'active' : ''}`}
                  onClick={() => setVisualTheme('vibrant')}
                >
                  <span className="theme-dot amber"></span>
                  <span>Vibrant Fusion Gradient</span>
                </button>
              </div>
            </div>
          </div>

          <div className="planner-step-card" style={{ marginTop: '20px' }}>
            <div className="step-badge-row">
              <span className="step-num-pill purple">STEP 02</span>
              <span className="step-title-txt">Custom Strategic Angle & Content Narrative</span>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <span>Custom Strategic Angle / Campaign Narrative Hook</span>
                <span className="required-star">*</span>
              </label>
              <textarea
                className="dash-textarea"
                rows={2}
                placeholder="Enter your custom strategic angle, thesis, or campaign hook..."
                value={strategicAngle}
                onChange={(e) => setStrategicAngle(e.target.value)}
                required
              />
            </div>

            <div className="preset-angles-wrap" style={{ marginTop: '10px' }}>
              <span className="preset-label">Quick-Pick Angles:</span>
              <div className="preset-buttons-row">
                {presetAngles.map((angle, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-pill-btn"
                    onClick={() => setStrategicAngle(angle)}
                  >
                    ✦ {angle}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid-2col" style={{ marginTop: '16px' }}>
              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Output Format</span>
                </label>
                <select
                  className="dash-select"
                  value={contentFormat}
                  onChange={(e) => setContentFormat(e.target.value)}
                >
                  <option value="carousel-5">LinkedIn / Instagram 5-Slide 4K Carousel</option>
                  <option value="infographic">4K Technical Architecture Infographic</option>
                  <option value="x-thread">X / Twitter Visual Thread Storyboard</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  <span>Call-to-Action (CTA) Headline</span>
                </label>
                <input
                  type="text"
                  className="dash-text-input"
                  placeholder="e.g. Deploy Sovereign POD at datai2i.com"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-action-row" style={{ marginTop: '22px' }}>
            <div className="action-hint">
              <Cpu size={15} className="icon-blue" />
              <span>Synthesizing with Flux.1 Pro • Zero Egress Private GPU Enclave</span>
            </div>

            <button
              type="submit"
              className="dash-generate-strategy-btn"
              disabled={isRendering || (!companyName.trim() && !strategicAngle.trim())}
            >
              {isRendering ? (
                <>
                  <RefreshCw size={16} className="spin-icon" />
                  <span>Rendering 4K Canvas...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="btn-sparkle-icon" />
                  <span>Synthesize 4K Creative Storyboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        {isRendering && (
          <div className="strategy-loading-banner glass-card" style={{ marginTop: '20px' }}>
            <div className="loading-logo-glow-wrap">
              <img src="/logo-icon.png" alt="CreativeGini Loading" className="loading-logo-pulsing" />
            </div>
            <div className="loading-status-content">
              <h4>Flux.1 Pro Multimodal Synthesis in Progress</h4>
              <p className="loading-step-msg">{renderStep}</p>
            </div>
          </div>
        )}
      </div>

      {!isRendering && (
        <div className="creative-output-container glass-card">

          <div className="blueprint-header-bar">
            <div className="blueprint-title-block">
              <span className="blueprint-tag">4K VISUAL STORYBOARD CANVAS</span>
              <h2 className="blueprint-title">
                {companyName} — 5-Slide High-Converting Carousel Storyboard
              </h2>
              <p className="panel-subtitle" style={{ marginTop: '2px' }}>
                Strategic Angle: <strong style={{ color: '#fff' }}>{strategicAngle}</strong>
              </p>
            </div>

            <div className="blueprint-actions-group">
              <button
                type="button"
                className="btn-glass btn-sm"
                onClick={handleCopySlide}
              >
                {copiedSlide ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
                <span>{copiedSlide ? 'Copied Slide' : 'Copy Slide Text'}</span>
              </button>

              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => alert(`Full 5-Slide 4K Carousel PDF for ${companyName} generated!`)}
              >
                <Download size={14} />
                <span>Export 5-Slide PDF</span>
              </button>
            </div>
          </div>

          <div className="carousel-slide-tabs-bar">
            {slidesData.map((slide) => (
              <button
                key={slide.id}
                type="button"
                className={`storyboard-tab-btn ${selectedSlide === slide.id ? 'active' : ''}`}
                onClick={() => setSelectedSlide(slide.id)}
              >
                <span className="tab-slide-num">0{slide.id}</span>
                <span className="tab-slide-name">
                  {slide.id === 1 && 'The Hook'}
                  {slide.id === 2 && 'The Problem'}
                  {slide.id === 3 && 'The Solution'}
                  {slide.id === 4 && 'The Impact'}
                  {slide.id === 5 && 'The CTA'}
                </span>
              </button>
            ))}
          </div>

          <div className="storyboard-split-grid">

            <div className="slide-canvas-card glass-card">
              <div className="canvas-header-row">
                <span className="canvas-slide-tag" style={{ color: activeSlideData.accentColor }}>
                  {activeSlideData.tag}
                </span>
                <span className="canvas-res-pill">4K • 1080 × 1350 (4:5)</span>
              </div>

              <div className="canvas-body-content">
                <h3 className="canvas-slide-title">{activeSlideData.title}</h3>
                <p className="canvas-slide-subtitle">{activeSlideData.subtitle}</p>

                <div className="canvas-bullets-box">
                  {activeSlideData.bullets.map((bullet, idx) => (
                    <div key={idx} className="canvas-bullet-item">
                      <div className="canvas-bullet-dot" style={{ background: activeSlideData.accentColor }}></div>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="canvas-footer-cta-row">
                  <span className="canvas-brand-name">✦ {companyName}</span>
                  <span className="canvas-cta-text">{callToAction}</span>
                </div>
              </div>
            </div>

            <div className="slide-inspector-panel">
              <div className="inspector-box">
                <span className="inspector-lbl">Slide Role & Goal</span>
                <p className="inspector-val">
                  {selectedSlide === 1 && 'Grab immediate high-intent attention within 1.5 seconds of feed scroll.'}
                  {selectedSlide === 2 && 'Expose the acute friction, risk, or financial loss caused by status-quo tools.'}
                  {selectedSlide === 3 && 'Introduce sovereign architectural superiority and technological moat.'}
                  {selectedSlide === 4 && 'Provide mathematical benchmark proof and operational ROI numbers.'}
                  {selectedSlide === 5 && 'Clear high-conversion call to action to trigger enterprise inbound demos.'}
                </p>
              </div>

              <div className="inspector-box">
                <span className="inspector-lbl">Flux.1 Pro Generation Prompt</span>
                <div className="prompt-code-box">
                  <code>{activeSlideData.prompt}</code>
                </div>
              </div>

              <div className="inspector-box">
                <span className="inspector-lbl">Brand Color Tokens & Palette</span>
                <div className="slide-color-swatches-list">
                  <div className="swatch-item">
                    <span className="swatch-circle blue"></span>
                    <span>#38BDF8 (Primary Cyan)</span>
                  </div>
                  <div className="swatch-item">
                    <span className="swatch-circle purple"></span>
                    <span>#818CF8 (Sovereign Indigo)</span>
                  </div>
                  <div className="swatch-item">
                    <span className="swatch-circle dark"></span>
                    <span>#0B0B14 (Deep Canvas)</span>
                  </div>
                </div>
              </div>

              <div className="inspector-actions-row">
                <button
                  type="button"
                  className="btn-glass btn-sm"
                  onClick={() => alert(`Downloading Slide 0${selectedSlide} in 4K PNG format...`)}
                >
                  <FileImage size={14} /> <span>Download Slide PNG</span>
                </button>
                <button
                  type="button"
                  className="btn-glass btn-sm"
                  onClick={() => alert(`Slide 0${selectedSlide} queued for Flux.1 Pro re-render.`)}
                >
                  <RefreshCw size={14} /> <span>Regenerate Slide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
