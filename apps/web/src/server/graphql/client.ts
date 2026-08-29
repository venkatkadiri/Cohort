import { logger, generateCorrelationId } from '../../lib/logger'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://127.0.0.1:8000/graphql'
const gqlLogger = logger.child({ module: 'GraphQL-Client' })

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: Array<string | number>
    extensions?: Record<string, unknown>
  }>
}

export async function graphqlRequest<TData = any, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  operationName?: string
): Promise<TData> {
  const reqId = generateCorrelationId()
  const start = performance.now()

  gqlLogger.debug(`-> [GraphQL] ${operationName || 'Anonymous Operation'}`, {
    reqId,
    endpoint: GRAPHQL_ENDPOINT,
    operationName,
    variables,
  })

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': reqId,
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
    })

    const durationMs = Number((performance.now() - start).toFixed(2))

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      gqlLogger.error(`❌ [GraphQL] HTTP ${res.status}`, {
        reqId,
        endpoint: GRAPHQL_ENDPOINT,
        operationName,
        status: res.status,
        durationMs,
        response: text,
      })
      throw new Error(`GraphQL request failed with HTTP ${res.status}: ${text}`)
    }

    const json: GraphQLResponse<TData> = await res.json()

    if (json.errors && json.errors.length > 0) {
      const primaryError = json.errors[0].message
      gqlLogger.error(`❌ [GraphQL Error] ${primaryError}`, {
        reqId,
        endpoint: GRAPHQL_ENDPOINT,
        operationName,
        durationMs,
        errors: json.errors,
      })
      throw new Error(primaryError)
    }

    gqlLogger.info(`<- [GraphQL] ${operationName || 'Operation'} OK`, {
      reqId,
      endpoint: GRAPHQL_ENDPOINT,
      operationName,
      durationMs,
    })

    return json.data as TData
  } catch (err: any) {
    const durationMs = Number((performance.now() - start).toFixed(2))
    gqlLogger.error(`❌ [GraphQL Exception] ${err.message}`, {
      reqId,
      endpoint: GRAPHQL_ENDPOINT,
      operationName,
      durationMs,
      error: err.message,
    })
    throw err
  }
}

// Typed GraphQL Client API for Server Functions
export const graphqlApi = {
  // Users
  listUsers: async () => {
    const data = await graphqlRequest<{ users: any[] }>(
      `query ListUsers {
        users {
          id
          email
          name
          slug
          timezone
          createdAt
          updatedAt
          count {
            eventTypes
            bookings
          }
        }
      }`,
      undefined,
      'ListUsers'
    )
    return data.users
  },

  getUserById: async (id: number) => {
    const data = await graphqlRequest<{ userById: any }>(
      `query GetUserById($id: Int!) {
        userById(id: $id) {
          id
          email
          name
          slug
          timezone
          createdAt
          updatedAt
          count {
            eventTypes
            bookings
          }
        }
      }`,
      { id },
      'GetUserById'
    )
    return data.userById
  },

  getUserBySlug: async (slug: string) => {
    const data = await graphqlRequest<{ userBySlug: any }>(
      `query GetUserBySlug($slug: String!) {
        userBySlug(slug: $slug) {
          id
          email
          name
          slug
          timezone
          createdAt
          updatedAt
          count {
            eventTypes
            bookings
          }
        }
      }`,
      { slug },
      'GetUserBySlug'
    )
    return data.userBySlug
  },

  createUser: async (input: { name: string; email: string; slug?: string; timezone?: string }) => {
    const data = await graphqlRequest<{ createUser: any }>(
      `mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          name
          slug
          timezone
          createdAt
          updatedAt
          count {
            eventTypes
            bookings
          }
        }
      }`,
      { input },
      'CreateUser'
    )
    return data.createUser
  },

  updateUser: async (input: { id: number; name?: string; email?: string; slug?: string; timezone?: string }) => {
    const data = await graphqlRequest<{ updateUser: any }>(
      `mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          email
          name
          slug
          timezone
          createdAt
          updatedAt
          count {
            eventTypes
            bookings
          }
        }
      }`,
      { input },
      'UpdateUser'
    )
    return data.updateUser
  },

  deleteUser: async (id: number) => {
    const data = await graphqlRequest<{ deleteUser: { success: boolean; message: string } }>(
      `mutation DeleteUser($id: Int!) {
        deleteUser(id: $id) {
          success
          message
        }
      }`,
      { id },
      'DeleteUser'
    )
    return data.deleteUser
  },

  // Event Types
  listEventTypes: async (hostId: number) => {
    const data = await graphqlRequest<{ eventTypes: any[] }>(
      `query ListEventTypes($hostId: Int!) {
        eventTypes(hostId: $hostId) {
          id
          hostId
          title
          description
          slug
          durationMinutes
          isActive
          locationType
          locationValue
          bufferBeforeMinutes
          bufferAfterMinutes
          createdAt
          updatedAt
        }
      }`,
      { hostId },
      'ListEventTypes'
    )
    return data.eventTypes
  },

  getEventTypeById: async (id: number) => {
    const data = await graphqlRequest<{ eventTypeById: any }>(
      `query GetEventTypeById($id: Int!) {
        eventTypeById(id: $id) {
          id
          hostId
          title
          description
          slug
          durationMinutes
          isActive
          locationType
          locationValue
          bufferBeforeMinutes
          bufferAfterMinutes
          createdAt
          updatedAt
        }
      }`,
      { id },
      'GetEventTypeById'
    )
    return data.eventTypeById
  },

  getEventTypeBySlug: async (hostId: number, slug: string) => {
    const data = await graphqlRequest<{ eventTypeBySlug: any }>(
      `query GetEventTypeBySlug($hostId: Int!, $slug: String!) {
        eventTypeBySlug(hostId: $hostId, slug: $slug) {
          id
          hostId
          title
          description
          slug
          durationMinutes
          isActive
          locationType
          locationValue
          bufferBeforeMinutes
          bufferAfterMinutes
          createdAt
          updatedAt
        }
      }`,
      { hostId, slug },
      'GetEventTypeBySlug'
    )
    return data.eventTypeBySlug
  },

  getPublicEventType: async (hostId: number, slug: string) => {
    const data = await graphqlRequest<{ publicEventType: { eventType: any; host: any } }>(
      `query GetPublicEventType($hostId: Int!, $slug: String!) {
        publicEventType(hostId: $hostId, slug: $slug) {
          eventType {
            id
            hostId
            title
            description
            slug
            durationMinutes
            isActive
            locationType
            locationValue
            bufferBeforeMinutes
            bufferAfterMinutes
            createdAt
            updatedAt
          }
          host {
            id
            email
            name
            slug
            timezone
            createdAt
            updatedAt
          }
        }
      }`,
      { hostId, slug },
      'GetPublicEventType'
    )
    return data.publicEventType
  },

  createEventType: async (input: {
    hostId: number
    title: string
    description?: string | null
    slug?: string
    durationMinutes: number
    isActive?: boolean
    locationType?: string
    locationValue?: string | null
    bufferBeforeMinutes?: number
    bufferAfterMinutes?: number
  }) => {
    const data = await graphqlRequest<{ createEventType: any }>(
      `mutation CreateEventType($input: CreateEventTypeInput!) {
        createEventType(input: $input) {
          id
          hostId
          title
          description
          slug
          durationMinutes
          isActive
          locationType
          locationValue
          bufferBeforeMinutes
          bufferAfterMinutes
          createdAt
          updatedAt
        }
      }`,
      { input },
      'CreateEventType'
    )
    return data.createEventType
  },

  updateEventType: async (input: {
    id: number
    hostId: number
    title?: string
    description?: string | null
    slug?: string
    durationMinutes?: number
    isActive?: boolean
    locationType?: string
    locationValue?: string | null
    bufferBeforeMinutes?: number
    bufferAfterMinutes?: number
  }) => {
    const data = await graphqlRequest<{ updateEventType: any }>(
      `mutation UpdateEventType($input: UpdateEventTypeInput!) {
        updateEventType(input: $input) {
          id
          hostId
          title
          description
          slug
          durationMinutes
          isActive
          locationType
          locationValue
          bufferBeforeMinutes
          bufferAfterMinutes
          createdAt
          updatedAt
        }
      }`,
      { input },
      'UpdateEventType'
    )
    return data.updateEventType
  },

  deleteEventType: async (id: number, hostId: number) => {
    const data = await graphqlRequest<{ deleteEventType: { success: boolean; message: string } }>(
      `mutation DeleteEventType($id: Int!, $hostId: Int!) {
        deleteEventType(id: $id, hostId: $hostId) {
          success
          message
        }
      }`,
      { id, hostId },
      'DeleteEventType'
    )
    return data.deleteEventType
  },

  // Availability
  listRules: async (userId: number) => {
    const data = await graphqlRequest<{ availabilityRules: any[] }>(
      `query ListAvailabilityRules($userId: Int!) {
        availabilityRules(userId: $userId) {
          id
          userId
          weekday
          startTime
          endTime
          isActive
          timezone
          createdAt
          updatedAt
        }
      }`,
      { userId },
      'ListAvailabilityRules'
    )
    return data.availabilityRules
  },

  createRule: async (input: {
    userId: number
    weekday: number
    startTime: string
    endTime: string
    isActive?: boolean
    timezone?: string
  }) => {
    const data = await graphqlRequest<{ createAvailabilityRule: any }>(
      `mutation CreateAvailabilityRule($input: CreateRuleInput!) {
        createAvailabilityRule(input: $input) {
          id
          userId
          weekday
          startTime
          endTime
          isActive
          timezone
          createdAt
          updatedAt
        }
      }`,
      { input },
      'CreateAvailabilityRule'
    )
    return data.createAvailabilityRule
  },

  updateRule: async (input: {
    id: number
    userId: number
    weekday?: number
    startTime?: string
    endTime?: string
    isActive?: boolean
    timezone?: string
  }) => {
    const data = await graphqlRequest<{ updateAvailabilityRule: any }>(
      `mutation UpdateAvailabilityRule($input: UpdateRuleInput!) {
        updateAvailabilityRule(input: $input) {
          id
          userId
          weekday
          startTime
          endTime
          isActive
          timezone
          createdAt
          updatedAt
        }
      }`,
      { input },
      'UpdateAvailabilityRule'
    )
    return data.updateAvailabilityRule
  },

  deleteRule: async (id: number, userId: number) => {
    const data = await graphqlRequest<{ deleteAvailabilityRule: { success: boolean; message: string } }>(
      `mutation DeleteAvailabilityRule($id: Int!, $userId: Int!) {
        deleteAvailabilityRule(id: $id, userId: $userId) {
          success
          message
        }
      }`,
      { id, userId },
      'DeleteAvailabilityRule'
    )
    return data.deleteAvailabilityRule
  },

  listExceptions: async (userId: number, from?: string, to?: string) => {
    const data = await graphqlRequest<{ availabilityExceptions: any[] }>(
      `query ListAvailabilityExceptions($userId: Int!, $from: String, $to: String) {
        availabilityExceptions(userId: $userId, from: $from, to: $to) {
          id
          userId
          date
          type
          startTime
          endTime
          timezone
          reason
          createdAt
          updatedAt
        }
      }`,
      { userId, from, to },
      'ListAvailabilityExceptions'
    )
    return data.availabilityExceptions
  },

  createException: async (input: {
    userId: number
    date: string
    type: string
    startTime?: string | null
    endTime?: string | null
    timezone?: string
    reason?: string | null
  }) => {
    const data = await graphqlRequest<{ createAvailabilityException: any }>(
      `mutation CreateAvailabilityException($input: CreateExceptionInput!) {
        createAvailabilityException(input: $input) {
          id
          userId
          date
          type
          startTime
          endTime
          timezone
          reason
          createdAt
          updatedAt
        }
      }`,
      { input },
      'CreateAvailabilityException'
    )
    return data.createAvailabilityException
  },

  updateException: async (input: {
    id: number
    userId: number
    date?: string
    type?: string
    startTime?: string | null
    endTime?: string | null
    timezone?: string
    reason?: string | null
  }) => {
    const data = await graphqlRequest<{ updateAvailabilityException: any }>(
      `mutation UpdateAvailabilityException($input: UpdateExceptionInput!) {
        updateAvailabilityException(input: $input) {
          id
          userId
          date
          type
          startTime
          endTime
          timezone
          reason
          createdAt
          updatedAt
        }
      }`,
      { input },
      'UpdateAvailabilityException'
    )
    return data.updateAvailabilityException
  },

  deleteException: async (id: number, userId: number) => {
    const data = await graphqlRequest<{ deleteAvailabilityException: { success: boolean; message: string } }>(
      `mutation DeleteAvailabilityException($id: Int!, $userId: Int!) {
        deleteAvailabilityException(id: $id, userId: $userId) {
          success
          message
        }
      }`,
      { id, userId },
      'DeleteAvailabilityException'
    )
    return data.deleteAvailabilityException
  },

  // Slots
  getAvailableSlots: async (eventTypeId: number, date: string) => {
    const data = await graphqlRequest<{ availableSlots: any[] }>(
      `query GetAvailableSlots($eventTypeId: Int!, $date: String!) {
        availableSlots(eventTypeId: $eventTypeId, date: $date) {
          id
          hostId
          eventTypeId
          startAt
          endAt
          status
          createdAt
          updatedAt
          eventType {
            id
            title
            slug
            durationMinutes
          }
        }
      }`,
      { eventTypeId, date },
      'GetAvailableSlots'
    )
    return data.availableSlots
  },

  listSlotsForHost: async (hostId: number, from?: string, to?: string) => {
    const data = await graphqlRequest<{ slotsForHost: any[] }>(
      `query ListSlotsForHost($hostId: Int!, $from: String, $to: String) {
        slotsForHost(hostId: $hostId, from: $from, to: $to) {
          id
          hostId
          eventTypeId
          startAt
          endAt
          status
          createdAt
          updatedAt
          eventType {
            id
            title
            slug
            durationMinutes
          }
        }
      }`,
      { hostId, from, to },
      'ListSlotsForHost'
    )
    return data.slotsForHost
  },

  createSlot: async (input: { hostId: number; eventTypeId: number; startAt: string; endAt: string }) => {
    const data = await graphqlRequest<{ createSlot: any }>(
      `mutation CreateSlot($input: CreateSlotInput!) {
        createSlot(input: $input) {
          id
          hostId
          eventTypeId
          startAt
          endAt
          status
          createdAt
          updatedAt
        }
      }`,
      { input },
      'CreateSlot'
    )
    return data.createSlot
  },

  updateSlot: async (input: {
    id: string
    hostId: number
    eventTypeId?: number
    startAt?: string
    endAt?: string
    status?: string
  }) => {
    const data = await graphqlRequest<{ updateSlot: any }>(
      `mutation UpdateSlot($input: UpdateSlotInput!) {
        updateSlot(input: $input) {
          id
          hostId
          eventTypeId
          startAt
          endAt
          status
          createdAt
          updatedAt
        }
      }`,
      { input },
      'UpdateSlot'
    )
    return data.updateSlot
  },

  deleteSlot: async (id: string, hostId: number) => {
    const data = await graphqlRequest<{ deleteSlot: { success: boolean; message: string } }>(
      `mutation DeleteSlot($id: String!, $hostId: Int!) {
        deleteSlot(id: $id, hostId: $hostId) {
          success
          message
        }
      }`,
      { id, hostId },
      'DeleteSlot'
    )
    return data.deleteSlot
  },

  regenerateSlots: async (input: { hostId: number; from?: string; to?: string; daysAhead?: number }) => {
    const data = await graphqlRequest<{
      regenerateSlots: { success: boolean; generatedCount: number; message: string }
    }>(
      `mutation RegenerateSlots($input: RegenerateSlotsInput!) {
        regenerateSlots(input: $input) {
          success
          generatedCount
          message
        }
      }`,
      { input },
      'RegenerateSlots'
    )
    return data.regenerateSlots
  },

  // Bookings
  listBookings: async (hostId: number) => {
    const data = await graphqlRequest<{ bookings: any[] }>(
      `query ListBookings($hostId: Int!) {
        bookings(hostId: $hostId) {
          id
          hostId
          eventTypeId
          slotId
          inviteeEmail
          inviteeName
          inviteeNotes
          status
          meetLink
          calendarEventId
          cancelledAt
          createdAt
          updatedAt
          slot {
            id
            startAt
            endAt
            status
          }
          eventType {
            id
            title
            slug
            durationMinutes
            locationType
            locationValue
          }
          host {
            id
            name
            email
            slug
          }
        }
      }`,
      { hostId },
      'ListBookings'
    )
    return data.bookings
  },

  getBookingById: async (id: number, hostId?: number) => {
    const data = await graphqlRequest<{ bookingById: any }>(
      `query GetBookingById($id: Int!, $hostId: Int) {
        bookingById(id: $id, hostId: $hostId) {
          id
          hostId
          eventTypeId
          slotId
          inviteeEmail
          inviteeName
          inviteeNotes
          status
          meetLink
          calendarEventId
          cancelledAt
          createdAt
          updatedAt
          slot {
            id
            startAt
            endAt
            status
          }
          eventType {
            id
            title
            slug
            durationMinutes
          }
          host {
            id
            name
            email
            slug
          }
        }
      }`,
      { id, hostId },
      'GetBookingById'
    )
    return data.bookingById
  },

  createBooking: async (input: {
    eventTypeId: number
    slotId: string
    inviteeName: string
    inviteeEmail: string
    inviteeNotes?: string | null
  }) => {
    const data = await graphqlRequest<{ createBooking: any }>(
      `mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
          id
          hostId
          eventTypeId
          slotId
          inviteeEmail
          inviteeName
          inviteeNotes
          status
          meetLink
          calendarEventId
          cancelledAt
          createdAt
          updatedAt
          slot {
            id
            startAt
            endAt
            status
          }
        }
      }`,
      { input },
      'CreateBooking'
    )
    return data.createBooking
  },

  cancelBooking: async (id: number, hostId: number) => {
    const data = await graphqlRequest<{ cancelBooking: any }>(
      `mutation CancelBooking($id: Int!, $hostId: Int!) {
        cancelBooking(id: $id, hostId: $hostId) {
          id
          hostId
          eventTypeId
          slotId
          inviteeEmail
          inviteeName
          status
          cancelledAt
          createdAt
          updatedAt
        }
      }`,
      { id, hostId },
      'CancelBooking'
    )
    return data.cancelBooking
  },

  // Enrollers & Subscriptions
  createEnroller: async (input: { email: string; name: string; authId?: string }) => {
    const data = await graphqlRequest<{ createEnroller: any }>(
      `mutation CreateEnroller($input: CreateEnrollerInput!) {
        createEnroller(input: $input) {
          id
          email
          name
          authId
          createdAt
          updatedAt
        }
      }`,
      { input },
      'CreateEnroller'
    )
    return data.createEnroller
  },

  subscribe: async (enrollerId: number, eventTypeId: number) => {
    const data = await graphqlRequest<{ subscribe: any }>(
      `mutation Subscribe($enrollerId: Int!, $eventTypeId: Int!) {
        subscribe(enrollerId: $enrollerId, eventTypeId: $eventTypeId) {
          id
          enrollerId
          eventTypeId
          createdAt
          eventType {
            id
            title
            slug
          }
        }
      }`,
      { enrollerId, eventTypeId },
      'Subscribe'
    )
    return data.subscribe
  },

  unsubscribe: async (enrollerId: number, eventTypeId: number) => {
    const data = await graphqlRequest<{ unsubscribe: { success: boolean; message: string } }>(
      `mutation Unsubscribe($enrollerId: Int!, $eventTypeId: Int!) {
        unsubscribe(enrollerId: $enrollerId, eventTypeId: $eventTypeId) {
          success
          message
        }
      }`,
      { enrollerId, eventTypeId },
      'Unsubscribe'
    )
    return data.unsubscribe
  },

  listSubscriptions: async (enrollerId: number) => {
    const data = await graphqlRequest<{ subscriptions: any[] }>(
      `query ListSubscriptions($enrollerId: Int!) {
        subscriptions(enrollerId: $enrollerId) {
          id
          enrollerId
          eventTypeId
          createdAt
          eventType {
            id
            title
            slug
            durationMinutes
            isActive
            host {
              id
              name
              email
              slug
            }
          }
        }
      }`,
      { enrollerId },
      'ListSubscriptions'
    )
    return data.subscriptions
  },

  createSlotRequest: async (enrollerId: number, eventTypeId: number, message?: string) => {
    const data = await graphqlRequest<{ createSlotRequest: any }>(
      `mutation CreateSlotRequest($enrollerId: Int!, $eventTypeId: Int!, $message: String) {
        createSlotRequest(enrollerId: $enrollerId, eventTypeId: $eventTypeId, message: $message) {
          id
          enrollerId
          eventTypeId
          message
          status
          createdAt
          enroller {
            id
            name
            email
          }
          eventType {
            id
            title
            slug
          }
        }
      }`,
      { enrollerId, eventTypeId, message },
      'CreateSlotRequest'
    )
    return data.createSlotRequest
  },

  listSlotRequestsForTeacher: async (teacherUserId: number) => {
    const data = await graphqlRequest<{ slotRequestsForTeacher: any[] }>(
      `query ListSlotRequestsForTeacher($teacherUserId: Int!) {
        slotRequestsForTeacher(teacherUserId: $teacherUserId) {
          id
          enrollerId
          eventTypeId
          message
          status
          createdAt
          enroller {
            id
            name
            email
          }
          eventType {
            id
            title
            slug
          }
        }
      }`,
      { teacherUserId },
      'ListSlotRequestsForTeacher'
    )
    return data.slotRequestsForTeacher
  },
}
