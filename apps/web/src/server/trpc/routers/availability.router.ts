import { z } from 'zod'
import { router, publicProcedure, teacherProcedure } from '../trpc'
import { graphqlApi } from '../../graphql/client'
import {
  createAvailabilityRuleSchema,
  updateAvailabilityRuleSchema,
  createAvailabilityExceptionSchema,
  updateAvailabilityExceptionSchema,
} from '../../../dtos/availability.dto'

export const availabilityRouter = router({
  listRules: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return graphqlApi.listRules(input.userId)
    }),

  createRule: teacherProcedure
    .input(
      z.object({
        userId: z.number(),
        body: createAvailabilityRuleSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.createRule({ userId: input.userId, ...input.body })
    }),

  updateRule: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
        body: updateAvailabilityRuleSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.updateRule({ id: input.id, userId: input.userId, ...input.body })
    }),

  deleteRule: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.deleteRule(input.id, input.userId)
    }),

  listExceptions: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return graphqlApi.listExceptions(input.userId)
    }),

  createException: teacherProcedure
    .input(
      z.object({
        userId: z.number(),
        body: createAvailabilityExceptionSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.createException({ userId: input.userId, ...input.body })
    }),

  updateException: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
        body: updateAvailabilityExceptionSchema,
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.updateException({ id: input.id, userId: input.userId, ...input.body })
    }),

  deleteException: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return graphqlApi.deleteException(input.id, input.userId)
    }),
})
