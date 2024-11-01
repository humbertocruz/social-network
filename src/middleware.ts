// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { ROLES, TIME, ROUTES } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
  }

  try {
    const user = await verifyAuth(token)
    
    // Check for FREE users' session time
    if (user.role === ROLES.FREE) {
      const lastOnline = new Date(user.lastOnline)
      const timeDiff = Date.now() - lastOnline.getTime()
      
      if (timeDiff > TIME.FREE_USER_SESSION) {
        return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
      }
    }

    // Check for TESTER expiration
    if (user.role === ROLES.TESTER && user.testerExpires) {
      if (new Date() > new Date(user.testerExpires)) {
        // Convert to FREE user
        await prisma.user.update({
          where: { id: user.id },
          data: { role: ROLES.FREE }
        })
        return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
      }
    }

    // Check for admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && user.role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
    
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
  }
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/messages/:path*',
    '/gallery/:path*',
    '/events/:path*',
    '/admin/:path*'
  ],
}
