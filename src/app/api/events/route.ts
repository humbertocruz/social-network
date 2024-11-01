
// src/app/api/events/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  date: z.string().transform(str => new Date(str))
})

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const events = await prisma.event.findMany({
      where: {
        userId: user.id,
        ...(month && year ? {
          date: {
            gte: new Date(parseInt(year), parseInt(month), 1),
            lt: new Date(parseInt(year), parseInt(month) + 1, 1)
          }
        } : {})
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const data = eventSchema.parse(await req.json())

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        userId: user.id
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const { id, ...data } = eventSchema.parse(await req.json())

    const event = await prisma.event.update({
      where: {
        id: id as string,
        userId: user.id
      },
      data
    })

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}