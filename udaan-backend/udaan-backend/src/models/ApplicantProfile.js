const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// This profile is the input to the checklist-matching engine.
// sector, state, investment_amount, employee_count and stage together
// determine which Approval Rules apply to this applicant.
const ApplicantProfile = sequelize.define('ApplicantProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  applicant_name: { type: DataTypes.STRING, allowNull: true },
  date_of_birth: { type: DataTypes.STRING, allowNull: true },
  phone_number: { type: DataTypes.STRING, allowNull: true },
  aadhaar_number: { type: DataTypes.STRING, allowNull: true },
  pan_number: { type: DataTypes.STRING, allowNull: true },
  business_name: { type: DataTypes.STRING, allowNull: false },
  business_type: { type: DataTypes.STRING, allowNull: true },
  sector: { type: DataTypes.STRING, allowNull: false }, // e.g. 'food_processing', 'pharma', 'it_ites'
  nic_code: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING, allowNull: false },
  district: { type: DataTypes.STRING },
  investment_amount: { type: DataTypes.FLOAT, allowNull: false }, // in INR lakhs
  employee_count: { type: DataTypes.INTEGER, allowNull: false },
  stage: {
    type: DataTypes.STRING,
    defaultValue: 'pre_establishment',
  },
});

module.exports = ApplicantProfile;

