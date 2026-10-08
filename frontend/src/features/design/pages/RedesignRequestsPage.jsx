import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers } from 'lucide-react';
import DesignRequestQueue from '../components/DesignRequestQueue';

export default function RedesignRequestsPage({ requests = [], metrics = {}, onRefresh }) {
  const navigate = useNavigate();

  // Filter requests specifically for Redesign Requests
  const redesignRequests = requests.filter((r) => r.serviceSlug === 'redesign-request');

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FDF2F8',
              color: '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            Redesign Requests Workspace
          </h1>
        </div>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Deliver full-page layout overhauls, high-impact hero sections, and conversion-optimized visual systems.
        </p>
      </div>

      <DesignRequestQueue
        requests={redesignRequests}
        metrics={metrics}
        initialService="redesign-request"
        onSelectRequest={(req) => navigate(`/design/requests/${req.ticketId || req.id}`)}
      />
    </div>
  );
}
