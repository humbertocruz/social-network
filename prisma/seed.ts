// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@vibe.com.br',
      password: hashedPassword,
      role: 'ADMIN',
      profiles: {
        create: [
          {
            name: 'Admin',
            type: 'HE',
            bio: 'System Administrator'
          }
        ]
      }
    }
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
