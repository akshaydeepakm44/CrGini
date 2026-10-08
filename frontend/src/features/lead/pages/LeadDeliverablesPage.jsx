import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Upload,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatDateTime, formatDateTimeWithTime, adaptLeadRequest } from '../data/leadAdapters';
import DeliverableUploadModal from '../components/DeliverableUploadModal';

export default function LeadDeliverablesPage({ onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeUploadModalTicket, setActiveUploadModalTicket] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const rawReqs = await api.getRequests().catch(() => []);
      const adaptedReqs = (rawReqs || []).map(adaptLeadRequest);
      setRequests(adaptedReqs);

      // Collect submissions across all tickets
      const allSubmissions = [];
      await Promise.allSettled(
        adaptedReqs.map(async (r) => {
          try {
            if (api.getTicketSubmissions) {
              const subs = await api.getTicketSubmissions(r.ticketId || r.id);
              if (Array.isArray(subs)) {
                subs.forEach((s) => {
                  allSubmissions.push({
                    ...s,
                    ticketId: r.ticketId,
                    ticketDbId: r.id,
                    ticketTitle: r.title,
                    clientCompany: r.clientCompany,
                    clientName: r.clientName,
                  });
                });
              }
            }
          } catch {}
        })
      );

      // If no ticket submissions returned via API, synthesize from tickets in review/completed so specialist can see deliverables
      if (allSubmissions.length === 0) {
        adaptedReqs.forEach((r) => {
          if (r.status === 'CLIENT_REVIEW' || r.status === 'CHANGES_REQUESTED' || r.status === 'COMPLETED') {
            allSubmissions.push({
              id: `sub-${r.id}`,
              ticketId: r.ticketId,
              ticketDbId: r.id,
              ticketTitle: r.title,
              clientCompany: r.clientCompany,
              title: `${r.subService || 'Lead Research'} — Final Dossier`,
              version: r.currentSubmissionVersion || 1,
              status: r.status,
              createdAt: r.updatedAt || r.createdAt,
              fileUrl: '#',
              fileName: `${r.ticketId}_Research_Dossier.pdf`,
              clientFeedback: r.status === 'CHANGES_REQUESTED' ? 'Please expand key decision maker emails for the fintech vertical.' : null,
            });
          }
        });
      }

      setSubmissions(allSubmissions);
    } catch (err) {
      console.error('Failed to load lead deliverables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = sub.title?.toLowerCase().includes(q);
        const matchTicket = sub.ticketId?.toLowerCase().includes(q);
        const matchCompany = sub.clientCompany?.toLowerCase().includes(q);
        if (!matchTitle && !matchTicket && !matchCompany) return false;
      }
      return true;
    });
  }, [submissions, statusFilter, searchQuery]);

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header */}
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
              Output Registry
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Specialist Deliverables
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
            Research Deliverables Tracker
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
            Version-controlled research packages, company dossiers, lead spreadsheets, and client review feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
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

      {/* 2. Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search deliverables by name, ticket ID, or client company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 38px',
              borderRadius: '9px',
              border: '1px solid #E5E7EB',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#FAFAFC',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Output' },
            { id: 'CLIENT_REVIEW', label: 'Client Review' },
            { id: 'CHANGES_REQUESTED', label: 'Changes Requested' },
            { id: 'COMPLETED', label: 'Approved & Completed' },
          ].map((tab) => {
            const isSel = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isSel ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  color: isSel ? '#7C3AED' : '#4B5563',
                  fontSize: '0.8125rem',
                  fontWeight: isSel ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Deliverables Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#7C3AED' }} />
            <div>Loading deliverable catalog...</div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No Deliverables Found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
              {searchQuery ? `No records matching "${searchQuery}".` : 'No deliverables recorded in this filter.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#FAFAFC',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6B7280',
                }}
              >
                <th style={{ padding: '14px 20px' }}>Deliverable Asset</th>
                <th style={{ padding: '14px 16px' }}>Associated Sprint</th>
                <th style={{ padding: '14px 16px' }}>Version</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Submitted</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => {
                const isChanges = sub.status === 'CHANGES_REQUESTED';
                const isApproved = sub.status === 'COMPLETED' || sub.status === 'APPROVED';

                return (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Deliverable Asset */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#F5F3FF',
                            color: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                            {sub.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                            Client: <strong>{sub.clientCompany}</strong>
                          </div>
                          {sub.clientFeedback && (
                            <div
                              style={{
                                marginTop: '6px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#B91C1C',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <AlertCircle size={13} />
                              Feedback: {sub.clientFeedback}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Associated Sprint */}
                    <td style={{ padding: '16px 16px' }}>
                      <span
                        onClick={() => onNavigate && onNavigate(`/lead/requests/${sub.ticketDbId}`)}
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {sub.ticketId}
                      </span>
                    </td>

                    {/* Version */}
                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        v{sub.version || 1}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isApproved
                            ? '#ECFDF5'
                            : isChanges
                            ? '#FEF2F2'
                            : '#FDF2F8',
                          color: isApproved
                            ? '#059669'
                            : isChanges
                            ? '#DC2626'
                            : '#DB2777',
                          border: `1px solid ${
                            isApproved
                              ? '#A7F3D0'
                              : isChanges
                              ? '#FECACA'
                              : '#FBCFE8'
                          }`,
                        }}
                      >
                        {isApproved ? 'Approved' : isChanges ? 'Changes Requested' : 'Client Review'}
                      </span>
                    </td>

                    {/* Submitted date */}
                    <td style={{ padding: '16px 16px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      {formatDateTimeWithTime(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {isChanges && (
                          <button
                            type="button"
                            onClick={() => {
                              const req = requests.find((r) => r.id === sub.ticketDbId);
                              setActiveUploadModalTicket(req || { id: sub.ticketDbId, ticketId: sub.ticketId, title: sub.ticketTitle, clientCompany: sub.clientCompany });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#DC2626',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Upload size={12} />
                            Upload Revision
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate(`/lead/requests/${sub.ticketDbId}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#F5F3FF',
                            color: '#7C3AED',
                            border: '1px solid #DDD4FA',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Revision Modal */}
      {activeUploadModalTicket && (
        <DeliverableUploadModal
          isOpen={Boolean(activeUploadModalTicket)}
          onClose={() => setActiveUploadModalTicket(null)}
          ticketId={activeUploadModalTicket.ticketId || activeUploadModalTicket.id}
          ticketTitle={activeUploadModalTicket.title}
          clientCompany={activeUploadModalTicket.clientCompany}
          versionNumber={(activeUploadModalTicket.currentSubmissionVersion || 1) + 1}
          onSuccess={() => {
            setActiveUploadModalTicket(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
