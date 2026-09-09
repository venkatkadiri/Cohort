import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { FEATURE_REGISTRY, DEFAULT_ROLE_FLAGS } from '../../../context/ConfigContext'
import { paginateWithCursor } from '../../../utils/pagination'

export const configRouter = router({
  getFeatures: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).default(20).optional(),
          cursor: z.string().nullish(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const items = FEATURE_REGISTRY.map((f) => ({
        id: f.key,
        ...f,
      }))
      return paginateWithCursor(items, input?.limit ?? 20, input?.cursor)
    }),

  getDefaultRoleFlags: publicProcedure.query(async () => {
    return DEFAULT_ROLE_FLAGS
  }),

  getRoleConfig: publicProcedure
    .input(z.object({ role: z.enum(['ROOT', 'ADMIN', 'TEACHER', 'STUDENT']) }))
    .query(async ({ input }) => {
      const flags = DEFAULT_ROLE_FLAGS[input.role] || {}
      return {
        role: input.role,
        features: flags,
      }
    }),

  toggleFeature: adminProcedure
    .input(
      z.object({
        key: z.string(),
        role: z.enum(['ROOT', 'ADMIN', 'TEACHER', 'STUDENT']),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        key: input.key,
        role: input.role,
        enabled: input.enabled,
        updatedAt: new Date().toISOString(),
      }
    }),

  resetDefaults: adminProcedure.mutation(async () => {
    return {
      success: true,
      defaults: DEFAULT_ROLE_FLAGS,
    }
  }),
})
