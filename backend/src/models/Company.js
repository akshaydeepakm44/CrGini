import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  email: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  location: { type: String, default: '' },
  status: { type: String, default: 'Verified' },
  notes: { type: String, default: '' }
}, { _id: true });

const KeyPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  department: { type: String, default: '' },
  contact: { type: String, default: '' },
  socialProfile: { type: String, default: '' }
}, { _id: true });

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Company contact email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: 'Technology / SaaS'
  },
  companyInfo: {
    type: String,
    default: ''
  },
  researchSummary: {
    type: String,
    default: 'CreativeGini pre-market analysis and growth opportunity report.'
  },
  initialLeads: [LeadSchema],
  initialKeyPeople: [KeyPersonSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', CompanySchema);
