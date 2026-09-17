import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: String, default: '' },
  type: { type: String, default: 'application/octet-stream' }
}, { _id: true });

const DeliverableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  deliveredAt: { type: Date, default: Date.now }
}, { _id: true });

const RequestSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Requirement description is required']
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: [
      'REQUEST_CREATED',
      'PAYMENT_COMPLETED',
      'ASSIGNED',
      'IN_PROGRESS',
      'WORK_SUBMITTED',
      'CLIENT_REVIEW',
      'CHANGES_REQUESTED',
      'WORK_RESUBMITTED',
      'APPROVED',
      'COMPLETED'
    ],
    default: 'REQUEST_CREATED'
  },
  price: {
    type: Number,
    required: true,
    default: 299
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED'],
    default: 'PENDING'
  },
  assignedTeam: {
    type: String,
    default: 'CreativeGini Core Team'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  currentSubmissionVersion: {
    type: Number,
    default: 0
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  adminOverride: {
    isOverridden: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    overriddenAt: { type: Date, default: null }
  },
  attachments: [AttachmentSchema],
  deliverables: [DeliverableSchema],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', RequestSchema);
