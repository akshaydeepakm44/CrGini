import * as XLSX from 'xlsx';
import crypto from 'crypto';
import { getCompanyLeads, addCompanyLead, updateCompanyLead } from '../repositories/companyRepository.js';
import { downloadAndStoreLogo } from './logoFetcher.js';
import { query } from '../config/postgres.js';

// Reasonable bounds for bulk imports
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_IMPORT_ROWS = 5000;
export const BATCH_CHUNK_SIZE = 25;

/**
 * Sanitize cell content against CSV/Spreadsheet formula execution.
 */
export function sanitizeCellValue(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (!str) return '';

  // Neutralize formula trigger characters (=, +, -, @, \t, \r)
  const firstChar = str.charAt(0);
  if (['=', '+', '-', '@'].includes(firstChar)) {
    // If it looks like a formula or command, neutralize by prepending a single quote
    str = `'${str}`;
  }
  return str;
}

/**
 * Extract clean domain name from URL or raw text for deduplication.
 */
export function extractNormalizedDomain(urlOrDomain) {
  if (!urlOrDomain || typeof urlOrDomain !== 'string') return null;
  let str = urlOrDomain.trim().toLowerCase();
  str = str.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const slashIdx = str.indexOf('/');
  if (slashIdx !== -1) {
    str = str.slice(0, slashIdx);
  }
  const colonIdx = str.indexOf(':');
  if (colonIdx !== -1) {
    str = str.slice(0, colonIdx);
  }
  // Basic validation that it looks like a domain (e.g. acme.com)
  if (str.includes('.') && !str.includes(' ') && str.length >= 3) {
    return str;
  }
  return null;
}

/**
 * Normalize and validate email address.
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : null;
}

/**
 * Auto-detect spreadsheet header mappings based on common column naming variants.
 */
export function autoDetectColumnMapping(headers = []) {
  const mapping = {
    company: null,
    name: null,
    title: null,
    email: null,
    website: null,
    linkedin: null,
    location: null,
    status: null,
    notes: null,
    logoUrl: null,
  };

  const headerNorm = headers.map(h => ({
    original: h,
    lower: String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));

  const findHeader = (patterns) => {
    for (const pat of patterns) {
      const match = headerNorm.find(h => h.lower === pat || h.lower.includes(pat));
      if (match) return match.original;
    }
    return null;
  };

  mapping.company = findHeader(['companyname', 'company', 'organization', 'account', 'business', 'firm', 'leadcompany']);
  mapping.name = findHeader(['contactperson', 'contactname', 'fullname', 'personname', 'leadname', 'contact', 'name', 'decisionmaker']);
  mapping.title = findHeader(['jobtitle', 'title', 'role', 'position', 'designation', 'seniority']);
  mapping.email = findHeader(['workemail', 'emailaddress', 'contactemail', 'directemail', 'email']);
  mapping.website = findHeader(['companywebsite', 'website', 'domain', 'weburl', 'site', 'url']);
  mapping.linkedin = findHeader(['linkedinurl', 'linkedinprofile', 'linkedin', 'socialurl', 'social']);
  mapping.location = findHeader(['location', 'headquarters', 'hq', 'city', 'country', 'address', 'region']);
  mapping.status = findHeader(['verificationstatus', 'leadstatus', 'status']);
  mapping.notes = findHeader(['researchnotes', 'notes', 'overview', 'description', 'summary', 'telemetry']);
  mapping.logoUrl = findHeader(['companylogourl', 'companylogo', 'logourl', 'logolink', 'logo', 'imageurl']);

  return mapping;
}

/**
 * Parse an uploaded spreadsheet file Buffer into sanitized rows.
 */
export function parseSpreadsheetBuffer(buffer, { fileName = 'import.xlsx' } = {}) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Spreadsheet payload must be a binary Buffer.');
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`);
  }

  // Parse using SheetJS with safe parameters (no formulas or raw HTML evaluation)
  let workbook;
  try {
    workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellFormula: false,
      cellHTML: false,
      cellText: true,
    });
  } catch (err) {
    throw new Error(`Failed to parse spreadsheet file: ${err.message}. Supported formats: .xlsx, .xls, .csv`);
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Spreadsheet does not contain any readable sheets.');
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" is empty or invalid.`);
  }

  // Convert sheet to JSON rows with headers
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Spreadsheet does not contain any data rows.');
  }

  if (rawRows.length > MAX_IMPORT_ROWS) {
    throw new Error(`Spreadsheet contains ${rawRows.length} rows, which exceeds the limit of ${MAX_IMPORT_ROWS} rows.`);
  }

  // Extract detected headers from worksheet range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const headers = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
    if (cell && cell.v) {
      headers.push(String(cell.v).trim());
    }
  }

  // Fallback headers from object keys
  const allHeaders = headers.length > 0 ? headers : Object.keys(rawRows[0] || {});

  // Sanitize all cell contents
  const sanitizedRows = rawRows.map((row, idx) => {
    const cleanRow = { _rowNumber: idx + 2 }; // 1-indexed Excel row (row 1 is header)
    for (const key of Object.keys(row)) {
      cleanRow[key] = sanitizeCellValue(row[key]);
    }
    return cleanRow;
  });

  return {
    sheetName,
    headers: allHeaders,
    rows: sanitizedRows,
    totalCount: sanitizedRows.length,
  };
}

/**
 * Preview and validate spreadsheet rows against tenant duplicates before committing.
 */
export async function previewLeadsImport(companyId, fileBuffer, { fileName = 'import.xlsx', customMapping = null } = {}) {
  const { headers, rows } = parseSpreadsheetBuffer(fileBuffer, { fileName });
  const mapping = customMapping || autoDetectColumnMapping(headers);

  // Fetch existing tenant leads for duplicate detection
  const existingLeads = await getCompanyLeads(companyId);

  // Build existing lead lookup maps
  const existingDomainMap = new Map();
  const existingEmailMap = new Map();
  const existingCompanyMap = new Map();

  for (const l of existingLeads) {
    const dom = extractNormalizedDomain(l.website || l.linkedin || l.notes);
    if (dom) existingDomainMap.set(dom, l);

    const em = normalizeEmail(l.email);
    if (em) existingEmailMap.set(em, l);

    const compName = (l.company || l.lead_company || l.name || '').trim().toLowerCase();
    if (compName) existingCompanyMap.set(compName, l);
  }

  let validRowsCount = 0;
  let invalidRowsCount = 0;
  let duplicateRowsCount = 0;
  let logosAvailableCount = 0;
  let logosMissingCount = 0;

  const errors = [];
  const previewList = [];
  const seenInBatchDomains = new Set();
  const seenInBatchEmails = new Set();
  const seenInBatchCompanies = new Set();

  for (const r of rows) {
    const rowNum = r._rowNumber;
    const companyName = mapping.company ? (r[mapping.company] || '').trim() : '';
    const contactName = mapping.name ? (r[mapping.name] || '').trim() : '';
    const title = mapping.title ? (r[mapping.title] || '').trim() : '';
    const rawEmail = mapping.email ? (r[mapping.email] || '').trim() : '';
    const website = mapping.website ? (r[mapping.website] || '').trim() : '';
    const linkedin = mapping.linkedin ? (r[mapping.linkedin] || '').trim() : '';
    const location = mapping.location ? (r[mapping.location] || '').trim() : '';
    const status = mapping.status ? (r[mapping.status] || '').trim().toUpperCase() : 'PENDING';
    const notes = mapping.notes ? (r[mapping.notes] || '').trim() : '';
    const logoUrl = mapping.logoUrl ? (r[mapping.logoUrl] || '').trim() : '';

    const rowErrors = [];

    // Required company identity check: must have company name or contact name
    if (!companyName && !contactName) {
      rowErrors.push('Missing company name or contact person name.');
    }

    // Email format validation (optional field, but if present must be valid)
    let cleanEmail = null;
    if (rawEmail) {
      cleanEmail = normalizeEmail(rawEmail);
      if (!cleanEmail) {
        rowErrors.push(`Malformed email format: "${rawEmail}".`);
      }
    }

    // Status verification rule (existing application constraint)
    if (status === 'VERIFIED' && !notes) {
      rowErrors.push('Status VERIFIED requires research or verification notes.');
    }

    // Logo presence check
    if (logoUrl) {
      logosAvailableCount++;
    } else {
      logosMissingCount++;
    }

    // Duplicate detection
    let isDuplicate = false;
    let duplicateReason = null;
    let matchedExistingLeadId = null;

    const rowDomain = extractNormalizedDomain(website || linkedin);
    if (rowDomain) {
      if (existingDomainMap.has(rowDomain)) {
        isDuplicate = true;
        duplicateReason = `Matches existing account domain: ${rowDomain}`;
        matchedExistingLeadId = existingDomainMap.get(rowDomain).id;
      } else if (seenInBatchDomains.has(rowDomain)) {
        isDuplicate = true;
        duplicateReason = `Duplicate domain within import sheet: ${rowDomain}`;
      }
    }

    if (!isDuplicate && cleanEmail) {
      if (existingEmailMap.has(cleanEmail)) {
        isDuplicate = true;
        duplicateReason = `Matches existing contact email: ${cleanEmail}`;
        matchedExistingLeadId = existingEmailMap.get(cleanEmail).id;
      } else if (seenInBatchEmails.has(cleanEmail)) {
        isDuplicate = true;
        duplicateReason = `Duplicate email within import sheet: ${cleanEmail}`;
      }
    }

    if (!isDuplicate && companyName) {
      const compKey = companyName.toLowerCase();
      if (existingCompanyMap.has(compKey)) {
        isDuplicate = true;
        duplicateReason = `Matches existing company name: ${companyName}`;
        matchedExistingLeadId = existingCompanyMap.get(compKey).id;
      } else if (seenInBatchCompanies.has(compKey)) {
        isDuplicate = true;
        duplicateReason = `Duplicate company name within import sheet: ${companyName}`;
      }
    }

    // Track for intra-batch duplicate detection
    if (rowDomain) seenInBatchDomains.add(rowDomain);
    if (cleanEmail) seenInBatchEmails.add(cleanEmail);
    if (companyName) seenInBatchCompanies.add(companyName.toLowerCase());

    if (rowErrors.length > 0) {
      invalidRowsCount++;
      errors.push({
        rowNumber: rowNum,
        company: companyName || contactName || `Row ${rowNum}`,
        message: rowErrors.join(' '),
      });
    } else {
      validRowsCount++;
      if (isDuplicate) {
        duplicateRowsCount++;
      }
    }

    // Keep preview of first 25 rows
    if (previewList.length < 25) {
      previewList.push({
        rowNumber: rowNum,
        company: companyName || '—',
        name: contactName || companyName || '—',
        title: title || '—',
        email: cleanEmail || rawEmail || '—',
        website: website || '—',
        location: location || '—',
        status: status || 'PENDING',
        hasLogo: Boolean(logoUrl),
        logoUrl: logoUrl || null,
        isValid: rowErrors.length === 0,
        isDuplicate,
        duplicateReason,
        matchedExistingLeadId,
        error: rowErrors.join(' ') || null,
      });
    }
  }

  return {
    headers,
    detectedMapping: mapping,
    summary: {
      totalRows: rows.length,
      validRows: validRowsCount,
      invalidRows: invalidRowsCount,
      duplicateRows: duplicateRowsCount,
      logosAvailable: logosAvailableCount,
      logosMissing: logosMissingCount,
    },
    previewRows: previewList,
    errors: errors.slice(0, 100), // First 100 errors
    totalErrorsCount: errors.length,
  };
}

/**
 * Execute actual bulk lead import in bounded batches with logo retrieval and MinIO storage.
 */
export async function executeLeadsImport({
  companyId,
  fileBuffer,
  fileName = 'import.xlsx',
  columnMapping = null,
  updateDuplicates = false,
  downloadLogos = true,
}) {
  const { headers, rows } = parseSpreadsheetBuffer(fileBuffer, { fileName });
  const mapping = columnMapping || autoDetectColumnMapping(headers);

  // Existing leads for duplicate detection
  const existingLeads = await getCompanyLeads(companyId);
  const existingDomainMap = new Map();
  const existingEmailMap = new Map();
  const existingCompanyMap = new Map();

  for (const l of existingLeads) {
    const dom = extractNormalizedDomain(l.website || l.linkedin || l.notes);
    if (dom) existingDomainMap.set(dom, l);

    const em = normalizeEmail(l.email);
    if (em) existingEmailMap.set(em, l);

    const compName = (l.company || l.lead_company || l.name || '').trim().toLowerCase();
    if (compName) existingCompanyMap.set(compName, l);
  }

  const importId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let logosStoredMinio = 0;
  let logosFailed = 0;
  let logosMissing = 0;

  const errors = [];
  const createdLeadIds = [];
  const updatedLeadIds = [];

  const seenInBatchDomains = new Set();
  const seenInBatchEmails = new Set();
  const seenInBatchCompanies = new Set();

  // Process rows in sequential bounded batches to prevent memory spikes
  for (let i = 0; i < rows.length; i += BATCH_CHUNK_SIZE) {
    const batch = rows.slice(i, i + BATCH_CHUNK_SIZE);

    for (const r of batch) {
      const rowNum = r._rowNumber;
      const companyName = mapping.company ? (r[mapping.company] || '').trim() : '';
      const contactName = mapping.name ? (r[mapping.name] || '').trim() : '';
      const title = mapping.title ? (r[mapping.title] || '').trim() : '';
      const rawEmail = mapping.email ? (r[mapping.email] || '').trim() : '';
      const website = mapping.website ? (r[mapping.website] || '').trim() : '';
      const linkedin = mapping.linkedin ? (r[mapping.linkedin] || '').trim() : '';
      const location = mapping.location ? (r[mapping.location] || '').trim() : '';
      let status = mapping.status ? (r[mapping.status] || '').trim().toUpperCase() : 'PENDING';
      const notes = mapping.notes ? (r[mapping.notes] || '').trim() : '';
      const logoUrl = mapping.logoUrl ? (r[mapping.logoUrl] || '').trim() : '';

      // Validation
      if (!companyName && !contactName) {
        failedCount++;
        errors.push({ rowNumber: rowNum, company: '—', error: 'Missing company name or contact person name' });
        continue;
      }

      let cleanEmail = null;
      if (rawEmail) {
        cleanEmail = normalizeEmail(rawEmail);
        if (!cleanEmail) {
          failedCount++;
          errors.push({ rowNumber: rowNum, company: companyName || contactName, error: `Malformed email: ${rawEmail}` });
          continue;
        }
      }

      if (status === 'VERIFIED' && !notes) {
        status = 'RESEARCHED'; // Gracefully downgrade status rather than failing row
      }

      // Check duplicates
      const rowDomain = extractNormalizedDomain(website || linkedin);
      let matchedLead = null;

      if (rowDomain && existingDomainMap.has(rowDomain)) {
        matchedLead = existingDomainMap.get(rowDomain);
      } else if (cleanEmail && existingEmailMap.has(cleanEmail)) {
        matchedLead = existingEmailMap.get(cleanEmail);
      } else if (companyName && existingCompanyMap.has(companyName.toLowerCase())) {
        matchedLead = existingCompanyMap.get(companyName.toLowerCase());
      }

      // Intra-batch duplicate check
      const isBatchDuplicate =
        (rowDomain && seenInBatchDomains.has(rowDomain)) ||
        (cleanEmail && seenInBatchEmails.has(cleanEmail)) ||
        (companyName && seenInBatchCompanies.has(companyName.toLowerCase()));

      if (rowDomain) seenInBatchDomains.add(rowDomain);
      if (cleanEmail) seenInBatchEmails.add(cleanEmail);
      if (companyName) seenInBatchCompanies.add(companyName.toLowerCase());

      if (matchedLead || isBatchDuplicate) {
        if (!updateDuplicates || isBatchDuplicate) {
          skippedCount++;
          continue;
        }

        // Authorized update mode
        try {
          const updates = {};
          if (contactName) updates.name = contactName;
          if (companyName) updates.company = companyName;
          if (title) updates.title = title;
          if (cleanEmail) updates.email = cleanEmail;
          if (location) updates.location = location;
          if (notes) updates.notes = `${matchedLead.notes || ''}\n${notes}`.trim();
          if (website) updates.website = website;

          let updatedLogoKey = null;
          if (downloadLogos && logoUrl) {
            const logoRes = await downloadAndStoreLogo({
              companyId,
              leadId: matchedLead.id,
              logoUrl,
            });
            if (logoRes.success && logoRes.objectKey) {
              updatedLogoKey = logoRes.objectKey;
              updates.logoUrl = updatedLogoKey;
              logosStoredMinio++;
            } else {
              logosFailed++;
            }
          } else if (!logoUrl) {
            logosMissing++;
          }

          await updateCompanyLead(matchedLead.id, updates);
          if (updatedLogoKey) {
            await query(`UPDATE company_leads SET logo_url = $1 WHERE id = $2`, [updatedLogoKey, matchedLead.id]);
          }

          updatedCount++;
          updatedLeadIds.push(matchedLead.id);
          continue;
        } catch (updateErr) {
          failedCount++;
          errors.push({ rowNumber: rowNum, company: companyName, error: `Update failed: ${updateErr.message}` });
          continue;
        }
      }

      // Create new lead record
      try {
        const finalContactName = contactName || companyName;
        const finalCompanyName = companyName || contactName;

        let formattedNotes = notes;
        if (website && !formattedNotes.includes('[Website:')) {
          formattedNotes = `${formattedNotes}\n[Website: ${website}]`.trim();
        }

        const newLead = await addCompanyLead(companyId, {
          name: finalContactName,
          title: title || null,
          company: finalCompanyName,
          email: cleanEmail || null,
          linkedin: linkedin || website || null,
          location: location || null,
          status: status || 'PENDING',
          notes: formattedNotes || null,
        });

        // Set website column
        if (website) {
          await query(`UPDATE company_leads SET website = $1 WHERE id = $2`, [website, newLead.id]);
        }

        // Logo retrieval and MinIO persistence
        if (downloadLogos && logoUrl) {
          const logoRes = await downloadAndStoreLogo({
            companyId,
            leadId: newLead.id,
            logoUrl,
          });

          if (logoRes.success && logoRes.objectKey) {
            logosStoredMinio++;
            // Update lead with MinIO objectKey in logo_url column and notes annotation
            const currentNotes = (newLead.notes || '');
            const notesWithLogo = `${currentNotes}\n[Logo: ${logoRes.objectKey}]`.trim();
            await query(`
              UPDATE company_leads
              SET logo_url = $1, notes = $2, updated_at = NOW()
              WHERE id = $3
            `, [logoRes.objectKey, notesWithLogo, newLead.id]);
          } else {
            logosFailed++;
          }
        } else if (!logoUrl) {
          logosMissing++;
        }

        // Add to in-memory lookup to prevent duplicate in later rows of the same import
        if (rowDomain) existingDomainMap.set(rowDomain, newLead);
        if (cleanEmail) existingEmailMap.set(cleanEmail, newLead);
        if (companyName) existingCompanyMap.set(companyName.toLowerCase(), newLead);

        createdCount++;
        createdLeadIds.push(newLead.id);
      } catch (insertErr) {
        failedCount++;
        errors.push({ rowNumber: rowNum, company: companyName, error: `Insert failed: ${insertErr.message}` });
      }
    }
  }

  const summary = {
    importId,
    timestamp,
    totalRows: rows.length,
    createdCount,
    updatedCount,
    skippedCount,
    failedCount,
    logosStoredMinio,
    logosFailed,
    logosMissing,
  };

  return {
    ...summary,
    summary,
    createdLeadIds,
    updatedLeadIds,
    errors,
  };
}

/**
 * Generate a downloadable Excel template with sample rows and headers.
 */
export function generateLeadImportTemplate(format = 'xlsx') {
  const headers = [
    'Company Name',
    'Contact Person',
    'Job Title',
    'Work Email',
    'Website',
    'LinkedIn URL',
    'Location',
    'Company Logo URL',
    'Status',
    'Research Notes',
  ];

  const sampleRows = [
    [
      'Stripe Payments Inc.',
      'Patrick Collison',
      'Chief Executive Officer',
      'p.collison@stripe.com',
      'https://stripe.com',
      'https://linkedin.com/in/patrickcollison',
      'San Francisco, CA',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      'VERIFIED',
      'Global financial infrastructure powering internet commerce and developer-first billing.',
    ],
    [
      'Datadog Systems',
      'Olivier Pomel',
      'Chief Executive Officer',
      'pomel@datadoghq.com',
      'https://datadoghq.com',
      'https://linkedin.com/in/olivierpomel',
      'New York, NY',
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200',
      'RESEARCHED',
      'Cloud-scale monitoring, observability and security platform for modern microservices.',
    ],
    [
      'Snowflake Computing',
      'Sridhar Ramaswamy',
      'Chief Executive Officer',
      'sridhar@snowflake.com',
      'https://snowflake.com',
      'https://linkedin.com/in/sridharramaswamy',
      'Bozeman, MT',
      '',
      'PENDING',
      'Unified cloud data platform enabling data warehousing, lakehouse and AI workloads.',
    ],
  ];

  const worksheetData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 26 }, // Company Name
    { wch: 22 }, // Contact Person
    { wch: 26 }, // Job Title
    { wch: 28 }, // Work Email
    { wch: 24 }, // Website
    { wch: 32 }, // LinkedIn URL
    { wch: 20 }, // Location
    { wch: 45 }, // Company Logo URL
    { wch: 14 }, // Status
    { wch: 50 }, // Research Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Import Template');

  if (format === 'csv') {
    const csvStr = XLSX.utils.sheet_to_csv(worksheet);
    return {
      buffer: Buffer.from(csvStr, 'utf-8'),
      mimeType: 'text/csv',
      fileName: 'creativegini_leads_import_template.csv',
    };
  }

  const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return {
    buffer: xlsxBuffer,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileName: 'creativegini_leads_import_template.xlsx',
  };
}
