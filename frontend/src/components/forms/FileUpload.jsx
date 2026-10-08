import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

/**
 * Reusable FileUpload Component
 * Drag-and-drop zone with file type validation, size checks, and preview list
 */
export default function FileUpload({
  files = [],
  onChange,
  accept = '.pdf,.docx,.mp4,.png,.jpg,.jpeg,.zip',
  maxSizeMB = 50,
  maxFiles = 5,
  disabled = false,
  className = '',
  style = {},
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFiles = (newFiles) => {
    setErrorMessage('');
    const validList = [...files];

    for (const file of Array.from(newFiles)) {
      if (validList.length >= maxFiles) {
        setErrorMessage(`Maximum ${maxFiles} files allowed.`);
        break;
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setErrorMessage(`File "${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB.`);
        continue;
      }

      // Read file as Base64 Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileObj = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: formatFileSize(file.size),
          sizeBytes: file.size,
          type: file.type || 'application/octet-stream',
          url: e.target.result,
        };

        if (onChange) {
          onChange([...validList, fileObj]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (fileId) => {
    if (onChange) {
      onChange(files.filter((f) => f.id !== fileId));
    }
  };

  return (
    <div className={`cg-file-upload ${className}`} style={{ width: '100%', ...style }}>
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--cg-purple-500)' : 'var(--cg-border)'}`,
          backgroundColor: isDragging ? 'var(--cg-purple-50)' : '#FFFFFF',
          borderRadius: 'var(--cg-radius-lg)',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--cg-transition-fast)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--cg-purple-50)',
            color: 'var(--cg-purple-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UploadCloud size={24} />
        </div>

        <div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cg-text-primary)' }}>
            Click to upload
          </span>{' '}
          <span style={{ fontSize: '0.875rem', color: 'var(--cg-text-secondary)' }}>
            or drag and drop
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--cg-text-muted)' }}>
          PDF, DOCX, MP4, PNG, JPG or ZIP (up to {maxSizeMB}MB)
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--cg-coral-600)',
            fontSize: '0.75rem',
            marginTop: '8px',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {files && files.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((file) => (
            <div
              key={file.id || file.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--cg-border-light)',
                borderRadius: 'var(--cg-radius-md)',
                boxShadow: 'var(--cg-shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <File size={18} style={{ color: 'var(--cg-purple-600)', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '0.84375rem',
                    fontWeight: 500,
                    color: 'var(--cg-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '280px',
                  }}
                >
                  {file.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--cg-text-muted)' }}>
                  ({file.size})
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cg-coral-500)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
