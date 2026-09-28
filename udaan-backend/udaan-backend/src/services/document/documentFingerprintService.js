const { DOCUMENT_TYPES } = require('./documentRegistry');

const documentRules = {
  [DOCUMENT_TYPES.AADHAAR]: {
    keywords: ['aadhaar', 'uidai', 'unique identification authority', 'government of india'],
    identifierPatterns: [
      /\b\d{4}\s?\d{4}\s?\d{4}\b/  // 12 digit pattern
    ],
    requiredFields: ['name', 'dob', 'address'],
    layoutFeatures: ['identity card', 'demographic'],
    visualFeatures: ['qr', 'photograph'],
    negativeIndicators: ['gstin', 'permanent account number', 'income tax']
  },
  [DOCUMENT_TYPES.PAN]: {
    keywords: ['permanent account number', 'income tax department', 'govt of india', 'pan'],
    identifierPatterns: [
      /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/ // PAN pattern
    ],
    requiredFields: ['name', 'dob', 'pan'],
    layoutFeatures: ['identity card'],
    visualFeatures: ['photograph', 'signature'],
    negativeIndicators: ['gstin', 'aadhaar', 'uidai']
  },
  [DOCUMENT_TYPES.GST_CERTIFICATE]: {
    keywords: ['gst', 'goods and services tax', 'registration certificate', 'gstin'],
    identifierPatterns: [
      /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i // GSTIN pattern
    ],
    requiredFields: ['legal name', 'trade name', 'principal place'],
    layoutFeatures: ['certificate', 'registration'],
    visualFeatures: [],
    negativeIndicators: ['uidai', 'rent agreement']
  },
  [DOCUMENT_TYPES.UDYAM]: {
    keywords: ['udyam registration', 'msme', 'ministry of micro', 'small and medium enterprises'],
    identifierPatterns: [
      /\bUDYAM-[A-Z]{2}-\d{2}-\d{7}\b/i // Udyam pattern
    ],
    requiredFields: ['enterprise name', 'udyam registration number'],
    layoutFeatures: ['certificate'],
    visualFeatures: [],
    negativeIndicators: []
  },
  [DOCUMENT_TYPES.CERTIFICATE_OF_INCORPORATION]: {
    keywords: ['certificate of incorporation', 'registrar of companies', 'ministry of corporate affairs', 'cin'],
    identifierPatterns: [
      /\b[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/i // CIN pattern
    ],
    requiredFields: ['company name', 'cin', 'incorporation'],
    layoutFeatures: ['certificate'],
    visualFeatures: [],
    negativeIndicators: ['rent', 'lease']
  },
  [DOCUMENT_TYPES.RENT_AGREEMENT]: {
    keywords: ['rent agreement', 'lease deed', 'tenant', 'landlord', 'lessor', 'lessee', 'rent'],
    identifierPatterns: [],
    requiredFields: ['lessor', 'lessee', 'rent'],
    layoutFeatures: ['agreement', 'deed', 'stamp'],
    visualFeatures: [],
    negativeIndicators: ['incorporation', 'uidai']
  },
  [DOCUMENT_TYPES.FIRE_NOC]: {
    keywords: ['fire safety', 'fire noc', 'no objection certificate', 'fire services'],
    identifierPatterns: [],
    requiredFields: ['noc', 'address'],
    layoutFeatures: ['certificate', 'noc'],
    visualFeatures: [],
    negativeIndicators: []
  },
  [DOCUMENT_TYPES.FIRE_FIGHTING_LAYOUT]: {
    keywords: ['fire', 'layout', 'plan', 'extinguisher', 'hydrant', 'exit'],
    identifierPatterns: [],
    requiredFields: [],
    layoutFeatures: ['plan', 'dimensions', 'legend'],
    visualFeatures: ['drawing', 'floor plan'],
    negativeIndicators: ['certificate', 'uidai']
  },
  [DOCUMENT_TYPES.SIGNBOARD_PHOTO]: {
    keywords: [],
    identifierPatterns: [],
    requiredFields: [],
    layoutFeatures: [],
    visualFeatures: ['photo', 'signboard', 'shopfront'],
    negativeIndicators: ['uidai', 'income tax', 'certificate']
  }
};

module.exports = { documentRules };
