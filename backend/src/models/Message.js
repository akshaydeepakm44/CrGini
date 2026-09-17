import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE', 'USER'],
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required']
  },
  attachments: [{
    name: String,
    url: String,
    size: String
  }],
  isInternalNote: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Message', MessageSchema);
