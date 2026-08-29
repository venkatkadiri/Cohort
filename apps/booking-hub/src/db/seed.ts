import { prisma } from './prisma.js'
import { slotService } from '../services/slot.service.js'
import { logger } from '../utils/logger.js'

export async function seed() {
  logger.info('Checking database seed state...')
  const userCount = await prisma.user.count()

  if (userCount > 0) {
    logger.info('Database already has users, skipping seed.')
    return
  }

  logger.info('Seeding database with default mentors and tracks...')

  // 1. Create Users
  const ada = await prisma.user.create({
    data: {
      email: 'ada@lovelace.dev',
      name: 'Ada Lovelace',
      slug: 'ada',
      timezone: 'UTC',
    },
  })

  const grace = await prisma.user.create({
    data: {
      email: 'grace@hopper.dev',
      name: 'Grace Hopper',
      slug: 'grace',
      timezone: 'America/New_York',
    },
  })

  // 2. Create Teachers & Enrollers
  await prisma.teacher.create({
    data: {
      userId: ada.id,
      name: ada.name,
      email: ada.email,
      authId: 'auth_ada',
    },
  })

  await prisma.enroller.create({
    data: {
      name: 'Grace Admissions',
      email: 'admissions@hopper.dev',
      authId: 'auth_grace_admissions',
    },
  })

  // 3. Create Event Types
  const et1 = await prisma.eventType.create({
    data: {
      hostId: ada.id,
      title: 'Intro call',
      description: 'A quick 30 minute intro to see if we are a good fit.',
      slug: 'intro-call',
      durationMinutes: 30,
      locationType: 'online',
      locationValue: 'Google Meet',
    },
  })

  const et2 = await prisma.eventType.create({
    data: {
      hostId: ada.id,
      title: 'Coffee chat',
      description: 'Grab a coffee and chat about anything.',
      slug: 'coffee-chat',
      durationMinutes: 15,
      locationType: 'in-person',
      locationValue: 'Blue Bottle, Pine St',
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 5,
    },
  })

  await prisma.eventType.create({
    data: {
      hostId: grace.id,
      title: 'Product demo',
      description: 'See the platform in action with a 45 minute guided walkthrough.',
      slug: 'product-demo',
      durationMinutes: 45,
      locationType: 'online',
      isActive: false,
    },
  })

  // 4. Create Availability Rules
  // Mon-Fri 09:00 - 17:00 for Ada (UTC)
  for (let weekday = 1; weekday <= 5; weekday++) {
    await prisma.availabilityRule.create({
      data: {
        userId: ada.id,
        weekday,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
      },
    })
  }

  // Tue-Thu 10:00 - 18:00 for Grace (America/New_York)
  for (const weekday of [2, 3, 4]) {
    await prisma.availabilityRule.create({
      data: {
        userId: grace.id,
        weekday,
        startTime: '10:00',
        endTime: '18:00',
        timezone: 'America/New_York',
      },
    })
  }

  // 5. Generate Initial Slots for Ada
  logger.info('Generating initial slots for Ada Lovelace...')
  await slotService.regenerateSlots(ada.id)

  logger.info('✅ Database seeded successfully!')
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
