import React, { useState } from 'react';
import {
  Inbox,
  Sparkles,
  Search,
  FilterX
} from 'lucide-react';
import DesignRequestFilters from './DesignRequestFilters';
import DesignRequestTable from './DesignRequestTable';
import DesignRequestCard from './DesignRequestCard';

export default function DesignRequestQueue({
  requests = [],
  metrics = {},
  onSelectRequest,
  initialStatus = 'ALL',
  initialService = 'ALL',
  title = 'Design Request Queue',
  subtitle
}) {
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [activeService, setActiveService] = useState(initialService);
  const [activePriority, setActivePriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    // Status
    if (activeStatus === 'NEW' && !['REQUEST_CREATED', 'PAYMENT_COMPLETED'].includes(r.status)) return false;
    if (activeStatus === 'IN_PROGRESS' && !['IN_PROGRESS', 'ASSIGNED', 'UNDER_REVIEW'].includes(r.status)) return false;
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

  const getEmptyMessage = () => {
    if (searchQuery || activePriority !== 'ALL') {
      return {
        title: 'No matching design tickets found',
        description: 'Try adjusting your search criteria or resetting filters.'
      };
    }
    switch (activeStatus) {
      case 'NEW':
        return {
          title: 'No new design requests',
          description: 'All submitted client requests are currently in progress or completed.'
        };
      case 'IN_PROGRESS':
        return {
          title: 'No design sprints currently in progress',
          description: 'Specialists have submitted deliverables or are ready to pick up new work.'
        };
      case 'CLIENT_REVIEW':
        return {
          title: 'No client reviews waiting',
          description: 'All submitted design deliverables have been reviewed or approved.'
        };
      case 'CHANGES_REQUESTED':
        return {
          title: 'No changes requested',
          description: 'There are currently no revision requests from clients.'
        };
      case 'COMPLETED':
        return {
          title: 'No completed requests yet',
          description: 'Completed design deliverables will appear here once approved.'
        };
      default:
        return {
          title: 'No design requests available',
          description: 'New client design requests will appear here once submitted.'
        };
    }
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div>
      <DesignRequestFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        activeService={activeService}
        onServiceChange={setActiveService}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        metrics={metrics}
      />

      {filteredRequests.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F0F9FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Inbox size={24} />
          </div>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#1E293B',
              margin: '0 0 6px 0',
            }}
          >
            {emptyMsg.title}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748B',
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            {emptyMsg.description}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DesignRequestTable requests={filteredRequests} onSelectRequest={onSelectRequest} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredRequests.map((req) => (
            <DesignRequestCard
              key={req.id || req.ticketId}
              request={req}
              onClick={() => onSelectRequest && onSelectRequest(req)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
