import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="glass-toast">
      <div className="toast-icon">✓</div>
      <div className="toast-message">{message}</div>
    </div>
  );
}
