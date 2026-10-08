import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Reusable Sync Queue button positioned at the top of every dashboard
 * Allows manual real-time re-synchronization with backend operational queues.
 */
export default function SyncQueueButton({
  onSync,
  isSyncing = false,
  lastSyncedAt = null,
  label = 'Sync Queue',
  style = {},
}) {
  const [internalTime, setInternalTime] = useState(() => new Date());

  const handleSync = async () => {
    if (isSyncing || !onSync) return;
    await onSync();
    setInternalTime(new Date());
  };

  const displayTime = lastSyncedAt ? new Date(lastSyncedAt) : internalTime;
  const timeString = displayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        title="Synchronize and refresh live operational queue from server"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid #D1D5DB',
          backgroundColor: '#FFFFFF',
          color: '#374151',
          fontSize: '0.8125rem',
          fontWeight: 700,
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isSyncing) {
            e.currentTarget.style.backgroundColor = '#FAF5FF';
            e.currentTarget.style.borderColor = '#C4B5FD';
            e.currentTarget.style.color = '#6D28D9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSyncing) {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.color = '#374151';
          }
        }}
      >
        <RefreshCw
          size={14}
          color="#7C3AED"
          style={{
            animation: isSyncing ? 'cg-spin 0.8s linear infinite' : 'none',
            flexShrink: 0,
          }}
        />
        <span>{isSyncing ? 'Syncing Queue...' : label}</span>
      </button>

      <span
        style={{
          fontSize: '0.72rem',
          color: '#6B7280',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
        title="Last real-time synchronization time"
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isSyncing ? '#F59E0B' : '#10B981',
            display: 'inline-block',
          }}
        />
        {isSyncing ? 'Updating...' : `Live (${timeString})`}
      </span>

      <style>{`
        @keyframes cg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
