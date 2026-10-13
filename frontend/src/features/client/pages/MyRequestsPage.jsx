import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

export default function MyRequestsPage({
  requests = [],
  onViewRequest,
  onOpenNewRequest,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filterTabs = [
    { id: 'ALL', label: 'All Requests' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'CLIENT_REVIEW', label: 'Client Review' },
    { id: 'CHANGES_REQUESTED', label: 'Changes Requested' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  // Filtering logic
  const filteredRequests = requests.filter((req) => {
    // 1. Text search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = req.ticketId?.toLowerCase().includes(q);
      const matchTitle = req.title?.toLowerCase().includes(q);
      const matchService = req.service?.toLowerCase().includes(q);
      const matchChannel = req.channel?.toLowerCase().includes(q);
      if (!matchTicket && !matchTitle && !matchService && !matchChannel) return false;
    }

    // 2. Status filter match
    const status = String(req.status || '').toUpperCase();
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'ACTIVE') return status !== 'COMPLETED' && status !== 'APPROVED';
    if (selectedFilter === 'IN_PROGRESS') return status === 'IN_PROGRESS' || status === 'SUBMITTED' || status === 'ASSIGNED';
    if (selectedFilter === 'CLIENT_REVIEW') return status === 'CLIENT_REVIEW';
    if (selectedFilter === 'CHANGES_REQUESTED') return status === 'CHANGES_REQUESTED';
    if (selectedFilter === 'COMPLETED') return status === 'COMPLETED' || status === 'APPROVED';

    return true;
  });

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--cg-text-primary, #111827)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            My Requests
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
            Track and manage all your CreativeGini specialist tickets, reviews, and deliverables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          iconLeft={Plus}
          onClick={onOpenNewRequest}
        >
          New Request
        </Button>
      </div>

      {/* Filter Bar & Search */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by ticket ID (e.g. CG-1025), service, or sprint title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#FAFAFC',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #8B5CF6' : '1px solid transparent',
                  backgroundColor: isSelected ? '#FAF5FF' : '#F3F4F6',
                  color: isSelected ? '#6D28D9' : '#4B5563',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Table / Card List */}
      {filteredRequests.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Clock size={32} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            No Requests Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 16px' }}>
            {searchQuery
              ? `No requests matching "${searchQuery}". Try adjusting your filters.`
              : 'You have no tickets in this status category.'}
          </p>
          <Button variant="primary" size="sm" onClick={onOpenNewRequest}>
            Create New Request
          </Button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#FAF5FF',
                    borderBottom: '1px solid #EDE9FE',
                  }}
                >
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Ticket ID
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Service
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Channel
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Created
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Updated
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => onViewRequest && onViewRequest(req)}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          backgroundColor: '#EDE9FE',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {req.ticketId}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                        {req.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {req.service}
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <Badge
                        variant={req.channel === 'Boosting' ? 'pink' : 'blue'}
                        size="sm"
                      >
                        {req.channel}
                      </Badge>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status={req.status} size="sm" />
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      {req.createdDate}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: '#6B7280' }}>
                      {req.updatedDate}
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequest && onViewRequest(req);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: '#7C3AED',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>View Request</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
