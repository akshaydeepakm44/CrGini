import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Linkedin,
  Building2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Filter,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { api } from '../../../services/api';
import KeyPersonModal from '../components/KeyPersonModal';
import { formatDateTime } from '../data/leadAdapters';

export default function KeyPeoplePage({ onNavigate }) {
  const [people, setPeople] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetCompanyIdForAdd, setTargetCompanyIdForAdd] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const clientList = await api.getOnboardingClients().catch(() => []);
      setClients(clientList || []);

      let allKeyPeople = [];
      if (clientList && clientList.length > 0) {
        const results = await Promise.allSettled(
          clientList.map(async (client) => {
            try {
              const res = await api.getCompanyLeads(client.id);
              if (res && Array.isArray(res.keyPeople)) {
                return res.keyPeople.map((kp) => ({
                  ...kp,
                  companyName: client.name || 'Account Partner',
                  companyId: client.id,
                }));
              }
            } catch {}
            return [];
          })
        );

        results.forEach((r) => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) {
            allKeyPeople.push(...r.value);
          }
        });
      }

      setPeople(allKeyPeople);
    } catch (err) {
      console.error('Failed to load key people:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this decision maker profile?')) return;
    try {
      await api.deleteKeyPerson(id);
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete key person');
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (selectedClientFilter !== 'ALL' && p.companyId !== selectedClientFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchRole = p.role?.toLowerCase().includes(q);
        const matchEmail = p.email?.toLowerCase().includes(q);
        const matchCompany = p.companyName?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchEmail && !matchCompany) return false;
      }
      return true;
    });
  }, [people, selectedClientFilter, searchQuery]);

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
              Executive Directory
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Verified Decision Makers
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
            Key People & Stakeholders
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: '#4B5563' }}>
            Direct directory of researched enterprise executives, budget holders, and influencers for target outreach.
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
            onClick={() => {
              if (clients.length === 0) {
                alert('No client accounts available. Please ensure accounts exist.');
                return;
              }
              setTargetCompanyIdForAdd(selectedClientFilter !== 'ALL' ? selectedClientFilter : clients[0].id);
              setIsAddModalOpen(true);
            }}
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
            Add Decision Maker
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
            placeholder="Search decision makers by name, job title, email, or company..."
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
            <option value="ALL">All Client Accounts ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Table / Directory Content */}
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
            <div>Loading executive directory...</div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No Decision Makers Found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 16px' }}>
              {searchQuery
                ? `No people matching "${searchQuery}".`
                : 'No key people have been added yet for this account.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (clients.length > 0) {
                  setTargetCompanyIdForAdd(clients[0].id);
                  setIsAddModalOpen(true);
                }
              }}
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
              Add First Decision Maker
            </button>
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
                <th style={{ padding: '14px 20px' }}>Name & Title</th>
                <th style={{ padding: '14px 16px' }}>Client Account</th>
                <th style={{ padding: '14px 16px' }}>Contact Email</th>
                <th style={{ padding: '14px 16px' }}>Social Profile</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => {
                const initials = (person.name || 'KP')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={person.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Name & Title */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#EDE9FE',
                            color: '#6D28D9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                            {person.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#4B5563', marginTop: '2px' }}>
                            {person.role || 'Executive'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Client Account */}
                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#6B7280" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                          {person.companyName}
                        </span>
                      </div>
                    </td>

                    {/* Contact Email */}
                    <td style={{ padding: '16px 16px' }}>
                      {person.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.84rem', color: '#374151', fontFamily: 'monospace' }}>
                            {person.email}
                          </span>
                          <button
                            type="button"
                            title="Copy email address"
                            onClick={() => copyToClipboard(person.email, person.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '3px',
                              color: copiedId === person.id ? '#10B981' : '#9CA3AF',
                              borderRadius: '4px',
                            }}
                          >
                            {copiedId === person.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>—</span>
                      )}
                    </td>

                    {/* Social Profile */}
                    <td style={{ padding: '16px 16px' }}>
                      {person.linkedin ? (
                        <a
                          href={
                            person.linkedin.startsWith('http')
                              ? person.linkedin
                              : `https://${person.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#0A66C2',
                            textDecoration: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                          }}
                        >
                          <Linkedin size={13} />
                          LinkedIn
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>Not provided</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(person.id)}
                        title="Delete decision maker"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          padding: '6px',
                          borderRadius: '6px',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Key Person Modal */}
      {isAddModalOpen && (
        <KeyPersonModal
          isOpen={isAddModalOpen}
          companyId={targetCompanyIdForAdd}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
