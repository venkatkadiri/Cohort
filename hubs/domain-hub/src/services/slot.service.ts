import { DateTime } from 'luxon'
import { slotRepository } from '../repositories/slot.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { eventTypeRepository } from '../repositories/event-type.repository.js'
import { availabilityRepository } from '../repositories/availability.repository.js'
import { bookingRepository } from '../repositories/booking.repository.js'
import {
  mergeWindows,
  subtractWindows,
  splitIntoSlots,
  overlapsBooked,
  parseTimeToDateTime,
  type TimeWindow,
} from './slot-generation.service.js'
import { ApiError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export class SlotService {
  async getAvailableSlots(eventTypeId: number, dateStr: string) {
    const et = await eventTypeRepository.findById(eventTypeId)
    if (!et) {
      throw ApiError.notFound(`EventType ${eventTypeId} not found`)
    }

    const hostTz = et.host?.timezone || 'UTC'
    const startOfDay = DateTime.fromISO(dateStr, { zone: hostTz }).startOf('day').toUTC().toJSDate()
    const endOfDay = DateTime.fromISO(dateStr, { zone: hostTz }).endOf('day').toUTC().toJSDate()

    const slots = await slotRepository.findAvailableSlotsByDate(eventTypeId, startOfDay, endOfDay)
    return slots.map((s) => ({
      id: s.id,
      hostId: s.hostId,
      eventTypeId: s.eventTypeId,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      eventType: s.eventType
        ? {
            id: s.eventType.id,
            hostId: s.eventType.hostId,
            title: s.eventType.title,
            slug: s.eventType.slug,
            durationMinutes: s.eventType.durationMinutes,
            isActive: s.eventType.isActive,
            locationType: s.eventType.locationType,
            locationValue: s.eventType.locationValue,
            bufferBeforeMinutes: s.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: s.eventType.bufferAfterMinutes,
            createdAt: s.eventType.createdAt.toISOString(),
            updatedAt: s.eventType.updatedAt.toISOString(),
          }
        : null,
    }))
  }

  async listSlotsForHost(hostId: number, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to) : undefined
    const slots = await slotRepository.findSlotsForHost(hostId, fromDate, toDate)
    return slots.map((s) => ({
      id: s.id,
      hostId: s.hostId,
      eventTypeId: s.eventTypeId,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      eventType: s.eventType
        ? {
            id: s.eventType.id,
            hostId: s.eventType.hostId,
            title: s.eventType.title,
            slug: s.eventType.slug,
            durationMinutes: s.eventType.durationMinutes,
            isActive: s.eventType.isActive,
            locationType: s.eventType.locationType,
            locationValue: s.eventType.locationValue,
            bufferBeforeMinutes: s.eventType.bufferBeforeMinutes,
            bufferAfterMinutes: s.eventType.bufferAfterMinutes,
            createdAt: s.eventType.createdAt.toISOString(),
            updatedAt: s.eventType.updatedAt.toISOString(),
          }
        : null,
    }))
  }

  async createSlot(data: { hostId: number; eventTypeId: number; startAt: string; endAt: string }) {
    const slotId = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`
    const slot = await slotRepository.upsert({
      id: slotId,
      hostId: data.hostId,
      eventTypeId: data.eventTypeId,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      status: 'AVAILABLE',
    })
    return {
      id: slot.id,
      hostId: slot.hostId,
      eventTypeId: slot.eventTypeId,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      status: slot.status,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
    }
  }

  async updateSlot(
    id: string,
    hostId: number,
    data: { eventTypeId?: number; startAt?: string; endAt?: string; status?: string }
  ) {
    const existing = await slotRepository.findById(id)
    if (!existing || existing.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot update slot ${id}`)
    }
    const updated = await slotRepository.upsert({
      id,
      hostId,
      eventTypeId: data.eventTypeId || existing.eventTypeId,
      startAt: data.startAt ? new Date(data.startAt) : existing.startAt,
      endAt: data.endAt ? new Date(data.endAt) : existing.endAt,
      status: data.status || existing.status,
    })
    return {
      id: updated.id,
      hostId: updated.hostId,
      eventTypeId: updated.eventTypeId,
      startAt: updated.startAt.toISOString(),
      endAt: updated.endAt.toISOString(),
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async deleteSlot(id: string, hostId: number) {
    const existing = await slotRepository.findById(id)
    if (!existing || existing.hostId !== hostId) {
      throw ApiError.forbidden(`Cannot delete slot ${id}`)
    }
    await slotRepository.delete(id)
    return { success: true, message: `Slot ${id} deleted` }
  }

  async regenerateSlots(hostId: number, fromDateStr?: string, toDateStr?: string, daysAhead = 30) {
    const user = await userRepository.findById(hostId)
    if (!user) {
      throw ApiError.notFound(`User ${hostId} not found`)
    }

    const hostTz = user.timezone || 'UTC'
    const nowHost = DateTime.now().setZone(hostTz)

    const fromDate = fromDateStr
      ? DateTime.fromISO(fromDateStr, { zone: hostTz }).startOf('day')
      : nowHost.startOf('day')
    const toDate = toDateStr
      ? DateTime.fromISO(toDateStr, { zone: hostTz }).endOf('day')
      : fromDate.plus({ days: daysAhead }).endOf('day')

    logger.info(`Regenerating slots for host ${user.name} (${hostId}) from ${fromDate.toISODate()} to ${toDate.toISODate()}`)

    // 1. Fetch rules & exceptions & event types
    const rules = await availabilityRepository.findRulesByUserId(hostId)
    const activeRules = rules.filter((r) => r.isActive)

    const exceptions = await availabilityRepository.findExceptionsByUserId(
      hostId,
      fromDate.toJSDate(),
      toDate.toJSDate()
    )

    const eventTypes = await eventTypeRepository.findByHostId(hostId)
    const activeEventTypes = eventTypes.filter((e) => e.isActive)

    if (activeEventTypes.length === 0) {
      return { success: true, generatedCount: 0, message: 'No active event types for host' }
    }

    // 2. Fetch existing active bookings in range
    const activeBookings = await bookingRepository.findActiveBookingsInRange(
      hostId,
      fromDate.toUTC().toJSDate(),
      toDate.toUTC().toJSDate()
    )

    const bookedWindows: TimeWindow[] = activeBookings.map((b) => ({
      start: DateTime.fromJSDate(b.slot.startAt).toUTC(),
      end: DateTime.fromJSDate(b.slot.endAt).toUTC(),
    }))

    let generatedCount = 0

    // Iterate through days
    let dayCursor = fromDate
    while (dayCursor <= toDate) {
      const dateStr = dayCursor.toISODate()
      if (!dateStr) {
        dayCursor = dayCursor.plus({ days: 1 })
        continue
      }

      const weekday = dayCursor.weekday % 7 // 0=Sunday, 1=Monday... 6=Saturday
      const dayRules = activeRules.filter((r) => r.weekday === weekday)

      // Base windows for weekday
      let dayWindows: TimeWindow[] = []
      for (const rule of dayRules) {
        const start = parseTimeToDateTime(dateStr, rule.startTime, rule.timezone || hostTz)
        const end = parseTimeToDateTime(dateStr, rule.endTime, rule.timezone || hostTz)
        if (end > start) {
          dayWindows.push({ start, end })
        }
      }

      dayWindows = mergeWindows(dayWindows)

      // Apply exceptions for this date
      const dayExceptions = exceptions.filter(
        (ex) => DateTime.fromJSDate(ex.date).toISODate() === dateStr
      )

      for (const ex of dayExceptions) {
        if (ex.type === 'BLOCK_FULL_DAY') {
          dayWindows = []
        } else if (ex.type === 'BLOCK_PARTIAL' && ex.startTime && ex.endTime) {
          const blockStart = parseTimeToDateTime(dateStr, ex.startTime, ex.timezone || hostTz)
          const blockEnd = parseTimeToDateTime(dateStr, ex.endTime, ex.timezone || hostTz)
          dayWindows = subtractWindows(dayWindows, { start: blockStart, end: blockEnd })
        } else if (ex.type === 'ADD_AVAILABLE_WINDOW' && ex.startTime && ex.endTime) {
          const addStart = parseTimeToDateTime(dateStr, ex.startTime, ex.timezone || hostTz)
          const addEnd = parseTimeToDateTime(dateStr, ex.endTime, ex.timezone || hostTz)
          if (addEnd > addStart) {
            dayWindows.push({ start: addStart, end: addEnd })
            dayWindows = mergeWindows(dayWindows)
          }
        }
      }

      // Generate slots per event type
      for (const et of activeEventTypes) {
        const rawSlots = splitIntoSlots(
          dayWindows,
          et.durationMinutes,
          et.bufferBeforeMinutes,
          et.bufferAfterMinutes
        )

        for (const slot of rawSlots) {
          // Check if slot overlaps non-cancelled booking
          const isOverlapping = overlapsBooked(
            slot,
            bookedWindows,
            et.bufferBeforeMinutes,
            et.bufferAfterMinutes
          )

          if (!isOverlapping) {
            const slotId = `c${slot.start.toMillis().toString(36)}${Math.random().toString(36).substring(2, 6)}`
            await slotRepository.upsert({
              id: slotId,
              hostId,
              eventTypeId: et.id,
              startAt: slot.start.toJSDate(),
              endAt: slot.end.toJSDate(),
              status: 'AVAILABLE',
            })
            generatedCount++
          }
        }
      }

      dayCursor = dayCursor.plus({ days: 1 })
    }

    return {
      success: true,
      generatedCount,
      message: `Generated ${generatedCount} available slots for host ${user.name}`,
    }
  }
}

export const slotService = new SlotService()
