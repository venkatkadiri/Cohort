import { prisma } from '../db/prisma.js'

export class EnrollerRepository {
  async findByEmail(email: string) {
    return prisma.enroller.findUnique({
      where: { email },
    })
  }

  async findById(id: number) {
    return prisma.enroller.findUnique({
      where: { id },
    })
  }

  async create(data: { name: string; email: string; authId?: string }) {
    return prisma.enroller.create({
      data: {
        name: data.name,
        email: data.email,
        authId: data.authId || `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    })
  }

  async subscribe(enrollerId: number, eventTypeId: number) {
    return prisma.subscription.upsert({
      where: {
        subscriptions_enrollerId_eventTypeId_key: {
          enrollerId,
          eventTypeId,
        },
      },
      create: {
        enrollerId,
        eventTypeId,
      },
      update: {},
      include: {
        eventType: true,
      },
    })
  }

  async unsubscribe(enrollerId: number, eventTypeId: number) {
    return prisma.subscription.deleteMany({
      where: {
        enrollerId,
        eventTypeId,
      },
    })
  }

  async listSubscriptions(enrollerId: number) {
    return prisma.subscription.findMany({
      where: { enrollerId },
      include: {
        eventType: {
          include: {
            host: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createSlotRequest(data: { enrollerId: number; eventTypeId: number; message?: string | null }) {
    return prisma.slotRequest.create({
      data: {
        enrollerId: data.enrollerId,
        eventTypeId: data.eventTypeId,
        message: data.message,
        status: 'PENDING',
      },
      include: {
        enroller: true,
        eventType: true,
      },
    })
  }

  async listSlotRequestsForTeacher(teacherUserId: number) {
    return prisma.slotRequest.findMany({
      where: {
        eventType: {
          hostId: teacherUserId,
        },
      },
      include: {
        enroller: true,
        eventType: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const enrollerRepository = new EnrollerRepository()
