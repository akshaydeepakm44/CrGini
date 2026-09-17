import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    default: 'System'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityLog', ActivityLogSchema);
