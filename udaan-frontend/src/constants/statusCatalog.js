// Status catalog — mirrors backend enums exactly (frontend_status_catalog.md).
// Never change the `value` fields; only labels/styles for presentation.

export const APPLICATION_STATUS = {
  submitted: { label: 'Submitted', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'file' },
  auto_approved: { label: 'Auto-Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: 'zap', final: true },
  pending_review: { label: 'Under Officer Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'eye' },
  pending_inspection: { label: 'Pending Inspection', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'search' },
  approved: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: 'check', final: true },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: 'x', final: true },
};

export const APPLICATION_STATUS_VALUES = Object.keys(APPLICATION_STATUS);
export const FINAL_APPLICATION_STATUSES = ['approved', 'auto_approved', 'rejected'];

export const RISK_LEVEL = {
  low: { label: 'Low', color: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', color: 'bg-red-50 text-red-700 border-red-200' },
};

export const DOCUMENT_STATUS = {
  pending: { label: 'Pending Verification', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'hourglass' },
  verified: { label: 'Verified', color: 'bg-green-50 text-green-700 border-green-200', icon: 'badgecheck' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: 'filex' },
};

export const INSPECTION_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'calendar' },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200', icon: 'check' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: 'ban' },
};

export const INSPECTION_RESULT = {
  pass: { label: 'Passed', color: 'bg-green-50 text-green-700 border-green-200' },
  fail: { label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' },
  conditional: { label: 'Conditional', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const GRIEVANCE_STATUS = {
  open: { label: 'Open', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  escalated: { label: 'Escalated', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  resolved: { label: 'Resolved', color: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const GRIEVANCE_PRIORITY = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', color: 'bg-red-50 text-red-700 border-red-200' },
};

export const STAGE = {
  pre_registration: 'Pre-registration',
  registered_not_operational: 'Registered, not yet operational',
  operational_less_1: 'Operational (<1 year)',
  operational_1_3: 'Operational (1-3 years)',
  operational_more_3: 'Operational (>3 years)',
};

export const NOTIFICATION_TYPE = {
  sla_warning: { label: 'SLA Warning' },
  sla_breach: { label: 'SLA Breached' },
  grievance_update: { label: 'Grievance Update' },
  application_update: { label: 'Application Update' },
  scheme_recommendation: { label: 'Scheme Recommendation' },
};

// Seed data values (src/seed/seed.js) — used as select options, not enums.
export const SECTOR_OPTIONS = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'food_processing', label: 'Food Processing' },
  { value: 'it_ites', label: 'IT/ITeS' },
  { value: 'textile', label: 'Textile' },
  { value: 'pharma', label: 'Pharma' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'service', label: 'Service' },
];

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'cafe', label: 'Cafe' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'shop', label: 'Shop / Retail Store' },
  { value: 'salon_spa', label: 'Salon & Spa' },
  { value: 'gym_fitness', label: 'Gym & Fitness Center' },
  { value: 'clinic', label: 'Clinic / Healthcare' },
  { value: 'coaching_institute', label: 'Coaching Institute' },
  { value: 'warehouse', label: 'Warehouse / Godown' },
  { value: 'factory', label: 'Factory / Manufacturing Unit' },
  { value: 'office', label: 'Office / IT Services' },
  { value: 'bakery', label: 'Bakery / Sweet Shop' },
  { value: 'dhaba', label: 'Dhaba / Food Stall' },
  { value: 'pharmacy', label: 'Pharmacy / Medical Store' },
  { value: 'petrol_pump', label: 'Petrol Pump / Gas Station' },
  { value: 'other', label: 'Other' },
];

export const STAGE_OPTIONS = Object.entries(STAGE).map(([value, label]) => ({ value, label }));

export const STATE_OPTIONS = [{ value: 'Madhya Pradesh', label: 'Madhya Pradesh' }];

