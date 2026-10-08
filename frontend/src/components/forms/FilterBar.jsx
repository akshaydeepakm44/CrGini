import React from 'react';
import { Filter } from 'lucide-react';
import SearchInput from '../common/SearchInput';

/**
 * Reusable FilterBar Component
 * Search box + status filter pills + sorting
 */
export default function FilterBar({
  searchQuery,
  onSearchChange,
  onSearchClear,
  searchPlaceholder = 'Filter records...',
  filters = [], // Array of { id, label, count }
  activeFilter = 'ALL',
  onFilterChange,
  rightActions,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-filter-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
        {onSearchChange && (
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder={searchPlaceholder}
            style={{ maxWidth: '320px' }}
          />
        )}

        {filters && filters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {filters.map((f) => {
              const isActive = activeFilter === f.id;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange && onFilterChange(f.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--cg-radius-pill)',
                    border: `1px solid ${isActive ? 'var(--cg-purple-300)' : 'var(--cg-border-light)'}`,
                    backgroundColor: isActive ? 'var(--cg-purple-100)' : '#FFFFFF',
                    color: isActive ? 'var(--cg-purple-800)' : 'var(--cg-text-secondary)',
                    fontFamily: 'var(--cg-font-family)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--cg-transition-fast)',
                    boxShadow: isActive ? 'none' : 'var(--cg-shadow-xs)',
                  }}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && (
                    <span
                      style={{
                        padding: '1px 6px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: 'var(--cg-radius-pill)',
                        backgroundColor: isActive ? 'var(--cg-purple-600)' : 'var(--cg-neutral-200)',
                        color: isActive ? '#FFFFFF' : 'var(--cg-text-muted)',
                      }}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {rightActions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{rightActions}</div>}
    </div>
  );
}
