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

// src/app/api/users/nearby/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    // Get users who updated their location in the last hour
    const nearbyUsers = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        latitude: { not: null },
        longitude: { not: null },
        lastLocation: {
          gt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      },
      include: {
        profiles: {
          select: {
            name: true,
            avatar: true,
            type: true
          }
        }
      }
    })

    // Calculate distances and sort by proximity
    const usersWithDistance = nearbyUsers
      .map(user => ({
        ...user,
        distance: calculateDistance(
          lat,
          lng,
          user.latitude!,
          user.longitude!
        )
      }))
      .filter(user => user.distance <= 50) // Only users within 50km
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(usersWithDistance)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch nearby users' },
      { status: 500 }
    )
  }
}
