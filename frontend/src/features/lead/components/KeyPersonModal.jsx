import React, { useState } from 'react';
import { X, User, Mail, Briefcase, Linkedin, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

export default function KeyPersonModal({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addKeyPerson(companyId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim() || 'Key Executive',
        linkedin: linkedin.trim(),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add key person.');
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
          maxWidth: '460px',
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
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
            Add Key Stakeholder
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Full Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Verified Email <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="email"
              required
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Role / Title
            </label>
            <input
              placeholder="e.g. CTO / Co-Founder"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              LinkedIn URL
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.84375rem', boxSizing: 'border-box' }}
            />
          </div>

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
              {isSubmitting ? 'Adding...' : 'Add Key Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
