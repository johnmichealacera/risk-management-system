import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create barangays
  const barangay1 = await prisma.barangay.upsert({
    where: { code: 'BRG001' },
    update: {},
    create: {
      name: 'Barangay Poblacion',
      code: 'BRG001',
      population: 5000,
      contactInfo: '09123456789',
      coordinates: '12.3456, 123.4567'
    }
  })

  const barangay2 = await prisma.barangay.upsert({
    where: { code: 'BRG002' },
    update: {},
    create: {
      name: 'Barangay San Isidro',
      code: 'BRG002',
      population: 3000,
      contactInfo: '09123456790',
      coordinates: '12.3457, 123.4568'
    }
  })

  console.log('Created barangays')

  // Create evacuation centers
  await prisma.evacuationCenter.upsert({
    where: { id: 'evac-center-1' },
    update: {},
    create: {
      id: 'evac-center-1',
      name: 'Poblacion Elementary School',
      barangayId: barangay1.id,
      capacity: 200,
      currentOccupancy: 0,
      address: 'Poblacion, Socorro'
    }
  })

  await prisma.evacuationCenter.upsert({
    where: { id: 'evac-center-2' },
    update: {},
    create: {
      id: 'evac-center-2',
      name: 'San Isidro Barangay Hall',
      barangayId: barangay2.id,
      capacity: 150,
      currentOccupancy: 0,
      address: 'San Isidro, Socorro'
    }
  })

  console.log('Created evacuation centers')

  // Create relief goods
  const reliefGoods = [
    { name: 'Rice', category: 'Food', unit: 'kg', currentStock: 1000, minimumStock: 100 },
    { name: 'Canned Goods', category: 'Food', unit: 'cans', currentStock: 500, minimumStock: 50 },
    { name: 'Water', category: 'Beverage', unit: 'bottles', currentStock: 2000, minimumStock: 200 },
    { name: 'Blankets', category: 'Shelter', unit: 'pieces', currentStock: 300, minimumStock: 30 },
    { name: 'Hygiene Kits', category: 'Hygiene', unit: 'kits', currentStock: 200, minimumStock: 20 },
  ]

  for (const good of reliefGoods) {
    await prisma.reliefGood.upsert({
      where: { id: `relief-${good.name.toLowerCase().replace(' ', '-')}` },
      update: {},
      create: {
        id: `relief-${good.name.toLowerCase().replace(' ', '-')}`,
        ...good
      }
    })
  }

  console.log('Created relief goods')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Municipal Admin
  await prisma.user.upsert({
    where: { email: 'admin@socorro.gov.ph' },
    update: {},
    create: {
      name: 'Municipal Administrator',
      email: 'admin@socorro.gov.ph',
      password: hashedPassword,
      role: 'MUNICIPAL_ADMIN',
      isActive: true
    }
  })

  // MDRRMC Officer
  await prisma.user.upsert({
    where: { email: 'mdrrmc@socorro.gov.ph' },
    update: {},
    create: {
      name: 'MDRRMC Officer',
      email: 'mdrrmc@socorro.gov.ph',
      password: hashedPassword,
      role: 'MDRRMC_OFFICER',
      isActive: true
    }
  })

  // Barangay Staff
  await prisma.user.upsert({
    where: { email: 'staff1@barangay.ph' },
    update: {},
    create: {
      name: 'Barangay Staff 1',
      email: 'staff1@barangay.ph',
      password: hashedPassword,
      role: 'BARANGAY_STAFF',
      barangayId: barangay1.id,
      isActive: true
    }
  })

  await prisma.user.upsert({
    where: { email: 'staff2@barangay.ph' },
    update: {},
    create: {
      name: 'Barangay Staff 2',
      email: 'staff2@barangay.ph',
      password: hashedPassword,
      role: 'BARANGAY_STAFF',
      barangayId: barangay2.id,
      isActive: true
    }
  })

  console.log('Created users')
  console.log('Seed completed!')
  console.log('\nDefault login credentials:')
  console.log('Admin: admin@socorro.gov.ph / password123')
  console.log('MDRRMC: mdrrmc@socorro.gov.ph / password123')
  console.log('Barangay Staff 1: staff1@barangay.ph / password123')
  console.log('Barangay Staff 2: staff2@barangay.ph / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

