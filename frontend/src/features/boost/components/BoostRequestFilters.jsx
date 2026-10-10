import React from 'react';
import { Search, Filter, X, Compass, Image, Video, PenTool, Sparkles, Target, Code2 } from 'lucide-react';
import { BOOST_SERVICES } from '../data/boostServiceData';

export default function BoostRequestFilters({
  activeStatus = 'ALL',
  onStatusChange,
  activeService = 'ALL',
  onServiceChange,
  activePriority = 'ALL',
  onPriorityChange,
  searchQuery = '',
  onSearchChange,
  metrics = {}
}) {
  const statusTabs = [
    { key: 'ALL', label: 'All Requests', count: metrics.total, activeColor: '#7C3AED', badgeBg: '#EDE9FE', badgeColor: '#6D28D9' },
    { key: 'NEW', label: 'New', count: metrics.newRequests, activeColor: '#2563EB', badgeBg: '#EFF6FF', badgeColor: '#2563EB' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: metrics.inProgress, activeColor: '#D97706', badgeBg: '#FFFBEB', badgeColor: '#D97706' },
    { key: 'CLIENT_REVIEW', label: 'Client Review', count: metrics.clientReview, activeColor: '#DB2777', badgeBg: '#FDF2F8', badgeColor: '#DB2777' },
    { key: 'CHANGES_REQUESTED', label: 'Changes Requested', count: metrics.changesRequested, activeColor: '#DC2626', badgeBg: '#FEF2F2', badgeColor: '#DC2626' },
    { key: 'COMPLETED', label: 'Completed', count: metrics.completed, activeColor: '#059669', badgeBg: '#ECFDF5', badgeColor: '#059669' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        marginBottom: '20px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* 1. Primary Lifecycle Sub-headings / Tabs */}
      <div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Lifecycle Stages
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? tab.activeColor : '#4B5563',
                  backgroundColor: isActive ? tab.badgeBg : 'transparent',
                  border: isActive ? `1px solid ${tab.badgeColor}40` : '1px solid transparent',
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
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? '#FFFFFF' : tab.badgeBg,
                      color: tab.badgeColor,
                      border: `1px solid ${tab.badgeColor}30`,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Dropdowns & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Service Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Service:</span>
            <select
              value={activeService}
              onChange={(e) => onServiceChange(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All 7 Services</option>
              {BOOST_SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 600 }}>Priority:</span>
            <select
              value={activePriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Clear Filters reset button if active */}
          {(activeStatus !== 'ALL' || activeService !== 'ALL' || activePriority !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                onStatusChange('ALL');
                onServiceChange('ALL');
                onPriorityChange('ALL');
                if (onSearchChange) onSearchChange('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                border: 'none',
                color: '#4B5563',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={12} />
              Reset filters
            </button>
          )}
        </div>

        {/* Quick Search inside Filter Bar */}
        {onSearchChange && (
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by title, client..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.8125rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
