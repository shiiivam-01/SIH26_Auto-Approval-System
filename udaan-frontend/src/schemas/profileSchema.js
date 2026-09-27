import { z } from 'zod';

// Mirrors backend POST /api/applicant/profile validation exactly.
// Required: business_name, sector, state, investment_amount, employee_count.
export const profileSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  department: z.string().min(1, 'Department is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().optional().or(z.literal('')),
  nic_code: z.string().optional().or(z.literal('')),
  investment_amount: z.coerce.number({ invalid_type_error: 'Investment amount must be a number' })
    .min(0, 'Investment amount must be 0 or more'),
  employee_count: z.coerce.number({ invalid_type_error: 'Employee count must be a number' })
    .int('Employee count must be a whole number')
    .min(0, 'Employee count must be 0 or more'),
  stage: z.string().min(1, 'Business stage is required'),
  
  // New fields - all optional for flexible form progression
  date_of_establishment: z.string().optional().or(z.literal('')),
  registration_number: z.string().optional().or(z.literal('')),
  udyam_registration_number: z.string().optional().or(z.literal('')),
  
  sub_sector: z.string().optional().or(z.literal('')),
  business_activity: z.string().optional().or(z.literal('')),
  products_services: z.string().optional().or(z.literal('')),
  is_export_business: z.string().optional().or(z.literal('')),
  
  enterprise_type: z.string().optional().or(z.literal('')),
  annual_turnover: z.coerce.number().optional().or(z.literal('')),
  existing_loan: z.string().optional().or(z.literal('')),
  required_investment_amount: z.coerce.number().optional().or(z.literal('')),
  
  city_town_village: z.string().optional().or(z.literal('')),
  pin_code: z.string().optional().or(z.literal('')),
  area_type: z.string().optional().or(z.literal('')),
  is_sez: z.string().optional().or(z.literal('')),
  
  owner_name: z.string().optional().or(z.literal('')),
  owner_age: z.coerce.number().optional().or(z.literal('')),
  owner_gender: z.string().optional().or(z.literal('')),
  owner_nationality: z.string().optional().or(z.literal('')),
  employment_status: z.string().optional().or(z.literal('')),
  family_income: z.coerce.number().optional().or(z.literal('')),
  social_category: z.string().optional().or(z.literal('')),
  minority_status: z.string().optional().or(z.literal('')),
  disability_status: z.string().optional().or(z.literal('')),
});
