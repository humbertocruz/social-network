import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
})

export async function POST(request: Request) {
  try {
    const { email, code } = verifySchema.parse(await request.json())

    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid verification data' },
      { status: 400 }
    )
  }
}
