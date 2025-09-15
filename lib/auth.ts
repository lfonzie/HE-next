import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  logger: {
    error: (code, metadata) => {
      console.error("NextAuth Error:", code, metadata)
    },
    warn: (code) => {
      // Only log warnings in development
      if (process.env.NODE_ENV === "development") {
        console.warn("NextAuth Warning:", code)
      }
    },
    debug: (code, metadata) => {
      // Only log debug info if explicitly enabled
      if (process.env.NEXTAUTH_DEBUG === "true") {
        console.log("NextAuth Debug:", code, metadata)
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Only log in development or when debug is enabled
        if (process.env.NEXTAUTH_DEBUG === "true") {
          console.log("🔐 NextAuth authorize called with:", { email: credentials?.email })
        }
        
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NEXTAUTH_DEBUG === "true") {
            console.log("❌ Missing credentials")
          }
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password_hash) {
            if (process.env.NEXTAUTH_DEBUG === "true") {
              console.log("❌ User not found or no password hash")
            }
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            if (process.env.NEXTAUTH_DEBUG === "true") {
              console.log("❌ Invalid password")
            }
            return null
          }

          if (process.env.NEXTAUTH_DEBUG === "true") {
            console.log("✅ Authentication successful for:", user.email)
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("🚨 Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

// Export the auth function for API routes
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);