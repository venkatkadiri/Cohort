import { z } from 'zod'

export const createBookingSchema = z.object({
  eventTypeId: z.number().int().positive(),
  slotId: z.string().min(1),
  inviteeName: z.string().min(1, 'Name is required').max(200),
  inviteeEmail: z.email('Invalid email address'),
  inviteeNotes: z.string().max(2000).optional(),
})

export type CreateBookingDto = z.infer<typeof createBookingSchema>