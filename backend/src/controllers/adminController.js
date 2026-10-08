import { query } from '../config/postgres.js';
import { findRequestById, updateRequest } from '../repositories/requestRepository.js';
import { findUserById, updateUser as updateUserInDB, getEffectiveDashboardAccess } from '../repositories/userRepository.js';
import { createActivityLog } from '../repositories/activityLogRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { sendTicketAssignedEmail } from '../services/emailService.js';

// Define standard CreativeGini RBAC capabilities & permissions matrix
export const PLATFORM_PERMISSIONS = [
  { id: 'clients.view', category: 'Clients', description: 'View client accounts and company profiles' },
  { id: 'clients.create', category: 'Clients', description: 'Create and onboard new client companies' },
  { id: 'clients.edit', category: 'Clients', description: 'Edit client profile and company information' },
  { id: 'clients.deactivate', category: 'Clients', description: 'Suspend or disable client user accounts' },

  { id: 'requests.view', category: 'Requests', description: 'View service requests and ticket queues' },
  { id: 'requests.create', category: 'Requests', description: 'Submit new service requests' },
  { id: 'requests.assign', category: 'Requests', description: 'Assign requests to specialists or service teams' },
  { id: 'requests.reassign', category: 'Requests', description: 'Reassign active requests to different specialists' },
  { id: 'requests.change_status', category: 'Requests', description: 'Update ticket workflow status' },
  { id: 'requests.cancel', category: 'Requests', description: 'Cancel or administrative override requests' },

  { id: 'deliverables.view', category: 'Deliverables', description: 'View uploaded deliverables and version blueprints' },
  { id: 'deliverables.upload', category: 'Deliverables', description: 'Upload work deliverables for client review' },
  { id: 'deliverables.review', category: 'Deliverables', description: 'Inspect client feedback and revision requests' },
  { id: 'deliverables.approve', category: 'Deliverables', description: 'Approve completed deliverables' },

  { id: 'team.view', category: 'Team', description: 'View specialists, service teams, and workload' },
  { id: 'team.manage', category: 'Team', description: 'Add, update, or remove internal specialists' },
  { id: 'team.assign', category: 'Team', description: 'Configure specialist service team assignments' },

  { id: 'billing.view', category: 'Billing', description: 'View payment transactions and invoices' },
  { id: 'billing.manage', category: 'Billing', description: 'Manage billing states, verify payments, and refunds' },

  { id: 'reports.view', category: 'Reports', description: 'Access operational, service, and financial reporting' },

  { id: 'audit.view', category: 'Audit', description: 'Inspect full activity timeline and security logs' },

  { id: 'settings.view', category: 'Settings', description: 'View platform configuration settings' },
  { id: 'settings.manage', category: 'Settings', description: 'Configure platform settings and service availability' },
];

// Default in-memory Role-to-Permission mapping (can be dynamically overridden)
const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: PLATFORM_PERMISSIONS.map(p => p.id),
  ADMIN: PLATFORM_PERMISSIONS.filter(p => !['settings.manage'].includes(p.id)).map(p => p.id),
  COMPANY_LEAD: [
    'clients.view',
    'requests.view',
    'requests.assign',
    'requests.change_status',
    'deliverables.view',
    'deliverables.upload',
    'deliverables.review',
    'team.view',
    'billing.view',
    'reports.view',
  ],
  COMPANY_BOOST: [
    'clients.view',
    'requests.view',
    'requests.assign',
    'requests.change_status',
    'deliverables.view',
    'deliverables.upload',
    'deliverables.review',
    'team.view',
    'billing.view',
    'reports.view',
  ],
  LANDING_PAGE: [
    'clients.view',
    'requests.view',
    'requests.assign',
    'requests.change_status',
    'deliverables.view',
    'deliverables.upload',
    'deliverables.review',
    'team.view',
    'billing.view',
    'reports.view',
  ],
  USER: [
    'requests.view',
    'requests.create',
    'deliverables.view',
    'deliverables.approve',
    'billing.view',
  ]
};

let activeRolePermissions = { ...DEFAULT_ROLE_PERMISSIONS };

// Helper to check Super Admin access
const isSuperAdminOrAdmin = (user) => {
  return user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');
};

/**
 * @desc    Get High-level Super Admin Command Center Overview
 * @route   GET /api/admin/overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminOverview = async (req, res) => {
  try {
    // 1. KPI Counts from real requests table
    const requestsCountRes = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED')) AS active_requests,
        COUNT(*) FILTER (WHERE status IN ('REQUEST_CREATED', 'PAYMENT_PENDING')) AS new_requests,
        COUNT(*) FILTER (WHERE assigned_to IS NULL AND status NOT IN ('COMPLETED', 'CANCELLED')) AS unassigned_requests,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_requests,
        COUNT(*) FILTER (WHERE status IN ('CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED')) AS client_review_requests,
        COUNT(*) FILTER (WHERE status = 'CHANGES_REQUESTED') AS changes_requested,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_requests,
        COUNT(*) AS total_requests
      FROM requests
    `);

    // Submissions revisions count
    const submissionsReviewRes = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'CHANGES_REQUESTED') AS submission_changes,
        COUNT(*) FILTER (WHERE status = 'PENDING_REVIEW') AS pending_review_submissions
      FROM submissions
    `);

    // 2. Client & Team Counts
    const usersCountRes = await query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'USER') AS total_clients,
        COUNT(*) FILTER (WHERE role = 'USER' AND status = 'ACTIVE') AS active_clients,
        COUNT(*) FILTER (WHERE role = 'USER' AND status != 'ACTIVE') AS inactive_clients,
        COUNT(*) FILTER (WHERE role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE') AND status = 'ACTIVE') AS active_specialists,
        COUNT(*) FILTER (WHERE role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')) AS total_specialists
      FROM users
      WHERE is_deleted = false
    `);

    const companiesCountRes = await query(`
      SELECT COUNT(*) AS total_companies FROM companies
    `);

    // 3. Billing & Revenue (Real data only)
    const billingRes = await query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'PAID') AS completed_payments_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS pending_revenue,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_payments_count
      FROM payments
    `);

    // 4. Service Workload Distribution
    const serviceBreakdownRes = await query(`
      SELECT
        service_type,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED')) AS active,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
        COUNT(*) FILTER (WHERE status IN ('CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED')) AS in_review
      FROM requests
      GROUP BY service_type
      ORDER BY total DESC
    `);

    // 5. Specialist Workload Distribution
    const specialistsRes = await query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        COUNT(r.id) FILTER (WHERE r.status NOT IN ('COMPLETED', 'CANCELLED')) AS active_workload,
        COUNT(r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed_workload
      FROM users u
      LEFT JOIN requests r ON r.assigned_to = u.id
      WHERE u.role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
        AND u.is_deleted = false
      GROUP BY u.id, u.name, u.email, u.role, u.status
      ORDER BY active_workload DESC, u.name ASC
    `);

    // 6. Recent Activity Logs
    const recentActivityRes = await query(`
      SELECT id, user_id, user_name, action, details, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // 7. Recent Deliverables
    const recentDeliverablesRes = await query(`
      SELECT
        s.id,
        s.request_id,
        s.ticket_code,
        s.version,
        s.title,
        s.status,
        s.submitted_at,
        s.submitted_by_name,
        r.title AS request_title,
        r.service_type
      FROM submissions s
      LEFT JOIN requests r ON r.id = s.request_id
      ORDER BY s.submitted_at DESC
      LIMIT 8
    `);

    // 7.5 Recent Messages
    const recentMessagesRes = await query(`
      SELECT
        m.id,
        m.request_id,
        r.ticket_id,
        r.title AS request_title,
        m.sender_name,
        m.sender_role,
        m.text,
        m.created_at
      FROM messages m
      JOIN requests r ON r.id = m.request_id
      ORDER BY m.created_at DESC
      LIMIT 8
    `);

    const reqStats = requestsCountRes.rows[0] || {};
    const subStats = submissionsReviewRes.rows[0] || {};
    const userStats = usersCountRes.rows[0] || {};
    const compStats = companiesCountRes.rows[0] || {};
    const billStats = billingRes.rows[0] || {};

    const activeRequests = parseInt(reqStats.active_requests || 0, 10);
    const unassignedRequests = parseInt(reqStats.unassigned_requests || 0, 10);
    const clientReviewRequests = Math.max(
      parseInt(reqStats.client_review_requests || 0, 10),
      parseInt(subStats.pending_review_submissions || 0, 10)
    );
    const changesRequested = Math.max(
      parseInt(reqStats.changes_requested || 0, 10),
      parseInt(subStats.submission_changes || 0, 10)
    );
    const inProgressRequests = parseInt(reqStats.in_progress_requests || 0, 10);
    const completedRequests = parseInt(reqStats.completed_requests || 0, 10);
    const newRequests = parseInt(reqStats.new_requests || 0, 10);

    const pendingPaymentsCount = parseInt(billStats.pending_payments_count || 0, 10);
    const activeSpecialists = parseInt(userStats.active_specialists || 0, 10);

    // 8. Rule-based Operational Observations (Attention Required) - Factual & Traceable
    const attentionRequired = [];

    if (unassignedRequests > 0) {
      attentionRequired.push({
        id: 'attn-unassigned',
        severity: 'HIGH',
        category: 'Operations',
        title: `${unassignedRequests} Request${unassignedRequests === 1 ? '' : 's'} Unassigned`,
        message: `${unassignedRequests} active request${unassignedRequests === 1 ? ' is' : 's are'} currently awaiting specialist assignment.`,
        actionLabel: 'Assign Requests',
        link: '/admin/requests?filter=unassigned',
        count: unassignedRequests,
      });
    }

    if (clientReviewRequests > 0) {
      attentionRequired.push({
        id: 'attn-client-review',
        severity: 'MEDIUM',
        category: 'Deliverables',
        title: `${clientReviewRequests} Deliverable${clientReviewRequests === 1 ? '' : 's'} in Review`,
        message: `${clientReviewRequests} request submission${clientReviewRequests === 1 ? ' is' : 's are'} currently waiting for client review and approval.`,
        actionLabel: 'View Deliverables',
        link: '/admin/deliverables?filter=pending_review',
        count: clientReviewRequests,
      });
    }

    if (changesRequested > 0) {
      attentionRequired.push({
        id: 'attn-changes-req',
        severity: 'HIGH',
        category: 'Revisions',
        title: `${changesRequested} Revision${changesRequested === 1 ? '' : 's'} Requested`,
        message: `Clients requested changes on ${changesRequested} deliverable package${changesRequested === 1 ? '' : 's'}.`,
        actionLabel: 'Review Revisions',
        link: '/admin/deliverables?filter=changes_requested',
        count: changesRequested,
      });
    }

    if (pendingPaymentsCount > 0) {
      attentionRequired.push({
        id: 'attn-pending-payments',
        severity: 'MEDIUM',
        category: 'Billing',
        title: `${pendingPaymentsCount} Payment${pendingPaymentsCount === 1 ? '' : 's'} Pending`,
        message: `${pendingPaymentsCount} invoice${pendingPaymentsCount === 1 ? ' is' : 's are'} awaiting settlement confirmation ($${parseFloat(billStats.pending_revenue || 0).toFixed(2)}).`,
        actionLabel: 'Verify Billing',
        link: '/admin/billing?filter=pending',
        count: pendingPaymentsCount,
      });
    }

    // Workload alerts
    const specialists = specialistsRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      activeCount: parseInt(row.active_workload || 0, 10),
      completedCount: parseInt(row.completed_workload || 0, 10),
    }));

    const overloaded = specialists.filter(s => s.activeCount >= 5);
    if (overloaded.length > 0) {
      attentionRequired.push({
        id: 'attn-workload-high',
        severity: 'LOW',
        category: 'Team Capacity',
        title: `${overloaded.length} Specialist${overloaded.length === 1 ? '' : 's'} at Capacity`,
        message: `${overloaded.map(s => s.name).join(', ')} currently assigned ${overloaded.map(s => s.activeCount).join(', ')} active tickets.`,
        actionLabel: 'Balance Workload',
        link: '/admin/team',
        count: overloaded.length,
      });
    }

    // Format service workload
    const serviceWorkload = serviceBreakdownRes.rows.map(row => {
      let friendlyName = 'Landing Page & UI/UX';
      if (row.service_type === 'COMPANY_LEAD') friendlyName = 'Digitalising (Lead & Research)';
      if (row.service_type === 'COMPANY_BOOST') friendlyName = 'Boosting (Strategic & Outbound)';

      return {
        serviceType: row.service_type,
        serviceName: friendlyName,
        total: parseInt(row.total || 0, 10),
        active: parseInt(row.active || 0, 10),
        completed: parseInt(row.completed || 0, 10),
        inReview: parseInt(row.in_review || 0, 10),
      };
    });

    // Attention item for recent client inquiries
    const clientMessages = recentMessagesRes.rows.filter(m => m.sender_role === 'USER' || m.sender_role === 'CLIENT');
    if (clientMessages.length > 0) {
      attentionRequired.push({
        id: 'attn-client-messages',
        severity: 'MEDIUM',
        category: 'Client Communications',
        title: `${clientMessages.length} Client Inquir${clientMessages.length === 1 ? 'y' : 'ies'} Logged`,
        message: `Clients recently posted messages on tickets (e.g., "${clientMessages[0].request_title || clientMessages[0].ticket_id}": "${clientMessages[0].text?.slice(0, 45)}...").`,
        actionLabel: 'Open Communications',
        link: '/admin/messages',
        count: clientMessages.length,
      });
    }

    return res.json({
      success: true,
      data: {
        kpi: {
          activeRequests,
          newRequests,
          unassignedRequests,
          inProgressRequests,
          clientReviewRequests,
          changesRequested,
          completedRequests,
          totalRequests: parseInt(reqStats.total_requests || 0, 10),
          totalClients: parseInt(userStats.total_clients || 0, 10),
          activeClients: parseInt(userStats.active_clients || 0, 10),
          inactiveClients: parseInt(userStats.inactive_clients || 0, 10),
          totalCompanies: parseInt(compStats.total_companies || 0, 10),
          activeSpecialists,
          totalSpecialists: parseInt(userStats.total_specialists || 0, 10),
          totalRevenue: parseFloat(billStats.total_revenue || 0),
          pendingRevenue: parseFloat(billStats.pending_revenue || 0),
          completedPaymentsCount: parseInt(billStats.completed_payments_count || 0, 10),
          pendingPaymentsCount,
          recentMessagesCount: recentMessagesRes.rows.length,
          clientMessagesCount: clientMessages.length,
        },
        operationalHealth: {
          systemStatus: unassignedRequests > 5 || changesRequested > 3 ? 'ATTENTION_NEEDED' : 'HEALTHY',
          unassignedCount: unassignedRequests,
          reviewCount: clientReviewRequests,
          changesCount: changesRequested,
          pendingPaymentsCount,
          activeSpecialistsCount: activeSpecialists,
          workloadRatio: activeSpecialists > 0 ? (activeRequests / activeSpecialists).toFixed(1) : 'N/A'
        },
        attentionRequired,
        serviceWorkload,
        specialists,
        recentActivity: recentActivityRes.rows,
        recentDeliverables: recentDeliverablesRes.rows,
        recentMessages: recentMessagesRes.rows.map(m => ({
          id: m.id,
          requestId: m.request_id,
          ticketCode: m.ticket_id,
          requestTitle: m.request_title,
          senderName: m.sender_name,
          senderRole: m.sender_role,
          text: m.text,
          createdAt: m.created_at
        })),
      }
    });
  } catch (error) {
    console.error('[Admin Overview Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate administrative overview telemetry.'
    });
  }
};

/**
 * @desc    Get Central Operations Request Queue (with filters & assignment status)
 * @route   GET /api/admin/operations
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminOperations = async (req, res) => {
  try {
    const { status, service, team, specialistId, search, filter } = req.query;

    let queryText = `
      SELECT
        r.id,
        r.ticket_id,
        r.service_type,
        r.title,
        r.description,
        r.priority,
        r.status,
        r.price,
        r.payment_status,
        r.assigned_team,
        r.assigned_to,
        r.due_date,
        r.created_at,
        r.updated_at,
        r.current_submission_version,
        u.id AS client_user_id,
        u.name AS client_name,
        u.email AS client_email,
        c.id AS company_id,
        c.name AS company_name,
        spec.id AS specialist_id,
        spec.name AS specialist_name,
        spec.email AS specialist_email
      FROM requests r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN companies c ON c.id = r.company_id
      LEFT JOIN users spec ON spec.id = r.assigned_to
      WHERE 1=1
    `;

    const params = [];

    // Filter by specific filter keyword
    if (filter === 'unassigned') {
      queryText += ` AND r.assigned_to IS NULL AND r.status NOT IN ('COMPLETED', 'CANCELLED')`;
    } else if (filter === 'in_progress') {
      queryText += ` AND r.status = 'IN_PROGRESS'`;
    } else if (filter === 'client_review') {
      queryText += ` AND r.status IN ('CLIENT_REVIEW', 'WORK_SUBMITTED', 'WORK_RESUBMITTED')`;
    } else if (filter === 'changes_requested') {
      queryText += ` AND r.status = 'CHANGES_REQUESTED'`;
    } else if (filter === 'completed') {
      queryText += ` AND r.status = 'COMPLETED'`;
    } else if (filter === 'new') {
      queryText += ` AND r.status IN ('REQUEST_CREATED', 'PAYMENT_PENDING')`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      queryText += ` AND r.status = $${params.length}`;
    }

    if (service && service !== 'ALL') {
      params.push(service);
      queryText += ` AND r.service_type = $${params.length}`;
    }

    if (specialistId && specialistId !== 'ALL') {
      params.push(Number(specialistId));
      queryText += ` AND r.assigned_to = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      queryText += ` AND (
        LOWER(r.ticket_id) LIKE $${pIdx} OR
        LOWER(r.title) LIKE $${pIdx} OR
        LOWER(u.name) LIKE $${pIdx} OR
        LOWER(c.name) LIKE $${pIdx}
      )`;
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT 300`;

    const result = await query(queryText, params);

    return res.json({
      success: true,
      count: result.rows.length,
      requests: result.rows.map(row => ({
        id: row.id,
        ticketId: row.ticket_id,
        serviceType: row.service_type,
        title: row.title,
        description: row.description,
        priority: row.priority,
        status: row.status,
        price: parseFloat(row.price || 0),
        paymentStatus: row.payment_status,
        assignedTeam: row.assigned_team,
        assignedTo: row.assigned_to,
        dueDate: row.due_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        currentSubmissionVersion: row.current_submission_version,
        client: {
          id: row.client_user_id,
          name: row.client_name,
          email: row.client_email,
        },
        company: {
          id: row.company_id,
          name: row.company_name,
        },
        specialist: row.specialist_id ? {
          id: row.specialist_id,
          name: row.specialist_name,
          email: row.specialist_email,
        } : null,
      }))
    });
  } catch (error) {
    console.error('[Admin Operations Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve operations requests queue.'
    });
  }
};

/**
 * @desc    Get All Clients & Companies for Admin View
 * @route   GET /api/admin/clients-overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminClientsOverview = async (req, res) => {
  try {
    const clientsRes = await query(`
      SELECT
        c.id AS company_id,
        c.name AS company_name,
        c.contact_person,
        c.email AS company_email,
        c.phone,
        c.website,
        c.industry,
        c.created_at,
        COUNT(DISTINCT u.id) AS users_count,
        COUNT(DISTINCT r.id) AS total_requests,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status NOT IN ('COMPLETED', 'CANCELLED')) AS active_requests,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed_requests,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'PAID'), 0) AS total_paid
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.is_deleted = false
      LEFT JOIN requests r ON r.company_id = c.id
      LEFT JOIN payments p ON p.company_id = c.id
      GROUP BY c.id, c.name, c.contact_person, c.email, c.phone, c.website, c.industry, c.created_at
      ORDER BY c.created_at DESC
    `);

    // Individual client users
    const usersRes = await query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.phone,
        u.last_login,
        u.created_at,
        c.id AS company_id,
        c.name AS company_name
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE u.role = 'USER' AND u.is_deleted = false
      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      companies: clientsRes.rows.map(row => ({
        id: row.company_id,
        name: row.company_name,
        contactPerson: row.contact_person,
        email: row.company_email,
        phone: row.phone,
        website: row.website,
        industry: row.industry,
        createdAt: row.created_at,
        usersCount: parseInt(row.users_count || 0, 10),
        totalRequests: parseInt(row.total_requests || 0, 10),
        activeRequests: parseInt(row.active_requests || 0, 10),
        completedRequests: parseInt(row.completed_requests || 0, 10),
        totalPaid: parseFloat(row.total_paid || 0),
      })),
      clientUsers: usersRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        phone: row.phone,
        lastLogin: row.last_login,
        createdAt: row.created_at,
        company: row.company_id ? {
          id: row.company_id,
          name: row.company_name,
        } : null,
      }))
    });
  } catch (error) {
    console.error('[Admin Clients Overview Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients overview.'
    });
  }
};

/**
 * @desc    Get Team & Specialists Management Telemetry
 * @route   GET /api/admin/team-overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminTeamOverview = async (req, res) => {
  try {
    const specialistsRes = await query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.phone,
        u.last_login,
        u.company_boost,
        u.company_lead,
        u.company_ui,
        u.created_at,
        COUNT(r.id) FILTER (WHERE r.status NOT IN ('COMPLETED', 'CANCELLED')) AS active_workload,
        COUNT(r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed_workload
      FROM users u
      LEFT JOIN requests r ON r.assigned_to = u.id
      WHERE u.role IN ('ADMIN', 'SUPER_ADMIN', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
        AND u.is_deleted = false
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.phone, u.last_login, u.company_boost, u.company_lead, u.company_ui, u.created_at
      ORDER BY u.role ASC, active_workload DESC
    `);

    return res.json({
      success: true,
      teamMembers: specialistsRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        phone: row.phone,
        lastLogin: row.last_login,
        createdAt: row.created_at,
        activeWorkload: parseInt(row.active_workload || 0, 10),
        completedWorkload: parseInt(row.completed_workload || 0, 10),
        dashboardAccess: {
          companyBoost: Boolean(row.company_boost),
          companyLead: Boolean(row.company_lead),
          companyUI: Boolean(row.company_ui),
        }
      }))
    });
  } catch (error) {
    console.error('[Admin Team Overview Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve team members overview.'
    });
  }
};

/**
 * @desc    Get All Deliverables & Versions
 * @route   GET /api/admin/deliverables-overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminDeliverablesOverview = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        s.id,
        s.request_id,
        s.ticket_code,
        s.version,
        s.title,
        s.description,
        s.external_link,
        s.notes,
        s.status,
        s.submitted_at,
        s.submitted_by,
        s.submitted_by_name,
        s.review_status,
        s.review_feedback,
        s.reviewed_at,
        r.title AS request_title,
        r.service_type,
        c.name AS company_name,
        client_u.name AS client_name
      FROM submissions s
      JOIN requests r ON r.id = s.request_id
      LEFT JOIN companies c ON c.id = r.company_id
      LEFT JOIN users client_u ON client_u.id = r.user_id
      ORDER BY s.submitted_at DESC
      LIMIT 200
    `);

    return res.json({
      success: true,
      deliverables: result.rows.map(row => ({
        id: row.id,
        requestId: row.request_id,
        ticketCode: row.ticket_code,
        version: row.version,
        title: row.title,
        description: row.description,
        externalLink: row.external_link,
        notes: row.notes,
        status: row.status,
        submittedAt: row.submitted_at,
        submittedBy: row.submitted_by,
        submittedByName: row.submitted_by_name,
        reviewStatus: row.review_status,
        reviewFeedback: row.review_feedback,
        reviewedAt: row.reviewed_at,
        requestTitle: row.request_title,
        serviceType: row.service_type,
        companyName: row.company_name,
        clientName: row.client_name,
      }))
    });
  } catch (error) {
    console.error('[Admin Deliverables Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve deliverables lifecycle.'
    });
  }
};

/**
 * @desc    Get Billing & Invoices Overview
 * @route   GET /api/admin/billing-overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminBillingOverview = async (req, res) => {
  try {
    const paymentsRes = await query(`
      SELECT
        p.id,
        p.invoice_number,
        p.request_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.paid_at,
        p.created_at,
        r.ticket_id,
        r.title AS request_title,
        r.service_type,
        c.name AS company_name,
        u.name AS client_name,
        u.email AS client_email
      FROM payments p
      LEFT JOIN requests r ON r.id = p.request_id
      LEFT JOIN companies c ON c.id = p.company_id
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 200
    `);

    const summaryRes = await query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'PAID') AS completed_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS pending_revenue,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count
      FROM payments
    `);

    const summary = summaryRes.rows[0] || {};

    return res.json({
      success: true,
      summary: {
        totalRevenue: parseFloat(summary.total_revenue || 0),
        completedCount: parseInt(summary.completed_count || 0, 10),
        pendingRevenue: parseFloat(summary.pending_revenue || 0),
        pendingCount: parseInt(summary.pending_count || 0, 10),
      },
      payments: paymentsRes.rows.map(row => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        requestId: row.request_id,
        amount: parseFloat(row.amount || 0),
        currency: row.currency,
        status: row.status,
        paymentMethod: row.payment_method,
        paidAt: row.paid_at,
        createdAt: row.created_at,
        ticketId: row.ticket_id,
        requestTitle: row.request_title,
        serviceType: row.service_type,
        companyName: row.company_name,
        clientName: row.client_name,
        clientEmail: row.client_email,
      }))
    });
  } catch (error) {
    console.error('[Admin Billing Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve billing records.'
    });
  }
};

/**
 * @desc    Get Factual Reports & Aggregations (Date filtered)
 * @route   GET /api/admin/reports-overview
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminReportsOverview = async (req, res) => {
  try {
    const { range = '30d' } = req.query;

    let intervalStr = '30 days';
    if (range === 'today') intervalStr = '1 day';
    if (range === '7d') intervalStr = '7 days';
    if (range === '90d') intervalStr = '90 days';
    if (range === 'all') intervalStr = '1000 days';

    // 1. Status breakdown
    const statusRes = await query(`
      SELECT status, COUNT(*) AS count
      FROM requests
      WHERE created_at >= NOW() - INTERVAL '${intervalStr}'
      GROUP BY status
    `);

    // 2. Service breakdown
    const serviceRes = await query(`
      SELECT service_type, COUNT(*) AS count
      FROM requests
      WHERE created_at >= NOW() - INTERVAL '${intervalStr}'
      GROUP BY service_type
    `);

    // 3. Team performance (completed vs active)
    const teamRes = await query(`
      SELECT
        u.name,
        u.role,
        COUNT(r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed,
        COUNT(r.id) FILTER (WHERE r.status NOT IN ('COMPLETED', 'CANCELLED')) AS active
      FROM users u
      LEFT JOIN requests r ON r.assigned_to = u.id AND r.created_at >= NOW() - INTERVAL '${intervalStr}'
      WHERE u.role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
      GROUP BY u.id, u.name, u.role
      ORDER BY completed DESC
    `);

    // 4. Financial total in date range
    const financialRes = await query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS revenue,
        COUNT(*) FILTER (WHERE status = 'PAID') AS paid_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS pending_amount,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '${intervalStr}'
    `);

    return res.json({
      success: true,
      range,
      data: {
        statusDistribution: statusRes.rows,
        serviceDistribution: serviceRes.rows,
        teamWorkload: teamRes.rows,
        financial: financialRes.rows[0] || { revenue: 0, paid_count: 0, pending_amount: 0, pending_count: 0 },
      }
    });
  } catch (error) {
    console.error('[Admin Reports Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate reports telemetry.'
    });
  }
};

/**
 * @desc    Get Roles & Permissions Matrix
 * @route   GET /api/admin/permissions-matrix
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const getAdminPermissionsMatrix = async (req, res) => {
  try {
    const dbRes = await query('SELECT role, permissions FROM role_permissions');
    const dbMatrix = { ...DEFAULT_ROLE_PERMISSIONS };
    if (dbRes.rows && dbRes.rows.length > 0) {
      dbRes.rows.forEach(r => {
        dbMatrix[r.role] = Array.isArray(r.permissions) ? r.permissions : (typeof r.permissions === 'string' ? JSON.parse(r.permissions) : []);
      });
    }

    // Ensure SUPER_ADMIN always has all platform permissions
    dbMatrix.SUPER_ADMIN = PLATFORM_PERMISSIONS.map(p => p.id);
    activeRolePermissions = dbMatrix;

    return res.json({
      success: true,
      catalog: PLATFORM_PERMISSIONS,
      matrix: activeRolePermissions,
    });
  } catch (error) {
    console.error('[Admin Permissions Error]:', error);
    return res.json({
      success: true,
      catalog: PLATFORM_PERMISSIONS,
      matrix: activeRolePermissions,
    });
  }
};

/**
 * @desc    Update Permissions for a Role (with audit logging)
 * @route   POST /api/admin/permissions-matrix
 * @access  Private (SUPER_ADMIN only)
 */
export const updateRolePermissionsMatrix = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Role name and permissions array are required.'
      });
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'SUPER_ADMIN permissions are immutable and retain full platform governance.'
      });
    }

    const previousPerms = activeRolePermissions[role] || [];
    activeRolePermissions[role] = permissions;

    // Persist to PostgreSQL database
    await query(`
      INSERT INTO role_permissions (role, permissions, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (role) DO UPDATE SET permissions = $2::jsonb, updated_at = NOW()
    `, [role, JSON.stringify(permissions)]);

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      action: 'PERMISSIONS_MATRIX_UPDATED',
      details: `Super Admin ${req.user.name} updated role permissions for ${role}. Changed: ${previousPerms.length} -> ${permissions.length} permissions.`
    });

    return res.json({
      success: true,
      message: `Permissions updated successfully for role ${role}.`,
      matrix: activeRolePermissions,
    });
  } catch (error) {
    console.error('[Update Permissions Matrix Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update permissions matrix.'
    });
  }
};

/**
 * @desc    Assign or Reassign Request Specialist / Team (with audit logging)
 * @route   POST /api/admin/requests/:id/reassign
 * @access  Private (ADMIN / SUPER_ADMIN)
 */
export const reassignRequestByAdmin = async (req, res) => {
  try {
    const { assignedTo, assignedTeam, dueDate, reason } = req.body;
    const requestId = req.params.id;

    const request = await findRequestById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await findUserById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ success: false, message: 'Selected specialist not found' });
      }
    }

    const prevAssignedId = request.assignedTo?.id || request.assignedTo?._id || request.assignedTo;
    const isDifferent = assignedUser && String(prevAssignedId) !== String(assignedUser.id);

    const updates = {};
    if (assignedUser) updates.assignedTo = assignedUser.id;
    if (assignedTeam) updates.assignedTeam = assignedTeam;
    if (dueDate) updates.dueDate = new Date(dueDate);

    if (request.status === 'REQUEST_CREATED' || request.status === 'PAYMENT_PENDING' || request.status === 'PAYMENT_COMPLETED') {
      updates.status = 'ASSIGNED';
    }

    const updatedRequest = await updateRequest(request.id, updates);

    // Audit log
    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      companyId: request.companyId?.id || request.companyId,
      requestId: request.id,
      action: isDifferent ? 'REQUEST_REASSIGNED' : 'REQUEST_ASSIGNED',
      details: `Administrator ${req.user.name} assigned ticket ${request.ticketId} to ${assignedUser ? assignedUser.name : 'Team'} (${assignedTeam || 'Default'}). ${reason ? `Reason: ${reason}` : ''}`
    });

    if (assignedUser) {
      await createNotification({
        userId: assignedUser.id,
        type: 'ASSIGNMENT',
        title: 'Ticket Assigned by Admin',
        message: `Ticket ${request.ticketId} has been assigned to you by Super Admin ${req.user.name}.`,
        ticketId: request.id,
        ticketCode: request.ticketId
      });

      if (isDifferent) {
        sendTicketAssignedEmail({
          specialist: assignedUser,
          ticket: updatedRequest || request,
          assignedBy: req.user
        }).catch(err => console.error('[EMAIL DISPATCH ERROR]:', err));
      }
    }

    return res.json({
      success: true,
      message: `Ticket ${request.ticketId} successfully assigned.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('[Admin Reassign Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign ticket.'
    });
  }
};

/**
 * @desc    Change User Role (with audit logging)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (SUPER_ADMIN only)
 */
export const changeUserRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const targetUserId = req.params.id;

    const validRoles = ['USER', 'COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Valid roles: ${validRoles.join(', ')}`
      });
    }

    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect primary root admin
    if (targetUser.email === 'admin@creativegini.com' && newRole !== 'SUPER_ADMIN' && newRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot demote primary system administrator.'
      });
    }

    const prevRole = targetUser.role;

    // Set dashboard access flags corresponding to role
    let companyLead = Boolean(targetUser.companyLead);
    let companyBoost = Boolean(targetUser.companyBoost);
    let companyUI = Boolean(targetUser.companyUI);

    if (newRole === 'COMPANY_LEAD') companyLead = true;
    if (newRole === 'COMPANY_BOOST') companyBoost = true;
    if (newRole === 'LANDING_PAGE') companyUI = true;
    if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
      companyLead = true;
      companyBoost = true;
      companyUI = true;
    }

    await query(`
      UPDATE users
      SET role = $1, company_lead = $2, company_boost = $3, company_ui = $4, updated_at = NOW()
      WHERE id = $5
    `, [newRole, companyLead, companyBoost, companyUI, targetUser.id]);

    await createActivityLog({
      userId: req.user.id || req.user._id,
      userName: req.user.name,
      action: 'USER_ROLE_CHANGED',
      details: `Super Admin ${req.user.name} changed role of user ${targetUser.name} (${targetUser.email}) from ${prevRole} to ${newRole}.`
    });

    return res.json({
      success: true,
      message: `User role changed from ${prevRole} to ${newRole}.`,
      userId: targetUser.id,
      newRole,
    });
  } catch (error) {
    console.error('[Change User Role Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.'
    });
  }
};
