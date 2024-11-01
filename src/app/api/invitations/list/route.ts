// src/app/api/invitations/list/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyAuth(token)

    // Get all invitations sent by the user
    const invitations = await prisma.invitation.findMany({
      where: {
        inviterId: user.id
      },
      include: {
        invitedUser: {
          select: {
            email: true,
            profiles: {
              select: {
                name: true,
                type: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get invitation statistics
    const stats = await prisma.$transaction([
      // Total invitations
      prisma.invitation.count({
        where: {
          inviterId: user.id
        }
      }),
      // Used invitations
      prisma.invitation.count({
        where: {
          inviterId: user.id,
          isUsed: true
        }
      }),
      // Pending invitations
      prisma.invitation.count({
        where: {
          inviterId: user.id,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      // Expired invitations
      prisma.invitation.count({
        where: {
          inviterId: user.id,
          isUsed: false,
          expiresAt: {
            lt: new Date()
          }
        }
      }),
      // Last 7 days invitations
      prisma.invitation.count({
        where: {
          inviterId: user.id,
          createdAt: {
            gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Monthly invitations
    const monthlyInvitations = await prisma.invitation.groupBy({
      by: ['createdAt'],
      where: {
        inviterId: user.id,
        createdAt: {
          gt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    })

    const [total, used, pending, expired, lastWeek] = stats

    return NextResponse.json({
      invitations,
      statistics: {
        total,
        used,
        pending,
        expired,
        lastWeek,
        conversionRate: total > 0 ? (used / total) * 100 : 0,
        monthlyTrend: monthlyInvitations.map(item => ({
          date: item.createdAt,
          count: item._count
        }))
      }
    })
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
