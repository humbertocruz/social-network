// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyAuth(token)

    // Get following users
    const following = await prisma.follow.findMany({
      where: {
        followerId: user.id
      },
      select: {
        followingId: true
      }
    })

    const followingIds = following.map(f => f.followingId)

    // Get posts from followed users
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingIds
        }
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
        images: {
          select: {
            id: true,
            url: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get photos from followed users
    const photos = await prisma.gallery.findMany({
      where: {
        userId: {
          in: followingIds
        },
        type: 'image'
      },
      include: {
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12
    })

    // Get recent messages
    const messages = await prisma.message.findMany({
      where: {
        receiverId: user.id
      },
      include: {
        sender: {
          select: {
            profiles: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get stats
    const stats = {
      followers: await prisma.follow.count({
        where: {
          followingId: user.id
        }
      }),
      following: await prisma.follow.count({
        where: {
          followerId: user.id
        }
      }),
      posts: await prisma.post.count({
        where: {
          userId: user.id
        }
      }),
      photos: await prisma.gallery.count({
        where: {
          userId: user.id,
          type: 'image'
        }
      })
    }

    return NextResponse.json({
      posts,
      photos,
      messages,
      stats
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
