import { userRepository } from '../repositories/user.repository.js'
import { ApiError } from '../utils/errors.js'
import slugify from 'slug'

export class UserService {
  async listUsers() {
    const users = await userRepository.findAll()
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      slug: u.slug,
      timezone: u.timezone,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      count: {
        eventTypes: u._count.eventTypes,
        bookings: u._count.bookings,
      },
    }))
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw ApiError.notFound(`User with id ${id} not found`)
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      count: {
        eventTypes: user._count.eventTypes,
        bookings: user._count.bookings,
      },
    }
  }

  async getUserBySlug(slug: string) {
    const user = await userRepository.findBySlug(slug)
    if (!user) {
      throw ApiError.notFound(`User with slug ${slug} not found`)
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      count: {
        eventTypes: user._count.eventTypes,
        bookings: user._count.bookings,
      },
    }
  }

  async createUser(data: { name: string; email: string; slug?: string; timezone?: string }) {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw ApiError.conflict(`User with email ${data.email} already exists`)
    }
    const finalSlug = data.slug || slugify(data.name, { lower: true })
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      slug: finalSlug,
      timezone: data.timezone || 'UTC',
    })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      count: {
        eventTypes: user._count.eventTypes,
        bookings: user._count.bookings,
      },
    }
  }

  async updateUser(id: number, data: { name?: string; email?: string; slug?: string; timezone?: string }) {
    const user = await userRepository.update(id, data)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      count: {
        eventTypes: user._count.eventTypes,
        bookings: user._count.bookings,
      },
    }
  }

  async deleteUser(id: number) {
    await userRepository.delete(id)
    return { success: true, message: `User ${id} deleted` }
  }
}

export const userService = new UserService()
