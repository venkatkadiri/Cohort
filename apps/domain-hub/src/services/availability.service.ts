import { availabilityRepository } from '../repositories/availability.repository.js'
import { ApiError } from '../utils/errors.js'

export class AvailabilityService {
  async listRules(userId: number) {
    const list = await availabilityRepository.findRulesByUserId(userId)
    return list.map((r) => ({
      id: r.id,
      userId: r.userId,
      weekday: r.weekday,
      startTime: r.startTime,
      endTime: r.endTime,
      isActive: r.isActive,
      timezone: r.timezone,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  }

  async createRule(data: {
    userId: number
    weekday: number
    startTime: string
    endTime: string
    isActive?: boolean
    timezone?: string
  }) {
    const rule = await availabilityRepository.createRule(data)
    return {
      id: rule.id,
      userId: rule.userId,
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isActive: rule.isActive,
      timezone: rule.timezone,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }
  }

  async updateRule(
    id: number,
    userId: number,
    data: {
      weekday?: number
      startTime?: string
      endTime?: string
      isActive?: boolean
      timezone?: string
    }
  ) {
    const rule = await availabilityRepository.findRuleById(id)
    if (!rule || rule.userId !== userId) {
      throw ApiError.forbidden(`Cannot update rule ${id}`)
    }
    const updated = await availabilityRepository.updateRule(id, data)
    return {
      id: updated.id,
      userId: updated.userId,
      weekday: updated.weekday,
      startTime: updated.startTime,
      endTime: updated.endTime,
      isActive: updated.isActive,
      timezone: updated.timezone,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async deleteRule(id: number, userId: number) {
    const rule = await availabilityRepository.findRuleById(id)
    if (!rule || rule.userId !== userId) {
      throw ApiError.forbidden(`Cannot delete rule ${id}`)
    }
    await availabilityRepository.deleteRule(id)
    return { success: true, message: `Availability rule ${id} deleted` }
  }

  async listExceptions(userId: number, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to) : undefined
    const list = await availabilityRepository.findExceptionsByUserId(userId, fromDate, toDate)
    return list.map((ex) => ({
      id: ex.id,
      userId: ex.userId,
      date: ex.date.toISOString().split('T')[0],
      type: ex.type,
      startTime: ex.startTime,
      endTime: ex.endTime,
      timezone: ex.timezone,
      reason: ex.reason,
      createdAt: ex.createdAt.toISOString(),
      updatedAt: ex.updatedAt.toISOString(),
    }))
  }

  async createException(data: {
    userId: number
    date: string
    type: string
    startTime?: string | null
    endTime?: string | null
    timezone?: string
    reason?: string | null
  }) {
    const ex = await availabilityRepository.createException({
      ...data,
      date: new Date(data.date),
    })
    return {
      id: ex.id,
      userId: ex.userId,
      date: ex.date.toISOString().split('T')[0],
      type: ex.type,
      startTime: ex.startTime,
      endTime: ex.endTime,
      timezone: ex.timezone,
      reason: ex.reason,
      createdAt: ex.createdAt.toISOString(),
      updatedAt: ex.updatedAt.toISOString(),
    }
  }

  async updateException(
    id: number,
    userId: number,
    data: {
      date?: string
      type?: string
      startTime?: string | null
      endTime?: string | null
      timezone?: string
      reason?: string | null
    }
  ) {
    const existing = await availabilityRepository.findExceptionById(id)
    if (!existing || existing.userId !== userId) {
      throw ApiError.forbidden(`Cannot update exception ${id}`)
    }
    const ex = await availabilityRepository.updateException(id, {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    })
    return {
      id: ex.id,
      userId: ex.userId,
      date: ex.date.toISOString().split('T')[0],
      type: ex.type,
      startTime: ex.startTime,
      endTime: ex.endTime,
      timezone: ex.timezone,
      reason: ex.reason,
      createdAt: ex.createdAt.toISOString(),
      updatedAt: ex.updatedAt.toISOString(),
    }
  }

  async deleteException(id: number, userId: number) {
    const existing = await availabilityRepository.findExceptionById(id)
    if (!existing || existing.userId !== userId) {
      throw ApiError.forbidden(`Cannot delete exception ${id}`)
    }
    await availabilityRepository.deleteException(id)
    return { success: true, message: `Availability exception ${id} deleted` }
  }
}

export const availabilityService = new AvailabilityService()
