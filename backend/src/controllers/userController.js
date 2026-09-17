import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Request from '../models/Request.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to generate a friendly secure temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'CG-';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// @desc    Admin creates a new client User and Company profile with pre-researched data
// @route   POST /api/admin/users
// @access  Private (ADMIN only)
export const createClientUser = async (req, res) => {
  try {
    // If request payload is specifically for an internal team member, delegate to createTeamUser
    if (req.body.isTeamMember || (!req.body.companyName && req.body.dashboardAccess)) {
      return createTeamUser(req, res);
    }

    const {
      companyName,
      contactPerson,
      name,
      email,
      phone,
      website,
      industry,
      companyInfo,
      description,
      location,
      researchSummary,
      initialLeads,
      initialKeyPeople,
      password
    } = req.body;

    const clientName = (contactPerson || name || '').trim();
    const compName = (companyName || '').trim();
    const userEmail = (email || '').toLowerCase().trim();

    if (!compName || !clientName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Company name, client name, and email are required.'
      });
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Temporary password generation if not provided
    const tempPassword = password && password.trim() ? password.trim() : generateTempPassword();

    // 1. Create Company profile in MongoDB
    const company = await Company.create({
      name: compName,
      contactPerson: clientName,
      email: userEmail,
      phone: phone || '',
      website: website || '',
      industry: industry || 'Technology / SaaS',
      companyInfo: companyInfo || description || '',
      researchSummary: researchSummary || 'Pre-researched market positioning and initial leads provided by CreativeGini.',
      initialLeads: initialLeads || [],
      initialKeyPeople: initialKeyPeople || [],
      createdBy: req.user._id
    });

    // 2. Create User account strictly with role: USER
    const user = await User.create({
      name: clientName,
      email: userEmail,
      password: tempPassword, // Hashed automatically by UserSchema pre('save')
      role: 'USER', // Always strictly USER
      companyId: company._id,
      phone: phone || '',
      status: 'ACTIVE'
    });

    // 3. Log action in audit trail
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: company._id,
      action: 'CLIENT_CREATED',
      details: `Admin ${req.user.name} created client user ${clientName} for company ${compName} (${userEmail}).`
    });

    return res.status(201).json({
      success: true,
      message: 'Client user created successfully.',
      temporaryPassword: tempPassword,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company: company
      }
    });
  } catch (error) {
    console.error('Create client user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create client user',
      error: error.message
    });
  }
};

// @desc    Admin get all client users with linked company & request counts
// @route   GET /api/admin/users
// @access  Private (ADMIN only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .populate('companyId')
      .select('-password')
      .sort({ createdAt: -1 });

    // Aggregate request counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        let requestsCount = 0;
        if (u.companyId) {
          requestsCount = await Request.countDocuments({ companyId: u.companyId._id });
        }
        return {
          ...u.toObject(),
          dashboardAccess: typeof u.getEffectiveDashboardAccess === 'function'
            ? u.getEffectiveDashboardAccess()
            : u.dashboardAccess,
          requestsCount
        };
      })
    );

    return res.json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin get single client user details with company, requests, payments & activity
// @route   GET /api/admin/users/:id
// @access  Private (ADMIN only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('companyId')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    let requests = [];
    let payments = [];
    let activity = [];

    if (user.companyId) {
      requests = await Request.find({ companyId: user.companyId._id }).sort({ createdAt: -1 });
      payments = await Payment.find({ companyId: user.companyId._id }).sort({ createdAt: -1 });
      activity = await ActivityLog.find({ companyId: user.companyId._id }).sort({ createdAt: -1 }).limit(20);
    }

    const requestSummary = {
      total: requests.length,
      companyLead: requests.filter(r => r.serviceType === 'COMPANY_LEAD').length,
      companyBoost: requests.filter(r => r.serviceType === 'COMPANY_BOOST').length,
      landingPage: requests.filter(r => r.serviceType === 'LANDING_PAGE').length,
      completed: requests.filter(r => r.status === 'COMPLETED').length,
      pending: requests.filter(r => ['REQUEST_CREATED', 'PAYMENT_COMPLETED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLIENT_REVIEW'].includes(r.status)).length
    };

    const paymentSummary = {
      totalPaid: payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + (p.amount || 0), 0),
      pending: payments.filter(p => p.status === 'PENDING').length,
      failed: payments.filter(p => p.status === 'FAILED').length
    };

    return res.json({
      success: true,
      user,
      requests,
      requestSummary,
      paymentSummary,
      activity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin update client information (Name, Email, Phone, Company, Status)
// @route   PATCH /api/admin/users/:id
// @access  Private (ADMIN only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, status, companyName, website, industry, companyInfo } = req.body;

    const user = await User.findById(req.params.id).populate('companyId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (status && ['ACTIVE', 'DISABLED', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      user.status = status;
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already taken by another account.' });
      }
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    // Update Company details if provided
    if (user.companyId) {
      const company = await Company.findById(user.companyId._id);
      if (company) {
        if (companyName) company.name = companyName.trim();
        if (website !== undefined) company.website = website.trim();
        if (industry !== undefined) company.industry = industry.trim();
        if (companyInfo !== undefined) company.companyInfo = companyInfo.trim();
        await company.save();
      }
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: user.companyId?._id || null,
      action: 'CLIENT_UPDATED',
      details: `Admin ${req.user.name} updated client account for ${user.name} (${user.email}).`
    });

    const updatedUser = await User.findById(user._id).populate('companyId').select('-password');

    return res.json({
      success: true,
      message: 'Client user updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin reset client user password (generates new temporary password)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (ADMIN only)
export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword; // Hashed automatically by pre('save')
    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: user.companyId || null,
      action: 'PASSWORD_RESET',
      details: `Admin ${req.user.name} generated a new temporary password for ${user.name} (${user.email}).`
    });

    return res.json({
      success: true,
      message: 'Password reset successfully.',
      temporaryPassword: tempPassword
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin enable / disable client account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (ADMIN only)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['ACTIVE', 'DISABLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'ACTIVE' or 'DISABLED'."
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    user.status = status;
    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: user.companyId || null,
      action: status === 'DISABLED' ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
      details: `Admin ${req.user.name} set account status to ${status} for ${user.name} (${user.email}).`
    });

    return res.json({
      success: true,
      message: `Account has been ${status === 'DISABLED' ? 'disabled' : 'enabled'} successfully.`,
      status: user.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (ADMIN only)
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin delete team member
// @route   DELETE /api/admin/team-members/:id
// @access  Private (ADMIN only)
export const deleteTeamUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Team user not found' });
    }

    // STRICT SECURITY GUARD: Super Admin cannot be deleted
    if (targetUser.role === 'ADMIN' || targetUser.email === 'admin@creativegini.com') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin account cannot be deleted.'
      });
    }

    // Permanently remove the user document from the database
    await User.findByIdAndDelete(targetUser._id);

    // Log action in ActivityLog
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: targetUser.companyId || null,
      action: 'TEAM_USER_DELETED',
      details: `Super Admin ${req.user.name} deleted team user ${targetUser.name} (${targetUser.email}).`
    });

    return res.json({
      success: true,
      message: `Team user ${targetUser.name} deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin delete user (client or team user)
// @route   DELETE /api/admin/users/:id
// @access  Private (ADMIN only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // STRICT SECURITY GUARD: Super Admin cannot be deleted
    if (user.role === 'ADMIN' || user.email === 'admin@creativegini.com') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin account cannot be deleted.'
      });
    }

    if (user.role === 'USER') {
      // Log deletion before removing client user record
      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        companyId: user.companyId || null,
        action: 'CLIENT_DELETED',
        details: `Admin ${req.user.name} deleted client user ${user.name} (${user.email}).`
      });

      await User.findByIdAndDelete(user._id);

      return res.json({
        success: true,
        message: 'Client user deleted successfully.'
      });
    } else {
      // If team member ID passed to this endpoint, delegate to deleteTeamUser
      return deleteTeamUser(req, res);
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin get internal team members with role and dashboard access
// @route   GET /api/admin/team-members
// @access  Private (ADMIN only)
export const getTeamMembers = async (req, res) => {
  try {
    const teamUsers = await User.find({
      role: { $ne: 'USER' },
      isDeleted: { $ne: true }
    }).select('-password');

    // Display order:
    // 1. Landing Page UI/UX Architect (ui@creativegini.com)
    // 2. Growth & Boost Strategist (boost@creativegini.com)
    // 3. Company Lead Specialist (lead@creativegini.com)
    // 4. CreativeGini Admin (admin@creativegini.com)
    // Followed by any newly created team users
    const fixedOrder = [
      'ui@creativegini.com',
      'boost@creativegini.com',
      'lead@creativegini.com',
      'admin@creativegini.com'
    ];

    teamUsers.sort((a, b) => {
      const idxA = fixedOrder.indexOf(a.email);
      const idxB = fixedOrder.indexOf(b.email);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    const formatted = teamUsers.map((u) => ({
      ...u.toObject(),
      dashboardAccess: typeof u.getEffectiveDashboardAccess === 'function'
        ? u.getEffectiveDashboardAccess()
        : u.dashboardAccess
    }));

    return res.json({
      success: true,
      count: formatted.length,
      teamMembers: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin update dashboard permissions for team member
// @route   PATCH /api/admin/users/:id/permissions
// @access  Private (ADMIN only)
export const updateUserPermissions = async (req, res) => {
  try {
    const { dashboardAccess } = req.body;
    if (!dashboardAccess || typeof dashboardAccess !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid dashboardAccess object is required.'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const prevAccess = typeof targetUser.getEffectiveDashboardAccess === 'function'
      ? targetUser.getEffectiveDashboardAccess()
      : targetUser.dashboardAccess || {};

    const formatPerms = (p) => {
      const parts = [];
      if (p.companyBoost) parts.push('Company Boost');
      if (p.companyLead) parts.push('Company Lead');
      if (p.companyUI) parts.push('Company UI');
      return parts.length > 0 ? parts.join(', ') : 'None';
    };

    const prevStr = formatPerms(prevAccess);

    const newAccess = {
      companyBoost: Boolean(dashboardAccess.companyBoost),
      companyLead: Boolean(dashboardAccess.companyLead),
      companyUI: Boolean(dashboardAccess.companyUI)
    };

    const newStr = formatPerms(newAccess);

    targetUser.dashboardAccess = newAccess;
    await targetUser.save();

    // Log permission change in ActivityLog for audit trail
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      companyId: targetUser.companyId || null,
      action: 'PERMISSIONS_UPDATED',
      details: `Super Admin ${req.user.name} updated dashboard access for ${targetUser.name} (${targetUser.email}). Previous: [${prevStr}] -> New: [${newStr}].`
    });

    const updatedUser = await User.findById(targetUser._id).select('-password');

    return res.json({
      success: true,
      message: `Permissions updated successfully for ${targetUser.name}.`,
      user: {
        ...updatedUser.toObject(),
        dashboardAccess: updatedUser.getEffectiveDashboardAccess()
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin creates a new internal team member with granular dashboard permissions
// @route   POST /api/admin/team-members (also supported via POST /api/admin/users)
// @access  Private (ADMIN only)
export const createTeamUser = async (req, res) => {
  try {
    const { name, email, password, status, dashboardAccess, phone } = req.body;

    const memberName = (name || '').trim();
    const userEmail = (email || '').toLowerCase().trim();

    if (!memberName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required for creating a team user.'
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A password is required for creating a team user.'
      });
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Sanitize dashboard permissions
    const cleanAccess = {
      companyBoost: Boolean(dashboardAccess?.companyBoost),
      companyLead: Boolean(dashboardAccess?.companyLead),
      companyUI: Boolean(dashboardAccess?.companyUI)
    };

    // Determine an appropriate internal non-admin role based on assigned service
    // CRITICAL: New user MUST NEVER receive ADMIN privileges!
    let role = 'COMPANY_LEAD';
    if (cleanAccess.companyLead) {
      role = 'COMPANY_LEAD';
    } else if (cleanAccess.companyBoost) {
      role = 'COMPANY_BOOST';
    } else if (cleanAccess.companyUI) {
      role = 'LANDING_PAGE';
    }

    const user = await User.create({
      name: memberName,
      email: userEmail,
      password: password.trim(), // Automatically hashed by UserSchema pre('save')
      role,
      dashboardAccess: cleanAccess,
      phone: phone ? phone.trim() : '',
      status: status && ['ACTIVE', 'DISABLED', 'INACTIVE'].includes(status) ? status : 'ACTIVE'
    });

    const formatPerms = (p) => {
      const parts = [];
      if (p.companyBoost) parts.push('Company Boost');
      if (p.companyLead) parts.push('Company Lead');
      if (p.companyUI) parts.push('Company UI');
      return parts.length > 0 ? parts.join(', ') : 'None';
    };

    // Audit trail log
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'TEAM_USER_CREATED',
      details: `Super Admin ${req.user.name} created team user ${user.name} (${user.email}) with dashboard access: [${formatPerms(cleanAccess)}].`
    });

    return res.status(201).json({
      success: true,
      message: 'Team user created successfully.',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        dashboardAccess: user.getEffectiveDashboardAccess(),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create team user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create team user',
      error: error.message
    });
  }
};
