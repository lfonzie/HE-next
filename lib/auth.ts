import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, metadata) => {
      console.error("NextAuth Error:", code, metadata)
    },
    warn: (code) => {
      console.warn("NextAuth Warning:", code)
    },
    debug: (code, metadata) => {
      console.log("NextAuth Debug:", code, metadata)
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
        console.log("🔐 NextAuth authorize called with:", { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log("👤 User found:", user ? "Yes" : "No")

          if (!user || !user.password_hash) {
            console.log("❌ User not found or no password hash")
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          console.log("🔑 Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            return null
          }

          console.log("✅ Authentication successful for:", user.email)
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

// Simple auth utilities for now
export const auth = {
  // Placeholder for authentication functions
  verifyToken: (token: string) => {
    // Simple token verification logic
    return { valid: true, userId: 'user123' };
  },
  
  generateToken: (userId: string) => {
    // Simple token generation logic
    return 'mock-token-' + userId;
  }
};

export default auth;