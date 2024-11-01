// src/app/api/messages/contacts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { ERRORS, ROLE_FEATURES } from '@/lib/constants'
import { checkPermission } from '@/lib/utils/permissions'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: ERRORS.AUTH.UNAUTHORIZED },
        { status: 401 }
      )
    }

    const user = await verifyAuth(token)

    // Check if user can access messages
    if (!checkPermission(user.role, 'canSendMessages')) {
      return NextResponse.json(
        { error: 'Premium feature only' },
        { status: 403 }
      )
    }

    // Get search query from URL
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    // Get blocked users to exclude them
    const blockedUsers = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: user.id },
          { blockedId: user.id }
        ]
      },
      select: {
        blockerId: true,
        blockedId: true
      }
    })

    const blockedUserIds = [
      ...blockedUsers.map(b => b.blockerId),
      ...blockedUsers.map(b => b.blockedId)
    ]

    // Base query
    const baseQuery = {
      where: {
        id: {
          not: user.id,
          notIn: blockedUserIds
        },
        // Only include users with active profiles
        profiles: {
          some: {}
        }
      },
      select: {
        id: true,
        lastOnline: true,
        role: true,
        profiles: {
          select: {
            id: true,
            name: true,
            avatar: true,
            type: true
          }
        },
        // Get the most recent message between users
        messages: {
          where: {
            OR: [
              { senderId: user.id },
              { receiverId: user.id }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            read: true
          }
        },
        // Get received messages that are unread
        receivedMsgs: {
          where: {
            senderId: user.id,
            read: false
          },
          select: {
            id: true
          }
        }
      }
    }

    // Add search filter if provided
    if (search) {
      baseQuery.where = {
        ...baseQuery.where,
        profiles: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      }
    }

    // Get all contacts with their last message
    const contacts = await prisma.user.findMany({
      ...baseQuery,
      orderBy: {
        messages: {
          createdAt: 'desc'
        }
      }
    })

    // Format the response
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      profiles: contact.profiles,
      lastOnline: contact.lastOnline,
      isOnline: isUserOnline(contact.lastOnline, contact.role),
      lastMessage: contact.messages[0] ? {
        content: contact.messages[0].content,
        createdAt: contact.messages[0].createdAt,
        read: contact.messages[0].read
      } : null,
      unreadCount: contact.receivedMsgs.length
    }))

    // Sort contacts: users with unread messages first, then by last message time
    const sortedContacts = formattedContacts.sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount
      }
      if (!a.lastMessage && !b.lastMessage) return 0
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    })

    return NextResponse.json(sortedContacts)

  } catch (error) {
    console.error('Contacts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// Helper function to check if user is online
function isUserOnline(lastOnline: Date, role: string): boolean {
  if (!lastOnline) return false
  
  const offlineThreshold = role === 'FREE' 
    ? 5 * 60 * 1000  // 5 minutes for free users
    : 15 * 60 * 1000 // 15 minutes for others

  return Date.now() - lastOnline.getTime() < offlineThreshold
}

// Add route for getting online contacts count
export async function HEAD(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return new Response(null, { status: 401 })

    const user = await verifyAuth(token)

    if (!checkPermission(user.role, 'canSendMessages')) {
      return new Response(null, { status: 403 })
    }

    const onlineCount = await getOnlineContactsCount(user.id)
    
    return new Response(null, {
      headers: {
        'X-Online-Contacts': onlineCount.toString()
      }
    })
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

// Helper function to get online contacts count
async function getOnlineContactsCount(userId: string): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

  const onlineUsers = await prisma.user.count({
    where: {
      id: { not: userId },
      OR: [
        {
          role: 'FREE',
          lastOnline: {
            gte: fiveMinutesAgo
          }
        },
        {
          role: { not: 'FREE' },
          lastOnline: {
            gte: fifteenMinutesAgo
          }
        }
      ]
    }
  })

  return onlineUsers
}