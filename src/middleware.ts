// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { 
  ROLES, 
  TIME, 
  ROUTES, 
  ROLE_FEATURES,
  ERRORS 
} from '@/lib/constants'
import { checkPermission } from '@/lib/utils/permissions'

// Routes that don't require authentication
const publicRoutes = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  '/api/auth/login',
  '/api/auth/register',
]

// Routes that require admin access
const adminRoutes = [
  '/admin',
  '/api/admin'
]

// Routes that require premium access
const premiumRoutes = [
  ROUTES.MESSAGES,
  '/api/messages'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  if (!token) {
    return handleUnauthorized(request)
  }

  try {
    const user = await verifyAuth(token)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)

    // Check feature access
    const requiredFeature = getRequiredFeature(pathname)
    if (requiredFeature && !checkPermission(user.role, requiredFeature)) {
      return handleForbidden(request, pathname)
    }

    // Only check session time and tester expiration for non-admin users
    if (user.role !== ROLES.ADMIN) {
      // Check FREE user session time
      if (user.role === ROLES.FREE) {
        const sessionCheck = await checkFreeUserSession(user)
        if (!sessionCheck.valid) {
          return sessionCheck.response
        }
      }

      // Check TESTER expiration
      if (user.role === ROLES.TESTER) {
        const testerCheck = await checkTesterExpiration(user)
        if (!testerCheck.valid) {
          return testerCheck.response
        }
      }
    }

    // Rate limiting (can be different for admin users)
    if (pathname.startsWith('/api')) {
      const rateLimit = await checkRateLimit(
        request.ip ?? 'unknown',
        pathname,
        user.role === ROLES.ADMIN
      )
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'Retry-After': rateLimit.retryAfter.toString()
            }
          }
        )
      }
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Update last activity
    response.cookies.set('last_active', new Date().toISOString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response

  } catch (error) {
    return handleError(error, request)
  }
}

// Helper functions
function getRequiredFeature(pathname: string): string | null {
  const featureMap = {
    '/messages': 'canSendMessages',
    '/gallery': 'canUploadImages',
    '/events': 'canCreateEvents',
    '/radar': 'canSeeLocation',
    // Add more path-to-feature mappings
  }

  return Object.entries(featureMap).find(([path]) => 
    pathname.startsWith(path)
  )?.[1] ?? null
}

async function checkFreeUserSession(user: any) {
  const lastOnline = new Date(user.lastOnline)
  const sessionTime = Date.now() - lastOnline.getTime()

  if (sessionTime > TIME.FREE_USER_SESSION) {
    return {
      valid: false,
      response: NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastOnline: new Date() }
  })

  return { valid: true }
}

async function checkTesterExpiration(user: any) {
  if (user.testerExpires && new Date() > new Date(user.testerExpires)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: ROLES.FREE }
    })

    return {
      valid: false,
      response: NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }
  }

  return { valid: true }
}

function handleUnauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: ERRORS.AUTH.UNAUTHORIZED },
      { status: 401 }
    )
  }
  return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
}

function handleForbidden(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: ERRORS.GENERAL.FORBIDDEN },
      { status: 403 }
    )
  }
  return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
}

function handleError(error: any, request: NextRequest) {
  console.error('Middleware error:', error)
  
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: ERRORS.GENERAL.SERVER_ERROR },
      { status: 500 }
    )
  }
  return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
