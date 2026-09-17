import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  UserPlus,
  CreditCard,
  ShieldAlert
} from 'lucide-react';

export default function ActivityTimeline({ logs = [], activity = [] }) {
  const data = (logs && logs.length > 0) ? logs : (activity || []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'REQUEST_CREATED':
        return <Clock size={14} color="#00D9FF" />;
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_COMPLETED':
        return <CreditCard size={14} color="#34d399" />;
      case 'TICKET_ASSIGNED':
        return <UserPlus size={14} color="#a855f7" />;
      case 'WORK_STARTED':
        return <Clock size={14} color="#00D9FF" />;
      case 'WORK_SUBMITTED':
      case 'WORK_RESUBMITTED':
        return <FileCheck size={14} color="#00D9FF" />;
      case 'CHANGES_REQUESTED':
        return <RotateCcw size={14} color="#FFB000" />;
      case 'WORK_APPROVED':
      case 'STATUS_COMPLETED':
        return <CheckCircle2 size={14} color="#34d399" />;
      case 'ADMIN_OVERRIDE':
        return <ShieldAlert size={14} color="#f87171" />;
      default:
        return <Clock size={14} color="#8fa0b5" />;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ color: '#8fa0b5', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>
        No activity logged yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((log, idx) => (
        <div
          key={log._id || idx}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            position: 'relative'
          }}
        >
          {/* Timeline node */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(4, 12, 18, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}
          >
            {getActionIcon(log.action)}
          </div>

          {/* Timeline content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#FFFFFF' }}>
                {log.action?.replace(/_/g, ' ')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#8fa0b5', flexShrink: 0 }}>
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>
              {log.details || log.action}
            </div>
            {log.userName && (
              <div style={{ fontSize: '0.7rem', color: '#8fa0b5', marginTop: '2px' }}>
                By: <span style={{ color: '#00D9FF' }}>{log.userName}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
