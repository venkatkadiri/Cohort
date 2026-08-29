import { createServerFn } from '@tanstack/react-start'
import {
  createAvailabilityExceptionSchema,
  createAvailabilityRuleSchema,
  updateAvailabilityExceptionSchema,
  updateAvailabilityRuleSchema,
} from '../../dtos/availability.dto'
import { graphqlApi } from '../graphql/client'

export const listRulesFn = createServerFn({ method: 'GET' })
  .validator((userId: number) => userId)
  .handler(async ({ data: userId }) => {
    return graphqlApi.listRules(userId)
  })

export const createRuleFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = createAvailabilityRuleSchema.parse(data.body)
    return graphqlApi.createRule({ userId: data.userId, ...body })
  })

export const updateRuleFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; id: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = updateAvailabilityRuleSchema.parse(data.body)
    return graphqlApi.updateRule({ id: data.id, userId: data.userId, ...body })
  })

export const deleteRuleFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; id: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.deleteRule(data.id, data.userId)
  })

export const listExceptionsFn = createServerFn({ method: 'GET' })
  .validator((userId: number) => userId)
  .handler(async ({ data: userId }) => {
    return graphqlApi.listExceptions(userId)
  })

export const createExceptionFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = createAvailabilityExceptionSchema.parse(data.body)
    return graphqlApi.createException({ userId: data.userId, ...body })
  })

export const updateExceptionFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; id: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = updateAvailabilityExceptionSchema.parse(data.body)
    return graphqlApi.updateException({ id: data.id, userId: data.userId, ...body })
  })

export const deleteExceptionFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: number; id: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.deleteException(data.id, data.userId)
  })