// src/app/api/messages/contacts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await verifyAuth(token)

    if (user.role !== 'PREMIUM') {
      return NextResponse.json(
        { error: 'Premium feature only' },
        { status: 403 }
      )
    }

    // Get all users with their latest message
    const contacts = await prisma.user.findMany({
      where: {
        id: {
          not: user.id
        }
      },
      select: {
        id: true,
        profiles: {
          select: {
            name: true,
            avatar: true
          }
        },
        receivedMsgs: {
          where: {
            senderId: user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        },
        messages: {
          where: {
            receiverId: user.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
      }
    })

    // Format contacts with their last message
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      profiles: contact.profiles,
      lastMessage: [...contact.receivedMsgs, ...contact.messages]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    }))

    return NextResponse.json(formattedContacts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
