import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Inbox, Filter, RefreshCw } from 'lucide-react';
import DesignRequestQueue from '../components/DesignRequestQueue';

export default function DesignRequestsPage({
  requests = [],
  metrics = {},
  onNavigate,
  loading = false,
  onRefresh,
}) {
  const { statusParam } = useParams();
  const navigate = useNavigate();

  // Map route param to filter status
  const getInitialStatus = () => {
    if (!statusParam) return 'ALL';
    const clean = statusParam.toLowerCase();
    if (clean === 'new') return 'NEW';
    if (clean === 'assigned') return 'ASSIGNED';
    if (clean === 'in-progress') return 'IN_PROGRESS';
    if (clean === 'client-review') return 'CLIENT_REVIEW';
    if (clean === 'changes-requested') return 'CHANGES_REQUESTED';
    if (clean === 'completed') return 'COMPLETED';
    return 'ALL';
  };

  const [initialStatus, setInitialStatus] = useState(getInitialStatus);

  useEffect(() => {
    if (statusParam) {
      setInitialStatus(getInitialStatus());
    }
  }, [statusParam]);

  const handleSelectRequest = (req) => {
    navigate(`/design/requests/${req.ticketId || req.id}`);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Design Requests & Ticket Operations
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#64748B',
              margin: '6px 0 0',
            }}
          >
            Monitor incoming client briefs, assign specialists, and advance design sprints through client review.
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh Queue</span>
          </button>
        )}
      </div>

      <DesignRequestQueue
        key={statusParam || 'all'}
        requests={requests}
        metrics={metrics}
        initialStatus={initialStatus}
        onSelectRequest={handleSelectRequest}
      />
    </div>
  );
}
