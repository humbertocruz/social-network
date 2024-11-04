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

    const users = await prisma.user.findMany()

    return NextResponse.json({
      users,
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users data' },
      { status: 500 }
    )
  }
}
