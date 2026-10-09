import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  Users,
  FileText,
  Presentation,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Upload,
  Search,
  Lock,
  Linkedin,
  Mail,
  Phone,
  FileUp,
  AlertCircle,
  HelpCircle,
  Share2,
  Layers,
  Image,
  Globe,
  UserPlus,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../../../services/api';

export default function LeadShowcasesPage({ onNavigate }) {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [copiedEmailSlug, setCopiedEmailSlug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState(null);
  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'study' | 'leads'

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    title: '',
    description: '',
    logoUrl: '/logo.png',
    status: 'PUBLISHED',
    companyStudy: {
      company: '',
      industry: 'Enterprise Software & Tech',
      businessOverview: '',
      marketPosition: '',
      keyObservations: '',
      potentialOpportunity: '',
    },
    leads: [],
    pitchDeck: {
      title: '',
      summary: '',
    },
  });

  // Lead under edit inside modal
  const [leadForm, setLeadForm] = useState({
    name: '',
    companyLink: '',
    email: '',
    linkedin: '',
    leadStudyPdf: '',
    leadStudyPdfName: '',
    pitchDeckPdf: '',
    pitchDeckPdfName: '',
    logo: '',
    title: '',
    company: '',
    aboutCompany: '',
    whySuitsBest: '',
    whyRelevant: '',
    observedContext: '',
    suggestedApproach: '',
  });
  const [editingLeadIndex, setEditingLeadIndex] = useState(null);
  const [bulkLeadText, setBulkLeadText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Upload state
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  useEffect(() => {
    loadShowcases();
  }, []);

  const loadShowcases = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAdminSamples();
      if (res?.samples) {
        setShowcases(res.samples);
      }
    } catch (err) {
      console.error('[LeadShowcasesPage] Error loading showcases:', err);
      setError(err.message || 'Failed to load prospect showcases');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingShowcase(null);
    setFormData({
      companyName: '',
      slug: '',
      title: '',
      description: '',
      logoUrl: '/logo.png',
      status: 'PUBLISHED',
      companyStudy: {
        company: '',
        industry: 'Enterprise Software & Tech',
        businessOverview: '',
        marketPosition: '',
        keyObservations: '',
      },
      leads: [
        {
          id: `lead-${Date.now()}-1`,
          name: 'Sarah Jenkins',
          title: 'VP of Global Enterprise Architecture',
          company: 'Acme Global Systems',
          companyLink: 'https://acmeglobal.com',
          aboutCompany: 'Enterprise IT infrastructure provider serving Fortune 500 customers.',
          linkedin: 'https://linkedin.com/in/sarah-jenkins-sample',
          email: 's.jenkins@acmeglobal.com',
          logo: '/logo.png',
          leadStudyPdf: '',
          leadStudyPdfName: '',
          pitchDeckPdf: '',
          pitchDeckPdfName: '',
          whySuitsBest: 'Leading multi-region platform migration with open Q3 procurement budget.',
          leadStudy: {
            whyRelevant: 'Direct budget authority for integration and architecture overhaul.',
            observedContext: 'Recently published whitepaper on cloud modernization initiatives.',
            suggestedApproach: 'Highlight verifiable deliverable SLAs and technical speed.',
          },
        },
      ],
      pitchDeck: {
        title: 'Enterprise Growth & Acceleration Playbook',
        summary: 'Targeted strategic deck prepared for client leadership.',
      },
    });
    setActiveTab('company');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (showcase) => {
    setEditingShowcase(showcase);
    setFormData({
      companyName: showcase.companyName || '',
      slug: showcase.slug || '',
      title: showcase.title || '',
      description: showcase.description || '',
      logoUrl: showcase.logoUrl || '/logo.png',
      status: showcase.status || 'PUBLISHED',
      companyStudy: showcase.companyStudy || {
        company: showcase.companyName || '',
        industry: 'Enterprise Software & Tech',
        businessOverview: '',
        marketPosition: '',
        keyObservations: '',
      },
      leads: showcase.leads || [],
      pitchDeck: showcase.pitchDeck || {
        title: '',
        summary: '',
      },
    });
    setActiveTab('company');
    setIsModalOpen(true);
  };

  const handleSaveShowcase = async () => {
    try {
      if (!formData.companyName.trim()) {
        alert('Please enter target company name.');
        return;
      }

      const formatSlug = (input) => {
        if (!input) return '';
        return String(input)
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .replace(/\/+$/, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      };

      const generatedSlug = formatSlug(formData.slug) || formatSlug(formData.companyName) || `showcase-${Date.now()}`;

      const payload = {
        ...formData,
        slug: generatedSlug,
        title: formData.title.trim() || `${formData.companyName.trim()} Intelligence & Growth Showcase`,
        companyStudy: {
          ...formData.companyStudy,
          company: formData.companyStudy.company || formData.companyName.trim(),
        },
      };

      if (editingShowcase) {
        await api.updateAdminSample(editingShowcase.id, payload);
      } else {
        await api.createAdminSample(payload);
      }

      setIsModalOpen(false);
      await loadShowcases();
    } catch (err) {
      alert(`Failed to save showcase: ${err.message}`);
    }
  };

  const handleDeleteShowcase = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the prospect showcase for "${name}"?`)) {
      return;
    }
    try {
      await api.deleteAdminSample(id);
      await loadShowcases();
    } catch (err) {
      alert(`Failed to delete showcase: ${err.message}`);
    }
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/samples/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCopyEmailTemplate = (showcase) => {
    const fullUrl = `${window.location.origin}/samples/${showcase.slug}`;
    const emailTemplate = `Subject: Bespoke Market Intelligence & Growth Blueprint for ${showcase.companyName}

Hi team at ${showcase.companyName},

Our research specialists at CreativeGini have put together a dedicated intelligence showcase specifically for ${showcase.companyName}.

We analyzed your current market position, prepared a deep-dive Company Study, mapped key high-fit prospect accounts with strategic fit analyses, and formulated an actionable outreach proposal:

👉 Explore Your Interactive Showcase: ${fullUrl}

Key deliverables included inside your showcase:
• Company Study: Market positioning and strategic growth levers
• High-Impact Leads: Vetted stakeholders with tailored "Why Suits Best" analysis
• Lead Deep Dives: Individual trigger events and recommended approach angles
• Pitch Deck: Turnkey presentation proposal tailored for your brand

Feel free to inspect the sample data. Whenever you are ready to unlock direct contact details and scale with our specialist team, click "More Leads" on the dashboard.

Best regards,
CreativeGini Lead Intelligence Team
support@creativegini.com`;

    navigator.clipboard.writeText(emailTemplate);
    setCopiedEmailSlug(showcase.slug);
    setTimeout(() => setCopiedEmailSlug(null), 3000);
  };

  // Upload Company Study PDF
  const handleUploadCompanyStudyPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingShowcase?.id) {
      setIsUploadingPdf(true);
      setUploadStatusMsg('Reading and attaching PDF...');
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          companyStudy: {
            ...prev.companyStudy,
            pdfFileDataUrl: reader.result,
            pdfFileName: file.name,
            pdfMimeType: file.type || 'application/pdf',
          },
        }));
        setIsUploadingPdf(false);
        setUploadStatusMsg(`Attached: ${file.name}`);
        setTimeout(() => setUploadStatusMsg(''), 2500);
      };
      reader.onerror = () => {
        setIsUploadingPdf(false);
        alert('Failed to read PDF file.');
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      setIsUploadingPdf(true);
      setUploadStatusMsg('Reading file...');

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result;
          setUploadStatusMsg('Uploading to secure object storage...');
          const res = await api.uploadCompanyStudyPdf(editingShowcase.id, {
            fileDataUrl: dataUrl,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
          });
          if (res?.sample) {
            setFormData((prev) => ({
              ...prev,
              companyStudy: res.sample.companyStudy || prev.companyStudy,
            }));
            setUploadStatusMsg('PDF uploaded successfully!');
            setTimeout(() => setUploadStatusMsg(''), 2500);
          }
        } catch (err) {
          alert(`Failed to upload PDF: ${err.message}`);
          setUploadStatusMsg('');
        } finally {
          setIsUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingPdf(false);
      alert(`Error reading file: ${err.message}`);
    }
  };

  // Add / Edit Lead in Form
  const handleSaveLead = () => {
    if (!leadForm.name.trim()) {
      alert('Lead Name is required.');
      return;
    }

    const companyName = leadForm.company?.trim() || formData.companyName || 'Target Organization';

    const newLead = {
      id: editingLeadIndex !== null ? formData.leads[editingLeadIndex].id : `lead-${Date.now()}`,
      name: leadForm.name.trim(),
      companyLink: leadForm.companyLink?.trim() || '',
      email: leadForm.email?.trim() || '',
      linkedin: leadForm.linkedin?.trim() || '',
      leadStudyPdf: leadForm.leadStudyPdf || '',
      leadStudyPdfName: leadForm.leadStudyPdfName || '',
      pitchDeckPdf: leadForm.pitchDeckPdf || '',
      pitchDeckPdfName: leadForm.pitchDeckPdfName || '',
      logo: leadForm.logo || '',
      title: leadForm.title?.trim() || 'Key Executive',
      company: companyName,
      aboutCompany: leadForm.aboutCompany?.trim() || `Enterprise organization operating in ${formData.companyStudy?.industry || 'technology'}.`,
      whySuitsBest: leadForm.whySuitsBest?.trim() || 'Strategic decision maker aligned with key pain points.',
      leadStudy: {
        whyRelevant: leadForm.whyRelevant?.trim() || 'Direct decision authority and strategic alignment.',
        observedContext: leadForm.observedContext?.trim() || 'Observed growth and strategic expansion.',
        suggestedApproach: leadForm.suggestedApproach?.trim() || 'Lead with verifiable outcomes and SLA guarantees.',
      },
      pitchDeck: leadForm.pitchDeckPdf ? {
        title: `${leadForm.name.trim()} Proposal Pitch Deck`,
        summary: 'Targeted strategic pitch deck prepared for client leadership.',
        streamUrl: leadForm.pitchDeckPdf,
        downloadUrl: leadForm.pitchDeckPdf,
        fileName: leadForm.pitchDeckPdfName || `${leadForm.name.trim().replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
      } : null,
    };

    const updatedLeads = [...formData.leads];
    if (editingLeadIndex !== null) {
      updatedLeads[editingLeadIndex] = newLead;
    } else {
      updatedLeads.push(newLead);
    }

    setFormData({ ...formData, leads: updatedLeads });
    setLeadForm({
      name: '',
      companyLink: '',
      email: '',
      linkedin: '',
      leadStudyPdf: '',
      leadStudyPdfName: '',
      pitchDeckPdf: '',
      pitchDeckPdfName: '',
      logo: '',
      title: '',
      company: '',
      aboutCompany: '',
      whySuitsBest: '',
      whyRelevant: '',
      observedContext: '',
      suggestedApproach: '',
    });
    setEditingLeadIndex(null);
  };

  // Bulk Import Leads (CSV / Tab separated)
  const handleBulkImport = () => {
    if (!bulkLeadText.trim()) return;

    const lines = bulkLeadText.split('\n').filter((l) => l.trim().length > 0);
    const imported = [];

    lines.forEach((line, idx) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const name = parts[0]?.trim();
        const companyLink = parts[1]?.trim() || '';
        const email = parts[2]?.trim() || '';
        const linkedin = parts[3]?.trim() || '';
        const title = parts[4]?.trim() || 'Key Executive';
        const whySuitsBest = parts[5]?.trim() || 'Vetted prospect with immediate relevance to strategic offering.';

        if (name && name.toLowerCase() !== 'name') {
          imported.push({
            id: `lead-${Date.now()}-${idx}`,
            name,
            companyLink,
            email,
            linkedin,
            title,
            company: formData.companyName || 'Target Enterprise',
            aboutCompany: `Leading corporate enterprise operating in ${formData.companyStudy.industry}.`,
            leadStudyPdf: '',
            leadStudyPdfName: '',
            pitchDeckPdf: '',
            pitchDeckPdfName: '',
            logo: '',
            whySuitsBest,
            leadStudy: {
              whyRelevant: 'Direct budget authority and strategic alignment.',
              observedContext: 'Expanding modern software and operational infrastructure.',
              suggestedApproach: 'Direct outreach referencing custom intelligence showcase.',
            },
          });
        }
      }
    });

    if (imported.length > 0) {
      setFormData({ ...formData, leads: [...formData.leads, ...imported] });
      setBulkLeadText('');
      setShowBulkImport(false);
      alert(`Successfully imported ${imported.length} leads!`);
    } else {
      alert('Could not parse any leads. Format: Name, Company Link, Email, LinkedIn, Title, Why Suits Best');
    }
  };

  const filteredShowcases = showcases.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.companyName?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header & Quick Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ display: 'inline-flex', padding: '6px', background: '#F5F3FF', color: '#7C3AED', borderRadius: '10px' }}>
              <Sparkles size={20} />
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              Prospect Showcases & Sample Dashboards
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
            Upload Company Studies, high-fit leads, and pitch decks for target companies before any ticket is created. Generate instant client visit links to send in cold outreach emails.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={18} />
          Create Prospect Showcase
        </button>
      </div>

      {/* 2. Strategy & Outreach Quick Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)',
          border: '1px solid #DDD4FA',
          borderRadius: '14px',
          padding: '18px 22px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Share2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#4C1D95' }}>
              Cold Outreach Flow: No Ticket Needed
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6D28D9' }}>
              1. Add target company & Company Study PDF → 2. Add leads with "Why Suits Best" & masked contacts → 3. Copy client dashboard link or email pitch template!
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E9D5FF', fontSize: '0.8125rem', fontWeight: 600, color: '#6D28D9' }}>
            Active Showcases: <strong style={{ color: '#4C1D95' }}>{showcases.length}</strong>
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search target company or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>
      </div>

      {/* 4. Showcase Table / Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 14px auto' }} />
          Loading showcases...
        </div>
      ) : filteredShowcases.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px dashed #D1D5DB',
            borderRadius: '14px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <Building2 size={40} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            No Prospect Showcases Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', maxWidth: '440px', margin: '0 auto 18px auto' }}>
            Start by creating a showcase for the first prospective client you want to reach out to.
          </p>
          <button
            onClick={handleOpenCreateModal}
            style={{
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            + Create First Showcase
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredShowcases.map((showcase) => {
            const hasCompanyStudyPdf = Boolean(showcase.companyStudy?.pdfAssetKey);
            const leadsCount = showcase.leads?.length || 0;
            const fullVisitUrl = `${window.location.origin}/samples/${showcase.slug}`;

            return (
              <div
                key={showcase.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                {/* Left: Target Company Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                  {showcase.logoUrl && showcase.logoUrl !== '/logo.png' ? (
                    <img
                      src={showcase.logoUrl}
                      alt={showcase.companyName}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        objectFit: 'contain',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        padding: '3px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: '#4B5563',
                        fontSize: '1.2rem',
                      }}
                    >
                      {showcase.companyName?.charAt(0) || 'C'}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {showcase.companyName}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: showcase.status === 'PUBLISHED' ? '#ECFDF5' : '#F3F4F6',
                          color: showcase.status === 'PUBLISHED' ? '#059669' : '#6B7280',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: `1px solid ${showcase.status === 'PUBLISHED' ? '#A7F3D0' : '#E5E7EB'}`,
                        }}
                      >
                        {showcase.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
                      Slug: <code style={{ color: '#7C3AED', background: '#F5F3FF', padding: '1px 6px', borderRadius: '4px' }}>/samples/{showcase.slug}</code>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: '#4B5563' }}>
                      <span>👥 {leadsCount} Curated Leads</span>
                      <span>•</span>
                      <span>📄 Company Study: {hasCompanyStudyPdf ? 'PDF Uploaded ✅' : 'Text Summary'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  
                  {/* Visit Public Sample Dashboard */}
                  <a
                    href={fullVisitUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    Visit Client Dashboard
                  </a>

                  {/* Copy Outreach Link */}
                  <button
                    onClick={() => handleCopyLink(showcase.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: copiedSlug === showcase.slug ? '#ECFDF5' : '#FFFFFF',
                      color: copiedSlug === showcase.slug ? '#059669' : '#374151',
                      border: `1px solid ${copiedSlug === showcase.slug ? '#A7F3D0' : '#D1D5DB'}`,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedSlug === showcase.slug ? <Check size={14} /> : <Copy size={14} />}
                    {copiedSlug === showcase.slug ? 'Link Copied!' : 'Copy Outreach Link'}
                  </button>

                  {/* Copy Email Pitch Template */}
                  <button
                    onClick={() => handleCopyEmailTemplate(showcase)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: copiedEmailSlug === showcase.slug ? '#FAF5FF' : '#FFFFFF',
                      color: copiedEmailSlug === showcase.slug ? '#7C3AED' : '#374151',
                      border: `1px solid ${copiedEmailSlug === showcase.slug ? '#DDD4FA' : '#D1D5DB'}`,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Copy high-converting cold email template with link"
                  >
                    {copiedEmailSlug === showcase.slug ? <Check size={14} /> : <Mail size={14} />}
                    {copiedEmailSlug === showcase.slug ? 'Email Pitch Copied!' : 'Copy Email Pitch'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(showcase)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      color: '#4B5563',
                      border: '1px solid #D1D5DB',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={14} />
                    Edit & Leads
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteShowcase(showcase.id, showcase.companyName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#FFFFFF',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    title="Delete Showcase"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Comprehensive Create / Edit Showcase Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {editingShowcase ? `Edit Showcase: ${formData.companyName}` : 'Create Prospect Showcase'}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>
                  Upload company study, curate verified leads with 'Why Suits Best', and generate outreach assets.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 24px', background: '#FAFAFC' }}>
              <button
                onClick={() => setActiveTab('company')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'company' ? 700 : 500,
                  color: activeTab === 'company' ? '#7C3AED' : '#6B7280',
                  borderBottom: activeTab === 'company' ? '2px solid #7C3AED' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                1. Target Company & Overview
              </button>
              <button
                onClick={() => setActiveTab('study')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'study' ? 700 : 500,
                  color: activeTab === 'study' ? '#7C3AED' : '#6B7280',
                  borderBottom: activeTab === 'study' ? '2px solid #7C3AED' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                2. Company Study & PDF Upload
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'leads' ? 700 : 500,
                  color: activeTab === 'leads' ? '#7C3AED' : '#6B7280',
                  borderBottom: activeTab === 'leads' ? '2px solid #7C3AED' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                3. Curated Leads ({formData.leads.length})
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* TAB 1: Target Company */}
              {activeTab === 'company' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Target Company Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Data-i2i Solutions"
                      value={formData.companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const formatSlug = (s) => s.replace(/^https?:\/\//i, '').replace(/^www\./i, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                        setFormData({
                          ...formData,
                          companyName: val,
                          slug: formData.slug ? formData.slug : formatSlug(val),
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Custom URL Slug (Outreach Link)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. data-i2i or meetfranz"
                        value={formData.slug}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
                          setFormData({ ...formData, slug: cleaned });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                        Live URL: {window.location.origin}/samples/{formData.slug ? formData.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') : 'company-slug'}
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Target Industry
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Enterprise AI & Analytics"
                        value={formData.companyStudy.industry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyStudy: { ...formData.companyStudy, industry: e.target.value },
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Showcase Headline Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bespoke Market Intelligence & Growth Blueprint"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Executive Summary / What We Know
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief introductory context explaining what CreativeGini discovered regarding this client..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Company Study & PDF Upload */}
              {activeTab === 'study' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* PDF Upload Box */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <FileUp size={32} color="#7C3AED" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
                      Company Study PDF Document
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 14px 0' }}>
                      {formData.companyStudy.pdfFileName ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          Currently attached: {formData.companyStudy.pdfFileName}
                        </span>
                      ) : (
                        'Upload complete in-depth Company Study PDF for this prospect (stored in secure object storage).'
                      )}
                    </p>

                    <div>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#7C3AED',
                          color: '#FFFFFF',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={14} />
                        {isUploadingPdf ? 'Processing...' : 'Upload / Replace Company Study PDF'}
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleUploadCompanyStudyPdf}
                          disabled={isUploadingPdf}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {uploadStatusMsg && (
                        <div style={{ fontSize: '0.8125rem', color: '#7C3AED', marginTop: '8px', fontWeight: 500 }}>
                          {uploadStatusMsg}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Business Overview
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Core business model, product lines, and enterprise targets..."
                      value={formData.companyStudy.businessOverview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyStudy: { ...formData.companyStudy, businessOverview: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Market Position & Competitor Analysis
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Competitive advantages, quadrant position, peer comparison..."
                      value={formData.companyStudy.marketPosition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyStudy: { ...formData.companyStudy, marketPosition: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Key Observations (Observed Gaps & Triggers)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Identified bottlenecks, outdated tech, slow lead cycles, or new leadership triggers..."
                      value={formData.companyStudy.keyObservations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyStudy: { ...formData.companyStudy, keyObservations: e.target.value },
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Leads */}
              {activeTab === 'leads' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Lead List Header & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Curated Prospect Leads ({formData.leads.length})
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>
                        These leads will appear in Row View with masked contact details to entice signups.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowBulkImport(!showBulkImport)}
                      style={{
                        background: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {showBulkImport ? 'Close Bulk Import' : '📋 Quick Import (Excel / CSV Paste)'}
                    </button>
                  </div>

                  {/* Bulk Import Box */}
                  {showBulkImport && (
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                        Paste Excel / CSV Rows (Tab or comma separated)
                      </label>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                        Columns: <code>Name, Title, Company, LinkedIn, Email, Phone, Why Suits Best</code>
                      </p>
                      <textarea
                        rows={4}
                        placeholder={`Alex Rivera\tChief Marketing Officer\tNexus Dynamics\thttps://linkedin.com/in/alex\talex@nexus.com\t+1 555-0199\tAccelerating customer acquisition pipeline`}
                        value={bulkLeadText}
                        onChange={(e) => setBulkLeadText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontFamily: 'monospace',
                        }}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={handleBulkImport}
                          style={{
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Import Leads
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add / Edit Single Lead Form */}
                  <div style={{ background: '#FAF5FF', border: '1px solid #DDD4FA', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={16} />
                        {editingLeadIndex !== null ? `Edit Lead Details (#${editingLeadIndex + 1})` : '+ Add Curated Lead to Showcase'}
                      </div>
                      {editingLeadIndex !== null && (
                        <span style={{ fontSize: '0.75rem', color: '#7C3AED', background: '#EDE9FE', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Editing lead #{editingLeadIndex + 1}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      {/* 1. Lead Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          1. Lead Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={leadForm.name}
                          onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '0.84rem' }}
                        />
                      </div>

                      {/* 2. Company Link */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          2. Company Link / Website *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://acmeglobal.com"
                          value={leadForm.companyLink}
                          onChange={(e) => setLeadForm({ ...leadForm, companyLink: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '0.84rem' }}
                        />
                      </div>

                      {/* 3. Work Mail */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          3. Work Mail (Masked on public view)
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. s.jenkins@acmeglobal.com"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '0.84rem' }}
                        />
                      </div>

                      {/* 4. Person LinkedIn ID / Profile */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          4. Person LinkedIn Profile URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://linkedin.com/in/sarah-jenkins"
                          value={leadForm.linkedin}
                          onChange={(e) => setLeadForm({ ...leadForm, linkedin: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '0.84rem' }}
                        />
                      </div>

                      {/* 5. Company Logo Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          5. Company Logo (Image)
                        </label>
                        {leadForm.logo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '7px', border: '1px solid #D1D5DB' }}>
                            <img src={leadForm.logo} alt="Lead Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'contain', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }} />
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Logo Attached</span>
                            <button
                              type="button"
                              onClick={() => setLeadForm((prev) => ({ ...prev, logo: '' }))}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Remove logo"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '9px 12px',
                              borderRadius: '7px',
                              border: '1px dashed #7C3AED',
                              background: '#FFFFFF',
                              color: '#7C3AED',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Image size={15} color="#7C3AED" />
                            <span>Upload Company Logo</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setLeadForm((prev) => ({ ...prev, logo: ev.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* 6. Lead Study PDF Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          6. Lead Study PDF (Document)
                        </label>
                        {leadForm.leadStudyPdf ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '7px', border: '1px solid #D1D5DB' }}>
                            <FileText size={18} color="#2563EB" />
                            <span style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {leadForm.leadStudyPdfName || 'Lead Study PDF Attached'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLeadForm((prev) => ({ ...prev, leadStudyPdf: '', leadStudyPdfName: '' }))}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Remove PDF"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '9px 12px',
                              borderRadius: '7px',
                              border: '1px dashed #2563EB',
                              background: '#FFFFFF',
                              color: '#2563EB',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <FileUp size={15} color="#2563EB" />
                            <span>Upload Lead Study PDF</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setLeadForm((prev) => ({
                                    ...prev,
                                    leadStudyPdf: ev.target.result,
                                    leadStudyPdfName: file.name,
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* 7. Pitch Deck PDF Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          7. Pitch Deck / Proposal PDF (Document)
                        </label>
                        {leadForm.pitchDeckPdf ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '7px', border: '1px solid #D1D5DB' }}>
                            <Presentation size={18} color="#7C3AED" />
                            <span style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {leadForm.pitchDeckPdfName || 'Pitch Deck PDF Attached'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLeadForm((prev) => ({ ...prev, pitchDeckPdf: '', pitchDeckPdfName: '' }))}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Remove Pitch Deck"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '9px 12px',
                              borderRadius: '7px',
                              border: '1px dashed #7C3AED',
                              background: '#FFFFFF',
                              color: '#7C3AED',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Presentation size={15} color="#7C3AED" />
                            <span>Upload Pitch Deck PDF</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setLeadForm((prev) => ({
                                    ...prev,
                                    pitchDeckPdf: ev.target.result,
                                    pitchDeckPdfName: file.name,
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Secondary Context Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>
                          Designation / Job Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. VP of Global Enterprise Architecture"
                          value={leadForm.title}
                          onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>
                          Why This Lead Suits Best (Fit Rationale)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Leading platform overhaul with active budget..."
                          value={leadForm.whySuitsBest}
                          onChange={(e) => setLeadForm({ ...leadForm, whySuitsBest: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {editingLeadIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLeadIndex(null);
                            setLeadForm({
                              name: '',
                              companyLink: '',
                              email: '',
                              linkedin: '',
                              leadStudyPdf: '',
                              leadStudyPdfName: '',
                              pitchDeckPdf: '',
                              pitchDeckPdfName: '',
                              logo: '',
                              title: '',
                              company: '',
                              aboutCompany: '',
                              whySuitsBest: '',
                              whyRelevant: '',
                              observedContext: '',
                              suggestedApproach: '',
                            });
                          }}
                          style={{
                            background: '#F3F4F6',
                            color: '#4B5563',
                            border: '1px solid #D1D5DB',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveLead}
                        style={{
                          background: '#7C3AED',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '7px 18px',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                        }}
                      >
                        {editingLeadIndex !== null ? 'Update Lead' : '+ Add Lead to Showcase'}
                      </button>
                    </div>
                  </div>

                  {/* Existing Leads List (1, 2, 3...) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.leads.map((l, index) => (
                      <div
                        key={l.id || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          gap: '14px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px', flex: '1 1 280px' }}>
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#F3F4F6',
                              color: '#6B7280',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </span>

                          {l.logo ? (
                            <img src={l.logo} alt={l.company} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', padding: '2px' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                              {l.name?.charAt(0) || 'L'}
                            </div>
                          )}

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{l.name}</strong>
                              <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>• {l.title || 'Decision Maker'}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '3px' }}>
                              {l.companyLink && (
                                <a
                                  href={l.companyLink.startsWith('http') ? l.companyLink : `https://${l.companyLink}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.75rem', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                                >
                                  <Globe size={11} />
                                  <span>{l.companyLink.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')}</span>
                                </a>
                              )}
                              {l.email && (
                                <span style={{ fontSize: '0.75rem', color: '#4B5563', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Mail size={11} /> {l.email}
                                </span>
                              )}
                              {l.linkedin && (
                                <a
                                  href={l.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.75rem', color: '#0A66C2', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  <Linkedin size={11} /> LinkedIn
                                </a>
                              )}
                              {l.leadStudyPdf && (
                                <span style={{ fontSize: '0.72rem', color: '#1D4ED8', background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <FileText size={10} /> Lead Study Attached
                                </span>
                              )}
                              {(l.pitchDeckPdf || l.pitchDeck?.streamUrl) && (
                                <span style={{ fontSize: '0.72rem', color: '#7C3AED', background: '#F3E8FF', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Presentation size={10} /> Pitch Deck Attached
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLeadIndex(index);
                              setLeadForm({
                                name: l.name || '',
                                companyLink: l.companyLink || '',
                                email: l.email || '',
                                linkedin: l.linkedin || '',
                                leadStudyPdf: l.leadStudyPdf || '',
                                leadStudyPdfName: l.leadStudyPdfName || '',
                                pitchDeckPdf: l.pitchDeckPdf || l.pitchDeck?.streamUrl || '',
                                pitchDeckPdfName: l.pitchDeckPdfName || l.pitchDeck?.fileName || '',
                                logo: l.logo || '',
                                title: l.title || '',
                                company: l.company || '',
                                aboutCompany: l.aboutCompany || '',
                                whySuitsBest: l.whySuitsBest || '',
                                whyRelevant: l.leadStudy?.whyRelevant || '',
                                observedContext: l.leadStudy?.observedContext || '',
                                suggestedApproach: l.leadStudy?.suggestedApproach || '',
                              });
                            }}
                            style={{
                              background: '#F3F4F6',
                              border: '1px solid #D1D5DB',
                              color: '#374151',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.leads.filter((_, i) => i !== index);
                              setFormData({ ...formData, leads: updated });
                            }}
                            style={{
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer (3-Step Wizard Flow) */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FAFAFC',
                borderRadius: '0 0 16px 16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                {activeTab === 'company' && <span>Step <strong>1 of 3</strong>: Target Account & Slug</span>}
                {activeTab === 'study' && <span>Step <strong>2 of 3</strong>: Company Study & PDF Upload</span>}
                {activeTab === 'leads' && <span>Step <strong>3 of 3</strong>: Curated Decision Makers ({formData.leads.length} added) & Pitch Decks</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* Back or Cancel Button */}
                {activeTab === 'company' ? (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#374151',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'study') setActiveTab('company');
                      if (activeTab === 'leads') setActiveTab('study');
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#374151',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    ← Back
                  </button>
                )}

                {/* Step 1 Next */}
                {activeTab === 'company' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.companyName.trim()) {
                        alert('Please enter a Target Company Name to proceed.');
                        return;
                      }
                      setActiveTab('study');
                    }}
                    style={{
                      background: '#7C3AED',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '9px 22px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    Save & Next: Company Study →
                  </button>
                )}

                {/* Step 2 Next */}
                {activeTab === 'study' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('leads')}
                    style={{
                      background: '#7C3AED',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '9px 22px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    Save & Next: Curated Leads →
                  </button>
                )}

                {/* Step 3 Final Submission */}
                {activeTab === 'leads' && (
                  <button
                    type="button"
                    onClick={handleSaveShowcase}
                    style={{
                      background: '#059669',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '9px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Save Showcase</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
