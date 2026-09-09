import { enrollerRepository } from '../repositories/enroller.repository.js'
import { ApiError } from '../utils/errors.js'

export class EnrollerService {
  async getOrCreateEnroller(data: { email: string; name: string; authId?: string }) {
    let enroller = await enrollerRepository.findByEmail(data.email)
    if (!enroller) {
      enroller = await enrollerRepository.create(data)
    }
    return {
      id: enroller.id,
      email: enroller.email,
      name: enroller.name,
      authId: enroller.authId,
      createdAt: enroller.createdAt.toISOString(),
      updatedAt: enroller.updatedAt.toISOString(),
    }
  }

  async subscribe(enrollerId: number, eventTypeId: number) {
    const sub = await enrollerRepository.subscribe(enrollerId, eventTypeId)
    return {
      id: sub.id,
      enrollerId: sub.enrollerId,
      eventTypeId: sub.eventTypeId,
      createdAt: sub.createdAt.toISOString(),
      eventType: sub.eventType
        ? {
            id: sub.eventType.id,
            hostId: sub.eventType.hostId,
            title: sub.eventType.title,
            slug: sub.eventType.slug,
            durationMinutes: sub.eventType.durationMinutes,
            isActive: sub.eventType.isActive,
            locationType: sub.eventType.locationType,
            locationValue: sub.eventType.locationValue,
            bufferBeforeMinutes: sub.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: sub.eventType.bufferAfterMinutes,
            createdAt: sub.eventType.createdAt.toISOString(),
            updatedAt: sub.eventType.updatedAt.toISOString(),
          }
        : null,
    }
  }

  async unsubscribe(enrollerId: number, eventTypeId: number) {
    await enrollerRepository.unsubscribe(enrollerId, eventTypeId)
    return { success: true, message: 'Unsubscribed successfully' }
  }

  async listSubscriptions(enrollerId: number) {
    const list = await enrollerRepository.listSubscriptions(enrollerId)
    return list.map((sub) => ({
      id: sub.id,
      enrollerId: sub.enrollerId,
      eventTypeId: sub.eventTypeId,
      createdAt: sub.createdAt.toISOString(),
      eventType: sub.eventType
        ? {
            id: sub.eventType.id,
            hostId: sub.eventType.hostId,
            title: sub.eventType.title,
            slug: sub.eventType.slug,
            durationMinutes: sub.eventType.durationMinutes,
            isActive: sub.eventType.isActive,
            locationType: sub.eventType.locationType,
            locationValue: sub.eventType.locationValue,
            bufferBeforeMinutes: sub.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: sub.eventType.bufferAfterMinutes,
            createdAt: sub.eventType.createdAt.toISOString(),
            updatedAt: sub.eventType.updatedAt.toISOString(),
            host: sub.eventType.host
              ? {
                  id: sub.eventType.host.id,
                  email: sub.eventType.host.email,
                  name: sub.eventType.host.name,
                  slug: sub.eventType.host.slug,
                  timezone: sub.eventType.host.timezone,
                  createdAt: sub.eventType.host.createdAt.toISOString(),
                  updatedAt: sub.eventType.host.updatedAt.toISOString(),
                }
              : null,
          }
        : null,
    }))
  }

  async createSlotRequest(data: { enrollerId: number; eventTypeId: number; message?: string | null }) {
    const req = await enrollerRepository.createSlotRequest(data)
    return {
      id: req.id,
      enrollerId: req.enrollerId,
      eventTypeId: req.eventTypeId,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      enroller: req.enroller
        ? {
            id: req.enroller.id,
            email: req.enroller.email,
            name: req.enroller.name,
            authId: req.enroller.authId,
            createdAt: req.enroller.createdAt.toISOString(),
            updatedAt: req.enroller.updatedAt.toISOString(),
          }
        : null,
      eventType: req.eventType
        ? {
            id: req.eventType.id,
            hostId: req.eventType.hostId,
            title: req.eventType.title,
            slug: req.eventType.slug,
            durationMinutes: req.eventType.durationMinutes,
            isActive: req.eventType.isActive,
            locationType: req.eventType.locationType,
            locationValue: req.eventType.locationValue,
            bufferBeforeMinutes: req.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: req.eventType.bufferAfterMinutes,
            createdAt: req.eventType.createdAt.toISOString(),
            updatedAt: req.eventType.updatedAt.toISOString(),
          }
        : null,
    }
  }

  async listSlotRequestsForTeacher(teacherUserId: number) {
    const list = await enrollerRepository.listSlotRequestsForTeacher(teacherUserId)
    return list.map((req) => ({
      id: req.id,
      enrollerId: req.enrollerId,
      eventTypeId: req.eventTypeId,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      enroller: req.enroller
        ? {
            id: req.enroller.id,
            email: req.enroller.email,
            name: req.enroller.name,
            authId: req.enroller.authId,
            createdAt: req.enroller.createdAt.toISOString(),
            updatedAt: req.enroller.updatedAt.toISOString(),
          }
        : null,
      eventType: req.eventType
        ? {
            id: req.eventType.id,
            hostId: req.eventType.hostId,
            title: req.eventType.title,
            slug: req.eventType.slug,
            durationMinutes: req.eventType.durationMinutes,
            isActive: req.eventType.isActive,
            locationType: req.eventType.locationType,
            locationValue: req.eventType.locationValue,
            bufferBeforeMinutes: req.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: req.eventType.bufferAfterMinutes,
            createdAt: req.eventType.createdAt.toISOString(),
            updatedAt: req.eventType.updatedAt.toISOString(),
          }
        : null,
    }))
  }
}

export const enrollerService = new EnrollerService()
