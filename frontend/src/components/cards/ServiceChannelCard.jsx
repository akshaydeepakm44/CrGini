import React from 'react';
import { Rocket, Search, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';

/**
 * Reusable ServiceChannelCard Component
 * Prominently presents the two core Service Channels: BOOSTING & DIGITALISING
 * Matches the bottom right "Service Channels" cards in the reference mockup
 */
export default function ServiceChannelCard({
  channel = 'boosting', // 'boosting' | 'digitalising'
  title,
  description,
  servicesList = [],
  onExplore,
  className = '',
  style = {},
}) {
  const channelConfig = {
    boosting: {
      defaultTitle: 'Boosting',
      defaultDesc: 'Grow your brand, content and market presence with specialist campaigns.',
      defaultServices: ['Strategic Planner', 'Content Creator', 'DevRel'],
      icon: Rocket,
      bg: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
      border: 'var(--cg-purple-200)',
      iconBg: 'var(--cg-purple-100)',
      iconColor: 'var(--cg-purple-600)',
      buttonVariant: 'primary',
      pillColor: 'purple',
    },
    digitalising: {
      defaultTitle: 'Digitalising',
      defaultDesc: 'Research, insights and business intelligence for high-conviction decisions.',
      defaultServices: ['Lead Research', 'Company Study', 'Key People Research', 'Pitch Support'],
      icon: Search,
      bg: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
      border: 'var(--cg-blue-200)',
      iconBg: 'var(--cg-blue-100)',
      iconColor: 'var(--cg-blue-600)',
      buttonVariant: 'primary',
      pillColor: 'blue',
    },
  };

  const config = channelConfig[channel.toLowerCase()] || channelConfig.boosting;
  const Icon = config.icon;
  const effectiveTitle = title || config.defaultTitle;
  const effectiveDesc = description || config.defaultDesc;
  const effectiveServices = servicesList.length > 0 ? servicesList : config.defaultServices;

  return (
    <div
      className={`cg-service-channel-card cg-channel-${channel} ${className}`}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--cg-radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--cg-shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all var(--cg-transition-normal)',
        minHeight: '220px',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-card)';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: config.iconBg,
              color: config.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: config.iconColor,
              padding: '3px 10px',
              borderRadius: 'var(--cg-radius-pill)',
              backgroundColor: config.iconBg,
            }}
          >
            Service Channel
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--cg-font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--cg-text-primary)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
          }}
        >
          {effectiveTitle}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--cg-text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
          }}
        >
          {effectiveDesc}
        </p>

        {effectiveServices && effectiveServices.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {effectiveServices.map((svc, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 'var(--cg-radius-sm)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--cg-border-light)',
                  color: 'var(--cg-text-secondary)',
                }}
              >
                {svc}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <Button
          variant={config.buttonVariant}
          size="md"
          iconRight={ArrowRight}
          fullWidth
          onClick={onExplore}
        >
          Explore Services
        </Button>
      </div>
    </div>
  );
}
