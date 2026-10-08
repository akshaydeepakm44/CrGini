import React, { useState, useEffect } from 'react';
import { X, UserCheck, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ReassignModal({
  isOpen,
  onClose,
  ticket,
  specialists = [],
  onReassign,
  isSubmitting = false
}) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Company Lead Team');
  const [dueDate, setDueDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (ticket) {
      setSelectedSpecialistId(ticket.assignedTo || ticket.specialist?.id || '');
      setSelectedTeam(ticket.assignedTeam || 'Company Lead Team');
      if (ticket.dueDate) {
        try {
          setDueDate(new Date(ticket.dueDate).toISOString().split('T')[0]);
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
      setReason('');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onReassign({
      assignedTo: selectedSpecialistId ? Number(selectedSpecialistId) : null,
      assignedTeam: selectedTeam,
      dueDate: dueDate || null,
      reason: reason.trim()
    });
  };

  return (
    <div className="cg-modal-backdrop">
      <div className="cg-modal-box cg-reassign-modal">
        <div className="cg-modal-header">
          <div className="cg-modal-header-icon">
            <UserCheck size={20} className="text-info" />
          </div>
          <div className="cg-modal-header-text">
            <h3 className="cg-modal-title">Assign / Reassign Ticket</h3>
            <span className="cg-modal-subtitle">{ticket.ticketId}: {ticket.title}</span>
          </div>
          <button className="cg-modal-close" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cg-modal-body">
            <div className="cg-form-group">
              <label className="cg-form-label">Service Team Assignment</label>
              <select
                className="cg-form-select"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Company Lead Team">Company Lead Team (Digitalising)</option>
                <option value="Company Boost Team">Company Boost Team (Growth / Strategy)</option>
                <option value="Landing Page Enhancement Team">Landing Page & UI/UX Team</option>
              </select>
            </div>

            <div className="cg-form-group">
              <label className="cg-form-label">Assign Specialist Specialist</label>
              <select
                className="cg-form-select"
                value={selectedSpecialistId}
                onChange={(e) => setSelectedSpecialistId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">-- Unassigned (Team Pool) --</option>
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role}) - {s.activeCount || 0} active tickets
                  </option>
                ))}
              </select>
            </div>

            <div className="cg-form-group">
              <label className="cg-form-label">Target Completion Due Date</label>
              <input
                type="date"
                className="cg-form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="cg-form-group">
              <label className="cg-form-label">Operational Note / Reason</label>
              <textarea
                className="cg-form-textarea"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional assignment note for audit history..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="cg-modal-footer">
            <button type="button" className="cg-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="cg-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
