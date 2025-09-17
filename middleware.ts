import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes to improve performance
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webmanifest|json)$/) ||
      request.nextUrl.pathname === '/manifest.webmanifest' ||
      request.nextUrl.pathname === '/robots.txt' ||
      request.nextUrl.pathname === '/sitemap.xml') {
    return NextResponse.next()
  }

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

  // Only get token for protected routes
  const token = await getToken({ req: request })
  
  // Allow access to auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/forgot-password') ||
      request.nextUrl.pathname.startsWith('/reset-password')) {
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
    '/chat-advanced'
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  )

  // Allow Next.js static files and assets (already handled above)

  // Require authentication for all protected routes
  if (!isPublicRoute && !request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      // Preserve the original URL for redirect after login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
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

  // Admin API routes authentication
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin token not configured' }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match routes that actually need middleware processing
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webmanifest|json)$).*)',
  ]
}
