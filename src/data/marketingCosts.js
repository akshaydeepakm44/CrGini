// Illustrative Marketing Market Costs & Fragmentation Data for CreativeGini
export const MARKETING_SERVICES_COSTS = [
  // BATCH 01
  {
    id: 'leads',
    name: 'Lead Generation',
    category: 'Acquisition',
    estimatedCost: '$300 – $3,000+',
    unit: 'per campaign',
    label: 'Illustrative market cost',
    batch: 1,
    description: 'Prospect list building, email sequencing, CRM enrichment'
  },
  {
    id: 'posters',
    name: 'Poster Design',
    category: 'Creative Assets',
    estimatedCost: '$50 – $500',
    unit: 'per asset',
    label: 'Illustrative market cost',
    batch: 1,
    description: 'Ad creatives, banners, social posters, flyers'
  },
  {
    id: 'videos',
    name: 'Video Production',
    category: 'Video Production',
    estimatedCost: '$200 – $2,000+',
    unit: 'per video',
    label: 'Illustrative market cost',
    batch: 1,
    description: 'Commercial videos, brand teasers, motion graphics'
  },

  // BATCH 02
  {
    id: 'shorts',
    name: 'Shorts & Reels',
    category: 'Short-Form Video',
    estimatedCost: '$100 – $1,000+',
    unit: 'per short video',
    label: 'Illustrative market cost',
    batch: 2,
    description: 'Hook scripting, video editing, captions, audio syncing'
  },
  {
    id: 'content',
    name: 'Content & Copywriting',
    category: 'Content Marketing',
    estimatedCost: '$100 – $800',
    unit: 'per blog / newsletter',
    label: 'Illustrative market cost',
    batch: 2,
    description: 'Website copy, blog articles, email nurture flows'
  },
  {
    id: 'strategy',
    name: 'Marketing Strategy',
    category: 'Strategic Planning',
    estimatedCost: '$500 – $5,000+',
    unit: 'per campaign blueprint',
    label: 'Illustrative market cost',
    batch: 2,
    description: 'Target audience mapping, ICP research, messaging hierarchy'
  },

  // BATCH 03
  {
    id: 'product-demo',
    name: 'Product Demo',
    category: 'Video Production',
    estimatedCost: '$300 – $3,000+',
    unit: 'per demo video',
    label: 'Illustrative market cost',
    batch: 3,
    description: 'Screen recording, 3D product animations, voiceover'
  },
  {
    id: 'presentation',
    name: 'PowerPoint / Deck Design',
    category: 'Sales Collateral',
    estimatedCost: '$100 – $1,000+',
    unit: 'per presentation',
    label: 'Illustrative market cost',
    batch: 3,
    description: 'Pitch decks, sales presentations, keynote slide redesigns'
  },
  {
    id: 'social-media',
    name: 'Social Media Management',
    category: 'Social Marketing',
    estimatedCost: '$400 – $2,000+',
    unit: 'per month',
    label: 'Illustrative market cost',
    batch: 3,
    description: 'Daily posting, asset scheduling, trendjacking'
  },

  // BATCH 04
  {
    id: 'seo',
    name: 'SEO & Organic Search',
    category: 'Organic Inbound',
    estimatedCost: '$300 – $2,500+',
    unit: 'per month',
    label: 'Illustrative market cost',
    batch: 4,
    description: 'Technical SEO audits, keyword ranking, backlink outreach'
  },
  {
    id: 'community',
    name: 'Community Management',
    category: 'Community',
    estimatedCost: '$400 – $2,500+',
    unit: 'per month',
    label: 'Illustrative market cost',
    batch: 4,
    description: 'Discord/Telegram moderation, daily community replies'
  },
  {
    id: 'advertising',
    name: 'Paid Advertising',
    category: 'Paid Media',
    estimatedCost: '$500 – $4,000+',
    unit: 'per month + budget',
    label: 'Illustrative market cost',
    batch: 4,
    description: 'Meta Ads, Google Ads setup, keyword bidding, A/B creative testing'
  }
];

export const MARKETING_STACK_TOOLS = [
  { id: 'design-tools', name: 'Design Tools', costRange: '$30 – $100/mo', type: 'tool' },
  { id: 'video-tools', name: 'Video Editing Apps', costRange: '$20 – $80/mo', type: 'tool' },
  { id: 'ai-copy', name: 'AI Copywriting', costRange: '$20 – $100/mo', type: 'tool' },
  { id: 'social-schedulers', name: 'Social Schedulers', costRange: '$50 – $250/mo', type: 'tool' },
  { id: 'seo-tools', name: 'SEO & Keywords', costRange: '$99 – $299/mo', type: 'tool' },
  { id: 'lead-crm', name: 'Lead Scraping & CRM', costRange: '$150 – $800/mo', type: 'tool' },
  { id: 'freelancers', name: 'Freelancers & Contractors', costRange: '$1,000 – $5,000/mo', type: 'labor' },
  { id: 'agencies', name: 'Specialized Agencies', costRange: '$2,500 – $10,000+/mo', type: 'agency' },
  { id: 'ad-spend', name: 'Paid Advertising Budget', costRange: '$1,000 – $10,000+/mo', type: 'spend' }
];
