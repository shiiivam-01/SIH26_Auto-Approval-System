const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

async function extractTextFromBuffer(buffer, mimeType) {
  try {
    let text = '';
    
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (mimeType.startsWith('image/')) {
      const { data } = await Tesseract.recognize(buffer, 'eng');
      text = data.text;
    }
    
    return normalizeText(text);
  } catch (err) {
    console.error('OCR Extraction failed:', err);
    throw new Error('Failed to extract text from document');
  }
}

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, ' ') // replace punctuation
    .trim();
}

module.exports = { extractTextFromBuffer, normalizeText };
