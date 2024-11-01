// src/app/api/top/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await verifyAuth(token)

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'week'

    // Calculate date range based on period
    const startDate = new Date()
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'all':
        startDate.setFullYear(2000)
        break
    }

    // Get top users
    const topUsers = await prisma.user.findMany({
      where: {
        gallery: {
          some: {
            ratings: {
              some: {
                createdAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      include: {
        profiles: true,
        gallery: {
          include: {
            ratings: true
          }
        }
      },
      take: 10
    })

    // Calculate user ratings and get their top media
    const usersWithRatings = topUsers.map(user => {
      const allRatings = user.gallery.flatMap(media => media.ratings)
      const averageRating = allRatings.reduce((acc, curr) => acc + curr.value, 0) / allRatings.length
      
      // Get top rated media
      const topMedia = user.gallery.reduce((best, curr) => {
        const avgRating = curr.ratings.reduce((sum, r) => sum + r.value, 0) / curr.ratings.length
        return avgRating > (best?.avgRating || 0) ? { ...curr, avgRating } : best
      }, null)

      return {
        id: user.id,
        profiles: user.profiles,
        averageRating,
        totalRatings: allRatings.length,
        topMedia: topMedia ? {
          url: topMedia.url,
          type: topMedia.type,
          rating: topMedia.avgRating
        } : null
      }
    }).sort((a, b) => b.averageRating - a.averageRating)

    // Get top photos
    const topPhotos = await prisma.gallery.findMany({
      where: {
        type: 'image',
        ratings: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      },
      include: {
        ratings: true,
        user: {
          include: {
            profiles: true
          }
        }
      },
      take: 12
    })

    // Get top videos
    const topVideos = await prisma.gallery.findMany({
      where: {
        type: 'video',
        ratings: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      },
      include: {
        ratings: true,
        user: {
          include: {
            profiles: true
          }
        }
      },
      take: 8
    })

    // Calculate average ratings for media
    const processMedia = (media: any) => ({
      ...media,
      averageRating: media.ratings.reduce((acc: number, curr: any) => acc + curr.value, 0) / media.ratings.length
    })

    const processedPhotos = topPhotos
      .map(processMedia)
      .sort((a, b) => b.averageRating - a.averageRating)

    const processedVideos = topVideos
      .map(processMedia)
      .sort((a, b) => b.averageRating - a.averageRating)

    return NextResponse.json({
      users: usersWithRatings,
      photos: processedPhotos,
      videos: processedVideos
    })
  } catch (error) {
    console.error('Top rankings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
