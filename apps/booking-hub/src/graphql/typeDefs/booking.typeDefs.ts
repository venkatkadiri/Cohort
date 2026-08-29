export const bookingTypeDefs = `#graphql
  type PaginatedBookings {
    items: [Booking!]!
    pageInfo: PageInfo!
  }

  type Booking {
    id: Int!
    hostId: Int!
    eventTypeId: Int!
    slotId: String!
    inviteeEmail: String!
    inviteeName: String!
    inviteeNotes: String
    status: String!
    meetLink: String
    calendarEventId: String
    cancelledAt: String
    createdAt: String!
    updatedAt: String!
    slot: Slot
    eventType: EventType
    host: User
  }

  input CreateBookingInput {
    eventTypeId: Int!
    slotId: String!
    inviteeName: String!
    inviteeEmail: String!
    inviteeNotes: String
  }

  extend type Query {
    bookings(hostId: Int!, limit: Int, cursor: String): [Booking!]!
    bookingsPaginated(hostId: Int!, limit: Int, cursor: String): PaginatedBookings!
    bookingById(id: Int!, hostId: Int): Booking
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(id: Int!, hostId: Int!): Booking!
  }
`
