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
  debug: false,
  logger: {
    error: (code, metadata) => {
      if (isDevelopment) {
        console.error('NextAuth error:', code, metadata)
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user?.password_hash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            return null
          }

          const userRole =
            typeof user.role === 'string' && user.role.length > 0
              ? user.role
              : undefined

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole,
          }
        } catch (error) {
          if (isDevelopment) {
            console.error('Authentication error:', error)
          }
          throw new Error('Unable to sign in')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id

        if ('role' in user && typeof user.role === 'string') {
          ;(token as Record<string, unknown>).role = user.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string

        const tokenRole = (token as Record<string, unknown>).role
        if (typeof tokenRole === 'string') {
          ;(session.user as Record<string, unknown>).role = tokenRole
        }
      }

      return session
    },
  },
}

export const auth = () => getServerSession(authOptions)

export default NextAuth(authOptions)
