// src/app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().optional(),
  image: z.string().url().optional(),
  type: z.enum(['text', 'image']),
  receiverId: z.string()
}).refine(data => {
  if (data.type === 'text' && !data.content) return false
  if (data.type === 'image' && !data.image) return false
  return true
}, {
  message: "Either content or image is required"
})

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)
    if (user.role !== 'PREMIUM' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Premium feature only' },
        { status: 403 }
      )
    }

    const data = messageSchema.parse(await req.json())

    const message = await prisma.message.create({
      data: {
        content: data.content,
        image: data.image,
        type: data.type,
        senderId: user.id,
        receiverId: data.receiverId
      },
      include: {
        sender: {
          select: {
            profiles: true
          }
        },
        receiver: {
          select: {
            profiles: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
