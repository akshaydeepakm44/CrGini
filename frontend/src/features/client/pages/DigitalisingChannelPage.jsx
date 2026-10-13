import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Target,
  Building2,
  Users,
  Presentation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  AlertCircle,
  Filter,
  CheckSquare,
  Square,
  DollarSign,
  Layers,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { api } from '../../../services/api';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Button from '../../../components/common/Button';

// Digitalising Service Catalog Definitions
const DIGITALISING_SERVICES = {
  'lead-research': {
    id: 'lead-research',
    slug: 'lead-research',
    title: 'Lead Research',
    shortTitle: 'Lead Research',
    headline: 'Hand-verified prospect contact intelligence tailored to your ICP ($2 per lead).',
    badge: 'LEAD RESEARCH SPRINT',
    turnaround: '24–48 Hours',
    unitPrice: 2,
    priceLabel: '$2 / lead',
    icon: Target,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
    borderActive: '#7C3AED',
    deliverables: [
      'Hand-Verified Account Contacts ($2 per lead, 0% Bounce Guarantee)',
      'Lead study + Pitch Deck research assistance',
      'Decision-Maker Title, Direct Work Email & Phone Telemetry',
      'Account Industry, Employee Count & Revenue Segmentation'
    ]
  },
  'company-study': {
    id: 'company-study',
    slug: 'company-study',
    title: 'Company Study',
    shortTitle: 'Company Study',
    headline: 'Structured personal company study, tech stack telemetry, and target account dossiers ($1 per study).',
    badge: 'COMPANY STUDY SPRINT',
    turnaround: '48–72 Hours',
    unitPrice: 1,
    priceLabel: '$1 / study',
    icon: Building2,
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    borderActive: '#0284C7',
    deliverables: [
      'Personal Company Study & Organizational Architecture',
      'Current Tech Stack & Cloud Infrastructure Telemetry',
      'Recent Strategic Hires, Funding & Expansion Signals',
      'Pain Point Matrix & Vendor Relationship Analysis'
    ]
  },
  'key-people': {
    id: 'key-people',
    slug: 'key-people',
    title: 'Key People Research',
    shortTitle: 'Key People',
    headline: 'Map the buying committee: direct emails and phone numbers for verified key decision-makers ($2 per profile).',
    badge: 'KEY PEOPLE SPRINT',
    turnaround: '24–48 Hours',
    unitPrice: 2,
    priceLabel: '$2 / profile',
    icon: Users,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    borderActive: '#059669',
    deliverables: [
      'Key Profile & Direct Email Access',
      'Full Buying Committee Mapping (Economic Buyers + Technical Leads)',
      'Verified Direct Contact Information with Phone Numbers',
      'LinkedIn Profile Telemetry & Role Tenure Insights'
    ]
  },
  'pitch-support': {
    id: 'pitch-support',
    slug: 'pitch-support',
    title: 'Pitch Support',
    shortTitle: 'Pitch Support',
    headline: 'Pitch preparation, competitor battlecards, and persuasive data points for high-stakes pitches ($2 per sprint).',
    badge: 'PITCH SUPPORT SPRINT',
    turnaround: '48–72 Hours',
    unitPrice: 2,
    priceLabel: '$2 / sprint',
    icon: Presentation,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    borderActive: '#D97706',
    deliverables: [
      'Pitch Preparation + Competitor Analysis Battlecard',
      'Verified Market Sizing (TAM / SAM / SOM) Calculations & Sources',
      'Competitor Feature & Pricing Matrix',
      'High-Stakes Narrative Structuring & Objection Overcoming'
    ]
  }
};

export default function DigitalisingChannelPage({
  requests = [],
  onViewRequest,
  onSelectService,
  onRequestService,
  onOpenNewRequest,
  onReload
}) {
  const navigate = useNavigate();
  const { serviceSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'form' (The request form to fill) vs 'list' (Track past digitalising requests)
  const [viewMode, setViewMode] = useState('form');

  // Active Service Tab
  const initialServiceFromUrl = serviceSlug || searchParams.get('service') || searchParams.get('slug') || 'lead-research';
  const validInitial = DIGITALISING_SERVICES[initialServiceFromUrl] ? initialServiceFromUrl : 'lead-research';
  const [activeServiceId, setActiveServiceId] = useState(validInitial);

  // Synchronize when query param or route slug changes
  useEffect(() => {
    const q = serviceSlug || searchParams.get('service') || searchParams.get('slug');
    if (q && DIGITALISING_SERVICES[q]) {
      setActiveServiceId(q);
      setViewMode('form');
    }
  }, [serviceSlug, searchParams]);

  // Lead Research Form State
  const [leadForm, setLeadForm] = useState({
    leadsCount: 50,
    targetMarket: '',
    targetPersonas: '',
    companySizeCriteria: '',
    qualificationCriteria: '',
    exclusions: '',
    priority: 'STANDARD'
  });

  // Company Study Form State
  const [companyStudyForm, setCompanyStudyForm] = useState({
    targetCompany: '',
    companyDomain: '',
    researchObjective: '',
    techStackScope: true,
    orgArchitectureScope: true,
    expansionSignalsScope: true,
    targetDepartment: '',
    specificQuestions: '',
    priority: 'STANDARD'
  });

  // Key People Form State
  const [keyPeopleForm, setKeyPeopleForm] = useState({
    targetOrganizations: '',
    targetSeniority: '',
    rolesToCover: '',
    needDirectEmail: true,
    needDirectPhone: true,
    needLinkedIn: true,
    economicBuyerScope: true,
    technicalLeadScope: true,
    additionalGuidelines: '',
    priority: 'STANDARD'
  });

  // Pitch Support Form State
  const [pitchSupportForm, setPitchSupportForm] = useState({
    pitchType: '',
    coreValueProposition: '',
    currentStatus: '',
    competitorTargets: '',
    deliverablesRequested: '',
    priority: 'STANDARD'
  });

  // Form Submission & Validation States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessTicket, setSubmitSuccessTicket] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Past Digitalising Requests Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const digitalisingRequests = requests.filter((r) => {
    const sType = String(r.serviceType || r.service_type || '').toUpperCase();
    const subS = String(r.subService || r.sub_service || '').toUpperCase();
    const sId = String(r.serviceId || r.service_id || r.service || '').toLowerCase();
    const ch = String(r.channel || '').toLowerCase();

    return (
      ch === 'digitalising' ||
      sType.includes('LEAD') ||
      subS.includes('LEAD') ||
      subS.includes('COMPANY_STUDY') ||
      subS.includes('KEY_PEOPLE') ||
      subS.includes('PITCH_SUPPORT') ||
      ['lead-research', 'company-study', 'key-people', 'pitch-support', 'lead research', 'company study', 'key people', 'pitch support'].some((k) => sId.includes(k)) ||
      (r.requirements && r.requirements.leadsCount) ||
      (r.requirements && r.requirements.targetCompany)
    );
  });

  const filteredRequests = digitalisingRequests.filter((r) => {
    if (statusFilter !== 'ALL') {
      const st = String(r.status || '').toUpperCase();
      if (statusFilter === 'ACTIVE' && ['COMPLETED', 'APPROVED', 'CANCELLED'].includes(st)) return false;
      if (statusFilter === 'IN_PROGRESS' && st !== 'IN_PROGRESS') return false;
      if (statusFilter === 'REVIEW' && !['CLIENT_REVIEW', 'DELIVERED'].includes(st)) return false;
      if (statusFilter === 'COMPLETED' && !['COMPLETED', 'APPROVED'].includes(st)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = String(r.title || '').toLowerCase();
      const ticketId = String(r.ticketId || r.id || '').toLowerCase();
      const service = String(r.service || r.serviceType || '').toLowerCase();
      return title.includes(q) || ticketId.includes(q) || service.includes(q);
    }
    return true;
  });

  const currentService = DIGITALISING_SERVICES[activeServiceId] || DIGITALISING_SERVICES['lead-research'];

  // Calculate live estimate based on service
  const calculateEstimatedPrice = () => {
    if (activeServiceId === 'lead-research') {
      const count = Number(leadForm.leadsCount) || 1;
      return count * currentService.unitPrice;
    }
    return currentService.unitPrice;
  };

  const estimatedPrice = calculateEstimatedPrice();

  // Validate form fields before submitting
  const validateCurrentForm = () => {
    const errs = {};

    if (activeServiceId === 'lead-research') {
      if (!leadForm.leadsCount || Number(leadForm.leadsCount) <= 0) {
        errs.leadsCount = 'Number of leads must be at least 1';
      }
      if (!leadForm.targetMarket.trim()) {
        errs.targetMarket = 'Target Market & Industry is required';
      }
      if (!leadForm.targetPersonas.trim()) {
        errs.targetPersonas = 'Target Personas or Titles are required';
      }
      if (!leadForm.qualificationCriteria.trim()) {
        errs.qualificationCriteria = 'Qualification criteria is required';
      }
    } else if (activeServiceId === 'company-study') {
      if (!companyStudyForm.targetCompany.trim()) {
        errs.targetCompany = 'Target Company Name is required';
      }
      if (!companyStudyForm.researchObjective.trim()) {
        errs.researchObjective = 'Primary Research Objective is required';
      }
    } else if (activeServiceId === 'key-people') {
      if (!keyPeopleForm.targetOrganizations.trim()) {
        errs.targetOrganizations = 'Target Organizations or Accounts are required';
      }
      if (!keyPeopleForm.targetSeniority.trim()) {
        errs.targetSeniority = 'Target Seniority or Roles are required';
      }
    } else if (activeServiceId === 'pitch-support') {
      if (!pitchSupportForm.pitchType.trim()) {
        errs.pitchType = 'Pitch Type / Primary Audience is required';
      }
      if (!pitchSupportForm.coreValueProposition.trim()) {
        errs.coreValueProposition = 'Core Value Proposition is required';
      }
      if (!pitchSupportForm.currentStatus.trim()) {
        errs.currentStatus = 'Current Pitch Deck Status is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateCurrentForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      let title = '';
      let description = '';
      let requirements = {};
      let subService = 'LEAD_RESEARCH';

      if (activeServiceId === 'lead-research') {
        title = `Lead Research: ${leadForm.targetMarket}`;
        description = leadForm.qualificationCriteria;
        subService = 'LEAD_RESEARCH';
        requirements = {
          ...leadForm,
          serviceId: 'lead-research',
          unitPrice: 2,
          totalPrice: estimatedPrice
        };
      } else if (activeServiceId === 'company-study') {
        title = `Company Study: ${companyStudyForm.targetCompany}`;
        description = companyStudyForm.researchObjective;
        subService = 'COMPANY_STUDY';
        requirements = {
          ...companyStudyForm,
          serviceId: 'company-study',
          unitPrice: 1,
          totalPrice: estimatedPrice
        };
      } else if (activeServiceId === 'key-people') {
        title = `Key People Research: ${keyPeopleForm.targetOrganizations}`;
        description = `Target hierarchy & buying committee research for ${keyPeopleForm.targetOrganizations}`;
        subService = 'KEY_PEOPLE';
        requirements = {
          ...keyPeopleForm,
          serviceId: 'key-people',
          unitPrice: 2,
          totalPrice: estimatedPrice
        };
      } else if (activeServiceId === 'pitch-support') {
        title = `Pitch Support: ${pitchSupportForm.pitchType}`;
        description = pitchSupportForm.coreValueProposition;
        subService = 'PITCH_SUPPORT';
        requirements = {
          ...pitchSupportForm,
          serviceId: 'pitch-support',
          unitPrice: 2,
          totalPrice: estimatedPrice
        };
      }

      const payload = {
        title,
        description,
        serviceType: 'COMPANY_LEAD',
        subService,
        channel: 'digitalising',
        priority: 'MEDIUM',
        requirements,
        selectedServices: [subService]
      };

      const newTicket = await api.createRequest(payload);
      setSubmitSuccessTicket(newTicket);
      if (onReload) onReload();
    } catch (err) {
      console.error('Failed to submit digitalising request:', err);
      setSubmitError(err.message || 'Failed to submit digitalising request. Please verify fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitSuccessTicket(null);
    setErrors({});
    setSubmitError('');
  };

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: '1360px', margin: '0 auto' }}>
      {/* ============================================================
          1. HEADER WITH SERVICE CHANNEL BADGE & VIEW MODE TOGGLE
          ============================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                border: '1px solid #DDD6FE',
              }}
            >
              <Sparkles size={12} />
              DIGITALISING PLATFORM • 24–72H SLA
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Digitalising Request Channel
          </h1>

          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#4B5563', maxWidth: '720px', lineHeight: 1.5 }}>
            Submit verified prospect intelligence, deep company dossiers, key people hierarchies, or pitch materials prepared by DiziGini specialists.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#F3F4F6',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('form')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '0.84375rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'form' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'form' ? '#7C3AED' : '#4B5563',
              boxShadow: viewMode === 'form' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            <span>Request Form</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '0.84375rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'list' ? '#7C3AED' : '#4B5563',
              boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={14} />
            <span>My Requests ({digitalisingRequests.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          2. VIEW MODE: REQUEST FORM (TO BE FILLED)
          ============================================================ */}
      {viewMode === 'form' ? (
        submitSuccessTicket ? (
          /* SUCCESS CONFIRMATION STATE */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '48px 36px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
              maxWidth: '680px',
              margin: '20px auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 10px 0',
              }}
            >
              Digitalising Request Submitted!
            </h2>

            <p style={{ color: '#4B5563', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Your intelligence ticket has been assigned to the DiziGini specialist queue. Our team is already verifying the scope and data points.
            </p>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left',
                marginBottom: '28px',
                minWidth: '280px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                Ticket ID Reference
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0284C7' }}>
                {submitSuccessTicket.ticketId || `REQ-${submitSuccessTicket.id}`}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 600 }}>
                {submitSuccessTicket.title}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={() => {
                  if (onViewRequest) {
                    onViewRequest(submitSuccessTicket);
                  } else {
                    navigate(`/portal/requests/${submitSuccessTicket.ticketId || submitSuccessTicket.id}`);
                  }
                }}
              >
                <span>View Request Details</span>
                <ArrowRight size={15} />
              </Button>

              <Button variant="outline" onClick={handleResetForm}>
                <span>Submit Another Request</span>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* SERVICE SELECTOR TABS */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#6B7280',
                  marginBottom: '10px',
                }}
              >
                1. SELECT DIGITALISING SERVICE TO REQUEST:
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                }}
              >
                {Object.values(DIGITALISING_SERVICES).map((svc) => {
                  const isSelected = activeServiceId === svc.id;
                  const Icon = svc.icon;

                  return (
                    <div
                      key={svc.id}
                      onClick={() => {
                        setActiveServiceId(svc.id);
                        setSearchParams({ service: svc.id });
                        setErrors({});
                      }}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: isSelected ? `2px solid ${svc.borderActive}` : '1px solid #E5E7EB',
                        padding: '16px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected
                          ? '0 6px 20px rgba(124, 58, 237, 0.12)'
                          : '0 2px 8px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: svc.iconBg,
                          color: svc.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
                            {svc.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: svc.iconColor,
                              backgroundColor: svc.iconBg,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {svc.priceLabel}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                          {svc.turnaround} Turnaround
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '12px',
                            backgroundColor: svc.borderActive,
                            color: '#FFFFFF',
                            borderRadius: '10px',
                            padding: '1px 8px',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          ACTIVE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ERROR BANNER */}
            {submitError && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            {/* TWO-COLUMN FORM LAYOUT */}
            <form onSubmit={handleSubmitRequest}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* LEFT / MAIN COLUMN: THE CONCRETE FORM FIELDS */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E5E7EB',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    gridColumn: 'span 2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: currentService.iconBg,
                        color: currentService.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <currentService.icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>
                        Fill Requirements: {currentService.title}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                        Provide specific targeting parameters below. Fields marked with (<span style={{ color: '#EF4444' }}>*</span>) are required.
                      </p>
                    </div>
                  </div>

                  {/* ========================================================
                      SERVICE FORM: LEAD RESEARCH
                      ======================================================== */}
                  {activeServiceId === 'lead-research' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            Number of Leads <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5000"
                            style={inputStyle(errors.leadsCount)}
                            value={leadForm.leadsCount}
                            onChange={(e) => setLeadForm({ ...leadForm, leadsCount: e.target.value })}
                            placeholder="50"
                          />
                          <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '4px' }}>
                            $2 per hand-verified contact
                          </div>
                          {errors.leadsCount && <div style={errorStyle}>{errors.leadsCount}</div>}
                        </div>

                        <div>
                          <label style={labelStyle}>
                            Target Market &amp; Industry <span style={{ color: '#EF4444' }}>*</span>
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

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            Target Personas / Job Titles <span style={{ color: '#EF4444' }}>*</span>
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
                          <label style={labelStyle}>Company Size / Headcount / Revenue</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. 50-500 employees, $10M-$50M ARR"
                            value={leadForm.companySizeCriteria}
                            onChange={(e) => setLeadForm({ ...leadForm, companySizeCriteria: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Qualification Criteria &amp; Must-Have Signals <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          style={textareaStyle(errors.qualificationCriteria)}
                          placeholder="e.g. Must use Salesforce or HubSpot, currently hiring in the US, active Series A+ funding"
                          value={leadForm.qualificationCriteria}
                          onChange={(e) => setLeadForm({ ...leadForm, qualificationCriteria: e.target.value })}
                        />
                        {errors.qualificationCriteria && <div style={errorStyle}>{errors.qualificationCriteria}</div>}
                      </div>

                      <div>
                        <label style={labelStyle}>Negative Signals / Exclusions</label>
                        <input
                          style={inputStyle(false)}
                          placeholder="e.g. No agencies, no consulting shops, exclude EMEA companies"
                          value={leadForm.exclusions}
                          onChange={(e) => setLeadForm({ ...leadForm, exclusions: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      SERVICE FORM: COMPANY STUDY
                      ======================================================== */}
                  {activeServiceId === 'company-study' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            Target Company Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            style={inputStyle(errors.targetCompany)}
                            placeholder="e.g. Snowflake Inc., Databricks, Stripe"
                            value={companyStudyForm.targetCompany}
                            onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, targetCompany: e.target.value })}
                          />
                          {errors.targetCompany && <div style={errorStyle}>{errors.targetCompany}</div>}
                        </div>

                        <div>
                          <label style={labelStyle}>Company Website / Domain</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. snowflake.com"
                            value={companyStudyForm.companyDomain}
                            onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, companyDomain: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Primary Research Objective <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          style={textareaStyle(errors.researchObjective)}
                          placeholder="e.g. Prepare for an enterprise outbound campaign by discovering their cloud telemetry, procurement decision-makers, and current database migrations."
                          value={companyStudyForm.researchObjective}
                          onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, researchObjective: e.target.value })}
                        />
                        {errors.researchObjective && <div style={errorStyle}>{errors.researchObjective}</div>}
                      </div>

                      <div>
                        <label style={labelStyle}>Key Intelligence Dimensions to Cover</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '6px' }}>
                          {[
                            { key: 'techStackScope', label: 'Tech Stack & Infrastructure' },
                            { key: 'orgArchitectureScope', label: 'Org Hierarchy & Leadership' },
                            { key: 'expansionSignalsScope', label: 'Recent Expansion & Funding' },
                          ].map((item) => {
                            const isChecked = !!companyStudyForm[item.key];
                            return (
                              <div
                                key={item.key}
                                onClick={() => setCompanyStudyForm({ ...companyStudyForm, [item.key]: !isChecked })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isChecked ? '1.5px solid #0284C7' : '1px solid #E5E7EB',
                                  backgroundColor: isChecked ? '#F0F9FF' : '#F9FAFB',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                {isChecked ? <CheckSquare size={16} color="#0284C7" /> : <Square size={16} color="#9CA3AF" />}
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isChecked ? '#0284C7' : '#374151' }}>
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>Target Department / Function</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. Data Engineering, IT Security, Revenue Ops"
                            value={companyStudyForm.targetDepartment}
                            onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, targetDepartment: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Specific Questions / Notes</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. Any known contracts expiring in Q3?"
                            value={companyStudyForm.specificQuestions}
                            onChange={(e) => setCompanyStudyForm({ ...companyStudyForm, specificQuestions: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      SERVICE FORM: KEY PEOPLE RESEARCH
                      ======================================================== */}
                  {activeServiceId === 'key-people' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            Target Organizations / Companies <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            style={inputStyle(errors.targetOrganizations)}
                            placeholder="e.g. Top 20 Fintechs in New York, Stripe, Ramp, Brex"
                            value={keyPeopleForm.targetOrganizations}
                            onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetOrganizations: e.target.value })}
                          />
                          {errors.targetOrganizations && <div style={errorStyle}>{errors.targetOrganizations}</div>}
                        </div>

                        <div>
                          <label style={labelStyle}>
                            Target Seniority &amp; Roles <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            style={inputStyle(errors.targetSeniority)}
                            placeholder="e.g. VP / Director of Supply Chain, Head of Procurement"
                            value={keyPeopleForm.targetSeniority}
                            onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, targetSeniority: e.target.value })}
                          />
                          {errors.targetSeniority && <div style={errorStyle}>{errors.targetSeniority}</div>}
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Contact Details Required</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '6px' }}>
                          {[
                            { key: 'needDirectEmail', label: 'Direct Work Email (0% Bounce)' },
                            { key: 'needDirectPhone', label: 'Direct / Desk Phone' },
                            { key: 'needLinkedIn', label: 'LinkedIn Profile Telemetry' },
                          ].map((item) => {
                            const isChecked = !!keyPeopleForm[item.key];
                            return (
                              <div
                                key={item.key}
                                onClick={() => setKeyPeopleForm({ ...keyPeopleForm, [item.key]: !isChecked })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isChecked ? '1.5px solid #059669' : '1px solid #E5E7EB',
                                  backgroundColor: isChecked ? '#ECFDF5' : '#F9FAFB',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                {isChecked ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#9CA3AF" />}
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isChecked ? '#059669' : '#374151' }}>
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Buying Committee Mapping Scope</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '6px' }}>
                          {[
                            { key: 'economicBuyerScope', label: 'Economic Buyer (C-Level / VP)' },
                            { key: 'technicalLeadScope', label: 'Technical Evaluator (Lead / Architect)' },
                          ].map((item) => {
                            const isChecked = !!keyPeopleForm[item.key];
                            return (
                              <div
                                key={item.key}
                                onClick={() => setKeyPeopleForm({ ...keyPeopleForm, [item.key]: !isChecked })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isChecked ? '1.5px solid #059669' : '1px solid #E5E7EB',
                                  backgroundColor: isChecked ? '#ECFDF5' : '#F9FAFB',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                {isChecked ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#9CA3AF" />}
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isChecked ? '#059669' : '#374151' }}>
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Additional Guidelines / Instructions</label>
                        <textarea
                          rows={3}
                          style={textareaStyle(false)}
                          placeholder="e.g. Focus on decision-makers active in the last 6 months, include tenure information"
                          value={keyPeopleForm.additionalGuidelines}
                          onChange={(e) => setKeyPeopleForm({ ...keyPeopleForm, additionalGuidelines: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      SERVICE FORM: PITCH SUPPORT
                      ======================================================== */}
                  {activeServiceId === 'pitch-support' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            Pitch Type / Target Audience <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            style={inputStyle(errors.pitchType)}
                            placeholder="e.g. Series A VC Investor Pitch, Enterprise Sales Presentation"
                            value={pitchSupportForm.pitchType}
                            onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, pitchType: e.target.value })}
                          />
                          {errors.pitchType && <div style={errorStyle}>{errors.pitchType}</div>}
                        </div>

                        <div>
                          <label style={labelStyle}>
                            Current Materials Status <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            style={inputStyle(errors.currentStatus)}
                            placeholder="e.g. Have 10-slide draft deck, need market verification & redesign"
                            value={pitchSupportForm.currentStatus}
                            onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, currentStatus: e.target.value })}
                          />
                          {errors.currentStatus && <div style={errorStyle}>{errors.currentStatus}</div>}
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Core Value Proposition <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          style={textareaStyle(errors.coreValueProposition)}
                          placeholder="e.g. We provide automated compliance screening that reduces regulatory review time from weeks to minutes."
                          value={pitchSupportForm.coreValueProposition}
                          onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, coreValueProposition: e.target.value })}
                        />
                        {errors.coreValueProposition && <div style={errorStyle}>{errors.coreValueProposition}</div>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>Competitor Battlecard Targets</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. Competitor A, Competitor B (pricing & feature gaps)"
                            value={pitchSupportForm.competitorTargets}
                            onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, competitorTargets: e.target.value })}
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Requested Deliverables &amp; Format</label>
                          <input
                            style={inputStyle(false)}
                            placeholder="e.g. TAM/SAM/SOM Sizing Deck, PDF & Figma slides"
                            value={pitchSupportForm.deliverablesRequested}
                            onChange={(e) => setPitchSupportForm({ ...pitchSupportForm, deliverablesRequested: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT / SIDEBAR COLUMN: LIVE ORDER SUMMARY & DIRECT SUBMISSION */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    position: 'sticky',
                    top: '24px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: '8px' }}>
                    SPRINT SUMMARY
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>
                      {currentService.title}
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: currentService.iconBg,
                        color: currentService.iconColor,
                      }}
                    >
                      {currentService.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    {currentService.headline}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '14px 16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Turnaround SLA:</span>
                      <span style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#0284C7" />
                        {currentService.turnaround}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 700 }}>Estimated Cost:</span>
                      <span style={{ fontSize: '1.25rem', color: '#059669', fontWeight: 800 }}>
                        ${estimatedPrice} USD
                      </span>
                    </div>

                    {activeServiceId === 'lead-research' && (
                      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '4px', textAlign: 'right' }}>
                        ({leadForm.leadsCount || 1} leads × $2.00)
                      </div>
                    )}
                  </div>

                  {/* What you get checklist */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#4B5563', marginBottom: '8px' }}>
                      WHAT'S INCLUDED:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentService.deliverables.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78125rem', color: '#374151' }}>
                          <CheckCircle2 size={14} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guarantee Seal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      marginBottom: '20px',
                    }}
                  >
                    <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                      0% Bounce Guarantee &amp; Telemetry Hand-Verification
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.75 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{isSubmitting ? 'Submitting Request...' : `Submit Request ($${estimatedPrice})`}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )
      ) : (
        /* ============================================================
            3. VIEW MODE: DIGITALISING REQUESTS TRACKER (PAST REQUESTS)
            ============================================================ */
        <div>
          {/* Action Row & Filter Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID or service name..."
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.84375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Status Filter Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Requests' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'REVIEW', label: 'Client Review' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78125rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? '#0284C7' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#4B5563',
                      border: isActive ? '1px solid #0284C7' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Button to go back to Form */}
            <Button variant="primary" size="sm" onClick={() => setViewMode('form')}>
              <Plus size={14} />
              <span>+ New Request Form</span>
            </Button>
          </div>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <FileText size={40} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
                No Digitalising Requests Found
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 20px 0' }}>
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No requests match your current search and filter criteria.'
                  : 'You have not submitted any digitalising intelligence requests yet.'}
              </p>
              <Button variant="primary" size="sm" onClick={() => setViewMode('form')}>
                Fill Digitalising Request Form
              </Button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                        Ticket ID
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                        Title &amp; Service
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                        Status
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                        Deliverables
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                        Created
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      const deliverablesCount = (req.deliverables?.length || req.submissions?.length || 0);

                      return (
                        <tr
                          key={req.id || req.ticketId}
                          onClick={() => onViewRequest && onViewRequest(req)}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F9FF')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '16px 20px' }}>
                            <span
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: '#0284C7',
                                backgroundColor: '#E0F2FE',
                                padding: '4px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              {req.ticketId || `REQ-${req.id}`}
                            </span>
                          </td>

                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                              {req.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                              {req.service || req.serviceType || 'Digitalising Sprint'}
                            </div>
                          </td>

                          <td style={{ padding: '16px 20px' }}>
                            <StatusBadge status={req.status} size="sm" />
                          </td>

                          <td style={{ padding: '16px 20px' }}>
                            {deliverablesCount > 0 ? (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#059669',
                                  backgroundColor: '#ECFDF5',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <FileText size={12} />
                                {deliverablesCount} File{deliverablesCount > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>In Progress</span>
                            )}
                          </td>

                          <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: '#6B7280' }}>
                            {req.createdDate || (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent')}
                          </td>

                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewRequest && onViewRequest(req);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                color: '#0284C7',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <span>View Request</span>
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styling Constants
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
  border: hasError ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
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
  border: hasError ? '1.5px solid #EF4444' : '1px solid #D1D5DB',
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
