const { DocumentVault, ApplicantProfile } = require('../models');
const { encryptData, decryptData } = require('../utils/encryption');

// Secure document upload with payload validation, MIME sanitization, and AES-256-GCM encryption at rest.
async function uploadDocument(req, res) {
  try {
    const { applicant_id, document_type, file_url, expiry_date } = req.body;
    if (!applicant_id || !document_type || !file_url) {
      return res.status(400).json({ error: 'applicant_id, document_type and file_url are required' });
    }

    if (typeof document_type !== 'string' || document_type.trim().length === 0) {
      return res.status(400).json({ error: 'document_type must be a non-empty string' });
    }

    // 1. Payload size protection (max 10MB file ~ 13.5MB base64)
    if (file_url.length > 14 * 1024 * 1024) {
      return res.status(400).json({ error: 'Uploaded file exceeds the maximum allowed limit of 10MB' });
    }

    // 2. Strict protocol & MIME verification
    let parsedUrl;
    try {
      parsedUrl = new URL(file_url);
    } catch {
      return res.status(400).json({ error: 'file_url is not a valid URL' });
    }

    const allowedProtocols = ['https:', 'http:', 'data:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Prohibited URL protocol. Only HTTPS, HTTP, or secure data URLs are allowed.' });
    }

    if (parsedUrl.protocol === 'data:') {
      const allowedMimePrefixes = [
        'data:application/pdf',
        'data:image/jpeg',
        'data:image/jpg',
        'data:image/png',
        'data:image/webp',
      ];
      const isSafeMime = allowedMimePrefixes.some((prefix) => file_url.startsWith(prefix));
      if (!isSafeMime) {
        return res.status(400).json({ error: 'Disallowed file type. Only PDF, PNG, JPG, and WEBP documents are permitted.' });
      }
    }

    if (expiry_date) {
      const expDate = new Date(expiry_date);
      if (isNaN(expDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry_date format' });
      }
      if (expDate < new Date()) {
        return res.status(400).json({ error: 'Document has expired (expiry_date is in the past)' });
      }
    }

    let profile;
    if (req.user.role === 'applicant') {
      profile = await ApplicantProfile.findOne({
        where: { id: applicant_id, user_id: req.user.id },
      });
      if (!profile) {
        return res.status(403).json({ error: 'Applicant profile not found or access denied' });
      }
    } else {
      profile = await ApplicantProfile.findByPk(applicant_id);
      if (!profile) return res.status(404).json({ error: 'Applicant profile not found' });
    }

    // Security: Applicants cannot self-verify documents. Any applicant-supplied
    // verified_status is ignored, ensuring all applicant uploads default to 'pending'.
    let verifiedStatus = 'pending';
    if (['officer', 'admin'].includes(req.user.role) && req.body.verified_status) {
      if (['pending', 'verified', 'rejected'].includes(req.body.verified_status)) {
        verifiedStatus = req.body.verified_status;
      }
    }

    // Store data encrypted at rest using AES-256-GCM
    const encryptedUrl = encryptData(file_url);

    const doc = await DocumentVault.create({
      applicant_id,
      document_type: document_type.trim(),
      file_url: encryptedUrl,
      expiry_date: expiry_date || null,
      verified_status: verifiedStatus,
    });

    const responseDoc = doc.toJSON();
    responseDoc.file_url = decryptData(responseDoc.file_url);
    res.status(201).json(responseDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Returns everything already in the vault for this applicant — securely decrypted for authorized viewer.
async function getVault(req, res) {
  try {
    const applicantId = req.params.applicantId;
    if (req.user.role === 'applicant') {
      const profile = await ApplicantProfile.findOne({
        where: { id: applicantId, user_id: req.user.id },
      });
      if (!profile) {
        return res.status(403).json({ error: 'Applicant profile not found or access denied' });
      }
    }

    const docs = await DocumentVault.findAll({
      where: { applicant_id: applicantId },
    });

    const decryptedDocs = docs.map((d) => {
      const plain = d.toJSON();
      plain.file_url = decryptData(plain.file_url);
      return plain;
    });

    res.json(decryptedDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Officer/Admin endpoint: updates document verified_status ('verified' | 'rejected' | 'pending')
async function verifyDocument(req, res) {
  try {
    const { documentId } = req.params;
    const { verified_status } = req.body;
    if (!['verified', 'rejected', 'pending'].includes(verified_status)) {
      return res.status(400).json({ error: "verified_status must be 'verified', 'rejected', or 'pending'" });
    }

    const doc = await DocumentVault.findByPk(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    doc.verified_status = verified_status;
    await doc.save();

    const responseDoc = doc.toJSON();
    responseDoc.file_url = decryptData(responseDoc.file_url);
    res.json(responseDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadDocument, getVault, verifyDocument };

