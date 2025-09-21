import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Skip middleware for static files and API routes (no logging for these)
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webmanifest)$/) ||
      request.nextUrl.pathname.includes('favicon') ||
      request.nextUrl.pathname.includes('manifest') ||
      request.nextUrl.pathname.includes('apple-touch-icon') ||
      request.nextUrl.pathname.includes('android-chrome') ||
      request.nextUrl.pathname.includes('.well-known')) {
    return NextResponse.next()
  }

  // Allow access to auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.next()
  }
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/contato',
    '/about',
    '/faq',
    '/privacidade',
    '/termos',
    '/suporte',
    '/demo',
    '/demo-register',
    '/demo-simple',
    '/api-demo',
    '/unsplash-demo',
    '/math-demo',
    '/math-test',
    '/test-auth',
    '/test-hubedu-interactive',
    '/test-math',
    '/test-progressive',
    '/test-visual',
    '/dark-mode-demo',
    '/chat-advanced',
    '/chat',
    '/lessons',
    '/enem-public',
    '/debug-auth',
    '/aulas', // Temporarily make aulas public for debugging
    '/enem', // Temporarily make enem public for debugging
    '/redacao' // Temporarily make redacao public for debugging
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )

  // Only log important routes and only when DEBUG_MIDDLEWARE is enabled
  if (isDevelopment && process.env.DEBUG_MIDDLEWARE === 'true') {
    console.log('🔍 Middleware - Processing:', request.nextUrl.pathname)
  }

  // For debugging, let's be more permissive
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Try to get token with multiple cookie names
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token'
  ]

  let token = null
  for (const cookieName of cookieNames) {
    try {
      token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: cookieName
      })
      if (token) {
        break
      }
    } catch (error) {
      // Silent error handling - only log in case of critical issues
      if (isDevelopment && error instanceof Error && error.message.includes('JWT')) {
        console.error('❌ JWT Error:', error.message)
      }
    }
  }

  if (!token) {
    // Only log redirects when DEBUG_MIDDLEWARE is enabled
    if (isDevelopment && process.env.DEBUG_MIDDLEWARE === 'true') {
      console.log('🔒 No valid token found, redirecting to login for:', request.nextUrl.pathname)
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}