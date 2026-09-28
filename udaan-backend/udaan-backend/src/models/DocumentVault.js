const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// The "verify once, reuse everywhere" vault. A document is uploaded once
// per applicant (not per department/application) and referenced by ID
// wherever it's needed — this is what eliminates repeat submission.
const DocumentVault = sequelize.define('DocumentVault', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicant_id: { type: DataTypes.INTEGER, allowNull: false },
  document_type: { type: DataTypes.STRING, allowNull: false }, // User's uploaded label
  file_url: { type: DataTypes.STRING, allowNull: false },
  
  // AI Pre-Validation Fields
  required_document_type: { type: DataTypes.STRING, allowNull: true },
  detected_document_type: { type: DataTypes.STRING, allowNull: true },
  verified_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'NEEDS_REVIEW', 'WRONG_DOCUMENT', 'INVALID_FILE', 'VERIFIED'),
    defaultValue: 'pending',
  },
  confidence_score: { type: DataTypes.FLOAT, allowNull: true },
  quality_status: { type: DataTypes.STRING, allowNull: true },
  validation_message: { type: DataTypes.STRING, allowNull: true },

  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expiry_date: { type: DataTypes.DATE, allowNull: true },
});

module.exports = DocumentVault;
