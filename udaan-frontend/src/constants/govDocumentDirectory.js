/**
 * Official Government Document Guidelines & Department Portals Directory
 * Maps clearance purposes and departments to official government websites
 * where applicants can inspect statutory document requirements.
 */

export const GOV_DEPARTMENT_DIRECTORIES = [
  {
    id: 'nsws_central',
    department: 'Ministry of Commerce & Industry (DPIIT)',
    clearanceName: 'National Single Window System (Know Your Approvals)',
    purpose: 'Pan-India Central & State Clearance Checklist & Document Rules',
    govPortalName: 'NSWS Central Single Window',
    govUrl: 'https://www.nsws.gov.in/know-your-approvals',
    category: 'Universal Gateway',
    requiredDocuments: [
      'Certificate of Incorporation / Partnership Deed / LLP Agreement',
      'PAN Card of Enterprise & Authorized Signatory Aadhaar',
      'Registered Office Address Proof (Electricity bill / Rent deed)',
      'Land Possession / Lease Agreement / Allotment Letter',
      'Project Detailed Project Report (DPR) & Investment Summary',
    ],
  },
  {
    id: 'fire_department',
    department: 'Fire & Emergency Services / Urban Administration',
    clearanceName: 'Fire Safety Clearance (Provisional & Final Fire NOC)',
    purpose: 'Statutory Fire Safety Compliance under State Fire Acts',
    govPortalName: 'MP Fire Services / e-NagarPalika Portal',
    govUrl: 'https://www.mpenagarpalika.gov.in/',
    category: 'Safety & Emergency',
    requiredDocuments: [
      'Certified Architectural Building Layout Plan & Elevations',
      'Fire Fighting Layout Plan (Hydrant, Hose reel & Extinguisher points)',
      'Site Surrounding Plan showing Road Width (>6 meters clear access)',
      'Structural Stability Certificate by Chartered Structural Engineer',
      'Underground / Overhead Water Tank Capacity Certificate',
    ],
  },
  {
    id: 'pollution_control',
    department: 'MP Pollution Control Board (MPPCB / CPCB)',
    clearanceName: 'Consent to Establish (CTE) & Consent to Operate (CTO)',
    purpose: 'Industrial Environmental Clearance under Air & Water Acts',
    govPortalName: 'MPPCB Online Consent Management System (XGN)',
    govUrl: 'https://mppcb.mp.gov.in/',
    category: 'Environment',
    requiredDocuments: [
      'Comprehensive Manufacturing Process Flow Diagram & Raw Material Audit',
      'Effluent Treatment Plant (ETP) / Sewage Treatment (STP) Scheme Drawing',
      'Air Pollution Control Devices (Scrubber / Bag filter / Stack height) Plan',
      'DG Set Acoustic Enclosure & Emission Standard Certificate',
      'Industry Capital Investment Certificate issued by Chartered Accountant',
    ],
  },
  {
    id: 'food_safety',
    department: 'Food Safety and Standards Authority of India (FSSAI)',
    clearanceName: 'FSSAI Manufacturing / Processing License & Registration',
    purpose: 'Statutory Compliance under Food Safety and Standards Act 2006',
    govPortalName: 'FoSCoS - Food Safety Compliance System',
    govUrl: 'https://foscos.fssai.gov.in/',
    category: 'Food Processing',
    requiredDocuments: [
      'Form-B Signed Application with Blueprint / Layout of Food Processing Unit',
      'Complete List of Installed Machinery & Processing Capacity in MT/Day',
      'Water Testing Bacteriological & Chemical Report (as per IS:10500)',
      'Food Safety Management System (FSMS) Plan or ISO 22000 Certificate',
      'Proof of Raw Material Procurement & Food Recall Plan',
    ],
  },
  {
    id: 'factory_inspectorate',
    department: 'Directorate of Industrial Health & Safety (Labour Dept)',
    clearanceName: 'Factory License & Industrial Blueprint Approval',
    purpose: 'Occupational Safety & Worker Welfare under Factories Act 1948',
    govPortalName: 'MP Shram Sewa (Labour Welfare Portal)',
    govUrl: 'https://labour.mp.gov.in/',
    category: 'Labour & Industry',
    requiredDocuments: [
      'Flow Chart & Machine Layout Drawings in Metric Scale',
      'Form-1 Application for Approval of Factory Plans',
      'Manufacturing Process Brief with Material Safety Data Sheets (MSDS)',
      'List of Connected Electrical Load (HP) & Raw Material Inventory',
      'Appointment Order & Qualifications of Safety Officer / First Aiders',
    ],
  },
];

/**
 * Returns matching government portal link based on department or approval title
 */
export const getDepartmentGovtLink = (department = '', approvalName = '') => {
  const d = (department || '').toLowerCase();
  const a = (approvalName || '').toLowerCase();

  if (d.includes('fire') || a.includes('fire')) {
    return GOV_DEPARTMENT_DIRECTORIES.find(g => g.id === 'fire_department');
  }
  if (d.includes('pollution') || d.includes('mppcb') || a.includes('consent') || a.includes('cte') || a.includes('cto')) {
    return GOV_DEPARTMENT_DIRECTORIES.find(g => g.id === 'pollution_control');
  }
  if (d.includes('food') || d.includes('fssai') || a.includes('fssai')) {
    return GOV_DEPARTMENT_DIRECTORIES.find(g => g.id === 'food_safety');
  }
  if (d.includes('labour') || d.includes('factory') || a.includes('factory')) {
    return GOV_DEPARTMENT_DIRECTORIES.find(g => g.id === 'factory_inspectorate');
  }

  return GOV_DEPARTMENT_DIRECTORIES.find(g => g.id === 'nsws_central');
};

/**
 * Direct Industry-to-Government Document List Directory
 * Maps business industry types and sectors to direct official government document list links & PDFs
 */
export const INDUSTRY_GOV_DOCUMENT_MAP = {
  cafe_hotel: {
    sectorKey: 'cafe_hotel',
    sectorName: 'Cafe, Restaurant & Hotel Dining',
    department: 'Food Safety & Standards Authority (FSSAI) & Urban Administration',
    directDocumentListTitle: 'Official FSSAI FoSCoS Food Services, Restaurant & Cafe Checklist (Direct PDF)',
    directDocumentListUrl: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessDocumentList.pdf',
    portalUrl: 'https://foscos.fssai.gov.in/',
    portalName: 'FoSCoS Food Services Portal',
    isDirectPdf: true,
    description: 'Statutory document checklist for Food Service Establishments, Cafes, Restaurants, and Hotels under FSS Act 2006.',
    statutoryDocuments: [
      'FSSAI Form-B Food Service Application & Kitchen Blueprint Layout',
      'Municipal Trade License / Gumasta from e-NagarPalika',
      'Fire Department Provisional / Final Fire NOC (commercial kitchen)',
      'Water Testing Bacteriological & Chemical Potability Report (IS:10500)',
      'Medical Fitness & FoSTaC Food Safety Supervisor Certificates',
      'Commercial LPG Pipe Installation & Safety NOC Certificate',
    ],
  },
  pharmacy: {
    sectorKey: 'pharmacy',
    sectorName: 'Pharmacy, Medical Store & Chemist',
    department: 'State Food & Drugs Administration (FDA) & CDSCO',
    directDocumentListTitle: 'State FDA Retail Drug License & Pharmacy Statutory Checklist',
    directDocumentListUrl: 'https://cdsco.gov.in/opencms/opencms/en/Home/',
    portalUrl: 'https://labour.mp.gov.in/',
    portalName: 'CDSCO & State FDA Portal',
    isDirectPdf: false,
    description: 'Statutory compliance checklist for Retail & Wholesale Pharmacy licenses under Drugs and Cosmetics Rules.',
    statutoryDocuments: [
      'Registered Pharmacist Degree & State Pharmacy Council Registration',
      'Form 19 Application for Grant of Retail Drug Sale License',
      'Premises Ownership Proof / Minimum 10 sq.m Commercial Rental Deed',
      'Refrigerator & Cold Chain Invoice with Temperature Calibration Log',
      'Blueprint of Pharmacy Premises showing Storage & Dispensing Area',
      'Shops and Commercial Establishments Registration (Gumasta)',
    ],
  },
  gym_fitness: {
    sectorKey: 'gym_fitness',
    sectorName: 'Gym, Fitness Center & Health Club',
    department: 'Urban Administration & Directorate of Sports & Labour',
    directDocumentListTitle: 'Municipal Commercial Gymnasium & Fitness Center Guidelines',
    directDocumentListUrl: 'https://www.mpenagarpalika.gov.in/',
    portalUrl: 'https://labour.mp.gov.in/',
    portalName: 'e-NagarPalika & MP Labour',
    isDirectPdf: false,
    description: 'Statutory clearances for commercial gyms, health clubs, and indoor athletic facilities.',
    statutoryDocuments: [
      'Commercial Building Occupancy Certificate / Lease Agreement',
      'Certified Structural Stability Certificate (Floor Load for Heavy Free Weights)',
      'Fire Safety Clearance & Emergency Exit / Evacuation Route Drawing',
      'Shops & Commercial Establishments Registration Certificate (Gumasta)',
      'Certified CPR / First Aid Trainers Certificate & AED Kit Protocol',
      'Soundproofing & Electrical Load Sanction Letter',
    ],
  },
  food_processing: {
    sectorKey: 'food_processing',
    sectorName: 'Food Processing & Industrial Food Manufacturing',
    department: 'Food Safety and Standards Authority of India (FSSAI)',
    directDocumentListTitle: 'Official FSSAI FoSCoS Kind of Business Document List (Direct PDF)',
    directDocumentListUrl: 'https://foscos.fssai.gov.in/assets/docs/KindofBusinessDocumentList.pdf',
    portalUrl: 'https://foscos.fssai.gov.in/',
    portalName: 'FoSCoS Central Portal',
    isDirectPdf: true,
    description: 'Direct official statutory document list published by FSSAI for food manufacturing, packaging, and processing enterprises.',
    statutoryDocuments: [
      'Form-B Signed Application with Blueprint / Unit Layout',
      'Complete List of Installed Machinery & Horsepower (HP)',
      'Water Testing Bacteriological & Chemical Report (IS:10500 certified)',
      'Food Safety Management System (FSMS) Plan or ISO 22000 Certificate',
      'Proof of Raw Material Procurement & Food Recall Plan',
      'Consent to Establish (CTE) from State Pollution Control Board',
    ],
  },
  manufacturing: {
    sectorKey: 'manufacturing',
    sectorName: 'General Manufacturing & Industrial Engineering',
    department: 'Directorate of Industrial Health & Safety (DIHS) & MPPCB',
    directDocumentListTitle: 'MP DIHS Factories Act Machine Layout & Approval Guidelines',
    directDocumentListUrl: 'https://labour.mp.gov.in/',
    portalUrl: 'https://mppcb.mp.gov.in/',
    portalName: 'MP Shram Sewa Portal',
    isDirectPdf: false,
    description: 'Official statutory checklist for factory blueprint approval, machine load, and environmental clearance.',
    statutoryDocuments: [
      'Flow Chart & Machine Layout Drawings in Metric Scale',
      'Form-1 Application for Approval of Factory Plans',
      'Manufacturing Process Brief with Material Safety Data Sheets (MSDS)',
      'List of Connected Electrical Load (HP) & Raw Material Inventory',
      'Consent to Establish (CTE) under Water & Air Acts',
      'Structural Stability Certificate by Chartered Engineer',
    ],
  },
  clinic: {
    sectorKey: 'clinic',
    sectorName: 'Clinic, Healthcare & Diagnostic Center',
    department: 'State Medical Directorate & MP Pollution Control Board',
    directDocumentListTitle: 'Clinical Establishments Act & Bio-Medical Waste Guidelines',
    directDocumentListUrl: 'https://mppcb.mp.gov.in/',
    portalUrl: 'https://mppcb.mp.gov.in/',
    portalName: 'MPPCB Bio-Medical Consent Portal',
    isDirectPdf: false,
    description: 'Statutory registration and bio-medical waste authorization for healthcare clinics and diagnostics.',
    statutoryDocuments: [
      'Registration under Clinical Establishments (Registration and Regulation) Act',
      'Medical Practitioner / Doctor Registration Degree (MCI / State Council)',
      'MPPCB Bio-Medical Waste (BMW) Management Agreement with Authorized Operator',
      'Radiation Safety & AERB NOC (for X-ray / Diagnostic Radiology Units)',
      'Fire Safety NOC & Clinic Emergency Evacuation Layout Plan',
      'Commercial Premises Lease & Biomedical Disinfection Protocol',
    ],
  },
  pharma: {
    sectorKey: 'pharma',
    sectorName: 'Pharmaceuticals & Drugs Manufacturing',
    department: 'Central Drugs Standard Control Organisation (CDSCO)',
    directDocumentListTitle: 'CDSCO Drug Manufacturing Statutory Guidelines & Checklist',
    directDocumentListUrl: 'https://cdsco.gov.in/opencms/opencms/en/Home/',
    portalUrl: 'https://cdsco.gov.in/',
    portalName: 'CDSCO National Drugs Portal',
    isDirectPdf: false,
    description: 'Statutory document checklist for manufacturing licenses under Drugs & Cosmetics Rules and WHO-GMP guidelines.',
    statutoryDocuments: [
      'Site Master File (SMF) as per WHO-GMP specifications',
      'HVAC & Cleanroom Air Handling Validation Report',
      'List of Technical Personnel with Pharmacy & Chemistry qualifications',
      'Machinery Layout & Water Purification (WFI / DM Water) Schematic',
      'MPPCB Hazardous Waste Authorization & CTE Red Category',
      'Fire Safety NOC for Chemical Storage Facilities',
    ],
  },
  textile: {
    sectorKey: 'textile',
    sectorName: 'Textiles & Garment Manufacturing',
    department: 'MP Industrial Development & MP Pollution Control Board',
    directDocumentListTitle: 'MPIDC & MPPCB Textile Clearance Document Guidelines',
    directDocumentListUrl: 'https://invest.mp.gov.in/',
    portalUrl: 'https://mppcb.mp.gov.in/',
    portalName: 'Invest MP & MPPCB XGN',
    isDirectPdf: false,
    description: 'Statutory document requirements for spinning, weaving, garmenting, and effluent management.',
    statutoryDocuments: [
      'Effluent Treatment Plant (ETP) Zero Liquid Discharge (ZLD) Scheme Drawing',
      'Land Possession / Lease Deed in Industrial Textile Park',
      'High Tension (HT) Power Sanction Letter from Electricity Board',
      'Factory Building Blueprint with Worker Safety & Ventilation Plan',
      'Air Pollution Control Plan for Boiler & Steam Turbines',
      'Fire Fighting Hydrant System Layout',
    ],
  },
  it_ites: {
    sectorKey: 'it_ites',
    sectorName: 'IT / ITeS & Software Services',
    department: 'Software Technology Parks of India (STPI / MeitY)',
    directDocumentListTitle: 'STPI IT Units & Software Registration Statutory Checklist',
    directDocumentListUrl: 'https://www.stpi.in/',
    portalUrl: 'https://labour.mp.gov.in/',
    portalName: 'STPI National Portal',
    isDirectPdf: false,
    description: 'Statutory compliance and registration checklist for IT software development and service enterprises.',
    statutoryDocuments: [
      'Certificate of Incorporation, MOA and AOA',
      'Registered Office Lease / Commercial Rental Agreement',
      'Shops and Commercial Establishments Act Registration',
      'Fire Safety NOC for Commercial High-rise Facility',
      'Data Protection & Cyber Security Compliance Self-Declaration',
      'Goods and Services Tax (GST) & Professional Tax Registration',
    ],
  },
  shop: {
    sectorKey: 'shop',
    sectorName: 'Retail Store, Shop & Commercial Trade',
    department: 'Labour Department & Urban Municipal Corporation',
    directDocumentListTitle: 'Shops & Commercial Establishments Registration (Gumasta) Checklist',
    directDocumentListUrl: 'https://labour.mp.gov.in/',
    portalUrl: 'https://labour.mp.gov.in/',
    portalName: 'MP Shram Sewa Portal',
    isDirectPdf: false,
    description: 'Statutory registration under the Shops and Commercial Establishments Act for retail businesses.',
    statutoryDocuments: [
      'Commercial Premises Lease Agreement or Property Tax Receipt',
      'Shops & Commercial Establishments Act Form-A Application',
      'PAN Card of Business Owner & Aadhaar of Authorized Signatory',
      'Signboard Photo in Local State Language',
      'Goods & Services Tax (GST) Registration Certificate',
    ],
  },
  agriculture: {
    sectorKey: 'agriculture',
    sectorName: 'Agriculture, Warehousing & Agro-Logistics',
    department: 'Agricultural Products Export Authority (APEDA) & WDRA',
    directDocumentListTitle: 'APEDA & WDRA Statutory Warehouse Registration Checklist',
    directDocumentListUrl: 'https://apeda.gov.in/',
    portalUrl: 'https://wdra.gov.in/',
    portalName: 'APEDA Agri-Export Portal',
    isDirectPdf: false,
    description: 'Document requirements for agricultural cold storage, warehousing, grading, and agro-processing units.',
    statutoryDocuments: [
      'Land Revenue Record (Khasra/Khatauni) / Warehouse Lease Agreement',
      'Chartered Accountant Net Worth & Solvency Certificate',
      'Technical DPR of Cold Storage / Controlled Atmosphere Infrastructure',
      'Mandi Board License / Agricultural Produce Trade Registration',
      'FSSAI Registration for Grain Handling & Storage',
      'Fire Safety Clearance & Lightning Protection Certificate',
    ],
  },
  service: {
    sectorKey: 'service',
    sectorName: 'Service Industry & Professional Services',
    department: 'Labour Department & Municipal Corporation',
    directDocumentListTitle: 'Service Enterprise Registration & Compliance Checklist',
    directDocumentListUrl: 'https://labour.mp.gov.in/',
    portalUrl: 'https://labour.mp.gov.in/',
    portalName: 'MP Shram Sewa Portal',
    isDirectPdf: false,
    description: 'Statutory registration and compliance checklist for service-sector enterprises including consulting, logistics, maintenance, and professional services.',
    statutoryDocuments: [
      'Shops & Commercial Establishments Act Registration (Gumasta License)',
      'Certificate of Incorporation / Partnership Deed / Proprietorship Declaration',
      'Goods & Services Tax (GST) Registration Certificate',
      'PAN Card of Business & Aadhaar of Authorized Signatory',
      'Professional Tax Registration Certificate',
      'Fire Safety NOC for Commercial Premises',
    ],
  },
};

/**
 * Returns direct document list details for any given sector or business type
 */
export const getIndustryDocumentList = (sectorOrBusiness = '') => {
  if (!sectorOrBusiness || !sectorOrBusiness.trim()) {
    return null;
  }

  const s = sectorOrBusiness.toLowerCase().trim();

  // 1. Cafe, Restaurant, Hotel, Bakery, Dhaba
  if (
    s.includes('cafe') ||
    s.includes('restaurant') ||
    s.includes('hotel') ||
    s.includes('bakery') ||
    s.includes('dhaba')
  ) {
    return INDUSTRY_GOV_DOCUMENT_MAP.cafe_hotel;
  }

  // 2. Pharmacy / Medical Store / Chemist
  if (
    s.includes('pharmacy') ||
    s.includes('chemist') ||
    s.includes('medical_store')
  ) {
    return INDUSTRY_GOV_DOCUMENT_MAP.pharmacy;
  }

  // 3. Gym & Fitness Center
  if (
    s.includes('gym') ||
    s.includes('fitness') ||
    s.includes('health_club')
  ) {
    return INDUSTRY_GOV_DOCUMENT_MAP.gym_fitness;
  }

  // 4. Clinic / Healthcare
  if (s.includes('clinic') || s.includes('hospital') || s.includes('healthcare') || s.includes('diagnostic')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.clinic;
  }

  // 5. Retail Shop / Store
  if (s.includes('shop') || s.includes('retail') || s.includes('store') || s.includes('salon')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.shop;
  }

  // 6. Food Processing / Manufacturing
  if (s.includes('food') || s.includes('food_processing')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.food_processing;
  }

  // 7. Pharmaceuticals (Manufacturing)
  if (s.includes('pharma') || s.includes('drug') || s.includes('medicine')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.pharma;
  }

  // 8. Textiles
  if (s.includes('textile') || s.includes('garment') || s.includes('cloth') || s.includes('weaving')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.textile;
  }

  // 9. IT / ITeS
  if (
    s.includes('it') ||
    s.includes('software') ||
    s.includes('tech') ||
    s.includes('ites') ||
    s.includes('office')
  ) {
    return INDUSTRY_GOV_DOCUMENT_MAP.it_ites;
  }

  // 10. Agriculture
  if (
    s.includes('agri') ||
    s.includes('farm') ||
    s.includes('warehous') ||
    s.includes('crop')
  ) {
    return INDUSTRY_GOV_DOCUMENT_MAP.agriculture;
  }

  // 11. Manufacturing
  if (s.includes('manufactur') || s.includes('factory') || s.includes('industry')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.manufacturing;
  }

  // 12. Service
  if (s.includes('service') || s.includes('consult') || s.includes('logistics') || s.includes('maintenance')) {
    return INDUSTRY_GOV_DOCUMENT_MAP.service;
  }

  return INDUSTRY_GOV_DOCUMENT_MAP.manufacturing;
};


