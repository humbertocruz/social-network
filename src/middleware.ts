import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { FREE_USER_SESSION_TIME } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = await verifyAuth(token)
    
    if (user.role === 'FREE') {
      const lastOnline = new Date(user.lastOnline)
      const timeDiff = Date.now() - lastOnline.getTime()
      
      if (timeDiff > FREE_USER_SESSION_TIME) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (user.role === 'TESTER' && user.testerExpires) {
      if (new Date() > new Date(user.testerExpires)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'FREE' }
        })
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    
    // Check for admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/messages/:path*',
    '/gallery/:path*',
    '/events/:path*',
    '/admin/:path*',
    '/invitations/:path*'
  ],
}
