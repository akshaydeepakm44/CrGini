import React from 'react';
import { UserPlus, Plus } from 'lucide-react';

export default function TeamView({ user }) {
  return (
    <div className="dash-tab-container">
      <div className="dash-panel glass-card">
        <div className="panel-header">
          <h3><UserPlus size={18} className="icon-purple" /> Team Members & Access Permissions</h3>
          <button className="btn-primary btn-sm"><Plus size={14} /> Invite Member</button>
        </div>

        <div className="team-list" style={{ marginTop: '20px' }}>
          <div className="team-member-item">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="User"
              className="team-avatar"
            />
            <div className="team-member-info">
              <span className="team-member-name">{user?.name || 'Enterprise Admin'} (You)</span>
              <span className="team-member-email">{user?.email || 'admin@creativegini.ai'}</span>
            </div>
            <span className="role-tag-pill">Super Admin / Owner</span>
          </div>

          <div className="team-member-item">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="User"
              className="team-avatar"
            />
            <div className="team-member-info">
              <span className="team-member-name">Alex Rivera</span>
              <span className="team-member-email">alex.r@creativegini.ai</span>
            </div>
            <span className="tag purple">DevRel Lead</span>
          </div>

          <div className="team-member-item">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="User"
              className="team-avatar"
            />
            <div className="team-member-info">
              <span className="team-member-name">Elena Rostova</span>
              <span className="team-member-email">elena.r@creativegini.ai</span>
            </div>
            <span className="tag blue">Creative Director</span>
          </div>
        </div>
      </div>
    </div>
  );
}
