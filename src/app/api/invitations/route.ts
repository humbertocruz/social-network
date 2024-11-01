import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const inviteSchema = z.object({
  email: z.string().email()
})

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    const { email } = inviteSchema.parse(await request.json())

    // Check if invitation already exists and is valid
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent and still valid' },
        { status: 400 }
      )
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        code,
        inviterId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Send email
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Welcome to Vibe!',
      html: `
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #8B5CF6;
                letter-spacing: 4px;
                padding: 20px;
                background: #f4f4f5;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background: #8B5CF6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to Vibe!</h1>
              <p>You've been invited by ${user.email} to join Vibe - No Lies.</p>
              <p>Your invitation code is:</p>
              <div class="code">${code}</div>
              <p>This code will expire in 24 hours.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/register?email=${email}" class="button">
                Click here to register
              </a>
              <p>If you didn't request this invitation, please ignore this email.</p>
            </div>
          </body>
        </html>
      `
    })

    return NextResponse.json({
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
