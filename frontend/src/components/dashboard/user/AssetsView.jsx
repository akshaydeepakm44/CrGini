import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Film,
  FileText,
  FileSpreadsheet,
  Archive,
  File,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Calendar,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Building
} from 'lucide-react';
import { api } from '../../../services/api';

/**
 * Determine high-level category of an asset
 */
const getAssetCategory = (asset) => {
  const mime = (asset.mimeType || '').toLowerCase();
  const name = (asset.fileName || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.gif') ||
    name.endsWith('.svg')
  ) {
    return 'image';
  }

  if (
    mime.startsWith('video/') ||
    name.endsWith('.mp4') ||
    name.endsWith('.mov') ||
    name.endsWith('.webm') ||
    name.endsWith('.mkv')
  ) {
    return 'video';
  }

  return 'document';
};

/**
 * Get appropriate icon for file extension
 */
const getFileIcon = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet size={28} className="asset-file-icon text-emerald" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive size={28} className="asset-file-icon text-amber" />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText size={28} className="asset-file-icon text-blue" />;
  }
  return <File size={28} className="asset-file-icon text-cyan" />;
};

/**
 * Helper to convert any image Blob to PNG Blob using Canvas for browser Clipboard API
 */
const convertBlobToPng = (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error('Canvas PNG conversion failed'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for PNG conversion'));
    };
    img.src = url;
  });
};

export default function AssetsView({ user, company, onNavigate, isAdmin = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [groupedAssets, setGroupedAssets] = useState([]);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedTicketFilter, setSelectedTicketFilter] = useState('ALL');
  const [activeTypeTab, setActiveTypeTab] = useState('all'); // 'all', 'images', 'videos', 'documents'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Image Lightbox Modal State
  const [lightboxAsset, setLightboxAsset] = useState(null);

  // Copy Feedback Toast
  const [copyFeedback, setCopyFeedback] = useState({ show: false, message: '', isSuccess: true });
  const copyToastTimeoutRef = useRef(null);

  const showCopyToast = (message, isSuccess = true) => {
    if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
    setCopyFeedback({ show: true, message, isSuccess });
    copyToastTimeoutRef.current = setTimeout(() => {
      setCopyFeedback({ show: false, message: '', isSuccess: true });
    }, 2800);
  };

  // Keyboard shortcut: Escape closes Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxAsset) {
        setLightboxAsset(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxAsset]);

  // Load assets from backend
  const loadAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAssets({
        sort: sortOrder,
      });
      setAssets(data.assets || []);
      setGroupedAssets(data.groupedAssets || []);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('Unable to load your media library. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [sortOrder]);

  // List of distinct companies for Admin filter dropdown
  const companyOptions = useMemo(() => {
    if (!isAdmin) return [];
    const seen = new Map();
    for (const a of assets) {
      if (a.companyId && !seen.has(a.companyId)) {
        seen.set(a.companyId, a.companyName || 'Client');
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [isAdmin, assets]);

  // List of distinct tickets for filter dropdown
  const ticketOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    for (const a of assets) {
      if (isAdmin && selectedCompanyFilter !== 'ALL' && a.companyId !== selectedCompanyFilter) {
        continue;
      }
      const code = a.ticketCode || a.requestId;
      if (code && !seen.has(code)) {
        seen.add(code);
        options.push({
          code,
          title: a.requestTitle || code,
          requestId: a.requestId,
        });
      }
    }
    return options;
  }, [assets, isAdmin, selectedCompanyFilter]);

  // Filtered Assets & Filtered Ticket Groups
  const filteredTicketGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groupedAssets
      .map(ticketGroup => {
        // Admin Company filter check
        if (isAdmin && selectedCompanyFilter !== 'ALL') {
          if (ticketGroup.companyId !== selectedCompanyFilter) {
            return null;
          }
        }

        // Request filter check
        if (selectedTicketFilter !== 'ALL') {
          if (ticketGroup.ticketCode !== selectedTicketFilter && ticketGroup.requestId !== selectedTicketFilter) {
            return null;
          }
        }

        // Filter submissions and their files
        const filteredSubmissions = ticketGroup.submissions
          .map(sub => {
            const filteredFiles = sub.files.filter(file => {
              // Type filter check
              if (activeTypeTab !== 'all') {
                const category = getAssetCategory(file);
                if (activeTypeTab === 'images' && category !== 'image') return false;
                if (activeTypeTab === 'videos' && category !== 'video') return false;
                if (activeTypeTab === 'documents' && category !== 'document') return false;
              }

              // Search query check (filename, ticket code, request title, submission title, client/company)
              if (query) {
                const matchName = (file.fileName || '').toLowerCase().includes(query);
                const matchTicket = (ticketGroup.ticketCode || '').toLowerCase().includes(query);
                const matchTitle = (ticketGroup.requestTitle || '').toLowerCase().includes(query);
                const matchSub = (sub.submissionTitle || '').toLowerCase().includes(query);
                const matchCompany = (ticketGroup.companyName || '').toLowerCase().includes(query);
                const matchClient = (ticketGroup.clientName || '').toLowerCase().includes(query);
                if (!matchName && !matchTicket && !matchTitle && !matchSub && !matchCompany && !matchClient) return false;
              }

              return true;
            });

            if (filteredFiles.length === 0) return null;
            return {
              ...sub,
              files: filteredFiles,
            };
          })
          .filter(Boolean);

        if (filteredSubmissions.length === 0) return null;

        const totalFilteredFiles = filteredSubmissions.reduce((sum, s) => sum + s.files.length, 0);

        return {
          ...ticketGroup,
          totalFiles: totalFilteredFiles,
          submissions: filteredSubmissions,
        };
      })
      .filter(Boolean);
  }, [groupedAssets, isAdmin, selectedCompanyFilter, selectedTicketFilter, activeTypeTab, searchQuery]);

  // Handle direct file download
  const handleDownload = (asset) => {
    try {
      const downloadUrl = api.getAssetDownloadUrl(asset.id || asset.assetId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', asset.fileName || 'creativegini-asset');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      showCopyToast('Download failed. Please try again.', false);
    }
  };

  // Handle image copy to clipboard
  const handleCopyImage = async (asset) => {
    try {
      const streamUrl = api.getAssetStreamUrl(asset.id || asset.assetId);
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error('Failed to fetch image data for copying');
      const blob = await response.blob();

      // Check browser ClipboardItem support
      if (typeof window.ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        let pngBlob = blob;
        if (blob.type !== 'image/png') {
          // Convert to PNG blob for universal browser clipboard support
          pngBlob = await convertBlobToPng(blob);
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        showCopyToast('Image copied to clipboard');
        return;
      }

      throw new Error('ClipboardItem API not supported in this browser');
    } catch (err) {
      console.warn('Direct image clipboard copy failed:', err.message);
      // Fallback: Notify user gracefully without breaking UI
      showCopyToast('Direct image clipboard copy not supported by your browser', false);
    }
  };

  return (
    <div className="assets-view-wrapper">
      {/* Toast Notification */}
      {copyFeedback.show && (
        <div className={`assets-toast ${copyFeedback.isSuccess ? 'success' : 'info'}`}>
          {copyFeedback.isSuccess ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{copyFeedback.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="assets-header">
        <div className="assets-header-title-area">
          <div className="assets-icon-badge">
            <FolderArchive size={22} color="#00D9FF" />
          </div>
          <div>
            <h1 className="assets-title">Assets</h1>
            <p className="assets-subtitle">Your completed work, organized by request.</p>
          </div>
        </div>

        <div className="assets-header-meta">
          <span className="assets-count-chip">
            <Sparkles size={14} color="#00D9FF" />
            <span>{assets.length} Total Deliverable{assets.length === 1 ? '' : 's'}</span>
          </span>
        </div>
      </div>

      {/* CONTROLS BAR: Search, Filters, Sorting, View Toggle */}
      <div className="assets-controls-card">
        {/* Search Input */}
        <div className="assets-search-box">
          <Search size={16} className="assets-search-icon" />
          <input
            type="text"
            className="assets-search-input"
            placeholder="Search by file name, ticket ID, or request title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="assets-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="assets-filters-row">
          {/* Admin Company Filter Dropdown */}
          {isAdmin && companyOptions.length > 0 && (
            <div className="assets-select-wrapper company-filter-wrapper">
              <Building size={14} className="assets-select-icon" />
              <select
                className="assets-select-input"
                value={selectedCompanyFilter}
                onChange={(e) => {
                  setSelectedCompanyFilter(e.target.value);
                  setSelectedTicketFilter('ALL');
                }}
              >
                <option value="ALL">All Clients ({companyOptions.length})</option>
                {companyOptions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="assets-select-arrow" />
            </div>
          )}

          {/* Request Filter Dropdown */}
          <div className="assets-select-wrapper">
            <Filter size={14} className="assets-select-icon" />
            <select
              className="assets-select-input"
              value={selectedTicketFilter}
              onChange={(e) => setSelectedTicketFilter(e.target.value)}
            >
              <option value="ALL">All Requests ({ticketOptions.length})</option>
              {ticketOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.code} • {opt.title.length > 28 ? opt.title.slice(0, 28) + '...' : opt.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="assets-select-arrow" />
          </div>

          {/* File Type Tabs */}
          <div className="assets-type-tabs">
            <button
              className={`assets-tab-btn ${activeTypeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTypeTab('all')}
            >
              All
            </button>
            <button
              className={`assets-tab-btn ${activeTypeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTypeTab('images')}
            >
              <ImageIcon size={13} />
              <span>Images</span>
            </button>
            <button
              className={`assets-tab-btn ${activeTypeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTypeTab('videos')}
            >
              <Film size={13} />
              <span>Videos</span>
            </button>
            <button
              className={`assets-tab-btn ${activeTypeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTypeTab('documents')}
            >
              <FileText size={13} />
              <span>Documents</span>
            </button>
          </div>

          {/* Sort Order Selector */}
          <div className="assets-select-wrapper sort-wrapper">
            <ArrowUpDown size={14} className="assets-select-icon" />
            <select
              className="assets-select-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown size={14} className="assets-select-arrow" />
          </div>

          {/* View Mode Toggle */}
          <div className="assets-view-toggle">
            <button
              className={`assets-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`assets-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="assets-loading-state">
          <RefreshCw size={32} className="assets-spinner" />
          <p>Loading your media library...</p>
        </div>
      ) : error ? (
        <div className="assets-error-card">
          <AlertCircle size={28} color="#EF4444" />
          <div className="assets-error-content">
            <h4>Failed to Load Assets</h4>
            <p>{error}</p>
          </div>
          <button className="assets-retry-btn" onClick={loadAssets}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      ) : assets.length === 0 ? (
        /* EMPTY STATE: User or Admin has no completed work submitted yet */
        <div className="assets-empty-state">
          <div className="assets-empty-icon-circle">
            <FolderArchive size={40} color="#00D9FF" />
          </div>
          <h3 className="assets-empty-title">No assets yet</h3>
          <p className="assets-empty-desc">
            {isAdmin
              ? 'Onboarding assets uploaded during client creation and deliverables submitted by team specialists will appear here automatically.'
              : 'Completed work submitted by our team will appear here automatically.'}
          </p>
          {onNavigate && (
            <button
              className="portal-btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => onNavigate(isAdmin ? 'tickets' : 'requests')}
            >
              View Active {isAdmin ? 'Tickets' : 'Requests'}
            </button>
          )}
        </div>
      ) : filteredTicketGroups.length === 0 ? (
        /* NO RESULTS MATCHING FILTER */
        <div className="assets-empty-state filter-empty">
          <Search size={32} color="#94A3B8" />
          <h3 className="assets-empty-title">No matching assets found</h3>
          <p className="assets-empty-desc">
            Try adjusting your search query, type filters, or ticket selection.
          </p>
          <button
            className="portal-btn-secondary"
            style={{ marginTop: '14px' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedTicketFilter('ALL');
              setActiveTypeTab('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* GROUPED DELIVERABLES BY TICKET */
        <div className="assets-ticket-groups-list">
          {filteredTicketGroups.map((ticketGroup) => (
            <div key={ticketGroup.requestId || ticketGroup.ticketCode} className="assets-ticket-group-card">
              {/* TICKET GROUP HEADER */}
              <div className="assets-ticket-header">
                <div className="assets-ticket-meta-primary">
                  <span className="assets-ticket-code-badge">
                    {ticketGroup.ticketCode || 'CG-REQ'}
                  </span>
                  <h2 className="assets-ticket-title">
                    {ticketGroup.requestTitle || 'Creative Deliverable Request'}
                  </h2>
                  {isAdmin && ticketGroup.companyName && (
                    <span className="assets-admin-company-pill" title={`Client: ${ticketGroup.clientName || ''} (${ticketGroup.clientEmail || ''})`}>
                      <Building size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {ticketGroup.companyName}
                      {ticketGroup.clientName && (
                        <span className="assets-admin-client-name"> • {ticketGroup.clientName}</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="assets-ticket-meta-secondary">
                  {ticketGroup.serviceType && (
                    <span className="assets-service-pill">
                      {ticketGroup.serviceType.replace('_', ' ')}
                    </span>
                  )}
                  <span className="assets-file-count-badge">
                    {ticketGroup.totalFiles} File{ticketGroup.totalFiles === 1 ? '' : 's'}
                  </span>
                  {ticketGroup.latestSubmittedAt && (
                    <span className="assets-date-label">
                      <Calendar size={13} />
                      <span>
                        Updated {new Date(ticketGroup.latestSubmittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* SUBMISSIONS LIST (V1, V2, etc.) */}
              <div className="assets-submissions-container">
                {ticketGroup.submissions.map((submission) => (
                  <div key={submission.submissionId || submission.submissionVersion} className="assets-submission-block">
                    {/* SUBMISSION VERSION HEADER */}
                    <div className="assets-submission-header">
                      <div className="assets-version-tag">
                        <Layers size={13} />
                        <span>Submission V{submission.submissionVersion}</span>
                      </div>
                      {submission.submissionTitle && (
                        <span className="assets-sub-title-text">{submission.submissionTitle}</span>
                      )}
                      {submission.submittedAt && (
                        <span className="assets-sub-date">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* FILES CONTAINER: GRID OR LIST */}
                    <div className={`assets-files-wrapper ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                      {submission.files.map((asset) => {
                        const category = getAssetCategory(asset);
                        const streamUrl = api.getAssetStreamUrl(asset.id || asset.assetId);

                        if (category === 'image') {
                          return (
                            <ImageCard
                              key={asset.id || asset.assetId}
                              asset={asset}
                              streamUrl={streamUrl}
                              viewMode={viewMode}
                              onOpenLightbox={() => setLightboxAsset(asset)}
                              onCopy={() => handleCopyImage(asset)}
                              onDownload={() => handleDownload(asset)}
                            />
                          );
                        }

                        if (category === 'video') {
                          return (
                            <VideoCard
                              key={asset.id || asset.assetId}
                              asset={asset}
                              streamUrl={streamUrl}
                              viewMode={viewMode}
                              onDownload={() => handleDownload(asset)}
                            />
                          );
                        }

                        // Default: Document / Other Files
                        return (
                          <DocumentCard
                            key={asset.id || asset.assetId}
                            asset={asset}
                            streamUrl={streamUrl}
                            viewMode={viewMode}
                            onDownload={() => handleDownload(asset)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {lightboxAsset && (
        <ImageLightboxModal
          asset={lightboxAsset}
          streamUrl={api.getAssetStreamUrl(lightboxAsset.id || lightboxAsset.assetId)}
          onClose={() => setLightboxAsset(null)}
          onCopy={() => handleCopyImage(lightboxAsset)}
          onDownload={() => handleDownload(lightboxAsset)}
        />
      )}
    </div>
  );
}

/**
 * Image Deliverable Card
 */
function ImageCard({ asset, streamUrl, viewMode, onOpenLightbox, onCopy, onDownload }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="asset-card-list">
        <div className="asset-list-thumb-box" onClick={onOpenLightbox}>
          <img
            src={streamUrl}
            alt={asset.fileName}
            className="asset-list-thumb"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="asset-list-info">
          <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
          <div className="asset-meta-text">
            <span>Image</span>
            <span>•</span>
            <span>{asset.fileSize || 'Standard'}</span>
            <span>•</span>
            <span>V{asset.submissionVersion || 1}</span>
          </div>
        </div>
        <div className="asset-card-actions">
          <button className="asset-action-btn" onClick={onCopy} title="Copy Image">
            <Copy size={14} />
            <span>Copy</span>
          </button>
          <button className="asset-action-btn primary" onClick={onDownload} title="Download Image">
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-card-grid">
      <div className="asset-thumb-container" onClick={onOpenLightbox} title="Click to view full preview">
        {!imageLoaded && !imageError && (
          <div className="asset-thumb-placeholder">
            <ImageIcon size={24} color="#64748B" />
          </div>
        )}
        {imageError ? (
          <div className="asset-thumb-error">
            <AlertCircle size={20} color="#EF4444" />
            <span>Preview unavailable</span>
          </div>
        ) : (
          <img
            src={streamUrl}
            alt={asset.fileName}
            className={`asset-thumb-img ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        <div className="asset-thumb-overlay">
          <Eye size={22} color="#FFFFFF" />
          <span>Expand Preview</span>
        </div>
      </div>

      <div className="asset-card-body">
        <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
        <div className="asset-meta-text">
          <span>Image</span>
          <span>•</span>
          <span>{asset.fileSize || 'Standard'}</span>
          <span>•</span>
          <span>V{asset.submissionVersion || 1}</span>
        </div>

        <div className="asset-card-actions">
          <button className="asset-action-btn" onClick={onCopy} title="Copy Image to Clipboard">
            <Copy size={13} />
            <span>Copy</span>
          </button>
          <button className="asset-action-btn primary" onClick={onDownload} title="Download Image">
            <Download size={13} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Video Deliverable Card with Native HTML5 Player and Range Seeking
 */
function VideoCard({ asset, streamUrl, viewMode, onDownload }) {
  const [videoError, setVideoError] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="asset-card-list video-list-item">
        <div className="asset-list-video-box">
          <video
            src={streamUrl}
            className="asset-list-video"
            controls
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        </div>
        <div className="asset-list-info">
          <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
          <div className="asset-meta-text">
            <span>Video</span>
            <span>•</span>
            <span>{asset.fileSize || 'HD'}</span>
            <span>•</span>
            <span>V{asset.submissionVersion || 1}</span>
          </div>
        </div>
        <div className="asset-card-actions">
          <button className="asset-action-btn primary" onClick={onDownload} title="Download Video">
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-card-grid video-grid-item">
      <div className="asset-video-container">
        {videoError ? (
          <div className="asset-thumb-error">
            <AlertCircle size={22} color="#EF4444" />
            <span>Video format not playable in browser</span>
          </div>
        ) : (
          <video
            src={streamUrl}
            className="asset-player"
            controls
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        )}
      </div>

      <div className="asset-card-body">
        <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
        <div className="asset-meta-text">
          <span>Video</span>
          <span>•</span>
          <span>{asset.fileSize || 'HD'}</span>
          <span>•</span>
          <span>V{asset.submissionVersion || 1}</span>
        </div>

        <div className="asset-card-actions">
          <button className="asset-action-btn primary" onClick={onDownload} title="Download Video" style={{ width: '100%' }}>
            <Download size={13} />
            <span>Download Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Document / Other Deliverable Card
 */
function DocumentCard({ asset, streamUrl, viewMode, onDownload }) {
  const ext = (asset.fileName || '').split('.').pop()?.toUpperCase() || 'FILE';

  if (viewMode === 'list') {
    return (
      <div className="asset-card-list">
        <div className="asset-list-doc-icon">
          {getFileIcon(asset.fileName)}
        </div>
        <div className="asset-list-info">
          <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
          <div className="asset-meta-text">
            <span>{ext}</span>
            <span>•</span>
            <span>{asset.fileSize || 'Standard'}</span>
            <span>•</span>
            <span>V{asset.submissionVersion || 1}</span>
          </div>
        </div>
        <div className="asset-card-actions">
          <button className="asset-action-btn primary" onClick={onDownload} title="Download File">
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-card-grid doc-grid-item">
      <div className="asset-doc-icon-container">
        {getFileIcon(asset.fileName)}
        <span className="asset-doc-ext-badge">{ext}</span>
      </div>

      <div className="asset-card-body">
        <div className="asset-name" title={asset.fileName}>{asset.fileName}</div>
        <div className="asset-meta-text">
          <span>{ext} Document</span>
          <span>•</span>
          <span>{asset.fileSize || 'Standard'}</span>
        </div>
        <div className="asset-meta-subtext">
          <span>Submission V{asset.submissionVersion || 1}</span>
        </div>

        <div className="asset-card-actions">
          <button className="asset-action-btn primary" onClick={onDownload} title="Download Deliverable" style={{ width: '100%' }}>
            <Download size={13} />
            <span>Download Deliverable</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Image Lightbox Modal with Copy, Download, and Fullscreen preview
 */
function ImageLightboxModal({ asset, streamUrl, onClose, onCopy, onDownload }) {
  return (
    <div className="asset-lightbox-overlay" onClick={onClose}>
      <div className="asset-lightbox-modal" onClick={(e) => e.stopPropagation()}>
        {/* LIGHTBOX HEADER */}
        <div className="asset-lightbox-header">
          <div className="asset-lightbox-meta">
            <h3 className="asset-lightbox-filename">{asset.fileName}</h3>
            <div className="asset-lightbox-details">
              <span>{asset.ticketCode}</span>
              <span>•</span>
              <span>Submission V{asset.submissionVersion || 1}</span>
              <span>•</span>
              <span>{asset.fileSize || 'Full resolution'}</span>
            </div>
          </div>

          <div className="asset-lightbox-actions">
            <button className="asset-lightbox-btn" onClick={onCopy} title="Copy Image to Clipboard">
              <Copy size={15} />
              <span>Copy</span>
            </button>
            <button className="asset-lightbox-btn primary" onClick={onDownload} title="Download Image">
              <Download size={15} />
              <span>Download</span>
            </button>
            <button className="asset-lightbox-close-btn" onClick={onClose} title="Close Preview (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* LIGHTBOX BODY: FULL IMAGE */}
        <div className="asset-lightbox-body">
          <img
            src={streamUrl}
            alt={asset.fileName}
            className="asset-lightbox-img"
          />
        </div>
      </div>
    </div>
  );
}
