// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('🚀 Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect()
    console.log('👋 Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
    process.exit(1)
  }
}

// Utility function to handle Prisma errors
export function handlePrismaError(error: any): never {
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        throw new Error('A unique constraint would be violated on ' + error.meta?.target)
      case 'P2014':
        throw new Error('The change you are trying to make would violate the required relation ' + error.meta?.target)
      case 'P2003':
        throw new Error('Foreign key constraint failed on the field: ' + error.meta?.field_name)
      case 'P2025':
        throw new Error('Record not found')
      default:
        throw new Error('An error occurred with the database operation: ' + error.message)
    }
  }
  throw error
}

// Utility function for safe transactions
export async function runInTransaction<T>(
  operation: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await operation(tx)
    })
  } catch (error) {
    handlePrismaError(error)
  }
}

// Example usage of transaction utility:
/*
async function createUserWithProfiles(data: any) {
  return await runInTransaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    })

    const profiles = await tx.profile.createMany({
      data: data.profiles.map((profile: any) => ({
        ...profile,
        userId: user.id,
      })),
    })

    return { user, profiles }
  })
}
*/

// Query helper with automatic error handling
export async function prismaQuery<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    handlePrismaError(error)
  }
}

// Example of a reusable query pattern:
export const queries = {
  user: {
    findByEmail: (email: string) =>
      prismaQuery(
        () => prisma.user.findUnique({ where: { email } }),
        'Failed to find user by email'
      ),
    
    findByInvitationCode: (code: string) =>
      prismaQuery(
        () => prisma.invitation.findUnique({
          where: { code },
          include: { inviter: true }
        }),
        'Failed to find invitation'
      ),
    
    findWithProfiles: (userId: string) =>
      prismaQuery(
        () => prisma.user.findUnique({
          where: { id: userId },
          include: {
            profiles: true,
            sentInvitations: true,
            receivedInvitation: true,
          }
        }),
        'Failed to find user with profiles'
      ),
  },

  profile: {
    updateProfile: (profileId: string, data: any) =>
      prismaQuery(
        () => prisma.profile.update({
          where: { id: profileId },
          data
        }),
        'Failed to update profile'
      ),
  },

  invitation: {
    createInvitation: (data: any) =>
      prismaQuery(
        () => prisma.invitation.create({
          data: {
            email: data.email,
            code: data.code,
            inviterId: data.inviterId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          }
        }),
        'Failed to create invitation'
      ),
  }
}

// Middleware for request handling
export async function withPrisma<T>(
  handler: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    await connectDB()
    const result = await handler(prisma)
    return result
  } catch (error) {
    handlePrismaError(error)
  } finally {
    await disconnectDB()
  }
}

// Example usage of withPrisma:
/*
export async function GET(request: Request) {
  return await withPrisma(async (prisma) => {
    const users = await prisma.user.findMany()
    return new Response(JSON.stringify(users))
  })
}
*/
