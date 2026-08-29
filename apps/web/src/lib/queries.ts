import { queryOptions } from '@tanstack/react-query'
import { listUsers, getUserById } from '../server/functions/users.fn'
import { listEventTypesFn, getPublicEventTypeFn } from '../server/functions/eventTypes.fn'
import { getAvailableSlotsFn, listSlotsFn } from '../server/functions/slots.fn'
import { listBookingsFn } from '../server/functions/bookings.fn'
import {
  listSubscriptionsForEnrollerFn,
  listSlotRequestsForTeacherFn,
} from '../server/functions/enrollers.fn'

// Centralized, type-safe Query Keys Matrix
export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    byId: (id: number) => [...queryKeys.users.all, 'byId', id] as const,
  },
  eventTypes: {
    all: ['eventTypes'] as const,
    byHost: (hostId: number) => [...queryKeys.eventTypes.all, 'host', hostId] as const,
    public: (params: { hostId: number; slug: string }) =>
      [...queryKeys.eventTypes.all, 'public', params] as const,
  },
  slots: {
    all: ['slots'] as const,
    available: (eventTypeId: number, date: string) =>
      [...queryKeys.slots.all, 'available', eventTypeId, date] as const,
    forHost: (hostId: number, from?: string, to?: string) =>
      [...queryKeys.slots.all, 'host', hostId, { from, to }] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    byHost: (hostId: number) => [...queryKeys.bookings.all, 'host', hostId] as const,
  },
  enrollers: {
    all: ['enrollers'] as const,
    subscriptions: (enrollerId: number) =>
      [...queryKeys.enrollers.all, 'subscriptions', enrollerId] as const,
    slotRequests: (teacherUserId: number) =>
      [...queryKeys.enrollers.all, 'slotRequests', teacherUserId] as const,
  },
}

// 1. Users Queries
export const usersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  })

export const userByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: queryKeys.users.byId(id),
    queryFn: () => getUserById({ data: id }),
    enabled: Number.isFinite(id) && id > 0,
  })

// 2. Event Types Queries
export const eventTypesQueryOptions = (hostId: number) =>
  queryOptions({
    queryKey: queryKeys.eventTypes.byHost(hostId),
    queryFn: () => listEventTypesFn({ data: hostId }),
    enabled: Number.isFinite(hostId) && hostId > 0,
  })

export const publicEventTypeQueryOptions = (params: { hostId: number; slug: string }) =>
  queryOptions({
    queryKey: queryKeys.eventTypes.public(params),
    queryFn: () => getPublicEventTypeFn({ data: params }),
    enabled: Number.isFinite(params.hostId) && params.hostId > 0 && Boolean(params.slug),
  })

// 3. Slots Queries
export const availableSlotsQueryOptions = (eventTypeId: number, date: string) =>
  queryOptions({
    queryKey: queryKeys.slots.available(eventTypeId, date),
    queryFn: () => getAvailableSlotsFn({ data: { eventTypeId, date } }),
    enabled: Number.isFinite(eventTypeId) && eventTypeId > 0 && Boolean(date),
  })

export const slotsForHostQueryOptions = (hostId: number, from?: string, to?: string) =>
  queryOptions({
    queryKey: queryKeys.slots.forHost(hostId, from, to),
    queryFn: () => listSlotsFn({ data: { hostId, from, to } }),
    enabled: Number.isFinite(hostId) && hostId > 0,
  })

// 4. Bookings Queries
export const bookingsQueryOptions = (hostId: number) =>
  queryOptions({
    queryKey: queryKeys.bookings.byHost(hostId),
    queryFn: () => listBookingsFn({ data: hostId }),
    enabled: Number.isFinite(hostId) && hostId > 0,
  })

// 5. Enroller & Subscriptions Queries
export const subscriptionsQueryOptions = (enrollerId: number) =>
  queryOptions({
    queryKey: queryKeys.enrollers.subscriptions(enrollerId),
    queryFn: () => listSubscriptionsForEnrollerFn({ data: enrollerId }),
    enabled: Number.isFinite(enrollerId) && enrollerId > 0,
  })

export const slotRequestsQueryOptions = (teacherUserId: number) =>
  queryOptions({
    queryKey: queryKeys.enrollers.slotRequests(teacherUserId),
    queryFn: () => listSlotRequestsForTeacherFn({ data: teacherUserId }),
    enabled: Number.isFinite(teacherUserId) && teacherUserId > 0,
  })
