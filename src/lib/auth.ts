import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret)
}

export async function verifyAuth(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        profiles: true
      }
    })
    
    if (!user) throw new Error('User not found')
    
    return user
  } catch {
    throw new Error('Invalid token')
  }
}

export async function getSession() {
  const token = cookies().get('token')?.value
  if (!token) return null
  
  try {
    return await verifyAuth(token)
  } catch {
    return null
  }
}

export async function updateSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profiles: true
    }
  })

  if (user?.role === 'FREE') {
    await prisma.user.update({
      where: { id: userId },
      data: { lastOnline: new Date() }
    })
  }

  return user
}
