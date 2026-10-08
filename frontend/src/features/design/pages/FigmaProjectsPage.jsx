import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Layers, ExternalLink } from 'lucide-react';
import DesignRequestQueue from '../components/DesignRequestQueue';

export default function FigmaProjectsPage({ requests = [], metrics = {}, onRefresh }) {
  const navigate = useNavigate();

  // Filter requests specifically for Figma Projects
  const figmaRequests = requests.filter((r) => r.serviceSlug === 'figma-project');

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#F5F3FF',
              color: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PenTool size={18} />
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
            Figma Projects Studio
          </h1>
        </div>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Manage design system components, auto-layout responsive frames, and client-shared Figma project canvases.
        </p>
      </div>

      <DesignRequestQueue
        requests={figmaRequests}
        metrics={metrics}
        initialService="figma-project"
        onSelectRequest={(req) => navigate(`/design/requests/${req.ticketId || req.id}`)}
      />
    </div>
  );
}
