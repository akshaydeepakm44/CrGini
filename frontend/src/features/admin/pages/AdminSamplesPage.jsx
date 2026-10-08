import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Upload,
  Trash2,
  Edit2,
  FileText,
  Users,
  Building2,
  Presentation,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AdminSamplesPage() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('PUBLISHED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSamples = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSamples();
      setSamples(data.samples || []);
    } catch (err) {
      setError(err.message || 'Failed to load sample showcases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  const handleToggleStatus = async (sample) => {
    const updatedStatus = sample.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.updateAdminSample(sample.id, { status: updatedStatus });
      setSuccessMsg(`Showcase "${sample.title}" status updated to ${updatedStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadSamples();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleCreateSample = async (e) => {
    e.preventDefault();
    if (!newSlug || !newTitle || !newCompany) return;

    setIsSubmitting(true);
    try {
      await api.createAdminSample({
        slug: newSlug,
        title: newTitle,
        companyName: newCompany,
        description: newDesc,
        status: newStatus,
        companyStudy: {
          company: newCompany,
          industry: 'Enterprise Software & Services',
          businessOverview: `Curated overview for ${newCompany}.`,
          marketPosition: 'Strong vertical presence with strategic scale opportunities.',
          keyObservations: 'High demand for specialized outsourced acceleration.',
          potentialOpportunity: 'Targeted account acquisition and sales enablement.',
        },
        leads: [
          {
            id: 'sample-lead-1',
            name: 'Sample Decision Maker',
            title: 'VP of Technology',
            company: `${newCompany} Partner`,
            shortSummary: 'Oversees technology evaluations and strategic vendor engagements.',
            industry: 'Technology',
            location: 'New York, NY',
          }
        ],
        leadStudies: [
          {
            id: 'study-1',
            leadName: 'Sample Decision Maker',
            role: 'VP of Technology',
            company: `${newCompany} Partner`,
            whyRelevant: 'Actively vetting acceleration partners for Q4 delivery.',
            observedContext: 'Modernizing internal operational workflows.',
            potentialOpportunity: 'Strategic audit and proof-of-concept deployment.',
            suggestedApproach: 'Highlight peer success stories and delivery SLAs.',
          }
        ],
      });

      setShowCreateModal(false);
      setNewSlug('');
      setNewTitle('');
      setNewCompany('');
      setNewDesc('');
      setSuccessMsg('Sample showcase created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadSamples();
    } catch (err) {
      setError(err.message || 'Failed to create sample showcase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSample = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the sample showcase "${title}"?`)) return;

    try {
      await api.deleteAdminSample(id);
      setSuccessMsg(`Deleted showcase "${title}".`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadSamples();
    } catch (err) {
      setError(err.message || 'Failed to delete sample');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Compass size={22} color="#2563EB" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Sample Intelligence Showcases
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Manage curated public sample dashboards sent via email outreach to demonstrate CreativeGini deliverables.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}
        >
          <Plus size={16} />
          <span>New Sample Showcase</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sample Showcases Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading showcase collections...</p>
        </div>
      ) : samples.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px', textAlign: 'center' }}>
          <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>No sample showcases created yet</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '16px' }}>
            Create your first sample collection to share with potential prospects.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '10px 18px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Create Showcase
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {samples.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: item.status === 'PUBLISHED' ? '#ECFDF5' : '#F1F5F9',
                      color: item.status === 'PUBLISHED' ? '#059669' : '#64748B',
                      border: `1px solid ${item.status === 'PUBLISHED' ? '#A7F3D0' : '#E2E8F0'}`,
                    }}
                  >
                    {item.status}
                  </span>

                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                    /samples/{item.slug}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginBottom: '10px' }}>
                  Organization: {item.companyName}
                </div>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '18px' }}>
                  {item.description || 'Curated showcase dataset.'}
                </p>

                {/* Intelligence Sections Summary */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0' }}>
                    🏢 Company Study
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0' }}>
                    👥 {item.leads?.length || 0} Leads
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0' }}>
                    📄 {item.leadStudies?.length || 0} Lead Studies
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0' }}>
                    📊 {item.pitchDeck?.assetKey ? 'Pitch Deck Active' : 'No Deck'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <a
                  href={`/samples/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: '#2563EB',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Eye size={14} />
                  <span>Public View</span>
                  <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleStatus(item)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: item.status === 'PUBLISHED' ? '#FFFBEB' : '#ECFDF5',
                      color: item.status === 'PUBLISHED' ? '#D97706' : '#059669',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDeleteSample(item.id, item.title)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Delete Showcase"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Create New Sample Showcase
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Configure a dedicated showcase slug and company title for prospect demonstration.
            </p>

            <form onSubmit={handleCreateSample}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Public Slug (URL path)
                </label>
                <input
                  type="text"
                  placeholder="e.g. acme-corp"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Will be available at /samples/{newSlug || 'your-slug'}</span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Showcase Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp Intelligence Showcase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Target Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description / Subtitle
                </label>
                <textarea
                  placeholder="Short description of this intelligence showcase..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
