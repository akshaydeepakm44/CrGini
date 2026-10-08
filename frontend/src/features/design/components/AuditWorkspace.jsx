import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  LayoutTemplate,
  Palette,
  Sliders,
  Smartphone,
  Gauge,
  Sparkles,
  CheckCircle2,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Building,
  RefreshCw,
  Bot,
  ShieldCheck,
  Globe,
  ArrowRight,
  CheckSquare,
  Square
} from 'lucide-react';
import DesignAssetList from './DesignAssetList';
import { generateAuditChecklist } from '../utils/qwenAuditGenerator';

export default function AuditWorkspace({
  ticket,
  onOpenUploadDeliverable,
  onPreviewFile,
}) {
  if (!ticket) return null;

  const [activeDimension, setActiveDimension] = useState('usability');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [checkedMap, setCheckedMap] = useState({});
  const [observations, setObservations] = useState({});

  const dimensions = [
    { key: 'usability', label: 'Usability & Friction', icon: Eye, color: '#0284C7', desc: 'Clarity of task flows, callout legibility, cognitive burden, and ease of completing key conversions.' },
    { key: 'navigation', label: 'Navigation & IA', icon: LayoutTemplate, color: '#059669', desc: 'Menu architecture, header layout, category taxonomy, breadcrumb hierarchy, and discoverability.' },
    { key: 'visualHierarchy', label: 'Visual Hierarchy & Typography', icon: Palette, color: '#8B5CF6', desc: 'Focal landmarks, typographic scale, font weight contrasts, and white space rhythm.' },
    { key: 'interaction', label: 'Interaction & Micro-States', icon: Sliders, color: '#D97706', desc: 'Hover feedback, button states, interactive form validations, and error messaging ergonomics.' },
    { key: 'responsive', label: 'Responsive Adaptability', icon: Smartphone, color: '#EC4899', desc: 'Fluid layout behavior, touch targets (min 44px), stacking order across mobile and tablet viewports.' },
    { key: 'accessibility', label: 'Accessibility (WCAG)', icon: Gauge, color: '#4B5563', desc: 'Color contrast ratio compliance (4.5:1 text), focus indicators, and semantic heading structures.' },
    { key: 'conversion', label: 'Conversion & Funnel Flow', icon: Sparkles, color: '#E11D48', desc: 'Primary value proposition visibility, objection reduction, and friction points in the checkout/lead funnel.' }
  ];

  const currentDim = dimensions.find((d) => d.key === activeDimension) || dimensions[0];
  const CurrentIcon = currentDim.icon;

  // Generate dynamic checklist for current dimension
  const currentChecklist = generateAuditChecklist(ticket, currentDim.key, currentDim.label);

  const toggleCheck = (idx) => {
    const key = `${currentDim.key}_${idx}`;
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerateAi = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
    }, 600);
  };

  // Extract any target website URL or client links
  const targetUrl = ticket.websiteUrl || ticket.targetUrl || ticket.figmaUrl || (
    typeof ticket.description === 'string' && ticket.description.match(/https?:\/\/[^\s]+/)
      ? ticket.description.match(/https?:\/\/[^\s]+/)[0]
      : null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Guidance */}
      <div
        style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                UI / UX Audit Operational Workspace
              </h3>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid #BAE6FD',
                }}
              >
                Specialist Heuristic Guidelines
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#0369A1', margin: 0 }}>
              Step 1: Inspect client brief heuristics via specialist audit checklists. Step 2: Confirm client requirements & upload documentation.
            </p>
          </div>
        </div>

        {onOpenUploadDeliverable && (
          <button
            type="button"
            onClick={onOpenUploadDeliverable}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Upload size={16} />
            <span>Upload Deliverables (Docs / Blueprint)</span>
          </button>
        )}
      </div>

      {/* Main Grid: Dimensions Navigation (Left) + Focused Observation Panel (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Left: Audit Dimension Selector */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#64748B',
              letterSpacing: '0.05em',
              padding: '4px 8px 8px',
            }}
          >
            Evaluation Dimensions
          </div>

          {dimensions.map((dim) => {
            const isSelected = activeDimension === dim.key;
            const Icon = dim.icon;
            return (
              <div
                key={dim.key}
                onClick={() => setActiveDimension(dim.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#F0F9FF' : 'transparent',
                  border: isSelected ? '1px solid #BAE6FD' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#0284C7' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : dim.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#0284C7' : '#1E293B',
                    }}
                  >
                    {dim.label}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  style={{ color: isSelected ? '#0284C7' : '#CBD5E1', flexShrink: 0 }}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Dimension Detail & Working Guide */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Dimension Header */}
          <div
            style={{
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#F0F9FF',
                  color: currentDim.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CurrentIcon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0' }}>
                  {currentDim.label}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                  {currentDim.desc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegenerateAi}
              disabled={isAiGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #BAE6FD',
                backgroundColor: '#F0F9FF',
                color: '#0284C7',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: isAiGenerating ? 'default' : 'pointer',
              }}
            >
              <RefreshCw size={13} className={isAiGenerating ? 'animate-spin' : ''} />
              <span>{isAiGenerating ? 'Synthesizing...' : 'Refresh Heuristic Checklist'}</span>
            </button>
          </div>

          {/* 1. Client Product Context & Target Brief */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', margin: 0 }}>
                Client Product Context & Target Brief
              </h5>
              {targetUrl && (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0284C7',
                    textDecoration: 'none',
                  }}
                >
                  <Globe size={13} />
                  <span>Open Client Website / Target URL</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.875rem',
                color: '#334155',
                lineHeight: '1.6',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                {ticket.title}
              </div>
              <div>{ticket.description || 'No additional client notes provided.'}</div>
              {ticket.requirements && Object.keys(ticket.requirements).length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontSize: '0.78125rem', color: '#64748B' }}>
                  <strong>Client Brief Parameters:</strong> {JSON.stringify(ticket.requirements)}
                </div>
              )}
            </div>
          </div>

          {/* 2. Step 1: Specialist Heuristic Audit Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                  STEP 1
                </span>
                <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', margin: 0 }}>
                  Specialist Heuristic Audit Checklist
                </h5>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Synthesized from Client Brief
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentChecklist.map((item, idx) => {
                const isChecked = Boolean(checkedMap[`${currentDim.key}_${idx}`]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: isChecked ? '#F0FDF4' : '#FAFAFA',
                      border: isChecked ? '1px solid #BBF7D0' : '1px solid #F1F5F9',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: isChecked ? '#166534' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    {isChecked ? (
                      <CheckSquare size={17} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Square size={17} style={{ color: '#94A3B8', flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span style={{ textDecoration: isChecked ? 'line-through' : 'none', flex: 1, lineHeight: '1.45' }}>
                      {item}
                    </span>
                    {isChecked && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16A34A', flexShrink: 0 }}>
                        [Verified]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Specialist Dimension Findings & Observation Notes */}
          <div>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', margin: '0 0 8px 0' }}>
              Specialist Findings & Observation for {currentDim.label}
            </h5>
            <textarea
              rows={3}
              value={observations[currentDim.key] || ''}
              onChange={(e) => setObservations({ ...observations, [currentDim.key]: e.target.value })}
              placeholder={`Record your audit findings, heuristic severity, and recommended fixes for ${currentDim.label}...`}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          {/* 4. Reference Material / Client Files */}
          <div>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', margin: '0 0 8px 0' }}>
              Client Reference Files & Attachments ({ticket.attachments?.length || 0})
            </h5>
            <DesignAssetList
              assets={ticket.attachments || []}
              onPreviewFile={onPreviewFile}
              emptyMessage="No reference files or URLs attached by the client partner"
            />
          </div>

          {/* 5. Step 2 Handoff Callout */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#7C3AED', color: '#FFFFFF' }}>
                  STEP 2
                </span>
                <strong style={{ fontSize: '0.875rem', color: '#581C87' }}>
                  Confirm Client Requirements & Send Deliverables
                </strong>
              </div>
              <p style={{ fontSize: '0.78125rem', color: '#6B21A8', margin: '4px 0 0 0' }}>
                Create confirmation documentation proving client needfuls are met, upload Figma blueprint / docs, and submit for client approval.
              </p>
            </div>

            {onOpenUploadDeliverable && (
              <button
                type="button"
                onClick={onOpenUploadDeliverable}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                }}
              >
                <span>Upload Step 2 Deliverables</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
