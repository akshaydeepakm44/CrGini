import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BRAND_LOGO, BRAND_LOGO_STACKED, BRAND_NAME } from '../../assets/branding';
import {
  Building2,
  Users,
  FileText,
  Presentation,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Target,
  Download,
  Eye,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  Globe,
  X,
  Lightbulb,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Send,
  Minus,
  Maximize2,
  Minimize2,
  Paperclip,
  Link2,
  Smile,
  Image as ImageIcon,
  Trash2,
  MoreVertical,
  PenTool,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { getFallbackShowcase, FALLBACK_SHOWCASES } from './fallbackShowcaseData';
import './publicSample.css';

/**
 * Ensures phone number masks strictly display with 'xxxxx' and no bullets
 */
function formatMaskedPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '+1 (xxx) xxx-xxxx';
  return rawPhone.replace(/[•·*]/g, 'x');
}

/**
 * Shortens a URL for clean, uncluttered display
 * (e.g. "https://www.linkedin.com/company/meridian-analytics/" -> "linkedin.com/company/meridian...")
 */
function shortenUrl(rawUrl, maxLength = 26) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    let clean = rawUrl.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (clean.length > maxLength) {
      return clean.substring(0, maxLength) + '...';
    }
    return clean;
  } catch {
    return rawUrl;
  }
}

/**
 * Smart Industry / Sector parser
 * Splits commas, semicolons, newlines, bullets, or pipes into clean individual labels for mini-cards.
 */
function parseIndustries(rawInd) {
  if (!rawInd || typeof rawInd !== 'string') {
    return ['Enterprise Technology & Services'];
  }
  const trimmed = rawInd.trim();
  if (!trimmed) return ['Enterprise Technology & Services'];

  // Protect parenthetical terms like (Legal, Finance, Marketing)
  const protectedParen = [];
  const tokenized = trimmed.replace(/\([^\)]*\)/g, (match) => {
    protectedParen.push(match);
    return `___PAREN_${protectedParen.length - 1}___`;
  });

  // Common sector nouns after which a new capitalized sector often begins when pasted without commas
  const boundary = /(?<=(?:Startups|Services|Finance|Providers|WealthTech|InsurTech|FinTech|HealthTech|BioTech|EdTech|PropTech|AgTech|Credit|Lending|Banking|Software|Management|Consulting|Solutions|Logistics|Insurance|Capital|Healthcare|Biotech|E-commerce|Systems|Platform|Analytics|Trading|Mining|Exploration|Brands|Agency))\s+(?=[A-Z])/g;

  // Split on all standard delimiters: commas, semicolons, newlines, pipes, bullets, tabs, multiple spaces, and slashes
  let rawChunks = tokenized
    .split(/(?:[\r\n;,•·|]+|\t+|\s{2,}|\s*\/\s*)/)
    .map((s) => s.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim())
    .filter(Boolean);

  let sectors = [];
  for (const chunk of rawChunks) {
    if (boundary.test(chunk)) {
      const sub = chunk.split(boundary).map((s) => s.trim()).filter(Boolean);
      sectors.push(...sub);
    } else {
      sectors.push(chunk);
    }
  }

  // Restore protected parentheses and cleanup
  sectors = sectors.map((item) => {
    let restored = item.replace(/___PAREN_(\d+)___/g, (_, idx) => protectedParen[Number(idx)] || '').trim();
    return restored.replace(/^[,;.\s/]+|[,;.\s/]+$/g, '').trim();
  }).filter((s) => s.length > 1);

  return sectors.length > 0 ? sectors : [trimmed];
}

/**
 * Extracts a concise headline from text if custom headline is not explicitly provided
 */
function getCardHeadline(customTitle, text, fallback) {
  if (customTitle && typeof customTitle === 'string' && customTitle.trim()) {
    return customTitle.trim();
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return fallback;
  }
  const firstSentence = text.split(/[.\n]/)[0].trim();
  if (firstSentence && firstSentence.length >= 15 && firstSentence.length <= 75) {
    return firstSentence;
  }
  return fallback;
}

/**
 * Resolves clean presentation data for a lead without ever polluting or defaulting
 * to the client's company name (the organization for whom the showcase is created).
 */
function resolveLeadPresentation(lead, clientCompanyName = '') {
  if (!lead) {
    return {
      leadCompany: '',
      leadPersonName: '',
      role: '',
      subtitle: '',
    };
  }

  let leadCompany = (lead.company || lead.leadCompany || lead.targetCompany || '').trim();
  let leadPersonName = (lead.name || '').trim();
  const role = (lead.title || '').trim();

  // If leadCompany was not explicitly set, extract domain from lead company link
  if (!leadCompany && lead.companyLink) {
    try {
      const host = lead.companyLink.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
      if (host && host.length >= 2) {
        leadCompany = host.charAt(0).toUpperCase() + host.slice(1);
      }
    } catch (_) {}
  }

  const isSame = leadCompany && leadPersonName && leadCompany.toLowerCase() === leadPersonName.toLowerCase();

  // If person name was mistakenly saved as company name, do not treat company as person
  const effectivePersonName = (!isSame && leadPersonName) ? leadPersonName : (leadPersonName || '');

  const finalCompany = leadCompany || (isSame ? leadPersonName : (clientCompanyName || 'Target Enterprise'));

  // Blue Subtitle structure: e.g. "Field IT Engineer · Jeffery Fenn" or "Chief Operating Officer · Cristina Cordova"
  let subtitle = '';
  if (role && effectivePersonName) {
    subtitle = `${role} · ${effectivePersonName}`;
  } else if (effectivePersonName) {
    subtitle = effectivePersonName;
  } else if (role) {
    subtitle = role;
  } else {
    subtitle = 'Verified Decision Maker';
  }

  return {
    leadCompany: finalCompany,
    leadPersonName: effectivePersonName,
    role: role || (effectivePersonName ? 'Executive Decision Maker' : ''),
    subtitle,
  };
}

/**
 * Trims excess card content to ensure strictly balanced visual density across cards.
 * Removes trailing lists, numbers, and cuts cleanly at sentence/word boundary with ellipsis.
 */
function trimCardText(text, maxChars = 180, fallback = '') {
  if (!text || typeof text !== 'string') return fallback;
  let clean = text.trim();
  if (!clean || clean.toLowerCase().includes('not provided') || clean.toLowerCase().includes('currently not provided')) {
    return fallback;
  }

  // Remove any trailing list formatting (e.g. "1. Hugging Face 2. Weights..." or "\n1. ...")
  clean = clean.replace(/(?:\r?\n|\s+)(?:#?\d+[\.\)]|\bCompetitors?:|\bKey players?:).*$/is, '').trim();

  if (clean.length > maxChars) {
    const periodIdx = clean.indexOf('.', maxChars - 40);
    if (periodIdx !== -1 && periodIdx <= maxChars + 15) {
      return clean.slice(0, periodIdx + 1).trim();
    }
    const truncated = clean.slice(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxChars - 30) {
      return truncated.slice(0, lastSpace).trim() + '...';
    }
    return truncated.trim() + '...';
  }

  return clean;
}

/**
 * Smart Key Opportunities Parser
 * Extracts strictly up to 3 clean, concise points without breaking inside hyphenated words.
 * Trims excess text from each point to ensure strictly equal card heights.
 */
function parseKeyOpportunities(rawText, companyName = '') {
  const fallbackPoints = [
    'Accelerate enterprise workflow evaluation and validation',
    'Target senior technical and operational decision-makers',
    'Demonstrate measurable integration impact and platform ROI',
  ];

  if (!rawText || typeof rawText !== 'string' || !rawText.trim() || rawText.toLowerCase().includes('not provided')) {
    return fallbackPoints;
  }

  let points = [];
  const trimmed = rawText.trim();
  const numberedPattern = /(?:^|\s+)(?:#?\d+[\.\)]|\(\d+\))\s*|(?<=[a-zA-Z\.\)])(?=\d+[\.\)])/i;

  if (numberedPattern.test(trimmed)) {
    points = trimmed
      .split(/(?:^|\s+)(?:#?\d+[\.\)]|\(\d+\))\s*|(?<=[a-zA-Z\.\)])(?=\d+[\.\)])/i)
      .map((p) => p.replace(/^(?:#?\d+[\.\)]|[•▪\-])\s*/, '').trim())
      .filter((p) => p.length > 5);
  } else if (trimmed.includes('\n')) {
    points = trimmed
      .split(/\r?\n+/)
      .map((p) => p.replace(/^(?:#?\d+[\.\)]|[•▪\-])\s*/, '').trim())
      .filter((p) => p.length > 5);
  } else if (trimmed.includes(';')) {
    points = trimmed
      .split(/;\s*/)
      .map((p) => p.replace(/^(?:#?\d+[\.\)]|[•▪\-])\s*/, '').trim())
      .filter((p) => p.length > 5);
  } else if (trimmed.includes('.')) {
    points = trimmed
      .split(/\.\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 8);
  }

  if (points.length === 0) {
    points = [trimmed];
  }

  // Strictly mention up to 3 points and clean each point to max 65 chars
  let finalPoints = points.slice(0, 3).map((pt) => {
    let clean = pt.replace(/^[•▪\-\d\.\)]+\s*/, '').trim();
    if (clean.length > 68) {
      const cut = clean.slice(0, 65);
      const lastSpace = cut.lastIndexOf(' ');
      clean = (lastSpace > 45 ? cut.slice(0, lastSpace) : cut).trim() + '...';
    }
    return clean;
  });

  // Pad to 3 points if fewer exist so all cards maintain identical density
  if (finalPoints.length < 3) {
    for (const fb of fallbackPoints) {
      if (finalPoints.length >= 3) break;
      if (!finalPoints.some((p) => p.toLowerCase().includes(fb.slice(0, 10).toLowerCase()))) {
        finalPoints.push(fb);
      }
    }
  }

  return finalPoints.slice(0, 3);
}

export default function PublicSampleDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [pdfPreviewModal, setPdfPreviewModal] = useState(null);

  // Smooth scroll handler to contact/feedback section
  const scrollToNextSteps = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const el = document.getElementById('contact-feedback') || document.getElementById('prospect-feedback');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Dynamic slug: defaults to 'data-i2i' if none specified in route
  const effectiveSlug = slug ? slug.trim().toLowerCase() : 'data-i2i';

  const [availableShowcases, setAvailableShowcases] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const fetchShowcase = async () => {
      try {
        const data = await api.getPublicSample(effectiveSlug);
        if (!isMounted) return;
        if (data?.sample) {
          setSample(data.sample);
          return;
        }
      } catch (err) {
        console.warn(`[PublicSampleDashboard] Fetch failed for '${effectiveSlug}':`, err.message);
        if (err.response?.data?.availableShowcases) {
          setAvailableShowcases(err.response.data.availableShowcases);
        }
      }

      // Step 2: If requested slug was non-default, try loading flagship 'data-i2i' via API
      if (effectiveSlug !== 'data-i2i') {
        try {
          const fallbackData = await api.getPublicSample('data-i2i');
          if (!isMounted) return;
          if (fallbackData?.sample) {
            setSample(fallbackData.sample);
            return;
          }
        } catch (_) {}
      }

      // Step 3: Resilient offline & cold-start static fallback
      if (!isMounted) return;
      const staticShowcase = getFallbackShowcase(effectiveSlug);
      if (staticShowcase) {
        setSample(staticShowcase);
      } else {
        setError('Sample intelligence showcase not found or is not currently published.');
      }
    };

    fetchShowcase().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [effectiveSlug]);

  // Ensure body background is light and no horizontal scroll occurs on this page
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.backgroundColor = '#F8FAFC';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

  // Dynamic Prospect Extraction
  const companyName = sample?.companyName || sample?.companyStudy?.company || 'Target Organization';
  const companyStudy = sample?.companyStudy || {};
  const industrySectors = useMemo(() => parseIndustries(companyStudy.industry), [companyStudy.industry]);
  const pitchDeck = sample?.pitchDeck || null;

  // Compose Card State (Gmail-style compose window for Interested / Not Interested feedback)
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMinimized, setComposerMinimized] = useState(false);
  const [composerMaximized, setComposerMaximized] = useState(false);
  const [composerType, setComposerType] = useState('interested'); // 'interested' | 'not_interested'
  const [composerTo, setComposerTo] = useState('team@dizigini.com');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [composerSending, setComposerSending] = useState(false);
  const [composerSent, setComposerSent] = useState(false);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);

  const openMailComposer = (type) => {
    const targetComp = companyName || 'LimitlessAI';
    setComposerType(type);
    setComposerOpen(true);
    setComposerMinimized(false);
    setComposerSent(false);
    setComposerSending(false);
    setSendMenuOpen(false);
    setComposerTo('team@dizigini.com');

    if (type === 'interested') {
      setComposerSubject(`Note to the team - Interested in ${targetComp}`);
      setComposerBody(
`Hi DiziGini Team,

I’m interested in proceeding further with the ${targetComp} report and would like to know the next steps.

My Contact Details

- Name: 
- Email: 
- Contact Number: 
- Company: ${targetComp}

Please contact me to discuss the services and next steps.

Thank you.`
      );
    } else {
      setComposerSubject(`Note to the team - ${targetComp}`);
      setComposerBody(
`Hi DiziGini Team,

Thank you for reaching out and sharing the ${targetComp} report. We appreciate your time and the information you provided.

At the moment, we are not looking for it now, but we will keep your details in mind for the future.

Thank you for understanding.

Best regards,
[Your Name]
[Company Name]
[Contact Details]`
      );
    }
  };

  const handleSendMail = (targetService = 'gmail') => {
    if (composerSending) return;
    setComposerSending(true);
    setSendMenuOpen(false);

    try {
      // 1. Submit to backend inquiry endpoint in the background
      let extractedName = '';
      let extractedEmail = '';
      const lines = composerBody.split('\n');
      for (const line of lines) {
        if (/^-\s*name\s*:/i.test(line)) {
          extractedName = line.replace(/^-\s*name\s*:/i, '').trim();
        } else if (/^-\s*email\s*:/i.test(line)) {
          extractedEmail = line.replace(/^-\s*email\s*:/i, '').trim();
        }
      }

      fetch(`/api/samples/${sample?.slug || effectiveSlug || 'general'}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: extractedName || 'Prospect Visitor',
          email: extractedEmail || (extractedName ? `${extractedName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'feedback@prospect.com'),
          message: composerBody,
          subject: composerSubject,
          companyName: companyName,
          slug: sample?.slug || effectiveSlug
        })
      }).catch((err) => console.warn('[Inquiry] Backend submission warning:', err));
    } catch (_) {}

    // 2. Open email directly in browser tab so user's active browser account handles it
    let targetUrl = '';
    if (targetService === 'outlook') {
      targetUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(composerTo)}&subject=${encodeURIComponent(composerSubject)}&body=${encodeURIComponent(composerBody)}`;
    } else if (targetService === 'yahoo') {
      targetUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(composerTo)}&subj=${encodeURIComponent(composerSubject)}&body=${encodeURIComponent(composerBody)}`;
    } else if (targetService === 'mailto') {
      targetUrl = `mailto:${encodeURIComponent(composerTo)}?subject=${encodeURIComponent(composerSubject)}&body=${encodeURIComponent(composerBody)}`;
    } else {
      // Default: Gmail Web in current browser tab/window
      targetUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(composerTo)}&su=${encodeURIComponent(composerSubject)}&body=${encodeURIComponent(composerBody)}`;
    }

    if (targetService === 'mailto') {
      window.location.href = targetUrl;
    } else {
      // Synchronous window.open ensures popup blockers don't block opening the browser mail tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    setComposerSent(true);
    setComposerSending(false);
    setTimeout(() => {
      setComposerOpen(false);
      setComposerSent(false);
    }, 2200);
  };

  // Extract and resolve the target company logo uploaded by the lead team in prospect showcase
  const companyLogo = useMemo(() => {
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    // 1. Direct showcase logo uploaded in the prospect showcase
    let raw = sample?.logoUrl || sample?.companyLogo;
    if (raw && !isPlatformLogo(raw)) {
      return raw.trim();
    }

    // 2. Company study logo
    const studyLogo = sample?.companyStudy?.logoUrl || sample?.companyStudy?.logo;
    if (studyLogo && !isPlatformLogo(studyLogo)) {
      return studyLogo.trim();
    }

    // 3. Fallback: Official company study website domain favicon
    const explicitWebsite = sample?.companyStudy?.website || null;

    if (explicitWebsite && typeof explicitWebsite === 'string') {
      const cd = explicitWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
      if (cd.includes('.') && cd.length >= 4) {
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cd.toLowerCase()}&size=128`;
      }
    }

    // 5. Inferred company domain favicon fallback from slug or company name
    let inferredDomain = '';
    if (sample?.slug) {
      const cleanSlug = sample.slug.toLowerCase().trim();
      if (cleanSlug.includes('.')) {
        inferredDomain = cleanSlug;
      } else if (cleanSlug.endsWith('-ai')) {
        inferredDomain = `${cleanSlug.replace(/-ai$/, '')}.ai`;
      } else if (cleanSlug.endsWith('-io')) {
        inferredDomain = `${cleanSlug.replace(/-io$/, '')}.io`;
      } else if (cleanSlug === 'finkr') {
        inferredDomain = 'finkr.co.uk';
      } else if (cleanSlug) {
        inferredDomain = `${cleanSlug.replace(/[^a-z0-9]/g, '')}.com`;
      }
    }
    if (!inferredDomain && sample?.companyName) {
      const cleanName = sample.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName.length >= 2) {
        inferredDomain = `${cleanName}.com`;
      }
    }
    if (inferredDomain && inferredDomain.includes('.')) {
      return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${inferredDomain}&size=128`;
    }

    return null;
  }, [sample]);

  // Helper to detect dummy/mock template leads
  const isMockDummyLead = (l) => {
    if (!l) return true;
    const email = (l.email || '').toLowerCase().trim();
    const company = (l.company || '').toLowerCase().trim();
    const name = (l.name || '').toLowerCase().trim();
    return (
      email === 's.jenkins@acmeglobal.com' ||
      (name === 'sarah jenkins' && company === 'acme global systems') ||
      (name === 'sample decision maker' && company.includes('partner'))
    );
  };

  // Resolve best logo for any lead (uploaded lead logo -> lead's own company domain favicon -> fallback initial)
  // CRITICAL: Guarantees lead logo NEVER replicates the showcase company logo
  const resolveLeadLogo = (lead, isFeatured = false) => {
    if (!lead) return null;
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    // Helper to verify if candidate URL belongs to the showcase client company
    const isShowcaseCompanyLogo = (candUrl) => {
      if (!candUrl || typeof candUrl !== 'string') return false;
      const cleanCand = candUrl.trim();
      if (companyLogo && cleanCand === companyLogo) return true;
      if (sample?.logoUrl && cleanCand === sample.logoUrl) return true;
      if (sample?.companyLogo && cleanCand === sample.companyLogo) return true;
      if (sample?.companyStudy?.logoUrl && cleanCand === sample.companyStudy.logoUrl) return true;
      if (sample?.slug && cleanCand.includes(`/samples/${sample.slug}/logo`)) return true;

      // Match base64 data URLs if identical to showcase logo
      if (sample?.logoUrl && sample.logoUrl.startsWith('data:') && cleanCand === sample.logoUrl) return true;
      if (sample?.companyLogo && sample.companyLogo.startsWith('data:') && cleanCand === sample.companyLogo) return true;
      if (sample?.companyStudy?.logoUrl && sample.companyStudy.logoUrl.startsWith('data:') && cleanCand === sample.companyStudy.logoUrl) return true;

      // Reject generic lead logo route if lead has no distinct asset key
      if (sample?.slug && cleanCand.includes(`/api/samples/${sample.slug}/leads/`) && !lead.logoAssetKey) {
        return true;
      }

      if (companyName) {
        const cleanComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanComp.length >= 3 && cleanCand.toLowerCase().includes(`${cleanComp}.com`)) {
          const leadComp = (lead.company || lead.leadCompany || lead.targetCompany || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (leadComp && leadComp !== cleanComp) return true;
        }
      }
      return false;
    };

    // 1. Direct lead logo uploaded specifically for this lead (all alias fields)
    const directLogo =
      lead.logo ||
      lead.companyLogo ||
      lead.logoUrl ||
      lead.logo_url ||
      lead.company_logo ||
      lead.companyLogoUrl ||
      lead.avatarUrl;

    if (directLogo && !isPlatformLogo(directLogo) && !isShowcaseCompanyLogo(directLogo)) {
      // If directLogo is a legacy Google favicon URL with a dead/generic fallback, avoid returning it blindly
      if (!directLogo.includes('t3.gstatic.com/faviconV2') && !directLogo.includes('google.com/s2/favicons')) {
        return directLogo.trim();
      }
    }

    // 1b. If lead has an object asset key uploaded specifically to storage for this lead
    if (lead.logoAssetKey && sample?.slug && lead.id) {
      return `/api/samples/${sample.slug}/leads/${lead.id}/logo`;
    }

    // 2. Lead's own company website domain favicon using DuckDuckGo
    const rawLink =
      lead.companyLink ||
      lead.website ||
      lead.companyWebsite ||
      lead.domain ||
      lead.companyDomain ||
      lead.websiteUrl ||
      lead.company_link;

    if (rawLink && typeof rawLink === 'string') {
      const parsedHost = rawLink
        .replace(/^https?:\/\//i, '')
        .split('/')[0]
        .split('?')[0]
        .trim();
      const compWebsite = (sample?.companyStudy?.website || '').toLowerCase();
      if (parsedHost && parsedHost.includes('.') && parsedHost.length >= 4 && !compWebsite.includes(parsedHost.toLowerCase())) {
        return `https://icons.duckduckgo.com/ip3/${parsedHost.toLowerCase()}.ico`;
      }
    }

    return null;
  };

  // ONLY display the leads that are actually uploaded (no fake/synthetic leads!)
  const displayLeads = useMemo(() => {
    const raw = Array.isArray(sample?.leads) ? sample.leads : [];
    return raw.filter((l) => !isMockDummyLead(l));
  }, [sample]);

  // Lead #1 is the featured open profile
  const featuredLead = displayLeads.length > 0 ? displayLeads[0] : null;

  // All the remaining uploaded leads (leads 2+) are displayed in the locked cards section
  const uploadedLockedLeads = displayLeads.length > 1 ? displayLeads.slice(1) : [];

  // Present ALL uploaded locked leads directly with their authentic name & logo
  const lockedLeads = useMemo(() => {
    return uploadedLockedLeads;
  }, [uploadedLockedLeads]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading Intelligence Showcase...
          </p>
        </div>
      </div>
    );
  }

  if (error || !sample) {
    const defaultCards = [
      {
        slug: 'data-i2i',
        name: 'Data I2I',
        industry: 'Enterprise Data Analytics & AI Consulting',
        leads: '4 Vetted Decision Makers',
        logo: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://data-i2i.com&size=128'
      },
      {
        slug: 'siift-ai',
        name: 'Siift AI',
        industry: 'SaaS, Workflow Automation & Agentic OS',
        leads: 'Curated Strategic Contacts',
        logo: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://siift.ai&size=128'
      },
      {
        slug: 'finkr',
        name: 'Finkr',
        industry: 'Fintech, Core Banking & Venture Acceleration',
        leads: 'Fintech Founders & CTOs',
        logo: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128'
      }
    ];

    const displayCards = availableShowcases && availableShowcases.length > 0 ? availableShowcases : defaultCards;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '32px 16px' }}>
        <div style={{ maxWidth: '640px', width: '100%', background: '#FFFFFF', padding: '36px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Sparkles size={26} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            DiziGini Intelligence Showcases
          </h2>
          
          <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.6', marginBottom: '24px', maxWidth: '520px', margin: '0 auto 24px auto' }}>
            The requested custom showcase <code style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{effectiveSlug}</code> is being prepared or is private. Explore one of our published verified prospect dossiers below:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '28px', textAlign: 'left' }}>
            {displayCards.slice(0, 3).map((item) => (
              <div
                key={item.slug}
                onClick={() => navigate(`/samples/${item.slug}`)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93C5FD';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
                    {item.logo || item.logoUrl ? (
                      <img src={item.logo || item.logoUrl} alt={item.name || item.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <Building2 size={16} color="#64748B" />
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '4px' }}>
                    {item.name || item.companyName || item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4' }}>
                    {item.industry || item.leads || 'Verified Prospect Dossier'}
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
                  <span>View Dossier</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/samples/data-i2i')}
              style={{
                padding: '11px 22px',
                borderRadius: '10px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
              }}
            >
              Explore Flagship Showcase (Data I2I)
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Return Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="public-sample-page">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="sample-header">
        <div className="sample-header-inner">
          
          <div className="sample-brand-group">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
            </Link>
          </div>

          <div className="sample-verified-badge">
            <ShieldCheck size={14} color="#10B981" />
            <span>Verified Intelligence Briefing</span>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="sample-hero-section">
        <div className="sample-hero-grid">
          
          {/* Left Column: Title & Subtitle */}
          <div>

            <h1 className="sample-hero-title">
              {companyName}’s next growth opportunities, explored.
            </h1>

            <p className="sample-hero-desc">
              {sample.description || `Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.`}
            </p>
          </div>

          {/* Right Column: Medium-Sized Container with Visible Company Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sample-hero-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70px',
                marginBottom: '12px',
                padding: '4px 12px',
                maxWidth: '100%',
                position: 'relative'
              }}>
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    style={{
                      maxHeight: '70px',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: companyLogo ? 'none' : 'flex',
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  border: '1.5px solid #BFDBFE'
                }}>
                  {companyName?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                {companyName}
              </div>

              {/* Study Document Box: Paragraph + Preview & Download Button */}
              <div style={{
                marginTop: '16px',
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ flex: '1 1 170px' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#334155',
                    lineHeight: 1.4,
                    wordBreak: 'break-word'
                  }}>
                    What we understood from your company
                  </p>
                  <div style={{
                    fontSize: '0.74rem',
                    color: '#16A34A',
                    fontWeight: 700,
                    marginTop: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>💡 On an avg lead identification and study costs $2</span>
                  </div>
                </div>

                {companyStudy?.hasPdf ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const studyUrl = companyStudy.pdfUrl || `/api/samples/${sample.slug}/company-study-pdf`;
                        setPdfPreviewModal({
                          url: studyUrl,
                          title: `${companyName} — Comprehensive Company Study`,
                          downloadUrl: `${studyUrl}?download=true`,
                          fileName: `${companyName.replace(/\s+/g, '_')}_Company_Study.pdf`,
                        });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Eye size={14} />
                      <span>Preview Study</span>
                    </button>

                    <a
                      href={companyStudy.pdfUrl || `/api/samples/${sample.slug}/company-study-pdf`}
                      target="_blank"
                      rel="noreferrer"
                      download={`${companyName.replace(/\s+/g, '_')}_Company_Study.pdf`}
                      className="sample-download-study-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.22)',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1D4ED8';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2563EB';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Download size={14} />
                      <span>Download the company study</span>
                    </a>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#64748B',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}
                  >
                    <FileText size={13} color="#94A3B8" />
                    <span>Study Document: Not Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="sample-main">

        {/* SECTION 1: DECISION-MAKER INTELLIGENCE */}
        <section className="sample-section">
          
          {/* Section 1 Header */}
          <div className="sample-section-header">
            <div className="sample-section-title-wrap">
              <div className="sample-section-badge">
                1
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 className="sample-section-title" style={{ margin: 0 }}>
                    Decision-maker intelligence
                  </h2>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}>
                    <span>💡 On an avg lead identification and study costs $2</span>
                  </div>
                </div>
                <p className="sample-section-subtitle">
                  A preview of the people relevant to your target account.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Profile Card */}
          {featuredLead ? (
            <div className="featured-lead-card">
              
              <div className="featured-lead-info">
                {resolveLeadLogo(featuredLead, true) ? (
                  <img
                    src={resolveLeadLogo(featuredLead, true)}
                    alt={featuredLead.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #E2E8F0',
                      flexShrink: 0
                    }}
                    onLoad={(e) => {
                      if (e.currentTarget.naturalWidth <= 16 && e.currentTarget.naturalHeight <= 16) {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: resolveLeadLogo(featuredLead, true) ? 'none' : 'flex',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  border: '2px solid #E2E8F0',
                  flexShrink: 0
                }}>
                  {(() => {
                    const leadPres = resolveLeadPresentation(featuredLead, companyName);
                    return (leadPres.leadCompany || leadPres.leadPersonName || 'L').charAt(0).toUpperCase();
                  })()}
                </div>

                {(() => {
                  const leadPres = resolveLeadPresentation(featuredLead, companyName);
                  return (
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#0F172A', margin: 0, wordBreak: 'break-word', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          {leadPres.leadCompany}
                        </h3>
                        <CheckCircle2 size={18} color="#10B981" />
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2563EB', marginTop: '4px', wordBreak: 'break-word' }}>
                        {leadPres.subtitle}
                      </div>

                      {featuredLead.whySuitsBest && (
                        <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: '8px 0 0 0', maxWidth: '680px', wordBreak: 'break-word' }}>
                          {featuredLead.whySuitsBest}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons: Preview Pitch Deck & Download Pitch Deck */}
              {(() => {
                const leadPitchUrl = featuredLead.pitchDeck?.downloadUrl ||
                                     featuredLead.pitchDeckPdf ||
                                     (sample?.pitchDeck?.downloadUrl || (sample?.pitchDeck ? `/api/samples/${sample.slug}/pitch-deck?download=true` : null));
                const leadPitchStreamUrl = featuredLead.pitchDeck?.streamUrl ||
                                           featuredLead.pitchDeckPdf ||
                                           (sample?.pitchDeck?.streamUrl || (sample?.pitchDeck ? `/api/samples/${sample.slug}/pitch-deck` : leadPitchUrl));
                const leadPitchName = featuredLead.pitchDeck?.fileName || featuredLead.pitchDeckPdfName || sample?.pitchDeck?.fileName || `${(featuredLead.name || 'Prospect').replace(/\s+/g, '_')}_Pitch_Deck.pdf`;

                if (leadPitchUrl) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfPreviewModal({
                            url: leadPitchStreamUrl,
                            title: `${featuredLead.name || 'Prospect'} — Pitch Deck`,
                            downloadUrl: leadPitchUrl,
                            fileName: leadPitchName,
                          });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Eye size={16} />
                        <span>Preview Pitch Deck</span>
                      </button>

                      <a
                        href={leadPitchUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={leadPitchName}
                        className="featured-lead-btn"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Download size={16} />
                        <span>Download Pitch Deck</span>
                      </a>
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#64748B',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    <Download size={14} color="#94A3B8" />
                    <span>Pitch Deck: Not Uploaded</span>
                  </div>
                );
              })()}

              {/* All Details Displayed Directly on the Container */}
              {(() => {
                const leadMail = featuredLead.email || null;
                const companyWeb = featuredLead.companyLink || null;
                const companyLinkedin = featuredLead.companyLinkedin || null;
                const companyContact = featuredLead.companyContactEmail || featuredLead.companyContact || featuredLead.companyEmail || null;
                const leadLinkedin = featuredLead.linkedin || null;

                return (
                  <div style={{
                    width: '100%',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {/* Container 1: COMPANY SPECIFIC */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Building2 size={16} color="#2563EB" />
                          <span>COMPANY SPECIFIC</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company Web:</span>
                            {companyWeb ? (
                              <a
                                href={companyWeb.startsWith('http') ? companyWeb : `https://${companyWeb}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                              >
                                <Globe size={14} style={{ flexShrink: 0 }} />
                                <span>{shortenUrl(companyWeb, 32)}</span>
                                <ExternalLink size={12} style={{ flexShrink: 0 }} />
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Not specified</span>
                            )}
                          </div>

                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company LinkedIn:</span>
                            {companyLinkedin ? (
                              <a
                                href={companyLinkedin.startsWith('http') ? companyLinkedin : `https://${companyLinkedin}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                              >
                                <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                                <span>{shortenUrl(companyLinkedin, 32)}</span>
                                <ExternalLink size={12} style={{ flexShrink: 0 }} />
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Not specified</span>
                            )}
                          </div>

                          {/* Company Contact Email (uploaded by lead specialists) */}
                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company Contact:</span>
                            {companyContact ? (
                              <a
                                href={`mailto:${companyContact}`}
                                style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                              >
                                <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                                <span>{companyContact}</span>
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Not uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Container 2: LEAD SPECIFIC */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Users size={16} color="#7C3AED" />
                          <span>LEAD SPECIFIC</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                          {/* Lead Mail */}
                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Mail:</span>
                            {leadMail ? (
                              <a
                                href={`mailto:${leadMail}`}
                                style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                              >
                                <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                                <span>{leadMail}</span>
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Not specified</span>
                            )}
                          </div>

                          {/* Lead LinkedIn (Replaces Lead Phone) */}
                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead LinkedIn:</span>
                            {leadLinkedin ? (
                              <a
                                href={leadLinkedin.startsWith('http') ? leadLinkedin : `https://${leadLinkedin}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#0A66C2', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                              >
                                <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                                <span>{shortenUrl(leadLinkedin, 32)}</span>
                                <ExternalLink size={12} style={{ flexShrink: 0 }} />
                              </a>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Not uploaded</span>
                            )}
                          </div>

                          {/* Lead Role */}
                          <div className="dossier-info-row">
                            <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Role:</span>
                            <span style={{ color: '#0F172A', fontWeight: 800, wordBreak: 'break-word' }}>
                              {featuredLead.title?.trim() || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '36px', textAlign: 'center', color: '#64748B' }}>
              No decision makers uploaded yet for this prospect.
            </div>
          )}

          {/* THE 4 LOCKED LEADS (Logo & Company Name prominently shown, direct contact locked) */}
          {lockedLeads.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                    Additional target accounts & decision-makers
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px', wordBreak: 'break-word' }}>
                    Target profiles for this prospect dossier ({lockedLeads.length} locked in sample preview).
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#92400E',
                  flexShrink: 0
                }}>
                  <Lock size={13} color="#D97706" />
                  <span>{lockedLeads.length} Profiles Locked</span>
                </div>
              </div>

              <div className="sample-grid-4">
                {lockedLeads.map((item, idx) => {
                  const leadLogoUrl = resolveLeadLogo(item, false);
                  const leadPres = resolveLeadPresentation(item, companyName);
                  const effectiveCompany = leadPres.leadCompany || leadPres.leadPersonName || 'Target Organization';
                  const effectiveLeadPerson = leadPres.leadPersonName;
                  const effectiveRole = leadPres.role || 'Executive Decision Maker';

                  return (
                    <div
                      key={item.id || idx}
                      onClick={scrollToNextSteps}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToNextSteps(e); }}
                      className="sample-lead-card"
                    >
                      <div>
                        {/* Top Row: Company Logo & Locked Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {leadLogoUrl ? (
                              <img
                                src={leadLogoUrl}
                                alt={effectiveCompany}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  padding: '4px'
                                }}
                                onLoad={(e) => {
                                  if (e.currentTarget.naturalWidth <= 16 && e.currentTarget.naturalHeight <= 16) {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                      e.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                  }
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                display: leadLogoUrl ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                color: '#2563EB',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1.15rem'
                              }}
                            >
                              {effectiveCompany.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <Lock size={12} color="#D97706" />
                            <span>Locked Profile</span>
                          </span>
                        </div>

                        {/* Company Name & Lead Details */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <div style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: '#0F172A',
                              lineHeight: 1.3,
                              letterSpacing: '0.01em',
                              textTransform: 'uppercase'
                            }}>
                              {effectiveCompany}
                            </div>
                            <CheckCircle2 size={15} color="#10B981" />
                          </div>

                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#2563EB', lineHeight: 1.4 }}>
                            {leadPres.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Status & Unlock Action */}
                      <div style={{
                        paddingTop: '12px',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#10B981" />
                          <span>Verified Prospect</span>
                        </span>

                        <button
                          type="button"
                          onClick={scrollToNextSteps}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '6px 13px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EFF6FF';
                            e.currentTarget.style.color = '#2563EB';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                            e.currentTarget.style.color = '#334155';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          <Lock size={12} />
                          <span>Locked</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

        {/* SECTION 2: EXECUTIVE INTELLIGENCE */}
        <section id="executive-intelligence" className="sample-section">
          
          {/* Section 2 Header */}
          <div className="sample-section-header">
            <div className="sample-section-title-wrap">
              <div className="sample-section-badge">
                2
              </div>
              <div>
                <h2 className="sample-section-title">
                  Executive Intelligence
                </h2>
                <p className="sample-section-subtitle">
                  Key findings about {companyName}’s business, market position and growth potential.
                </p>
              </div>
            </div>
          </div>

          {/* Industry / Sector Mini Cards */}
          {industrySectors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                Industry Sectors:
              </span>
              {industrySectors.map((ind, i) => (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1E293B',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <Briefcase size={12} color="#2563EB" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          )}

          {/* 4 Cards Grid */}
          {(() => {
            const intelCardStyle = {
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '330px',
              minHeight: '330px',
              maxHeight: '330px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            };

            const headlineStyle = {
              fontSize: '0.94rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.35,
              margin: '0 0 10px 0',
              height: '2.7em',
              minHeight: '2.7em',
              maxHeight: '2.7em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            };

            const contentBoxStyle = {
              height: '112px',
              minHeight: '112px',
              maxHeight: '112px',
              overflow: 'hidden',
            };

            const paragraphStyle = {
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.45,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
            };

            const footerBaseStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              fontWeight: 700,
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: 'auto',
              height: '24px',
              boxSizing: 'border-box',
            };

            return (
              <div className="sample-grid-4">
                {/* Card 1: Company Overview */}
                <div style={intelCardStyle}>
                  <div>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Building2 size={17} />
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', height: '16px', lineHeight: '16px' }}>
                      COMPANY OVERVIEW
                    </div>

                    <h3 style={headlineStyle}>
                      {getCardHeadline(companyStudy.overviewTitle, companyStudy.businessOverview, 'B2B Core Architecture & Service Overview')}
                    </h3>

                    <div style={contentBoxStyle}>
                      <p style={paragraphStyle}>
                        {trimCardText(
                          companyStudy.businessOverview || companyStudy.overview,
                          180,
                          `${companyName} is an enterprise-focused organization delivering specialized solutions across technical architecture and commercial workflow execution.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ ...footerBaseStyle, color: '#059669' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                    <span>High confidence</span>
                  </div>
                </div>

                {/* Card 2: Market Position */}
                <div style={intelCardStyle}>
                  <div>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <TrendingUp size={17} />
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', height: '16px', lineHeight: '16px' }}>
                      MARKET POSITION
                    </div>

                    <h3 style={headlineStyle}>
                      {getCardHeadline(companyStudy.marketTitle, companyStudy.marketPosition, 'Market Footprint & Segment Velocity')}
                    </h3>

                    <div style={contentBoxStyle}>
                      <p style={paragraphStyle}>
                        {trimCardText(
                          companyStudy.marketPosition,
                          180,
                          `Maintains strong commercial positioning and domain recognition across core enterprise software and integrated workflow modernization sectors.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ ...footerBaseStyle, color: '#059669' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                    <span>High confidence</span>
                  </div>
                </div>

                {/* Card 3: Key Opportunities */}
                <div style={intelCardStyle}>
                  <div>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Lightbulb size={17} />
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', height: '16px', lineHeight: '16px' }}>
                      KEY OPPORTUNITIES
                    </div>

                    <h3 style={headlineStyle}>
                      {getCardHeadline(companyStudy.opportunitiesTitle, companyStudy.keyObservations, 'Observed Market & Integration Opportunities')}
                    </h3>

                    <div style={contentBoxStyle}>
                      {(() => {
                        const points = parseKeyOpportunities(companyStudy.keyObservations, companyName);
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            gap: '6px'
                          }}>
                            {points.map((pt, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.80rem',
                                  color: '#475569',
                                  lineHeight: 1.35,
                                  maxHeight: '34px',
                                  overflow: 'hidden',
                                }}
                              >
                                <span style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#FEF3C7',
                                  color: '#D97706',
                                  fontSize: '0.70rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: '1px'
                                }}>
                                  {idx + 1}
                                </span>
                                <span style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-word',
                                }}>
                                  {pt}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div style={{ ...footerBaseStyle, color: '#D97706' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                    <span>Medium confidence</span>
                  </div>
                </div>

                {/* Card 4: Recommended Focus */}
                <div style={intelCardStyle}>
                  <div>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#F3E8FF',
                      color: '#9333EA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Target size={17} />
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', height: '16px', lineHeight: '16px' }}>
                      RECOMMENDED FOCUS
                    </div>

                    <h3 style={headlineStyle}>
                      {getCardHeadline(companyStudy.focusTitle, companyStudy.potentialOpportunity, 'Recommended Commercial Strategy & Focus')}
                    </h3>

                    <div style={contentBoxStyle}>
                      <p style={paragraphStyle}>
                        {trimCardText(
                          companyStudy.potentialOpportunity,
                          180,
                          `Prioritize high-impact enterprise decision-makers with tailored proof-of-concept roadmaps, direct ROI benchmarks, and proactive technical validation to accelerate commercial conversion.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ ...footerBaseStyle, color: '#D97706' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                    <span>Medium confidence</span>
                  </div>
                </div>
              </div>
            );
          })()}

        </section>

        {/* SECTION 3: PROSPECT INTEREST & NEXT STEPS (Mini Contact Options) */}
        <section id="contact-feedback" className="sample-section" style={{ marginTop: '48px', marginBottom: '24px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: 'clamp(32px, 5vw, 48px) clamp(20px, 4vw, 40px)',
            boxShadow: '0 4px 25px rgba(15, 23, 42, 0.04)',
            textAlign: 'center',
            maxWidth: '820px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top decorative gradient accent bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #10B981 100%)'
            }} />

            <h2 style={{
              fontSize: 'clamp(1.35rem, 4vw, 1.85rem)',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word'
            }}>
              How would you like to proceed with {companyName}?
            </h2>

            <p style={{
              fontSize: 'clamp(0.88rem, 2vw, 0.98rem)',
              color: '#64748B',
              maxWidth: '560px',
              margin: '0 auto 28px auto',
              lineHeight: 1.55,
              wordBreak: 'break-word'
            }}>
              Let our team know your decision on this intelligence briefing. Click an option below to connect with us or send your feedback.
            </p>

            {/* Options: Interested / Not Interested */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <button
                type="button"
                onClick={() => openMailComposer('interested')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '13px 30px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.28)';
                }}
              >
                <ThumbsUp size={18} />
                <span>Interested</span>
              </button>

              <button
                type="button"
                onClick={() => openMailComposer('not_interested')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '13px 26px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#94A3B8';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                <ThumbsDown size={18} />
                <span>Not Interested</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* 5. CONTACT SIGNATURE FOOTER */}
      <footer className="sample-public-footer">
        <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Main 3-Column Signature Block (Matches Reference Signature) */}
          <div className="sample-signature-card">
            {/* Column 1: Contact Details */}
            <div className="signature-col-contact">
              <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '2px', fontWeight: 500 }}>
                Regards,
              </div>
              <div className="signature-name">
                Akshay Deepak
              </div>
              <div style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600, letterSpacing: '-0.01em', marginTop: '1px' }}>
                Lead Research Manager
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                <a
                  href="mailto:akshay@dizitalgini.com"
                  style={{
                    fontSize: '0.94rem',
                    color: '#2563EB',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    wordBreak: 'break-all',
                  }}
                >
                  akshay@dizitalgini.com
                </a>
                <a
                  href="https://www.dizigini.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.94rem',
                    color: '#1E40AF',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  www.dizigini.com
                </a>
              </div>
            </div>

            {/* Desktop Vertical Divider 1 */}
            <div className="signature-divider" />
            {/* Mobile Horizontal Divider */}
            <div className="signature-divider-h" />

            {/* Brand Wrap: In Desktop acts as direct flex columns, in Mobile sits side-by-side on bottom row */}
            <div className="signature-brands-wrap">
              {/* Column 2: DiziGini Brand Logo */}
              <div className="signature-col-brand">
                <a href="https://www.dizigini.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <img
                    src={BRAND_LOGO_STACKED || BRAND_LOGO || '/logo.png'}
                    alt="DiziGini"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </a>
              </div>

              {/* Desktop Vertical Divider 2 */}
              <div className="signature-divider" />

              {/* Column 3: Powered by DATAI2I */}
              <div className="signature-col-powered">
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500, letterSpacing: '0.01em' }}>
                  Powered by
                </span>
                <a
                  href="https://datai2i.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '2px 4px',
                    borderRadius: '6px',
                  }}
                >
                  <img
                    src="/datai2i-logo.png"
                    alt="DATA I2I"
                    style={{
                      height: '26px',
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'inline-block';
                      }
                    }}
                  />
                  <span style={{ display: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#1E1B4B' }}>
                    DATA I2I
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Subtext: Thanks for your time */}
          <div style={{ textAlign: 'center', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
            Thanks for your time. If you&apos;d like to discuss this, feel free to reach out directly or reply to this email.
          </div>

          {/* SLA & Security Trust */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
            <ShieldCheck size={14} color="#10B981" style={{ flexShrink: 0 }} />
            <span>{BRAND_NAME} Protected Intelligence Showcase · Enterprise SLA & Tenant Isolation</span>
          </div>

        </div>
      </footer>



      {/* MODAL 2: INTERACTIVE LEAD DOSSIER MODAL (Item 4 Applied: Clean 2 Containers for Company Specific & Lead Specific) */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(10px, 3vw, 20px)',
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'clamp(14px, 3.5vw, 22px) clamp(16px, 4vw, 28px)',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              borderRadius: 'clamp(14px, 3vw, 20px) clamp(14px, 3vw, 20px) 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {resolveLeadLogo(selectedLead) ? (
                  <img
                    src={resolveLeadLogo(selectedLead)}
                    alt={selectedLead.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
                    onLoad={(e) => {
                      if (e.currentTarget.naturalWidth <= 16 && e.currentTarget.naturalHeight <= 16) {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: resolveLeadLogo(selectedLead) ? 'none' : 'flex',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  border: '1.5px solid #E2E8F0'
                }}>
                  {(() => {
                    const selPres = resolveLeadPresentation(selectedLead, companyName);
                    return selPres.leadCompany?.charAt(0).toUpperCase() || 'L';
                  })()}
                </div>
                {(() => {
                  const selPres = resolveLeadPresentation(selectedLead, companyName);
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                          {selPres.leadCompany}
                        </h3>
                        <CheckCircle2 size={16} color="#10B981" />
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                        {selPres.subtitle}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const isLeadUnlocked = Boolean(selectedLead.isUnlocked || (featuredLead && (selectedLead.id === featuredLead.id || selectedLead.name === featuredLead.name)));
              const leadMail = isLeadUnlocked
                ? (selectedLead.email || featuredLead?.email || null)
                : (selectedLead.maskedEmail || null);

              return (
                <div style={{ padding: 'clamp(16px, 3.5vw, 22px) clamp(16px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {(selectedLead.whySuitsBest || selectedLead.shortSummary) && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                        EXECUTIVE PROFILE
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
                        {selectedLead.whySuitsBest || selectedLead.shortSummary}
                      </p>
                    </div>
                  )}

                  {/* 1. Company Specific Container */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="#2563EB" />
                      <span>COMPANY SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company Web:</span>
                        {(selectedLead.companyLink || sample?.companyStudy?.website) ? (
                          <a
                            href={(selectedLead.companyLink || sample?.companyStudy?.website).startsWith('http') ? (selectedLead.companyLink || sample?.companyStudy?.website) : `https://${selectedLead.companyLink || sample?.companyStudy?.website}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Globe size={14} style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.companyLink || sample?.companyStudy?.website, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company LinkedIn:</span>
                        {(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) ? (
                          <a
                            href={(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin).startsWith('http') ? (selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) : `https://${selectedLead.companyLinkedin || sample?.companyStudy?.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      {/* Company Contact Email */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company Contact:</span>
                        {(selectedLead.companyContactEmail || selectedLead.companyContact || selectedLead.companyEmail) ? (
                          <a
                            href={`mailto:${selectedLead.companyContactEmail || selectedLead.companyContact || selectedLead.companyEmail}`}
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                            <span>{selectedLead.companyContactEmail || selectedLead.companyContact || selectedLead.companyEmail}</span>
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Lead Specific Container */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="#7C3AED" />
                      <span>LEAD SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      {/* Lead Mail */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Mail:</span>
                        {leadMail ? (
                          isLeadUnlocked ? (
                            <a
                              href={`mailto:${leadMail}`}
                              style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                            >
                              <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </a>
                          ) : (
                            <span style={{ color: '#475569', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                              <Mail size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      {/* Lead LinkedIn (Replaces Lead Phone) */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead LinkedIn:</span>
                        {selectedLead.linkedin && !selectedLead.linkedin.includes('/company/') ? (
                          <a
                            href={selectedLead.linkedin.startsWith('http') ? selectedLead.linkedin : `https://${selectedLead.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0A66C2', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.linkedin, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not uploaded</span>
                        )}
                      </div>

                      {/* Lead Role */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Role:</span>
                        <span style={{ color: '#0F172A', fontWeight: 800, wordBreak: 'break-word' }}>
                          {selectedLead.title?.trim() || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

              {/* Pitch Deck proposal if available */}
              {(selectedLead.pitchDeck || pitchDeck) && (
                <div style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ color: '#FFFFFF' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase' }}>Proposal Pitch Deck</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      {selectedLead.pitchDeck?.title || pitchDeck?.title || `${companyName} Growth Architecture Playbook`}
                    </div>
                  </div>

                  {(selectedLead.pitchDeck || pitchDeck) && (
                    <button
                      type="button"
                      onClick={() => {
                        const deckUrl = selectedLead.pitchDeck?.streamUrl || selectedLead.pitchDeck?.downloadUrl || `/api/samples/${sample.slug}/leads/${selectedLead.id}/pitch-deck`;
                        setPdfPreviewModal({
                          url: deckUrl,
                          title: selectedLead.pitchDeck?.title || `${selectedLead.name} Proposal Pitch Deck`,
                          downloadUrl: `${deckUrl}?download=true`,
                          fileName: `${(selectedLead.name || 'Lead').replace(/\s+/g, '_')}_Pitch_Deck.pdf`,
                        });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#FFFFFF',
                        color: '#1E1B4B',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease'
                      }}
                    >
                      <Presentation size={14} />
                      <span>Preview Deck PDF</span>
                    </button>
                  )}
                </div>
              )}

              {/* Close Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}
                >
                  Close
                </button>
              </div>

            </div>
          );
        })()}
          </div>
        </div>
      )}

      {/* FLOATING GMAIL-STYLE COMPOSE CARD */}
      {composerOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: composerMaximized ? '24px' : '0',
            right: composerMaximized ? 'auto' : 'clamp(12px, 3vw, 36px)',
            left: composerMaximized ? '50%' : 'auto',
            transform: composerMaximized ? 'translateX(-50%)' : 'none',
            width: composerMaximized ? 'min(860px, 94vw)' : 'clamp(340px, 92vw, 540px)',
            height: composerMinimized ? 'auto' : (composerMaximized ? 'min(82vh, 700px)' : 'auto'),
            maxHeight: composerMinimized ? '44px' : '92vh',
            background: '#FFFFFF',
            borderRadius: composerMaximized ? '14px' : '14px 14px 0 0',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
            border: '1px solid #D1D5DB',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {/* Header Bar */}
          <div
            onClick={() => {
              if (composerMinimized) setComposerMinimized(false);
            }}
            style={{
              height: '44px',
              minHeight: '44px',
              background: '#F2F6FC',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: composerMinimized ? 'none' : '1px solid #E5E7EB',
              cursor: composerMinimized ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#1F2937',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingRight: '12px'
            }}>
              {composerSubject || (composerType === 'interested' ? `Interested in the ${companyName || 'LimitlessAI'} Report` : `Note to the team - ${companyName || 'LimitlessAI'}`)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {/* Minimize */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setComposerMinimized(!composerMinimized);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  cursor: 'pointer'
                }}
                title={composerMinimized ? "Expand" : "Minimize"}
              >
                <Minus size={14} />
              </button>

              {/* Maximize / Restore */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setComposerMinimized(false);
                  setComposerMaximized(!composerMaximized);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  cursor: 'pointer'
                }}
                title={composerMaximized ? "Exit full screen" : "Full screen"}
              >
                {composerMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setComposerOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  cursor: 'pointer'
                }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!composerMinimized && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {/* To Row */}
              <div style={{
                padding: '6px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B', width: '32px' }}>To</span>
                <input
                  type="text"
                  value={composerTo}
                  onChange={(e) => setComposerTo(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    fontWeight: 500,
                    background: 'transparent'
                  }}
                  placeholder="Recipients"
                />
              </div>

              {/* Subject Row */}
              <div style={{
                padding: '6px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    fontWeight: 500,
                    background: 'transparent'
                  }}
                  placeholder="Subject"
                />
              </div>

              {/* Message Textarea */}
              <div style={{ flex: 1, padding: '12px 16px', display: 'flex', minHeight: 0 }}>
                <textarea
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  style={{
                    width: '100%',
                    height: composerMaximized ? '360px' : '260px',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '0.88rem',
                    lineHeight: '1.6',
                    color: '#1E293B',
                    fontFamily: 'inherit',
                    background: 'transparent'
                  }}
                  placeholder="Compose email..."
                />
              </div>

              {/* Sent Banner / Toast if just sent */}
              {composerSent && (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '8px 16px',
                  margin: '0 16px 8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Mail opened in your browser & note sent to team@dizigini.com!</span>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div style={{
                padding: '8px 16px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: '#FFFFFF'
              }}>
                {/* Left controls: Send button & Formatting Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Split Send Button with options */}
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#0B57D0',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(11, 87, 208, 0.3)'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleSendMail('gmail')}
                        disabled={composerSending}
                        style={{
                          background: 'transparent',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px 8px 18px',
                          fontWeight: 600,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{composerSending ? 'Opening...' : (composerSent ? 'Opened!' : 'Send')}</span>
                      </button>
                      <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />
                      <button
                        type="button"
                        onClick={() => setSendMenuOpen(!sendMenuOpen)}
                        style={{
                          background: 'transparent',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Choose email provider"
                      >
                        <span style={{ fontSize: '0.65rem' }}>▼</span>
                      </button>
                    </div>

                    {/* Dropdown Options */}
                    {sendMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        minWidth: '220px',
                        zIndex: 10000,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleSendMail('gmail')}
                          style={{
                            background: '#EFF6FF',
                            border: 'none',
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#1D4ED8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>Gmail in Browser</span>
                          <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>(Default)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMail('outlook')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Outlook Web
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMail('yahoo')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Yahoo Mail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMail('mailto')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#64748B',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Desktop App (Mail / Outlook)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gmail Toolbar Icons (Exact order as in user image) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#5F6368' }}>
                    <span title="Formatting options" style={{ fontSize: '0.9rem', fontWeight: 700, padding: '4px 6px', cursor: 'pointer', userSelect: 'none' }}>Aa</span>
                    <span title="Pen / Style" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><PenTool size={16} /></span>
                    <span title="Attach files" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><Paperclip size={16} /></span>
                    <span title="Insert link" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><Link2 size={16} /></span>
                    <span title="Insert emoji" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><Smile size={16} /></span>
                    <span title="Insert files using Drive" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 17l6-10h8l-6 10H4z" />
                        <path d="M14 7l6 10" />
                      </svg>
                    </span>
                    <span title="Insert photo" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><ImageIcon size={16} /></span>
                    <span title="Toggle confidential mode" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><Clock size={16} /></span>
                    <span title="Insert signature" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><PenTool size={16} /></span>
                    <span title="More options" style={{ padding: '4px 6px', cursor: 'pointer', display: 'flex' }}><MoreVertical size={16} /></span>
                  </div>
                </div>

                {/* Right controls: Trash */}
                <div>
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#5F6368',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Discard draft"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IN-PAGE PDF PREVIEW MODAL (PREVIEW WITHOUT DOWNLOADING) */}
      {pdfPreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPdfPreviewModal(null);
          }}
        >
          <div
            style={{
              width: '95vw',
              maxWidth: '1100px',
              height: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                background: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <FileText size={18} color="#60A5FA" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '480px' }}>
                  {pdfPreviewModal.title || 'Document Preview'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#93C5FD',
                  background: 'rgba(37,99,235,0.25)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(147,197,253,0.3)',
                }}>
                  In-Page Preview
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pdfPreviewModal.downloadUrl && (
                  <a
                    href={pdfPreviewModal.downloadUrl}
                    download={pdfPreviewModal.fileName || 'Document.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setPdfPreviewModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Inline PDF Frame */}
            <div style={{ flex: 1, width: '100%', background: '#F1F5F9', position: 'relative' }}>
              <iframe
                src={pdfPreviewModal.url}
                title={pdfPreviewModal.title}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
