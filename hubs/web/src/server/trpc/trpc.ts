import { initTRPC, TRPCError } from '@trpc/server'
import type { TRPCContext } from './context'

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    }
  },
})

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

// Protected procedure (requires any authenticated session)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  })
})

// Teacher procedure (requires TEACHER, ADMIN, or ROOT role)
export const teacherProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const allowedRoles = ['TEACHER', 'ADMIN', 'ROOT']
  if (!ctx.user.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires instructor or mentor privileges',
    })
  }
  return next({ ctx })
})

// Admin procedure (requires ADMIN or ROOT role)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const allowedRoles = ['ADMIN', 'ROOT']
  if (!ctx.user.role || !allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires administrator privileges',
    })
  }
  return next({ ctx })
})
