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
});
