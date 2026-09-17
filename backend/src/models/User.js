import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE', 'USER'],
    default: 'USER'
  },
  dashboardAccess: {
    companyBoost: {
      type: Boolean,
      default: false
    },
    companyLead: {
      type: Boolean,
      default: false
    },
    companyUI: {
      type: Boolean,
      default: false
    }
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISABLED', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password match method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Effective dashboard permissions resolver with backward compatibility
UserSchema.methods.getEffectiveDashboardAccess = function() {
  if (this.role === 'ADMIN') {
    return { companyBoost: true, companyLead: true, companyUI: true };
  }
  if (this.role === 'USER') {
    return { companyBoost: false, companyLead: false, companyUI: false };
  }
  const da = this.dashboardAccess;
  if (da && (da.companyBoost !== undefined || da.companyLead !== undefined || da.companyUI !== undefined)) {
    return {
      companyBoost: Boolean(da.companyBoost),
      companyLead: Boolean(da.companyLead),
      companyUI: Boolean(da.companyUI)
    };
  }
  return {
    companyBoost: this.role === 'COMPANY_BOOST',
    companyLead: this.role === 'COMPANY_LEAD',
    companyUI: this.role === 'LANDING_PAGE'
  };
};

export default mongoose.model('User', UserSchema);
