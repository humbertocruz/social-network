// src/app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  type: z.enum(['HE', 'SHE'])
})

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)

    const profiles = await prisma.profile.findMany({
      where: { userId: user.id }
    })

    return NextResponse.json(profiles)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const data = updateProfileSchema.parse(await req.json())

    const profile = await prisma.profile.update({
      where: { 
        id: data.id,
        userId: user.id // Ensure the profile belongs to the user
      },
      data: {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        type: data.type
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
