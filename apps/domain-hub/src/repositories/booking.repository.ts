import { prisma } from '../db/prisma.js'

export class BookingRepository {
  async findByHostId(hostId: number) {
    return prisma.booking.findMany({
      where: { hostId },
      include: {
        eventType: true,
        host: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
        host: true,
        slot: true,
      },
    })
  }

  async findActiveBookingsInRange(hostId: number, from: Date, to: Date) {
    return prisma.booking.findMany({
      where: {
        hostId,
        status: { not: 'CANCELLED' },
        slot: {
          startAt: { lte: to },
          endAt: { gte: from },
        },
      },
      include: {
        slot: true,
      },
    })
  }

  async create(data: {
    hostId: number
    eventTypeId: number
    slotId: string
    inviteeName: string
    inviteeEmail: string
    inviteeNotes?: string | null
    meetLink?: string | null
    calendarEventId?: string | null
  }) {
    return prisma.$transaction(async (tx) => {
      // Mark slot as BOOKED
      await tx.slot.update({
        where: { id: data.slotId },
        data: { status: 'BOOKED' },
      })

      return tx.booking.create({
        data: {
          hostId: data.hostId,
          eventTypeId: data.eventTypeId,
          slotId: data.slotId,
          inviteeName: data.inviteeName,
          inviteeEmail: data.inviteeEmail,
          inviteeNotes: data.inviteeNotes,
          status: 'CONFIRMED',
          meetLink: data.meetLink || `https://meet.jit.si/cohort-${data.slotId}`,
          calendarEventId: data.calendarEventId,
        },
        include: {
          eventType: true,
          host: true,
          slot: true,
        },
      })
    })
  }

  async cancel(id: number) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
      })
      if (!booking) {
        throw new Error('Booking not found')
      }

      // Free the slot
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: 'AVAILABLE' },
      })

      return tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          eventType: true,
          host: true,
          slot: true,
        },
      })
    })
  }
}

export const bookingRepository = new BookingRepository()
