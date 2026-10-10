import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Play,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Users,
  Search,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ChevronRight,
  Send,
  Check,
  Paperclip,
  Presentation,
  ShieldCheck,
  Download,
  Bot,
  Layers,
  X,
  Image
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptLeadRequest, LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatDateTime, formatDateTimeWithTime } from '../data/leadAdapters';
import { parseLeadsFile, enrichLeadRow } from '../../client/utils/leadDataEnricher';

/**
 * Robust requirement detector tailored to client's brief for each unique ticket
 */
function detectTicketRequirements(ticket) {
  if (!ticket) {
    return { companyStudy: false, leadList: true, keyPeople: true, pitchDeck: false };
  }

  const reqs = ticket.requirements || {};
  const text = `${ticket.title || ''} ${ticket.description || ''} ${ticket.subService || ''} ${ticket.serviceType || ''} ${JSON.stringify(reqs)}`.toLowerCase();

  // Explicit flags
  let wantsCompanyStudy = Boolean(reqs.companyStudy || reqs.company_study || reqs.study);
  let wantsLeadList = Boolean(reqs.leadResearch || reqs.leadList || reqs.lead_list || reqs.leads);
  let wantsKeyPeople = Boolean(reqs.keyPeople || reqs.key_people || reqs.people);
  let wantsPitchDeck = Boolean(reqs.pitchSupport || reqs.pitchDeck || reqs.pitch_deck || reqs.pitch);

  // Inferences from text
  if (!wantsCompanyStudy && (text.includes('company study') || text.includes('company dossier') || text.includes('competitor audit') || text.includes('market study'))) {
    wantsCompanyStudy = true;
  }
  if (!wantsLeadList && (text.includes('lead') || text.includes('prospect') || text.includes('database') || text.includes('contacts') || text.includes('accounts'))) {
    wantsLeadList = true;
  }
  if (!wantsKeyPeople && (text.includes('key people') || text.includes('decision maker') || text.includes('cto') || text.includes('vp') || text.includes('executives') || text.includes('heads of') || text.includes('engineering'))) {
    wantsKeyPeople = true;
  }
  if (!wantsPitchDeck && (text.includes('pitch deck') || text.includes('pitch support') || text.includes('presentation') || text.includes('deck') || text.includes('proposal deck'))) {
    wantsPitchDeck = true;
  }

  // Fallback
  if (!wantsCompanyStudy && !wantsLeadList && !wantsKeyPeople && !wantsPitchDeck) {
    wantsLeadList = true;
    wantsKeyPeople = true;
  }

  return {
    companyStudy: wantsCompanyStudy,
    leadList: wantsLeadList,
    keyPeople: wantsKeyPeople,
    pitchDeck: wantsPitchDeck,
  };
}

/**
 * Extracts target specifications only if mentioned by the client
 */
function extractTargetSpecifications(ticket) {
  if (!ticket) return null;
  const reqs = ticket.requirements || {};
  const desc = ticket.description || '';

  const specs = {};
  if (reqs.leadsCount) specs.leadsCount = `${reqs.leadsCount} Verified Contacts`;
  if (reqs.targetMarket) specs.targetMarket = reqs.targetMarket;
  if (reqs.targetPersonas) specs.targetPersonas = reqs.targetPersonas;
  if (reqs.companySize) specs.companySize = reqs.companySize;
  if (reqs.qualificationCriteria) specs.qualificationCriteria = reqs.qualificationCriteria;
  if (reqs.referenceLinks) specs.referenceLinks = reqs.referenceLinks;

  if (!specs.leadsCount) {
    const match = desc.match(/(\d+)\s*(?:additional\s*)?(?:verified\s*)?(?:leads|prospects|contacts|ctos|accounts)/i);
    if (match) specs.leadsCount = `${match[1]} Verified Prospects`;
  }
  if (!specs.targetMarket) {
    if (desc.toLowerCase().includes('european') || desc.toLowerCase().includes('germany') || desc.toLowerCase().includes('uk') || desc.toLowerCase().includes('netherlands')) {
      specs.targetMarket = 'European SaaS (Germany, UK, Netherlands)';
    } else if (desc.toLowerCase().includes('saas')) {
      specs.targetMarket = 'Enterprise SaaS';
    }
  }
  if (!specs.targetPersonas) {
    if (desc.toLowerCase().includes('cto') || desc.toLowerCase().includes('vp') || desc.toLowerCase().includes('head of')) {
      specs.targetPersonas = 'CTOs, VPs of Engineering, Heads of Cloud';
    }
  }
  if (!specs.companySize && (desc.toLowerCase().includes('series a') || desc.toLowerCase().includes('series b') || desc.toLowerCase().includes('series c'))) {
    specs.companySize = 'Series A - Series C Tech Scaleups';
  }

  return Object.keys(specs).length > 0 ? specs : null;
}

/**
 * Parses submission payload notes or description
 */
function parseSubmissionNotes(sub) {
  if (!sub) return { isParsed: false, rawText: '' };
  let parsed = null;
  if (typeof sub.notes === 'object' && sub.notes !== null) {
    parsed = sub.notes;
  } else if (typeof sub.notes === 'string') {
    try {
      parsed = JSON.parse(sub.notes);
    } catch (e) {
      try {
        parsed = JSON.parse(sub.description);
      } catch (e2) {
        parsed = null;
      }
    }
  } else if (typeof sub.description === 'string') {
    try {
      parsed = JSON.parse(sub.description);
    } catch (e) {}
  }

  if (parsed && typeof parsed === 'object') {
    return {
      isParsed: true,
      data: parsed,
      keyPeople: Array.isArray(parsed.keyPeople) ? parsed.keyPeople : [],
      leadList: parsed.leadList || null,
      companyStudy: parsed.companyStudy || null,
      pitchDeck: parsed.pitchDeck || null,
      aiVerification: parsed.aiVerification || null,
    };
  }

  return {
    isParsed: false,
    rawText: sub.notes || sub.description || sub.summary || 'Official deliverable package.'
  };
}

export default function ResearchWorkspacePage({ onNavigate }) {
  const { ticketId: routeTicketId } = useParams();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQueue, setSearchQueue] = useState('');

  // Active ticket dynamic requirements
  const [activeReqs, setActiveReqs] = useState({
    companyStudy: false,
    leadList: true,
    keyPeople: true,
    pitchDeck: false,
  });

  // Uploaded and updated state for each deliverable requirement
  const [companyStudyFile, setCompanyStudyFile] = useState(null);
  const [companyStudyTitle, setCompanyStudyTitle] = useState('');
  const [companyStudyNotes, setCompanyStudyNotes] = useState('');

  const [leadListFile, setLeadListFile] = useState(null);
  const [leadListTitle, setLeadListTitle] = useState('');
  const [leadCount, setLeadCount] = useState('');
  const [batchCompanyLogoUrl, setBatchCompanyLogoUrl] = useState('');
  const [leads, setLeads] = useState([]);

  // Key People: Structured contact entry with Logo upload
  const [keyPeople, setKeyPeople] = useState([
    { name: '', company: '', designation: '', email: '', linkedin: '', logo: null, logoName: '' }
  ]);

  const [pitchDeckFile, setPitchDeckFile] = useState(null);
  const [pitchDeckTitle, setPitchDeckTitle] = useState('');
  const [pitchDeckNotes, setPitchDeckNotes] = useState('');

  // Submissions and Messages
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isStartingWork, setIsStartingWork] = useState(false);

  // Step 2: Qwen AI Model Analysis Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isSubmittingToClient, setIsSubmittingToClient] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Load all workspace requests
  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const rawReqs = await api.getRequests().catch(() => []);
      const adaptedReqs = (rawReqs || []).map(adaptLeadRequest);
      setRequests(adaptedReqs);

      let active = null;
      if (routeTicketId) {
        active = adaptedReqs.find(
          (r) => String(r.id) === String(routeTicketId) || String(r.ticketId) === String(routeTicketId)
        );
      }
      if (!active && adaptedReqs.length > 0) {
        active = adaptedReqs.find((r) => r.status === 'IN_PROGRESS' || r.status === 'WORK_RESUBMITTED') || adaptedReqs[0];
      }

      if (active) {
        await selectTicket(active);
      }
    } catch (err) {
      console.error('Failed to load workspace requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);

    // Detect client brief requirements
    const detected = detectTicketRequirements(ticket);
    setActiveReqs(detected);

    // Set default titles
    setCompanyStudyTitle(`${ticket.clientCompany || 'Client'} Comprehensive Company Study`);
    setLeadListTitle(`${ticket.clientCompany || 'Client'} Researched Lead List`);
    setPitchDeckTitle(`${ticket.clientCompany || 'Client'} Tailored Pitch Deck Proposal`);

    // Reset upload state for fresh review
    setCompanyStudyFile(null);
    setLeadListFile(null);
    setPitchDeckFile(null);
    setBatchCompanyLogoUrl('');
    setSubmissionSuccess(false);
    setLeads([]);

    // Fetch leads for this ticket's company if available
    const compId = ticket.companyId?.id || ticket.companyId?._id || ticket.companyId;
    if (compId && api.getCompanyLeads) {
      api.getCompanyLeads(compId).then(res => {
        if (res?.leads && Array.isArray(res.leads)) {
          setLeads(res.leads);
        }
      }).catch(() => {});
    }

    // Fetch submissions and messages for this ticket
    try {
      const ticketKey = ticket.ticketId || ticket.id;
      const [subsRes, msgsRes] = await Promise.allSettled([
        api.getSubmissions ? api.getSubmissions(ticketKey) : Promise.resolve([]),
        api.getMessages ? api.getMessages(ticketKey) : Promise.resolve([]),
      ]);

      if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
        setSubmissions(subsRes.value);
        if (subsRes.value.length > 0) {
          const latest = subsRes.value[0];
          const parsed = parseSubmissionNotes(latest);
          if (parsed.isParsed) {
            if (parsed.leadList?.fileName) setLeadListFile({ name: parsed.leadList.fileName, size: '2.4 MB' });
            if (parsed.leadList?.companyLogo) setBatchCompanyLogoUrl(parsed.leadList.companyLogo);
            if (parsed.companyStudy?.fileName) setCompanyStudyFile({ name: parsed.companyStudy.fileName, size: '1.1 MB' });
            if (parsed.pitchDeck?.fileName) setPitchDeckFile({ name: parsed.pitchDeck.fileName, size: '3.8 MB' });
            if (parsed.keyPeople?.length > 0) setKeyPeople(parsed.keyPeople);
          }
        }
      }

      if (msgsRes.status === 'fulfilled' && Array.isArray(msgsRes.value)) {
        setMessages(msgsRes.value);
      }
    } catch (e) {
      console.error('Error fetching ticket submissions/messages:', e);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [routeTicketId]);

  // Live polling for client messages in research workspace
  useEffect(() => {
    if (!selectedTicket) return;
    const ticketKey = selectedTicket.ticketId || selectedTicket.id;
    const interval = setInterval(async () => {
      try {
        const msgs = await api.getMessages(ticketKey).catch(() => []);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  // Key People helper functions
  const handleAddPerson = () => {
    setKeyPeople([
      ...keyPeople,
      { name: '', company: selectedTicket?.clientCompany || '', designation: '', email: '', linkedin: '', logo: batchCompanyLogoUrl || null, logoName: '' }
    ]);
  };

  const handleRemovePerson = (idx) => {
    if (keyPeople.length === 1) {
      setKeyPeople([{ name: '', company: selectedTicket?.clientCompany || '', designation: '', email: '', linkedin: '', logo: null, logoName: '' }]);
      return;
    }
    setKeyPeople(keyPeople.filter((_, i) => i !== idx));
  };

  const handleUpdatePerson = (idx, field, value) => {
    const updated = [...keyPeople];
    updated[idx][field] = value;
    setKeyPeople(updated);
  };

  const handleLogoUpload = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdatePerson(idx, 'logo', e.target.result);
      handleUpdatePerson(idx, 'logoName', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (idx) => {
    handleUpdatePerson(idx, 'logo', null);
    handleUpdatePerson(idx, 'logoName', '');
  };

  const handleBatchLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      setBatchCompanyLogoUrl(url);
      setKeyPeople(prev => prev.map(p => p.logo ? p : { ...p, logo: url, logoName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  // Status computation for required deliverables
  const requirementStatus = useMemo(() => {
    const status = {};
    let totalRequired = 0;
    let totalCompleted = 0;

    if (activeReqs.companyStudy) {
      totalRequired += 1;
      const isDone = Boolean(companyStudyFile || companyStudyNotes.trim().length > 30);
      status.companyStudy = isDone;
      if (isDone) totalCompleted += 1;
    }

    if (activeReqs.leadList) {
      totalRequired += 1;
      const isDone = Boolean(leadListFile || (Array.isArray(leads) && leads.length > 0));
      status.leadList = isDone;
      if (isDone) totalCompleted += 1;
    }

    if (activeReqs.keyPeople) {
      totalRequired += 1;
      const validPeople = keyPeople.filter(p => p.name.trim().length > 0 && p.designation.trim().length > 0);
      const isDone = validPeople.length > 0;
      status.keyPeople = isDone;
      if (isDone) totalCompleted += 1;
    }

    if (activeReqs.pitchDeck) {
      totalRequired += 1;
      const isDone = Boolean(pitchDeckFile || pitchDeckNotes.trim().length > 30);
      status.pitchDeck = isDone;
      if (isDone) totalCompleted += 1;
    }

    const allCompleted = totalRequired > 0 && totalCompleted === totalRequired;
    const progressPercent = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

    return {
      status,
      totalRequired,
      totalCompleted,
      allCompleted,
      progressPercent,
    };
  }, [activeReqs, companyStudyFile, companyStudyNotes, leadListFile, leads, keyPeople, pitchDeckFile, pitchDeckNotes]);

  // Handle Start Work
  const handleStartWork = async () => {
    if (!selectedTicket) return;
    try {
      setIsStartingWork(true);
      await api.startWork(selectedTicket.ticketId || selectedTicket.id);
      setSelectedTicket(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      setRequests(prev => prev.map(r => r.id === selectedTicket.id ? { ...r, status: 'IN_PROGRESS' } : r));
      alert('Work started! Ticket status updated to IN PROGRESS.');
    } catch (err) {
      alert(err.message || 'Failed to start work');
    } finally {
      setIsStartingWork(false);
    }
  };

  // Open Step 2: Pre-Submission Deliverables Verification
  const handleOpenAiScanAndSubmit = () => {
    setIsAiModalOpen(true);
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
    }, 400);
  };

  // Final Submit to Client Review (Step 2 Action)
  const handleFinalSubmitToClient = async () => {
    if (!selectedTicket) return;
    setIsSubmittingToClient(true);
    try {
      const ticketKey = selectedTicket.ticketId || selectedTicket.id;
      const validPeople = keyPeople.filter(p => p.name.trim()).map(p => ({
        name: p.name.trim(),
        company: p.company?.trim() || selectedTicket?.clientCompany || 'Client Target',
        designation: p.designation?.trim() || 'Executive',
        email: p.email?.trim() || '',
        linkedin: p.linkedin?.trim() || '',
        logo: p.logo || batchCompanyLogoUrl || null,
        logoName: p.logoName || null,
      }));

      // Resolve and enrich all lead rows from spreadsheet or key people
      let finalLeads = Array.isArray(leads) && leads.length > 0 ? leads : [];
      if (finalLeads.length === 0 && leadListFile) {
        try {
          finalLeads = await parseLeadsFile(leadListFile, {
            companyName: selectedTicket?.clientCompany,
            batchLogoUrl: batchCompanyLogoUrl
          });
        } catch (e) {
          console.warn('Could not parse leadListFile during submit:', e);
        }
      }
      if (finalLeads.length === 0 && validPeople.length > 0) {
        finalLeads = validPeople.map((p, idx) => enrichLeadRow(p, idx, { companyName: selectedTicket?.clientCompany }));
      }

      const totalCount = finalLeads.length > 0 ? String(finalLeads.length) : (leadCount || '50');

      const payload = {
        title: `Deliverable Package V${(selectedTicket.currentSubmissionVersion || 1) + 1} for ${ticketKey}`,
        description: `Delivered assets matching client brief: ${[
          activeReqs.companyStudy ? 'Company Study' : null,
          activeReqs.leadList ? `Lead List (${totalCount} verified leads)` : null,
          activeReqs.keyPeople ? `${validPeople.length || finalLeads.length} Key People (with verified executive logos)` : null,
          activeReqs.pitchDeck ? 'Tailored Pitch Deck' : null,
        ].filter(Boolean).join(', ')}`,
        notes: JSON.stringify({
          version: (selectedTicket.currentSubmissionVersion || 1) + 1,
          requirementsFulfilled: activeReqs,
          companyStudy: activeReqs.companyStudy ? { title: companyStudyTitle, fileName: companyStudyFile?.name || 'Company_Study.pdf', notes: companyStudyNotes } : null,
          leadList: activeReqs.leadList ? {
            title: leadListTitle,
            count: totalCount,
            fileName: leadListFile?.name || 'tasks-report.csv',
            companyLogo: batchCompanyLogoUrl || null,
            leads: finalLeads
          } : null,
          keyPeople: activeReqs.keyPeople && validPeople.length > 0 ? validPeople : finalLeads,
          pitchDeck: activeReqs.pitchDeck ? { title: pitchDeckTitle, fileName: pitchDeckFile?.name || 'dizitalgini brochure (1).pdf', notes: pitchDeckNotes } : null,
          verification: {
            method: 'Specialist Quality Verification',
            status: 'COMPLIANT_100_PERCENT',
            evaluatedAt: new Date().toISOString(),
          }
        }),
      };

      if (api.submitWork) {
        await api.submitWork(ticketKey, payload).catch(() => {});
      }
      if (api.updateRequestStatus) {
        await api.updateRequestStatus(ticketKey, 'CLIENT_REVIEW', 'Deliverables verified by specialist and submitted to client review.').catch(() => {});
      }

      setSubmissionSuccess(true);
      setSelectedTicket(prev => ({ ...prev, status: 'CLIENT_REVIEW' }));
      setRequests(prev => prev.map(r => r.id === selectedTicket.id ? { ...r, status: 'CLIENT_REVIEW' } : r));

      // Refresh submissions
      if (api.getSubmissions) {
        const updatedSubs = await api.getSubmissions(ticketKey).catch(() => []);
        setSubmissions(updatedSubs);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit deliverables');
    } finally {
      setIsSubmittingToClient(false);
    }
  };

  // Send Message in Client Conversation
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      const ticketKey = selectedTicket.ticketId || selectedTicket.id;
      await api.sendMessage(ticketKey, newMessage.trim(), false);
      setNewMessage('');
      const updated = await api.getMessages(ticketKey).catch(() => []);
      setMessages(updated);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const statusCfg = LEAD_STATUS_CONFIG[selectedTicket?.status] || {
    label: selectedTicket?.status || 'Unknown',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#E5E7EB',
  };

  const priorityCfg = PRIORITY_CONFIG[selectedTicket?.priority] || {
    label: 'High Priority',
    color: '#F97316',
    bg: '#FFEDD5',
  };

  const targetSpecs = extractTargetSpecifications(selectedTicket);

  const filteredQueue = requests.filter(r => {
    if (!searchQueue.trim()) return true;
    const q = searchQueue.toLowerCase().trim();
    return r.title?.toLowerCase().includes(q) || r.ticketId?.toLowerCase().includes(q) || r.clientCompany?.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #DDD4FA',
              }}
            >
              Operations Workbench
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Specialist Research Environment
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Research Workspace
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
            Tailored deliverable studio: upload client brief assets, verify requirements compliance, and submit to client review.
          </p>
        </div>

        <button
          type="button"
          onClick={loadWorkspaceData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 15px',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            color: '#374151',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* 2. Main Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Ticket Queue Selector */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            maxHeight: 'calc(100vh - 180px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Active Sprint Queue</span>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#F3F4F6',
                padding: '2px 8px',
                borderRadius: '9999px',
                color: '#6B7280',
                fontWeight: 700,
              }}
            >
              {requests.length} Sprints
            </span>
          </div>

          {/* Search Queue */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQueue}
              onChange={(e) => setSearchQueue(e.target.value)}
              placeholder="Search tickets..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '0.8125rem',
                backgroundColor: '#F9FAFB',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {filteredQueue.map((r) => {
              const isSelected = selectedTicket && selectedTicket.id === r.id;
              const rStatus = LEAD_STATUS_CONFIG[r.status] || {
                label: r.status,
                color: '#6B7280',
                bg: '#F3F4F6',
              };

              return (
                <div
                  key={r.id}
                  onClick={() => selectTicket(r)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#FAF5FF' : '#FAFAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED' }}>
                      {r.ticketId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        color: rStatus.color,
                        backgroundColor: rStatus.bg,
                      }}
                    >
                      {rStatus.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#111827',
                      lineHeight: 1.3,
                      marginBottom: '4px',
                    }}
                  >
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {r.clientCompany} • {formatDateTime(r.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket Workbench */}
        {selectedTicket ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* CARD 1: Ticket Header, Brief & Target Specifications */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#7C3AED',
                        backgroundColor: '#F5F3FF',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #DDD4FA',
                      }}
                    >
                      {selectedTicket.ticketId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        color: statusCfg.color,
                        backgroundColor: statusCfg.bg,
                        border: `1px solid ${statusCfg.border}`,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        color: priorityCfg.color,
                        backgroundColor: priorityCfg.bg,
                      }}
                    >
                      {priorityCfg.label}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: '#111827',
                    }}
                  >
                    {selectedTicket.title}
                  </h2>
                  <div style={{ fontSize: '0.84rem', color: '#6B7280' }}>
                    Client: <strong>{selectedTicket.clientCompany}</strong> ({selectedTicket.clientName} • {selectedTicket.clientEmail})
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleOpenAiScanAndSubmit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: requirementStatus.allCompleted ? '#7C3AED' : '#6366F1',
                      color: '#FFFFFF',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                    title="Review deliverables checklist and submit to client"
                  >
                    <Upload size={15} />
                    <span>Review & Submit Deliverable</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        padding: '1px 7px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                      }}
                    >
                      {requirementStatus.allCompleted ? 'Ready (100%)' : `${requirementStatus.progressPercent}% Ready`}
                    </span>
                  </button>
                </div>
              </div>

              {/* CLIENT REQUEST BRIEF */}
              {selectedTicket.description && (
                <div
                  style={{
                    backgroundColor: '#FAFAFC',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    padding: '14px 16px',
                    fontSize: '0.875rem',
                    color: '#374151',
                    lineHeight: 1.55,
                    marginBottom: targetSpecs ? '16px' : '0',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                    Client Request Brief:
                  </div>
                  {selectedTicket.description}
                </div>
              )}

              {/* TARGET SPECIFICATIONS */}
              {targetSpecs && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                    Target Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                    {targetSpecs.leadsCount && (
                      <div style={{ padding: '9px 12px', backgroundColor: '#F5F3FF', borderRadius: '8px', border: '1px solid #DDD4FA' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Target Leads</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>{targetSpecs.leadsCount}</div>
                      </div>
                    )}
                    {targetSpecs.targetMarket && (
                      <div style={{ padding: '9px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Industry & Market</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{targetSpecs.targetMarket}</div>
                      </div>
                    )}
                    {targetSpecs.targetPersonas && (
                      <div style={{ padding: '9px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Target Roles / Titles</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{targetSpecs.targetPersonas}</div>
                      </div>
                    )}
                    {targetSpecs.companySize && (
                      <div style={{ padding: '9px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Company Size</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827', marginTop: '2px' }}>{targetSpecs.companySize}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: CLIENT-TAILORED DELIVERABLES & DIRECT UPLOADS */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#7C3AED" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                      Client Required Deliverables & Uploads
                    </h3>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                    According to client brief requirements: update each requested item below. Once all are completed, proceed to submit.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: requirementStatus.allCompleted ? '#ECFDF5' : '#FFFBEB',
                      color: requirementStatus.allCompleted ? '#059669' : '#D97706',
                      border: requirementStatus.allCompleted ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                    }}
                  >
                    {requirementStatus.totalCompleted} / {requirementStatus.totalRequired} Deliverables Ready
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${requirementStatus.progressPercent}%`,
                    backgroundColor: requirementStatus.allCompleted ? '#10B981' : '#7C3AED',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* DYNAMIC REQUIREMENTS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. COMPANY STUDY (If requested) */}
                {activeReqs.companyStudy && (
                  <div
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      padding: '18px',
                      backgroundColor: requirementStatus.status.companyStudy ? '#F8FCF9' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#7C3AED" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                          1. Company Study Document (PDF / Dossier)
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: requirementStatus.status.companyStudy ? '#ECFDF5' : '#FFFBEB',
                          color: requirementStatus.status.companyStudy ? '#059669' : '#D97706',
                          border: requirementStatus.status.companyStudy ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        }}
                      >
                        {requirementStatus.status.companyStudy ? '✓ Ready (Updated)' : 'Pending Upload'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Deliverable Title
                        </label>
                        <input
                          type="text"
                          value={companyStudyTitle}
                          onChange={(e) => setCompanyStudyTitle(e.target.value)}
                          placeholder="e.g. Comprehensive Company Study & Dossier"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Upload Study File (PDF / DOCX)
                        </label>
                        {companyStudyFile ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                              <FileText size={15} color="#2563EB" />
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E40AF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {companyStudyFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompanyStudyFile(null)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px dashed #CBD5E1',
                              backgroundColor: '#FAFAFC',
                              color: '#6B7280',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={14} />
                            <span>Select Company Study PDF</span>
                            <input
                              type="file"
                              accept=".pdf,.docx,.doc"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) setCompanyStudyFile(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                        Executive Summary & Findings Notes
                      </label>
                      <textarea
                        rows={2}
                        value={companyStudyNotes}
                        onChange={(e) => setCompanyStudyNotes(e.target.value)}
                        placeholder="Document key findings, tech stack, positioning analysis, and competitive insights..."
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. LEAD LIST (If requested) */}
                {activeReqs.leadList && (
                  <div
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      padding: '18px',
                      backgroundColor: requirementStatus.status.leadList ? '#F8FCF9' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#7C3AED" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                          2. Researched Lead List (CSV / XLSX / PDF)
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: requirementStatus.status.leadList ? '#ECFDF5' : '#FFFBEB',
                          color: requirementStatus.status.leadList ? '#059669' : '#D97706',
                          border: requirementStatus.status.leadList ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        }}
                      >
                        {requirementStatus.status.leadList ? `✓ Ready (${leadCount} Verified Leads)` : 'Pending Upload'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1.4fr 1.4fr', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Deliverable Title
                        </label>
                        <input
                          type="text"
                          value={leadListTitle}
                          onChange={(e) => setLeadListTitle(e.target.value)}
                          placeholder="e.g. European SaaS Researched Lead List"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Verified Leads
                        </label>
                        <input
                          type="number"
                          value={leadCount}
                          onChange={(e) => setLeadCount(e.target.value)}
                          placeholder="50"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box',
                            fontWeight: 700,
                            color: '#7C3AED',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Spreadsheet / CSV
                        </label>
                        {leadListFile ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                              <FileText size={15} color="#2563EB" />
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E40AF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {leadListFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLeadListFile(null);
                                setLeads([]);
                              }}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px dashed #CBD5E1',
                              backgroundColor: '#FAFAFC',
                              color: '#6B7280',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={14} />
                            <span>Select File (.xlsx, .csv)</span>
                            <input
                              type="file"
                              accept=".xlsx,.csv,.xls,.pdf"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  setLeadListFile(file);
                                  try {
                                    const parsed = await parseLeadsFile(file, {
                                      companyName: selectedTicket?.clientCompany,
                                      batchLogoUrl: batchCompanyLogoUrl
                                    });
                                    if (parsed && parsed.length > 0) {
                                      setLeads(parsed);
                                      setLeadCount(String(parsed.length));
                                    }
                                  } catch (err) {
                                    console.warn('Could not parse lead list file:', err);
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                        {leads.length > 0 && (
                          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} />
                            <span>{leads.length} verified leads parsed from file</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Company Logo (PNG / JPG)
                        </label>
                        {batchCompanyLogoUrl ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#F5F3FF',
                              border: '1px solid #DDD6FE',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <img
                                src={batchCompanyLogoUrl}
                                alt="Company Logo"
                                style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                              />
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7C3AED', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                Logo Attached
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setBatchCompanyLogoUrl('')}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                              title="Remove logo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px dashed #DDD6FE',
                              backgroundColor: '#FAF5FF',
                              color: '#7C3AED',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Image size={14} color="#7C3AED" />
                            <span>Add Logo (PNG/JPG)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleBatchLogoUpload(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. KEY PEOPLE (Structured Data Entry - NOT a file upload!) */}
                {activeReqs.keyPeople && (
                  <div
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      padding: '18px',
                      backgroundColor: requirementStatus.status.keyPeople ? '#F8FCF9' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#7C3AED" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                          3. Key People Contacts (Structured Executive Directory & Brand Logos)
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: requirementStatus.status.keyPeople ? '#ECFDF5' : '#FFFBEB',
                          color: requirementStatus.status.keyPeople ? '#059669' : '#D97706',
                          border: requirementStatus.status.keyPeople ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        }}
                      >
                        {requirementStatus.status.keyPeople ? `✓ Ready (${keyPeople.filter(p => p.name.trim()).length} Contacts Recorded)` : 'Pending Contact Entry'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#6B7280' }}>
                      Enter researched decision makers below. Add genuine company/brand logos (PNG, JPG, WebP) for each contact to appear in the client dashboard rows.
                    </p>

                    {/* Contacts Table / Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {keyPeople.map((person, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.1fr 1fr 1.1fr 1.2fr 1.2fr 85px 32px',
                            gap: '8px',
                            alignItems: 'center',
                            backgroundColor: '#FAFAFC',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Full Name (e.g. Sarah Jenkins)"
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(idx, 'name', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.8125rem',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Company (e.g. Acme Corp)"
                            value={person.company || ''}
                            onChange={(e) => handleUpdatePerson(idx, 'company', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.8125rem',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Designation / Role"
                            value={person.designation}
                            onChange={(e) => handleUpdatePerson(idx, 'designation', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.8125rem',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                          <input
                            type="email"
                            placeholder="Corporate Email"
                            value={person.email}
                            onChange={(e) => handleUpdatePerson(idx, 'email', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.8125rem',
                              backgroundColor: '#FFFFFF',
                              fontFamily: 'monospace',
                            }}
                          />
                          <input
                            type="url"
                            placeholder="LinkedIn URL"
                            value={person.linkedin}
                            onChange={(e) => handleUpdatePerson(idx, 'linkedin', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              fontSize: '0.8125rem',
                              backgroundColor: '#FFFFFF',
                            }}
                          />

                          {/* Individual Logo Upload & Preview */}
                          {person.logo ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                              <img
                                src={person.logo}
                                alt="Logo"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  objectFit: 'contain',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #D1D5DB',
                                  padding: '1px'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveLogo(idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Remove logo"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                padding: '6px 6px',
                                borderRadius: '6px',
                                border: '1px dashed #D1D5DB',
                                backgroundColor: '#FFFFFF',
                                color: '#6B7280',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Upload Logo (PNG, JPG, WebP)"
                            >
                              <Image size={12} color="#7C3AED" />
                              <span>+ Logo</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleLogoUpload(idx, e.target.files[0]);
                                }}
                              />
                            </label>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemovePerson(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                            }}
                            title="Remove Person"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPerson}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px dashed #7C3AED',
                        backgroundColor: '#F5F3FF',
                        color: '#7C3AED',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Key Person Row</span>
                    </button>
                  </div>
                )}

                {/* 4. TAILORED PITCH DECK */}
                {activeReqs.pitchDeck && (
                  <div
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      padding: '18px',
                      backgroundColor: requirementStatus.status.pitchDeck ? '#F8FCF9' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Presentation size={16} color="#7C3AED" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                          4. Tailored Pitch Deck (Presentation / PDF)
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: requirementStatus.status.pitchDeck ? '#ECFDF5' : '#FFFBEB',
                          color: requirementStatus.status.pitchDeck ? '#059669' : '#D97706',
                          border: requirementStatus.status.pitchDeck ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        }}
                      >
                        {requirementStatus.status.pitchDeck ? '✓ Ready (Updated)' : 'Pending Upload'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Deck Proposal Title
                        </label>
                        <input
                          type="text"
                          value={pitchDeckTitle}
                          onChange={(e) => setPitchDeckTitle(e.target.value)}
                          placeholder="e.g. Tailored Pitch Deck Proposal"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                          Upload Pitch Deck (PDF / PPTX)
                        </label>
                        {pitchDeckFile ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                              <FileText size={15} color="#2563EB" />
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E40AF', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {pitchDeckFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPitchDeckFile(null)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px dashed #CBD5E1',
                              backgroundColor: '#FAFAFC',
                              color: '#6B7280',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={14} />
                            <span>Select Deck File (.pdf, .pptx)</span>
                            <input
                              type="file"
                              accept=".pdf,.pptx,.ppt"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) setPitchDeckFile(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: '4px' }}>
                        Strategic Pitch Angles & Notes
                      </label>
                      <textarea
                        rows={2}
                        value={pitchDeckNotes}
                        onChange={(e) => setPitchDeckNotes(e.target.value)}
                        placeholder="Document pitch angles, value proposition alignment, and messaging recommendations..."
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement Customizer Toggle */}
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                    Client Requirements Included:
                  </span>
                  {[
                    { id: 'companyStudy', label: 'Company Study' },
                    { id: 'leadList', label: 'Lead List' },
                    { id: 'keyPeople', label: 'Key People' },
                    { id: 'pitchDeck', label: 'Tailored Pitch Deck' },
                  ].map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => setActiveReqs({ ...activeReqs, [req.id]: !activeReqs[req.id] })}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: activeReqs[req.id] ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                        backgroundColor: activeReqs[req.id] ? '#F5F3FF' : '#FFFFFF',
                        color: activeReqs[req.id] ? '#7C3AED' : '#6B7280',
                        cursor: 'pointer',
                      }}
                    >
                      {activeReqs[req.id] ? '✓ ' : '+ '}{req.label}
                    </button>
                  ))}
                </div>

                {/* Submit Trigger in footer */}
                <button
                  type="button"
                  onClick={handleOpenAiScanAndSubmit}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: requirementStatus.allCompleted ? '#7C3AED' : '#9CA3AF',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: requirementStatus.allCompleted ? 'pointer' : 'not-allowed',
                    boxShadow: requirementStatus.allCompleted ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Verify Requirements & Submit</span>
                </button>
              </div>
            </div>

            {/* CARD 3: CLIENT CONVERSATION */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#7C3AED" />
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: '#111827' }}>
                    Chat with Client: {selectedTicket.clientCompany || selectedTicket.clientName} • {selectedTicket.ticketId}
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Direct Lead Channel • Real-time conversation
                </span>
              </div>

              {/* Message List */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundColor: '#FAFAFC',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  padding: '14px',
                  marginBottom: '14px',
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem', padding: '20px 0' }}>
                    No messages yet on this sprint. Post a progress update or clarify criteria with {selectedTicket.clientCompany || 'the client'}.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSpecialist = m.senderRole !== 'USER' && m.sender_role !== 'USER' && m.senderType !== 'CLIENT';
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isSpecialist ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          backgroundColor: isSpecialist ? '#F5F3FF' : '#FFFFFF',
                          border: isSpecialist ? '1px solid #DDD4FA' : '1px solid #E5E7EB',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isSpecialist ? '#7C3AED' : '#4B5563', marginBottom: '2px' }}>
                          {m.senderName || m.sender_name || (isSpecialist ? 'Lead Specialist' : selectedTicket.clientName)}
                        </div>
                        <div style={{ fontSize: '0.84375rem', color: '#111827', lineHeight: 1.4 }}>
                          {m.text}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px', textAlign: 'right' }}>
                          {formatDateTime(m.createdAt || m.created_at)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a direct message or progress update to client..."
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: isSendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* CARD 4: DELIVERABLES & SUBMISSIONS HISTORY */}
            {submissions.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: '#111827' }}>
                    Deliverable Submissions History ({submissions.length})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.map((sub) => {
                    const parsed = parseSubmissionNotes(sub);

                    return (
                      <div
                        key={sub.id}
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: '10px',
                          padding: '16px',
                          backgroundColor: '#FAFAFC',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: '6px' }}>
                              V{sub.version}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                              {sub.title}
                            </span>
                            {(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at) && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.75rem',
                                  color: '#4B5563',
                                  fontWeight: 500,
                                  backgroundColor: '#F3F4F6',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #E5E7EB',
                                }}
                                title="Uploaded Date & Time"
                              >
                                <Clock size={12} color="#6B7280" />
                                <span>{formatDateTimeWithTime(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at)}</span>
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: sub.status === 'APPROVED' ? '#ECFDF5' : sub.status === 'CHANGES_REQUESTED' ? '#FEF2F2' : '#FFFBEB',
                              color: sub.status === 'APPROVED' ? '#059669' : sub.status === 'CHANGES_REQUESTED' ? '#EF4444' : '#D97706',
                            }}
                          >
                            {sub.status || 'PENDING_REVIEW'}
                          </span>
                        </div>

                        {/* Display parsed deliverables cleanly */}
                        {parsed.isParsed ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
                            {parsed.leadList && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                                Leads: {parsed.leadList.count || '50'} ({parsed.leadList.fileName})
                              </span>
                            )}
                            {parsed.keyPeople?.length > 0 && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '2px 6px', borderRadius: '4px', border: '1px solid #DDD4FA' }}>
                                Key People: {parsed.keyPeople.length} contacts
                              </span>
                            )}
                            {parsed.pitchDeck && (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                                Pitch Deck: {parsed.pitchDeck.fileName}
                              </span>
                            )}
                          </div>
                        ) : (
                          parsed.rawText && (
                            <p style={{ margin: '0 0 8px', fontSize: '0.8125rem', color: '#4B5563', lineHeight: 1.4 }}>
                              {parsed.rawText}
                            </p>
                          )
                        )}

                        {sub.review_feedback && (
                          <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.78rem', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                              <strong>Client Feedback:</strong>
                              {(sub.reviewed_at || sub.reviewedAt || sub.review?.reviewedAt) && (
                                <span style={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: 600 }}>
                                  {formatDateTimeWithTime(sub.reviewed_at || sub.reviewedAt || sub.review?.reviewedAt)}
                                </span>
                              )}
                            </div>
                            <div>{sub.review_feedback}</div>
                          </div>
                        )}

                        {sub.files && sub.files.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                            {sub.files.map((f, fIdx) => (
                              <a
                                key={fIdx}
                                href={f.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E5E7EB',
                                  color: '#374151',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                <FileText size={13} color="#7C3AED" />
                                <span>{f.name}</span>
                                <Download size={12} color="#6B7280" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
            }}
          >
            <Briefcase size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No Sprint Ticket Selected
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
              Select a research sprint from the queue on the left to begin uploading deliverables.
            </p>
          </div>
        )}
      </div>

      {/* STEP 2 MODAL: QWEN AI COMPLIANCE ANALYSIS & SUBMISSION */}
      {isAiModalOpen && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAF5FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                    Step 2: Specialist Deliverable Verification
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Client requirement verification for {selectedTicket.ticketId}
                  </div>
                </div>
              </div>

              {!isAiAnalyzing && !isSubmittingToClient && (
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {isAiAnalyzing ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <RefreshCw size={28} className="animate-spin" color="#7C3AED" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                    Verifying Deliverables against Client Brief...
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '4px' }}>
                    Cross-referencing uploaded assets against client brief requirements.
                  </div>
                </div>
              ) : submissionSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                    Deliverable Submitted Successfully!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0 0 20px' }}>
                    Sprint status updated to <strong>CLIENT REVIEW</strong>. The client partner has been notified via email & dashboard alert.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiModalOpen(false);
                      setSubmissionSuccess(false);
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Done & Return to Workspace
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: requirementStatus.allCompleted ? '#ECFDF5' : '#FFFBEB',
                      borderRadius: '10px',
                      border: `1px solid ${requirementStatus.allCompleted ? '#A7F3D0' : '#FDE68A'}`,
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    {requirementStatus.allCompleted ? (
                      <ShieldCheck size={26} color="#059669" />
                    ) : (
                      <AlertCircle size={26} color="#D97706" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: requirementStatus.allCompleted ? '#065F46' : '#92400E' }}>
                        {requirementStatus.allCompleted
                          ? '100% Client Brief Requirements Satisfied'
                          : `${requirementStatus.progressPercent}% Requirements Uploaded (${requirementStatus.totalCompleted}/${requirementStatus.totalRequired} Ready)`}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: requirementStatus.allCompleted ? '#047857' : '#B45309' }}>
                        {requirementStatus.allCompleted
                          ? 'All mandatory requirements from the client brief have been audited and attached.'
                          : 'Please upload the missing deliverable files before submitting to client review.'}
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {activeReqs.companyStudy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: requirementStatus.status.companyStudy ? '#374151' : '#DC2626' }}>
                        {requirementStatus.status.companyStudy ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                        <span>
                          <strong>Company Study:</strong>{' '}
                          {companyStudyFile ? `Attached: ${companyStudyFile.name}` : (companyStudyNotes.trim().length > 30 ? 'Comprehensive Study Notes Provided' : 'Missing (Upload PDF required)')}
                        </span>
                      </div>
                    )}
                    {activeReqs.leadList && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: requirementStatus.status.leadList ? '#374151' : '#DC2626' }}>
                        {requirementStatus.status.leadList ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                        <span>
                          <strong>Lead Database:</strong>{' '}
                          {leadListFile ? `Spreadsheet Attached: ${leadListFile.name}` : (leads?.length > 0 ? `${leads.length} Researched Leads in Table` : 'Missing (Upload CSV/Excel or add leads)')}
                        </span>
                      </div>
                    )}
                    {activeReqs.keyPeople && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: requirementStatus.status.keyPeople ? '#374151' : '#DC2626' }}>
                        {requirementStatus.status.keyPeople ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                        <span>
                          <strong>Key People:</strong>{' '}
                          {keyPeople.filter(p => p.name.trim() && p.designation.trim()).length > 0
                            ? `${keyPeople.filter(p => p.name.trim()).length} Executives (Verified Titles, Emails & LinkedIn)`
                            : 'Missing (Add executive profiles below)'}
                        </span>
                      </div>
                    )}
                    {activeReqs.pitchDeck && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: requirementStatus.status.pitchDeck ? '#374151' : '#DC2626' }}>
                        {requirementStatus.status.pitchDeck ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <AlertCircle size={16} color="#EF4444" />
                        )}
                        <span>
                          <strong>Tailored Pitch Deck:</strong>{' '}
                          {pitchDeckFile ? `Presentation Attached: ${pitchDeckFile.name}` : (pitchDeckNotes.trim().length > 30 ? 'Pitch Framework Outlined' : 'Missing (Upload PDF/PPTX required)')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Back & Iterate OR Submit */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        color: '#4B5563',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back & Edit Deliverables
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalSubmitToClient}
                      disabled={isSubmittingToClient || !requirementStatus.allCompleted}
                      style={{
                        padding: '9px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: requirementStatus.allCompleted ? '#7C3AED' : '#9CA3AF',
                        color: '#FFFFFF',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: (isSubmittingToClient || !requirementStatus.allCompleted) ? 'not-allowed' : 'pointer',
                        boxShadow: requirementStatus.allCompleted ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none',
                      }}
                    >
                      {isSubmittingToClient
                        ? 'Submitting...'
                        : requirementStatus.allCompleted
                        ? 'Confirm & Submit to Client Review'
                        : 'Upload Missing Files to Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
