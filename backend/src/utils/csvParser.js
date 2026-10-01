/**
 * RFC 4180 compliant CSV Parser and Generator.
 * Handles quoted fields, embedded commas, double quotes, newlines, CRLF, and BOM.
 */

/**
 * Parse raw CSV text into an array of rows (array of string arrays).
 * @param {string} text - Raw CSV text
 * @returns {string[][]} Array of row arrays
 */
export const parseCsv = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Remove UTF-8 Byte Order Mark (BOM) if present
  let cleanText = text.replace(/^\uFEFF/, '');

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = cleanText.length;

  while (i < len) {
    const char = cleanText[i];
    const nextChar = i + 1 < len ? cleanText[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // skip \r of \r\n
        }
        currentRow.push(currentField.trim());
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push final field/row if any content left
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
};

/**
 * Standardize CSV header names for resilient column lookup.
 * @param {string} header
 * @returns {string} normalized key
 */
export const normalizeHeaderKey = (header) => {
  if (!header) return '';
  const cleaned = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleaned.includes('clientname') || cleaned === 'name' || cleaned.includes('contactperson')) return 'clientName';
  if (cleaned.includes('email')) return 'email';
  if (cleaned.includes('companyname') || cleaned === 'company') return 'companyName';
  if (cleaned.includes('temporarypassword') || cleaned.includes('temppassword') || cleaned === 'password') return 'temporaryPassword';
  if (cleaned.includes('website') || cleaned.includes('url')) return 'website';
  if (cleaned.includes('industrytype') || cleaned.includes('industry')) return 'industry';
  return header.trim();
};

/**
 * Parse CSV text into objects mapped to normalized header keys.
 * @param {string} text - Raw CSV text
 * @returns {{ rawHeaders: string[], headers: string[], rows: object[], emptyRowCount: number }}
 */
export const parseCsvToObjects = (text) => {
  const parsedRows = parseCsv(text);
  if (parsedRows.length === 0) {
    return { rawHeaders: [], headers: [], rows: [], emptyRowCount: 0 };
  }

  // Find first row containing headers
  let headerIndex = -1;
  for (let i = 0; i < parsedRows.length; i++) {
    if (parsedRows[i].some(f => f.length > 0)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return { rawHeaders: [], headers: [], rows: [], emptyRowCount: parsedRows.length };
  }

  const rawHeaders = parsedRows[headerIndex].map(h => h.trim());
  const headerKeys = rawHeaders.map(normalizeHeaderKey);

  const rows = [];
  let emptyRowCount = headerIndex;

  for (let r = headerIndex + 1; r < parsedRows.length; r++) {
    const rowValues = parsedRows[r];
    const isAllEmpty = rowValues.every(val => !val || val.trim().length === 0);
    if (isAllEmpty) {
      emptyRowCount++;
      continue;
    }

    const rowObj = { _rowNumber: r + 1, _rawValues: rowValues };
    headerKeys.forEach((key, colIndex) => {
      rowObj[key] = rowValues[colIndex] !== undefined ? rowValues[colIndex].trim() : '';
    });

    rows.push(rowObj);
  }

  return { rawHeaders, headers: headerKeys, rows, emptyRowCount };
};

/**
 * Safely format an array of objects or rows into a CSV string.
 * @param {string[]} headers - Header names
 * @param {object[]} records - Record objects with keys matching headers or mapping function
 * @param {(record: object, header: string) => any} valueAccessor - Optional custom getter
 * @returns {string} Formatted CSV text
 */
export const generateCsv = (headers, records, valueAccessor = null) => {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = records.map(rec => {
    return headers.map(h => {
      const val = valueAccessor ? valueAccessor(rec, h) : (rec[h] !== undefined ? rec[h] : rec[normalizeHeaderKey(h)]);
      return escapeCell(val);
    }).join(',');
  });

  return [headerLine, ...rowLines].join('\r\n');
};
