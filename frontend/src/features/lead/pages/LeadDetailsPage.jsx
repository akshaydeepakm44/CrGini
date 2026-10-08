import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Linkedin,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Plus,
  Trash2,
  Edit2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../services/api';
import { adaptCompanyLead, formatDateTime } from '../data/leadAdapters';
import LeadModal from '../components/LeadModal';
import KeyPersonModal from '../components/KeyPersonModal';

export default function LeadDetailsPage({ onNavigate }) {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [keyPeople, setKeyPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddKeyPersonOpen, setIsAddKeyPersonOpen] = useState(false);

  const loadLead = async () => {
    try {
      setLoading(true);
      setError('');
      // Find lead across company endpoints or my-company lead detail
      const res = await api.getMyCompanyLeadDetail(leadId).catch(async () => {
        // Fallback for specialist finding lead
        return null;
      });

      if (res && res.lead) {
        setLead(adaptCompanyLead(res.lead));
        setKeyPeople(res.keyPeople || []);
      } else {
        // Load through client onboarding leads
        const clients = await api.getOnboardingClients();
        let foundLead = null;
        let foundKp = [];
        for (const c of clients) {
          const lRes = await api.getCompanyLeads(c.id).catch(() => null);
          if (lRes && lRes.leads) {
            const match = lRes.leads.find(l => String(l.id) === String(leadId));
            if (match) {
              foundLead = { ...adaptCompanyLead(match), companyId: c.id, clientName: c.name };
              foundKp = lRes.keyPeople || [];
              break;
            }
          }
        }
        if (foundLead) {
          setLead(foundLead);
          setKeyPeople(foundKp);
        } else {
          setError('Lead record not found.');
        }
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
      setError(err.message || 'Failed to load lead profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) loadLead();
  }, [leadId]);

  const handleDeleteKeyPerson = async (kpId) => {
    if (!window.confirm('Delete this key person?')) return;
    try {
      await api.deleteKeyPerson(kpId);
      setKeyPeople(keyPeople.filter(k => k.id !== kpId));
    } catch (err) {
      alert(err.message || 'Failed to delete key person');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading lead dossier...</div>;
  }

  if (error || !lead) {
    return (
      <div style={{ padding: '36px', maxWidth: '800px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => onNavigate('/lead/leads')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Lead List</span>
        </button>
        <div style={{ padding: '24px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#EF4444' }}>
          {error || 'Lead not found.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 36px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/lead/leads')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#6B7280',
          cursor: 'pointer',
          fontSize: '0.84375rem',
          fontWeight: 600,
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Lead Database</span>
      </button>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              {(lead.company || lead.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#111827' }}>
                {lead.company || lead.name}
              </h2>
              <div style={{ fontSize: '0.84375rem', color: '#6B7280', marginTop: '2px' }}>
                Contact: <strong>{lead.name}</strong> • {lead.title || 'Decision Maker'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: lead.status === 'VERIFIED' ? '#ECFDF5' : '#F5F3FF',
                color: lead.status === 'VERIFIED' ? '#059669' : '#7C3AED',
                border: lead.status === 'VERIFIED' ? '1px solid #A7F3D0' : '1px solid #DDD4FA',
              }}
            >
              {lead.status}
            </span>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Edit2 size={14} />
              <span>Edit Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Contact Information & Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Research Notes & Telemetry */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Research Telemetry & Verification Notes
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {lead.notes || 'No detailed verification notes recorded yet for this lead.'}
          </div>
        </div>

        {/* Signals */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '0.875rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Verified Signals
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84375rem' }}>
            {lead.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#6B7280" />
                <span style={{ fontFamily: 'monospace', color: '#111827' }}>{lead.email}</span>
              </div>
            )}
            {lead.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Linkedin size={16} color="#0A66C2" />
                <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0A66C2', textDecoration: 'none', fontWeight: 600 }}>
                  LinkedIn Profile
                </a>
              </div>
            )}
            {lead.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#6B7280" />
                <span>{lead.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key People Section */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>
              Key People / Stakeholders ({keyPeople.length})
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
              Associated decision makers for this account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddKeyPersonOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #DDD4FA',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Add Key Person</span>
          </button>
        </div>

        {keyPeople.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8125rem', backgroundColor: '#FAFAFC', borderRadius: '8px' }}>
            No key people added yet. Click <strong>Add Key Person</strong> to record stakeholders.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {keyPeople.map((kp) => (
              <div
                key={kp.id}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{kp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{kp.role}</div>
                  {kp.email && (
                    <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#7C3AED', marginTop: '2px' }}>
                      {kp.email}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteKeyPerson(kp.id)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      <LeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialLead={lead}
        onSuccess={loadLead}
      />

      {/* Add Key Person Modal */}
      <KeyPersonModal
        isOpen={isAddKeyPersonOpen}
        onClose={() => setIsAddKeyPersonOpen(false)}
        companyId={lead.companyId}
        onSuccess={loadLead}
      />
    </div>
  );
}
