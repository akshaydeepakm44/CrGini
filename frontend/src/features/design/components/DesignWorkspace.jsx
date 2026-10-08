import React from 'react';
import AuditWorkspace from './AuditWorkspace';
import FigmaWorkspace from './FigmaWorkspace';
import RedesignWorkspace from './RedesignWorkspace';

export default function DesignWorkspace({
  ticket,
  submissions = [],
  onOpenUploadDeliverable,
  onPreviewFile,
}) {
  if (!ticket) return null;

  const category = ticket.service?.category || 'redesign';

  if (category === 'audit') {
    return (
      <AuditWorkspace
        ticket={ticket}
        submissions={submissions}
        onOpenUploadDeliverable={onOpenUploadDeliverable}
        onPreviewFile={onPreviewFile}
      />
    );
  }

  if (category === 'figma') {
    return (
      <FigmaWorkspace
        ticket={ticket}
        submissions={submissions}
        onOpenUploadDeliverable={onOpenUploadDeliverable}
        onPreviewFile={onPreviewFile}
      />
    );
  }

  return (
    <RedesignWorkspace
      ticket={ticket}
      submissions={submissions}
      onOpenUploadDeliverable={onOpenUploadDeliverable}
      onPreviewFile={onPreviewFile}
    />
  );
}
