import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox, Filter, RefreshCw } from 'lucide-react';
import BoostRequestTable from '../components/BoostRequestTable';
import BoostRequestFilters from '../components/BoostRequestFilters';

export default function BoostRequestsPage({
  requests = [],
  metrics = {},
  onNavigate,
  loading = false,
  onRefresh
}) {
  const { statusParam } = useParams();

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

  const [activeStatus, setActiveStatus] = useState(getInitialStatus);
  const [activeService, setActiveService] = useState('ALL');
  const [activePriority, setActivePriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (statusParam) {
      setActiveStatus(getInitialStatus());
    }
  }, [statusParam]);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    // Status
    if (activeStatus === 'NEW' && !['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)) return false;
    if (activeStatus === 'ASSIGNED' && r.status !== 'ASSIGNED') return false;
    if (activeStatus === 'IN_PROGRESS' && !['IN_PROGRESS', 'UNDER_REVIEW'].includes(r.status)) return false;
    if (activeStatus === 'CLIENT_REVIEW' && !['CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED'].includes(r.status)) return false;
    if (activeStatus === 'CHANGES_REQUESTED' && r.status !== 'CHANGES_REQUESTED') return false;
    if (activeStatus === 'COMPLETED' && !['COMPLETED', 'APPROVED'].includes(r.status)) return false;

    // Service
    if (activeService !== 'ALL' && r.serviceSlug !== activeService) return false;

    // Priority
    if (activePriority !== 'ALL' && r.priority !== activePriority) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = r.ticketId?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchClient = r.clientCompany?.toLowerCase().includes(q) || r.clientName?.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      if (!matchTicket && !matchTitle && !matchClient && !matchDesc) return false;
    }

    return true;
  });

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
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Boost Requests & Ticket Operations
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6B7280',
              margin: '6px 0 0',
            }}
          >
            Review, prioritize, and produce deliverables for client tickets across all 7 Boost services.
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh Queue</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <BoostRequestFilters
        activeStatus={activeStatus}
        onStatusChange={(status) => {
          setActiveStatus(status);
        }}
        activeService={activeService}
        onServiceChange={setActiveService}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        metrics={metrics}
      />

      {/* Results summary & table */}
      <div style={{ marginBottom: '12px', fontSize: '0.8125rem', color: '#6B7280' }}>
        Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong> total requests
      </div>

      <BoostRequestTable
        requests={filteredRequests}
        onSelectRequest={(req) => onNavigate(`/boost/requests/${req.ticketId || req.id}`)}
        emptyMessage="No Boost requests matching selected filters"
      />
    </div>
  );
}
