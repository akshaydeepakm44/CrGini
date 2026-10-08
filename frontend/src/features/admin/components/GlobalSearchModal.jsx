import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ClipboardList, Building2, Users, FileText, ArrowRight } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await adminApi.getOperations({ search: searchTerm.trim() });
        setResults(res.requests || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="cg-modal-backdrop" onClick={onClose}>
      <div className="cg-modal-box cg-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cg-search-modal-header">
          <Search size={18} className="cg-search-modal-icon" />
          <input
            type="text"
            className="cg-search-modal-input"
            placeholder="Search tickets by ID, title, client or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="cg-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cg-search-modal-body">
          {loading && (
            <div className="cg-search-status">Searching database records...</div>
          )}

          {!loading && searchTerm && results.length === 0 && (
            <div className="cg-search-status">No matching records found for "{searchTerm}"</div>
          )}

          {!loading && !searchTerm && (
            <div className="cg-search-hint">
              Type ticket ID (e.g., <code>CG-1024</code>), client name, or service keyword.
            </div>
          )}

          {results.length > 0 && (
            <div className="cg-search-results-list">
              {results.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="cg-search-result-item"
                  onClick={() => {
                    onClose();
                    navigate(`/admin/requests/${r.id}`);
                  }}
                >
                  <div className="cg-result-item-left">
                    <span className="cg-result-code">{r.ticketId}</span>
                    <span className="cg-result-title">{r.title}</span>
                  </div>
                  <div className="cg-result-item-right">
                    <span className="cg-result-company">{r.company?.name || 'Direct Client'}</span>
                    <span className={`cg-status-chip ${r.status?.toLowerCase()}`}>{r.status}</span>
                    <ArrowRight size={14} className="cg-result-arrow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
