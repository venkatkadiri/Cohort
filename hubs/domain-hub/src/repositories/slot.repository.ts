import { prisma } from '../db/prisma.js'

export class SlotRepository {
  async findAvailableSlotsByDate(eventTypeId: number, dateStart: Date, dateEnd: Date) {
    return prisma.slot.findMany({
      where: {
        eventTypeId,
        status: 'AVAILABLE',
        startAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        eventType: true,
      },
      orderBy: { startAt: 'asc' },
    })
  }

  async findSlotsForHost(hostId: number, from?: Date, to?: Date) {
    const where: any = { hostId }
    if (from || to) {
      where.startAt = {}
      if (from) where.startAt.gte = from
      if (to) where.startAt.lte = to
    }
    return prisma.slot.findMany({
      where,
      include: {
        eventType: true,
      },
      orderBy: { startAt: 'asc' },
    })
  }

  async findById(id: string) {
    return prisma.slot.findUnique({
      where: { id },
      include: {
        eventType: true,
        host: true,
      },
    })
  }

  async upsert(data: {
    id: string
    hostId: number
    eventTypeId: number
    startAt: Date
    endAt: Date
    status?: string
  }) {
    return prisma.slot.upsert({
      where: {
        slots_eventTypeId_startAt_endAt_key: {
          eventTypeId: data.eventTypeId,
          startAt: data.startAt,
          endAt: data.endAt,
        },
      },
      create: {
        id: data.id,
        hostId: data.hostId,
        eventTypeId: data.eventTypeId,
        startAt: data.startAt,
        endAt: data.endAt,
        status: data.status || 'AVAILABLE',
      },
      update: {
        status: data.status || 'AVAILABLE',
      },
      include: {
        eventType: true,
      },
    })
  }

  async updateStatus(id: string, status: string) {
    return prisma.slot.update({
      where: { id },
      data: { status },
      include: {
        eventType: true,
      },
    })
  }

  async delete(id: string) {
    return prisma.slot.delete({
      where: { id },
    })
  }

  async deleteUnbookedSlotsInRange(hostId: number, from: Date, to: Date) {
    return prisma.slot.deleteMany({
      where: {
        hostId,
        status: 'AVAILABLE',
        startAt: {
          gte: from,
          lte: to,
        },
      },
    })
  }
}

export const slotRepository = new SlotRepository()
