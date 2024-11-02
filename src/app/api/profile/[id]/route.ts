// src/app/api/profile/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  avatar: z.string().url().optional()
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyAuth(token)
    const data = updateProfileSchema.parse(await req.json())

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: {
        id: params.id
      },
      data: {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}