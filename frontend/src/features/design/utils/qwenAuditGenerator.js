/**
 * Specialist Heuristic Audit Checklist Generator
 * Synthesizes client ticket briefs into dimension-specific, actionable audit checklists.
 */

export function generateAuditChecklist(ticket, dimensionKey, dimensionLabel) {
  const title = ticket?.title || 'UI/UX Design Project';
  const desc = ticket?.description || '';
  const contextText = `${title} ${desc}`.toLowerCase();

  // Extract contextual keywords from client brief
  const hasCalculator = contextText.includes('calculator') || contextText.includes('interactive');
  const hasHero = contextText.includes('hero') || contextText.includes('landing');
  const hasMockup = contextText.includes('mockup') || contextText.includes('device');
  const hasPerformance = contextText.includes('performance') || contextText.includes('optimization') || contextText.includes('speed');
  const hasEcommerce = contextText.includes('shop') || contextText.includes('checkout') || contextText.includes('cart') || contextText.includes('pricing');
  const hasSaaS = contextText.includes('saas') || contextText.includes('dashboard') || contextText.includes('app');

  // Dimension-specific tailored checklists based on client specifics
  switch (dimensionKey) {
    case 'usability':
      return [
        hasCalculator
          ? `Verify intuitive usability of the interactive calculator: input clarity, immediate calculation feedback, and zero friction to primary CTA.`
          : `Audit end-to-end task flows and user journeys against the primary brief objectives for "${title}".`,
        hasHero
          ? `Evaluate hero section cognitive burden: ensure value proposition is immediately legible within first 3 seconds of viewport scanning.`
          : `Assess mental models and terminology: confirm UI labels and affordances align with target client audience expectations.`,
        `Audit error states, input validation tooltips, and non-destructive action confirmations across key user entry points.`,
        `Measure click-depth to core value propositions, verifying critical client information is accessible within 2 interactions.`
      ];

    case 'navigation':
      return [
        `Audit primary header navigation taxonomy to ensure clear priority pathways for "${ticket?.clientCompany || 'the brand'}".`,
        hasHero
          ? `Verify seamless anchor scroll and sticky navigation behavior when transitioning down past the hero showcase.`
          : `Evaluate information hierarchy, breadcrumbs, and submenu categorizations for logical semantic flow.`,
        `Inspect search/filter discoverability and mobile drawer navigation ergonomics.`,
        `Validate logo return home links and global footer index links for consistency.`
      ];

    case 'visualHierarchy':
      return [
        hasMockup
          ? `Audit focal contrast balance between responsive device mockups, interactive elements, and textual value proposition.`
          : `Analyze typographic hierarchy: distinct H1/H2/H3 scale ratios, readable line-heights (1.5-1.6), and scannable visual anchors.`,
        `Assess color contrast ratios on CTAs and brand accent tokens against background canvas surfaces.`,
        hasHero
          ? `Ensure the hero headline is the undisputed visual focal landmark with minimum 40px distinct optical separation.`
          : `Audit whitespace rhythm, grouping proximity, and grid layout alignment across responsive breakpoints.`,
        `Review iconographic consistency and visual weight across all feature cards and specification badges.`
      ];

    case 'interaction':
      return [
        hasCalculator
          ? `Test micro-interactions for capability calculator: slider thumbs, state transitions, numeric counters, and active focus rings.`
          : `Evaluate interactive states (hover, focus-visible, active, disabled, loading) on all primary buttons and actionable controls.`,
        hasPerformance
          ? `Benchmark micro-animation frame rates (target: 60fps) to eliminate interaction stutter or layout recalculation lags.`
          : `Inspect modal transitions, dropdown ease curves, and accordion expand animations for snappy responsiveness (<200ms).`,
        `Audit tactile cursor feedback (pointers, grabbing) and keyboard navigation triggers (Enter, Space, Tab) for interactive elements.`
      ];

    case 'responsive':
      return [
        hasMockup
          ? `Audit mobile viewport (390px): verify responsive device mockups scale fluidly without horizontal overflow or clipping.`
          : `Test responsive layout behavior across standard breakpoints: Mobile (390px), Tablet (834px), Desktop (1440px), and Ultrawide (1920px).`,
        `Verify touch target dimensions meet Apple HIG & Android guidelines (minimum 44x44px, ideal 48x48px with 8px buffer).`,
        hasCalculator
          ? `Ensure interactive calculator controls and result cards reflow gracefully into single-column mobile viewports without font crushing.`
          : `Audit flexbox/grid stacking order on narrow viewports: ensure primary callouts precede secondary visual assets.`,
        `Test fluid clamp typography scaling and asset density (2x/3x retina displays) across modern device displays.`
      ];

    case 'accessibility':
      return [
        `Verify WCAG 2.1 AA color contrast compliance: minimum 4.5:1 ratio for normal body text and 3:1 for large headlines and graphic UI components.`,
        hasCalculator
          ? `Ensure interactive calculator elements have accessible ARIA labels, role attributes, and screen reader-friendly live announcement regions.`
          : `Check semantic HTML5 heading hierarchy (single H1 per page, sequential H2/H3 nesting without skipping levels).`,
        `Audit high-visibility focus indicators (minimum 2px solid offset outline) during complete keyboard Tab navigation.`,
        `Ensure all imagery, icons, and mockups contain descriptive alt tags or decorative aria-hidden flags.`
      ];

    case 'conversion':
      return [
        hasHero
          ? `Audit hero conversion path: verify primary CTA button stands out with dominant optical weight and compelling action verb.`
          : `Analyze conversion funnel velocity: eliminate secondary distractions competing with primary conversion objective.`,
        hasCalculator
          ? `Verify the capability calculator directly connects users to the final conversion funnel with pre-filled estimates to boost signup rate.`
          : `Assess social proof placement: position client testimonials, verified partner logos, and trust badges near friction points.`,
        hasPerformance
          ? `Audit perceived speed and above-the-fold loading priority: ensure primary conversion elements render in <1.2 seconds.`
          : `Review form input fields: eliminate non-essential fields to reduce conversion drop-off.`,
        `Audit objection reduction callouts: satisfaction guarantees, security badges, and clear pricing terms adjacent to submission triggers.`
      ];

    default:
      return [
        `Audit core interface heuristics against client specifications for "${title}".`,
        `Evaluate visual hierarchy, typography, and contrast standards against client brand guidelines.`,
        `Inspect responsive layout resilience and touch usability across mobile and desktop viewports.`,
        `Synthesize actionable recommendations into the deliverable UX findings report.`
      ];
  }
}

export const generateQwenChecklist = generateAuditChecklist;
