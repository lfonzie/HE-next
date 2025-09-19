import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    console.log('🔍 Middleware - Processing:', request.nextUrl.pathname)
  }
  
  // Skip middleware for static files and API routes
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webmanifest)$/)) {
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
    '/apresentacao',
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

  if (isDevelopment) {
    console.log('🔍 Route analysis:', {
      path: request.nextUrl.pathname,
      isPublic: isPublicRoute,
      cookies: request.cookies.getAll().map(c => c.name)
    })
  }

  // For debugging, let's be more permissive
  if (isPublicRoute) {
    if (isDevelopment) {
      console.log('✅ Public route, allowing access')
    }
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
        if (isDevelopment) {
          console.log('✅ Token found with cookie:', cookieName)
        }
        break
      }
    } catch (error) {
      if (isDevelopment) {
        console.log('❌ Error getting token with cookie:', cookieName, error)
      }
    }
  }

  if (!token) {
    if (isDevelopment) {
      console.log('🔒 No valid token found, redirecting to login')
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isDevelopment) {
    console.log('✅ Token validated, allowing access to:', request.nextUrl.pathname)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}