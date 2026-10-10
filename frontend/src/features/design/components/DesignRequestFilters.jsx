import React from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { DESIGN_SERVICES } from '../data/designServiceData';

export default function DesignRequestFilters({
  activeStatus = 'ALL',
  onStatusChange,
  activeService = 'ALL',
  onServiceChange,
  activePriority = 'ALL',
  onPriorityChange,
  searchQuery = '',
  onSearchChange,
  viewMode = 'table', // 'table' | 'grid'
  onViewModeChange,
  metrics = {}
}) {
  const statusTabs = [
    { key: 'ALL', label: 'All Requests', count: metrics.total },
    { key: 'NEW', label: 'New', count: metrics.newRequests },
    { key: 'IN_PROGRESS', label: 'In Progress', count: (metrics.inProgress || 0) + (metrics.assigned || 0) },
    { key: 'CLIENT_REVIEW', label: 'Client Review', count: metrics.clientReview },
    { key: 'CHANGES_REQUESTED', label: 'Changes Requested', count: metrics.changesRequested },
    { key: 'COMPLETED', label: 'Completed', count: metrics.completed }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
      {/* 1. Status Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {statusTabs.map((tab) => {
          const isSelected = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange && onStatusChange(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#0284C7' : '#4B5563',
                backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                border: isSelected ? '1px solid #BAE6FD' : '1px solid #E5E7EB',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    backgroundColor: isSelected ? '#0284C7' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Controls Bar: Search, Service Dropdown, Priority Dropdown, Grid/Table view */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Filter by ticket, client, description..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#9CA3AF',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Filter Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Service Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Service:</span>
            <select
              value={activeService}
              onChange={(e) => onServiceChange && onServiceChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                color: '#1E293B',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Disciplines</option>
              {DESIGN_SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Priority:</span>
            <select
              value={activePriority}
              onChange={(e) => onPriorityChange && onPriorityChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                color: '#1E293B',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* View mode toggle */}
          {onViewModeChange && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                padding: '2px',
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                title="Table view"
                style={{
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? '#0F172A' : '#64748B',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                title="Card view"
                style={{
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
