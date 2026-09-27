const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// This profile is the input to the checklist-matching engine.
// sector, state, investment_amount, employee_count and stage together
// determine which Approval Rules apply to this applicant.
const ApplicantProfile = sequelize.define('ApplicantProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  
  // Existing baseline fields
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

  // NEW: Business Details
  date_of_establishment: { type: DataTypes.STRING, allowNull: true },
  registration_number: { type: DataTypes.STRING, allowNull: true },
  udyam_registration_number: { type: DataTypes.STRING, allowNull: true },
  
  // NEW: Business Activity
  sub_sector: { type: DataTypes.STRING, allowNull: true },
  business_activity: { type: DataTypes.STRING, allowNull: true },
  products_services: { type: DataTypes.STRING, allowNull: true },
  is_export_business: { type: DataTypes.STRING, defaultValue: 'No' }, // Yes/No
  
  // NEW: Financial Details
  enterprise_type: { type: DataTypes.STRING, allowNull: true }, // Micro/Small/Medium
  annual_turnover: { type: DataTypes.FLOAT, allowNull: true }, // in INR lakhs
  existing_loan: { type: DataTypes.STRING, defaultValue: 'No' }, // Yes/No
  required_investment_amount: { type: DataTypes.FLOAT, allowNull: true },
  
  // NEW: Business Location
  city_town_village: { type: DataTypes.STRING, allowNull: true },
  pin_code: { type: DataTypes.STRING, allowNull: true },
  area_type: { type: DataTypes.STRING, allowNull: true }, // Urban/Rural
  is_sez: { type: DataTypes.STRING, defaultValue: 'No' }, // Yes/No
  
  // NEW: Owner Details
  owner_age: { type: DataTypes.INTEGER, allowNull: true },
  owner_gender: { type: DataTypes.STRING, allowNull: true },
  owner_nationality: { type: DataTypes.STRING, defaultValue: 'Indian' },
  employment_status: { type: DataTypes.STRING, allowNull: true },
  family_income: { type: DataTypes.FLOAT, allowNull: true },
  social_category: { type: DataTypes.STRING, allowNull: true }, // General/SC/ST/OBC
  minority_status: { type: DataTypes.STRING, defaultValue: 'No' }, // Yes/No
  disability_status: { type: DataTypes.STRING, defaultValue: 'No' }, // Yes/No
});

module.exports = ApplicantProfile;

