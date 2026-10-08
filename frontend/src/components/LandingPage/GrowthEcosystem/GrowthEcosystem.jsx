import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  Building2, 
  Users, 
  Compass, 
  PenTool, 
  Code, 
  Rocket, 
  Palette,
  Sparkles
} from 'lucide-react';
import OrbitRing from './OrbitRing';
import OrbitNode from './OrbitNode';
import ServiceInfoCard from './ServiceInfoCard';

const RINGS = [
  { id: 0, radius: 135, stroke: 'rgba(196, 181, 253, 0.45)', strokeDasharray: '4 6', strokeWidth: 1.2, rotationClass: 'cg-ring-rotation-1' },
  { id: 1, radius: 195, stroke: 'rgba(244, 114, 182, 0.35)', strokeDasharray: '6 8', strokeWidth: 1.2, rotationClass: 'cg-ring-rotation-2' },
  { id: 2, radius: 250, stroke: 'rgba(147, 197, 253, 0.38)', strokeDasharray: '5 9', strokeWidth: 1.2, rotationClass: 'cg-ring-rotation-3' }
];

const SERVICE_NODES = [
  {
    id: 'lead-research',
    name: 'Lead Research',
    category: 'Digitalising',
    ringIndex: 0,
    ringRadius: 135,
    angleDeg: 35,
    color: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    icon: Target,
    desc: 'Find high-intent accounts and verified prospect contact intelligence tailored to your ideal customer profile.',
    floatDelay: 0
  },
  {
    id: 'company-study',
    name: 'Company Study',
    category: 'Digitalising',
    ringIndex: 1,
    ringRadius: 195,
    angleDeg: 80,
    color: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    icon: Building2,
    desc: 'Deep organizational dossiers, tech stack telemetry, and strategic expansion insights for target accounts.',
    floatDelay: 0.4
  },
  {
    id: 'key-people',
    name: 'Key People',
    category: 'Digitalising',
    ringIndex: 2,
    ringRadius: 250,
    angleDeg: 135,
    color: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    icon: Users,
    desc: 'Direct access to verified decision-makers, direct emails, and key leadership reporting structures.',
    floatDelay: 0.8
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Boosting',
    ringIndex: 0,
    ringRadius: 135,
    angleDeg: 175,
    color: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
    icon: Palette,
    desc: 'Bespoke UI/UX landing mockups, brand assets, and interactive product presentation materials.',
    floatDelay: 1.2
  },
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'Boosting',
    ringIndex: 0,
    ringRadius: 135,
    angleDeg: 220,
    color: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    icon: Compass,
    desc: 'Comprehensive growth positioning, ICP narrative frameworks, and quarterly multi-channel execution plans.',
    floatDelay: 1.6
  },
  {
    id: 'content',
    name: 'Content',
    category: 'Boosting',
    ringIndex: 1,
    ringRadius: 195,
    angleDeg: 265,
    color: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
    icon: PenTool,
    desc: 'High-conversion sales collateral, technical thought leadership essays, and engaging executive copy.',
    floatDelay: 2.0
  },
  {
    id: 'devrel',
    name: 'DevRel',
    category: 'Boosting',
    ringIndex: 2,
    ringRadius: 250,
    angleDeg: 310,
    color: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    icon: Code,
    desc: 'Developer advocacy, technical community engagement, and developer-first product positioning.',
    floatDelay: 2.4
  },
  {
    id: 'gtm',
    name: 'GTM',
    category: 'Boosting',
    ringIndex: 1,
    ringRadius: 195,
    angleDeg: 355,
    color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    icon: Rocket,
    desc: 'Go-to-market outbound playbooks, sequence templates, and targeted expansion strategies.',
    floatDelay: 2.8
  }
];

export default function GrowthEcosystem({ onSelectService, onExploreService }) {
  const [activeNode, setActiveNode] = useState(null); // Clean start: reveals dynamically on hover
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => {
      window.removeEventListener('resize', checkWidth);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleNodeMouseEnter = (node) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveNode(node);
    setHoveredNodeId(node.id);
    if (onSelectService) onSelectService(node);
  };

  const handleNodeMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setActiveNode(null);
      setHoveredNodeId(null);
    }, 280);
  };

  const handleCardMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setActiveNode(null);
      setHoveredNodeId(null);
    }, 250);
  };

  const handleNodeClick = (node) => {
    setActiveNode(node);
    handleExplore(node);
  };

  const handleExplore = (service) => {
    if (onExploreService) {
      onExploreService(service);
    } else {
      const target = document.getElementById('services');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Highlight ring associated with currently hovered or active node
  const activeRingIndex = hoveredNodeId 
    ? SERVICE_NODES.find(n => n.id === hoveredNodeId)?.ringIndex 
    : (activeNode ? activeNode.ringIndex : null);

  return (
    <div className="cg-ecosystem-wrapper" aria-label="CreativeGini Growth Ecosystem Visualization">
      <div className="cg-orbit-canvas">
        {/* Orbital SVG Rings */}
        <svg
          viewBox="0 0 560 560"
          className="cg-orbit-svg-container"
          aria-hidden="true"
        >
          {RINGS.map((ring) => (
            <OrbitRing
              key={ring.id}
              radius={ring.radius}
              stroke={ring.stroke}
              strokeDasharray={ring.strokeDasharray}
              strokeWidth={ring.strokeWidth}
              isHighlighted={activeRingIndex === ring.id}
              rotationClass={ring.rotationClass}
            />
          ))}
        </svg>

        {/* Central Core Hub: CreativeGini */}
        <div 
          className="cg-center-hub"
          title="CreativeGini Growth Core"
          onMouseEnter={() => handleNodeMouseEnter(SERVICE_NODES[0])}
          onMouseLeave={handleNodeMouseLeave}
          onClick={() => handleNodeClick(SERVICE_NODES[0])}
        >
          <div className="cg-center-pulse-ring" />
          <img
            src="/logo-icon.png"
            alt="CreativeGini Core"
            className="cg-center-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="cg-center-title">CreativeGini</span>
          <span className="cg-center-subtitle">Ecosystem</span>
        </div>

        {/* Service Nodes: Desktop Polar Layout */}
        {!isMobile && SERVICE_NODES.map((node) => (
          <OrbitNode
            key={node.id}
            node={node}
            isActive={activeNode?.id === node.id}
            isHovered={hoveredNodeId === node.id}
            onClick={handleNodeClick}
            onHover={handleNodeMouseEnter}
            onLeave={handleNodeMouseLeave}
            center={280}
          />
        ))}

        {/* Mobile Simplified Layout: Clean 2-column grid of nodes */}
        {isMobile && (
          <div className="cg-mobile-nodes-grid">
            {SERVICE_NODES.map((node) => {
              const IconComp = node.icon;
              const isSelected = activeNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  className={`cg-orbit-node ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    if (activeNode?.id === node.id) {
                      handleExplore(node);
                    } else {
                      setActiveNode(node);
                    }
                  }}
                >
                  <div className="cg-orbit-node-inner">
                    <div
                      className="cg-node-icon-box"
                      style={{ background: node.color }}
                    >
                      <IconComp size={15} />
                    </div>
                    <span className="cg-node-label">{node.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Active Service Popover Card on Hover */}
        {activeNode ? (
          <ServiceInfoCard
            key={activeNode.id}
            service={activeNode}
            onClose={() => setActiveNode(null)}
            onExplore={handleExplore}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        ) : (
          !isMobile && (
            <div className="cg-ecosystem-idle-hint" aria-hidden="true">
              <Sparkles size={13} className="cg-sparkle-icon" />
              <span>Hover any node to inspect capabilities</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
