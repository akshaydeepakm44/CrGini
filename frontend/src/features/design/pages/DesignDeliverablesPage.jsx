import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  PenTool,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatDesignDateTime } from '../data/designAdapters';
import { DESIGN_SERVICES } from '../data/designServiceData';
import DesignFilePreview from '../components/DesignFilePreview';

export default function DesignDeliverablesPage({ requests = [], onNavigate }) {
  const navigate = useNavigate();
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  // Load submissions across all design requests
  useEffect(() => {
    async function loadAllSubmissions() {
      try {
        setLoading(true);
        const subPromises = requests.map(async (r) => {
          try {
            const subs = await api.getSubmissions(r.id || r._id);
            return (Array.isArray(subs) ? subs : []).map((sub) => ({
              ...sub,
              ticketId: r.ticketId,
              requestId: r.id || r._id,
              clientCompany: r.clientCompany,
              clientName: r.clientName,
              serviceName: r.service?.name,
              serviceSlug: r.serviceSlug,
              serviceIcon: r.service?.icon,
              serviceColor: r.service?.color,
              serviceBg: r.service?.bgColor,
            }));
          } catch {
            return [];
          }
        });

        const nested = await Promise.all(subPromises);
        const flattened = nested.flat().sort((a, b) => {
          return new Date(b.createdAt || b.created_at || b.submitted_at || 0) - new Date(a.createdAt || a.created_at || a.submitted_at || 0);
        });
        setSubmissionsList(flattened);
      } catch (err) {
        console.error('Failed to load design deliverables:', err);
      } finally {
        setLoading(false);
      }
    }

    if (requests.length > 0) {
      loadAllSubmissions();
    } else {
      setLoading(false);
    }
  }, [requests.length]);

  const filteredSubmissions = submissionsList.filter((sub) => {
    if (filterService !== 'ALL' && sub.serviceSlug !== filterService) return false;

    if (filterStatus === 'APPROVED' && sub.status !== 'APPROVED' && sub.review_status !== 'APPROVED') return false;
    if (filterStatus === 'CHANGES_REQUESTED' && sub.status !== 'CHANGES_REQUESTED' && sub.review_status !== 'CHANGES_REQUESTED') return false;
    if (filterStatus === 'PENDING' && (sub.status === 'APPROVED' || sub.status === 'CHANGES_REQUESTED' || sub.review_status === 'APPROVED' || sub.review_status === 'CHANGES_REQUESTED')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = sub.ticketId?.toLowerCase().includes(q);
      const matchClient = sub.clientCompany?.toLowerCase().includes(q) || sub.clientName?.toLowerCase().includes(q);
      const matchTitle = sub.title?.toLowerCase().includes(q);
      if (!matchTicket && !matchClient && !matchTitle) return false;
    }

    return true;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          Design Deliverables & Output Repository
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: '6px 0 0' }}>
          Explore design work submissions, version iterations, Figma links, and client review decisions.
        </p>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables, ticket, client..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Discipline:</span>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Disciplines</option>
              {DESIGN_SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Review Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Awaiting Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliverables Table / List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading design deliverables...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <Package size={36} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
            No deliverables found
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
            {searchQuery || filterService !== 'ALL' || filterStatus !== 'ALL'
              ? 'Try modifying your search or filter settings.'
              : 'Submitted design files and links will appear here once specialists upload them.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    color: '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '12px 18px', width: '90px' }}>Version</th>
                  <th style={{ padding: '12px 18px', width: '120px' }}>Ticket</th>
                  <th style={{ padding: '12px 18px' }}>Deliverable Title</th>
                  <th style={{ padding: '12px 18px' }}>Client</th>
                  <th style={{ padding: '12px 18px', width: '150px' }}>Review Status</th>
                  <th style={{ padding: '12px 18px', width: '140px' }}>Submitted</th>
                  <th style={{ padding: '12px 18px', width: '160px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, idx) => {
                  const isApproved = sub.status === 'APPROVED' || sub.review_status === 'APPROVED';
                  const isChanges = sub.status === 'CHANGES_REQUESTED' || sub.review_status === 'CHANGES_REQUESTED';
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={sub.id || sub._id || idx}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isEven ? '#FFFFFF' : '#FBFDFE',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F9FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isEven ? '#FFFFFF' : '#FBFDFE')}
                    >
                      {/* Version badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: isApproved ? '#ECFDF5' : isChanges ? '#FEF2F2' : '#EFF6FF',
                            color: isApproved ? '#059669' : isChanges ? '#DC2626' : '#0284C7',
                            border: `1px solid ${isApproved ? '#A7F3D0' : isChanges ? '#FECACA' : '#BFDBFE'}`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          V{sub.version || 1}
                        </span>
                      </td>

                      {/* Ticket */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          onClick={() => navigate(`/design/requests/${sub.ticketId || sub.requestId}`)}
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: '#0284C7',
                            cursor: 'pointer',
                          }}
                        >
                          {sub.ticketId}
                        </span>
                      </td>

                      {/* Title & Service */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                            {sub.title || 'Design Deliverables'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {sub.serviceName || 'UI/Design Sprint'} • {sub.files?.length || 0} file(s)
                          </span>
                        </div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
                          {sub.clientCompany}
                        </div>
                      </td>

                      {/* Review Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {isApproved ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#059669',
                              backgroundColor: '#ECFDF5',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : isChanges ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#DC2626',
                              backgroundColor: '#FEF2F2',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            <AlertCircle size={12} /> Changes Req.
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#DB2777',
                              backgroundColor: '#FDF2F8',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            <Clock size={12} /> In Review
                          </span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDesignDateTime(sub.submitted_at || sub.submittedAt || sub.createdAt)}
                      </td>

                      {/* Action Links */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {sub.external_link && (
                            <a
                              href={sub.external_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Figma project"
                              style={{
                                color: '#8B5CF6',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <PenTool size={15} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/design/requests/${sub.ticketId || sub.requestId}`)}
                            title="Inspect ticket"
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#0284C7',
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>Inspect</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <DesignFilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
