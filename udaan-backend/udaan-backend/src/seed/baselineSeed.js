const bcrypt = require('bcryptjs');
const { ApprovalRule, Scheme, User } = require('../models');

const baselineRules = [
  // UNIVERSAL (All Sectors, All States)
  {
    sector: 'all', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Udyam MSME Registration Certificate', department: 'Ministry of MSME',
    required_documents: ['Aadhaar Card of Entrepreneur', 'PAN Card of Business', 'Bank Account Details & Cancelled Cheque'],
    sla_days: 3, hazard_level: 'low', requires_inspection: false,
  },
  {
    sector: 'all', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Goods & Services Tax (GST) Registration', department: 'GST Department',
    required_documents: ['PAN Card of Enterprise', 'Registered Office Address Proof', 'Authorized Signatory Aadhaar'],
    sla_days: 7, hazard_level: 'low', requires_inspection: false,
  },
  {
    sector: 'all', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Provisional Fire Safety NOC', department: 'Fire & Emergency Services',
    required_documents: ['Certified Architectural Building Layout Plan', 'Fire Fighting System Layout (Hydrants & Extinguishers)', 'Structural Stability Certificate'],
    sla_days: 15, hazard_level: 'medium', requires_inspection: true,
  },

  // FOOD PROCESSING / CAFE / HOTEL / RESTAURANT
  {
    sector: 'food_processing', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'FSSAI Food License / Registration (FoSCoS)', department: 'Food Safety and Standards Authority of India (FSSAI)',
    required_documents: ['Form-B Signed Application', 'Blueprint Layout of Kitchen/Processing Area', 'Water Testing Bacteriological Report (IS:10500)', 'Food Safety Management System (FSMS) Plan'],
    sla_days: 15, hazard_level: 'medium', requires_inspection: true,
  },
  {
    sector: 'food_processing', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Pollution Control Consent to Establish (CTE)', department: 'State Pollution Control Board (MPPCB)',
    required_documents: ['Manufacturing / Kitchen Process Flow Diagram', 'Effluent Treatment Plant (ETP) / STP Scheme Drawing', 'Industry Capital Investment Certificate'],
    sla_days: 21, hazard_level: 'high', requires_inspection: true,
  },
  {
    sector: 'food_processing', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Factory License & Industrial Blueprint Approval', department: 'Directorate of Industrial Health & Safety (Labour Dept)',
    required_documents: ['Flow Chart & Machine Layout Drawings in Metric Scale', 'Form-1 Approval of Factory Plans', 'Material Safety Data Sheets (MSDS)'],
    sla_days: 20, hazard_level: 'medium', requires_inspection: true,
  },

  // PHARMACY / PHARMA
  {
    sector: 'pharma', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Retail / Wholesale Drug License (Form 20/21)', department: 'State FDA & Central Drugs Standard Control Organisation (CDSCO)',
    required_documents: ['Registered Pharmacist Degree / Diploma Certificate', 'Commercial Premises Lease Deed (>10 sq.m)', 'Deep Refrigerator Invoice & Temperature Log Book', 'Premises Blueprint with Storage Layout'],
    sla_days: 21, hazard_level: 'medium', requires_inspection: true,
  },
  {
    sector: 'pharma', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Shops & Commercial Establishments Registration (Gumasta)', department: 'Labour Welfare Department',
    required_documents: ['Commercial Property Ownership Proof / Rent Deed', 'PAN & Aadhaar of Business Owner', 'Signboard Photo in State Language'],
    sla_days: 5, hazard_level: 'low', requires_inspection: false,
  },
  {
    sector: 'pharma', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Bio-Medical & Hazardous Waste Disposal Authorization', department: 'State Pollution Control Board (MPPCB)',
    required_documents: ['Bio-Medical Waste Segregation Agreement', 'Collection & Disposal Flow Protocol'],
    sla_days: 15, hazard_level: 'high', requires_inspection: true,
  },

  // IT_ITES / GYM / SERVICES
  {
    sector: 'it_ites', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Municipal Health & Trade License (Gumasta Act)', department: 'Urban Administration & Municipal Corporation',
    required_documents: ['Commercial Property Lease Agreement or Property Tax Receipt', 'Certified Trainers / Staff Bio-Data & First Aid Certificates', 'Fitness Equipment Structural Stability Certificate'],
    sla_days: 7, hazard_level: 'low', requires_inspection: true,
  },
  {
    sector: 'it_ites', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Commercial High-Tension Electrical Sanction', department: 'State Electricity Distribution Board',
    required_documents: ['Connected Electrical Load Diagram (HP/kVA)', 'Earthing Certificate by Chartered Electrical Engineer', 'Site Wiring Schematic'],
    sla_days: 10, hazard_level: 'medium', requires_inspection: true,
  },
  {
    sector: 'it_ites', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Shops & Commercial Establishments Act Registration', department: 'Labour Welfare Department',
    required_documents: ['Application Form-A', 'Employee List with Working Hours & Weekly Off Schedule', 'Commercial Lease Deed'],
    sla_days: 5, hazard_level: 'low', requires_inspection: false,
  },

  // MANUFACTURING
  {
    sector: 'manufacturing', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Factory License & Industrial Blueprint Approval', department: 'Directorate of Industrial Health & Safety (Labour Dept)',
    required_documents: ['Machine Layout & Flow Chart Drawings in Metric Scale', 'Form-1 Approval of Factory Plans', 'Connected Load Electrical Sanction'],
    sla_days: 20, hazard_level: 'high', requires_inspection: true,
  },
  {
    sector: 'manufacturing', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Consent to Establish (CTE) under Air & Water Acts', department: 'State Pollution Control Board (MPPCB)',
    required_documents: ['Detailed Process Flow Diagram & Raw Material Audit', 'Effluent Treatment Plant (ETP) / Air Scrubber Layout', 'Chartered Accountant Investment Certificate'],
    sla_days: 30, hazard_level: 'high', requires_inspection: true,
  },

  // TEXTILE
  {
    sector: 'textile', state: 'all', stage: 'all',
    min_investment: 0, max_investment: 999999999,
    approval_name: 'Textile Industrial Clearance & Zero Liquid Discharge (ZLD) Consent', department: 'State Pollution Control Board (MPPCB)',
    required_documents: ['Zero Liquid Discharge (ZLD) ETP Scheme Drawing', 'Industrial Textile Park Land Possession Letter', 'High-Tension Power Sanction Letter'],
    sla_days: 30, hazard_level: 'high', requires_inspection: true,
  },
];

const baselineSchemes = [
  {
    name: 'MP Industrial Investment Promotion Scheme',
    description: 'Capital subsidy for new manufacturing & processing units in Madhya Pradesh.',
    sector: 'all', state: 'all',
    min_investment: 10, max_investment: 999999999, min_employees: 0,
    benefit_description: 'Up to 40% capital subsidy on eligible fixed capital investment + 5% interest subvention for 5 years.',
  },
  {
    name: 'PMEGP (Prime Minister Employment Generation Programme)',
    description: 'Central credit-linked subsidy scheme for new micro-enterprises and service units.',
    sector: 'all', state: 'all',
    min_investment: 0, max_investment: 50, min_employees: 0,
    benefit_description: 'Margin money subsidy of 15% to 35% of total project cost.',
  },
  {
    name: 'Food Processing Industries Scheme (PLISFPI / PMFME)',
    description: 'Credit-linked capital subsidy for micro food processing, cafe & agro units.',
    sector: 'food_processing', state: 'all',
    min_investment: 5, max_investment: 999999999, min_employees: 0,
    benefit_description: '35% capital subsidy up to ₹10 Lakhs under PM Formalisation of Micro food processing Enterprises.',
  },
  {
    name: 'Technology Upgradation Fund Scheme (TUFS) & Textile Subsidies',
    description: 'Capital investment and interest subsidy for modern machinery in textile and apparel units.',
    sector: 'textile', state: 'all',
    min_investment: 15, max_investment: 999999999, min_employees: 0,
    benefit_description: 'Up to 15% capital subsidy on benchmarked machinery + power tariff concession.',
  },
  {
    name: 'Stand-Up India Scheme for Greenfield Enterprises',
    description: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield service or manufacturing units.',
    sector: 'all', state: 'all',
    min_investment: 10, max_investment: 100, min_employees: 0,
    benefit_description: 'Composite loan covering 85% of project cost with low interest rate.',
  },
];

async function ensureBaselineData() {
  try {
    const ruleCount = await ApprovalRule.count();
    if (ruleCount === 0) {
      await ApprovalRule.bulkCreate(baselineRules);
      console.log(`[Startup Seed] Successfully seeded ${baselineRules.length} statutory Approval Rules.`);
    }

    const schemeCount = await Scheme.count();
    if (schemeCount === 0) {
      await Scheme.bulkCreate(baselineSchemes);
      console.log(`[Startup Seed] Successfully seeded ${baselineSchemes.length} government schemes.`);
    }

    const defaultUsers = [
      { name: 'Aarav Sharma', email: 'test@gmail.com', password: 'Password@123', role: 'applicant' },
      { name: 'Department Officer', email: 'officer@gmail.com', password: 'officer12345', role: 'officer', department: 'Fire Department' },
      { name: 'Field Inspector', email: 'inspector@gmail.com', password: 'inspector12345', role: 'inspector', department: 'Fire Department' },
      { name: 'System Admin', email: 'admin@gmail.com', password: 'admin12345', role: 'admin' },
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 12);
        await User.create({
          name: u.name,
          email: u.email,
          password_hash: hash,
          role: u.role,
          department: u.department || null,
        });
        console.log(`[Startup Seed] Created demo account: ${u.email}`);
      }
    }
  } catch (err) {
    console.error('[Startup Seed] Error ensuring baseline data:', err);
  }
}

module.exports = { ensureBaselineData };
