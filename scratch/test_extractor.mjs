import zlib from 'node:zlib';

/**
 * Extract readable text from DOCX buffer
 */
export function extractTextFromDocx(buffer) {
  try {
    let offset = 0;
    while (offset < buffer.length - 30) {
      if (buffer.readUInt32LE(offset) === 0x04034b50) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLen = buffer.readUInt16LE(offset + 26);
        const extraFieldLen = buffer.readUInt16LE(offset + 28);
        const fileName = buffer.toString('utf8', offset + 30, offset + 30 + fileNameLen);
        const dataOffset = offset + 30 + fileNameLen + extraFieldLen;

        if (fileName === 'word/document.xml') {
          const compData = buffer.slice(dataOffset, dataOffset + compressedSize);
          let xmlStr;
          if (compressionMethod === 8) {
            xmlStr = zlib.inflateRawSync(compData).toString('utf8');
          } else {
            xmlStr = compData.toString('utf8');
          }

          // Parse paragraphs and headings from document.xml
          const paragraphs = [];
          const pRegex = /<w:p(?:\s[^>]*)?>(.*?)<\/w:p>/g;
          let pMatch;
          while ((pMatch = pRegex.exec(xmlStr)) !== null) {
            const pContent = pMatch[1];
            // Extract text from <w:t>
            const textMatches = [...pContent.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)];
            const text = textMatches.map(m => m[1]).join('').trim();
            if (text) {
              const isHeading = /<w:pStyle\s+w:val="Heading(\d+)"/i.test(pContent);
              paragraphs.push(isHeading ? `### ${text}` : text);
            }
          }
          return paragraphs.join('\n\n');
        }
        offset = dataOffset + compressedSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.error('Docx parse error:', err.message);
  }
  return null;
}

/**
 * Extract readable text from PDF buffer
 */
export function extractTextFromPdf(buffer) {
  try {
    const raw = buffer.toString('binary');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    const extractedParagraphs = [];

    // Also look for literal text in non-stream objects or FlateDecode streams
    const objRegex = /<<[\s\S]*?\/Filter\s*\/FlateDecode[\s\S]*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
    
    // First try all streams
    while ((match = streamRegex.exec(raw)) !== null) {
      let streamData = Buffer.from(match[1], 'binary');
      let textContent = '';
      
      try {
        const decompressed = zlib.inflateSync(streamData);
        textContent = decompressed.toString('utf8');
      } catch {
        try {
          const decompressed = zlib.inflateRawSync(streamData);
          textContent = decompressed.toString('utf8');
        } catch {
          textContent = streamData.toString('utf8');
        }
      }

      // Check if textContent contains PDF text operators: BT ... ET
      if (textContent.includes('BT') && textContent.includes('ET')) {
        const btRegex = /BT([\s\S]*?)ET/g;
        let btMatch;
        while ((btMatch = btRegex.exec(textContent)) !== null) {
          const block = btMatch[1];
          // Match Tj: (Text) Tj
          // Match TJ: [(T) 10 (ext)] TJ
          // Match ' or ": (Text)'
          const lines = [];
          const tjRegex = /\(([^)]*)\)\s*Tj/g;
          let tjMatch;
          while ((tjMatch = tjRegex.exec(block)) !== null) {
            lines.push(unescapePdfStr(tjMatch[1]));
          }

          const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
          let atjMatch;
          while ((atjMatch = arrayTjRegex.exec(block)) !== null) {
            const inner = atjMatch[1];
            const parts = [...inner.matchAll(/\(([^)]*)\)/g)].map(m => unescapePdfStr(m[1]));
            if (parts.length > 0) {
              lines.push(parts.join(''));
            }
          }

          if (lines.length > 0) {
            const joined = lines.join(' ').replace(/\s+/g, ' ').trim();
            if (joined && joined.length > 1) {
              extractedParagraphs.push(joined);
            }
          }
        }
      }
    }

    if (extractedParagraphs.length > 0) {
      // Deduplicate consecutive identical paragraphs and join
      return extractedParagraphs.filter((p, i, a) => i === 0 || p !== a[i - 1]).join('\n\n');
    }

    // Fallback: search for strings in raw PDF
    const textFallback = [...raw.matchAll(/\(([\w\s.,!?:;@/#%&'"()\-]{3,})\)\s*Tj/g)].map(m => unescapePdfStr(m[1])).filter(Boolean);
    if (textFallback.length > 0) {
      return textFallback.join('\n\n');
    }
  } catch (err) {
    console.error('PDF parse error:', err.message);
  }
  return null;
}

function unescapePdfStr(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}
