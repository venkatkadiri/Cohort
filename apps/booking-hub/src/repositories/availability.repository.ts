import { prisma } from '../db/prisma.js'

export class AvailabilityRepository {
  async findRulesByUserId(userId: number) {
    return prisma.availabilityRule.findMany({
      where: { userId },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
    })
  }

  async findRuleById(id: number) {
    return prisma.availabilityRule.findUnique({
      where: { id },
    })
  }

  async createRule(data: {
    userId: number
    weekday: number
    startTime: string
    endTime: string
    isActive?: boolean
    timezone?: string
  }) {
    return prisma.availabilityRule.create({
      data: {
        userId: data.userId,
        weekday: data.weekday,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
        timezone: data.timezone || 'UTC',
      },
    })
  }

  async updateRule(
    id: number,
    data: {
      weekday?: number
      startTime?: string
      endTime?: string
      isActive?: boolean
      timezone?: string
    }
  ) {
    return prisma.availabilityRule.update({
      where: { id },
      data,
    })
  }

  async deleteRule(id: number) {
    return prisma.availabilityRule.delete({
      where: { id },
    })
  }

  async findExceptionsByUserId(userId: number, from?: Date, to?: Date) {
    const where: any = { userId }
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = from
      if (to) where.date.lte = to
    }
    return prisma.availabilityException.findMany({
      where,
      orderBy: { date: 'asc' },
    })
  }

  async findExceptionById(id: number) {
    return prisma.availabilityException.findUnique({
      where: { id },
    })
  }

  async createException(data: {
    userId: number
    date: Date
    type: string
    startTime?: string | null
    endTime?: string | null
    timezone?: string
    reason?: string | null
  }) {
    return prisma.availabilityException.create({
      data: {
        userId: data.userId,
        date: data.date,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone || 'UTC',
        reason: data.reason,
      },
    })
  }

  async updateException(
    id: number,
    data: {
      date?: Date
      type?: string
      startTime?: string | null
      endTime?: string | null
      timezone?: string
      reason?: string | null
    }
  ) {
    return prisma.availabilityException.update({
      where: { id },
      data,
    })
  }

  async deleteException(id: number) {
    return prisma.availabilityException.delete({
      where: { id },
    })
  }
}

export const availabilityRepository = new AvailabilityRepository()
