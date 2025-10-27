import { z } from 'zod'

/**
 * Sport types available in the system
 */
export const SPORT_TYPES = [
  'soccer',
  'basketball',
  'tennis',
  'football',
  'baseball',
  'volleyball',
  'hockey',
  'cricket',
  'rugby',
  'golf',
] as const

export type SportType = (typeof SPORT_TYPES)[number]

/**
 * Event creation/update schema
 */
export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100, 'Event name must be 100 characters or less'),
  sportType: z.enum(SPORT_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid sport type' }),
  }),
  eventDate: z.date({
    required_error: 'Event date and time is required',
  }),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  venueIds: z.array(z.string().uuid()).min(1, 'At least one venue is required'),
})

export type EventFormData = z.infer<typeof eventSchema>

/**
 * Venue creation schema
 */
export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100, 'Venue name must be 100 characters or less'),
  address: z.string().max(200, 'Address must be 200 characters or less').optional(),
  capacity: z.number().int().positive('Capacity must be a positive number').optional(),
})

export type VenueFormData = z.infer<typeof venueSchema>

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Signup schema
 */
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  organizationName: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be 100 characters or less'),
})

export type SignupFormData = z.infer<typeof signupSchema>

