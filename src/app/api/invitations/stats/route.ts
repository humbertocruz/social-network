// src/app/api/invitations/stats/route.ts
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

    // Get invitation tree statistics
    const invitationTree = await prisma.user.findMany({
      where: {
        invitationPath: {
          contains: user.id
        }
      },
      include: {
        profiles: {
          select: {
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            sentInvitations: true,
            invitedUsers: true
          }
        }
      }
    })

    // Calculate network growth
    const networkByLevel = invitationTree.reduce((acc, user) => {
      const level = user.invitationLevel
      if (!acc[level]) acc[level] = 0
      acc[level]++
      return acc
    }, {} as Record<number, number>)

    // Get active users in network
    const activeUsers = invitationTree.filter(user => {
      const lastActive = new Date(user.lastOnline)
      return Date.now() - lastActive.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
    }).length

    // Calculate viral coefficient
    const totalInvites = invitationTree.reduce((sum, user) => 
      sum + user._count.sentInvitations, 0
    )
    const viralCoefficient = invitationTree.length > 0 
      ? totalInvites / invitationTree.length 
      : 0

    return NextResponse.json({
      networkSize: invitationTree.length,
      networkByLevel,
      activeUsers,
      viralCoefficient,
      networkDepth: Math.max(...Object.keys(networkByLevel).map(Number)),
      topInviters: invitationTree
        .sort((a, b) => b._count.sentInvitations - a._count.sentInvitations)
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          name: user.profiles[0]?.name,
          invitations: user._count.sentInvitations,
          level: user.invitationLevel
        }))
    })
  } catch (error) {
    console.error('Failed to fetch invitation statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation statistics' },
      { status: 500 }
    )
  }
}
