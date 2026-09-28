import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/postgres.js';
import {
  findUserById,
  findUserByEmail,
  createUser,
  updateUser as updateUserInDB,
  deleteUser as deleteUserInDB,
  getEffectiveDashboardAccess,
  listUsers,
} from '../repositories/userRepository.js';
import {
  findCompanyById,
  createCompany,
  updateCompany,
} from '../repositories/companyRepository.js';
import path from 'path';
import {
  createActivityLog,
  listActivityLogs,
} from '../repositories/activityLogRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import {
  buildWelcomeEmailTemplate,
  sendWelcomeEmail,
  sendInternalNewClientNotification,
  sendInternalClientOnboardingEmails,
  getEmailHistory,
  clearEmailHistory,
  clearEmailDedupeCache
} from '../services/emailService.js';

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
      researchSummary,
      initialLeads,
      initialKeyPeople,
      password,
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

    const existingUser = await findUserByEmail(userEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Temporary password generation if not provided
    const tempPassword = password && password.trim() ? password.trim() : generateTempPassword();

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // 1. Create Company profile in PostgreSQL
    const company = await createCompany({
      name: compName,
      contactPerson: clientName,
      email: userEmail,
      phone: phone || null,
      website: website || null,
      industry: industry || 'Technology / SaaS',
      companyInfo: companyInfo || description || null,
      researchSummary: researchSummary?.trim() || null,
      initialLeads: initialLeads || [],
      initialKeyPeople: initialKeyPeople || [],
      createdBy: req.user.id || req.user._id
    });

    // 2. Create User account strictly with role: USER
    const user = await createUser({
      name: clientName,
      email: userEmail,
      password: hashedPassword,
      role: 'USER',
      companyId: company.id,
      phone: phone || null,
      status: 'ACTIVE'
    });

    // 3. Log action in audit trail
    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: company.id,
      action: 'CLIENT_CREATED',
      details: `Admin ${req.user.name} created client user ${clientName} for company ${compName} (${userEmail}).`
    });

    // 4. Resolve active internal team members strictly by role and active status
    try {
      const activeSpecialistsRes = await query(`
        SELECT id, name, email, role, status, company_lead, company_boost, company_ui
        FROM users
        WHERE is_deleted = false
          AND status = 'ACTIVE'
          AND (
            role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
            OR (role NOT IN ('ADMIN', 'USER') AND (company_lead = true OR company_boost = true OR company_ui = true))
          )
        ORDER BY created_at ASC
      `);

      const leadMembers = activeSpecialistsRes.rows.filter(
        u => u.role === 'COMPANY_LEAD' || (u.company_lead && u.role !== 'ADMIN' && u.role !== 'USER')
      );
      const boostMembers = activeSpecialistsRes.rows.filter(
        u => u.role === 'COMPANY_BOOST' || (u.company_boost && u.role !== 'ADMIN' && u.role !== 'USER')
      );
      const uiMembers = activeSpecialistsRes.rows.filter(
        u => u.role === 'LANDING_PAGE' || (u.company_ui && u.role !== 'ADMIN' && u.role !== 'USER')
      );

      const clientEmailClean = (userEmail || '').toLowerCase().trim();

      const leadEmails = Array.from(new Set(
        leadMembers.map(u => u.email?.trim()).filter(e => Boolean(e) && e.toLowerCase() !== clientEmailClean)
      ));
      const boostEmails = Array.from(new Set(
        boostMembers.map(u => u.email?.trim()).filter(e => Boolean(e) && e.toLowerCase() !== clientEmailClean)
      ));
      const uiEmails = Array.from(new Set(
        uiMembers.map(u => u.email?.trim()).filter(e => Boolean(e) && e.toLowerCase() !== clientEmailClean)
      ));

      if (leadEmails.length === 0) {
        console.warn(`[ONBOARDING WARNING] No active COMPANY_LEAD team members registered in users table for client "${compName}".`);
      }
      if (boostEmails.length === 0) {
        console.warn(`[ONBOARDING WARNING] No active COMPANY_BOOST team members registered in users table for client "${compName}".`);
      }
      if (uiEmails.length === 0) {
        console.warn(`[ONBOARDING WARNING] No active LANDING_PAGE team members registered in users table for client "${compName}".`);
      }

      // Create in-app notifications for all matching active internal specialists
      for (const internalUser of activeSpecialistsRes.rows) {
        if (internalUser.email?.toLowerCase().trim() === clientEmailClean) continue;
        try {
          await createNotification({
            userId: internalUser.id,
            type: 'ASSIGNMENT',
            title: `New Client Onboarded: ${compName}`,
            message: `A new client (${compName}) has been onboarded. Please prepare and submit the required sample work for your team.`
          });
        } catch (notifErr) {
          console.warn('[INTERNAL NOTIF WARNING]:', notifErr.message);
        }
      }

      // Dispatch team-specific internal notification emails
      const portalBase = (process.env.PORTAL_BASE_URL || 'http://localhost:5174').replace(/\/$/, '');
      await sendInternalClientOnboardingEmails({
        client: { name: clientName, email: userEmail },
        company: {
          id: company.id,
          name: compName,
          contactPerson: clientName,
          website: website || null,
          industry: industry || 'Technology / SaaS',
          email: userEmail,
          companyInfo: companyInfo || null
        },
        leadRecipients: leadEmails,
        boostRecipients: boostEmails,
        uiRecipients: uiEmails,
        portalBase
      });
    } catch (notifErr) {
      console.error('[INTERNAL ONBOARDING NOTIFICATION ERROR]:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      temporaryPassword: tempPassword,
      user: {
        _id: user.id,
        id: user.id,
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
      message: 'Failed to create client user. Please try again.'
    });
  }
};

// @desc    Admin get all client users with linked company & request counts
// @route   GET /api/admin/users
// @access  Private (ADMIN only)
export const getAllUsers = async (req, res) => {
  try {
    // Get all non-deleted users with company info
    const result = await query(`
      SELECT
        u.id, u.name, u.email, u.role,
        u.company_boost, u.company_lead, u.company_ui,
        u.company_id, u.phone, u.status,
        u.avatar, u.last_login, u.created_at, u.updated_at,
        c.name AS company_name, c.email AS company_email,
        c.website AS company_website, c.industry AS company_industry,
        c.contact_person AS company_contact_person,
        (SELECT COUNT(*)::int FROM requests r WHERE r.company_id = u.company_id) AS requests_count
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE u.is_deleted = false
      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map(row => {
      const user = {
        _id: row.id,
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        phone: row.phone,
        status: row.status,
        avatar: row.avatar,
        lastLogin: row.last_login,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        requestsCount: row.requests_count || 0,
        dashboardAccess: getEffectiveDashboardAccess({
          role: row.role,
          dashboardAccess: {
            companyBoost: Boolean(row.company_boost),
            companyLead: Boolean(row.company_lead),
            companyUI: Boolean(row.company_ui),
          }
        }),
        companyId: row.company_id ? {
          _id: row.company_id,
          id: row.company_id,
          name: row.company_name,
          email: row.company_email,
          website: row.company_website,
          industry: row.company_industry,
          contactPerson: row.company_contact_person,
        } : null,
        company: row.company_id ? {
          _id: row.company_id,
          id: row.company_id,
          name: row.company_name,
          email: row.company_email,
          website: row.company_website,
          industry: row.company_industry,
          contactPerson: row.company_contact_person,
        } : null,
      };
      return user;
    });

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users. Please try again.' });
  }
};

// @desc    Admin get single client user details with company, requests, payments & activity
// @route   GET /api/admin/users/:id
// @access  Private (ADMIN only)
export const getUserById = async (req, res) => {
  try {
    const userResult = await query(`
      SELECT
        u.*,
        c.name AS company_name, c.email AS company_email,
        c.phone AS company_phone, c.website AS company_website,
        c.industry AS company_industry, c.company_info AS company_info,
        c.research_summary AS company_research_summary,
        c.contact_person AS company_contact_person,
        c.created_at AS company_created_at
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE u.id = $1 AND u.is_deleted = false
      LIMIT 1
    `, [req.params.id]);

    if (!userResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }
    const row = userResult.rows[0];

    const user = {
      _id: row.id,
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      phone: row.phone,
      status: row.status,
      createdAt: row.created_at,
      dashboardAccess: getEffectiveDashboardAccess({
        role: row.role,
        dashboardAccess: {
          companyBoost: Boolean(row.company_boost),
          companyLead: Boolean(row.company_lead),
          companyUI: Boolean(row.company_ui),
        }
      }),
      companyId: row.company_id ? {
        _id: row.company_id,
        id: row.company_id,
        name: row.company_name,
        email: row.company_email,
        phone: row.company_phone,
        website: row.company_website,
        industry: row.company_industry,
        companyInfo: row.company_info,
        researchSummary: row.company_research_summary,
        contactPerson: row.company_contact_person,
        createdAt: row.company_created_at,
      } : null,
    };

    let requests = [];
    let payments = [];
    let activity = [];

    if (row.company_id) {
      const reqResult = await query(
        `SELECT * FROM requests WHERE company_id = $1 ORDER BY created_at DESC`,
        [row.company_id]
      );
      requests = reqResult.rows.map(r => ({
        _id: r.id, id: r.id,
        ticketId: r.ticket_id, serviceType: r.service_type,
        title: r.title, status: r.status, price: r.price,
        paymentStatus: r.payment_status, createdAt: r.created_at,
      }));

      const payResult = await query(
        `SELECT * FROM payments WHERE company_id = $1 ORDER BY created_at DESC`,
        [row.company_id]
      );
      payments = payResult.rows.map(p => ({
        _id: p.id, id: p.id,
        invoiceNumber: p.invoice_number, amount: p.amount,
        status: p.status, paidAt: p.paid_at, createdAt: p.created_at,
      }));

      const actResult = await query(
        `SELECT * FROM activity_logs WHERE company_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [row.company_id]
      );
      activity = actResult.rows.map(a => ({
        _id: a.id, id: a.id,
        action: a.action, details: a.details, createdAt: a.created_at,
      }));
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
      totalPaid: payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + Number(p.amount || 0), 0),
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
    console.error('Get user by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user details. Please try again.' });
  }
};

// @desc    Admin update client information (Name, Email, Phone, Company, Status)
// @route   PATCH /api/admin/users/:id
// @access  Private (ADMIN only)
export const updateUserHandler = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      password,
      status,
      companyName,
      website,
      industry,
      companyInfo,
      description,
      researchSummary
    } = req.body;

    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    const userUpdates = {};
    const effectiveName = name || contactPerson;
    if (effectiveName) userUpdates.name = effectiveName.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      userUpdates.password = await bcrypt.hash(password.trim(), salt);
    }
    if (status && ['ACTIVE', 'DISABLED', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      userUpdates.status = status;
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await findUserByEmail(email.toLowerCase().trim());
      if (emailExists && emailExists.id !== user.id) {
        return res.status(400).json({ success: false, message: 'Email is already taken by another account.' });
      }
      userUpdates.email = email.toLowerCase().trim();
    }

    const updatedUser = await updateUserInDB(user.id, userUpdates);

    // Update Company details if provided
    if (user.companyId) {
      const companyUpdates = {};
      if (companyName) companyUpdates.name = companyName.trim();
      if (website !== undefined) companyUpdates.website = website.trim();
      if (industry !== undefined) companyUpdates.industry = industry.trim();
      const effectiveInfo = companyInfo !== undefined ? companyInfo : description;
      if (effectiveInfo !== undefined) companyUpdates.companyInfo = effectiveInfo.trim();
      if (researchSummary !== undefined) companyUpdates.researchSummary = researchSummary.trim();
      if (effectiveName) companyUpdates.contactPerson = effectiveName.trim();
      if (email) companyUpdates.email = email.toLowerCase().trim();
      if (phone !== undefined) companyUpdates.phone = phone.trim();

      if (Object.keys(companyUpdates).length > 0) {
        await updateCompany(user.companyId, companyUpdates);
      }
    }

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: user.companyId || null,
      action: 'CLIENT_UPDATED',
      details: `Admin ${req.user.name} updated client account for ${userUpdates.name || user.name} (${userUpdates.email || user.email}).`
    });

    const finalUser = await findUserById(user.id);

    return res.json({
      success: true,
      message: 'Client user updated successfully.',
      user: {
        ...finalUser,
        dashboardAccess: getEffectiveDashboardAccess(finalUser),
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user profile. Please try again.' });
  }
};

// @desc    Admin reset client user password (generates new temporary password)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (ADMIN only)
export const resetUserPassword = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    await updateUserInDB(user.id, { password: hashedPassword });

    await createActivityLog({
      userId: req.user.id || req.user._id,
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
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
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

    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    await updateUserInDB(user.id, { status });

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: user.companyId || null,
      action: status === 'DISABLED' ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
      details: `Admin ${req.user.name} set account status to ${status} for ${user.name} (${user.email}).`
    });

    return res.json({
      success: true,
      message: `Account has been ${status === 'DISABLED' ? 'disabled' : 'enabled'} successfully.`,
      status
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status. Please try again.' });
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (ADMIN only)
export const getActivityLogs = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        al.*,
        c.name AS company_name
      FROM activity_logs al
      LEFT JOIN companies c ON c.id = al.company_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    const logs = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      companyId: row.company_id ? {
        _id: row.company_id,
        id: row.company_id,
        name: row.company_name,
      } : null,
      action: row.action,
      details: row.details,
      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load activity logs. Please try again.' });
  }
};

// @desc    Admin delete team member
// @route   DELETE /api/admin/team-members/:id
// @access  Private (ADMIN only)
export const deleteTeamUser = async (req, res) => {
  try {
    const targetUser = await findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Team user not found' });
    }

    // STRICT SECURITY GUARD: Super Admin and currently logged-in user cannot be deleted
    if (
      targetUser.role === 'ADMIN' ||
      targetUser.email === 'team@creativegini.com' ||
      targetUser.email === 'admin@creativegini.com' ||
      String(targetUser.id) === String(req.user?.id || req.user?._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Super Admin or currently logged-in account cannot be deleted.'
      });
    }

    await deleteUserInDB(targetUser.id);

    await createActivityLog({
      userId: req.user.id || req.user._id,
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
    console.error('Delete team user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete team member. Please try again.' });
  }
};

// @desc    Admin delete user (client or team user)
// @route   DELETE /api/admin/users/:id
// @access  Private (ADMIN only)
export const deleteUserHandler = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // STRICT SECURITY GUARD: Super Admin cannot be deleted
    if (user.role === 'ADMIN' || user.email === 'team@creativegini.com' || user.email === 'admin@creativegini.com') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin account cannot be deleted.'
      });
    }

    if (user.role === 'USER') {
      await createActivityLog({
        userId: req.user.id || req.user._id,
        userName: req.user.name,
        companyId: user.companyId || null,
        action: 'CLIENT_DELETED',
        details: `Admin ${req.user.name} deleted client user ${user.name} (${user.email}).`
      });

      await deleteUserInDB(user.id);

      return res.json({
        success: true,
        message: 'Client user deleted successfully.'
      });
    } else {
      return deleteTeamUser(req, res);
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user. Please try again.' });
  }
};

// @desc    Admin get internal team members with role and dashboard access
// @route   GET /api/admin/team-members
// @access  Private (ADMIN only)
export const getTeamMembers = async (req, res) => {
  try {
    const result = await query(`
      SELECT *
      FROM users
      WHERE role != 'USER'
        AND is_deleted = false
      ORDER BY created_at ASC
    `);

    const teamUsers = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      phone: row.phone,
      status: row.status,
      avatar: row.avatar,
      createdAt: row.created_at,
      dashboardAccess: getEffectiveDashboardAccess({
        role: row.role,
        dashboardAccess: {
          companyBoost: Boolean(row.company_boost),
          companyLead: Boolean(row.company_lead),
          companyUI: Boolean(row.company_ui),
        }
      }),
    }));

    // Display order
    const fixedOrder = [
      'ui@creativegini.com',
      'boost@creativegini.com',
      'lead@creativegini.com',
      'team@creativegini.com',
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

    return res.json({
      success: true,
      count: teamUsers.length,
      teamMembers: teamUsers
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch team members. Please try again.' });
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

    const targetUser = await findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const prevAccess = getEffectiveDashboardAccess(targetUser);

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

    // Determine updated role based on new access
    let newRole = targetUser.role;
    if (newAccess.companyLead) newRole = 'COMPANY_LEAD';
    else if (newAccess.companyBoost) newRole = 'COMPANY_BOOST';
    else if (newAccess.companyUI) newRole = 'LANDING_PAGE';

    await query(`
      UPDATE users
      SET company_boost = $1, company_lead = $2, company_ui = $3, role = $4
      WHERE id = $5
    `, [
      newAccess.companyBoost,
      newAccess.companyLead,
      newAccess.companyUI,
      targetUser.role === 'ADMIN' ? 'ADMIN' : newRole,
      targetUser.id
    ]);

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: targetUser.companyId || null,
      action: 'PERMISSIONS_UPDATED',
      details: `Super Admin ${req.user.name} updated dashboard access for ${targetUser.name} (${targetUser.email}). Previous: [${prevStr}] -> New: [${newStr}].`
    });

    const updatedUser = await findUserById(targetUser.id);

    return res.json({
      success: true,
      message: `Permissions updated successfully for ${targetUser.name}.`,
      user: {
        ...updatedUser,
        dashboardAccess: getEffectiveDashboardAccess(updatedUser)
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update permissions. Please try again.' });
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

    const existingUser = await findUserByEmail(userEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

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

    const user = await createUser({
      name: memberName,
      email: userEmail,
      password: hashedPassword,
      role,
      dashboardAccess: cleanAccess,
      phone: phone ? phone.trim() : null,
      status: status && ['ACTIVE', 'DISABLED', 'INACTIVE'].includes(status) ? status : 'ACTIVE'
    });

    const formatPerms = (p) => {
      const parts = [];
      if (p.companyBoost) parts.push('Company Boost');
      if (p.companyLead) parts.push('Company Lead');
      if (p.companyUI) parts.push('Company UI');
      return parts.length > 0 ? parts.join(', ') : 'None';
    };

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      action: 'TEAM_USER_CREATED',
      details: `Super Admin ${req.user.name} created team user ${user.name} (${user.email}) with dashboard access: [${formatPerms(cleanAccess)}].`
    });

    return res.status(201).json({
      success: true,
      message: 'Team user created successfully.',
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        dashboardAccess: getEffectiveDashboardAccess(user),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create team user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create team user. Please try again.'
    });
  }
};

// @desc    Admin preview the welcome email with live edits
// @route   POST /api/admin/users/:id/preview-welcome-email
// @access  Private (ADMIN only)
export const previewWelcomeEmailHandler = async (req, res) => {
  try {
    let user = null;
    let company = null;

    if (req.params.id && req.params.id !== 'draft') {
      user = await findUserById(req.params.id);
      if (user?.companyId) {
        company = await findCompanyById(user.companyId);
      }
    }

    const {
      name,
      contactPerson,
      email,
      companyName,
      subject,
      customBody,
      temporaryPassword,
      attachments
    } = req.body;

    const clientName = (name || contactPerson || user?.name || user?.contactPerson || 'Valued Client').trim();
    const recipientEmail = (email || user?.email || '').trim();
    const resolvedCompanyName = (companyName || company?.name || 'Client Workspace').trim();
    const emailSubject = subject?.trim() || 'Welcome to CreativeGini - Your Account & Workspace Access';
    const attachmentsList = Array.isArray(attachments) ? attachments : [];

    const html = buildWelcomeEmailTemplate({
      clientName,
      companyName: resolvedCompanyName,
      email: recipientEmail,
      temporaryPassword: temporaryPassword || '',
      subject: emailSubject,
      customBody,
      portalUrl: 'https://creativegini.com/signin',
      attachments: attachmentsList
    });

    return res.json({
      success: true,
      html,
      recipient: recipientEmail,
      clientName,
      companyName: resolvedCompanyName,
      subject: emailSubject,
      attachmentCount: attachmentsList.length
    });
  } catch (error) {
    console.error('Preview welcome email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate email preview. Please try again.'
    });
  }
};

// @desc    Admin send the welcome email to newly created client user
// @route   POST /api/admin/users/:id/send-welcome-email
// @access  Private (ADMIN only)
export const sendWelcomeEmailHandler = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client user not found' });
    }

    const company = user.companyId ? await findCompanyById(user.companyId) : null;
    const { subject, customBody, temporaryPassword, attachments } = req.body;
    const attachmentsList = Array.isArray(attachments) ? attachments : [];

    const result = await sendWelcomeEmail({
      client: user,
      company,
      temporaryPassword,
      subject,
      customBody,
      attachments: attachmentsList
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Unable to send the welcome email. Please review the email and try again.'
      });
    }

    // Log the event in activity logs
    try {
      const attCount = attachmentsList.length;
      await createActivityLog({
        userId: req.user.id || req.user._id,
        userName: req.user.name,
        companyId: user.companyId || null,
        action: 'WELCOME_EMAIL_SENT',
        details: `Admin ${req.user.name} dispatched welcome email with credentials to ${user.name} (${user.email})${attCount > 0 ? ` with ${attCount} attachment(s)` : ''}.`
      });
    } catch (logErr) {
      console.warn('Failed to log welcome email activity:', logErr.message);
    }

    return res.json({
      success: true,
      message: 'User account created and welcome email sent successfully.',
      messageId: result.messageId,
      recipient: user.email,
      clientName: user.name,
      companyName: company?.name || '',
      attachmentCount: attachmentsList.length
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send the welcome email. Please review the email and try again.'
    });
  }
};

// @desc    Admin get email audit history (simulation & dispatch log)
// @route   GET /api/admin/email-history
// @access  Private (ADMIN only)
export const getEmailHistoryHandler = async (req, res) => {
  return res.json({
    success: true,
    history: getEmailHistory()
  });
};

// @desc    Admin clear email audit history and dedupe cache
// @route   DELETE /api/admin/email-history
// @access  Private (ADMIN only)
export const clearEmailHistoryHandler = async (req, res) => {
  clearEmailHistory();
  clearEmailDedupeCache();
  return res.json({
    success: true,
    message: 'Email history and dedupe cache cleared successfully.'
  });
};
