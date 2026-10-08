import React, { useState, useEffect } from 'react';
import {
  Package,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { BOOST_SERVICES } from '../data/boostServiceData';
import { formatBoostDateTime } from '../data/boostAdapters';

export default function BoostDeliverablesPage({ requests = [], onNavigate }) {
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect deliverables from all requests
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
              requestId: r.id,
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
          return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
        });
        setSubmissionsList(flattened);
      } catch (err) {
        console.error('Failed to load deliverables:', err);
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

  // Filter deliverables
  const filteredSubmissions = submissionsList.filter((sub) => {
    if (filterService !== 'ALL' && sub.serviceSlug !== filterService) return false;

    if (filterStatus === 'APPROVED' && sub.status !== 'APPROVED' && !sub.approved) return false;
    if (filterStatus === 'CHANGES_REQUESTED' && sub.status !== 'CHANGES_REQUESTED' && !sub.changesRequested) return false;
    if (filterStatus === 'PENDING' && (sub.status === 'APPROVED' || sub.status === 'CHANGES_REQUESTED')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = sub.ticketId?.toLowerCase().includes(q);
      const matchClient = sub.clientCompany?.toLowerCase().includes(q) || sub.clientName?.toLowerCase().includes(q);
      const matchNotes = sub.notes?.toLowerCase().includes(q);
      if (!matchTicket && !matchClient && !matchNotes) return false;
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
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          Boost Deliverables & Version Registry
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#6B7280',
            margin: '6px 0 0',
          }}
        >
          Master inventory of all creative packages, strategic decks, and deliverable versions submitted to clients.
        </p>
      </div>

      {/* Filter Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Service filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Service:</span>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#111827',
                outline: 'none',
              }}
            >
              <option value="ALL">All Services</option>
              {BOOST_SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Review Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#111827',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Awaiting Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables, notes, client..."
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Deliverables List or Empty State */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
          Loading deliverables across tickets...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '54px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <Package size={36} color="#9CA3AF" />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
            No deliverables found
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280', maxWidth: '440px' }}>
            When Boost specialists submit deliverable packages for strategic plans, content, posters, videos, ads, or DevRel, they will appear here with version tracking.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredSubmissions.map((sub, idx) => {
            const isApproved = sub.status === 'APPROVED' || sub.approved === true;
            const isChanges = sub.status === 'CHANGES_REQUESTED' || Boolean(sub.changesRequested);
            const isPending = !isApproved && !isChanges;

            let files = [];
            if (Array.isArray(sub.files)) files = sub.files;
            else if (sub.file_attachments && Array.isArray(sub.file_attachments)) files = sub.file_attachments;

            let links = [];
            if (Array.isArray(sub.deliverableLinks)) links = sub.deliverableLinks;
            else if (sub.links && Array.isArray(sub.links)) links = sub.links;
            else if (typeof sub.deliverableLinks === 'string') links = [sub.deliverableLinks];

            return (
              <div
                key={sub.id || sub._id || idx}
                onClick={() => onNavigate(`/boost/requests/${sub.ticketId}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '20px 24px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C4B5FD';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>
                        {sub.ticketId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#EDE9FE',
                          color: '#6D28D9',
                        }}
                      >
                        VERSION {sub.version || 1}
                      </span>
                      {sub.serviceName && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: sub.serviceBg || '#F5F3FF',
                            color: sub.serviceColor || '#7C3AED',
                          }}
                        >
                          {sub.serviceName}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
                      {sub.clientCompany} ({sub.clientName})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      Submitted {formatBoostDateTime(sub.createdAt || sub.created_at)}
                    </div>
                  </div>

                  {/* Review Badge & Jump to ticket */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isApproved && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#ECFDF5',
                          color: '#059669',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Approved
                      </span>
                    )}
                    {isChanges && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid #FECACA',
                        }}
                      >
                        <AlertCircle size={13} />
                        Changes Requested
                      </span>
                    )}
                    {isPending && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#FDF2F8',
                          color: '#DB2777',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid #FBCFE8',
                        }}
                      >
                        <Clock size={13} />
                        Under Client Review
                      </span>
                    )}

                  </div>
                </div>

                {/* Notes */}
                {sub.notes && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      backgroundColor: '#F9FAFB',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #F3F4F6',
                      lineHeight: 1.5,
                      marginBottom: '10px',
                    }}
                  >
                    {sub.notes}
                  </div>
                )}

                {/* Attached files and links */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#F5F3FF',
                        border: '1px solid #DDD6FE',
                        color: '#7C3AED',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={12} />
                      <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link}
                      </span>
                    </a>
                  ))}

                  {files.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.75rem',
                        color: '#374151',
                      }}
                    >
                      <FileText size={12} color="#7C3AED" />
                      <span>{f.name || `File-${fIdx + 1}`}</span>
                      {f.dataUrl && (
                        <a
                          href={f.dataUrl}
                          download={f.name || 'deliverable'}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#7C3AED', marginLeft: '4px' }}
                        >
                          <Download size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
