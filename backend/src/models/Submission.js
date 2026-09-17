import mongoose from 'mongoose';

const DeliverableFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, default: '' },
  size: { type: String, default: '' },
  type: { type: String, default: 'application/octet-stream' }
}, { _id: true });

const ReviewSchema = new mongoose.Schema({
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewerName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['APPROVED', 'CHANGES_REQUESTED'],
    required: true
  },
  feedback: {
    type: String,
    default: ''
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const SubmissionSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    index: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  title: {
    type: String,
    required: [true, 'Submission title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Submission description is required']
  },
  files: [DeliverableFileSchema],
  externalLink: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedByName: {
    type: String,
    default: 'CreativeGini Team'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
    default: 'PENDING_REVIEW'
  },
  review: {
    type: ReviewSchema,
    default: null
  }
}, {
  timestamps: true
});

// Composite index for fast version queries
SubmissionSchema.index({ ticketId: 1, version: -1 });

export default mongoose.model('Submission', SubmissionSchema);
