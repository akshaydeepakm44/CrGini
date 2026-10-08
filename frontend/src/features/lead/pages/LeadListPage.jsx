import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Globe,
  Mail
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptCompanyLead, formatDateTime } from '../data/leadAdapters';
import LeadModal from '../components/LeadModal';
import ResearchLeadRowDrawer from '../components/ResearchLeadRowDrawer';

export default function LeadListPage({ onNavigate }) {
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [inspectingLead, setInspectingLead] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const clients = await api.getOnboardingClients().catch(() => []);
      setCompanies(clients || []);

      // Load leads for all client companies
      let allLeads = [];
      if (clients && clients.length > 0) {
        const leadResults = await Promise.allSettled(
          clients.map(c => api.getCompanyLeads(c.id))
        );
        leadResults.forEach((res, idx) => {
          if (res.status === 'fulfilled' && res.value && Array.isArray(res.value.leads)) {
            const clientName = clients[idx].name;
            const mapped = res.value.leads.map(l => ({
              ...adaptCompanyLead(l),
              clientName,
              companyId: clients[idx].id,
            }));
            allLeads.push(...mapped);
          }
        });
      }
      setLeads(allLeads);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead record?')) return;
    try {
      await api.deleteCompanyLead(leadId);
      setLeads(leads.filter(l => l.id !== leadId));
    } catch (err) {
      alert(err.message || 'Failed to delete lead');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // 1. Company Filter
      if (selectedCompanyId !== 'ALL' && l.companyId !== selectedCompanyId) return false;

      // 2. Status Filter
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchComp = l.company?.toLowerCase().includes(q);
        const matchName = l.name?.toLowerCase().includes(q);
        const matchInd = l.industry?.toLowerCase().includes(q);
        const matchLoc = l.location?.toLowerCase().includes(q);
        if (!matchComp && !matchName && !matchInd && !matchLoc) return false;
      }

      return true;
    });
  }, [leads, selectedCompanyId, statusFilter, searchQuery]);

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Company Leads
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563' }}>
            Central research database of verified prospects across client accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingLead(null);
            setIsModalOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '9px',
            border: 'none',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            fontSize: '0.84375rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
          }}
        >
          <Plus size={16} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
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
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, industry..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '0.84375rem',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Client Account Selector */}
          {companies.length > 0 && (
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.8125rem',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                outline: 'none',
              }}
            >
              <option value="ALL">All Client Accounts</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '0.8125rem',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="RESEARCHED">Researched</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* 3. Lead List Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
          Loading leads database...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>No leads found</div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '4px' }}>
            Click <strong>Add New Lead</strong> to begin recording prospect research.
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Company & Contact</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Industry / Title</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Client Account</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Updated</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id || idx}
                    style={{
                      borderBottom: idx < filteredLeads.length - 1 ? '1px solid #F1F5F9' : 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div
                        onClick={() => setInspectingLead(lead)}
                        style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}
                      >
                        {lead.company || lead.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        {lead.name}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: '0.84375rem', color: '#111827', fontWeight: 500 }}>
                        {lead.title || 'Decision Maker'}
                      </div>
                      {lead.email && (
                        <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#6B7280', marginTop: '2px' }}>
                          {lead.email}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#4B5563' }}>
                      {lead.location || '—'}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '6px' }}>
                        {lead.clientName || 'General'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: lead.status === 'VERIFIED' ? '#ECFDF5' : '#F5F3FF',
                          color: lead.status === 'VERIFIED' ? '#059669' : '#7C3AED',
                          border: lead.status === 'VERIFIED' ? '1px solid #A7F3D0' : '1px solid #DDD4FA',
                        }}
                      >
                        {lead.status === 'VERIFIED' && <CheckCircle2 size={12} />}
                        <span>{lead.status}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#6B7280' }}>
                      {formatDateTime(lead.updatedAt)}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setInspectingLead(lead)}
                          title="View Details"
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280', cursor: 'pointer' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(lead);
                            setIsModalOpen(true);
                          }}
                          title="Edit Lead"
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#6B7280', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          title="Delete Lead"
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLead={editingLead}
        companies={companies}
        onSuccess={loadData}
      />

      {/* Row Drawer Preview */}
      <ResearchLeadRowDrawer
        isOpen={Boolean(inspectingLead)}
        onClose={() => setInspectingLead(null)}
        lead={inspectingLead}
      />
    </div>
  );
}
