import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Sparkles } from 'lucide-react';
import DesignRequestQueue from '../components/DesignRequestQueue';

export default function UIUXAuditsPage({ requests = [], metrics = {}, onRefresh }) {
  const navigate = useNavigate();

  // Filter requests specifically for UI/UX Audits
  const auditRequests = requests.filter((r) => r.serviceSlug === 'ui-ux-audit');

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#F0F9FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={18} />
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
            UI / UX Audits Workspace
          </h1>
        </div>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Conduct heuristic assessments across usability, visual hierarchy, navigation, interaction patterns, and WCAG accessibility.
        </p>
      </div>

      <DesignRequestQueue
        requests={auditRequests}
        metrics={metrics}
        initialService="ui-ux-audit"
        onSelectRequest={(req) => navigate(`/design/requests/${req.ticketId || req.id}`)}
      />
    </div>
  );
}
