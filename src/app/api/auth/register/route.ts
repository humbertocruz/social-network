import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  code: z.string().length(6),
  profiles: z.array(z.object({
    type: z.enum(['HE', 'SHE']),
    name: z.string().min(2),
    avatar: z.string().optional(),
    bio: z.string().optional()
  })).min(1).max(2)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, code, profiles } = registerSchema.parse(body)

    // Verify invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        inviter: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user and update invitation in a transaction
    //@ts-expect-error tx not know
    const user = await prisma.$transaction(async (tx) => {
      // Calculate invitation level and path
      const invitationLevel = invitation.inviter.invitationLevel + 1
      const invitationPath = invitation.inviter.invitationPath
        ? `${invitation.inviter.invitationPath}>${invitation.inviter.id}`
        : invitation.inviter.id

      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 12),
          invitationLevel,
          invitationPath,
          profiles: {
            create: profiles
          }
        },
        include: {
          profiles: true
        }
      })

      // Update invitation
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
          invitedUserId: newUser.id
        }
      })

      return newUser
    })

    // Generate token
    const token = await createToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profiles: user.profiles
      }
    })

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Invalid registration data' },
      { status: 400 }
    )
  }
}
