const { ApplicantProfile } = require('../models');

// Comprehensive real-world Indian Government Schemes Database
const REAL_GOVT_SCHEMES = [
  {
    id: 1001,
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    description: 'Micro-credit facility up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises.',
    sector: 'all',
    min_investment: 0, max_investment: 10,
    benefit_description: 'Collateral-free loans (Shishu up to 50k, Kishore up to 5L, Tarun up to 10L).',
  },
  {
    id: 1002,
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    description: 'Credit-linked subsidy program to generate employment opportunities in rural and urban areas.',
    sector: 'all',
    min_investment: 0, max_investment: 50,
    benefit_description: '15% to 35% margin money subsidy on project cost.',
  },
  {
    id: 1003,
    name: 'Stand-Up India Scheme',
    description: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield enterprises by women or SC/ST entrepreneurs.',
    sector: 'all',
    min_investment: 10, max_investment: 100,
    benefit_description: 'Composite loan covering 85% of the project cost at low interest.',
  },
  {
    id: 1004,
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    description: 'Collateral-free credit to the micro and small enterprise sector.',
    sector: 'all',
    min_investment: 0, max_investment: 200,
    benefit_description: 'Guarantee cover up to 85% for loans up to ₹200 Lakhs.',
  },
  {
    id: 1005,
    name: 'PM Formalisation of Micro Food Processing Enterprises (PMFME)',
    description: 'Financial, technical and business support for micro food processing units.',
    sector: 'food_processing',
    min_investment: 0, max_investment: 100,
    benefit_description: 'Credit-linked capital subsidy at 35% of the eligible project cost, max ceiling ₹10 Lakhs.',
  },
  {
    id: 1006,
    name: 'Production Linked Incentive (PLI) for Pharmaceuticals',
    description: 'Financial incentives to pharmaceutical manufacturers to boost domestic manufacturing.',
    sector: 'pharma',
    min_investment: 50, max_investment: 99999,
    benefit_description: 'Incentive of 3% to 10% on incremental sales of pharmaceutical goods.',
  },
  {
    id: 1007,
    name: 'Amended Technology Upgradation Fund Scheme (ATUFS)',
    description: 'Capital investment subsidy for technology upgradation in the textile industry.',
    sector: 'textile',
    min_investment: 10, max_investment: 500,
    benefit_description: '15% Capital Investment Subsidy (CIS) on eligible machinery.',
  },
  {
    id: 1008,
    name: 'Startup India Seed Fund Scheme (SISFS)',
    description: 'Financial assistance to startups for proof of concept, prototype development, product trials, market entry.',
    sector: 'it_ites',
    min_investment: 0, max_investment: 50,
    benefit_description: 'Up to ₹20 Lakhs as grant for proof of concept; up to ₹50 Lakhs for commercialization.',
  },
  {
    id: 1009,
    name: 'Agriculture Infrastructure Fund (AIF)',
    description: 'Medium-long term debt financing for post-harvest management infrastructure.',
    sector: 'agriculture',
    min_investment: 10, max_investment: 200,
    benefit_description: '3% Interest Subvention and credit guarantee coverage for loans up to ₹2 Crore.',
  },
  {
    id: 1010,
    name: 'ZED (Zero Defect Zero Effect) Certification Scheme',
    description: 'Encourages MSMEs to constantly upgrade their quality standards in manufacturing.',
    sector: 'manufacturing',
    min_investment: 0, max_investment: 99999,
    benefit_description: 'Subsidy of up to 80% on ZED certification cost + handholding support.',
  }
];

// Intelligent Scheme Matching Engine
async function matchSchemes(req, res) {
  try {
    const profile = await ApplicantProfile.findByPk(req.params.applicantId);
    if (!profile) return res.status(404).json({ error: 'Applicant profile not found' });

    const inv = profile.investment_amount || 0;
    const sector = profile.sector?.toLowerCase() || 'all';

    const scoredSchemes = REAL_GOVT_SCHEMES.map(scheme => {
      let score = 50; // Base score
      let matchReasons = [];

      // Sector Match
      if (scheme.sector === sector) {
        score += 30;
        matchReasons.push('Exact sector match');
      } else if (scheme.sector === 'all') {
        score += 10;
        matchReasons.push('Applicable to all sectors');
      } else {
        score -= 40; // Penalty for wrong sector
      }

      // Investment Match
      if (inv >= scheme.min_investment && inv <= scheme.max_investment) {
        score += 20;
        matchReasons.push('Investment amount falls within scheme limits');
      } else if (inv > scheme.max_investment) {
        score -= 20;
        matchReasons.push('Investment exceeds scheme ceiling');
      } else if (inv < scheme.min_investment) {
        score -= 10;
        matchReasons.push('Investment below scheme minimum threshold');
      }

      // Special Boosts
      if (['agriculture', 'food_processing'].includes(sector) && scheme.name.includes('Food')) {
        score += 15;
      }
      
      // Ensure score is between 0 and 99
      score = Math.max(0, Math.min(99, score));

      return {
        ...scheme,
        match_score: score,
        match_reasons: matchReasons
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
