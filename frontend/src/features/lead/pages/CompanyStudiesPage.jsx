import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Building2,
  Search,
  Filter,
  Download,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Eye,
  Plus,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatDateTime } from '../data/leadAdapters';

export default function CompanyStudiesPage({ onNavigate }) {
  const [clients, setClients] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('ALL');
  const [activeStudyModal, setActiveStudyModal] = useState(null);
  const [editingResearchText, setEditingResearchText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const clientList = await api.getOnboardingClients().catch(() => []);
      setClients(clientList || []);

      // Load research dossiers and leads count for each client
      const dossiers = await Promise.allSettled(
        clientList.map(async (client) => {
          let researchData = '';
          let leadsCount = 0;
          let keyPeopleCount = 0;

          try {
            const res = await api.getClientResearch(client.id);
            researchData = res?.research || res?.notes || '';
          } catch {}

          try {
            const leadRes = await api.getCompanyLeads(client.id);
            leadsCount = leadRes?.leads?.length || 0;
            keyPeopleCount = leadRes?.keyPeople?.length || 0;
          } catch {}

          return {
            id: client.id,
            companyName: client.name || 'Account Dossier',
            industry: client.industry || client.domain || 'Technology & B2B',
            website: client.website || `https://${(client.name || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
            researchText: researchData,
            leadsCount,
            keyPeopleCount,
            status: researchData.length > 50 ? 'COMPLETED' : researchData.length > 0 ? 'IN_PROGRESS' : 'PENDING_BRIEF',
            lastUpdated: client.updated_at || client.createdAt || new Date().toISOString(),
          };
        })
      );

      const parsed = dossiers
        .filter((d) => d.status === 'fulfilled')
        .map((d) => d.value);

      setStudies(parsed);
    } catch (err) {
      console.error('Failed to load company studies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveResearch = async () => {
    if (!activeStudyModal) return;
    try {
      setIsSaving(true);
      await api.saveClientResearch(activeStudyModal.id, editingResearchText);
      setStudies((prev) =>
        prev.map((s) =>
          s.id === activeStudyModal.id
            ? {
                ...s,
                researchText: editingResearchText,
                status: editingResearchText.length > 50 ? 'COMPLETED' : 'IN_PROGRESS',
              }
            : s
        )
      );
      setActiveStudyModal((prev) => ({
        ...prev,
        researchText: editingResearchText,
        status: editingResearchText.length > 50 ? 'COMPLETED' : 'IN_PROGRESS',
      }));
      alert('Company study intelligence saved successfully.');
    } catch (err) {
      alert(err.message || 'Failed to save research');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      if (selectedClientFilter !== 'ALL' && study.id !== selectedClientFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = study.companyName.toLowerCase().includes(q);
        const matchInd = study.industry?.toLowerCase().includes(q);
        const matchText = study.researchText?.toLowerCase().includes(q);
        if (!matchName && !matchInd && !matchText) return false;
      }
      return true;
    });
  }, [studies, selectedClientFilter, searchQuery]);

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
              Account Intelligence
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Deep-Dive Dossiers
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
            Company Studies & Dossiers
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
            Comprehensive organizational briefs, target market dynamics, and competitive profiles prepared for client sprints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/lead/research')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Plus size={16} />
            Launch Research Workspace
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
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
            placeholder="Search company studies by name, industry, or dossier notes..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280' }}>Account:</span>
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '9px',
              border: '1px solid #E5E7EB',
              fontSize: '0.84rem',
              color: '#374151',
              backgroundColor: '#FAFAFC',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Accounts ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Study Dossier Grid */}
      {loading ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            color: '#6B7280',
          }}
        >
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#7C3AED' }} />
          <div>Loading company study dossiers...</div>
        </div>
      ) : filteredStudies.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
          }}
        >
          <FileText size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            No Studies Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 16px' }}>
            {searchQuery ? `No dossiers matching "${searchQuery}".` : 'No company studies in this filter.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/lead/research')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Create Company Study
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredStudies.map((study) => {
            const hasResearch = study.researchText && study.researchText.trim().length > 0;
            const statusConfig =
              study.status === 'COMPLETED'
                ? { label: 'Study Complete', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
                : study.status === 'IN_PROGRESS'
                ? { label: 'In Progress', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }
                : { label: 'Pending Research', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };

            return (
              <div
                key={study.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#DDD4FA';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                }}
              >
                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD4FA',
                          color: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.125rem',
                        }}
                      >
                        {study.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1.3,
                          }}
                        >
                          {study.companyName}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                          {study.industry}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: statusConfig.color,
                        backgroundColor: statusConfig.bg,
                        border: `1px solid ${statusConfig.border}`,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Research Preview */}
                  <div
                    style={{
                      backgroundColor: '#FAFAFC',
                      borderRadius: '10px',
                      border: '1px solid #F1F5F9',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      minHeight: '84px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#6B7280',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={12} color="#7C3AED" />
                      Executive Summary & Findings
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: hasResearch ? '#374151' : '#9CA3AF',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontStyle: hasResearch ? 'normal' : 'italic',
                      }}
                    >
                      {hasResearch
                        ? study.researchText
                        : 'No intelligence notes saved yet. Click inspect to add executive profile and market notes.'}
                    </div>
                  </div>

                  {/* Stats Pill Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '18px',
                      fontSize: '0.8125rem',
                      color: '#4B5563',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Building2 size={14} color="#7C3AED" />
                      <span>
                        <strong>{study.leadsCount}</strong> Researched Leads
                      </span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={14} color="#059669" />
                      <span>
                        <strong>{study.keyPeopleCount}</strong> Decision Makers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    Updated {formatDateTime(study.lastUpdated)}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStudyModal(study);
                        setEditingResearchText(study.researchText || '');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #DDD4FA',
                        backgroundColor: '#F5F3FF',
                        color: '#7C3AED',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={14} />
                      Inspect Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate(`/lead/research`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                        color: '#374151',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Workspace
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Inspect & Edit Study Modal */}
      {activeStudyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveStudyModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)',
              border: '1px solid #E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '22px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#F5F3FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {activeStudyModal.companyName.charAt(0)}
                </div>
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#111827',
                    }}
                  >
                    {activeStudyModal.companyName} — Study Dossier
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '2px' }}>
                    {activeStudyModal.industry} • Account ID: {activeStudyModal.id}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveStudyModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Company Intelligence & Market Analysis Notes
                </label>
                <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: '#6B7280' }}>
                  Document client target audience, value propositions, key objections, tech stack, and strategic insights.
                </p>
                <textarea
                  rows={10}
                  value={editingResearchText}
                  onChange={(e) => setEditingResearchText(e.target.value)}
                  placeholder="Enter strategic company research notes, market sizing, ICP parameters, and competitor insights..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: '#1F2937',
                    backgroundColor: '#FAFAFC',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Account Quick Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                    Researched Target Leads
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                    {activeStudyModal.leadsCount} Companies
                  </div>
                </div>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                    Verified Decision Makers
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                    {activeStudyModal.keyPeopleCount} Executives
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStudyModal(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveResearch}
                  disabled={isSaving}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Saving Dossier...' : 'Save Research Dossier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
