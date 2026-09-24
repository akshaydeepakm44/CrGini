import {
  findCompanyById,
  getCompanyLeads,
  getKeyPeople,
  findLeadById,
  addCompanyLead,
  updateCompanyLead,
  deleteCompanyLead,
  addKeyPerson,
  deleteKeyPerson,
} from '../repositories/companyRepository.js';
import { query } from '../config/postgres.js';

// Verification validation helper
const isLeadVerified = (lead) => {
  const statusUpper = (lead.status || '').toUpperCase();
  const hasNotes = Boolean(lead.notes && lead.notes.trim().length > 0);
  return statusUpper === 'VERIFIED' && hasNotes;
};

// @desc    Get current user's company information
// @route   GET /api/company/my-company
// @access  Private
export const getMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company profile linked to this account.',
      });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    return res.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Company Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company details. Please try again later.',
    });
  }
};

// @desc    Get current user's company leads with calculated metrics and requests
// @route   GET /api/company/my-company/leads
// @access  Private
export const getMyCompanyLeads = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company profile linked to this account.',
      });
    }

    const [company, rawLeads, keyPeople, requestRows] = await Promise.all([
      findCompanyById(companyId),
      getCompanyLeads(companyId),
      getKeyPeople(companyId),
      query(
        `SELECT id, ticket_id AS "ticketId", title, status, priority, price, payment_status AS "paymentStatus", assigned_team AS "assignedTeam", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM requests
         WHERE company_id = $1 AND service_type = 'COMPANY_LEAD'
         ORDER BY created_at DESC;`,
        [companyId]
      ),
    ]);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    const leads = rawLeads.map((l) => ({
      ...l,
      isVerified: isLeadVerified(l),
    }));

    const verifiedCount = leads.filter((l) => l.isVerified).length;
    const pendingCount = leads.filter(
      (l) => (l.status || '').toUpperCase() === 'PENDING'
    ).length;
    const researchedCount = leads.filter(
      (l) => (l.status || '').toUpperCase() === 'RESEARCHED'
    ).length;

    const metrics = {
      totalLeads: leads.length,
      verifiedLeads: verifiedCount,
      pendingVerification: pendingCount,
      researchedLeads: researchedCount,
      keyPeopleCount: keyPeople.length,
    };

    return res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        contactPerson: company.contactPerson,
        email: company.email,
        website: company.website,
        industry: company.industry,
        companyInfo: company.companyInfo,
        researchSummary: company.researchSummary,
      },
      leads,
      keyPeople,
      requests: requestRows.rows,
      latestRequest: requestRows.rows[0] || null,
      metrics,
    });
  } catch (error) {
    console.error('[Company Leads Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company leads.',
    });
  }
};

// @desc    Get lead details for current user's company (IDOR protected)
// @route   GET /api/company/my-company/leads/:id
// @access  Private
export const getMyCompanyLeadDetail = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const leadId = req.params.id;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No company assigned to this account.',
      });
    }

    const lead = await findLeadById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    // Security check: Must belong to user's company
    if (String(lead.company_id) !== String(companyId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this lead.',
      });
    }

    const [keyPeople, requestRows] = await Promise.all([
      getKeyPeople(companyId),
      query(
        `SELECT id, ticket_id AS "ticketId", title, status, priority, created_at AS "createdAt"
         FROM requests
         WHERE company_id = $1 AND service_type = 'COMPANY_LEAD'
         ORDER BY created_at DESC
         LIMIT 1;`,
        [companyId]
      ),
    ]);

    return res.json({
      success: true,
      lead: {
        ...lead,
        isVerified: isLeadVerified(lead),
      },
      keyPeople,
      relatedRequest: requestRows.rows[0] || null,
    });
  } catch (error) {
    console.error('[Lead Detail Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lead details.',
    });
  }
};

// @desc    Get company by ID (Admin / Specialist)
// @route   GET /api/company/:id
// @access  Private
export const getCompanyById = async (req, res) => {
  try {
    const company = await findCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Company Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company details. Please try again later.',
    });
  }
};

// @desc    Add a lead to a company (Admin / Specialist)
// @route   POST /api/company/:companyId/leads
// @access  Private (ADMIN, COMPANY_LEAD)
export const addLead = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, title, company, lead_company, email, linkedin, location, status, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lead name is required.',
      });
    }

    // Verification check: cannot start as VERIFIED without research notes
    let finalStatus = (status || 'PENDING').trim();
    if (finalStatus.toUpperCase() === 'VERIFIED' && (!notes || !notes.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A lead cannot be marked VERIFIED without research/verification notes.',
      });
    }

    const newLead = await addCompanyLead(companyId, {
      name: name.trim(),
      title: title?.trim() || null,
      company: (company || lead_company || '').trim() || null,
      email: email?.trim() || null,
      linkedin: linkedin?.trim() || null,
      location: location?.trim() || null,
      status: finalStatus,
      notes: notes?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      lead: newLead,
    });
  } catch (error) {
    console.error('[Add Lead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add company lead.',
    });
  }
};

// @desc    Update a lead (Admin / Specialist)
// @route   PATCH /api/company/leads/:id
// @access  Private (ADMIN, COMPANY_LEAD)
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const existing = await findLeadById(leadId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.',
      });
    }

    const { name, title, company, email, linkedin, location, status, notes } = req.body;

    // If changing to VERIFIED, verify notes exist
    if (status && status.toUpperCase() === 'VERIFIED') {
      const combinedNotes = notes !== undefined ? notes : existing.notes;
      if (!combinedNotes || !combinedNotes.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark lead as VERIFIED without research/verification notes.',
        });
      }
    }

    const updated = await updateCompanyLead(leadId, {
      name,
      title,
      company,
      email,
      linkedin,
      location,
      status,
      notes,
    });

    return res.json({
      success: true,
      lead: updated,
    });
  } catch (error) {
    console.error('[Update Lead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update company lead.',
    });
  }
};

// @desc    Delete a lead (Admin / Specialist)
// @route   DELETE /api/company/leads/:id
// @access  Private (ADMIN, COMPANY_LEAD)
export const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const deleted = await deleteCompanyLead(leadId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or already deleted.',
      });
    }

    return res.json({
      success: true,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    console.error('[Delete Lead Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete company lead.',
    });
  }
};

// @desc    Add a key person to a company (Admin / Specialist)
// @route   POST /api/company/:companyId/key-people
// @access  Private (ADMIN, COMPANY_LEAD)
export const addKeyPersonHandler = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, role, department, contact, socialProfile } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Key person name is required.',
      });
    }

    const person = await addKeyPerson(companyId, {
      name: name.trim(),
      role: role?.trim() || null,
      department: department?.trim() || null,
      contact: contact?.trim() || null,
      socialProfile: socialProfile?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      keyPerson: person,
    });
  } catch (error) {
    console.error('[Add Key Person Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add key person.',
    });
  }
};

// @desc    Delete a key person (Admin / Specialist)
// @route   DELETE /api/company/key-people/:id
// @access  Private (ADMIN, COMPANY_LEAD)
export const deleteKeyPersonHandler = async (req, res) => {
  try {
    const personId = req.params.id;
    const deleted = await deleteKeyPerson(personId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Key person not found or already deleted.',
      });
    }

    return res.json({
      success: true,
      message: 'Key person deleted successfully.',
    });
  } catch (error) {
    console.error('[Delete Key Person Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete key person.',
    });
  }
};

// @desc    Get onboarding samples for a company (Poster, Video, Strategic Plan, DevRel Plan)
// @route   GET /api/company/:companyId/onboarding-assets
// @access  Private (ADMIN, COMPANY_BOOST, or Client of that company)
export const getCompanyOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = req.params.companyId === 'my-company' 
      ? req.user.companyId 
      : req.params.companyId;

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    // Authorization check
    if (req.user.role === 'USER') {
      const userCompanyId = req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id));
      if (String(userCompanyId) !== String(targetCompanyId)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot access assets of another company.' });
      }
    } else if (!['ADMIN', 'COMPANY_BOOST'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }

    // Find company
    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Look for onboarding request (service_type = COMPANY_BOOST, title contains Onboarding or Welcome)
    const reqRes = await query(`
      SELECT r.id, r.ticket_id, r.status, r.created_at
      FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_BOOST'
        AND (r.title ILIKE '%Onboarding%' OR r.title ILIKE '%Welcome / Initial%')
      ORDER BY r.created_at ASC
      LIMIT 1
    `, [targetCompanyId]);

    let poster = null;
    let video = null;
    let strategicPlan = null;
    let devrelPlan = null;
    let ticketId = null;

    if (reqRes.rows.length > 0) {
      const reqRow = reqRes.rows[0];
      ticketId = reqRow.ticket_id;

      // Find submission V1
      const subRes = await query(`
        SELECT id FROM submissions WHERE request_id = $1 ORDER BY version ASC LIMIT 1
      `, [reqRow.id]);

      if (subRes.rows.length > 0) {
        const subId = subRes.rows[0].id;
        const filesRes = await query(`
          SELECT id, name, url, size, type, created_at
          FROM submission_files
          WHERE submission_id = $1
          ORDER BY created_at ASC
        `, [subId]);

        for (const file of filesRes.rows) {
          const rawName = file.name || '';
          const nameLower = rawName.toLowerCase();
          const mime = (file.type || '').toLowerCase();

          const fileObj = {
            id: file.id,
            name: rawName.replace(/^\[(Poster|Video|Strategic Plan|DevRel Plan)\]\s*/i, ''),
            rawName,
            size: file.size,
            type: file.type,
            url: file.url,
            streamUrl: `/api/assets/${file.id}/stream`,
            createdAt: file.created_at
          };

          if (rawName.startsWith('[Poster]') || (!poster && mime.startsWith('image/')) || nameLower.includes('poster')) {
            poster = fileObj;
          } else if (rawName.startsWith('[Video]') || (!video && mime.startsWith('video/')) || nameLower.includes('video')) {
            video = fileObj;
          } else if (rawName.startsWith('[Strategic Plan]') || nameLower.includes('strategic') || nameLower.includes('strategy')) {
            strategicPlan = fileObj;
          } else if (rawName.startsWith('[DevRel Plan]') || nameLower.includes('devrel') || nameLower.includes('developer_relations')) {
            devrelPlan = fileObj;
          }
        }
      }
    }

    return res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        contactPerson: company.contactPerson,
        website: company.website,
        industry: company.industry
      },
      ticketId,
      assets: {
        poster,
        video,
        strategicPlan,
        devrelPlan
      },
      status: {
        poster: poster ? 'Uploaded' : 'Pending',
        video: video ? 'Uploaded' : 'Pending',
        strategicPlan: strategicPlan ? 'Uploaded' : 'Pending',
        devrelPlan: devrelPlan ? 'Uploaded' : 'Pending'
      }
    });
  } catch (error) {
    console.error('[Get Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch onboarding assets.' });
  }
};

// @desc    Upload / save onboarding samples for a company in the existing Assets system
// @route   POST /api/company/:companyId/onboarding-assets
// @access  Private (ADMIN, COMPANY_BOOST)
export const saveCompanyOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = req.params.companyId;
    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Find primary client user for this company
    const clientUserRes = await query(`
      SELECT id, name, email FROM users WHERE company_id = $1 AND role = 'USER' ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);
    const clientUserId = clientUserRes.rows[0]?.id || req.user.id;

    // Check or create onboarding request in requests table
    let request;
    const reqCheck = await query(`
      SELECT * FROM requests 
      WHERE company_id = $1 AND service_type = 'COMPANY_BOOST'
        AND (title ILIKE '%Onboarding%' OR title ILIKE '%Welcome / Initial%')
      ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);

    if (reqCheck.rows.length > 0) {
      request = reqCheck.rows[0];
    } else {
      const countRes = await query('SELECT COUNT(*)::int as count FROM requests');
      const ticketId = `CG-BST-ONB-${1000 + (countRes.rows[0]?.count || 0) + 1}`;
      const insertReq = await query(`
        INSERT INTO requests (
          ticket_id, user_id, company_id, service_type, title, description,
          priority, status, price, payment_status, assigned_team, completed_at
        ) VALUES (
          $1, $2, $3, 'COMPANY_BOOST', 'Company Boost Onboarding Samples',
          'Initial Company Boost onboarding materials prepared for client workspace: Strategic Plan, DevRel Plan, Branded Poster, and Showcase Video.',
          'MEDIUM', 'COMPLETED', 799, 'PAID', 'Company Boost Team', NOW()
        ) RETURNING *
      `, [ticketId, clientUserId, targetCompanyId]);
      request = insertReq.rows[0];
    }

    // Check or create submission V1
    let submission;
    const subCheck = await query(`
      SELECT * FROM submissions WHERE request_id = $1 ORDER BY version ASC LIMIT 1
    `, [request.id]);

    if (subCheck.rows.length > 0) {
      submission = subCheck.rows[0];
    } else {
      const insertSub = await query(`
        INSERT INTO submissions (
          request_id, ticket_code, version, title, description, status,
          submitted_by, submitted_by_name, submitted_at
        ) VALUES (
          $1, $2, 1, 'Company Boost Onboarding Materials',
          'Approved onboarding samples including Strategic Plan, DevRel Plan, Poster, and Video.',
          'APPROVED', $3, $4, NOW()
        ) RETURNING *
      `, [request.id, request.ticket_id, req.user.id, req.user.name]);
      submission = insertSub.rows[0];
    }

    const { poster, video, strategicPlan, devrelPlan } = req.body;

    // Helper to upsert a file
    const upsertFile = async (tag, fileData, defaultMime) => {
      if (!fileData) return;
      // Remove previous matching file
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND (name ILIKE $2 OR ($3 != '' AND type ILIKE $3))
      `, [submission.id, `[${tag}]%`, defaultMime ? `${defaultMime}%` : '']);

      // Insert new file
      const fileName = `[${tag}] ${fileData.name || tag}`;
      const mime = fileData.mimeType || fileData.type || (tag === 'Poster' ? 'image/png' : tag === 'Video' ? 'video/mp4' : 'application/pdf');
      const size = fileData.size ? (typeof fileData.size === 'number' ? `${(fileData.size / 1024).toFixed(1)} KB` : String(fileData.size)) : 'Unknown';
      const url = fileData.dataUrl || fileData.url || '';

      await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [submission.id, fileName, url, size, mime]);
    };

    if (poster) await upsertFile('Poster', poster, 'image');
    if (video) await upsertFile('Video', video, 'video');
    if (strategicPlan) await upsertFile('Strategic Plan', strategicPlan, '');
    if (devrelPlan) await upsertFile('DevRel Plan', devrelPlan, '');

    return res.json({
      success: true,
      message: 'Onboarding sample assets saved successfully.',
      ticketId: request.ticket_id
    });
  } catch (error) {
    console.error('[Save Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save onboarding assets.' });
  }
};

// @desc    Get all companies with their onboarding assets status for the Company Boost team
// @route   GET /api/company/onboarding/clients
// @access  Private (ADMIN, COMPANY_BOOST)
export const getOnboardingClients = async (req, res) => {
  try {
    const companiesRes = await query(`
      SELECT 
        c.id, c.name, c.contact_person AS "contactPerson", c.email, 
        c.phone, c.website, c.industry, c.company_info AS "companyInfo", 
        c.created_at AS "createdAt",
        u.id AS "clientUserId", u.name AS "clientUserName", u.email AS "clientUserEmail",
        r.id AS "onboardingRequestId", r.ticket_id AS "onboardingTicketId"
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role = 'USER' AND u.is_deleted = false
      LEFT JOIN requests r ON r.company_id = c.id AND r.service_type = 'COMPANY_BOOST' 
        AND (r.title ILIKE '%Onboarding%' OR r.title ILIKE '%Welcome / Initial%')
      ORDER BY c.created_at DESC
    `);

    // For each company, fetch files in onboarding submission
    const clientsWithStatus = await Promise.all(companiesRes.rows.map(async (row) => {
      let posterUploaded = false;
      let videoUploaded = false;
      let strategicPlanUploaded = false;
      let devrelPlanUploaded = false;

      if (row.onboardingRequestId) {
        const filesRes = await query(`
          SELECT sf.name, sf.type
          FROM submission_files sf
          JOIN submissions s ON s.id = sf.submission_id
          WHERE s.request_id = $1
        `, [row.onboardingRequestId]);

        for (const f of filesRes.rows) {
          const n = (f.name || '').toLowerCase();
          const t = (f.type || '').toLowerCase();
          if (n.startsWith('[poster]') || t.startsWith('image/') || n.includes('poster')) posterUploaded = true;
          if (n.startsWith('[video]') || t.startsWith('video/') || n.includes('video')) videoUploaded = true;
          if (n.startsWith('[strategic plan]') || n.includes('strategic') || n.includes('strategy')) strategicPlanUploaded = true;
          if (n.startsWith('[devrel plan]') || n.includes('devrel')) devrelPlanUploaded = true;
        }
      }

      return {
        id: row.id,
        name: row.name,
        contactPerson: row.contactPerson || row.clientUserName || 'N/A',
        email: row.clientUserEmail || row.email || 'N/A',
        phone: row.phone,
        website: row.website,
        industry: row.industry || 'Technology / SaaS',
        companyInfo: row.companyInfo,
        createdAt: row.createdAt,
        onboardingTicketId: row.onboardingTicketId || null,
        onboardingStatus: {
          poster: posterUploaded ? 'Uploaded' : 'Pending',
          video: videoUploaded ? 'Uploaded' : 'Pending',
          strategicPlan: strategicPlanUploaded ? 'Uploaded' : 'Pending',
          devrelPlan: devrelPlanUploaded ? 'Uploaded' : 'Pending',
          allPrepared: posterUploaded && videoUploaded && strategicPlanUploaded && devrelPlanUploaded
        }
      };
    }));

    return res.json({
      success: true,
      count: clientsWithStatus.length,
      clients: clientsWithStatus
    });
  } catch (error) {
    console.error('[Get Onboarding Clients Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch onboarding clients.' });
  }
};

