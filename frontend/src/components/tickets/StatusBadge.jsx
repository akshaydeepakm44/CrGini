import React from 'react';
import Badge from '../common/Badge';
import {
  Clock,
  UserCheck,
  PlayCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign
} from 'lucide-react';

/**
 * Reusable StatusBadge Component
 * Unified across Client, Lead, Boost, UI, and Admin Portals
 * Formats lifecycle states into clean, color-coded badges
 */
export default function StatusBadge({ status, size = 'md', showIcon = true, className = '', style = {} }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase().trim();

  const statusConfig = {
    // 1. Initial Creation
    REQUEST_CREATED: {
      label: 'Submitted',
      variant: 'purple',
      icon: Clock,
    },
    SUBMITTED: {
      label: 'Submitted',
      variant: 'purple',
      icon: Clock,
    },

    // 2. Assignment (mapped to In Progress)
    ASSIGNED: {
      label: 'In Progress',
      variant: 'blue',
      icon: PlayCircle,
    },

    // 3. In Progress
    IN_PROGRESS: {
      label: 'In Progress',
      variant: 'blue',
      icon: PlayCircle,
    },

    // 4. Client Review
    CLIENT_REVIEW: {
      label: 'Client Review',
      variant: 'purple',
      icon: Eye,
    },
    WORK_SUBMITTED: {
      label: 'Client Review',
      variant: 'purple',
      icon: Eye,
    },
    WORK_RESUBMITTED: {
      label: 'Revised Review',
      variant: 'purple',
      icon: Eye,
    },

    // 5. Revision Requested
    CHANGES_REQUESTED: {
      label: 'Changes Requested',
      variant: 'coral',
      icon: AlertCircle,
    },

    // 6. Approved / Verified
    APPROVED: {
      label: 'Approved',
      variant: 'mint',
      icon: CheckCircle2,
    },
    VERIFIED: {
      label: 'Verified',
      variant: 'mint',
      icon: CheckCircle2,
    },

    // 7. Completed
    COMPLETED: {
      label: 'Completed',
      variant: 'mint',
      icon: CheckCircle2,
    },

    // 8. Payment States
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      variant: 'amber',
      icon: CreditCard,
    },
    PENDING: {
      label: 'Pending',
      variant: 'amber',
      icon: Clock,
    },
    PAID: {
      label: 'Paid',
      variant: 'mint',
      icon: DollarSign,
    },
  };

  const config = statusConfig[normalized] || {
    label: normalized.replace(/_/g, ' '),
    variant: 'gray',
    icon: Clock,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : null}
      className={`cg-status-badge ${className}`}
      style={style}
    >
      {config.label}
    </Badge>
  );
}
