import { z } from 'zod';

/**
 * Reservation Creation/Update Schema
 */
export const reservationSchema = z.object({
  customerName: z.string().min(2, 'Customer name is too short'),
  phoneNumber: z.string().regex(/^0[689]\d{8}$/, 'Invalid Thai phone number format'),
  address: z.string().min(5, 'Address is too short'),
  productCode: z.string().min(1, 'Product code is required'),
  notes: z.string().optional(),
});

/**
 * User Creation/Update Schema
 */
export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['ADMIN', 'USER']),
  active: z.boolean().default(true),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Public Search Schema
 */
export const searchSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
});
