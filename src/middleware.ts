// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = await verifyAuth(token)
    
    // Check for FREE users' session time
    if (user.role === 'FREE') {
      const lastOnline = new Date(user.lastOnline)
      const timeDiff = Date.now() - lastOnline.getTime()
      
      if (timeDiff > 5 * 60 * 1000) { // 5 minutes
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Check for TESTER expiration
    if (user.role === 'TESTER' && user.testerExpires) {
      if (new Date() > new Date(user.testerExpires)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/profile/:path*', '/messages/:path*', '/gallery/:path*', '/events/:path*']
}