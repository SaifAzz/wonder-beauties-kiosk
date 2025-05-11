import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the admin password
  const hashedPassword = await bcrypt.hash('adminPassword123', 10)
  
  // Create admin user for Iraq
  const adminIraq = await prisma.user.upsert({
    where: { phone: '1234567890' },
    update: {
      password: hashedPassword
    },
    create: {
      phone: '1234567890',
      name: 'Admin User',
      password: hashedPassword,
      country: 'Iraq',
      role: 'ADMIN',
      isVerified: true,
    },
  })

  // Create admin user for Syria
  const adminSyria = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      password: hashedPassword
    },
    create: {
      phone: '9876543210',
      name: 'Syria Admin',
      password: hashedPassword,
      country: 'Syria',
      role: 'ADMIN',
      isVerified: true,
    },
  })

  console.log({ adminIraq, adminSyria })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 