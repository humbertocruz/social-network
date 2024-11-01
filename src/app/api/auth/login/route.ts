// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required"
  }),
  password: z.string().min(1, {
    message: "Password is required"
  })
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = loginSchema.parse(body)

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profiles: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is TESTER and if their trial has expired
    if (user.role === 'TESTER' && user.testerExpires) {
      const now = new Date()
      if (now > user.testerExpires) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'FREE' }
        })
        user.role = 'FREE'
      }
    }

    // Update lastOnline for FREE users
    if (user.role === 'FREE') {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastOnline: new Date() }
      })
    }

    // Generate token
    const token = await createToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profiles: user.profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          type: profile.type,
          avatar: profile.avatar,
          bio: profile.bio
        }))
      }
    })

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}