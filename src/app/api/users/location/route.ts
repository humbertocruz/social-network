// src/app/api/users/location/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const data = locationSchema.parse(await req.json())

    await prisma.user.update({
      where: { id: user.id },
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        lastLocation: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}
