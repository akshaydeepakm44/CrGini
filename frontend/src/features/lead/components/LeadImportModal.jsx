import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Building2,
  ChevronRight,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { api } from '../../../services/api';

export default function LeadImportModal({
  isOpen,
  onClose,
  companies = [],
  selectedCompanyId = '',
  onSuccess,
}) {
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'importing' | 'complete'
  const [targetCompanyId, setTargetCompanyId] = useState(
    selectedCompanyId && selectedCompanyId !== 'ALL'
      ? selectedCompanyId
      : companies[0]?.id || ''
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [duplicatePolicy, setDuplicatePolicy] = useState('skip'); // 'skip' | 'update'
  const [isDragging, setIsDragging] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Import state
  const [importResult, setImportResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      setErrorMessage('Please upload a valid .xlsx, .xls, or .csv spreadsheet file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25 MB limit.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileBase64(e.target.result);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = async (format) => {
    try {
      await api.downloadLeadsTemplate(format);
    } catch (err) {
      alert(err.message || 'Failed to download template.');
    }
  };

  const handleGeneratePreview = async () => {
    if (!targetCompanyId) {
      setErrorMessage('Please select a target client account for this lead import.');
      return;
    }
    if (!fileBase64) {
      setErrorMessage('Please select a spreadsheet file first.');
      return;
    }

    try {
      setIsPreviewLoading(true);
      setErrorMessage('');
      const res = await api.previewLeadsImport(targetCompanyId, {
        fileData: fileBase64,
        filename: selectedFile?.name || 'leads.xlsx',
        mappingOverride: Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
      });

      setPreviewData(res);
      setColumnMapping(res.detectedMapping || {});
      setStep('preview');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to parse and preview spreadsheet.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setStep('importing');
      setErrorMessage('');
      const res = await api.executeLeadsImport(targetCompanyId, {
        fileData: fileBase64,
        filename: selectedFile?.name || 'leads.xlsx',
        mappingOverride: columnMapping,
        duplicatePolicy,
      });

      setImportResult(res);
      setStep('complete');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to execute import.');
      setStep('preview');
    }
  };

  const handleDownloadErrorReport = () => {
    if (!previewData || !previewData.errors || previewData.errors.length === 0) return;
    const csvContent =
      'Row Number,Company / Lead,Error Reason\n' +
      previewData.errors
        .map(
          (e) =>
            `${e.rowNumber || 'N/A'},"${(e.company || '').replace(/"/g, '""')}","${(
              e.error || ''
            ).replace(/"/g, '""')}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `import_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setFileBase64('');
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: step === 'preview' ? '1080px' : '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#111827',
                  fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                }}
              >
                Bulk Lead Import
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                Upload Excel or CSV files with logo URLs to ingest verified leads directly into MinIO storage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FEE2E2',
              color: '#B91C1C',
              fontSize: '0.84375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: UPLOAD & MAP */}
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Target Client Account <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    outline: 'none',
                  }}
                >
                  <option value="">Select a Client Account...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.industry ? `(${c.industry})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Download Ribbon */}
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD4FA',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#7C3AED" />
                  <div>
                    <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#4C1D95' }}>
                      Need the standard format?
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6D28D9' }}>
                      Download pre-formatted columns including optional Company Logo URLs.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #C4B5FD',
                      backgroundColor: '#FFFFFF',
                      color: '#6D28D9',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('csv')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #C4B5FD',
                      backgroundColor: '#FFFFFF',
                      color: '#6D28D9',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} />
                    <span>CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #7C3AED' : '2px dashed #D1D5DB',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#F5F3FF' : '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#EDE9FE',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <Upload size={24} />
                </div>

                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>
                      Drag and drop your spreadsheet here, or <span style={{ color: '#7C3AED' }}>browse</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px' }}>
                      Supports .xlsx, .xls and .csv (Max 25 MB, up to 5,000 leads)
                    </div>
                  </div>
                )}
              </div>

              {/* Duplicate Handling Policy */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Duplicate Leads Policy
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: '#374151' }}>
                    <input
                      type="radio"
                      name="dupPolicy"
                      value="skip"
                      checked={duplicatePolicy === 'skip'}
                      onChange={() => setDuplicatePolicy('skip')}
                    />
                    <span>
                      <strong>Skip Duplicates</strong> (Recommended — protects existing research)
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: '#374151' }}>
                    <input
                      type="radio"
                      name="dupPolicy"
                      value="update"
                      checked={duplicatePolicy === 'update'}
                      onChange={() => setDuplicatePolicy('update')}
                    />
                    <span>
                      <strong>Update Existing Leads</strong> (Overwrites matching domain/email)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION SUMMARY */}
          {step === 'preview' && previewData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metric Counters */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                }}
              >
                <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Rows</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {previewData.summary?.totalRows || 0}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Valid Leads</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>
                    {previewData.summary?.validRows || 0}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Invalid Rows</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>
                    {previewData.summary?.invalidRows || 0}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Duplicates</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>
                    {previewData.summary?.duplicateRows || 0}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD4FA' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Logos Available</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#5B21B6', marginTop: '4px' }}>
                    {previewData.summary?.logosAvailable || 0}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', backgroundColor: '#F1F5F9', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>No Logo URL</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                    {previewData.summary?.logosMissing || 0}
                  </div>
                </div>
              </div>

              {/* Column Mapping Selector (Collapsible or visible) */}
              <details
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '12px 16px',
                }}
              >
                <summary style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                  Custom Column Mapping ({Object.keys(columnMapping).length} detected columns)
                </summary>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  {[
                    { key: 'company', label: 'Company Name' },
                    { key: 'name', label: 'Contact Name' },
                    { key: 'title', label: 'Job Title' },
                    { key: 'email', label: 'Work Email' },
                    { key: 'website', label: 'Website / Domain' },
                    { key: 'linkedin', label: 'LinkedIn URL' },
                    { key: 'location', label: 'Location' },
                    { key: 'logoUrl', label: 'Logo URL' },
                    { key: 'status', label: 'Status' },
                    { key: 'notes', label: 'Research Notes' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280' }}>{label}</label>
                      <select
                        value={columnMapping[key] || ''}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          fontSize: '0.78rem',
                          backgroundColor: '#FFFFFF',
                          marginTop: '2px',
                        }}
                      >
                        <option value="">(None / Ignore)</option>
                        {(previewData.availableColumns || []).map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </details>

              {/* Preview Table */}
              <div
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Sample Rows Preview (First {previewData.previewRows?.length || 0} rows)</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Leads will not be saved until confirmed
                  </span>
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead style={{ backgroundColor: '#F1F5F9', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Row</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Company</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Contact & Title</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Email / Website</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: 700 }}>Logo URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(previewData.previewRows || []).map((r, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: r.isDuplicate ? '#FFFBEB' : !r.isValid ? '#FEF2F2' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 12px', color: '#64748B' }}>#{r.rowNumber}</td>
                          <td style={{ padding: '8px 12px' }}>
                            {r.isDuplicate ? (
                              <span style={{ color: '#B45309', fontWeight: 700, fontSize: '0.72rem' }}>
                                Duplicate
                              </span>
                            ) : r.isValid ? (
                              <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.72rem' }}>
                                Valid
                              </span>
                            ) : (
                              <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.72rem' }}>
                                Invalid
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#111827' }}>
                            {r.company || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#374151' }}>
                            <div>{r.name || '—'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{r.title}</div>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#4B5563' }}>
                            <div>{r.email || '—'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7C3AED' }}>{r.website}</div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {r.logoUrl ? (
                              <span
                                title={r.logoUrl}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#059669',
                                  fontSize: '0.72rem',
                                  backgroundColor: '#ECFDF5',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                <ImageIcon size={12} />
                                <span>URL Attached</span>
                              </span>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row Errors Summary (If any errors exist) */}
              {previewData.errors && previewData.errors.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991B1B' }}>
                      Validation Issues ({previewData.totalErrorsCount || previewData.errors.length} found)
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadErrorReport}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        color: '#B91C1C',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={12} />
                      <span>Download Error Report</span>
                    </button>
                  </div>
                  <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.75rem', color: '#B91C1C' }}>
                    {previewData.errors.slice(0, 10).map((err, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>
                        • <strong>Row {err.rowNumber}:</strong> {err.company ? `(${err.company}) ` : ''}
                        {err.error}
                      </div>
                    ))}
                    {previewData.errors.length > 10 && (
                      <div style={{ fontStyle: 'italic', marginTop: '4px' }}>
                        ... and {previewData.errors.length - 10} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: IMPORTING PROGRESS */}
          {step === 'importing' && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <RefreshCw size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                Importing Leads & Storing Logos in MinIO...
              </h3>
              <p style={{ margin: 0, fontSize: '0.84375rem', color: '#6B7280' }}>
                Fetching company logos with SSRF protections, processing in bounded batches, and updating database.
              </p>
            </div>
          )}

          {/* STEP 4: COMPLETE SUMMARY */}
          {step === 'complete' && importResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: '12px',
                  border: '1px solid #BBF7D0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <Check size={26} />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#14532D' }}>
                  Import Completed Successfully
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#15803D' }}>
                  Import ID: <code style={{ backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>{importResult.summary?.importId?.slice(0, 8)}</code> at {new Date(importResult.summary?.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Results Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                }}
              >
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Created</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                    {importResult.summary?.createdCount || 0}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Updated</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {importResult.summary?.updatedCount || 0}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Skipped (Duplicates)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                    {importResult.summary?.skippedCount || 0}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Failed Rows</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                    {importResult.summary?.failedCount || 0}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD4FA' }}>
                  <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700, textTransform: 'uppercase' }}>Logos in MinIO</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6D28D9', marginTop: '4px' }}>
                    {importResult.summary?.logosStoredMinio || 0}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Logos Failed / None</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
                    {(importResult.summary?.logosFailed || 0) + (importResult.summary?.logosMissing || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          {step === 'upload' && (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '0.84375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={!selectedFile || isPreviewLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !selectedFile || isPreviewLoading ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.84375rem',
                  fontWeight: 700,
                  cursor: !selectedFile || isPreviewLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                }}
              >
                {isPreviewLoading ? (
                  <>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Analyzing Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <span>Preview Leads</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '0.84375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to File</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.84375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Check size={16} />
                  <span>Confirm & Import ({previewData.summary?.validRows || 0} Leads)</span>
                </button>
              </div>
            </>
          )}

          {step === 'complete' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleReset();
                }}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.84375rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done & View Leads
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
