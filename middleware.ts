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
    '/lessons'
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )

  // Allow Next.js static files and assets
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.startsWith('/robots.txt') ||
      request.nextUrl.pathname.startsWith('/sitemap.xml') ||
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next()
  }

  // Require authentication for all protected routes
  if (!isPublicRoute && !request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
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
      request.nextUrl.pathname.startsWith('/admin-escola') ||
      request.nextUrl.pathname.startsWith('/admin')) {
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
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/chat/:path*',
    '/enem/:path*',
    '/enem-old/:path*',
    '/simulador/:path*',
    '/aula/:path*',
    '/aulas/:path*',
    '/professor/:path*',
    '/professor-interactive/:path*',
    '/professor-interactive-demo/:path*',
    '/professor-optimized/:path*',
    '/analytics/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/admin-dashboard/:path*',
    '/admin-system-prompts/:path*',
    '/admin-escola/:path*',
    
    // Public routes (for explicit handling)
    '/',
    '/contato/:path*',
    '/apresentacao/:path*',
    '/about/:path*',
    '/faq/:path*',
    '/privacidade/:path*',
    '/termos/:path*',
    '/suporte/:path*',
    '/demo/:path*',
    '/demo-register/:path*',
    '/demo-simple/:path*',
    '/api-demo/:path*',
    '/unsplash-demo/:path*',
    '/math-demo/:path*',
    '/math-test/:path*',
    '/test-auth/:path*',
    '/test-hubedu-interactive/:path*',
    '/test-math/:path*',
    '/test-progressive/:path*',
    '/test-visual/:path*',
    '/dark-mode-demo/:path*',
    '/chat-advanced/:path*',
    
    // Auth routes
    '/login/:path*',
    '/register/:path*',
    '/forgot-password/:path*',
    '/reset-password/:path*',
    
    // API routes
    '/api/chat/:path*',
    '/api/enem/:path*',
    '/api/professor/:path*',
    '/api/module-professor-interactive/:path*',
    '/api/support/:path*',
    '/api/admin/:path*',
    
    // Static files
    '/_next/static/:path*',
    '/_next/image/:path*',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ]
}
