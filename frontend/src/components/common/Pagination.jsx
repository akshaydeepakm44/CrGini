import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
  style = {},
}) {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      className={`cg-pagination ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--cg-border-light)',
        fontSize: '0.84375rem',
        color: 'var(--cg-text-secondary)',
        flexWrap: 'wrap',
        gap: '12px',
        ...style,
      }}
    >
      <div>
        {totalItems !== undefined ? (
          <span>
            Showing <strong style={{ color: 'var(--cg-text-primary)' }}>{startItem}</strong> to{' '}
            <strong style={{ color: 'var(--cg-text-primary)' }}>{endItem}</strong> of{' '}
            <strong style={{ color: 'var(--cg-text-primary)' }}>{totalItems}</strong> entries
          </span>
        ) : (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--cg-radius-sm)',
            border: '1px solid var(--cg-border)',
            background: '#FFFFFF',
            color: currentPage <= 1 ? 'var(--cg-text-disabled)' : 'var(--cg-text-primary)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all var(--cg-transition-fast)',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange && onPageChange(page)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--cg-radius-sm)',
              border: `1px solid ${page === currentPage ? 'var(--cg-purple-500)' : 'var(--cg-border)'}`,
              background: page === currentPage ? 'var(--cg-purple-600)' : '#FFFFFF',
              color: page === currentPage ? '#FFFFFF' : 'var(--cg-text-primary)',
              fontWeight: page === currentPage ? 700 : 500,
              cursor: 'pointer',
              transition: 'all var(--cg-transition-fast)',
            }}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--cg-radius-sm)',
            border: '1px solid var(--cg-border)',
            background: '#FFFFFF',
            color: currentPage >= totalPages ? 'var(--cg-text-disabled)' : 'var(--cg-text-primary)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all var(--cg-transition-fast)',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
