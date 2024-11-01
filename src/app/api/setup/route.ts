// src/app/api/setup/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(8),
  setupKey: z.string()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, username, setupKey } = setupSchema.parse(body)

    // Verify setup key from environment variable
    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      )
    }

    // Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN', email: email }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists on this email' },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username,
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
      },
      include: {
        profiles: true
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        profiles: admin.profiles
      }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
