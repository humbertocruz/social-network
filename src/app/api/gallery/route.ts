
// src/app/api/gallery/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { z } from 'zod'

const uploadSchema = z.object({
  type: z.enum(['image', 'video']),
  file: z.any()
})

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const gallery = await prisma.gallery.findMany({
      where: {
        userId: user.id,
        type: type ?? undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(gallery)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: 'public',
    })

    const gallery = await prisma.gallery.create({
      data: {
        type,
        url: blob.url,
        userId: user.id
      }
    })

    return NextResponse.json(gallery)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
