// src/app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { z } from 'zod'

const postSchema = z.object({
  content: z.string().min(1).max(1000),
  images: z.array(z.string().url()).max(4).optional()
})

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyAuth(token)
    const data = postSchema.parse(await req.json())

    const post = await prisma.post.create({
      data: {
        content: data.content,
        userId: user.id,
        images: data.images ? {
          create: data.images.map(url => ({
            url,
            type: 'image'
          }))
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            profiles: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        },
        images: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Create post error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
