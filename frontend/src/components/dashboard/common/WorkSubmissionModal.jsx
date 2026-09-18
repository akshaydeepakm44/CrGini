import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef(null);

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
    ticket ? `${ticket.title} - Deliverables V${nextVersion}` : `Deliverables V${nextVersion}`
  );
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [showAddUrlFile, setShowAddUrlFile] = useState(false);
  const [error, setError] = useState('');

  const isRevision = nextVersion > 1;

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    uploadedFiles.forEach(file => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [
          ...prev,
          {
            name: file.name,
            url: event.target.result, // Data URL for download
            size: sizeStr,
            type: file.type || 'application/octet-stream'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrlFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setFiles([
      ...files,
      {
        name: newFileName.trim(),
        url: newFileUrl.trim() || `https://creativegini.com/files/${newFileName.trim()}`,
        size: 'External',
        type: 'application/octet-stream'
      }
    ]);
    setNewFileName('');
    setNewFileUrl('');
    setShowAddUrlFile(false);
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
      setError('Submission description is required.');
      return;
    }
    if (files.length === 0 && !externalLink.trim()) {
      setError('Please upload at least one deliverable file or provide an external link.');
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
              Submit Completed Work
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: '#8fa0b5' }}>Ticket: </span>
                <strong style={{ color: '#00D9FF', fontFamily: 'monospace' }}>{ticket?.ticketId}</strong>
              </div>
              <div>
                <span style={{ color: '#8fa0b5' }}>Submission Version: </span>
                <span
                  style={{
                    background: isRevision ? 'rgba(255, 176, 0, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                    color: isRevision ? '#FFB000' : '#00D9FF',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}
                >
                  V{nextVersion}
                </span>
              </div>
            </div>
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
                  Files {files.length > 0 && `(${files.length})`}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="portal-btn-secondary"
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#00D9FF',
                      borderColor: 'rgba(0, 217, 255, 0.3)'
                    }}
                  >
                    <Upload size={13} /> Upload Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUrlFile(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8fa0b5',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Plus size={13} /> Add URL
                  </button>
                </div>
              </div>

              {files.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '18px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: '#8fa0b5',
                    fontSize: '0.82rem'
                  }}
                >
                  <Upload size={22} style={{ margin: '0 auto 6px', color: '#00D9FF', opacity: 0.8 }} />
                  <div>Click to <strong>Upload Files</strong> from your device (PDF, XLSX, ZIP, PNG, etc.)</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <FileText size={16} color="#00D9FF" />
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#8fa0b5', flexShrink: 0 }}>({file.size})</span>
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
                </div>
              )}

              {showAddUrlFile && (
                <div
                  style={{
                    padding: '10px',
                    background: 'rgba(0, 217, 255, 0.04)',
                    border: '1px dashed rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '8px' }}>
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
                      onClick={() => setShowAddUrlFile(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="portal-btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={handleAddUrlFile}
                    >
                      Attach
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* External Link */}
            <div>
              <label className="portal-form-label">
                External Link <span style={{ color: '#8fa0b5', fontWeight: 'normal' }}>(Optional)</span>
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

            {/* Notes */}
            <div>
              <label className="portal-form-label">
                Notes <span style={{ color: '#8fa0b5', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <textarea
                className="portal-form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for client review..."
              />
            </div>
          </div>

          <div className="portal-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                color: isRevision ? '#FFF' : '#040C12',
                fontWeight: '700'
              }}
            >
              {submitting ? 'Submitting Work...' : 'Submit Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
