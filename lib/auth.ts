import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db'

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
  debug: isDevelopment, // Only enable debug in development
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
    error: (code, metadata) => {
      if (isDevelopment) {
        console.error('NextAuth error:', code, metadata)
        // Log mais detalhado para debugging
        if (code === 'JW' || code?.includes('JWT')) {
          console.error('JWT Error details:', { code, metadata, timestamp: new Date().toISOString() })
        }
      }
    },
    warn: (code, metadata) => {
      if (isDevelopment) {
        console.warn('NextAuth warning:', code, metadata)
      }
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
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log('🔍 Looking up user:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          if (!user?.password_hash) {
            console.log('❌ User has no password hash:', credentials.email)
            return null
          }

          console.log('🔍 Checking password for user:', user.email)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          const userRole =
            typeof user.role === 'string' && user.role.length > 0
              ? user.role
              : undefined

          console.log('✅ Authentication successful for:', user.email, 'Role:', userRole)
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
        if (isDevelopment) {
          console.log('🔍 NextAuth session callback:', { 
            hasToken: !!token, 
            hasSession: !!session, 
            tokenId: token?.id,
            sessionUser: session?.user?.email 
          })
        }
        
        if (token && session.user) {
          session.user.id = token.id as string

          const tokenRole = (token as Record<string, unknown>).role
          if (typeof tokenRole === 'string') {
            ;(session.user as Record<string, unknown>).role = tokenRole
          }
          
          if (isDevelopment) {
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
