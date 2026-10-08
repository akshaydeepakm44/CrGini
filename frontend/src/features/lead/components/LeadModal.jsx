import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Linkedin,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Image,
  Upload,
} from 'lucide-react';
import { api } from '../../../services/api';

export default function LeadModal({
  isOpen,
  onClose,
  initialLead = null,
  companyId = null,
  companies = [],
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    linkedin: '',
    location: '',
    status: 'PENDING',
    notes: '',
    companyId: companyId || '',
    logo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(initialLead && initialLead.id);

  const handleLogoUpload = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, logo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (initialLead) {
      setFormData({
        name: initialLead.name || '',
        title: initialLead.title || '',
        company: initialLead.company || initialLead.lead_company || '',
        email: initialLead.email || '',
        linkedin: initialLead.linkedin || '',
        location: initialLead.location || '',
        status: initialLead.status || 'PENDING',
        notes: initialLead.notes || '',
        companyId: initialLead.companyId || companyId || (companies[0]?.id || ''),
        logo: initialLead.logo || initialLead.logoUrl || '',
      });
    } else {
      setFormData({
        name: '',
        title: '',
        company: '',
        email: '',
        linkedin: '',
        location: '',
        status: 'PENDING',
        notes: '',
        companyId: companyId || (companies[0]?.id || ''),
        logo: '',
      });
    }
    setError('');
  }, [initialLead, companyId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Lead contact name is required.');
      return;
    }

    if (formData.status === 'VERIFIED' && !formData.notes.trim()) {
      setError('A lead cannot be marked VERIFIED without research notes.');
      return;
    }

    const targetCompanyId = formData.companyId || companyId;
    if (!targetCompanyId && !isEditing) {
      setError('Please select a client account to associate this lead with.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.updateCompanyLead(initialLead.id, {
          name: formData.name.trim(),
          title: formData.title.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          linkedin: formData.linkedin.trim(),
          location: formData.location.trim(),
          status: formData.status,
          notes: formData.notes.trim(),
          logo: formData.logo,
        });
      } else {
        await api.addCompanyLead(targetCompanyId, {
          name: formData.name.trim(),
          title: formData.title.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          linkedin: formData.linkedin.trim(),
          location: formData.location.trim(),
          status: formData.status,
          notes: formData.notes.trim(),
          logo: formData.logo,
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save lead record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--cg-font-family, "Inter", sans-serif)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
              {isEditing ? 'Edit Company Lead' : 'Add New Researched Lead'}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
              Only fields supported by the verified database schema are stored.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#EF4444',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Client Company Selection (for new leads if multiple companies) */}
          {!isEditing && companies.length > 0 && !companyId && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Client Account <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.84375rem',
                  outline: 'none',
                }}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Contact Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                required
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Title / Role
              </label>
              <input
                placeholder="e.g. VP Engineering"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Target Organization / Company
              </label>
              <input
                placeholder="e.g. Stripe, Acme Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Location / Region
              </label>
              <input
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Verified Email
              </label>
              <input
                type="email"
                placeholder="sarah@targetcompany.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Company / Brand Logo (PNG, JPG, WebP)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {formData.logo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <img
                    src={formData.logo}
                    alt="Logo Preview"
                    style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '2px' }}
                  />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>
                    Logo Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px dashed #D1D5DB',
                    backgroundColor: '#FAFAFC',
                    color: '#6B7280',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={14} color="#6B7280" />
                  <span>Upload Logo (PNG, JPG, WebP)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Verification Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.84375rem',
                outline: 'none',
              }}
            >
              <option value="PENDING">PENDING (Unverified)</option>
              <option value="RESEARCHED">RESEARCHED (Profile Identified)</option>
              <option value="VERIFIED">VERIFIED (Contact & Signals Confirmed)</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Research & Verification Notes {formData.status === 'VERIFIED' && <span style={{ color: '#EF4444' }}>*</span>}
            </label>
            <textarea
              rows={3}
              placeholder="Verified via direct DNS/SMTP check, company directory, and recent public telemetry..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.84375rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#4B5563', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
