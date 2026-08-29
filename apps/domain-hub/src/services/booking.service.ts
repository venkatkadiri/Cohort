import { bookingRepository } from '../repositories/booking.repository.js'
import { slotRepository } from '../repositories/slot.repository.js'
import { eventTypeRepository } from '../repositories/event-type.repository.js'
import { ApiError } from '../utils/errors.js'

export class BookingService {
  async listBookings(hostId: number) {
    const list = await bookingRepository.findByHostId(hostId)
    return list.map((b) => ({
      id: b.id,
      hostId: b.hostId,
      eventTypeId: b.eventTypeId,
      slotId: b.slotId,
      inviteeName: b.inviteeName,
      inviteeEmail: b.inviteeEmail,
      inviteeNotes: b.inviteeNotes,
      status: b.status,
      meetLink: b.meetLink,
      calendarEventId: b.calendarEventId,
      cancelledAt: b.cancelledAt?.toISOString() || null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      slot: b.slot
        ? {
            id: b.slot.id,
            hostId: b.slot.hostId,
            eventTypeId: b.slot.eventTypeId,
            startAt: b.slot.startAt.toISOString(),
            endAt: b.slot.endAt.toISOString(),
            status: b.slot.status,
            createdAt: b.slot.createdAt.toISOString(),
            updatedAt: b.slot.updatedAt.toISOString(),
          }
        : null,
      eventType: b.eventType
        ? {
            id: b.eventType.id,
            hostId: b.eventType.hostId,
            title: b.eventType.title,
            slug: b.eventType.slug,
            durationMinutes: b.eventType.durationMinutes,
            isActive: b.eventType.isActive,
            locationType: b.eventType.locationType,
            locationValue: b.eventType.locationValue,
            bufferBeforeMinutes: b.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: b.eventType.bufferAfterMinutes,
            createdAt: b.eventType.createdAt.toISOString(),
            updatedAt: b.eventType.updatedAt.toISOString(),
          }
        : null,
      host: b.host
        ? {
            id: b.host.id,
            email: b.host.email,
            name: b.host.name,
            slug: b.host.slug,
            timezone: b.host.timezone,
            createdAt: b.host.createdAt.toISOString(),
            updatedAt: b.host.updatedAt.toISOString(),
          }
        : null,
    }))
  }

  async getBookingById(id: number, hostId?: number) {
    const b = await bookingRepository.findById(id)
    if (!b) {
      throw ApiError.notFound(`Booking with id ${id} not found`)
    }
    if (hostId && b.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot access booking ${id}`)
    }
    return {
      id: b.id,
      hostId: b.hostId,
      eventTypeId: b.eventTypeId,
      slotId: b.slotId,
      inviteeName: b.inviteeName,
      inviteeEmail: b.inviteeEmail,
      inviteeNotes: b.inviteeNotes,
      status: b.status,
      meetLink: b.meetLink,
      calendarEventId: b.calendarEventId,
      cancelledAt: b.cancelledAt?.toISOString() || null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      slot: b.slot
        ? {
            id: b.slot.id,
            hostId: b.slot.hostId,
            eventTypeId: b.slot.eventTypeId,
            startAt: b.slot.startAt.toISOString(),
            endAt: b.slot.endAt.toISOString(),
            status: b.slot.status,
            createdAt: b.slot.createdAt.toISOString(),
            updatedAt: b.slot.updatedAt.toISOString(),
          }
        : null,
      eventType: b.eventType
        ? {
            id: b.eventType.id,
            hostId: b.eventType.hostId,
            title: b.eventType.title,
            slug: b.eventType.slug,
            durationMinutes: b.eventType.durationMinutes,
            isActive: b.eventType.isActive,
            locationType: b.eventType.locationType,
            locationValue: b.eventType.locationValue,
            bufferBeforeMinutes: b.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: b.eventType.bufferAfterMinutes,
            createdAt: b.eventType.createdAt.toISOString(),
            updatedAt: b.eventType.updatedAt.toISOString(),
          }
        : null,
      host: b.host
        ? {
            id: b.host.id,
            email: b.host.email,
            name: b.host.name,
            slug: b.host.slug,
            timezone: b.host.timezone,
            createdAt: b.host.createdAt.toISOString(),
            updatedAt: b.host.updatedAt.toISOString(),
          }
        : null,
    }
  }

  async createBooking(data: {
    eventTypeId: number
    slotId: string
    inviteeName: string
    inviteeEmail: string
    inviteeNotes?: string | null
  }) {
    const slot = await slotRepository.findById(data.slotId)
    if (!slot) {
      throw ApiError.notFound(`Slot ${data.slotId} not found`)
    }
    if (slot.status !== 'AVAILABLE') {
      throw ApiError.conflict(`Slot ${data.slotId} is already booked or unavailable`)
    }
    if (slot.eventTypeId !== data.eventTypeId) {
      throw ApiError.badRequest(`Slot ${data.slotId} does not belong to event type ${data.eventTypeId}`)
    }

    const booking = await bookingRepository.create({
      hostId: slot.hostId,
      eventTypeId: data.eventTypeId,
      slotId: data.slotId,
      inviteeName: data.inviteeName,
      inviteeEmail: data.inviteeEmail,
      inviteeNotes: data.inviteeNotes,
    })

    return {
      id: booking.id,
      hostId: booking.hostId,
      eventTypeId: booking.eventTypeId,
      slotId: booking.slotId,
      inviteeName: booking.inviteeName,
      inviteeEmail: booking.inviteeEmail,
      inviteeNotes: booking.inviteeNotes,
      status: booking.status,
      meetLink: booking.meetLink,
      calendarEventId: booking.calendarEventId,
      cancelledAt: booking.cancelledAt?.toISOString() || null,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      slot: {
        id: slot.id,
        hostId: slot.hostId,
        eventTypeId: slot.eventTypeId,
        startAt: slot.startAt.toISOString(),
        endAt: slot.endAt.toISOString(),
        status: 'BOOKED',
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
      },
    }
  }

  async cancelBooking(id: number, hostId: number) {
    const existing = await bookingRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Booking ${id} not found`)
    }
    if (existing.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot cancel booking ${id}`)
    }
    const b = await bookingRepository.cancel(id)
    return {
      id: b.id,
      hostId: b.hostId,
      eventTypeId: b.eventTypeId,
      slotId: b.slotId,
      inviteeName: b.inviteeName,
      inviteeEmail: b.inviteeEmail,
      inviteeNotes: b.inviteeNotes,
      status: b.status,
      meetLink: b.meetLink,
      calendarEventId: b.calendarEventId,
      cancelledAt: b.cancelledAt?.toISOString() || null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }
  }
}

export const bookingService = new BookingService()
