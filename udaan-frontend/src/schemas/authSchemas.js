import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter (A-Z)')
    .regex(/[a-z]/, 'Must include at least one lowercase letter (a-z)')
    .regex(/[0-9]/, 'Must include at least one numeric digit (0-9)')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must include at least one special character (!@#$%^&*...)'),
  role: z.enum(['applicant', 'officer', 'inspector']).default('applicant'),
  department: z.string().optional(),
}).refine(data => {
  if ((data.role === 'officer' || data.role === 'inspector') && !data.department) {
    return false;
  }
  return true;
}, {
  message: 'Department is required for officers and inspectors',
  path: ['department'],
});
