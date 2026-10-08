import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  Users
} from 'lucide-react';
import RequestQueueTable from '../components/RequestQueueTable';

export default function LeadRequestsPage({
  requests = [],
  onNavigate,
  loading = false,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ALL';
  const [searchQuery, setSearchQuery] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('ALL');

  const tabs = [
    { id: 'ALL', label: 'All Requests', count: requests.length },
    { id: 'NEW', label: 'New', count: requests.filter((r) => r.status === 'REQUEST_CREATED').length },
    { id: 'ASSIGNED', label: 'Assigned', count: requests.filter((r) => r.status === 'ASSIGNED').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: requests.filter((r) => r.status === 'IN_PROGRESS').length },
    { id: 'CLIENT_REVIEW', label: 'Client Review', count: requests.filter((r) => r.status === 'CLIENT_REVIEW' || r.status === 'CHANGES_REQUESTED').length },
    { id: 'COMPLETED', label: 'Completed', count: requests.filter((r) => r.status === 'COMPLETED').length },
  ];

  // Distinct specialists list
  const specialists = useMemo(() => {
    const set = new Set();
    requests.forEach((r) => {
      if (r.assignedTo) set.add(r.assignedTo);
    });
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Tab Status Filter
      if (activeTab === 'NEW' && req.status !== 'REQUEST_CREATED') return false;
      if (activeTab === 'ASSIGNED' && req.status !== 'ASSIGNED') return false;
      if (activeTab === 'IN_PROGRESS' && req.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'CLIENT_REVIEW' && req.status !== 'CLIENT_REVIEW' && req.status !== 'CHANGES_REQUESTED') return false;
      if (activeTab === 'COMPLETED' && req.status !== 'COMPLETED') return false;

      // 2. Search Query (Ticket ID, Client, Service Title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTicket = req.ticketId?.toLowerCase().includes(q);
        const matchCompany = req.clientCompany?.toLowerCase().includes(q);
        const matchTitle = req.title?.toLowerCase().includes(q);
        const matchClient = req.clientName?.toLowerCase().includes(q);
        if (!matchTicket && !matchCompany && !matchTitle && !matchClient) return false;
      }

      // 3. Specialist Filter
      if (specialistFilter !== 'ALL' && req.assignedTo !== specialistFilter) {
        return false;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery, specialistFilter]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Research Request Queue
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563' }}>
          Triage, assign, and manage incoming research sprints and client deliverables.
        </p>
      </div>

      {/* 2. Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '20px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: isActive ? '#7C3AED' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                border: isActive ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                boxShadow: isActive ? '0 2px 6px rgba(124, 58, 237, 0.25)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search and Secondary Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter ticket, client, or title..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '0.84375rem',
              color: '#111827',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        {/* Specialist Dropdown */}
        {specialists.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>
              Specialist:
            </span>
            <select
              value={specialistFilter}
              onChange={(e) => setSpecialistFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.8125rem',
                color: '#374151',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="ALL">All Specialists</option>
              {specialists.map((sp, idx) => (
                <option key={idx} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. Requests Table */}
      <RequestQueueTable
        requests={filteredRequests}
        onSelectRequest={(ticketId) => onNavigate(`/lead/requests/${ticketId}`)}
        onOpenWorkspace={(ticketId) => onNavigate(`/lead/research/${ticketId}`)}
        loading={loading}
      />
    </div>
  );
}
