const { ApplicantProfile } = require('../models');

// Comprehensive real-world Indian Government Schemes Database mapped to MyScheme.gov.in parameters
const REAL_GOVT_SCHEMES = [
  {
    schemeName: 'Pradhan Mantri Mudra Yojana (PMMY)',
    schemeShortTitle: 'pmmy',
    nodalMinistryName: 'Ministry of Finance',
    nodalDepartmentName: 'Department of Financial Services',
    targetBeneficiaries: 'Individual',
    schemeCategory: 'Business & Entrepreneurship',
    schemeSubCategory: 'Loans & Subsidies',
    dbtScheme: 'No',
    level: 'Central',
    tags: 'Loan, MSME, Entrepreneur',
    nationality: 'Indian',
    gender: 'All', // Male | Female | Transgender
    minority: 'No',
    nri: 'No',
    beneficiaryState: 'All',
    residence: 'Both',
    caste: 'All', // All | SC | ST | OBC
    disability: 'No',
    unemployed: 'No',
    occupation: 'Entrepreneur',
    familyIncomeAnnual: 0,
    individualIncomeAnnual: 0,
    maritalStatus: 'All',
    briefDescription: 'Micro-credit facility up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises.',
    slug: 'pmmy-loan',
    benefitTypes: 'Collateral-free loans (Shishu up to 50k, Kishore up to 5L, Tarun up to 10L).',
    age: 18,
    parentIncomeAnnual: 0,
    isGovEmployee: 'No',
    isBpl: 'No',
    isEconomicDistress: 'No',
    employmentStatus: 'Entrepreneur',
    isStudent: 'No',
    
    // Eligibility specific
    applicantType: 'Individual',
    businessSector: 'All',
    enterpriseClassification: 'Micro',
    businessStage: 'New / Proposed business',
    min_investment: 0, 
    max_investment: 10,
    annualTurnoverMin: 0,
    annualTurnoverMax: 100,
    min_employees: 0,
    max_employees: 50,
    requiredRegistrations: 'Udyam Registration',
    requiredDocuments: 'Aadhaar, PAN, Bank details',
    purposeOfAssistance: 'Business loan',
    sector: 'all'
  },
  {
    schemeName: 'Prime Minister Employment Generation Programme (PMEGP)',
    schemeShortTitle: 'pmegp',
    nodalMinistryName: 'Ministry of Micro, Small and Medium Enterprises',
    nodalDepartmentName: 'KVIC',
    targetBeneficiaries: 'Individual',
    schemeCategory: 'Business & Entrepreneurship',
    schemeSubCategory: 'Loans & Subsidies',
    dbtScheme: 'Yes',
    level: 'Central',
    tags: 'Employment, MSME, Subsidy',
    nationality: 'Indian',
    gender: 'All',
    minority: 'No',
    nri: 'No',
    beneficiaryState: 'All',
    residence: 'Both',
    caste: 'All',
    disability: 'No',
    unemployed: 'Yes',
    occupation: 'All',
    familyIncomeAnnual: 0,
    individualIncomeAnnual: 0,
    maritalStatus: 'All',
    briefDescription: 'Credit-linked subsidy program to generate employment opportunities in rural and urban areas.',
    slug: 'pmegp-subsidy',
    benefitTypes: '15% to 35% margin money subsidy on project cost.',
    age: 18,
    parentIncomeAnnual: 0,
    isGovEmployee: 'No',
    isBpl: 'No',
    isEconomicDistress: 'No',
    employmentStatus: 'Unemployed',
    isStudent: 'No',
    
    // Eligibility specific
    applicantType: 'Individual',
    businessSector: 'Manufacturing, Service',
    enterpriseClassification: 'Micro',
    businessStage: 'New / Proposed business',
    min_investment: 0, 
    max_investment: 50,
    annualTurnoverMin: 0,
    annualTurnoverMax: 9999,
    min_employees: 0,
    max_employees: 9999,
    requiredRegistrations: 'Udyam Registration',
    requiredDocuments: 'Aadhaar, PAN, Project report',
    purposeOfAssistance: 'Capital subsidy',
    sector: 'all'
  },
  {
    schemeName: 'Stand-Up India Scheme',
    schemeShortTitle: 'standup',
    nodalMinistryName: 'Ministry of Finance',
    nodalDepartmentName: 'Department of Financial Services',
    targetBeneficiaries: 'Individual',
    schemeCategory: 'Social welfare & Empowerment',
    schemeSubCategory: 'Citizen empowerment',
    dbtScheme: 'No',
    level: 'Central',
    tags: 'SC, ST, Women, Entrepreneur, Loan',
    nationality: 'Indian',
    gender: 'Female', // Primarily targets Women, SC, ST
    minority: 'No',
    nri: 'No',
    beneficiaryState: 'All',
    residence: 'Both',
    caste: 'Scheduled Caste (SC) | Scheduled Tribe (ST)',
    disability: 'No',
    unemployed: 'No',
    occupation: 'Entrepreneur',
    familyIncomeAnnual: 0,
    individualIncomeAnnual: 0,
    maritalStatus: 'All',
    briefDescription: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield enterprises by women or SC/ST entrepreneurs.',
    slug: 'stand-up-india',
    benefitTypes: 'Composite loan covering 85% of the project cost at low interest.',
    age: 18,
    parentIncomeAnnual: 0,
    isGovEmployee: 'No',
    isBpl: 'No',
    isEconomicDistress: 'No',
    employmentStatus: 'Entrepreneur',
    isStudent: 'No',
    
    // Eligibility specific
    applicantType: 'Individual',
    businessSector: 'Manufacturing, Service, Trading',
    enterpriseClassification: 'Small',
    businessStage: 'Greenfield',
    min_investment: 10, 
    max_investment: 100,
    annualTurnoverMin: 0,
    annualTurnoverMax: 99999,
    min_employees: 0,
    max_employees: 99999,
    requiredRegistrations: 'Udyam Registration',
    requiredDocuments: 'Aadhaar, PAN, Project report, Caste certificate',
    purposeOfAssistance: 'Business loan',
    sector: 'all'
  }
];

// Intelligent Scheme Matching Engine mirroring MyScheme parameters
async function matchSchemes(req, res) {
  try {
    const profile = await ApplicantProfile.findByPk(req.params.applicantId);
    if (!profile) return res.status(404).json({ error: 'Applicant profile not found' });

    // Extract basic profile data, defaulting where data might be missing since applicant profile is currently basic
    const inv = profile.investment_amount || 0;
    const sector = profile.sector?.toLowerCase() || 'all';
    const state = profile.state || 'All';
    // Dummy values for parameters not yet collected in the basic UDAAN profile, but ready for logic
    const gender = 'Female'; // Example simulated value
    const caste = 'General'; // Example simulated value

    const scoredSchemes = REAL_GOVT_SCHEMES.map((scheme, index) => {
      let score = 50; // Base score
      let matchReasons = [];

      // 1. Sector Match
      if (scheme.sector === sector) {
        score += 25;
        matchReasons.push('Exact business sector match');
      } else if (scheme.sector === 'all') {
        score += 10;
        matchReasons.push('Scheme applicable to all sectors');
      } else {
        score -= 30; // Penalty for wrong sector
      }

      // 2. Investment Match
      if (inv >= scheme.min_investment && inv <= scheme.max_investment) {
        score += 20;
        matchReasons.push('Investment falls within required scheme limits');
      } else if (inv > scheme.max_investment) {
        score -= 20;
        matchReasons.push('Investment exceeds scheme ceiling');
      } else if (inv < scheme.min_investment) {
        score -= 10;
        matchReasons.push('Investment below scheme minimum threshold');
      }

      // 3. State Match
      if (scheme.beneficiaryState === 'All' || scheme.beneficiaryState.toLowerCase() === state.toLowerCase()) {
        score += 5;
        matchReasons.push('State eligibility met');
      }

      // 4. Advanced Demographics (Gender, Caste) - Ready for full MyScheme integration
      if (scheme.gender !== 'All' && scheme.gender === gender) {
        score += 15;
        matchReasons.push('Targeted gender demographic match');
      }
      
      if (scheme.caste !== 'All' && scheme.caste.includes(caste)) {
        score += 15;
        matchReasons.push('Targeted social category match');
      }

      // Ensure score is between 0 and 99
      score = Math.max(0, Math.min(99, score));

      // Map back to the expected frontend structure so we don't break existing UI
      return {
        id: 1000 + index, // Mock ID
        name: scheme.schemeName,
        description: scheme.briefDescription,
        benefit_description: scheme.benefitTypes,
        sector: scheme.sector === 'all' ? 'All Sectors' : scheme.sector,
        state: scheme.beneficiaryState,
        min_investment: scheme.min_investment,
        max_investment: scheme.max_investment,
        min_employees: 0,
        match_score: score,
        match_reasons: matchReasons,
        // Also return the raw parameters in case the frontend wants to display them
        parameters: scheme
      };
    });

    // Filter out low scores and sort by highest match
    const eligibleSchemes = scoredSchemes
      .filter(s => s.match_score >= 60)
      .sort((a, b) => b.match_score - a.match_score);

    res.json({ 
      eligible_scheme_count: eligibleSchemes.length, 
      schemes: eligibleSchemes 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { matchSchemes };
