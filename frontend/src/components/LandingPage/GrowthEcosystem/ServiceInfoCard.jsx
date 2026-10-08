import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * ServiceInfoCard Component
 * Displays the selected service details popover with category, title, description, and CTA.
 */
export default function ServiceInfoCard({
  service,
  onClose,
  onExplore,
  onMouseEnter,
  onMouseLeave
}) {
  if (!service) return null;

  const { name, category, desc, icon: IconComponent, color } = service;
  const isBoosting = category === 'Boosting';

  return (
    <aside
      className="cg-service-card-popover"
      aria-label={`${name} details`}
      role="region"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="cg-card-header">
        <span
          className="cg-card-category-pill"
          style={{
            background: isBoosting ? '#FCE7F3' : '#EDE9FE',
            color: isBoosting ? '#BE185D' : '#6D28D9'
          }}
        >
          {category}
        </span>
        <div className="cg-card-status-badge">
          <span
            className="cg-card-status-pulse"
            style={{ background: isBoosting ? '#EC4899' : '#8B5CF6' }}
          />
          <span>Active Spec</span>
        </div>
      </div>

      <h4 className="cg-card-title">
        {IconComponent && (
          <span
            className="cg-card-title-icon"
            style={{
              background: isBoosting ? '#FDF2F8' : '#F5F3FF',
              color: isBoosting ? '#DB2777' : '#7C3AED'
            }}
          >
            <IconComponent size={16} />
          </span>
        )}
        {name}
      </h4>

      <p className="cg-card-desc">{desc}</p>

      <button
        type="button"
        className="cg-card-action-btn"
        onClick={() => onExplore && onExplore(service)}
      >
        <span>Explore Service</span>
        <ArrowRight size={14} />
      </button>
    </aside>
  );
}
