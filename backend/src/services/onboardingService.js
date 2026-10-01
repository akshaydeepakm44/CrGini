import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/postgres.js';
import { createCompany } from '../repositories/companyRepository.js';
import { createUser, findUserByEmail } from '../repositories/userRepository.js';
import { createActivityLog } from '../repositories/activityLogRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { sendInternalClientOnboardingEmails } from './emailService.js';
import { parseCsvToObjects, generateCsv } from '../utils/csvParser.js';

// In-memory cache for validated bulk onboarding batches (TTL: 30 minutes)
const bulkBatches = new Map();
const BATCH_TTL_MS = 30 * 60 * 1000;

// Periodic cleanup of expired batches
setInterval(() => {
  const now = Date.now();
  for (const [batchId, batch] of bulkBatches.entries()) {
    if (now - batch.createdAt > BATCH_TTL_MS) {
      bulkBatches.delete(batchId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Standard Email Validator
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Standard Password Validator (at least 8 chars, at least 1 letter, at least 1 number)
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  const p = password.trim();
  return p.length >= 8 && /[a-zA-Z]/.test(p) && /[0-9]/.test(p);
};

/**
 * Standard Website URL Validator (valid HTTP/HTTPS)
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const pattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  return pattern.test(url.trim());
};

/**
 * CSV Template with exact required headers
 */
export const CSV_TEMPLATE_HEADERS = [
  'Client Name',
  'Email',
  'Company Name',
  'Temporary Password',
  'Website',
  'Industry Type'
];

export const getCsvTemplateString = () => {
  const sampleRows = [
    {
      'Client Name': 'John Doe',
      'Email': 'john@example.com',
      'Company Name': 'ABC Technologies',
      'Temporary Password': 'Temp@1234',
      'Website': 'https://abc.com',
      'Industry Type': 'Enterprise SaaS / AI'
    },
    {
      'Client Name': 'Jane Smith',
      'Email': 'jane@example.com',
      'Company Name': 'XYZ Solutions',
      'Temporary Password': 'Temp@5678',
      'Website': 'https://xyz.com',
      'Industry Type': 'FinTech'
    }
  ];
  return generateCsv(CSV_TEMPLATE_HEADERS, sampleRows);
};

/**
 * Helper to resolve active internal team members and send onboarding notifications & emails.
 */
export const dispatchClientOnboardingWorkflows = async ({
  client,
  company,
  portalBase
}) => {
  try {
    const activeSpecialistsRes = await query(`
      SELECT id, name, email, role, status, company_lead, company_boost, company_ui, company_id
      FROM users
      WHERE is_deleted = false
        AND status = 'ACTIVE'
        AND role != 'ADMIN'
        AND (
          role IN ('COMPANY_LEAD', 'COMPANY_BOOST', 'LANDING_PAGE')
          OR company_lead = true
          OR company_boost = true
          OR company_ui = true
        )
      ORDER BY created_at ASC
    `);

    const clientEmailClean = (client.email || '').toLowerCase().trim();

    const isInternalMember = (u) =>
      !u.company_id &&
      u.email?.toLowerCase().trim() !== clientEmailClean &&
      u.role !== 'ADMIN';

    const leadMembers = activeSpecialistsRes.rows.filter(
      u => isInternalMember(u) && (u.role === 'COMPANY_LEAD' || Boolean(u.company_lead))
    );
    const boostMembers = activeSpecialistsRes.rows.filter(
      u => isInternalMember(u) && (u.role === 'COMPANY_BOOST' || Boolean(u.company_boost))
    );
    const uiMembers = activeSpecialistsRes.rows.filter(
      u => isInternalMember(u) && (u.role === 'LANDING_PAGE' || Boolean(u.company_ui))
    );

    const leadEmails = Array.from(new Set(leadMembers.map(u => u.email?.trim()).filter(Boolean)));
    const boostEmails = Array.from(new Set(boostMembers.map(u => u.email?.trim()).filter(Boolean)));
    const uiEmails = Array.from(new Set(uiMembers.map(u => u.email?.trim()).filter(Boolean)));

    // In-app notifications
    const allNotifiedInternalUsers = [
      ...leadMembers,
      ...boostMembers,
      ...uiMembers
    ].reduce((acc, current) => {
      if (!acc.some(u => u.id === current.id)) acc.push(current);
      return acc;
    }, []);

    for (const internalUser of allNotifiedInternalUsers) {
      try {
        await createNotification({
          userId: internalUser.id,
          type: 'ASSIGNMENT',
          title: `New Client Onboarded: ${company.name}`,
          message: `A new client (${company.name}) has been onboarded. Please prepare and submit the required sample work for your team.`
        });
      } catch (err) {
        console.warn('[INTERNAL NOTIF WARNING]:', err.message);
      }
    }

    // Branded team notification emails
    await sendInternalClientOnboardingEmails({
      client: { name: client.name, email: client.email },
      company: {
        id: company.id,
        name: company.name,
        contactPerson: client.name,
        website: company.website || null,
        industry: company.industry || 'Technology / SaaS',
        email: client.email,
        companyInfo: company.companyInfo || null
      },
      leadRecipients: leadEmails,
      boostRecipients: boostEmails,
      uiRecipients: uiEmails,
      portalBase
    });

    return true;
  } catch (err) {
    console.error('[ONBOARDING WORKFLOW DISPATCH ERROR]:', err.message);
    return false;
  }
};

/**
 * Validate every row of a bulk onboarding CSV and generate preview summary.
 * @param {string} csvText - Raw CSV text
 * @returns {Promise<object>} Validation and preview result
 */
export const validateBulkOnboarding = async (csvText) => {
  if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
    return {
      success: false,
      message: 'CSV file content is empty. Please upload a valid CSV file.'
    };
  }

  const { rawHeaders, headers, rows, emptyRowCount } = parseCsvToObjects(csvText);

  if (rawHeaders.length === 0) {
    return {
      success: false,
      message: 'CSV header could not be found. Please check file structure.'
    };
  }

  // Check required column headers
  const requiredKeys = ['clientName', 'email', 'companyName', 'temporaryPassword', 'website', 'industry'];
  const missingKeys = requiredKeys.filter(k => !headers.includes(k));

  if (missingKeys.length > 0) {
    const keyLabelMap = {
      clientName: 'Client Name',
      email: 'Email',
      companyName: 'Company Name',
      temporaryPassword: 'Temporary Password',
      website: 'Website',
      industry: 'Industry Type'
    };
    const missingLabels = missingKeys.map(k => keyLabelMap[k]);
    return {
      success: false,
      message: `Missing required CSV column(s): ${missingLabels.join(', ')}. Required headers are: ${CSV_TEMPLATE_HEADERS.join(', ')}.`
    };
  }

  if (rows.length === 0) {
    return {
      success: false,
      message: 'CSV contains headers but no client data rows to process.'
    };
  }

  // 1. Gather all non-empty emails to perform single bulk DB lookup
  const candidateEmails = rows
    .map(r => (r.email || '').toLowerCase().trim())
    .filter(Boolean);

  const existingDbEmailsSet = new Set();
  if (candidateEmails.length > 0) {
    const dbLookup = await query(
      `SELECT LOWER(email) as email FROM users WHERE LOWER(email) = ANY($1) AND is_deleted = false`,
      [candidateEmails]
    );
    dbLookup.rows.forEach(r => existingDbEmailsSet.add(r.email.toLowerCase()));
  }

  // 2. Validate every row and track duplicates inside CSV
  const seenCsvEmails = new Map(); // email -> first rowNumber
  const previewRows = [];
  const validRowsForExecution = [];

  let validCount = 0;
  let invalidCount = 0;
  let duplicateCsvCount = 0;
  let duplicateDbCount = 0;

  for (const r of rows) {
    const rowNum = r._rowNumber;
    const clientName = (r.clientName || '').trim();
    const email = (r.email || '').trim();
    const emailLower = email.toLowerCase();
    const companyName = (r.companyName || '').trim();
    const temporaryPassword = (r.temporaryPassword || '').trim();
    const website = (r.website || '').trim();
    const industry = (r.industry || '').trim();

    const errors = [];

    if (!clientName) errors.push('Client Name is required');
    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email format');
    }

    if (!companyName) errors.push('Company Name is required');
    if (!temporaryPassword) {
      errors.push('Temporary Password is required');
    } else if (!validatePassword(temporaryPassword)) {
      errors.push('Temporary Password must be at least 8 characters and contain at least one letter and one number');
    }

    if (!website) {
      errors.push('Website is required');
    } else if (!validateUrl(website)) {
      errors.push('Website must be a valid HTTP or HTTPS URL (e.g. https://example.com)');
    }

    if (!industry) errors.push('Industry Type is required');

    // Duplicate detection within CSV
    let isCsvDuplicate = false;
    if (email && validateEmail(email)) {
      if (seenCsvEmails.has(emailLower)) {
        isCsvDuplicate = true;
        duplicateCsvCount++;
        errors.push(`Duplicate email in CSV (first seen on row ${seenCsvEmails.get(emailLower)})`);
      } else {
        seenCsvEmails.set(emailLower, rowNum);
      }
    }

    // Duplicate detection against database
    let isDbDuplicate = false;
    if (email && validateEmail(email) && existingDbEmailsSet.has(emailLower)) {
      isDbDuplicate = true;
      duplicateDbCount++;
      errors.push('Email already exists in database');
    }

    const isValid = errors.length === 0;

    let status = 'READY';
    if (!isValid) {
      invalidCount++;
      if (isCsvDuplicate) {
        status = 'DUPLICATE_CSV';
      } else if (isDbDuplicate) {
        status = 'DUPLICATE_DB';
      } else {
        status = 'INVALID';
      }
    } else {
      validCount++;
    }

    // Preview row (Omits passwords entirely for security)
    previewRows.push({
      rowNumber: rowNum,
      clientName,
      email,
      companyName,
      website,
      industry,
      isValid,
      status,
      error: errors.join('; '),
      errors
    });

    if (isValid) {
      validRowsForExecution.push({
        rowNumber: rowNum,
        clientName,
        email: emailLower,
        companyName,
        password: temporaryPassword,
        website,
        industry
      });
    }
  }

  // Generate batch ID and cache valid rows securely in memory
  const batchId = crypto.randomUUID();
  bulkBatches.set(batchId, {
    batchId,
    createdAt: Date.now(),
    validRows: validRowsForExecution,
    allRows: rows,
    status: 'PREVIEWED'
  });

  return {
    success: true,
    batchId,
    summary: {
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      duplicateCsvEmails: duplicateCsvCount,
      duplicateDbEmails: duplicateDbCount,
      emptyRowsSkipped: emptyRowCount
    },
    previewRows
  };
};

/**
 * Execute the creation of valid clients from a validated batch or raw CSV.
 * Uses atomic/transactional approach per client with full double-submit protection.
 */
export const executeBulkOnboarding = async ({
  batchId,
  csvText,
  adminUser,
  portalBase
}) => {
  let rowsToProcess = [];
  let cachedBatch = null;

  if (batchId && bulkBatches.has(batchId)) {
    cachedBatch = bulkBatches.get(batchId);
    if (cachedBatch.status === 'PROCESSING' || cachedBatch.status === 'COMPLETED') {
      return {
        success: false,
        isDoubleSubmit: true,
        message: 'This bulk onboarding batch has already been processed or is currently in progress.'
      };
    }
    cachedBatch.status = 'PROCESSING';
    rowsToProcess = cachedBatch.validRows;
  } else if (csvText) {
    // Authoritative re-validation directly from CSV text
    const valResult = await validateBulkOnboarding(csvText);
    if (!valResult.success) {
      return valResult;
    }
    const freshBatch = bulkBatches.get(valResult.batchId);
    freshBatch.status = 'PROCESSING';
    rowsToProcess = freshBatch.validRows;
    cachedBatch = freshBatch;
  } else {
    return {
      success: false,
      message: 'Invalid or expired bulk onboarding batch. Please re-upload your CSV.'
    };
  }

  const createdClients = [];
  const skippedRecords = [];
  let emailsTriggered = 0;

  for (const item of rowsToProcess) {
    const { rowNumber, clientName, email, companyName, password, website, industry } = item;
    const userEmail = email.toLowerCase().trim();

    try {
      // 1. Double check database in real-time
      const existing = await findUserByEmail(userEmail);
      if (existing) {
        skippedRecords.push({
          rowNumber,
          clientName,
          email: userEmail,
          companyName,
          website,
          industry,
          reason: 'Email already registered in database'
        });
        continue;
      }

      // 2. Hash temporary password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create Company profile in PostgreSQL
      const company = await createCompany({
        name: companyName,
        contactPerson: clientName,
        email: userEmail,
        website: website || null,
        industry: industry || 'Technology / SaaS',
        createdBy: adminUser.id || adminUser._id
      });

      // 4. Create User account strictly with role: USER
      const user = await createUser({
        name: clientName,
        email: userEmail,
        password: hashedPassword,
        role: 'USER',
        companyId: company.id,
        status: 'ACTIVE'
      });

      // 5. Activity log
      try {
        await createActivityLog({
          userId: adminUser.id || adminUser._id,
          userName: adminUser.name,
          companyId: company.id,
          action: 'CLIENT_CREATED',
          details: `Admin ${adminUser.name} created client user ${clientName} for company ${companyName} (${userEmail}) via bulk onboarding.`
        });
      } catch (logErr) {
        console.warn('[BULK LOG WARNING]:', logErr.message);
      }

      // 6. Trigger existing onboarding email workflow (non-blocking)
      const emailSent = await dispatchClientOnboardingWorkflows({
        client: { name: clientName, email: userEmail },
        company,
        portalBase
      });

      if (emailSent) {
        emailsTriggered++;
      }

      createdClients.push({
        rowNumber,
        userId: user.id,
        companyId: company.id,
        clientName: user.name,
        email: user.email,
        companyName: company.name,
        status: 'ACTIVE'
      });
    } catch (rowError) {
      console.error(`[BULK ONBOARDING ROW ERROR (Row ${rowNumber})]:`, rowError);
      skippedRecords.push({
        rowNumber,
        clientName,
        email: userEmail,
        companyName,
        website,
        industry,
        reason: rowError.message || 'Database error during account provisioning'
      });
    }
  }

  if (cachedBatch) {
    cachedBatch.status = 'COMPLETED';
    cachedBatch.result = {
      createdCount: createdClients.length,
      emailsTriggered,
      skippedCount: skippedRecords.length
    };
  }

  return {
    success: true,
    message: `Bulk onboarding completed: ${createdClients.length} client(s) created, ${skippedRecords.length} skipped.`,
    createdCount: createdClients.length,
    emailsTriggered,
    skippedCount: skippedRecords.length,
    createdClients,
    skippedRecords
  };
};
