import { extractTextFromPdf, extractTextFromDocx } from './test_extractor.mjs';
import zlib from 'node:zlib';

// Test PDF
const streamContent = Buffer.from(
  'BT\n' +
  '/F1 18 Tf\n' +
  '(Company Overview) Tj\n' +
  'ET\n' +
  'BT\n' +
  '/F1 12 Tf\n' +
  '[(Acme Corp is a leading ) -20 (provider of enterprise SaaS solutions.)] TJ\n' +
  'ET\n'
);
const compressedStream = zlib.deflateSync(streamContent);
const pdfData = Buffer.concat([
  Buffer.from('%PDF-1.4\n1 0 obj\n<< /Filter /FlateDecode /Length ' + compressedStream.length + ' >>\nstream\n'),
  compressedStream,
  Buffer.from('\nendstream\nendobj\nxref\ntrailer\n<< /Root 1 0 R >>\n%%EOF')
]);

console.log('Testing PDF Extraction:');
const extractedPdf = extractTextFromPdf(pdfData);
console.log('PDF Result:\n', extractedPdf);

// Test DOCX
const docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  '<w:body>' +
  '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Lead Study: CloudCorp</w:t></w:r></w:p>' +
  '<w:p><w:r><w:t>CloudCorp is evaluating our B2B outbound engine for Q4 expansion.</w:t></w:r></w:p>' +
  '</w:body></w:document>';
const deflatedXml = zlib.deflateRawSync(Buffer.from(docXml, 'utf8'));

const fileName = Buffer.from('word/document.xml', 'utf8');
const header = Buffer.alloc(30);
header.writeUInt32LE(0x04034b50, 0); // signature
header.writeUInt16LE(20, 4); // version needed
header.writeUInt16LE(0, 6); // flags
header.writeUInt16LE(8, 8); // compression method Deflate
header.writeUInt32LE(0, 10); // time/date
header.writeUInt32LE(0, 14); // crc32
header.writeUInt32LE(deflatedXml.length, 18); // comp size
header.writeUInt32LE(docXml.length, 22); // uncomp size
header.writeUInt16LE(fileName.length, 26); // filename length
header.writeUInt16LE(0, 28); // extra field length

const docxData = Buffer.concat([header, fileName, deflatedXml]);

console.log('\nTesting DOCX Extraction:');
const extractedDocx = extractTextFromDocx(docxData);
console.log('DOCX Result:\n', extractedDocx);
