import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Skip middleware for static files and API routes (no logging for these)
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webmanifest|xml)$/) ||
      request.nextUrl.pathname.includes('favicon') ||
      request.nextUrl.pathname.includes('manifest') ||
      request.nextUrl.pathname.includes('apple-touch-icon') ||
      request.nextUrl.pathname.includes('android-chrome') ||
      request.nextUrl.pathname.includes('.well-known') ||
      request.nextUrl.pathname === '/sitemap.xml' ||
      request.nextUrl.pathname === '/robots.txt') {
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
    '/perplexity-demo', // Add perplexity demo to public routes
    '/live-audio', // Live Audio Visualizer - public access
                '/status', // Status dashboard
                '/status-public', // Public status page
                '/status-simple', // Simple status page
                '/analytics', // Analytics (both business and dashboard)
                '/insights', // SQL insights
                '/ti', // TI Support module
    '/embed' // Embed modules (ENEM, Redação) - public for iframe embedding
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
    const response = NextResponse.next()
    
    // Special headers for embeddable routes (apenas /embed/*)
    const isEmbeddableRoute = request.nextUrl.pathname.startsWith('/embed/')
    
    if (isEmbeddableRoute) {
      const allowedDomains = process.env.EMBED_ALLOWED_DOMAINS?.split(',').map(d => d.trim()) || []
      const origin = request.headers.get('origin') || ''
      
      // Verificar se a origem está autorizada
      let isAllowedOrigin = false
      if (origin && allowedDomains.length > 0) {
        try {
          const originUrl = new URL(origin)
          const originDomain = originUrl.hostname
          
          isAllowedOrigin = allowedDomains.some(allowedDomain => 
            originDomain === allowedDomain || originDomain.endsWith(`.${allowedDomain}`)
          )
        } catch (error) {
          // Origem inválida
        }
      }
      
      // Em desenvolvimento, permitir todos se configurado
      const allowAllInDev = isDevelopment && process.env.EMBED_ALLOW_ALL_DEV === 'true'
      
      if (isAllowedOrigin || allowAllInDev) {
        // Headers para permitir iframe
        response.headers.set('X-Frame-Options', 'ALLOWALL')
        response.headers.delete('X-Frame-Options') // Remover restrição
        
        // CORS headers
        response.headers.set('Access-Control-Allow-Origin', origin || '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-embed-token')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        
        // Content Security Policy para permitir iframe
        response.headers.set('Content-Security-Policy', "frame-ancestors 'self' *")
        
        if (isDevelopment && process.env.DEBUG_MIDDLEWARE === 'true') {
          console.log(`📦 [EMBED] Permitindo acesso de: ${origin || 'desconhecido'} para ${request.nextUrl.pathname}`)
        }
      } else if (origin) {
        // Origem não autorizada
        console.log(`⛔ [EMBED] Origem não autorizada: ${origin} para ${request.nextUrl.pathname}`)
        // Ainda permitir acesso direto, mas não configurar headers de iframe especiais
      }
    }
    
    return response
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