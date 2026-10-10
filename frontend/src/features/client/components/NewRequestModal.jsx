import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  CheckSquare,
  Square,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SERVICES_CATALOG } from '../data/servicesData';
import { api } from '../../../services/api';

/**
 * Service Configuration Registry
 * Authoritative registry of all service metadata, pricing, badges, and scope breakdowns.
 */
const SERVICE_CONFIGS = {
  'strategic-planner': {
    serviceType: 'COMPANY_BOOST',
    subService: 'STRATEGIC_PLAN',
    channel: 'boosting',
    badge: 'STRATEGIC PLAN SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: Strategic Plan Sprint',
    accentColor: '#EC4899',
    accentBg: '#FDF2F8',
    price: 19,
    breakdown: [
      { item: 'Market & Positioning Architecture (3 months plan)', amount: 10 },
      { item: 'Outbound Playbook & Growth Sequencing', amount: 9 },
    ],
  },
  'content-creator': {
    serviceType: 'COMPANY_BOOST',
    subService: 'CONTENT',
    channel: 'boosting',
    badge: 'CONTENT PRODUCTION SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: Content Production Sprint',
    accentColor: '#F43F5E',
    accentBg: '#FFF1F2',
    price: 29,
    breakdown: [
      { item: 'Branded Posters (2 posters + 1 branding)', amount: 15 },
      { item: 'Reels & Visual Creative Assets (3 reels)', amount: 14 },
    ],
  },
  'devrel': {
    serviceType: 'COMPANY_BOOST',
    subService: 'DEVREL',
    channel: 'boosting',
    badge: 'DEVREL STRATEGY SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: DevRel Strategy Sprint',
    accentColor: '#8B5CF6',
    accentBg: '#F5F3FF',
    price: 49,
    breakdown: [
      { item: 'Developer Ecosystem & Documentation Audit', amount: 25 },
      { item: 'Community, content creation & developer feedback', amount: 24 },
    ],
  },
  'gtm': {
    serviceType: 'COMPANY_BOOST',
    subService: 'GTM_STRATEGY',
    channel: 'boosting',
    badge: 'GTM STRATEGY SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: GTM Strategy Sprint',
    accentColor: '#10B981',
    accentBg: '#ECFDF5',
    price: 19,
    breakdown: [
      { item: 'GTM Launch Playbook & 2 Months Reach Plan', amount: 10 },
      { item: 'GTM Strategy Brochure & Collateral Deck', amount: 9 },
    ],
  },
  'gtm-strategy': {
    serviceType: 'COMPANY_BOOST',
    subService: 'GTM_STRATEGY',
    channel: 'boosting',
    badge: 'GTM STRATEGY SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: GTM Strategy Sprint',
    accentColor: '#10B981',
    accentBg: '#ECFDF5',
    price: 19,
    breakdown: [
      { item: 'GTM Launch Playbook & 2 Months Reach Plan', amount: 10 },
      { item: 'GTM Strategy Brochure & Collateral Deck', amount: 9 },
    ],
  },
  'ad-creatives': {
    serviceType: 'COMPANY_BOOST',
    subService: 'AD_CREATIVES',
    channel: 'boosting',
    badge: 'AD CREATIVES SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: Ad Creatives Sprint',
    accentColor: '#EF4444',
    accentBg: '#FEF2F2',
    price: 10,
    breakdown: [
      { item: 'Visual Ad Creative Pack (4 posters + boosting)', amount: 6 },
      { item: 'Ad Copy Angles & Creative Testing Matrix', amount: 4 },
    ],
  },
  'brand-identity': {
    serviceType: 'COMPANY_BOOST',
    subService: 'STRATEGIC_PLAN',
    channel: 'boosting',
    badge: 'BRAND IDENTITY SPRINT',
    categoryLabel: 'Company Boost Service',
    serviceLabel: 'Company Boost: Brand Identity Sprint',
    accentColor: '#3B82F6',
    accentBg: '#EFF6FF',
    price: 5,
    breakdown: [
      { item: 'Platforms access like Meta + Instagram + Facebook', amount: 3 },
      { item: 'Brand Guidelines & Narrative Matrix', amount: 2 },
    ],
  },
  'custom-boosting': {
    serviceType: 'COMPANY_BOOST',
    subService: 'CUSTOM',
    channel: 'boosting',
    badge: 'CUSTOM SPRINT',
    categoryLabel: 'Multidisciplinary Service',
    serviceLabel: 'Custom Scope Growth Sprint',
    accentColor: '#7C3AED',
    accentBg: '#F5F3FF',
    price: 19,
    breakdown: [
      { item: 'Custom Multidisciplinary Scope (Configured Service Areas)', amount: 19 },
    ],
  },
  'lead-research': {
    serviceType: 'COMPANY_LEAD',
    subService: 'LEAD_RESEARCH',
    channel: 'digitalising',
    badge: 'LEAD RESEARCH SPRINT',
    categoryLabel: 'Digitalising Service',
    serviceLabel: 'Digitalising: Target Lead Research Sprint',
    accentColor: '#7C3AED',
    accentBg: '#EDE9FE',
    price: 2,
    breakdown: [
      { item: 'Prospecting & Lead Study ($2 per lead)', amount: 1 },
      { item: 'Direct Contact & Pitch Deck Verification', amount: 1 },
    ],
  },
  'company-study': {
    serviceType: 'COMPANY_LEAD',
    subService: 'COMPANY_STUDY',
    channel: 'digitalising',
    badge: 'COMPANY STUDY SPRINT',
    categoryLabel: 'Digitalising Service',
    serviceLabel: 'Digitalising: Company Study Dossier Sprint',
    accentColor: '#6366F1',
    accentBg: '#EEF2FF',
    price: 1,
    breakdown: [
      { item: 'Personal Company Study & Org Architecture', amount: 1 },
    ],
  },
  'key-people': {
    serviceType: 'COMPANY_LEAD',
    subService: 'KEY_PEOPLE',
    channel: 'digitalising',
    badge: 'KEY PEOPLE RESEARCH SPRINT',
    categoryLabel: 'Digitalising Service',
    serviceLabel: 'Digitalising: Key People Research Sprint',
    accentColor: '#0EA5E9',
    accentBg: '#F0F9FF',
    price: 2,
    breakdown: [
      { item: 'Key Profile Mapping & Hierarchy', amount: 1 },
      { item: 'Direct Mail Contact Signals', amount: 1 },
    ],
  },
  'pitch-support': {
    serviceType: 'COMPANY_LEAD',
    subService: 'PITCH_SUPPORT',
    channel: 'digitalising',
    badge: 'PITCH SUPPORT SPRINT',
    categoryLabel: 'Digitalising Service',
    serviceLabel: 'Digitalising: Pitch Support & Narrative Sprint',
    accentColor: '#0284C7',
    accentBg: '#E0F2FE',
    price: 2,
    breakdown: [
      { item: 'Pitch Support & Core Narrative', amount: 1 },
      { item: 'Competitor Analysis & Objection Engineering', amount: 1 },
    ],
  },
  'custom-digitalising': {
    serviceType: 'COMPANY_LEAD',
    subService: 'CUSTOM',
    channel: 'digitalising',
    badge: 'CUSTOM SPRINT',
    categoryLabel: 'Multidisciplinary Service',
    serviceLabel: 'Custom Scope Growth Sprint',
    accentColor: '#7C3AED',
    accentBg: '#F5F3FF',
    price: 2,
    breakdown: [
      { item: 'Custom Multidisciplinary Scope (Configured Service Areas)', amount: 2 },
    ],
  },
  'custom': {
    serviceType: 'COMPANY_BOOST',
    subService: 'CUSTOM',
    channel: 'custom',
    badge: 'CUSTOM SERVICE SPRINT',
    categoryLabel: 'Multi-Service Container',
    serviceLabel: 'Custom Multi-Service Sprint',
    accentColor: '#7C3AED',
    accentBg: '#F5F3FF',
    price: 19,
    breakdown: [
      { item: 'Custom Multi-Service Scope (Configured Service Modules)', amount: 19 },
    ],
  },
  'ui-ux-audit': {
    serviceType: 'LANDING_PAGE',
    subService: 'UI_UX_AUDIT',
    channel: 'design',
    badge: 'UI/UX AUDIT SPRINT',
    categoryLabel: 'UI/Design Service',
    serviceLabel: 'UI / Design: UI/UX Audit & Usability Sprint',
    accentColor: '#0284C7',
    accentBg: '#F0F9FF',
    price: 19,
    breakdown: [
      { item: 'Mock screens + prototype review diagnostics', amount: 10 },
      { item: 'Heuristic Evaluation & Severity Matrix', amount: 9 },
    ],
  },
  'figma-project': {
    serviceType: 'LANDING_PAGE',
    subService: 'FIGMA_PROJECT',
    channel: 'design',
    badge: 'FIGMA DESIGN SYSTEM SPRINT',
    categoryLabel: 'UI/Design Service',
    serviceLabel: 'UI / Design: Figma Component System Sprint',
    accentColor: '#8B5CF6',
    accentBg: '#F5F3FF',
    price: 9,
    breakdown: [
      { item: 'Mock screens + prototype components', amount: 5 },
      { item: 'Design System & Component Token Specs', amount: 4 },
    ],
  },
  'redesign-request': {
    serviceType: 'LANDING_PAGE',
    subService: 'REDESIGN_REQUEST',
    channel: 'design',
    badge: 'LANDING PAGE REDESIGN SPRINT',
    categoryLabel: 'UI/Design Service',
    serviceLabel: 'UI / Design: Landing Page Redesign Sprint',
    accentColor: '#EC4899',
    accentBg: '#FDF2F8',
    price: 59,
    breakdown: [
      { item: 'High-Impact Hero & Conversion Layout Architecture', amount: 39 },
      { item: 'Production Component Specs & Before/After Deck', amount: 20 },
    ],
  },
};

const CUSTOM_SERVICE_PRICES = {
  strategicPlan: 19,
  content: 29,
  brandIdentity: 5,
  adCreatives: 10,
  gtm: 19,
  devrel: 49,
  leadResearch: 2,
  companyStudy: 1,
  keyPeople: 2,
  pitchSupport: 2,
  uiUxAudit: 19,
  figmaProject: 9,
  redesignRequest: 59,
  apiBackend: 49,
  mobileApp: 199,
  webApp: 1500,
};

export default function NewRequestModal({
  isOpen,
  onClose,
  initialServiceId = null,
  initialCustomData = null,
  onSuccess,
}) {
  const [step, setStep] = useState(1); // 1: Scope, 2: Review, 3: Price
  const [activeServiceId, setActiveServiceId] = useState('strategic-planner');
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [serverPriceData, setServerPriceData] = useState(null);

  // --- 1. Strategic Planner Form State ---
  const [strategicForm, setStrategicForm] = useState({
    mainGoal: '',
    targetMarket: '',
    focusArea: '',
    painPoints: '',
    expectedOutcome: '',
    competitors: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 2. Content Creator Form State ---
  const [contentForm, setContentForm] = useState({
    contentTypes: {
      poster: true,
      productVideo: false,
      socialContent: false,
      productShowcase: false,
      other: false,
    },
    deliverablesCount: '1 Poster + 1 Showcase Video',
    productHighlight: '',
    mainPurpose: '',
    targetAudience: '',
    preferredPlatforms: '',
    keyMessage: '',
    brandRequirements: '',
    referenceExamples: '',
    existingBrandAssets: '',
    additionalRequirements: '',
  });

  // --- 3. DevRel Form State ---
  const [devrelForm, setDevrelForm] = useState({
    mainDevrelGoal: '',
    productApiSdk: '',
    targetDeveloperAudience: '',
    developerPlatforms: '',
    developerAdoptionChallenges: '',
    documentationRequirements: '',
    communityRequirements: '',
    openSourceRequirements: '',
    developerContentRequirements: '',
    expectedOutcome: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 4. Custom Request Form State ---
  const [customForm, setCustomForm] = useState({
    selectedServices: {
      strategicPlan: false,
      content: false,
      devrel: false,
      gtm: false,
      adCreatives: false,
      brandIdentity: false,
      leadResearch: false,
      companyStudy: false,
      keyPeople: false,
      pitchSupport: false,
      uiUxAudit: false,
      figmaProject: false,
      redesignRequest: false,
      webApp: false,
      mobileApp: false,
      apiBackend: false,
    },
    requirements: '',
    expectedOutcome: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 5. Digitalising: Lead Research Form State ---
  const [leadForm, setLeadForm] = useState({
    leadsCount: '50',
    targetMarket: '',
    targetPersonas: '',
    companySize: '',
    qualificationCriteria: '',
    desiredDataPoints: 'Verified Work Email, Direct Phone, LinkedIn Profile',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 6. Digitalising: Company Study Form State ---
  const [companyStudyForm, setCompanyStudyForm] = useState({
    targetCompany: '',
    researchObjective: '',
    intelligenceDimensions: '',
    benchmarkCompanies: '',
    expectedOutcome: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 7. Digitalising: Key People Research Form State ---
  const [keyPeopleForm, setKeyPeopleForm] = useState({
    targetOrganizations: '',
    targetSeniority: '',
    intelligenceSignals: '',
    deliverableScope: '25 Verified Executive Profiles',
    expectedOutcome: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 8. Digitalising: Pitch Support Form State ---
  const [pitchSupportForm, setPitchSupportForm] = useState({
    pitchType: '',
    coreValueProposition: '',
    currentStatus: '',
    keyObjections: '',
    deliverableFormat: '10-Slide Deck + Narrative Brief',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 9. UI/Design: UI/UX Audit Form State ---
  const [auditForm, setAuditForm] = useState({
    targetUrl: '',
    primaryUserFlow: '',
    knownFriction: '',
    targetAudience: '',
    additionalNotes: '',
  });

  // --- 10. UI/Design: Figma Project Form State ---
  const [figmaForm, setFigmaForm] = useState({
    projectName: '',
    designScope: '',
    brandGuidelines: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 11. UI/Design: Redesign Request Form State ---
  const [redesignForm, setRedesignForm] = useState({
    targetUrl: '',
    redesignObjective: '',
    targetAudience: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 12. GTM Strategy Form State ---
  const [gtmForm, setGtmForm] = useState({
    launchGoal: '',
    targetProduct: '',
    targetMarket: '',
    distributionChannels: '',
    launchTimeline: '',
    competitors: '',
    referenceLinks: '',
    additionalRequirements: '',
  });

  // --- 13. Ad Creatives Form State ---
  const [adCreativesForm, setAdCreativesForm] = useState({
    campaignObjective: '',
    adFormats: {
      square: true,
      story: true,
      landscape: false,
      carousel: false,
    },
    targetPlatforms: 'Meta (Instagram & Facebook), LinkedIn',
    targetAudience: '',
    coreOffer: '',
    brandGuidelines: '',
    referenceExamples: '',
    additionalRequirements: '',
  });

  // Category filter tab inside Custom modal scope builder
  const [customModalTab, setCustomModalTab] = useState('all');

  // Initialize service when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setSubmitError('');
      setServerPriceData(null);
      setCustomModalTab('all');

      let serviceToUse = initialServiceId || 'custom';
      if (
        initialServiceId === 'custom' ||
        initialServiceId === 'custom-boosting' ||
        initialServiceId === 'custom-digitalising'
      ) {
        serviceToUse = 'custom';
      } else if (initialServiceId === 'gtm-strategy') {
        serviceToUse = 'gtm';
      }
      setActiveServiceId(serviceToUse);

      // Pre-fill custom form if passed
      if (initialCustomData) {
        if (initialCustomData.selectedServices) {
          setCustomForm((prev) => ({
            ...prev,
            selectedServices: {
              strategicPlan: false,
              content: false,
              devrel: false,
              gtm: false,
              adCreatives: false,
              brandIdentity: false,
              leadResearch: false,
              companyStudy: false,
              keyPeople: false,
              pitchSupport: false,
              uiUxAudit: false,
              figmaProject: false,
              redesignRequest: false,
              webApp: false,
              mobileApp: false,
              apiBackend: false,
              ...initialCustomData.selectedServices,
            },
          }));
        }
        if (initialCustomData.requirements) {
          setCustomForm((prev) => ({
            ...prev,
            requirements: initialCustomData.requirements,
          }));
        }
      }
    }
  }, [isOpen, initialServiceId, initialCustomData]);

  if (!isOpen) return null;

  const currentConfig = SERVICE_CONFIGS[activeServiceId] || SERVICE_CONFIGS['strategic-planner'];

  // --- VALIDATION FOR STEP 1 ---
  const validateStep1 = () => {
    const errs = {};

    if (activeServiceId === 'strategic-planner') {
      if (!strategicForm.mainGoal.trim()) errs.mainGoal = 'Main Goal is required';
      if (!strategicForm.targetMarket.trim()) errs.targetMarket = 'Target Market / Audience is required';
      if (!strategicForm.painPoints.trim()) errs.painPoints = 'Current Challenges / Pain Points are required';
    } else if (activeServiceId === 'content-creator') {
      const hasAnyType = Object.values(contentForm.contentTypes).some(Boolean);
      if (!hasAnyType) errs.contentTypes = 'Select at least one content type';
      if (!contentForm.deliverablesCount.trim()) errs.deliverablesCount = 'Deliverables count is required';
      if (!contentForm.productHighlight.trim()) errs.productHighlight = 'Product / Service to highlight is required';
      if (!contentForm.mainPurpose.trim()) errs.mainPurpose = 'Main purpose is required';
    } else if (activeServiceId === 'devrel') {
      if (!devrelForm.mainDevrelGoal.trim()) errs.mainDevrelGoal = 'Main DevRel Goal is required';
      if (!devrelForm.productApiSdk.trim()) errs.productApiSdk = 'Product / API / SDK is required';
      if (!devrelForm.targetDeveloperAudience.trim()) errs.targetDeveloperAudience = 'Target Developer Audience is required';
      if (!devrelForm.expectedOutcome.trim()) errs.expectedOutcome = 'Expected outcome is required';
    } else if (activeServiceId === 'custom' || activeServiceId === 'custom-boosting' || activeServiceId === 'custom-digitalising') {
      const hasSelectedService = Object.values(customForm.selectedServices).some(Boolean);
      if (!hasSelectedService) errs.selectedServices = 'Please select at least one service area';
      if (!customForm.requirements.trim()) errs.requirements = 'Please describe what you would like CreativeGini to prepare';
    } else if (activeServiceId === 'lead-research') {
      if (!leadForm.leadsCount || Number(leadForm.leadsCount) <= 0) errs.leadsCount = 'Number of leads must be greater than 0';
      if (!leadForm.targetMarket.trim()) errs.targetMarket = 'Target Market & Industry is required';
      if (!leadForm.targetPersonas.trim()) errs.targetPersonas = 'Target Personas / Titles are required';
      if (!leadForm.qualificationCriteria.trim()) errs.qualificationCriteria = 'Qualification criteria are required';
    } else if (activeServiceId === 'company-study') {
      if (!companyStudyForm.targetCompany.trim()) errs.targetCompany = 'Target Company Name is required';
      if (!companyStudyForm.researchObjective.trim()) errs.researchObjective = 'Primary Research Objective is required';
      if (!companyStudyForm.intelligenceDimensions.trim()) errs.intelligenceDimensions = 'Key Intelligence Dimensions are required';
    } else if (activeServiceId === 'key-people') {
      if (!keyPeopleForm.targetOrganizations.trim()) errs.targetOrganizations = 'Target Organizations are required';
      if (!keyPeopleForm.targetSeniority.trim()) errs.targetSeniority = 'Target Seniority is required';
      if (!keyPeopleForm.intelligenceSignals.trim()) errs.intelligenceSignals = 'Intelligence Signals are required';
    } else if (activeServiceId === 'pitch-support') {
      if (!pitchSupportForm.pitchType.trim()) errs.pitchType = 'Pitch Type / Primary Audience is required';
      if (!pitchSupportForm.coreValueProposition.trim()) errs.coreValueProposition = 'Core Value Proposition is required';
      if (!pitchSupportForm.currentStatus.trim()) errs.currentStatus = 'Current Pitch Deck Status is required';
    } else if (activeServiceId === 'ui-ux-audit') {
      if (!auditForm.targetUrl.trim()) errs.targetUrl = 'Target Website / Application URL is required';
      if (!auditForm.primaryUserFlow.trim()) errs.primaryUserFlow = 'Primary User Flow to Evaluate is required';
      if (!auditForm.knownFriction.trim()) errs.knownFriction = 'Known Friction Points are required';
    } else if (activeServiceId === 'figma-project') {
      if (!figmaForm.projectName.trim()) errs.projectName = 'Project / Product Name is required';
      if (!figmaForm.designScope.trim()) errs.designScope = 'Scope of Components / Screens Needed is required';
      if (!figmaForm.brandGuidelines.trim()) errs.brandGuidelines = 'Brand Guidelines / Visual Direction is required';
    } else if (activeServiceId === 'redesign-request') {
      if (!redesignForm.targetUrl.trim()) errs.targetUrl = 'Current Page URL is required';
      if (!redesignForm.redesignObjective.trim()) errs.redesignObjective = 'Primary Redesign Objective is required';
      if (!redesignForm.targetAudience.trim()) errs.targetAudience = 'Target Audience is required';
    } else if (activeServiceId === 'gtm' || activeServiceId === 'gtm-strategy') {
      if (!gtmForm.launchGoal.trim()) errs.launchGoal = 'Launch Goal / Objective is required';
      if (!gtmForm.targetProduct.trim()) errs.targetProduct = 'Product / Feature Name is required';
      if (!gtmForm.targetMarket.trim()) errs.targetMarket = 'Target Market / Audience is required';
    } else if (activeServiceId === 'ad-creatives') {
      if (!adCreativesForm.campaignObjective.trim()) errs.campaignObjective = 'Campaign Objective is required';
      if (!adCreativesForm.targetAudience.trim()) errs.targetAudience = 'Target Audience is required';
      if (!adCreativesForm.coreOffer.trim()) errs.coreOffer = 'Core Offer / Value Hook is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToReview = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // --- STEP 2 -> STEP 3: CALCULATE PRICE ---
  const handleProceedToPrice = async () => {
    setIsCalculating(true);
    setSubmitError('');

    try {
      const payload = {
        serviceType: currentConfig.serviceType,
        subService: currentConfig.subService,
        requirements: getActiveRequirements(),
        selectedServices: getActiveSelectedServices(),
      };

      const pricing = await api.calculatePrice(payload);
      setServerPriceData(pricing);
      setStep(3);
    } catch (err) {
      console.warn('Backend price calculation fallback to local config:', err);
      let fallbackPrice = currentConfig.price;
      let fallbackBreakdown = currentConfig.breakdown;

      if (activeServiceId.startsWith('custom')) {
        const dynamicSum = Object.entries(customForm.selectedServices).reduce((sum, [k, v]) => {
          return v ? sum + (CUSTOM_SERVICE_PRICES[k] || 0) : sum;
        }, 0);
        if (dynamicSum > 0) {
          fallbackPrice = dynamicSum;
          fallbackBreakdown = Object.entries(customForm.selectedServices)
            .filter(([_, v]) => v)
            .map(([k]) => ({
              item: k,
              amount: CUSTOM_SERVICE_PRICES[k] || 0,
            }));
        }
      }

      setServerPriceData({
        price: fallbackPrice,
        currency: 'USD',
        pricingStatus: 'CONFIGURED',
        serviceLabel: currentConfig.serviceLabel,
        breakdown: fallbackBreakdown,
      });
      setStep(3);
    } finally {
      setIsCalculating(false);
    }
  };

  const getActiveRequirements = () => {
    switch (activeServiceId) {
      case 'strategic-planner':
        return { ...strategicForm, serviceId: activeServiceId };
      case 'content-creator':
        return { ...contentForm, serviceId: activeServiceId };
      case 'devrel':
        return { ...devrelForm, serviceId: activeServiceId };
      case 'custom':
      case 'custom-boosting':
      case 'custom-digitalising': {
        const dynamicSum = Object.entries(customForm.selectedServices).reduce((sum, [k, v]) => {
          return v ? sum + (CUSTOM_SERVICE_PRICES[k] || 0) : sum;
        }, 0);
        return {
          ...customForm,
          totalPrice: customForm.totalPrice || (dynamicSum > 0 ? dynamicSum : 19),
          serviceId: activeServiceId,
          contentDetails: customForm.selectedServices.content ? contentForm : undefined,
          devrelDetails: customForm.selectedServices.devrel ? devrelForm : undefined,
          gtmDetails: customForm.selectedServices.gtm ? gtmForm : undefined,
          adCreativesDetails: customForm.selectedServices.adCreatives ? adCreativesForm : undefined,
          leadResearchDetails: customForm.selectedServices.leadResearch ? leadForm : undefined,
          companyStudyDetails: customForm.selectedServices.companyStudy ? companyStudyForm : undefined,
          keyPeopleDetails: customForm.selectedServices.keyPeople ? keyPeopleForm : undefined,
          pitchSupportDetails: customForm.selectedServices.pitchSupport ? pitchSupportForm : undefined,
          strategicPlanDetails: customForm.selectedServices.strategicPlan ? strategicForm : undefined,
        };
      }
      case 'gtm':
      case 'gtm-strategy':
        return { ...gtmForm, serviceId: activeServiceId };
      case 'ad-creatives':
        return { ...adCreativesForm, serviceId: activeServiceId };
      case 'lead-research':
        return { ...leadForm, serviceId: activeServiceId };
      case 'company-study':
        return { ...companyStudyForm, serviceId: activeServiceId };
      case 'key-people':
        return { ...keyPeopleForm, serviceId: activeServiceId };
      case 'pitch-support':
        return { ...pitchSupportForm, serviceId: activeServiceId };
      case 'ui-ux-audit':
        return { ...auditForm, serviceId: activeServiceId };
      case 'figma-project':
        return { ...figmaForm, serviceId: activeServiceId };
      case 'redesign-request':
        return { ...redesignForm, serviceId: activeServiceId };
      default:
        return { ...strategicForm, serviceId: activeServiceId };
    }
  };

  const getActiveSelectedServices = () => {
    if (activeServiceId.startsWith('custom')) {
      return Object.entries(customForm.selectedServices)
        .filter(([_, v]) => v)
        .map(([k]) => k);
    }
    return [currentConfig.subService];
  };

  const getComputedTitle = () => {
    switch (activeServiceId) {
      case 'strategic-planner':
        return strategicForm.mainGoal ? `Strategic Plan: ${strategicForm.mainGoal}` : 'Strategic Plan Sprint';
      case 'content-creator':
        return contentForm.productHighlight ? `Content Sprint: ${contentForm.productHighlight}` : 'Content Production Sprint';
      case 'devrel':
        return devrelForm.productApiSdk ? `DevRel Sprint: ${devrelForm.productApiSdk}` : 'DevRel Strategy Sprint';
      case 'gtm':
      case 'gtm-strategy':
        return gtmForm.launchGoal ? `GTM Strategy: ${gtmForm.launchGoal}` : 'GTM Strategy Sprint';
      case 'ad-creatives':
        return adCreativesForm.campaignObjective ? `Ad Creatives: ${adCreativesForm.campaignObjective}` : 'Ad Creatives Sprint';
      case 'lead-research':
        return `Lead Research: ${leadForm.leadsCount} Verified Contacts (${leadForm.targetMarket || 'Target Accounts'})`;
      case 'company-study':
        return `Company Dossier: ${companyStudyForm.targetCompany || 'Target Account Study'}`;
      case 'key-people':
        return `Key People Research: ${keyPeopleForm.targetOrganizations || 'Executive Contacts'}`;
      case 'pitch-support':
        return `Pitch Support: ${pitchSupportForm.pitchType || 'Executive Sales Deck'}`;
      case 'ui-ux-audit':
        return `UI/UX Audit: ${auditForm.targetUrl || 'Usability Diagnostics'}`;
      case 'figma-project':
        return `Figma Project: ${figmaForm.projectName || 'Design System'}`;
      case 'redesign-request':
        return `Redesign Request: ${redesignForm.targetUrl || 'Page Redesign'}`;
      case 'custom':
        return 'Custom Scope Growth Sprint';
      case 'custom-boosting':
        return 'Custom Boost Growth Sprint';
      case 'custom-digitalising':
        return 'Custom Digitalising Intelligence Sprint';
      default:
        return currentConfig.serviceLabel;
    }
  };

  // --- SUBMIT TICKET ---
  const handleConfirmAndSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        title: getComputedTitle(),
        description:
          strategicForm.mainGoal ||
          gtmForm.launchGoal ||
          adCreativesForm.campaignObjective ||
          contentForm.mainPurpose ||
          devrelForm.mainDevrelGoal ||
          customForm.requirements ||
          leadForm.qualificationCriteria ||
          companyStudyForm.researchObjective ||
          auditForm.knownFriction ||
          figmaForm.designScope ||
          redesignForm.redesignObjective ||
          `Configured request for ${currentConfig.serviceLabel}`,
        serviceType: currentConfig.serviceType,
        subService: currentConfig.subService,
        priority: 'MEDIUM',
        requirements: getActiveRequirements(),
        selectedServices: getActiveSelectedServices(),
      };

      const newTicket = await api.createRequest(payload);
      if (onSuccess) onSuccess(newTicket);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit sprint request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authoritative prices
  const displayPrice = serverPriceData?.price ?? currentConfig.price;
  const displayLabel = serverPriceData?.serviceLabel ?? currentConfig.serviceLabel;
  const displayBreakdown = serverPriceData?.breakdown ?? currentConfig.breakdown;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--cg-border-light, #E5E7EB)',
          boxShadow: '0 25px 60px -15px rgba(124, 58, 237, 0.15), 0 0 20px rgba(0, 0, 0, 0.06)',
          fontFamily: 'var(--cg-font-family, "Inter", sans-serif)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================
            1. MODAL HEADER (Light Theme with Stepper)
            ============================================================ */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: currentConfig.accentBg,
                  color: currentConfig.accentColor,
                  border: `1px solid ${currentConfig.accentColor}30`,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {currentConfig.badge}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>{currentConfig.categoryLabel}</span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: 0,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              {step === 1 && 'Tell us what you need'}
              {step === 2 && 'Review Your Requirements'}
              {step === 3 && 'Your Request Price'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Stepper Progress Pill Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[
                { num: 1, label: '1 Scope' },
                { num: 2, label: '2 Review' },
                { num: 3, label: '3 Price' },
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background:
                        step === s.num
                          ? '#EDE9FE'
                          : step > s.num
                          ? '#ECFDF5'
                          : '#F3F4F6',
                      color:
                        step === s.num
                          ? '#7C3AED'
                          : step > s.num
                          ? '#059669'
                          : '#6B7280',
                      border:
                        step === s.num
                          ? '1px solid #C4B5FD'
                          : step > s.num
                          ? '1px solid #A7F3D0'
                          : '1px solid transparent',
                    }}
                  >
                    <span>{s.label}</span>
                  </div>
                  {idx < 2 && <span style={{ color: '#D1D5DB', fontSize: '0.75rem' }}>→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ============================================================
            2. MODAL BODY (Scrollable content with Light Theme Styling)
            ============================================================ */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#F8F9FC',
          }}
        >
          {submitError && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          {/* ==========================================================
              STEP 1: FORM FIELDS (Tailored per Module)
              ========================================================== */}
          {step === 1 && (
            <div>
              <p style={{ color: '#4B5563', fontSize: '0.875rem', marginTop: 0, marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Provide your requirements below. Required fields are marked with an asterisk (<span style={{ color: '#EF4444' }}>*</span>).
              </p>

              {/* ------------------------------------------------------
                  CASE A: STRATEGIC PLAN SPRINT (Image 1 in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'strategic-planner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>
                      Main Goal <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      style={inputStyle(errors.mainGoal)}
                      placeholder="e.g. Enterprise account expansion, market repositioning, GTM outbound strategy"
                      value={strategicForm.mainGoal}
                      onChange={(e) => setStrategicForm({ ...strategicForm, mainGoal: e.target.value })}
                    />
                    {errors.mainGoal && <div style={errorStyle}>{errors.mainGoal}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Market / Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetMarket)}
                        placeholder="e.g. North American B2B SaaS, Seed to Series B"
                        value={strategicForm.targetMarket}
                        onChange={(e) => setStrategicForm({ ...strategicForm, targetMarket: e.target.value })}
                      />
                      {errors.targetMarket && <div style={errorStyle}>{errors.targetMarket}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>What Should CreativeGini Focus On?</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Ideal customer profile definition, positioning copy, cc"
                        value={strategicForm.focusArea}
                        onChange={(e) => setStrategicForm({ ...strategicForm, focusArea: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Current Challenges / Pain Points <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.painPoints)}
                      placeholder="Describe your current bottlenecks, conversion issues, or competitive headwinds..."
                      value={strategicForm.painPoints}
                      onChange={(e) => setStrategicForm({ ...strategicForm, painPoints: e.target.value })}
                    />
                    {errors.painPoints && <div style={errorStyle}>{errors.painPoints}</div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Expected Outcome</label>
                    <textarea
                      rows={2}
                      style={textareaStyle()}
                      placeholder="e.g. Actionable 60-day outbound roadmap, clear pitch deck narrative, sales collateral templates"
                      value={strategicForm.expectedOutcome}
                      onChange={(e) => setStrategicForm({ ...strategicForm, expectedOutcome: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Competitors / Reference Companies</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Acme Corp, Linear, Retool"
                        value={strategicForm.competitors}
                        onChange={(e) => setStrategicForm({ ...strategicForm, competitors: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Reference Links</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. https://yourcompany.com/pitch or Notion link"
                        value={strategicForm.referenceLinks}
                        onChange={(e) => setStrategicForm({ ...strategicForm, referenceLinks: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Additional Requirements</label>
                    <textarea
                      rows={2}
                      style={textareaStyle()}
                      placeholder="Any specific constraints, timelines, or tone preferences..."
                      value={strategicForm.additionalRequirements}
                      onChange={(e) => setStrategicForm({ ...strategicForm, additionalRequirements: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE B: CONTENT PRODUCTION SPRINT (Image 3 in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'content-creator' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>
                      Content Type <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                      {[
                        { key: 'poster', label: 'Poster / Visual Asset' },
                        { key: 'productVideo', label: 'Product Video' },
                        { key: 'socialContent', label: 'Social Media Content' },
                        { key: 'productShowcase', label: 'Product Showcase' },
                        { key: 'other', label: 'Other' },
                      ].map((t) => {
                        const isChecked = !!contentForm.contentTypes[t.key];
                        return (
                          <label
                            key={t.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              background: isChecked ? '#F5F3FF' : '#FFFFFF',
                              border: isChecked ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                              cursor: 'pointer',
                              fontSize: '0.84375rem',
                              fontWeight: isChecked ? 600 : 500,
                              color: isChecked ? '#6D28D9' : '#4B5563',
                              userSelect: 'none',
                              boxShadow: isChecked ? '0 1px 3px rgba(124, 58, 237, 0.15)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setContentForm({
                                  ...contentForm,
                                  contentTypes: { ...contentForm.contentTypes, [t.key]: e.target.checked },
                                })
                              }
                              style={{ display: 'none' }}
                            />
                            {isChecked ? <CheckSquare size={16} color="#7C3AED" /> : <Square size={16} color="#9CA3AF" />}
                            <span>{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.contentTypes && <div style={errorStyle}>{errors.contentTypes}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Number / Type of Deliverables <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.deliverablesCount)}
                        placeholder="1 Poster + 1 Showcase Video"
                        value={contentForm.deliverablesCount}
                        onChange={(e) => setContentForm({ ...contentForm, deliverablesCount: e.target.value })}
                      />
                      {errors.deliverablesCount && <div style={errorStyle}>{errors.deliverablesCount}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Product / Service to Highlight <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.productHighlight)}
                        placeholder="e.g. AI Workflow Engine, Enterprise Data Layer"
                        value={contentForm.productHighlight}
                        onChange={(e) => setContentForm({ ...contentForm, productHighlight: e.target.value })}
                      />
                      {errors.productHighlight && <div style={errorStyle}>{errors.productHighlight}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Main Purpose <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <textarea
                        rows={2}
                        style={textareaStyle(errors.mainPurpose)}
                        placeholder="e.g. Product launch announcement, LinkedIn paid campaign, lead generation"
                        value={contentForm.mainPurpose}
                        onChange={(e) => setContentForm({ ...contentForm, mainPurpose: e.target.value })}
                      />
                      {errors.mainPurpose && <div style={errorStyle}>{errors.mainPurpose}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>Target Audience</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Enterprise CTOs, VP Product, Web3 Developers"
                        value={contentForm.targetAudience}
                        onChange={(e) => setContentForm({ ...contentForm, targetAudience: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Preferred Platforms</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. LinkedIn, Twitter / X, YouTube, Website Hero"
                        value={contentForm.preferredPlatforms}
                        onChange={(e) => setContentForm({ ...contentForm, preferredPlatforms: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Key Message</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. The fastest way to build enterprise apps in 2026"
                        value={contentForm.keyMessage}
                        onChange={(e) => setContentForm({ ...contentForm, keyMessage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Brand / Style Requirements</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Clean minimalist typography, vibrant accents, sleek executive aesthetic"
                        value={contentForm.brandRequirements}
                        onChange={(e) => setContentForm({ ...contentForm, brandRequirements: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Reference Examples</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Links to visual styles, videos, or competitor creative you like"
                        value={contentForm.referenceExamples}
                        onChange={(e) => setContentForm({ ...contentForm, referenceExamples: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Existing Brand Assets</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Vector logo in Google Drive, brand kit available upon"
                        value={contentForm.existingBrandAssets}
                        onChange={(e) => setContentForm({ ...contentForm, existingBrandAssets: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. 16:9 widescreen format, subtitle/caption file required"
                        value={contentForm.additionalRequirements}
                        onChange={(e) => setContentForm({ ...contentForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE C: DEVREL STRATEGY SPRINT (Image 4 in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'devrel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Main DevRel Goal <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.mainDevrelGoal)}
                        placeholder="e.g. Increase SDK installs, launch developer hackathon,"
                        value={devrelForm.mainDevrelGoal}
                        onChange={(e) => setDevrelForm({ ...devrelForm, mainDevrelGoal: e.target.value })}
                      />
                      {errors.mainDevrelGoal && <div style={errorStyle}>{errors.mainDevrelGoal}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Product / API / SDK <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.productApiSdk)}
                        placeholder="e.g. CreativeGini TypeScript SDK, GraphQL Data API"
                        value={devrelForm.productApiSdk}
                        onChange={(e) => setDevrelForm({ ...devrelForm, productApiSdk: e.target.value })}
                      />
                      {errors.productApiSdk && <div style={errorStyle}>{errors.productApiSdk}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Developer Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetDeveloperAudience)}
                        placeholder="e.g. Senior Frontend Engineers, DevOps/SREs, Python"
                        value={devrelForm.targetDeveloperAudience}
                        onChange={(e) => setDevrelForm({ ...devrelForm, targetDeveloperAudience: e.target.value })}
                      />
                      {errors.targetDeveloperAudience && <div style={errorStyle}>{errors.targetDeveloperAudience}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>Developer Platforms / Communities</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. GitHub, Discord, Hacker News, Reddit r/webdev, St"
                        value={devrelForm.developerPlatforms}
                        onChange={(e) => setDevrelForm({ ...devrelForm, developerPlatforms: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Current Developer Adoption / Challenges</label>
                    <textarea
                      rows={2}
                      style={textareaStyle()}
                      placeholder="e.g. High initial drop-off during onboarding, missing code samples, complex auth setup..."
                      value={devrelForm.developerAdoptionChallenges}
                      onChange={(e) => setDevrelForm({ ...devrelForm, developerAdoptionChallenges: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Documentation Requirements</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Quickstart guide, interactive API playground, SDK reference..."
                        value={devrelForm.documentationRequirements}
                        onChange={(e) => setDevrelForm({ ...devrelForm, documentationRequirements: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Community Requirements</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Discord server structure, developer advocate office hours, community badges..."
                        value={devrelForm.communityRequirements}
                        onChange={(e) => setDevrelForm({ ...devrelForm, communityRequirements: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Open-Source Requirements</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. GitHub starter template, good first issues, contribution guidelines..."
                        value={devrelForm.openSourceRequirements}
                        onChange={(e) => setDevrelForm({ ...devrelForm, openSourceRequirements: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Developer Content Requirements</label>
                      <textarea
                        rows={2}
                        style={textareaStyle()}
                        placeholder="e.g. Technical tutorials, architecture deep dives, benchmark blog posts..."
                        value={devrelForm.developerContentRequirements}
                        onChange={(e) => setDevrelForm({ ...devrelForm, developerContentRequirements: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Expected Outcome <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      style={textareaStyle(errors.expectedOutcome)}
                      placeholder="e.g. Complete DevRel operational blueprint, 30-day developer acquisition sprint plan"
                      value={devrelForm.expectedOutcome}
                      onChange={(e) => setDevrelForm({ ...devrelForm, expectedOutcome: e.target.value })}
                    />
                    {errors.expectedOutcome && <div style={errorStyle}>{errors.expectedOutcome}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. https://github.com/your-repo or API docs link"
                        value={devrelForm.referenceLinks}
                        onChange={(e) => setDevrelForm({ ...devrelForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Integration with Stripe dev portal style"
                        value={devrelForm.additionalRequirements}
                        onChange={(e) => setDevrelForm({ ...devrelForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE D: CUSTOM REQUEST (Image 5 in Light Theme)
                  ------------------------------------------------------ */}
              {/* ------------------------------------------------------
                  CASE D: CUSTOM REQUEST (Application Light Theme)
                  ------------------------------------------------------ */}
              {(activeServiceId === 'custom' || activeServiceId === 'custom-boosting' || activeServiceId === 'custom-digitalising') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Category Filter Tabs & Selected Count */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>
                        SELECT WHAT YOU NEED: <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#7C3AED',
                            backgroundColor: '#F5F3FF',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            border: '1px solid #DDD4FA',
                          }}
                        >
                          {Object.values(customForm.selectedServices).filter(Boolean).length} Services Selected
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: '#059669',
                            backgroundColor: '#ECFDF5',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          Est: ${Object.entries(customForm.selectedServices).reduce((sum, [k, v]) => v ? sum + (CUSTOM_SERVICE_PRICES[k] || 0) : sum, 0).toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: 'All Services (16)' },
                        { id: 'boosting', label: 'Boosting (6)' },
                        { id: 'digitalising', label: 'Digitalising (4)' },
                        { id: 'design', label: 'UI / Design (3)' },
                        { id: 'development', label: 'App Development (3)' },
                      ].map((tab) => {
                        const isActive = customModalTab === tab.id;
                        return (
                          <button
                            type="button"
                            key={tab.id}
                            onClick={() => setCustomModalTab(tab.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: isActive ? '#7C3AED' : '#F9FAFB',
                              color: isActive ? '#FFFFFF' : '#4B5563',
                              border: isActive ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* All 16 Services Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {[
                        // Boosting
                        { key: 'strategicPlan', category: 'boosting', label: 'Strategic Planner', sub: '3 months plan', price: 19, color: '#EC4899', bg: '#FDF2F8' },
                        { key: 'content', category: 'boosting', label: 'Content Creator', sub: '2 posters + 3 reels + 1 branding', price: 29, color: '#F43F5E', bg: '#FFF1F2' },
                        { key: 'brandIdentity', category: 'boosting', label: 'Brand Identity', sub: 'Meta + Insta + FB platforms access', price: 5, color: '#3B82F6', bg: '#EFF6FF' },
                        { key: 'adCreatives', category: 'boosting', label: 'Ad Creatives', sub: '4 posters + boosting angles', price: 10, color: '#EF4444', bg: '#FEF2F2' },
                        { key: 'gtm', category: 'boosting', label: 'GTM Strategy', sub: '2 months reach plan', price: 19, color: '#10B981', bg: '#ECFDF5' },
                        { key: 'devrel', category: 'boosting', label: 'DevRel', sub: 'Community + content + feedback', price: 49, color: '#8B5CF6', bg: '#F5F3FF' },
                        // Digitalising
                        { key: 'leadResearch', category: 'digitalising', label: 'Lead Research', sub: 'Lead study + pitch deck ($2 per lead)', price: 2, color: '#7C3AED', bg: '#EDE9FE' },
                        { key: 'companyStudy', category: 'digitalising', label: 'Company Study', sub: 'Personal company study', price: 1, color: '#6366F1', bg: '#EEF2FF' },
                        { key: 'keyPeople', category: 'digitalising', label: 'Key People Research', sub: 'Key profile + direct mail', price: 2, color: '#0EA5E9', bg: '#F0F9FF' },
                        { key: 'pitchSupport', category: 'digitalising', label: 'Pitch Support', sub: 'Pitch + competitor analysis', price: 2, color: '#10B981', bg: '#ECFDF5' },
                        // UI / Design
                        { key: 'uiUxAudit', category: 'design', label: 'UI/UX Audit', sub: 'Mock screens + prototype review', price: 19, color: '#0284C7', bg: '#F0F9FF' },
                        { key: 'figmaProject', category: 'design', label: 'Figma Project', sub: 'Mock screens + prototype UI kit', price: 9, color: '#7C3AED', bg: '#FAF5FF' },
                        { key: 'redesignRequest', category: 'design', label: 'Landing Page Redesign', sub: 'Full page redesign & conversion overhaul', price: 59, color: '#EC4899', bg: '#FDF2F8' },
                        // App Development
                        { key: 'apiBackend', category: 'development', label: 'Technical Discovery', sub: 'Architecture & schema planning', price: 49, color: '#6366F1', bg: '#EEF2FF' },
                        { key: 'mobileApp', category: 'development', label: 'Clickable App Prototype', sub: 'Interactive clickable prototype', price: 199, color: '#0D9488', bg: '#F0FDFA' },
                        { key: 'webApp', category: 'development', label: 'MVP Development', sub: 'POC + V1 turnkey application', price: 1500, color: '#059669', bg: '#ECFDF5' },
                      ]
                        .filter((s) => customModalTab === 'all' || s.category === customModalTab)
                        .map((srv) => {
                          const isChecked = !!customForm.selectedServices[srv.key];
                          return (
                            <div
                              key={srv.key}
                              onClick={() =>
                                setCustomForm({
                                  ...customForm,
                                  selectedServices: { ...customForm.selectedServices, [srv.key]: !isChecked },
                                })
                              }
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: isChecked ? '#F5F3FF' : '#FFFFFF',
                                border: isChecked ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
                                cursor: 'pointer',
                                userSelect: 'none',
                                boxShadow: isChecked ? '0 2px 6px rgba(124, 58, 237, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ marginTop: '2px' }}>
                                {isChecked ? <CheckSquare size={16} color="#7C3AED" /> : <Square size={16} color="#9CA3AF" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isChecked ? '#6D28D9' : '#111827' }}>
                                    {srv.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      color: isChecked ? '#7C3AED' : '#059669',
                                      backgroundColor: isChecked ? '#EDE9FE' : '#ECFDF5',
                                      padding: '2px 7px',
                                      borderRadius: '6px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    ${srv.price.toLocaleString()}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                                  {srv.sub}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {errors.selectedServices && <div style={errorStyle}>{errors.selectedServices}</div>}
                  </div>

                  {/* ----------------------------------------------------
                      INTERNAL REQUIREMENTS FOR SELECTED SERVICES
                      ---------------------------------------------------- */}
                  {Object.values(customForm.selectedServices).some(Boolean) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '4px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #E5E7EB',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>
                            Selected Services Requirements
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                            Specify deliverables and parameters for each service you selected:
                          </div>
                        </div>
                      </div>

                      {/* 1. Content for Your Company Card */}
                      {customForm.selectedServices.content && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #FBCFE8',
                            borderLeft: '4px solid #F43F5E',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#BE123C' }}>
                              Content for Your Company — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9F1239', backgroundColor: '#FFF1F2', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Content Types Needed</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                              {[
                                { key: 'poster', label: 'Branded Posters / Infographics' },
                                { key: 'productVideo', label: 'Showcase Video' },
                                { key: 'socialContent', label: 'Social Media Assets' },
                                { key: 'productShowcase', label: 'Interactive Walkthrough' },
                              ].map((type) => {
                                const checked = !!contentForm.contentTypes[type.key];
                                return (
                                  <button
                                    type="button"
                                    key={type.key}
                                    onClick={() =>
                                      setContentForm({
                                        ...contentForm,
                                        contentTypes: { ...contentForm.contentTypes, [type.key]: !checked },
                                      })
                                    }
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      background: checked ? '#FFF1F2' : '#F9FAFB',
                                      color: checked ? '#BE123C' : '#4B5563',
                                      border: checked ? '1px solid #FDA4AF' : '1px solid #E5E7EB',
                                    }}
                                  >
                                    {checked ? <CheckSquare size={13} color="#E11D48" /> : <Square size={13} color="#9CA3AF" />}
                                    <span>{type.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Deliverables Count</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. 1 Poster + 1 Showcase Video"
                                value={contentForm.deliverablesCount}
                                onChange={(e) => setContentForm({ ...contentForm, deliverablesCount: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Product / Feature to Highlight</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Core AI workflow engine"
                                value={contentForm.productHighlight}
                                onChange={(e) => setContentForm({ ...contentForm, productHighlight: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Primary Audience / Goal</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Product Hunt launch & B2B founders"
                                value={contentForm.mainPurpose}
                                onChange={(e) => setContentForm({ ...contentForm, mainPurpose: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. DevRel Plan Card */}
                      {customForm.selectedServices.devrel && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DDD6FE',
                            borderLeft: '4px solid #8B5CF6',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6D28D9' }}>
                              DevRel Plan — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5B21B6', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Main DevRel Goal</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Accelerate SDK adoption & documentation"
                                value={devrelForm.mainDevrelGoal}
                                onChange={(e) => setDevrelForm({ ...devrelForm, mainDevrelGoal: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Product / API / SDK Focus</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. TypeScript SDK & REST API"
                                value={devrelForm.productApiSdk}
                                onChange={(e) => setDevrelForm({ ...devrelForm, productApiSdk: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Target Developer Audience</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Full-stack devs, devops engineers"
                                value={devrelForm.targetDeveloperAudience}
                                onChange={(e) => setDevrelForm({ ...devrelForm, targetDeveloperAudience: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Lead Research Card */}
                      {customForm.selectedServices.leadResearch && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #DDD4FA',
                            borderLeft: '4px solid #7C3AED',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#5B21B6' }}>
                              Lead Research — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4C1D95', backgroundColor: '#EDE9FE', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Target Leads Volume</label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              {['50', '100', '250', '500'].map((vol) => (
                                <button
                                  type="button"
                                  key={vol}
                                  onClick={() => setLeadForm({ ...leadForm, leadsCount: vol })}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: leadForm.leadsCount === vol ? '#EDE9FE' : '#F9FAFB',
                                    color: leadForm.leadsCount === vol ? '#6D28D9' : '#4B5563',
                                    border: leadForm.leadsCount === vol ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                                  }}
                                >
                                  {vol} Leads
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Target Market & Industry</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. B2B SaaS in North America"
                                value={leadForm.targetMarket}
                                onChange={(e) => setLeadForm({ ...leadForm, targetMarket: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Target Personas / Titles</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. VP Engineering, CTO"
                                value={leadForm.targetPersonas}
                                onChange={(e) => setLeadForm({ ...leadForm, targetPersonas: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Qualification Criteria</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. 50-250 employees, Series A+"
                                value={leadForm.qualificationCriteria}
                                onChange={(e) => setLeadForm({ ...leadForm, qualificationCriteria: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. Company Study Card */}
                      {customForm.selectedServices.companyStudy && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #C7D2FE',
                            borderLeft: '4px solid #6366F1',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#3730A3' }}>
                              Company Study — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#312E81', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Target Company Name(s)</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Stripe, Datadog"
                                value={companyStudyForm.targetCompany}
                                onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, targetCompany: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Primary Research Objective</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Competitor analysis & ICP gap audit"
                                value={companyStudyForm.researchObjective}
                                onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, researchObjective: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Intelligence Dimensions</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Tech stack, pricing model"
                                value={companyStudyForm.intelligenceDimensions}
                                onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, intelligenceDimensions: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Key People Research Card */}
                      {customForm.selectedServices.keyPeople && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #BAE6FD',
                            borderLeft: '4px solid #0EA5E9',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369A1' }}>
                              Key People Research — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#075985', backgroundColor: '#F0F9FF', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Target Organizations</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Tier-1 FinTech enterprises"
                                value={keyPeopleForm.targetOrganizations}
                                onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetOrganizations: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Target Seniority / Roles</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. VP Engineering, CTO"
                                value={keyPeopleForm.targetSeniority}
                                onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetSeniority: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Deliverable Scope</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. 25 Verified Profiles"
                                value={keyPeopleForm.deliverableScope}
                                onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, deliverableScope: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 6. Pitch Support Card */}
                      {customForm.selectedServices.pitchSupport && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #A7F3D0',
                            borderLeft: '4px solid #10B981',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#047857' }}>
                              Pitch Support — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065F46', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Pitch Type / Target Audience</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Series A Deck, Enterprise Demo"
                                value={pitchSupportForm.pitchType}
                                onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, pitchType: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Core Value Proposition</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. 10x faster developer onboarding"
                                value={pitchSupportForm.coreValueProposition}
                                onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, coreValueProposition: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Deliverable Format</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. 10-Slide Deck + Brief"
                                value={pitchSupportForm.deliverableFormat}
                                onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, deliverableFormat: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 7. Strategic Plan Card */}
                      {customForm.selectedServices.strategicPlan && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #FBCFE8',
                            borderLeft: '4px solid #EC4899',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#BE185D' }}>
                              Strategic Plan — Specifications
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9D174D', backgroundColor: '#FDF2F8', padding: '2px 8px', borderRadius: '6px' }}>
                              ✓ Included
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div>
                              <label style={labelStyle}>Main Strategic Goal</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Repositioning to enterprise B2B"
                                value={strategicForm.mainGoal}
                                onChange={(e) => setStrategicForm({ ...strategicForm, mainGoal: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Target Market & ICP</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Mid-market engineering leaders"
                                value={strategicForm.targetMarket}
                                onChange={(e) => setStrategicForm({ ...strategicForm, targetMarket: e.target.value })}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Current Challenges / Focus</label>
                              <input
                                style={inputStyle()}
                                placeholder="e.g. Outbound conversion rates"
                                value={strategicForm.painPoints}
                                onChange={(e) => setStrategicForm({ ...strategicForm, painPoints: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* General Brief & Overall Scope */}
                  <div>
                    <label style={labelStyle}>
                      What would you like CreativeGini to prepare for you? <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      style={textareaStyle(errors.requirements)}
                      placeholder="Describe your specific requirements, key goals, target market, or customized deliverables..."
                      value={customForm.requirements}
                      onChange={(e) => setCustomForm({ ...customForm, requirements: e.target.value })}
                    />
                    {errors.requirements && <div style={errorStyle}>{errors.requirements}</div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Expected Outcome</label>
                    <textarea
                      rows={2}
                      style={textareaStyle()}
                      placeholder="e.g. Complete positioning narrative and matching hero visual asset pack"
                      value={customForm.expectedOutcome}
                      onChange={(e) => setCustomForm({ ...customForm, expectedOutcome: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. https://yourcompany.com or design docs"
                        value={customForm.referenceLinks}
                        onChange={(e) => setCustomForm({ ...customForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="Any specific constraints, tools, or delivery date preferences..."
                        value={customForm.additionalRequirements}
                        onChange={(e) => setCustomForm({ ...customForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE E: LEAD RESEARCH SPRINT (Digitalising in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'lead-research' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Number of Leads Required <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        style={inputStyle(errors.leadsCount)}
                        placeholder="50"
                        value={leadForm.leadsCount}
                        onChange={(e) => setLeadForm({ ...leadForm, leadsCount: e.target.value })}
                      />
                      {errors.leadsCount && <div style={errorStyle}>{errors.leadsCount}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Target Market & Industry <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetMarket)}
                        placeholder="e.g. North American B2B SaaS, HealthTech Series A-C"
                        value={leadForm.targetMarket}
                        onChange={(e) => setLeadForm({ ...leadForm, targetMarket: e.target.value })}
                      />
                      {errors.targetMarket && <div style={errorStyle}>{errors.targetMarket}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Personas / Titles <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetPersonas)}
                        placeholder="e.g. VP Sales, Chief Revenue Officer, Head of Growth"
                        value={leadForm.targetPersonas}
                        onChange={(e) => setLeadForm({ ...leadForm, targetPersonas: e.target.value })}
                      />
                      {errors.targetPersonas && <div style={errorStyle}>{errors.targetPersonas}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>Company Size / Revenue Criteria</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. 50–500 employees, $5M–$50M ARR"
                        value={leadForm.companySize}
                        onChange={(e) => setLeadForm({ ...leadForm, companySize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Ideal Customer Profile & Qualification Criteria <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.qualificationCriteria)}
                      placeholder="Describe specific criteria: tech stack used, geographic focus, hiring signals, exclusions..."
                      value={leadForm.qualificationCriteria}
                      onChange={(e) => setLeadForm({ ...leadForm, qualificationCriteria: e.target.value })}
                    />
                    {errors.qualificationCriteria && <div style={errorStyle}>{errors.qualificationCriteria}</div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Desired Data Points</label>
                    <input
                      style={inputStyle()}
                      placeholder="e.g. Verified Work Email, Direct Phone, LinkedIn Profile, CRM Enriched"
                      value={leadForm.desiredDataPoints}
                      onChange={(e) => setLeadForm({ ...leadForm, desiredDataPoints: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links / Target Accounts List</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Google Sheet link, CSV export, or competitor company list"
                        value={leadForm.referenceLinks}
                        onChange={(e) => setLeadForm({ ...leadForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. CSV format, CRM-ready headers"
                        value={leadForm.additionalRequirements}
                        onChange={(e) => setLeadForm({ ...leadForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE F: COMPANY STUDY SPRINT (Digitalising in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'company-study' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Company Name(s) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetCompany)}
                        placeholder="e.g. Datadog, Snowflake, Stripe"
                        value={companyStudyForm.targetCompany}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, targetCompany: e.target.value })}
                      />
                      {errors.targetCompany && <div style={errorStyle}>{errors.targetCompany}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Primary Research Objective <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.researchObjective)}
                        placeholder="e.g. Enterprise account penetration dossier, competitive displacement analysis"
                        value={companyStudyForm.researchObjective}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, researchObjective: e.target.value })}
                      />
                      {errors.researchObjective && <div style={errorStyle}>{errors.researchObjective}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Key Intelligence Dimensions <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.intelligenceDimensions)}
                      placeholder="e.g. Org chart hierarchy, current vendor stack, budget cycle, executive priorities..."
                      value={companyStudyForm.intelligenceDimensions}
                      onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, intelligenceDimensions: e.target.value })}
                    />
                    {errors.intelligenceDimensions && <div style={errorStyle}>{errors.intelligenceDimensions}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Benchmark / Competitor Companies</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Dynatrace, New Relic, Splunk"
                        value={companyStudyForm.benchmarkCompanies}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, benchmarkCompanies: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Expected Outcome / Deliverable Format</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. 15-page PDF dossier, Notion dashboard, executive summary slides"
                        value={companyStudyForm.expectedOutcome}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, expectedOutcome: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links / Existing Notes</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Internal CRM notes, previous call transcripts"
                        value={companyStudyForm.referenceLinks}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="Any specific constraints or deadlines..."
                        value={companyStudyForm.additionalRequirements}
                        onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE G: KEY PEOPLE RESEARCH (Digitalising in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'key-people' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Organizations / Accounts <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetOrganizations)}
                        placeholder="e.g. Top 25 Fortune 500 Financial Services institutions"
                        value={keyPeopleForm.targetOrganizations}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetOrganizations: e.target.value })}
                      />
                      {errors.targetOrganizations && <div style={errorStyle}>{errors.targetOrganizations}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Target Seniority & Functional Departments <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetSeniority)}
                        placeholder="e.g. C-Suite, VP / Director level across Engineering, InfoSec & Product"
                        value={keyPeopleForm.targetSeniority}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetSeniority: e.target.value })}
                      />
                      {errors.targetSeniority && <div style={errorStyle}>{errors.targetSeniority}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Required Intelligence Signals <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.intelligenceSignals)}
                      placeholder="e.g. Reporting structure, tenure, previous employers, public talks, patent filings..."
                      value={keyPeopleForm.intelligenceSignals}
                      onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, intelligenceSignals: e.target.value })}
                    />
                    {errors.intelligenceSignals && <div style={errorStyle}>{errors.intelligenceSignals}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Deliverable Scope</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. 25 verified executive profiles with verified direct contacts"
                        value={keyPeopleForm.deliverableScope}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, deliverableScope: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Expected Outcome</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Stakeholder mapping chart with champions & blockers identified"
                        value={keyPeopleForm.expectedOutcome}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, expectedOutcome: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Target account list in Notion or Google Sheet"
                        value={keyPeopleForm.referenceLinks}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="Any additional criteria..."
                        value={keyPeopleForm.additionalRequirements}
                        onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE H: PITCH SUPPORT SPRINT (Digitalising in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'pitch-support' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Pitch Type & Primary Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.pitchType)}
                        placeholder="e.g. Enterprise $100k+ Sales Pitch, Series A VC Deck, Strategic Partnership Proposal"
                        value={pitchSupportForm.pitchType}
                        onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, pitchType: e.target.value })}
                      />
                      {errors.pitchType && <div style={errorStyle}>{errors.pitchType}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Core Value Proposition / Narrative <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.coreValueProposition)}
                        placeholder="e.g. Next-gen autonomous AI coding platform saving 40% engineering hours"
                        value={pitchSupportForm.coreValueProposition}
                        onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, coreValueProposition: e.target.value })}
                      />
                      {errors.coreValueProposition && <div style={errorStyle}>{errors.coreValueProposition}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Current Pitch Deck / Narrative Status <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.currentStatus)}
                      placeholder="e.g. Have 12-slide Google Slides draft, need positioning overhaul and objection slides..."
                      value={pitchSupportForm.currentStatus}
                      onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, currentStatus: e.target.value })}
                    />
                    {errors.currentStatus && <div style={errorStyle}>{errors.currentStatus}</div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Key Objections / Competitor Battlecards</label>
                    <textarea
                      rows={2}
                      style={textareaStyle()}
                      placeholder="e.g. Incumbent vendor relationships, budget freeze, compliance concerns..."
                      value={pitchSupportForm.keyObjections}
                      onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, keyObjections: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links & Existing Collateral</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Link to current pitch deck in Google Drive, brand book, website"
                        value={pitchSupportForm.referenceLinks}
                        onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Deliverable Format & Urgency</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. 10-slide polished deck + executive 1-pager within 72 hours"
                        value={pitchSupportForm.deliverableFormat}
                        onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, deliverableFormat: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE I: UI/UX AUDIT SPRINT (UI/Design in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'ui-ux-audit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Website / Application URL <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetUrl)}
                        placeholder="e.g. https://datai2i.com/platform"
                        value={auditForm.targetUrl}
                        onChange={(e) => setAuditForm({ ...auditForm, targetUrl: e.target.value })}
                      />
                      {errors.targetUrl && <div style={errorStyle}>{errors.targetUrl}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Primary User Flow to Evaluate <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.primaryUserFlow)}
                        placeholder="e.g. Self-serve onboarding funnel, pricing to checkout conversion"
                        value={auditForm.primaryUserFlow}
                        onChange={(e) => setAuditForm({ ...auditForm, primaryUserFlow: e.target.value })}
                      />
                      {errors.primaryUserFlow && <div style={errorStyle}>{errors.primaryUserFlow}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Known Friction Points / Challenges <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.knownFriction)}
                      placeholder="e.g. High bounce rate on hero section, drop-off on step 2 form, mobile layout misalignment..."
                      value={auditForm.knownFriction}
                      onChange={(e) => setAuditForm({ ...auditForm, knownFriction: e.target.value })}
                    />
                    {errors.knownFriction && <div style={errorStyle}>{errors.knownFriction}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Target Audience</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. B2B Enterprise Technology Buyers, Engineers, Product Managers"
                        value={auditForm.targetAudience}
                        onChange={(e) => setAuditForm({ ...auditForm, targetAudience: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Notes / Specific Objectives</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Focus on WCAG AA contrast compliance and mobile responsiveness"
                        value={auditForm.additionalNotes}
                        onChange={(e) => setAuditForm({ ...auditForm, additionalNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE J: FIGMA PROJECT SPRINT (UI/Design in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'figma-project' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Project / Product Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.projectName)}
                        placeholder="e.g. Data I2I Design System 2.0"
                        value={figmaForm.projectName}
                        onChange={(e) => setFigmaForm({ ...figmaForm, projectName: e.target.value })}
                      />
                      {errors.projectName && <div style={errorStyle}>{errors.projectName}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Scope of Components / Screens Needed <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.designScope)}
                        placeholder="e.g. Complete atomic component kit: buttons, form inputs, modals, cards"
                        value={figmaForm.designScope}
                        onChange={(e) => setFigmaForm({ ...figmaForm, designScope: e.target.value })}
                      />
                      {errors.designScope && <div style={errorStyle}>{errors.designScope}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Brand Guidelines / Visual Direction <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.brandGuidelines)}
                      placeholder="e.g. Modern dark/light theme, clean Inter typography, sleek indigo/cyan palette..."
                      value={figmaForm.brandGuidelines}
                      onChange={(e) => setFigmaForm({ ...figmaForm, brandGuidelines: e.target.value })}
                    />
                    {errors.brandGuidelines && <div style={errorStyle}>{errors.brandGuidelines}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links / Inspiration</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. https://figma.com/@inspiration or existing brand board"
                        value={figmaForm.referenceLinks}
                        onChange={(e) => setFigmaForm({ ...figmaForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Auto-layout required, variable color tokens, responsive variants"
                        value={figmaForm.additionalRequirements}
                        onChange={(e) => setFigmaForm({ ...figmaForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE K: REDESIGN REQUEST SPRINT (UI/Design in Light Theme)
                  ------------------------------------------------------ */}
              {activeServiceId === 'redesign-request' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Current Page URL / Product Link <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetUrl)}
                        placeholder="e.g. https://datai2i.com/landing"
                        value={redesignForm.targetUrl}
                        onChange={(e) => setRedesignForm({ ...redesignForm, targetUrl: e.target.value })}
                      />
                      {errors.targetUrl && <div style={errorStyle}>{errors.targetUrl}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Primary Redesign Objective <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.redesignObjective)}
                        placeholder="e.g. Premium aesthetic overhaul, higher conversion rate on demo requests"
                        value={redesignForm.redesignObjective}
                        onChange={(e) => setRedesignForm({ ...redesignForm, redesignObjective: e.target.value })}
                      />
                      {errors.redesignObjective && <div style={errorStyle}>{errors.redesignObjective}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Target Audience & Value Proposition <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      style={textareaStyle(errors.targetAudience)}
                      placeholder="e.g. Enterprise CTOs and engineering leaders seeking automated data pipeline solutions..."
                      value={redesignForm.targetAudience}
                      onChange={(e) => setRedesignForm({ ...redesignForm, targetAudience: e.target.value })}
                    />
                    {errors.targetAudience && <div style={errorStyle}>{errors.targetAudience}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links / Inspiration</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Links to sites with desired aesthetic"
                        value={redesignForm.referenceLinks}
                        onChange={(e) => setRedesignForm({ ...redesignForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Deliver side-by-side Before/After deck, include mobile layout"
                        value={redesignForm.additionalRequirements}
                        onChange={(e) => setRedesignForm({ ...redesignForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE L: GTM STRATEGY SPRINT
                  ------------------------------------------------------ */}
              {(activeServiceId === 'gtm' || activeServiceId === 'gtm-strategy') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Launch Goal / Objective <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.launchGoal)}
                        placeholder="e.g. Q4 enterprise product launch, international market expansion"
                        value={gtmForm.launchGoal}
                        onChange={(e) => setGtmForm({ ...gtmForm, launchGoal: e.target.value })}
                      />
                      {errors.launchGoal && <div style={errorStyle}>{errors.launchGoal}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Product / Feature Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetProduct)}
                        placeholder="e.g. DataSync Enterprise v2.0"
                        value={gtmForm.targetProduct}
                        onChange={(e) => setGtmForm({ ...gtmForm, targetProduct: e.target.value })}
                      />
                      {errors.targetProduct && <div style={errorStyle}>{errors.targetProduct}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Market / Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetMarket)}
                        placeholder="e.g. Series B+ FinTech CTOs, Data Engineering VPs"
                        value={gtmForm.targetMarket}
                        onChange={(e) => setGtmForm({ ...gtmForm, targetMarket: e.target.value })}
                      />
                      {errors.targetMarket && <div style={errorStyle}>{errors.targetMarket}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>Primary Distribution Vectors</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Product Hunt, LinkedIn Outbound, Partner Co-Marketing"
                        value={gtmForm.distributionChannels}
                        onChange={(e) => setGtmForm({ ...gtmForm, distributionChannels: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Target Launch Timeline</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Launching in 4 weeks, Beta next month"
                        value={gtmForm.launchTimeline}
                        onChange={(e) => setGtmForm({ ...gtmForm, launchTimeline: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Key Competitors / Reference Launches</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Snowflake, Databricks, Fivetran"
                        value={gtmForm.competitors}
                        onChange={(e) => setGtmForm({ ...gtmForm, competitors: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Reference Links / Product Docs</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Pitch deck URL, staging environment, Notion doc"
                        value={gtmForm.referenceLinks}
                        onChange={(e) => setGtmForm({ ...gtmForm, referenceLinks: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Additional Requirements</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Focus on executive sales collateral and launch scorecard"
                        value={gtmForm.additionalRequirements}
                        onChange={(e) => setGtmForm({ ...gtmForm, additionalRequirements: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------
                  CASE M: AD CREATIVES SPRINT
                  ------------------------------------------------------ */}
              {activeServiceId === 'ad-creatives' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Campaign Objective <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.campaignObjective)}
                        placeholder="e.g. B2B Lead Gen, Free Trial Signups, Retargeting Demo Views"
                        value={adCreativesForm.campaignObjective}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, campaignObjective: e.target.value })}
                      />
                      {errors.campaignObjective && <div style={errorStyle}>{errors.campaignObjective}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>Target Ad Platforms</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. LinkedIn Sponsored, Meta (FB/IG), Google Display, X"
                        value={adCreativesForm.targetPlatforms}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, targetPlatforms: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Ad Formats Checkboxes */}
                  <div>
                    <label style={labelStyle}>Deliverable Formats Needed</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {[
                        { key: 'square', label: '1:1 Square (Feed & LinkedIn)' },
                        { key: 'story', label: '9:16 Vertical (Stories & Reels)' },
                        { key: 'landscape', label: '16:9 Landscape (Display & Banners)' },
                        { key: 'carousel', label: 'Multi-Card Carousel Pack' },
                      ].map((fmt) => (
                        <button
                          type="button"
                          key={fmt.key}
                          onClick={() =>
                            setAdCreativesForm((prev) => ({
                              ...prev,
                              adFormats: { ...prev.adFormats, [fmt.key]: !prev.adFormats[fmt.key] },
                            }))
                          }
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: adCreativesForm.adFormats[fmt.key] ? '#FEF2F2' : '#FFFFFF',
                            color: adCreativesForm.adFormats[fmt.key] ? '#EF4444' : '#4B5563',
                            border: adCreativesForm.adFormats[fmt.key] ? '1.5px solid #EF4444' : '1px solid #E5E7EB',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {adCreativesForm.adFormats[fmt.key] ? <CheckSquare size={14} color="#EF4444" /> : <Square size={14} color="#9CA3AF" />}
                          <span>{fmt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>
                        Target Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.targetAudience)}
                        placeholder="e.g. Growth Marketing Directors, Founders, Dev Leads"
                        value={adCreativesForm.targetAudience}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, targetAudience: e.target.value })}
                      />
                      {errors.targetAudience && <div style={errorStyle}>{errors.targetAudience}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Core Offer / Value Hook <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        style={inputStyle(errors.coreOffer)}
                        placeholder="e.g. Get 50% faster data onboarding + 14-day free trial"
                        value={adCreativesForm.coreOffer}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, coreOffer: e.target.value })}
                      />
                      {errors.coreOffer && <div style={errorStyle}>{errors.coreOffer}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Brand Guidelines / Visual Assets</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Brand book link, hex colors, vector logos link"
                        value={adCreativesForm.brandGuidelines}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, brandGuidelines: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Reference Ad Examples</label>
                      <input
                        style={inputStyle()}
                        placeholder="e.g. Links to ads you admire, competitor ad library links"
                        value={adCreativesForm.referenceExamples}
                        onChange={(e) => setAdCreativesForm({ ...adCreativesForm, referenceExamples: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Additional Requirements</label>
                    <input
                      style={inputStyle()}
                      placeholder="e.g. Include 3 copy angle variations per visual asset, export ready for Meta Ads Manager"
                      value={adCreativesForm.additionalRequirements}
                      onChange={(e) => setAdCreativesForm({ ...adCreativesForm, additionalRequirements: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
              STEP 2: REVIEW REQUIREMENTS BRIEF (Light Theme)
              ========================================================== */}
          {step === 2 && (
            <div>
              <div
                style={{
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <CheckCircle2 size={20} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ color: '#6D28D9', fontWeight: 700, fontSize: '0.9375rem' }}>
                    Review Your Requirements Brief
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: '#4B5563', fontSize: '0.84375rem', lineHeight: 1.5 }}>
                    Review everything you entered below before proceeding to authoritative backend price calculation. No ticket has been created yet.
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #F1F5F9',
                    paddingBottom: '0.85rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Configured Sprint Service
                  </span>
                  <span style={{ fontWeight: 800, color: '#7C3AED', fontSize: '0.9375rem' }}>
                    {currentConfig.serviceLabel}
                  </span>
                </div>

                {/* Review field contents dynamically */}
                {activeServiceId === 'strategic-planner' && (
                  <>
                    <ReviewRow label="Main Goal" value={strategicForm.mainGoal} highlight />
                    <ReviewRow label="Target Market / Audience" value={strategicForm.targetMarket} />
                    {strategicForm.focusArea && <ReviewRow label="Focus Area" value={strategicForm.focusArea} />}
                    <ReviewRow label="Current Challenges / Pain Points" value={strategicForm.painPoints} />
                    {strategicForm.expectedOutcome && <ReviewRow label="Expected Outcome" value={strategicForm.expectedOutcome} />}
                    {strategicForm.competitors && <ReviewRow label="Competitors / Reference Companies" value={strategicForm.competitors} />}
                    {strategicForm.referenceLinks && <ReviewRow label="Reference Links" value={strategicForm.referenceLinks} isLink />}
                    {strategicForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={strategicForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'content-creator' && (
                  <>
                    <ReviewRow
                      label="Content Types Selected"
                      value={
                        Object.entries(contentForm.contentTypes)
                          .filter(([_, v]) => v)
                          .map(([k]) =>
                            k === 'poster'
                              ? 'Poster / Visual Asset'
                              : k === 'productVideo'
                              ? 'Product Video'
                              : k === 'socialContent'
                              ? 'Social Media Content'
                              : k === 'productShowcase'
                              ? 'Product Showcase'
                              : 'Other'
                          )
                          .join(', ') || 'None selected'
                      }
                      highlight
                    />
                    <ReviewRow label="Deliverables Count / Type" value={contentForm.deliverablesCount} />
                    <ReviewRow label="Product / Service to Highlight" value={contentForm.productHighlight} />
                    <ReviewRow label="Main Purpose" value={contentForm.mainPurpose} />
                    {contentForm.targetAudience && <ReviewRow label="Target Audience" value={contentForm.targetAudience} />}
                    {contentForm.preferredPlatforms && <ReviewRow label="Preferred Platforms" value={contentForm.preferredPlatforms} />}
                    {contentForm.keyMessage && <ReviewRow label="Key Message" value={contentForm.keyMessage} />}
                    {contentForm.brandRequirements && <ReviewRow label="Brand / Style Requirements" value={contentForm.brandRequirements} />}
                    {contentForm.referenceExamples && <ReviewRow label="Reference Examples" value={contentForm.referenceExamples} />}
                    {contentForm.existingBrandAssets && <ReviewRow label="Existing Brand Assets" value={contentForm.existingBrandAssets} />}
                    {contentForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={contentForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'devrel' && (
                  <>
                    <ReviewRow label="Main DevRel Goal" value={devrelForm.mainDevrelGoal} highlight />
                    <ReviewRow label="Product / API / SDK" value={devrelForm.productApiSdk} />
                    <ReviewRow label="Target Developer Audience" value={devrelForm.targetDeveloperAudience} />
                    {devrelForm.developerPlatforms && <ReviewRow label="Developer Platforms" value={devrelForm.developerPlatforms} />}
                    {devrelForm.developerAdoptionChallenges && <ReviewRow label="Current Adoption Challenges" value={devrelForm.developerAdoptionChallenges} />}
                    {devrelForm.documentationRequirements && <ReviewRow label="Documentation Requirements" value={devrelForm.documentationRequirements} />}
                    {devrelForm.communityRequirements && <ReviewRow label="Community Requirements" value={devrelForm.communityRequirements} />}
                    {devrelForm.openSourceRequirements && <ReviewRow label="Open-Source Requirements" value={devrelForm.openSourceRequirements} />}
                    {devrelForm.developerContentRequirements && <ReviewRow label="Developer Content Requirements" value={devrelForm.developerContentRequirements} />}
                    <ReviewRow label="Expected Outcome" value={devrelForm.expectedOutcome} />
                    {devrelForm.referenceLinks && <ReviewRow label="Reference Links" value={devrelForm.referenceLinks} isLink />}
                    {devrelForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={devrelForm.additionalRequirements} />}
                  </>
                )}

                {(activeServiceId === 'custom' || activeServiceId === 'custom-boosting' || activeServiceId === 'custom-digitalising') && (
                  <>
                    <ReviewRow
                      label="Configured Service Modules"
                      value={
                        Object.entries(customForm.selectedServices)
                          .filter(([_, v]) => v)
                          .map(([k]) => {
                            const nameMap = {
                              strategicPlan: 'Strategic Plan',
                              content: 'Content Creator',
                              devrel: 'DevRel',
                              gtm: 'GTM Strategy',
                              adCreatives: 'Ad Creatives',
                              brandIdentity: 'Brand Identity',
                              leadResearch: 'Lead Research',
                              companyStudy: 'Company Study',
                              keyPeople: 'Key People Research',
                              pitchSupport: 'Pitch Support',
                              uiUxAudit: 'UI/UX Audit',
                              figmaProject: 'Figma Project',
                              redesignRequest: 'Redesign Request',
                              webApp: 'Web Application MVP',
                              mobileApp: 'Mobile App',
                              apiBackend: 'API & Backend',
                            };
                            return nameMap[k] || k;
                          })
                          .join(', ') || 'Custom Scope'
                      }
                      highlight
                    />

                    {/* Internal Service Specifications Review */}
                    {customForm.selectedServices.content && (
                      <ReviewRow
                        label="Content Specifications"
                        value={`${contentForm.deliverablesCount || 'Standard Deliverables'}${contentForm.productHighlight ? ` · Highlight: ${contentForm.productHighlight}` : ''}${contentForm.mainPurpose ? ` (${contentForm.mainPurpose})` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.devrel && (
                      <ReviewRow
                        label="DevRel Specifications"
                        value={`${devrelForm.mainDevrelGoal || 'Strategy & Onboarding'}${devrelForm.productApiSdk ? ` · Focus: ${devrelForm.productApiSdk}` : ''}${devrelForm.targetDeveloperAudience ? ` · Audience: ${devrelForm.targetDeveloperAudience}` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.leadResearch && (
                      <ReviewRow
                        label="Lead Research Specifications"
                        value={`${leadForm.leadsCount} Verified Leads${leadForm.targetMarket ? ` · Market: ${leadForm.targetMarket}` : ''}${leadForm.targetPersonas ? ` · Personas: ${leadForm.targetPersonas}` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.companyStudy && (
                      <ReviewRow
                        label="Company Study Specifications"
                        value={`${companyStudyForm.targetCompany || 'Target Account'}${companyStudyForm.researchObjective ? ` · Objective: ${companyStudyForm.researchObjective}` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.keyPeople && (
                      <ReviewRow
                        label="Key People Specifications"
                        value={`${keyPeopleForm.targetOrganizations || 'Target Accounts'}${keyPeopleForm.targetSeniority ? ` · Seniority: ${keyPeopleForm.targetSeniority}` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.pitchSupport && (
                      <ReviewRow
                        label="Pitch Support Specifications"
                        value={`${pitchSupportForm.pitchType || 'Pitch Presentation'}${pitchSupportForm.coreValueProposition ? ` · Value: ${pitchSupportForm.coreValueProposition}` : ''}`}
                      />
                    )}
                    {customForm.selectedServices.strategicPlan && (
                      <ReviewRow
                        label="Strategic Plan Specifications"
                        value={`${strategicForm.mainGoal || 'Growth Architecture'}${strategicForm.targetMarket ? ` · ICP: ${strategicForm.targetMarket}` : ''}`}
                      />
                    )}

                    <ReviewRow label="Requirements / Scope" value={customForm.requirements} />
                    {customForm.expectedOutcome && <ReviewRow label="Expected Outcome" value={customForm.expectedOutcome} />}
                    {customForm.referenceLinks && <ReviewRow label="Reference Links" value={customForm.referenceLinks} isLink />}
                    {customForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={customForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'lead-research' && (
                  <>
                    <ReviewRow label="Target Leads Volume" value={`${leadForm.leadsCount} Verified Contacts`} highlight />
                    <ReviewRow label="Target Market & Industry" value={leadForm.targetMarket} />
                    <ReviewRow label="Target Personas" value={leadForm.targetPersonas} />
                    {leadForm.companySize && <ReviewRow label="Company Size" value={leadForm.companySize} />}
                    <ReviewRow label="Qualification Criteria" value={leadForm.qualificationCriteria} />
                    {leadForm.desiredDataPoints && <ReviewRow label="Desired Data Points" value={leadForm.desiredDataPoints} />}
                    {leadForm.referenceLinks && <ReviewRow label="Reference Links" value={leadForm.referenceLinks} isLink />}
                    {leadForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={leadForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'company-study' && (
                  <>
                    <ReviewRow label="Target Company" value={companyStudyForm.targetCompany} highlight />
                    <ReviewRow label="Research Objective" value={companyStudyForm.researchObjective} />
                    <ReviewRow label="Intelligence Dimensions" value={companyStudyForm.intelligenceDimensions} />
                    {companyStudyForm.benchmarkCompanies && <ReviewRow label="Competitors / Benchmarks" value={companyStudyForm.benchmarkCompanies} />}
                    {companyStudyForm.expectedOutcome && <ReviewRow label="Deliverable Format" value={companyStudyForm.expectedOutcome} />}
                    {companyStudyForm.referenceLinks && <ReviewRow label="Reference Links" value={companyStudyForm.referenceLinks} isLink />}
                    {companyStudyForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={companyStudyForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'key-people' && (
                  <>
                    <ReviewRow label="Target Organizations" value={keyPeopleForm.targetOrganizations} highlight />
                    <ReviewRow label="Target Seniority" value={keyPeopleForm.targetSeniority} />
                    <ReviewRow label="Intelligence Signals" value={keyPeopleForm.intelligenceSignals} />
                    {keyPeopleForm.deliverableScope && <ReviewRow label="Deliverable Scope" value={keyPeopleForm.deliverableScope} />}
                    {keyPeopleForm.expectedOutcome && <ReviewRow label="Expected Outcome" value={keyPeopleForm.expectedOutcome} />}
                    {keyPeopleForm.referenceLinks && <ReviewRow label="Reference Links" value={keyPeopleForm.referenceLinks} isLink />}
                  </>
                )}

                {activeServiceId === 'pitch-support' && (
                  <>
                    <ReviewRow label="Pitch Type & Audience" value={pitchSupportForm.pitchType} highlight />
                    <ReviewRow label="Core Value Proposition" value={pitchSupportForm.coreValueProposition} />
                    <ReviewRow label="Current Status" value={pitchSupportForm.currentStatus} />
                    {pitchSupportForm.keyObjections && <ReviewRow label="Key Objections" value={pitchSupportForm.keyObjections} />}
                    {pitchSupportForm.deliverableFormat && <ReviewRow label="Deliverable Format" value={pitchSupportForm.deliverableFormat} />}
                    {pitchSupportForm.referenceLinks && <ReviewRow label="Reference Links" value={pitchSupportForm.referenceLinks} isLink />}
                  </>
                )}

                {activeServiceId === 'ui-ux-audit' && (
                  <>
                    <ReviewRow label="Target Website / Application" value={auditForm.targetUrl} highlight />
                    <ReviewRow label="Primary User Flow" value={auditForm.primaryUserFlow} />
                    <ReviewRow label="Known Friction Points" value={auditForm.knownFriction} />
                    {auditForm.targetAudience && <ReviewRow label="Target Audience" value={auditForm.targetAudience} />}
                    {auditForm.additionalNotes && <ReviewRow label="Additional Notes" value={auditForm.additionalNotes} />}
                  </>
                )}

                {activeServiceId === 'figma-project' && (
                  <>
                    <ReviewRow label="Project Name" value={figmaForm.projectName} highlight />
                    <ReviewRow label="Component & Screen Scope" value={figmaForm.designScope} />
                    <ReviewRow label="Brand Guidelines / Visual Direction" value={figmaForm.brandGuidelines} />
                    {figmaForm.referenceLinks && <ReviewRow label="Reference Links" value={figmaForm.referenceLinks} isLink />}
                    {figmaForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={figmaForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'redesign-request' && (
                  <>
                    <ReviewRow label="Target Page URL" value={redesignForm.targetUrl} highlight />
                    <ReviewRow label="Redesign Objective" value={redesignForm.redesignObjective} />
                    <ReviewRow label="Target Audience" value={redesignForm.targetAudience} />
                    {redesignForm.referenceLinks && <ReviewRow label="Reference Links" value={redesignForm.referenceLinks} isLink />}
                    {redesignForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={redesignForm.additionalRequirements} />}
                  </>
                )}

                {(activeServiceId === 'gtm' || activeServiceId === 'gtm-strategy') && (
                  <>
                    <ReviewRow label="Launch Goal / Objective" value={gtmForm.launchGoal} highlight />
                    <ReviewRow label="Product / Feature Name" value={gtmForm.targetProduct} />
                    <ReviewRow label="Target Market / Audience" value={gtmForm.targetMarket} />
                    {gtmForm.distributionChannels && <ReviewRow label="Primary Distribution Vectors" value={gtmForm.distributionChannels} />}
                    {gtmForm.launchTimeline && <ReviewRow label="Target Launch Timeline" value={gtmForm.launchTimeline} />}
                    {gtmForm.competitors && <ReviewRow label="Competitors / Reference Launches" value={gtmForm.competitors} />}
                    {gtmForm.referenceLinks && <ReviewRow label="Reference Links" value={gtmForm.referenceLinks} isLink />}
                    {gtmForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={gtmForm.additionalRequirements} />}
                  </>
                )}

                {activeServiceId === 'ad-creatives' && (
                  <>
                    <ReviewRow label="Campaign Objective" value={adCreativesForm.campaignObjective} highlight />
                    <ReviewRow
                      label="Ad Formats Selected"
                      value={
                        Object.entries(adCreativesForm.adFormats)
                          .filter(([_, v]) => v)
                          .map(([k]) =>
                            k === 'square'
                              ? '1:1 Square'
                              : k === 'story'
                              ? '9:16 Vertical Story'
                              : k === 'landscape'
                              ? '16:9 Landscape'
                              : 'Carousel Pack'
                          )
                          .join(', ') || 'Standard Formats'
                      }
                    />
                    <ReviewRow label="Target Platforms" value={adCreativesForm.targetPlatforms} />
                    <ReviewRow label="Target Audience" value={adCreativesForm.targetAudience} />
                    <ReviewRow label="Core Offer / Value Hook" value={adCreativesForm.coreOffer} />
                    {adCreativesForm.brandGuidelines && <ReviewRow label="Brand Guidelines" value={adCreativesForm.brandGuidelines} />}
                    {adCreativesForm.referenceExamples && <ReviewRow label="Reference Examples" value={adCreativesForm.referenceExamples} />}
                    {adCreativesForm.additionalRequirements && <ReviewRow label="Additional Requirements" value={adCreativesForm.additionalRequirements} />}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================
              STEP 3: AUTHORITATIVE PRICE SCREEN (Light Theme)
              ========================================================== */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DDD4FA',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.06)',
                }}
              >
                {/* Header row with configured service and authoritative fee */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      CONFIGURED SERVICE
                    </div>
                    <h4 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>
                      {displayLabel}
                    </h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      AUTHORITATIVE SPRINT FEE
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace', lineHeight: 1.1, marginTop: '2px' }}>
                      ${displayPrice}.00 <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>USD</span>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '6px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>✓ CONFIGURED</span>
                    </div>
                  </div>
                </div>

                {/* Itemized Scope Breakdown Table */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#4B5563',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.85rem',
                    }}
                  >
                    ITEMIZED SCOPE BREAKDOWN
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {displayBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.875rem',
                          padding: '6px 0',
                          borderBottom:
                            idx < displayBreakdown.length - 1
                              ? '1px dashed #E5E7EB'
                              : undefined,
                        }}
                      >
                        <span style={{ color: '#374151' }}>• {item.item}</span>
                        <span style={{ fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                          ${item.amount}.00 USD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure Checkout Info Box */}
              <div
                style={{
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD4FA',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.5 }}>
                  Sprint scope and fee estimate are logged. Clicking <strong>Confirm & Submit</strong> will create your sprint ticket and submit it directly to our specialist team for immediate review and execution.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            3. MODAL FOOTER (Light Theme Buttons)
            ============================================================ */}
        <div
          style={{
            padding: '1.1rem 1.75rem',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
                padding: '9px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={isSubmitting || isCalculating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
                padding: '9px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={handleProceedToReview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <span>Review Requirements</span>
              <ArrowRight size={15} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleProceedToPrice}
              disabled={isCalculating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isCalculating ? 'not-allowed' : 'pointer',
                opacity: isCalculating ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isCalculating ? 'Calculating Price...' : 'Proceed to Pricing'}</span>
              <ArrowRight size={15} />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleConfirmAndSubmit}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isSubmitting ? 'Submitting Sprint Ticket...' : 'Confirm & Submit Request'}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for Step 2 Review Rows in Light Theme
function ReviewRow({ label, value, highlight = false, isLink = false }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{label}</div>
      <div
        style={{
          color: highlight ? '#7C3AED' : '#111827',
          fontWeight: highlight ? 700 : 500,
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: isLink ? 'break-all' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// Styling Constants for Clean Light Theme
const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
  letterSpacing: '-0.01em',
};

const inputStyle = (hasError) => ({
  width: '100%',
  height: '42px',
  padding: '0 14px',
  borderRadius: '10px',
  border: hasError ? '1px solid #EF4444' : '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  color: '#111827',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
});

const textareaStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: hasError ? '1px solid #EF4444' : '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  color: '#111827',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  resize: 'vertical',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
});

const errorStyle = {
  color: '#EF4444',
  fontSize: '0.75rem',
  marginTop: '4px',
  fontWeight: 500,
};
