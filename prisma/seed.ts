import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the admin password
  const hashedPassword = await bcrypt.hash('adminPassword123', 10)
  
  // Create admin user
  const admin = await prisma.user.upsert({
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

  console.log({ admin })
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