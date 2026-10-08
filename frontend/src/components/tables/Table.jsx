import React from 'react';
import EmptyState from '../common/EmptyState';
import { Skeleton } from '../common/LoadingState';

/**
 * Reusable Responsive Table Component
 * Clean modern table matching the "My Active Requests" table in the reference mockup
 */
export default function Table({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  onRowClick,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`cg-table-wrapper ${className}`}
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--cg-radius-lg)',
        border: '1px solid var(--cg-border-light)',
        boxShadow: 'var(--cg-shadow-card)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: 'var(--cg-font-family)',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--cg-bg-card-subtle)',
                borderBottom: '1px solid var(--cg-border-light)',
              }}
            >
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  style={{
                    padding: '14px 18px',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--cg-text-muted)',
                    textAlign: col.align || 'left',
                    width: col.width || 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--cg-border-light)' }}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: '16px 18px' }}>
                      <Skeleton height="16px" width={cIdx === 0 ? '60px' : '85%'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--cg-border-light)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color var(--cg-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cg-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((col, colIndex) => {
                    const cellContent = col.render ? col.render(row[col.key], row, rowIndex) : row[col.key];

                    return (
                      <td
                        key={col.key || colIndex}
                        style={{
                          padding: '16px 18px',
                          fontSize: '0.875rem',
                          color: 'var(--cg-text-primary)',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle',
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
