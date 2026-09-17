import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Link,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function WorkSubmissionModal({
  isOpen,
  ticket,
  nextVersion = 1,
  onClose,
  onSubmit,
  isSubmitting = false,
  loading = false
}) {
  // Guard: NEVER render if isOpen is explicitly false or ticket is null
  if (isOpen !== undefined && !isOpen) return null;
  if (!ticket) return null;

  const submitting = isSubmitting || loading;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [title, setTitle] = useState(
    ticket ? `${ticket.title} - Deliverables v${nextVersion}` : `Deliverables v${nextVersion}`
  );
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([
    {
      name: `${ticket?.ticketId || 'CG-ticket'}-deliverables-v${nextVersion}.${ticket?.serviceType === 'COMPANY_LEAD' ? 'xlsx' : ticket?.serviceType === 'LANDING_PAGE' ? 'zip' : 'pdf'}`,
      url: `https://creativegini.com/files/${ticket?.ticketId || 'CG'}-v${nextVersion}-deliverables.file`,
      size: '2.8 MB',
      type: ticket?.serviceType === 'COMPANY_LEAD' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
    }
  ]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [showAddFile, setShowAddFile] = useState(false);
  const [error, setError] = useState('');

  const isRevision = nextVersion > 1;

  const handleAddFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const ext = newFileName.split('.').pop().toLowerCase();
    const typeMap = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      zip: 'application/zip',
      png: 'image/png',
      jpg: 'image/jpeg'
    };
    setFiles([
      ...files,
      {
        name: newFileName.trim(),
        url: newFileUrl.trim() || `https://creativegini.com/files/${newFileName.trim()}`,
        size: '1.5 MB',
        type: typeMap[ext] || 'application/octet-stream'
      }
    ]);
    setNewFileName('');
    setNewFileUrl('');
    setShowAddFile(false);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Submission title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a detailed description / summary of the deliverables.');
      return;
    }
    if (files.length === 0 && !externalLink.trim()) {
      setError('Please provide at least one deliverable file or external link.');
      return;
    }

    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      files,
      externalLink: externalLink.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div
        className="portal-modal-card"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="portal-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: isRevision ? 'rgba(255, 176, 0, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                  color: isRevision ? '#FFB000' : '#00D9FF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700'
                }}
              >
                {isRevision ? `Submission Revision v${nextVersion}` : `Submission Version v1`}
              </span>
              <span style={{ color: '#8fa0b5', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {ticket?.ticketId}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '6px', marginBottom: 0, color: '#FFFFFF' }}>
              {isRevision ? 'Submit Revised Work to Client' : 'Submit Completed Work to Client'}
            </h3>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8fa0b5' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="portal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Submission Title */}
            <div>
              <label className="portal-form-label">Submission Title *</label>
              <input
                type="text"
                className="portal-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 50 Verified European SaaS Leads with CTO Contacts"
                required
              />
            </div>

            {/* Description / Summary */}
            <div>
              <label className="portal-form-label">Deliverable Summary & Scope Completed *</label>
              <textarea
                className="portal-form-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what was researched, engineered, or designed. Detail how the client requirements were fulfilled..."
                required
              />
            </div>

            {/* Deliverable Files List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="portal-form-label" style={{ margin: 0 }}>
                  Deliverable Files ({files.length})
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddFile(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00D9FF',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Add File
                </button>
              </div>

              {files.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(4, 12, 18, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <FileText size={16} color="#00D9FF" />
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#8fa0b5' }}>({file.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Remove file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {showAddFile && (
                <div
                  style={{
                    padding: '10px',
                    background: 'rgba(0, 217, 255, 0.04)',
                    border: '1px dashed rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="File name (e.g. leads-report.xlsx)"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                    />
                    <input
                      type="url"
                      className="portal-form-input"
                      placeholder="File URL or download path"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="portal-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => setShowAddFile(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="portal-btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={handleAddFile}
                    >
                      Attach
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Optional External Collaboration Link */}
            <div>
              <label className="portal-form-label">
                External Collaboration Link <span style={{ color: '#8fa0b5', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  className="portal-form-input"
                  style={{ paddingLeft: '34px' }}
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="e.g. https://docs.google.com/spreadsheets/... or Figma / Loom URL"
                />
                <Link
                  size={16}
                  color="#8fa0b5"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="portal-form-label">
                Notes for Client <span style={{ color: '#8fa0b5', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <input
                type="text"
                className="portal-form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Next steps for implementation or verification guidelines..."
              />
            </div>
          </div>

          <div className="portal-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#8fa0b5' }}>
              Submitting sends this work directly to the client for review.
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="portal-btn-primary"
                disabled={submitting}
                style={{
                  background: isRevision
                    ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #00D9FF 0%, #0099ff 100%)',
                  color: isRevision ? '#FFF' : '#040C12'
                }}
              >
                {submitting
                  ? 'Submitting Work...'
                  : isRevision
                  ? `Submit Revision v${nextVersion} for Review`
                  : 'Submit Work to Client for Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
