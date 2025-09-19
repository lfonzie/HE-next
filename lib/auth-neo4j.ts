import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'
import { 
  findUserByEmailInNeo4j, 
  verifyPassword, 
  createInitialAdminUser 
} from '@/lib/neo4j-auth'

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
  debug: isDevelopment,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  logger: {
    error: (code, metadata) => {
      if (isDevelopment && code !== 'CLIENT_FETCH_ERROR' && code !== 'DEBUG_ENABLED') {
        console.error('NextAuth error:', code, metadata)
      }
    },
    warn: (code, metadata) => {
      // Disable warnings in production
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
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log('🔐 [Neo4j] Attempting authentication for:', credentials.email)
          
          // Find user in Neo4j
          const user = await findUserByEmailInNeo4j(credentials.email)

          if (!user || !user.password_hash) {
            console.log('❌ [Neo4j] User not found or no password hash')
            return null
          }

          // Verify password
          const isPasswordValid = await verifyPassword(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            console.log('❌ [Neo4j] Invalid password')
            return null
          }

          const userRole = typeof user.role === 'string' && user.role.length > 0
            ? user.role
            : 'STUDENT'

          console.log('✅ [Neo4j] Authentication successful for:', user.email, 'Role:', userRole)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole,
          }
        } catch (error) {
          console.error('❌ [Neo4j] Authentication error:', error)
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
          
          if (isDevelopment && !session.user.id) {
            console.log('✅ [Neo4j] NextAuth session created for user:', session.user.email, 'Role:', tokenRole)
          }
        }
        return session
      } catch (error) {
        console.error('❌ [Neo4j] NextAuth session callback error:', error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      if (isDevelopment) {
        console.log('🔐 [Neo4j] User signed in:', user.email)
      }
    },
    async signOut({ session, token }) {
      if (isDevelopment) {
        console.log('🔐 [Neo4j] User signed out')
      }
    }
  }
}

// Initialize admin user on startup
if (process.env.NODE_ENV === 'development') {
  createInitialAdminUser().catch(console.error)
}

export const auth = () => getServerSession(authOptions)

export default NextAuth(authOptions)
