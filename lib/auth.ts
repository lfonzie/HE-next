import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 [AUTH] NextAuth authorize called with:", { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [AUTH] Missing credentials")
          return null
        }

        try {
          // Buscar usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log("❌ [AUTH] User not found:", credentials.email)
            return null
          }

          if (!user.password_hash) {
            console.log("❌ [AUTH] User has no password set:", credentials.email)
            return null
          }

          // Verificar senha
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!isValidPassword) {
            console.log("❌ [AUTH] Invalid password for:", credentials.email)
            return null
          }

          console.log("✅ [AUTH] Authentication successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("❌ [AUTH] Database error:", error)

          const isDevFallbackEnabled =
            process.env.NODE_ENV === 'development' &&
            process.env.ALLOW_DEV_AUTH_FALLBACK === 'true'

          if (isDevFallbackEnabled) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            if (message.includes("denied access") || message.includes("not available")) {
              console.log("⚠️ [AUTH] Database not available, using guarded fallback for development")

              if (credentials.email === "admin@hubedu.ia" && credentials.password === "admin123") {
                console.log("✅ [AUTH] Development fallback authentication successful")
                return {
                  id: "fallback-admin-123",
                  email: "admin@hubedu.ia",
                  name: "Admin Fallback",
                  role: "ADMIN",
                }
              }
            }
          }

          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

// Export the auth function for API routes
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
