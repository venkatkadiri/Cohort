import { createServerFn } from '@tanstack/react-start'
import { createEventTypeSchema, updateEventTypeSchema } from '../../dtos/event-type.dto'
import { graphqlApi } from '../graphql/client'

export const listEventTypesFn = createServerFn({ method: 'GET' })
  .validator((hostId: number) => hostId)
  .handler(async ({ data: hostId }) => {
    return graphqlApi.listEventTypes(hostId)
  })

export const getEventTypeByIdFn = createServerFn({ method: 'GET' })
  .validator((data: { hostId: number; id: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.getEventTypeById(data.id)
  })

export const getEventTypeForHostBySlugFn = createServerFn({ method: 'GET' })
  .validator((data: { hostId: number; slug: string }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.getEventTypeBySlug(data.hostId, data.slug)
  })

export const createEventTypeFn = createServerFn({ method: 'POST' })
  .validator((data: { hostId: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = createEventTypeSchema.parse(data.body)
    return graphqlApi.createEventType({ hostId: data.hostId, ...body })
  })

export const updateEventTypeFn = createServerFn({ method: 'POST' })
  .validator((data: { hostId: number; id: number; body: unknown }) => data)
  .handler(async ({ data }) => {
    const body = updateEventTypeSchema.parse(data.body)
    return graphqlApi.updateEventType({ id: data.id, hostId: data.hostId, ...body })
  })

export const deleteEventTypeFn = createServerFn({ method: 'POST' })
  .validator((data: { hostId: number; id: number }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.deleteEventType(data.id, data.hostId)
  })

export const getPublicEventTypeFn = createServerFn({ method: 'GET' })
  .validator((data: { hostId: number; slug: string }) => data)
  .handler(async ({ data }) => {
    return graphqlApi.getPublicEventType(data.hostId, data.slug)
  })