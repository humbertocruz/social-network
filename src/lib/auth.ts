// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const issuer = 'vibe-app'
const audience = 'vibe-users'

export async function createToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience,
    })
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function verifyAuth(token: string) {
  try {
    const payload = await verifyToken(token)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true
      }
    })

    if (!user) throw new Error('User not found')

    return user
  } catch {
    throw new Error('Unauthorized')
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