import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
        profiles: session.profiles
      }
    })
  } catch (error) {
    return NextResponse.json({ user: null, error })
  }
}
