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
  updateCompany,
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

// @desc    Update company research / study (Admin / Specialist)
// @route   PATCH /api/company/:companyId/research
// @access  Private (ADMIN, COMPANY_LEAD)
export const updateCompanyResearchHandler = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { researchSummary } = req.body;

    const company = await findCompanyById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const updated = await updateCompany(companyId, {
      researchSummary: typeof researchSummary === 'string' ? researchSummary.trim() : null
    });

    return res.json({
      success: true,
      message: 'Company research study saved successfully.',
      company: updated
    });
  } catch (error) {
    console.error('[Update Company Research Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update company research.' });
  }
};

// @desc    Get company leads & key people by companyId (Admin / Specialist)
// @route   GET /api/company/:companyId/leads
// @access  Private (ADMIN, COMPANY_LEAD)
export const getCompanyLeadsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const [company, rawLeads, keyPeople] = await Promise.all([
      findCompanyById(companyId),
      getCompanyLeads(companyId),
      getKeyPeople(companyId),
    ]);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const leads = rawLeads.map((l) => ({
      ...l,
      isVerified: isLeadVerified(l),
    }));

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
    });
  } catch (error) {
    console.error('[Get Company Leads By ID Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch company leads.' });
  }
};

// @desc    Get onboarding samples for a company (Poster, Video, Strategic Plan, DevRel Plan)
// @route   GET /api/company/:companyId/onboarding-assets
// @access  Private (ADMIN, COMPANY_BOOST, or Client of that company)
export const getCompanyOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = (!req.params.companyId || req.params.companyId === 'my-company')
      ? (req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id)))
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
    } else if (
      !['ADMIN', 'COMPANY_BOOST'].includes(req.user.role) &&
      !req.user.company_boost &&
      !req.user.companyBoost &&
      !(req.user.dashboardAccess && req.user.dashboardAccess.companyBoost)
    ) {
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
            downloadUrl: `/api/assets/${file.id}/download`,
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

    const { poster, video, strategicPlan, devrelPlan } = req.body || {};

    // Helper to safely upsert an onboarding file without duplicate rows or corrupting existing assets
    const upsertFile = async (tag, fileData, defaultMime) => {
      if (!fileData) return;

      // If file already exists and was not replaced (has id and no new dataUrl), verify and keep it intact
      if (fileData.id && !fileData.dataUrl) {
        const existingCheck = await query(
          `SELECT id FROM submission_files WHERE id = $1 AND submission_id = $2`,
          [fileData.id, submission.id]
        );
        if (existingCheck.rows.length > 0) {
          // Untouched file remains valid in the submission
          return;
        }
      }

      const url = fileData.dataUrl || fileData.url || '';
      if (!url) return;

      // Remove previous matching file for this tag in this submission
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND (name ILIKE $2 OR ($3 != '' AND type ILIKE $3))
      `, [submission.id, `[${tag}]%`, defaultMime ? `${defaultMime}%` : '']);

      // Insert new or replaced file
      const fileName = `[${tag}] ${fileData.name || tag}`;
      const mime = fileData.mimeType || fileData.type || (tag === 'Poster' ? 'image/png' : tag === 'Video' ? 'video/mp4' : 'application/pdf');
      const size = fileData.size ? (typeof fileData.size === 'number' ? `${(fileData.size / 1024).toFixed(1)} KB` : String(fileData.size)) : 'Unknown';

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

// @desc    Get all companies with their onboarding assets status for internal teams (Company Boost & Company Lead)
// @route   GET /api/company/onboarding/clients
// @desc    Get all companies with their onboarding assets status for internal teams (Company Boost, Company Lead, Landing Page)
// @route   GET /api/company/onboarding/clients
// @access  Private (ADMIN, COMPANY_BOOST, COMPANY_LEAD, LANDING_PAGE)
export const getOnboardingClients = async (req, res) => {
  try {
    const companiesRes = await query(`
      SELECT 
        c.id, c.name, c.contact_person AS "contactPerson", c.email, 
        c.phone, c.website, c.industry, c.company_info AS "companyInfo", 
        c.research_summary AS "researchSummary",
        c.created_at AS "createdAt",
        u.id AS "clientUserId", u.name AS "clientUserName", u.email AS "clientUserEmail",
        rb.id AS "boostRequestId", rb.ticket_id AS "boostTicketId",
        rl.id AS "leadRequestId", rl.ticket_id AS "leadTicketId",
        ru.id AS "uiRequestId", ru.ticket_id AS "uiTicketId",
        (SELECT COUNT(*)::int FROM company_leads WHERE company_id = c.id) AS "leadCount",
        (SELECT COUNT(*)::int FROM company_leads WHERE company_id = c.id AND UPPER(status) = 'VERIFIED' AND notes IS NOT NULL AND TRIM(notes) != '') AS "verifiedLeadCount",
        (SELECT COUNT(*)::int FROM submission_files sf JOIN submissions s ON sf.submission_id = s.id WHERE s.request_id = rl.id) AS "leadsWithPdfCount",
        (SELECT COUNT(*)::int FROM company_key_people WHERE company_id = c.id) AS "keyPeopleCount",
        (SELECT COUNT(*)::int FROM company_key_people WHERE company_id = c.id AND social_profile IS NOT NULL AND TRIM(social_profile) != '') AS "linkedInCount"
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role = 'USER' AND u.is_deleted = false
      LEFT JOIN requests rb ON rb.company_id = c.id AND rb.service_type = 'COMPANY_BOOST' 
        AND (rb.title ILIKE '%Onboarding%' OR rb.title ILIKE '%Welcome%')
      LEFT JOIN requests rl ON rl.company_id = c.id AND rl.service_type = 'COMPANY_LEAD' 
        AND (rl.title ILIKE '%Onboarding%' OR rl.title ILIKE '%Sample Leads%')
      LEFT JOIN requests ru ON ru.company_id = c.id AND ru.service_type = 'LANDING_PAGE' 
        AND (ru.title ILIKE '%Onboarding%' OR ru.title ILIKE '%Welcome%')
      ORDER BY c.created_at DESC
    `);

    // For each company, fetch files in onboarding submissions
    const clientsWithStatus = await Promise.all(companiesRes.rows.map(async (row) => {
      let posterUploaded = false;
      let videoUploaded = false;
      let strategicPlanUploaded = false;
      let devrelPlanUploaded = false;

      if (row.boostRequestId) {
        const filesRes = await query(`
          SELECT sf.name, sf.type
          FROM submission_files sf
          JOIN submissions s ON s.id = sf.submission_id
          WHERE s.request_id = $1
        `, [row.boostRequestId]);

        for (const f of filesRes.rows) {
          const n = (f.name || '').toLowerCase();
          const t = (f.type || '').toLowerCase();
          if (n.startsWith('[poster]') || t.startsWith('image/') || n.includes('poster')) posterUploaded = true;
          if (n.startsWith('[video]') || t.startsWith('video/') || n.includes('video')) videoUploaded = true;
          if (n.startsWith('[strategic plan]') || n.includes('strategic') || n.includes('strategy')) strategicPlanUploaded = true;
          if (n.startsWith('[devrel plan]') || n.includes('devrel')) devrelPlanUploaded = true;
        }
      }

      let uiAnalysisUploaded = false;
      let landingPageEnhancementUploaded = false;

      if (row.uiRequestId) {
        const uiFilesRes = await query(`
          SELECT sf.name, sf.type
          FROM submission_files sf
          JOIN submissions s ON s.id = sf.submission_id
          WHERE s.request_id = $1
        `, [row.uiRequestId]);

        for (const f of uiFilesRes.rows) {
          const n = (f.name || '').toLowerCase();
          if (n.startsWith('[ui/ux analysis]') || n.includes('analysis')) uiAnalysisUploaded = true;
          if (n.startsWith('[landing page enhancement]') || n.includes('enhancement') || n.includes('landing')) landingPageEnhancementUploaded = true;
        }
      }

      const hasResearch = Boolean(row.researchSummary && row.researchSummary.trim().length > 0);
      const leadCount = row.leadCount || 0;
      const verifiedLeadCount = row.verifiedLeadCount || 0;
      const leadsWithPdfCount = row.leadsWithPdfCount || 0;
      const keyPeopleCount = row.keyPeopleCount || 0;
      const linkedInCount = row.linkedInCount || 0;
      const sampleLeadsCompleted = leadCount >= 5;
      const keyPeopleCompleted = keyPeopleCount > 0;
      const leadOnboardingAllPrepared = hasResearch && sampleLeadsCompleted && keyPeopleCompleted;

      return {
        id: row.id,
        name: row.name,
        contactPerson: row.contactPerson || row.clientUserName || 'N/A',
        email: row.clientUserEmail || row.email || 'N/A',
        phone: row.phone,
        website: row.website,
        industry: row.industry || 'Technology / SaaS',
        companyInfo: row.companyInfo,
        researchSummary: row.researchSummary || '',
        createdAt: row.createdAt,
        onboardingTicketId: row.boostTicketId || null,
        leadTicketId: row.leadTicketId || null,
        uiTicketId: row.uiTicketId || null,
        onboardingStatus: {
          poster: posterUploaded ? 'Uploaded' : 'Pending',
          video: videoUploaded ? 'Uploaded' : 'Pending',
          strategicPlan: strategicPlanUploaded ? 'Uploaded' : 'Pending',
          devrelPlan: devrelPlanUploaded ? 'Uploaded' : 'Pending',
          allPrepared: posterUploaded && videoUploaded && strategicPlanUploaded && devrelPlanUploaded
        },
        leadOnboardingStatus: {
          hasResearch,
          researchCompleted: hasResearch,
          leadCount,
          verifiedLeadCount,
          leadsWithPdfCount,
          keyPeopleCount,
          linkedInCount,
          sampleLeadsCompleted,
          keyPeopleCompleted,
          allPrepared: leadOnboardingAllPrepared
        },
        uiOnboardingStatus: {
          uiAnalysis: uiAnalysisUploaded ? 'Uploaded' : 'Pending',
          landingPageEnhancement: landingPageEnhancementUploaded ? 'Uploaded' : 'Pending',
          allPrepared: uiAnalysisUploaded && landingPageEnhancementUploaded
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

// @desc    Get UI onboarding samples for a company (UI/UX Analysis, Landing Page Enhancement)
// @route   GET /api/company/:companyId/ui-onboarding-assets
// @access  Private (ADMIN, LANDING_PAGE, or Client of that company)
export const getCompanyUiOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = (!req.params.companyId || req.params.companyId === 'my-company')
      ? (req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id)))
      : req.params.companyId;

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    if (req.user.role === 'USER') {
      const userCompanyId = req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id));
      if (String(userCompanyId) !== String(targetCompanyId)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot access assets of another company.' });
      }
    } else if (!['ADMIN', 'LANDING_PAGE'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const reqRes = await query(`
      SELECT r.id, r.ticket_id, r.status, r.created_at
      FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'LANDING_PAGE'
        AND (r.title ILIKE '%Onboarding%' OR r.title ILIKE '%Welcome%')
      ORDER BY r.created_at ASC
      LIMIT 1
    `, [targetCompanyId]);

    let uiAnalysis = null;
    let landingPageEnhancement = null;
    let ticketId = null;

    if (reqRes.rows.length > 0) {
      const reqRow = reqRes.rows[0];
      ticketId = reqRow.ticket_id;

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
          const fileObj = {
            id: file.id,
            name: rawName.replace(/^\[(UI\/UX Analysis|Landing Page Enhancement)\]\s*/i, ''),
            rawName,
            size: file.size,
            type: file.type,
            url: file.url,
            streamUrl: `/api/assets/${file.id}/stream`,
            createdAt: file.created_at
          };

          if (rawName.startsWith('[UI/UX Analysis]') || nameLower.includes('analysis') || nameLower.includes('ui_ux')) {
            uiAnalysis = fileObj;
          } else if (rawName.startsWith('[Landing Page Enhancement]') || nameLower.includes('enhancement') || nameLower.includes('landing')) {
            landingPageEnhancement = fileObj;
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
        uiAnalysis,
        landingPageEnhancement
      },
      status: {
        uiAnalysis: uiAnalysis ? 'Uploaded' : 'Pending',
        landingPageEnhancement: landingPageEnhancement ? 'Uploaded' : 'Pending',
        allPrepared: Boolean(uiAnalysis && landingPageEnhancement)
      }
    });
  } catch (error) {
    console.error('[Get UI Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch UI onboarding assets.' });
  }
};

// @desc    Upload / save UI onboarding samples for a company in the existing Assets system
// @route   POST /api/company/:companyId/ui-onboarding-assets
// @access  Private (ADMIN, LANDING_PAGE)
export const saveCompanyUiOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = req.params.companyId;
    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const clientUserRes = await query(`
      SELECT id, name, email FROM users WHERE company_id = $1 AND role = 'USER' ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);
    const clientUserId = clientUserRes.rows[0]?.id || req.user.id;

    let request;
    const reqCheck = await query(`
      SELECT * FROM requests 
      WHERE company_id = $1 AND service_type = 'LANDING_PAGE'
        AND (title ILIKE '%Onboarding%' OR title ILIKE '%Welcome%')
      ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);

    if (reqCheck.rows.length > 0) {
      request = reqCheck.rows[0];
    } else {
      const countRes = await query('SELECT COUNT(*)::int as count FROM requests');
      const ticketId = `CG-UI-ONB-${1000 + (countRes.rows[0]?.count || 0) + 1}`;
      const insertReq = await query(`
        INSERT INTO requests (
          ticket_id, user_id, company_id, service_type, title, description,
          priority, status, price, payment_status, assigned_team, completed_at
        ) VALUES (
          $1, $2, $3, 'LANDING_PAGE', 'Company UI / Landing Page Onboarding Samples',
          'Initial UI/UX assessment and sample landing page enhancement work prepared for client workspace.',
          'MEDIUM', 'COMPLETED', 999, 'PAID', 'Landing Page Team', NOW()
        ) RETURNING *
      `, [ticketId, clientUserId, targetCompanyId]);
      request = insertReq.rows[0];
    }

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
          $1, $2, 1, 'Landing Page Onboarding Deliverables',
          'Approved onboarding sample work including UI/UX Analysis and Landing Page Enhancement.',
          'APPROVED', $3, $4, NOW()
        ) RETURNING *
      `, [request.id, request.ticket_id, req.user.id, req.user.name]);
      submission = insertSub.rows[0];
    }

    const { uiAnalysis, landingPageEnhancement } = req.body;

    const upsertFile = async (tag, fileData, defaultMime) => {
      if (!fileData) return;
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND name ILIKE $2
      `, [submission.id, `[${tag}]%`]);

      const fileName = `[${tag}] ${fileData.name || tag}`;
      const mime = fileData.mimeType || fileData.type || defaultMime || 'application/pdf';
      const size = fileData.size ? (typeof fileData.size === 'number' ? `${(fileData.size / 1024).toFixed(1)} KB` : String(fileData.size)) : 'Unknown';
      const url = fileData.dataUrl || fileData.url || '';

      await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [submission.id, fileName, url, size, mime]);
    };

    if (uiAnalysis) await upsertFile('UI/UX Analysis', uiAnalysis, 'application/pdf');
    if (landingPageEnhancement) await upsertFile('Landing Page Enhancement', landingPageEnhancement, 'application/pdf');

    return res.json({
      success: true,
      message: 'Landing page onboarding sample assets saved successfully.',
      ticketId: request.ticket_id
    });
  } catch (error) {
    console.error('[Save UI Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save UI onboarding assets.' });
  }
};

// @desc    Get Lead onboarding samples (first 5 leads with associated PDFs)
// @route   GET /api/company/:companyId/lead-onboarding-assets
// @access  Private (ADMIN, COMPANY_LEAD, or Client of that company)
export const getCompanyLeadOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = (!req.params.companyId || req.params.companyId === 'my-company')
      ? (req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id)))
      : req.params.companyId;

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    if (req.user.role === 'USER') {
      const userCompanyId = req.user.companyId || (req.user.company && (req.user.company.id || req.user.company._id));
      if (String(userCompanyId) !== String(targetCompanyId)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot access assets of another company.' });
      }
    } else if (!['ADMIN', 'COMPANY_LEAD'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Get up to 5 initial sample leads
    const leadsRes = await query(`
      SELECT id, name, title, lead_company AS company, email, linkedin, location, status, notes, source_reference, created_at
      FROM company_leads
      WHERE company_id = $1
      ORDER BY created_at ASC
      LIMIT 5
    `, [targetCompanyId]);

    // Check for onboarding request
    const reqRes = await query(`
      SELECT r.id, r.ticket_id
      FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_LEAD'
        AND (r.title ILIKE '%Onboarding%' OR r.title ILIKE '%Sample Leads%')
      ORDER BY r.created_at ASC LIMIT 1
    `, [targetCompanyId]);

    const filesByTag = new Map();
    let ticketId = null;

    if (reqRes.rows.length > 0) {
      ticketId = reqRes.rows[0].ticket_id;
      const subRes = await query(`
        SELECT id FROM submissions WHERE request_id = $1 ORDER BY version ASC LIMIT 1
      `, [reqRes.rows[0].id]);

      if (subRes.rows.length > 0) {
        const filesRes = await query(`
          SELECT id, name, url, size, type, created_at
          FROM submission_files
          WHERE submission_id = $1
          ORDER BY created_at ASC
        `, [subRes.rows[0].id]);

        for (const file of filesRes.rows) {
          const match = file.name.match(/^\[Lead\s*0?([1-5])\]/i);
          if (match) {
            const idx = parseInt(match[1], 10);
            filesByTag.set(idx, {
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              url: file.url,
              streamUrl: `/api/assets/${file.id}/stream`,
              createdAt: file.created_at
            });
          }
        }
      }
    }

    const mappedLeads = leadsRes.rows.map((lead, i) => {
      const slotIndex = i + 1;
      const pdf = filesByTag.get(slotIndex) || (lead.source_reference ? {
        id: null,
        name: `${lead.name} Profile.pdf`,
        streamUrl: lead.source_reference
      } : null);

      return {
        ...lead,
        slotIndex,
        pdf
      };
    });

    return res.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        contactPerson: company.contactPerson,
        website: company.website,
        industry: company.industry,
        researchSummary: company.researchSummary || ''
      },
      ticketId,
      leads: mappedLeads,
      count: mappedLeads.length,
      allPrepared: mappedLeads.length >= 5 && mappedLeads.every(l => l.pdf)
    });
  } catch (error) {
    console.error('[Get Lead Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch lead onboarding assets.' });
  }
};

// @desc    Save a sample lead and/or upload its PDF document in the existing Assets system
// @route   POST /api/company/:companyId/lead-onboarding-assets
// @access  Private (ADMIN, COMPANY_LEAD)
export const saveCompanyLeadOnboardingAssets = async (req, res) => {
  try {
    const targetCompanyId = req.params.companyId;
    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID required.' });
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const { leadIndex, leadId, leadData, file } = req.body;
    let cleanIndex = null;
    if (leadId) {
      const idxRes = await query(`
        SELECT id FROM company_leads WHERE company_id = $1 ORDER BY created_at ASC LIMIT 5
      `, [targetCompanyId]);
      const foundIdx = idxRes.rows.findIndex(r => String(r.id) === String(leadId));
      if (foundIdx !== -1) {
        cleanIndex = foundIdx + 1;
      }
    }
    if (!cleanIndex) {
      const parsed = parseInt(leadIndex, 10);
      cleanIndex = !isNaN(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 1;
    }
    const tag = `Lead 0${cleanIndex}`;

    const clientUserRes = await query(`
      SELECT id, name, email FROM users WHERE company_id = $1 AND role = 'USER' ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);
    const clientUserId = clientUserRes.rows[0]?.id || req.user.id;

    let request;
    const reqCheck = await query(`
      SELECT * FROM requests 
      WHERE company_id = $1 AND service_type = 'COMPANY_LEAD'
        AND (title ILIKE '%Onboarding%' OR title ILIKE '%Sample Leads%')
      ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);

    if (reqCheck.rows.length > 0) {
      request = reqCheck.rows[0];
    } else {
      const countRes = await query('SELECT COUNT(*)::int as count FROM requests');
      const ticketId = `CG-LEAD-ONB-${1000 + (countRes.rows[0]?.count || 0) + 1}`;
      const insertReq = await query(`
        INSERT INTO requests (
          ticket_id, user_id, company_id, service_type, title, description,
          priority, status, price, payment_status, assigned_team, completed_at
        ) VALUES (
          $1, $2, $3, 'COMPANY_LEAD', 'Company Lead Onboarding Samples',
          'Initial 5 sample leads and documentation prepared for client workspace.',
          'MEDIUM', 'COMPLETED', 499, 'PAID', 'Company Lead Team', NOW()
        ) RETURNING *
      `, [ticketId, clientUserId, targetCompanyId]);
      request = insertReq.rows[0];
    }

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
          $1, $2, 1, 'Company Lead Onboarding Deliverables',
          'Approved onboarding sample leads and PDF profile documentation.',
          'APPROVED', $3, $4, NOW()
        ) RETURNING *
      `, [request.id, request.ticket_id, req.user.id, req.user.name]);
      submission = insertSub.rows[0];
    }

    let fileRecord = null;
    let streamUrl = null;

    if (file && (file.dataUrl || file.url)) {
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND name ILIKE $2
      `, [submission.id, `[${tag}]%`]);

      const leadName = leadData?.name ? leadData.name.trim() : `Sample Lead ${cleanIndex}`;
      const fileName = `[${tag}] ${leadName} - Executive Lead Profile.pdf`;
      const mime = file.type || file.mimeType || 'application/pdf';
      const size = file.size ? (typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : String(file.size)) : 'Unknown';
      const url = file.dataUrl || file.url || '';

      const insFile = await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `, [submission.id, fileName, url, size, mime]);
      fileRecord = insFile.rows[0];
      streamUrl = `/api/assets/${fileRecord.id}/stream`;
    }

    // Now update or insert the lead in company_leads
    let savedLead = null;
    if (leadId) {
      const updateFields = [];
      const updateValues = [];
      let valIdx = 1;

      if (leadData?.name) { updateFields.push(`name = $${valIdx++}`); updateValues.push(leadData.name.trim()); }
      if (leadData?.title !== undefined) { updateFields.push(`title = $${valIdx++}`); updateValues.push(leadData.title); }
      if (leadData?.company !== undefined) { updateFields.push(`lead_company = $${valIdx++}`); updateValues.push(leadData.company); }
      if (leadData?.email !== undefined) { updateFields.push(`email = $${valIdx++}`); updateValues.push(leadData.email); }
      if (leadData?.linkedin !== undefined) { updateFields.push(`linkedin = $${valIdx++}`); updateValues.push(leadData.linkedin); }
      if (leadData?.location !== undefined) { updateFields.push(`location = $${valIdx++}`); updateValues.push(leadData.location); }
      
      let finalNotes = leadData?.notes;
      if (streamUrl) {
        if (finalNotes === undefined) {
          const cur = await query(`SELECT notes FROM company_leads WHERE id = $1`, [leadId]);
          finalNotes = cur.rows[0]?.notes || '';
        }
        const stripped = (finalNotes || '').replace(/\[Lead PDF:\s*[^\]]+\]/g, '').trim();
        finalNotes = stripped ? `${stripped}\n[Lead PDF: ${streamUrl}]` : `[Lead PDF: ${streamUrl}]`;
        updateFields.push(`status = $${valIdx++}`);
        updateValues.push('VERIFIED');
      } else if (leadData?.status) {
        updateFields.push(`status = $${valIdx++}`);
        updateValues.push(leadData.status);
      }
      
      if (finalNotes !== undefined) {
        updateFields.push(`notes = $${valIdx++}`);
        updateValues.push(finalNotes);
      }
      updateFields.push(`updated_at = NOW()`);

      updateValues.push(leadId);
      const resLead = await query(`
        UPDATE company_leads
        SET ${updateFields.join(', ')}
        WHERE id = $${valIdx}
        RETURNING *
      `, updateValues);
      savedLead = resLead.rows[0];
    } else if (leadData && leadData.name) {
      const baseNotes = (leadData.notes || 'Onboarding Sample Lead with verified documentation.').replace(/\[Lead PDF:\s*[^\]]+\]/g, '').trim();
      const finalNotes = streamUrl ? `${baseNotes}\n[Lead PDF: ${streamUrl}]` : baseNotes;

      const insLead = await query(`
        INSERT INTO company_leads (
          company_id, name, title, lead_company, email, linkedin, location,
          status, notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          'VERIFIED', $8, NOW(), NOW()
        ) RETURNING *
      `, [
        targetCompanyId,
        leadData.name.trim(),
        leadData.title || null,
        leadData.company || null,
        leadData.email || null,
        leadData.linkedin || null,
        leadData.location || null,
        finalNotes
      ]);
      savedLead = insLead.rows[0];
    }

    return res.json({
      success: true,
      message: `Lead ${cleanIndex} onboarding work saved successfully.`,
      ticketId: request.ticket_id,
      lead: savedLead,
      fileUrl: streamUrl,
      file: fileRecord ? {
        id: fileRecord.id,
        name: fileRecord.name,
        streamUrl
      } : null
    });
  } catch (error) {
    console.error('[Save Lead Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save lead onboarding work.' });
  }
};

