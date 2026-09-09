import { prisma } from '../db/prisma.js'

export class EventTypeRepository {
  async findByHostId(hostId: number) {
    return prisma.eventType.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: number) {
    return prisma.eventType.findUnique({
      where: { id },
      include: { host: true },
    })
  }

  async findByHostAndSlug(hostId: number, slug: string) {
    return prisma.eventType.findUnique({
      where: {
        event_types_hostId_slug_key: {
          hostId,
          slug,
        },
      },
      include: { host: true },
    })
  }

  async create(data: {
    hostId: number
    title: string
    description?: string | null
    slug: string
    durationMinutes: number
    isActive?: boolean
    locationType?: string
    locationValue?: string | null
    bufferBeforeMinutes?: number
    bufferAfterMinutes?: number
  }) {
    return prisma.eventType.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        slug: data.slug,
        durationMinutes: data.durationMinutes,
        isActive: data.isActive ?? true,
        locationType: data.locationType || 'online',
        locationValue: data.locationValue,
        bufferBeforeMinutes: data.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: data.bufferAfterMinutes ?? 0,
      },
      include: { host: true },
    })
  }

  async update(
    id: number,
    data: {
      title?: string
      description?: string | null
      slug?: string
      durationMinutes?: number
      isActive?: boolean
      locationType?: string
      locationValue?: string | null
      bufferBeforeMinutes?: number
      bufferAfterMinutes?: number
    }
  ) {
    return prisma.eventType.update({
      where: { id },
      data,
      include: { host: true },
    })
  }

  async delete(id: number) {
    return prisma.eventType.delete({
      where: { id },
    })
  }
}

export const eventTypeRepository = new EventTypeRepository()
