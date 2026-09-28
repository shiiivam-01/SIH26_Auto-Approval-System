const { classifyDocument } = require('./documentClassifier');
const { extractTextFromBuffer, normalizeText } = require('./ocrService');
const { DOCUMENT_TYPES } = require('./documentRegistry');

// 90–100: HIGH CONFIDENCE
// 75–89: MEDIUM CONFIDENCE
// 60–74: LOW CONFIDENCE
// Below 60: UNCLASSIFIED

function determineStatus(requiredType, detectedType, confidence, quality, topMatches) {
  if (confidence < 60) {
    return {
      status: 'NEEDS_REVIEW',
      message: 'Document type could not be verified with sufficient confidence.'
    };
  }

  // MIN_SCORE_GAP check
  const top1 = topMatches[0];
  const top2 = topMatches[1];
  if (top2 && (top1.score - top2.score < 10)) {
    return {
      status: 'NEEDS_REVIEW',
      message: 'Classification is ambiguous. Multiple document types detected.'
    };
  }

  if (detectedType === requiredType) {
    if (confidence >= 75 && quality === 'GOOD') {
      return {
        status: 'VERIFIED',
        message: `Document appears to match the required ${requiredType} category.`
      };
    } else {
      return {
        status: 'NEEDS_REVIEW',
        message: 'The document appears to be correct, but the system could not confidently verify all expected characteristics.'
      };
    }
  } else {
    return {
      status: 'WRONG_DOCUMENT',
      message: `Uploaded document appears to be a ${detectedType}, not ${requiredType}.`
    };
  }
}

async function processDocument(fileBuffer, mimeType, requiredDocumentType) {
  try {
    let quality = 'GOOD';
    let text = '';
    
    try {
      text = await extractTextFromBuffer(fileBuffer, mimeType);
    } catch (err) {
      return {
        requiredType: requiredDocumentType,
        detectedType: null,
        status: 'INVALID_FILE',
        confidence: 0,
        quality: 'UNREADABLE',
        message: 'File is corrupted, unsupported, blank, or completely unreadable.'
      };
    }
    
    if (text.length < 20) {
      quality = 'POOR';
    }

    const { detectedType, confidence, matches } = classifyDocument(text);
    const result = determineStatus(requiredDocumentType, detectedType, confidence, quality, matches);

    return {
      requiredType: requiredDocumentType,
      detectedType,
      status: result.status,
      confidence: (confidence / 100).toFixed(2),
      quality,
      message: result.message
    };
    
  } catch (err) {
    console.error('Document processing error:', err);
    return {
      requiredType: requiredDocumentType,
      detectedType: null,
      status: 'NEEDS_REVIEW',
      confidence: 0,
      quality: 'POOR',
      message: 'An error occurred during AI analysis.'
    };
  }
}

module.exports = { processDocument };
