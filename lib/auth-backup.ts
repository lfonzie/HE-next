import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'
import * as bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
  }
}

const authSecret = process.env.NEXTAUTH_SECRET
const isDevelopment = process.env.NODE_ENV === 'development'

if (!authSecret && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET must be defined in production environments')
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: true, // Enable NextAuth debug logs for troubleshooting
  useSecureCookies: process.env.NODE_ENV === 'production', // Only use secure cookies in production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Secure only in production
      },
    },
  },
  logger: {
    error: (code) => {
      // Only log critical errors, not routine issues
      if (isDevelopment && code !== 'CLIENT_FETCH_ERROR' && code !== 'DEBUG_ENABLED') {
        console.error('NextAuth error:', code)
      }
    },
    warn: (code) => {
      // Disable all warnings to reduce noise
      // Only log critical warnings if needed
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Authorize called with email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials')
          return null
        }

        try {
          console.log('🔍 [AUTH] Looking for user with email:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.log('❌ [AUTH] User not found:', credentials.email)
            return null
          }

          if (!user?.password_hash) {
            console.log('❌ [AUTH] User has no password hash:', credentials.email)
            return null
          }

          console.log('🔑 [AUTH] Verifying password for user:', user.email)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            console.log('❌ [AUTH] Invalid password for user:', credentials.email)
            return null
          }

          const userRole =
            typeof user.role === 'string' && user.role.length > 0
              ? user.role
              : undefined

          console.log('✅ [AUTH] Authentication successful for:', user.email, 'Role:', userRole)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole,
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          throw new Error('Unable to sign in')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id

          if ('role' in user && typeof user.role === 'string') {
            ;(token as Record<string, unknown>).role = user.role
          }
        }

        return token
      } catch (error) {
        console.error('NextAuth JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string

          const tokenRole = (token as Record<string, unknown>).role
          if (typeof tokenRole === 'string') {
            ;(session.user as Record<string, unknown>).role = tokenRole
          }
          
          // Only log session creation once per user session
          if (isDevelopment && !session.user.id) {
            console.log('✅ NextAuth session created for user:', session.user.email, 'Role:', tokenRole)
          }
        }

        return session
      } catch (error) {
        console.error('❌ NextAuth session callback error:', error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}

export const auth = () => getServerSession(authOptions)

export default NextAuth(authOptions)
