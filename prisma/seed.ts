import { PrismaClient, UserRole, EventStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@demo.com' },
    update: {},
    create: {
      email: 'organizer@demo.com',
      name: 'Demo Organizer',
      passwordHash: await bcrypt.hash('password123', 10),
      role: UserRole.ORGANIZER,
    },
  })

  await prisma.user.upsert({
    where: { email: 'fan@demo.com' },
    update: {},
    create: {
      email: 'fan@demo.com',
      name: 'Demo Fan',
      passwordHash: await bcrypt.hash('password123', 10),
      role: UserRole.ATTENDEE,
    },
  })

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'event-demo-1',
        title: 'Arijit Singh Live — Mumbai',
        description: 'An unforgettable night with Arijit Singh performing his greatest hits live at MMRDA Grounds.',
        venue: 'MMRDA Grounds, BKC',
        city: 'Mumbai',
        eventDate: new Date('2026-06-15T19:00:00Z'),
        status: EventStatus.PUBLISHED,
        totalInventory: 5000,
        availableInventory: 4820,
        ticketPrice: 2500,
        maxTicketsPerID: 2,
        gracePeriodHours: 6,
        penaltyPercent: 20,
        isHighDemand: true,
        organizerId: organizer.id,
      },
      {
        id: 'event-demo-2',
        title: 'Nucleya Bass Camp — Bangalore',
        description: 'India\'s biggest electronic music experience. Nucleya brings the bass to Bangalore.',
        venue: 'Palace Grounds',
        city: 'Bangalore',
        eventDate: new Date('2026-07-20T18:00:00Z'),
        status: EventStatus.PUBLISHED,
        totalInventory: 3000,
        availableInventory: 2100,
        ticketPrice: 1800,
        maxTicketsPerID: 2,
        gracePeriodHours: 6,
        penaltyPercent: 20,
        isHighDemand: false,
        organizerId: organizer.id,
      },
      {
        id: 'event-demo-3',
        title: 'NH7 Weekender — Pune',
        description: 'The happiest music festival is back. Multiple stages, multiple genres, one epic weekend.',
        venue: 'Mahalunge, Pune',
        city: 'Pune',
        eventDate: new Date('2026-11-08T14:00:00Z'),
        status: EventStatus.PUBLISHED,
        totalInventory: 10000,
        availableInventory: 9500,
        ticketPrice: 3500,
        maxTicketsPerID: 4,
        gracePeriodHours: 6,
        penaltyPercent: 20,
        isHighDemand: false,
        organizerId: organizer.id,
      },
    ],
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('Demo accounts:')
  console.log('  Organizer → organizer@demo.com / password123')
  console.log('  Fan       → fan@demo.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())