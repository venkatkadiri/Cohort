import { prisma } from '../db/prisma.js'

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      include: {
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    })
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
    })
  }

  async findBySlug(slug: string) {
    return prisma.user.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: { name: string; email: string; slug: string; timezone?: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        slug: data.slug,
        timezone: data.timezone || 'UTC',
      },
      include: {
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
    })
  }

  async update(id: number, data: { name?: string; email?: string; slug?: string; timezone?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
    })
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    })
  }
}

export const userRepository = new UserRepository()
