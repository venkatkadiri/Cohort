import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { paginateWithCursor } from '../../../utils/pagination'

const NOTIFICATIONS_STORE = [
  {
    id: 'n-1',
    title: 'Office Hours Dropped!',
    message: 'Ada Lovelace dropped 2 slots for Distributed Systems Review.',
    category: 'DROP_ALERT',
    timestamp: '10m ago',
    read: false,
  },
  {
    id: 'n-2',
    title: 'New Masterclass Published',
    message: 'Netflix-Style HLS Adaptive Streaming Architecture is now live.',
    category: 'LECTURE',
    timestamp: '1h ago',
    read: false,
  },
]

export const notificationsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(20).optional(),
          cursor: z.string().nullish(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return paginateWithCursor(NOTIFICATIONS_STORE, input?.limit ?? 20, input?.cursor)
    }),

  subscribeToDropAlerts: protectedProcedure
    .input(
      z.object({
        teacherId: z.number(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Successfully subscribed to drop alerts for mentor #${input.teacherId}`,
        subscribedAt: new Date().toISOString(),
      }
    }),
})
