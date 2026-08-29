import { eventTypeRepository } from '../repositories/event-type.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { ApiError } from '../utils/errors.js'
import slugify from 'slug'

export class EventTypeService {
  async listEventTypes(hostId: number) {
    const list = await eventTypeRepository.findByHostId(hostId)
    return list.map((e) => ({
      id: e.id,
      hostId: e.hostId,
      title: e.title,
      description: e.description,
      slug: e.slug,
      durationMinutes: e.durationMinutes,
      isActive: e.isActive,
      locationType: e.locationType,
      locationValue: e.locationValue,
      bufferBeforeMinutes: e.bufferBeforeMinutes,
      bufferAfterMinutes: e.bufferAfterMinutes,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))
  }

  async getEventTypeById(id: number) {
    const et = await eventTypeRepository.findById(id)
    if (!et) {
      throw ApiError.notFound(`EventType with id ${id} not found`)
    }
    return {
      id: et.id,
      hostId: et.hostId,
      title: et.title,
      description: et.description,
      slug: et.slug,
      durationMinutes: et.durationMinutes,
      isActive: et.isActive,
      locationType: et.locationType,
      locationValue: et.locationValue,
      bufferBeforeMinutes: et.bufferBeforeMinutes,
      bufferAfterMinutes: et.bufferAfterMinutes,
      createdAt: et.createdAt.toISOString(),
      updatedAt: et.updatedAt.toISOString(),
    }
  }

  async getEventTypeBySlug(hostId: number, slug: string) {
    const et = await eventTypeRepository.findByHostAndSlug(hostId, slug)
    if (!et) {
      throw ApiError.notFound(`EventType ${slug} for host ${hostId} not found`)
    }
    return {
      id: et.id,
      hostId: et.hostId,
      title: et.title,
      description: et.description,
      slug: et.slug,
      durationMinutes: et.durationMinutes,
      isActive: et.isActive,
      locationType: et.locationType,
      locationValue: et.locationValue,
      bufferBeforeMinutes: et.bufferBeforeMinutes,
      bufferAfterMinutes: et.bufferAfterMinutes,
      createdAt: et.createdAt.toISOString(),
      updatedAt: et.updatedAt.toISOString(),
    }
  }

  async getPublicEventType(hostId: number, slug: string) {
    const et = await eventTypeRepository.findByHostAndSlug(hostId, slug)
    if (!et) {
      throw ApiError.notFound(`Public EventType ${slug} for host ${hostId} not found`)
    }
    const host = await userRepository.findById(hostId)
    if (!host) {
      throw ApiError.notFound(`Host ${hostId} not found`)
    }

    return {
      eventType: {
        id: et.id,
        hostId: et.hostId,
        title: et.title,
        description: et.description,
        slug: et.slug,
        durationMinutes: et.durationMinutes,
        isActive: et.isActive,
        locationType: et.locationType,
        locationValue: et.locationValue,
        bufferBeforeMinutes: et.bufferBeforeMinutes,
        bufferAfterMinutes: et.bufferAfterMinutes,
        createdAt: et.createdAt.toISOString(),
        updatedAt: et.updatedAt.toISOString(),
      },
      host: {
        id: host.id,
        email: host.email,
        name: host.name,
        slug: host.slug,
        timezone: host.timezone,
        createdAt: host.createdAt.toISOString(),
        updatedAt: host.updatedAt.toISOString(),
      },
    }
  }

  async createEventType(data: {
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
  }) {
    const finalSlug = data.slug || slugify(data.title, { lower: true })
    const et = await eventTypeRepository.create({
      hostId: data.hostId,
      title: data.title,
      description: data.description,
      slug: finalSlug,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive,
      locationType: data.locationType,
      locationValue: data.locationValue,
      bufferBeforeMinutes: data.bufferBeforeMinutes,
      bufferAfterMinutes: data.bufferAfterMinutes,
    })
    return {
      id: et.id,
      hostId: et.hostId,
      title: et.title,
      description: et.description,
      slug: et.slug,
      durationMinutes: et.durationMinutes,
      isActive: et.isActive,
      locationType: et.locationType,
      locationValue: et.locationValue,
      bufferBeforeMinutes: et.bufferBeforeMinutes,
      bufferAfterMinutes: et.bufferAfterMinutes,
      createdAt: et.createdAt.toISOString(),
      updatedAt: et.updatedAt.toISOString(),
    }
  }

  async updateEventType(
    id: number,
    hostId: number,
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
    const existing = await eventTypeRepository.findById(id)
    if (!existing || existing.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot update event type ${id}`)
    }
    const et = await eventTypeRepository.update(id, data)
    return {
      id: et.id,
      hostId: et.hostId,
      title: et.title,
      description: et.description,
      slug: et.slug,
      durationMinutes: et.durationMinutes,
      isActive: et.isActive,
      locationType: et.locationType,
      locationValue: et.locationValue,
      bufferBeforeMinutes: et.bufferBeforeMinutes,
      bufferAfterMinutes: et.bufferAfterMinutes,
      createdAt: et.createdAt.toISOString(),
      updatedAt: et.updatedAt.toISOString(),
    }
  }

  async deleteEventType(id: number, hostId: number) {
    const existing = await eventTypeRepository.findById(id)
    if (!existing || existing.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot delete event type ${id}`)
    }
    await eventTypeRepository.delete(id)
    return { success: true, message: `EventType ${id} deleted` }
  }
}

export const eventTypeService = new EventTypeService()
