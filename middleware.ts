import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Handle missing development files in Next.js 15 App Router
  if (process.env.NODE_ENV === 'development') {
    if (request.nextUrl.pathname.includes('react-refresh.js')) {
      return new NextResponse('// React Refresh placeholder for Next.js 15 App Router', {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache'
        }
      })
    }
    
    if (request.nextUrl.pathname.includes('_app.js') || 
        request.nextUrl.pathname.includes('_error.js')) {
      return new NextResponse('// App/Error placeholder for Next.js 15 App Router', {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache'
        }
      })
    }
  }

  const token = await getToken({ req: request })
  
  // Allow access to auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.next()
  }
  
  // Require authentication for dashboard routes (temporarily disabled for development)
  // if (request.nextUrl.pathname.startsWith('/dashboard') ||
  //     request.nextUrl.pathname.startsWith('/chat') ||
  //     request.nextUrl.pathname.startsWith('/simulador')) {
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }
  // }
  
  // Allow API routes for development
  if (request.nextUrl.pathname.startsWith('/api/chat') ||
      request.nextUrl.pathname.startsWith('/api/enem') ||
      request.nextUrl.pathname.startsWith('/api/professor') ||
      request.nextUrl.pathname.startsWith('/api/support') ||
      request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }
  
  // Require authentication for admin routes
  if (request.nextUrl.pathname.startsWith('/admin-dashboard') ||
      request.nextUrl.pathname.startsWith('/admin-system-prompts') ||
      request.nextUrl.pathname.startsWith('/admin-escola')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user has admin privileges
    if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/simulador/:path*',
    '/professor-interactive/:path*',
    '/admin-dashboard/:path*',
    '/admin-system-prompts/:path*',
    '/admin-escola/:path*',
    '/api/chat/:path*',
    '/api/enem/:path*',
    '/api/professor/:path*',
    '/api/module-professor-interactive/:path*',
    '/api/support/:path*',
    '/api/admin/:path*',
    '/_next/static/:path*'
  ]
}
