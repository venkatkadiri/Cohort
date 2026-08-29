import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1).max(100).optional(),
})

export const updateUserSchema = z
  .object({
    email: z.email('Invalid email address').optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
    slug: z.string().min(1).max(100).optional(),
    timezone: z.string().min(1).max(64).optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined || data.slug !== undefined || data.timezone !== undefined, {
    message: 'At least one field must be provided',
  })

export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>