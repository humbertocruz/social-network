// src/app/api/invitations/resend/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyAuth(token)
    const { invitationId } = await request.json()

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        inviterId: user.id,
        isUsed: false
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation' },
        { status: 400 }
      )
    }

    // Update expiration
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Reset to 24 hours
      }
    })

    // Resend email
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: invitation.email,
      subject: 'Invitation Reminder - Join Vibe!',
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
              <h1>Reminder: You're Invited to Vibe!</h1>
              <p>This is a reminder of your invitation from ${user.email} to join Vibe - No Lies.</p>
              <p>Your invitation code is:</p>
              <div class="code">${invitation.code}</div>
              <p>This code will expire in 24 hours.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/register?email=${invitation.email}" class="button">
                Click here to register
              </a>
              <p>If you didn't request this invitation, please ignore this email.</p>
            </div>
          </body>
        </html>
      `
    })

    return NextResponse.json({
      message: 'Invitation resent successfully'
    })
  } catch (error) {
    console.error('Failed to resend invitation:', error)
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }
}
