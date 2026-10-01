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
import { uploadFile, deleteFile, isDataUrl, isMinioObjectKey } from '../services/storageService.js';

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

    // Helper to safely upsert an onboarding file with MinIO upload and safe replacement
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

      let url = fileData.dataUrl || fileData.url || '';
      if (!url) return;

      const fileName = `[${tag}] ${fileData.name || tag}`;
      const mime = fileData.mimeType || fileData.type || (tag === 'Poster' ? 'image/png' : tag === 'Video' ? 'video/mp4' : 'application/pdf');
      const size = fileData.size ? (typeof fileData.size === 'number' ? `${(fileData.size / 1024).toFixed(1)} KB` : String(fileData.size)) : 'Unknown';

      // Find old files for this tag to delete from MinIO AFTER new file upload & DB insert
      const oldFilesRes = await query(`
        SELECT id, url FROM submission_files
        WHERE submission_id = $1 AND (name ILIKE $2 OR ($3 != '' AND type ILIKE $3))
      `, [submission.id, `[${tag}]%`, defaultMime ? `${defaultMime}%` : '']);
      const oldObjectKeys = oldFilesRes.rows
        .map(r => r.url)
        .filter(u => isMinioObjectKey(u));

      // If url is a Data URL, upload to MinIO first
      if (isDataUrl(url)) {
        try {
          const uploadRes = await uploadFile({
            dataUrl: url,
            originalName: fileData.name || tag,
            mimeType: mime,
            prefix: `onboarding/boost/${targetCompanyId}`,
          });
          url = uploadRes.objectKey;
        } catch (uploadErr) {
          console.error('[saveCompanyOnboardingAssets] MinIO upload error, falling back:', uploadErr.message);
        }
      }

      // Remove previous matching file from DB
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND (name ILIKE $2 OR ($3 != '' AND type ILIKE $3))
      `, [submission.id, `[${tag}]%`, defaultMime ? `${defaultMime}%` : '']);

      // Insert new or replaced file
      await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [submission.id, fileName, url, size, mime]);

      // Safely delete old MinIO objects now that the new object and DB update succeeded
      for (const oldKey of oldObjectKeys) {
        if (oldKey !== url) {
          deleteFile(oldKey).catch(err => console.warn('[MinIO cleanup error]:', err.message));
        }
      }
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

      // Find old files for this tag to delete from MinIO AFTER new file upload & DB insert
      const oldFilesRes = await query(`
        SELECT id, url FROM submission_files
        WHERE submission_id = $1 AND name ILIKE $2
      `, [submission.id, `[${tag}]%`]);
      const oldObjectKeys = oldFilesRes.rows
        .map(r => r.url)
        .filter(u => isMinioObjectKey(u));

      const fileName = `[${tag}] ${fileData.name || tag}`;
      const mime = fileData.mimeType || fileData.type || defaultMime || 'application/pdf';
      const size = fileData.size ? (typeof fileData.size === 'number' ? `${(fileData.size / 1024).toFixed(1)} KB` : String(fileData.size)) : 'Unknown';
      let url = fileData.dataUrl || fileData.url || '';

      if (isDataUrl(url)) {
        try {
          const uploadRes = await uploadFile({
            dataUrl: url,
            originalName: fileData.name || tag,
            mimeType: mime,
            prefix: `onboarding/ui/${targetCompanyId}`,
          });
          url = uploadRes.objectKey;
        } catch (uploadErr) {
          console.error('[Save UI Onboarding Assets] MinIO upload error, falling back:', uploadErr.message);
        }
      }

      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND name ILIKE $2
      `, [submission.id, `[${tag}]%`]);

      await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [submission.id, fileName, url, size, mime]);

      for (const oldKey of oldObjectKeys) {
        if (oldKey !== url) {
          deleteFile(oldKey).catch(err => console.warn('[MinIO cleanup error]:', err.message));
        }
      }
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

    // Get all leads for the company (both initial sample leads and additional leads)
    const leadsRes = await query(`
      SELECT id, name, title, lead_company AS company, email, linkedin, location, status, notes, created_at
      FROM company_leads
      WHERE company_id = $1
      ORDER BY created_at ASC
    `, [targetCompanyId]);

    // Check if the company has paid for Key People access
    const kpPaymentRes = await query(`
      SELECT id FROM requests
      WHERE company_id = $1 AND service_type = 'COMPANY_LEAD'
        AND (title ILIKE '%Key People%' OR description ILIKE '%Key People%')
        AND payment_status = 'PAID'
      LIMIT 1
    `, [targetCompanyId]);
    const isKeyPeoplePaid = kpPaymentRes.rows.length > 0;

    // Check for onboarding request
    const reqRes = await query(`
      SELECT r.id, r.ticket_id
      FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_LEAD'
        AND (r.title ILIKE '%Onboarding%' OR r.title ILIKE '%Sample Leads%')
      ORDER BY r.created_at ASC LIMIT 1
    `, [targetCompanyId]);

    const ticketId = reqRes.rows[0]?.ticket_id || null;

    // Get all submission files for this company's COMPANY_LEAD requests
    const filesRes = await query(`
      SELECT sf.id, sf.name, sf.url, sf.size, sf.type, sf.created_at, r.ticket_id, r.id as request_id, r.payment_status, r.status as request_status
      FROM submission_files sf
      JOIN submissions s ON sf.submission_id = s.id
      JOIN requests r ON s.request_id = r.id
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_LEAD'
      ORDER BY sf.created_at ASC
    `, [targetCompanyId]);

    const filesByTag = new Map();

    for (const file of filesRes.rows) {
      const cleanFile = {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        streamUrl: `/api/assets/${file.id}/stream`,
        downloadUrl: `/api/assets/${file.id}/download`,
        createdAt: file.created_at
      };

      // Match lead index or uuid tag
      const leadMatch = file.name.match(/^\[Lead\s*([0-9a-fA-F-]+|\d+)\]/i);
      const leadKey = leadMatch ? (isNaN(parseInt(leadMatch[1], 10)) ? leadMatch[1] : parseInt(leadMatch[1], 10)) : null;

      // Detect doc type
      const isStudy = /\[(Lead\s*Study|Study)\]/i.test(file.name) || (/^\[Lead\s*\d+\]/i.test(file.name) && !/\[(Pitch|Key)/i.test(file.name));
      const isPitch = /\[(Pitch\s*Deck|Pitch)\]/i.test(file.name);
      const isKeyPeople = /\[(Key\s*People|KeyPeople)\]/i.test(file.name);

      if (leadKey) {
        if (isStudy) filesByTag.set(`${leadKey}_study`, cleanFile);
        if (isPitch) filesByTag.set(`${leadKey}_pitch`, cleanFile);
        if (isKeyPeople) filesByTag.set(`${leadKey}_keypeople`, cleanFile);
      }
    }

    const mappedLeads = leadsRes.rows.map((lead, i) => {
      const slotIndex = i + 1;
      const notes = lead.notes || '';
      const websiteFromNotes = notes.match(/\[Website:\s*([^\]]+)\]/);
      const websiteUrl = (lead.linkedin && /^https?:\/\//i.test(lead.linkedin)) ? lead.linkedin : (websiteFromNotes ? websiteFromNotes[1] : (lead.linkedin || ''));
      const companyName = lead.company || lead.name;

      // Identify whether this is an additional lead (index > 5, or tagged ADDITIONAL)
      const isAdditionalLead = slotIndex > 5 || notes.includes('[Lead Type: ADDITIONAL]') || notes.includes('ADDITIONAL');

      // Key People access rule:
      // - Additional leads from paid sprints have Key People access INCLUDED (no extra payment).
      // - Free/sample leads require Key People payment unless user is ADMIN or COMPANY_LEAD.
      const keyPeopleUnlocked = isAdditionalLead || isKeyPeoplePaid || ['ADMIN', 'COMPANY_LEAD'].includes(req.user.role);

      // 1. Lead Study
      const studyFile = filesByTag.get(`${slotIndex}_study`) || filesByTag.get(`${lead.id}_study`);
      const studyFromNotes = notes.match(/\[Lead Study:\s*([^\]]+)\]/) || notes.match(/\[Lead PDF:\s*([^\]]+)\]/);
      const leadStudy = studyFile ? {
        id: studyFile.id,
        name: studyFile.name,
        streamUrl: studyFile.streamUrl,
        downloadUrl: studyFile.downloadUrl,
        size: studyFile.size,
        type: studyFile.type
      } : (studyFromNotes ? {
        id: null,
        name: `${companyName} - Lead Study.pdf`,
        streamUrl: studyFromNotes[1],
        downloadUrl: studyFromNotes[1]
      } : null);

      // 2. Pitch Deck
      const pitchFile = filesByTag.get(`${slotIndex}_pitch`) || filesByTag.get(`${lead.id}_pitch`);
      const pitchFromNotes = notes.match(/\[Pitch Deck:\s*([^\]]+)\]/);
      const pitchDeck = pitchFile ? {
        id: pitchFile.id,
        name: pitchFile.name,
        streamUrl: pitchFile.streamUrl,
        downloadUrl: pitchFile.downloadUrl,
        size: pitchFile.size,
        type: pitchFile.type
      } : (pitchFromNotes ? {
        id: null,
        name: `${companyName} - Pitch Deck.pdf`,
        streamUrl: pitchFromNotes[1],
        downloadUrl: pitchFromNotes[1]
      } : null);

      // 3. Key People
      const kpFile = filesByTag.get(`${slotIndex}_keypeople`) || filesByTag.get(`${lead.id}_keypeople`);
      const kpFromNotes = notes.match(/\[Key People:\s*([^\]]+)\]/);
      let keyPeople = null;
      if (kpFile) {
        keyPeople = {
          id: kpFile.id,
          name: kpFile.name,
          isLocked: !keyPeopleUnlocked,
          streamUrl: keyPeopleUnlocked ? kpFile.streamUrl : null,
          downloadUrl: keyPeopleUnlocked ? kpFile.downloadUrl : null,
          size: kpFile.size,
          type: kpFile.type
        };
      } else if (kpFromNotes) {
        keyPeople = {
          id: null,
          name: `${companyName} - Key People.pdf`,
          isLocked: !keyPeopleUnlocked,
          streamUrl: keyPeopleUnlocked ? kpFromNotes[1] : null,
          downloadUrl: keyPeopleUnlocked ? kpFromNotes[1] : null
        };
      }

      return {
        ...lead,
        companyName,
        company: companyName,
        website: websiteUrl,
        slotIndex,
        isAdditionalLead: Boolean(isAdditionalLead),
        keyPeopleUnlocked: Boolean(keyPeopleUnlocked),
        leadStudy,
        pitchDeck,
        keyPeople,
        pdf: leadStudy // backwards compatibility
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
      isKeyPeoplePaid: Boolean(isKeyPeoplePaid),
      allPrepared: mappedLeads.length >= 5 && mappedLeads.slice(0, 5).every(l => l.leadStudy)
    });
  } catch (error) {
    console.error('[Get Lead Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch lead onboarding assets.' });
  }
};

// @desc    Save a lead and/or upload its Lead Study, Pitch Deck, and Key People PDF documents
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

    const { leadIndex, leadId, leadData, isAdditional } = req.body;

    // Support both direct fields and nested leadData
    const rawCompanyName = req.body.companyName || req.body.leadName || req.body.name || leadData?.companyName || leadData?.company || leadData?.name;
    const rawWebsite = req.body.website || req.body.websiteUrl || req.body.url || leadData?.website || leadData?.websiteUrl || leadData?.linkedin;

    let existingLead = null;
    if (leadId) {
      const curRes = await query(`SELECT * FROM company_leads WHERE id = $1`, [leadId]);
      if (curRes.rows.length > 0) {
        existingLead = curRes.rows[0];
      }
    }

    const companyName = rawCompanyName ? String(rawCompanyName).trim() : (existingLead?.lead_company || existingLead?.name || '');
    const notesWebsite = existingLead?.notes ? (existingLead.notes.match(/\[Website:\s*([^\]]+)\]/)?.[1]) : null;
    let website = rawWebsite ? String(rawWebsite).trim() : (existingLead?.linkedin || notesWebsite || '');

    // 1. Validate Company Name
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    // Auto-normalize website: if scheme is missing, check if it has a valid domain structure
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(\/.*)?$/i;
    if (website && !/^https?:\/\//i.test(website)) {
      if (domainRegex.test(website)) {
        website = `https://${website}`;
      }
    }

    // 2. Validate Company Website URL (must be valid HTTP/HTTPS URL)
    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!website || !urlPattern.test(website)) {
      return res.status(400).json({ success: false, message: 'A valid HTTP or HTTPS company website URL is required.' });
    }

    // Identify provided files:
    // Lead Study PDF, Pitch Deck PDF, Key People PDF
    // Also support single `file` property for backwards compatibility
    const leadStudyDoc = req.body.leadStudy || req.body.leadStudyFile || (!req.body.pitchDeck && !req.body.keyPeople ? req.body.file : null);
    const pitchDeckDoc = req.body.pitchDeck || req.body.pitchDeckFile || (req.body.file?.docType === 'pitch' ? req.body.file : null);
    const keyPeopleDoc = req.body.keyPeople || req.body.keyPeopleFile || (req.body.file?.docType === 'keypeople' ? req.body.file : null);

    if (!leadStudyDoc && !pitchDeckDoc && !keyPeopleDoc && !req.body.file) {
      return res.status(400).json({
        success: false,
        message: 'At least one lead document (Lead Study, Pitch Deck, or Key People) PDF is required.'
      });
    }

    const validatePdf = (doc, label) => {
      if (!doc) return;
      if (!doc.dataUrl && !doc.url) {
        throw new Error(`${label} PDF document is required.`);
      }
      const fileNameLower = (doc.name || '').toLowerCase();
      const mimeLower = (doc.type || doc.mimeType || '').toLowerCase();
      const dataUrlStr = typeof doc.dataUrl === 'string' ? doc.dataUrl : (typeof doc.url === 'string' ? doc.url : '');
      const isPdf = fileNameLower.endsWith('.pdf') || mimeLower.includes('pdf') || dataUrlStr.startsWith('data:application/pdf');
      if (!isPdf) {
        throw new Error(`${label} must be a PDF file.`);
      }
      if (typeof doc.size === 'number' && doc.size > 25 * 1024 * 1024) {
        throw new Error(`${label} exceeds the maximum file size of 25MB.`);
      }
    };

    try {
      if (leadStudyDoc) validatePdf(leadStudyDoc, 'Lead Study');
      if (pitchDeckDoc) validatePdf(pitchDeckDoc, 'Pitch Deck');
      if (keyPeopleDoc) validatePdf(keyPeopleDoc, 'Key People');
      if (req.body.file && !leadStudyDoc && !pitchDeckDoc && !keyPeopleDoc) validatePdf(req.body.file, 'Company details');
    } catch (valErr) {
      return res.status(400).json({ success: false, message: valErr.message });
    }

    let cleanIndex = null;
    if (leadId) {
      const idxRes = await query(`
        SELECT id FROM company_leads WHERE company_id = $1 ORDER BY created_at ASC
      `, [targetCompanyId]);
      const foundIdx = idxRes.rows.findIndex(r => String(r.id) === String(leadId));
      if (foundIdx !== -1) {
        cleanIndex = foundIdx + 1;
      }
    }
    if (!cleanIndex) {
      const parsed = parseInt(leadIndex, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        cleanIndex = parsed;
      } else {
        const countRes = await query('SELECT COUNT(*)::int as count FROM company_leads WHERE company_id = $1', [targetCompanyId]);
        cleanIndex = (countRes.rows[0]?.count || 0) + 1;
      }
    }
    const tag = cleanIndex < 10 ? `Lead 0${cleanIndex}` : `Lead ${cleanIndex}`;

    const clientUserRes = await query(`
      SELECT id, name, email FROM users WHERE company_id = $1 AND role = 'USER' ORDER BY created_at ASC LIMIT 1
    `, [targetCompanyId]);
    const clientUserId = clientUserRes.rows[0]?.id || req.user.id;

    // Resolve or create ticket
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
          $1, $2, 1, 'Company Lead Deliverables',
          'Lead research dossiers, pitch decks, and Key People documents.',
          'APPROVED', $3, $4, NOW()
        ) RETURNING *
      `, [request.id, request.ticket_id, req.user.id, req.user.name]);
      submission = insertSub.rows[0];
    }

    // Helper to store a file in submission_files and MinIO
    const storeFile = async (doc, docTypeLabel, nameSuffix) => {
      if (!doc) return null;

      // Find old file url to clean up MinIO AFTER new upload and DB update
      const oldFilesRes = await query(`
        SELECT id, url FROM submission_files
        WHERE submission_id = $1 AND (
          name ILIKE $2 OR name ILIKE $3
        )
      `, [submission.id, `[${tag}][${docTypeLabel}]%`, `[${tag}]%${nameSuffix}%`]);
      const oldObjectKeys = oldFilesRes.rows
        .map(r => r.url)
        .filter(u => isMinioObjectKey(u));

      const fileName = `[${tag}][${docTypeLabel}] ${companyName} - ${nameSuffix}.pdf`;
      const mime = doc.type || doc.mimeType || 'application/pdf';
      const size = doc.size ? (typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(1)} KB` : String(doc.size)) : 'Unknown';
      let url = doc.dataUrl || doc.url || '';

      // Upload Data URL to MinIO
      if (isDataUrl(url)) {
        try {
          const uploadRes = await uploadFile({
            dataUrl: url,
            originalName: `${companyName} - ${nameSuffix}.pdf`,
            mimeType: mime,
            prefix: `leads/${targetCompanyId}`,
          });
          url = uploadRes.objectKey;
        } catch (uploadErr) {
          console.error('[saveCompanyLeadOnboardingAssets] MinIO upload error, falling back:', uploadErr.message);
        }
      }

      // Delete existing file for this tag slot and type from DB
      await query(`
        DELETE FROM submission_files
        WHERE submission_id = $1 AND (
          name ILIKE $2 OR name ILIKE $3
        )
      `, [submission.id, `[${tag}][${docTypeLabel}]%`, `[${tag}]%${nameSuffix}%`]);

      const ins = await query(`
        INSERT INTO submission_files (submission_id, name, url, size, type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `, [submission.id, fileName, url, size, mime]);

      // Safely delete old MinIO objects
      for (const oldKey of oldObjectKeys) {
        if (oldKey !== url) {
          deleteFile(oldKey).catch(err => console.warn('[MinIO cleanup error]:', err.message));
        }
      }

      const fileRecord = ins.rows[0];
      return {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        type: fileRecord.type,
        streamUrl: `/api/assets/${fileRecord.id}/stream`,
        downloadUrl: `/api/assets/${fileRecord.id}/download`
      };
    };

    let studyRecord = null;
    let pitchRecord = null;
    let kpRecord = null;

    if (leadStudyDoc) {
      studyRecord = await storeFile(leadStudyDoc, 'Lead Study', 'Lead Study');
    }
    if (pitchDeckDoc) {
      pitchRecord = await storeFile(pitchDeckDoc, 'Pitch Deck', 'Pitch Deck');
    }
    if (keyPeopleDoc) {
      kpRecord = await storeFile(keyPeopleDoc, 'Key People', 'Key People');
    }

    const primaryRecord = studyRecord || pitchRecord || kpRecord;

    const leadTypeStr = (isAdditional || cleanIndex > 5) ? 'ADDITIONAL' : 'SAMPLE';
    let notesWithMeta = `[Website: ${website}]\n[Lead Type: ${leadTypeStr}]`;
    if (studyRecord) notesWithMeta += `\n[Lead Study: ${studyRecord.streamUrl}]\n[Lead PDF: ${studyRecord.streamUrl}]`;
    if (pitchRecord) notesWithMeta += `\n[Pitch Deck: ${pitchRecord.streamUrl}]`;
    if (kpRecord) notesWithMeta += `\n[Key People: ${kpRecord.streamUrl}]`;
    if (req.body.ticketId) notesWithMeta += `\n[Ticket: ${req.body.ticketId}]`;

    // Update or insert the lead in company_leads
    let savedLead = null;
    if (leadId) {
      const resLead = await query(`
        UPDATE company_leads
        SET name = $1, lead_company = $1, linkedin = $2, status = 'VERIFIED', notes = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [companyName, website, notesWithMeta, leadId]);
      savedLead = resLead.rows[0];
    } else {
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
        companyName,
        req.body.title || leadData?.title || null,
        companyName,
        req.body.email || leadData?.email || null,
        website,
        req.body.location || leadData?.location || null,
        notesWithMeta
      ]);
      savedLead = insLead.rows[0];
    }

    return res.json({
      success: true,
      message: `Lead for ${companyName} saved successfully.`,
      ticketId: request.ticket_id,
      lead: {
        ...savedLead,
        companyName: savedLead.lead_company || savedLead.name,
        website: savedLead.linkedin,
        slotIndex: cleanIndex,
        leadStudy: studyRecord,
        pitchDeck: pitchRecord,
        keyPeople: kpRecord,
        pdf: studyRecord || primaryRecord
      },
      fileUrl: primaryRecord?.streamUrl || null,
      file: primaryRecord
    });
  } catch (error) {
    console.error('[Save Lead Onboarding Assets Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to save lead onboarding work.' });
  }
};

// @desc    Initiate or check Key People intelligence unlock access for a company
// @route   POST /api/company/:companyId/unlock-key-people
// @access  Private (Client User of company or Admin)
export const unlockKeyPeople = async (req, res) => {
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
        return res.status(403).json({ success: false, message: 'Forbidden.' });
      }
    }

    const company = await findCompanyById(targetCompanyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Check if already paid
    const existingPaid = await query(`
      SELECT r.id, r.ticket_id FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_LEAD'
        AND (r.title ILIKE '%Key People%' OR r.description ILIKE '%Key People%')
        AND r.payment_status = 'PAID'
      LIMIT 1
    `, [targetCompanyId]);

    if (existingPaid.rows.length > 0) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Key People intelligence is already unlocked for your company.',
        ticketId: existingPaid.rows[0].ticket_id
      });
    }

    // Check if there is already an existing pending request for Key People
    const existingPending = await query(`
      SELECT r.*, r.ticket_id AS "ticketId", r.service_type AS "serviceType"
      FROM requests r
      WHERE r.company_id = $1 AND r.service_type = 'COMPANY_LEAD'
        AND (r.title ILIKE '%Key People%' OR r.description ILIKE '%Key People%')
        AND r.payment_status != 'PAID'
      ORDER BY r.created_at DESC LIMIT 1
    `, [targetCompanyId]);

    if (existingPending.rows.length > 0) {
      const reqRow = existingPending.rows[0];
      return res.json({
        success: true,
        alreadyUnlocked: false,
        request: {
          _id: reqRow.id,
          id: reqRow.id,
          ticketId: reqRow.ticket_id,
          title: reqRow.title,
          description: reqRow.description,
          serviceType: reqRow.service_type,
          price: Number(reqRow.price) || 199,
          paymentStatus: reqRow.payment_status,
          status: reqRow.status,
          priority: reqRow.priority,
          assignedTeam: reqRow.assigned_team || 'Company Lead Team'
        }
      });
    }

    // Create a new request for Key People unlocking
    const countRes = await query('SELECT COUNT(*)::int as count FROM requests');
    const ticketId = `CG-LEAD-KP-${1000 + (countRes.rows[0]?.count || 0) + 1}`;
    const insertReq = await query(`
      INSERT INTO requests (
        ticket_id, user_id, company_id, service_type, title, description,
        priority, status, price, payment_status, assigned_team, created_at, updated_at
      ) VALUES (
        $1, $2, $3, 'COMPANY_LEAD', $4, $5,
        'HIGH', 'REQUEST_CREATED', 199, 'PENDING', 'Company Lead Team', NOW(), NOW()
      ) RETURNING *, ticket_id AS "ticketId", service_type AS "serviceType"
    `, [
      ticketId,
      req.user.id || req.user._id,
      targetCompanyId,
      `Key People Intelligence Access · ${company.name}`,
      'Unlock verified Key People documents and executive stakeholder dossiers for company leads.'
    ]);

    const createdReq = insertReq.rows[0];

    return res.json({
      success: true,
      alreadyUnlocked: false,
      message: 'Key People unlock request created. Complete payment to activate access.',
      request: {
        _id: createdReq.id,
        id: createdReq.id,
        ticketId: createdReq.ticket_id,
        title: createdReq.title,
        description: createdReq.description,
        serviceType: createdReq.service_type,
        price: 199,
        paymentStatus: 'PENDING',
        status: createdReq.status,
        priority: 'HIGH',
        assignedTeam: 'Company Lead Team'
      }
    });
  } catch (error) {
    console.error('[Unlock Key People Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate Key People unlock.' });
  }
};


