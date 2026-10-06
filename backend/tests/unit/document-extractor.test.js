import zlib from 'node:zlib';
import assert from 'node:assert';
import { extractDocumentText, extractTextFromPdf, extractTextFromDocx } from '../../src/services/documentExtractor.js';

console.log('====================================================');
console.log('CREATIVEGINI DOCUMENT EXTRACTOR TEST SUITE');
console.log('====================================================\n');

function createPdfWithTj(text) {
  const streamContent = `BT\n/F1 12 Tf\n100 700 Td\n(${text}) Tj\nET`;
  const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\r\n`
    + compressed.toString('binary')
    + `\r\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n100\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

function createPdfWithHex(text) {
  const hex = Buffer.from(text, 'utf8').toString('hex');
  const streamContent = `BT\n/F1 12 Tf\n100 700 Td\n<${hex}> Tj\nET`;
  const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\r\n`
    + compressed.toString('binary')
    + `\r\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n100\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

function createPdfWithUtf16Hex(text) {
  const u16 = Buffer.from(text, 'utf16le');
  const beBuf = Buffer.alloc(u16.length);
  for (let i = 0; i < u16.length; i += 2) {
    beBuf[i] = u16[i + 1];
    beBuf[i + 1] = u16[i];
  }
  const hex = beBuf.toString('hex');
  const streamContent = `BT\n/F1 12 Tf\n100 700 Td\n<${hex}> Tj\nET`;
  const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\r\n`
    + compressed.toString('binary')
    + `\r\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n100\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

function createPdfWithTjArray(part1, part2) {
  const hex1 = Buffer.from(part1, 'utf8').toString('hex');
  const hex2 = Buffer.from(part2, 'utf8').toString('hex');
  const streamContent = `BT\n/F1 12 Tf\n100 700 Td\n[<${hex1}> 12 <${hex2}>] TJ\nET`;
  const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\r\n`
    + compressed.toString('binary')
    + `\r\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n100\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

// TEST 1
console.log('TEST 1: Standard literal PDF text in parentheses');
const t1 = extractTextFromPdf(createPdfWithTj('CreativeGini Market Analysis'));
assert(t1 && t1.includes('CreativeGini Market Analysis'), 'Test 1 failed');
console.log('  [PASS] Extracted: ' + t1);

// TEST 2
console.log('\nTEST 2: Hex-encoded PDF text (Chrome/Word export standard)');
const t2 = extractTextFromPdf(createPdfWithHex('Target Accounts & Growth Study'));
assert(t2 && t2.includes('Target Accounts & Growth Study'), 'Test 2 failed');
console.log('  [PASS] Extracted: ' + t2);

// TEST 3
console.log('\nTEST 3: UTF-16BE Hex PDF text (Adobe Acrobat / InDesign standard)');
const t3 = extractTextFromPdf(createPdfWithUtf16Hex('Key Stakeholders & Executive Profiles'));
assert(t3 && t3.includes('Key Stakeholders & Executive Profiles'), 'Test 3 failed');
console.log('  [PASS] Extracted: ' + t3);

// TEST 4
console.log('\nTEST 4: TJ kerning array with hex tokens');
const t4 = extractTextFromPdf(createPdfWithTjArray('Competitive Landscape', 'Q4 Projections'));
assert(t4 && t4.includes('Competitive Landscape') && t4.includes('Q4 Projections'), 'Test 4 failed');
console.log('  [PASS] Extracted: ' + t4);

// TEST 5
console.log('\nTEST 5: Dispatcher auto-detection with MIME and magic bytes');
const pdfBuf = createPdfWithTj('Full Company Study Overview');
const t5 = extractDocumentText(pdfBuf, 'application/pdf', 'Company_Study.pdf');
assert(t5 && t5.includes('Full Company Study Overview'), 'Test 5 failed');
console.log('  [PASS] Extracted: ' + t5);

// TEST 6
console.log('\nTEST 6: Graceful fallback for non-text / scanned files');
const emptyBuf = Buffer.from('Non-pdf random binary data without text');
const t6 = extractDocumentText(emptyBuf, 'application/pdf', 'Scanned_Doc.pdf');
assert(t6 === null, 'Test 6 failed: non-text doc must return null for preview-unavailable state');
console.log('  [PASS] Returned null gracefully for non-text document');

console.log('\n====================================================');
console.log('TEST SUMMARY: 6 PASSED, 0 FAILED');
console.log('====================================================\n');
process.exit(0);
