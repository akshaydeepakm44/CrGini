import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  Target,
  Building2,
  Users,
  Presentation,
  CheckCircle2,
  FileText
} from 'lucide-react';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { getServicesByChannel } from '../data/servicesData';

export default function DigitalisingChannelPage({
  requests = [],
  onViewRequest,
  onSelectService,
  onRequestService,
  onOpenNewRequest,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const digitalisingServices = getServicesByChannel('digitalising').filter((s) => s.id !== 'custom');

  const filterTabs = [
    { id: 'ALL', label: 'All Requests' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'CLIENT_REVIEW', label: 'Client Review' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  // Filter requests that belong to digitalising channel or DiziGini platform
  const digitalisingRequests = requests.filter((req) => {
    // 1. Digitalising scope filter
    const channel = String(req.channel || '').toLowerCase();
    const serviceType = String(req.service_type || req.serviceType || '').toUpperCase();
    const sId = String(req.serviceId || req.service || '').toLowerCase();
    const isDigitalising =
      channel === 'digitalising' ||
      serviceType === 'COMPANY_LEAD' ||
      ['lead-research', 'company-study', 'key-people', 'pitch-support', 'lead research', 'company study', 'key people', 'pitch support'].some((k) => sId.includes(k)) ||
      !req.channel; // In DiziGini standalone, portal requests are digitalising

    if (!isDigitalising) return false;

    // 2. Text search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTicket = req.ticketId?.toLowerCase().includes(q);
      const matchTitle = req.title?.toLowerCase().includes(q);
      const matchService = req.service?.toLowerCase().includes(q);
      if (!matchTicket && !matchTitle && !matchService) return false;
    }

    // 3. Status filter match
    const status = String(req.status || '').toUpperCase();
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'ACTIVE') return status !== 'COMPLETED' && status !== 'APPROVED';
    if (selectedFilter === 'IN_PROGRESS') return status === 'IN_PROGRESS' || status === 'SUBMITTED' || status === 'ASSIGNED';
    if (selectedFilter === 'CLIENT_REVIEW') return status === 'CLIENT_REVIEW';
    if (selectedFilter === 'COMPLETED') return status === 'COMPLETED' || status === 'APPROVED';

    return true;
  });

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Channel Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#0369A1',
                backgroundColor: '#E0F2FE',
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              Digitalising Platform
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>Requests &amp; Sprints</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--cg-text-primary, #111827)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Digitalising Requests
          </h1>

          <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
            Track and manage all your active research dossiers, lead discovery sprints, and executive intelligence deliverables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          iconLeft={Plus}
          onClick={() => (onOpenNewRequest ? onOpenNewRequest() : onRequestService && onRequestService('lead-research'))}
        >
          New Digitalising Request
        </Button>
      </div>

      {/* 2. Quick Capability Launchers (Compact Bar) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
          Digitalising Services
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
          }}
        >
          {digitalisingServices.map((svc) => (
            <div
              key={svc.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#BAE6FD';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: svc.iconBg,
                    color: svc.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svc.icon size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {svc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {svc.turnaround}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => onRequestService && onRequestService(svc.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '7px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={12} />
                  <span>Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectService && onSelectService(svc.slug)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '7px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search and Status Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          marginBottom: '20px',
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
            placeholder="Search digitalising requests by ticket ID, title, or service..."
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
                  border: isSelected ? '1px solid #0284C7' : '1px solid transparent',
                  backgroundColor: isSelected ? '#E0F2FE' : '#F3F4F6',
                  color: isSelected ? '#0369A1' : '#4B5563',
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

      {/* 4. Requests List / Table */}
      {digitalisingRequests.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #D1D5DB',
            padding: '54px 24px',
            textAlign: 'center',
          }}
        >
          <Clock size={36} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            No Digitalising Requests Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 18px', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
            {searchQuery
              ? `No requests matching "${searchQuery}". Try adjusting your filters.`
              : 'Launch your first research sprint, lead study, or buying committee mapping.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => (onOpenNewRequest ? onOpenNewRequest() : onRequestService && onRequestService('lead-research'))}
          >
            Create Digitalising Request
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
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Ticket ID
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Title &amp; Service
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Deliverables
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Created
                  </th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {digitalisingRequests.map((req) => {
                  const deliverablesCount = (req.deliverables?.length || req.submissions?.length || 0);

                  return (
                    <tr
                      key={req.id || req.ticketId}
                      onClick={() => onViewRequest && onViewRequest(req)}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F9FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Ticket Code */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: '#0284C7',
                            backgroundColor: '#E0F2FE',
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {req.ticketId || `REQ-${req.id}`}
                        </span>
                      </td>

                      {/* Title & Service */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                          {req.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                          {req.service || req.serviceType || 'Digitalising Sprint'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Deliverables */}
                      <td style={{ padding: '16px 20px' }}>
                        {deliverablesCount > 0 ? (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#059669',
                              backgroundColor: '#ECFDF5',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <FileText size={12} />
                            {deliverablesCount} File{deliverablesCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>In Progress</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: '#6B7280' }}>
                        {req.createdDate || (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent')}
                      </td>

                      {/* Action */}
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
                            color: '#0284C7',
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
