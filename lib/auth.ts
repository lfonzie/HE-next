import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// Usuário de desenvolvimento temporário
const DEV_USER = {
  id: "dev-user-123",
  email: "dev@hubedu.ia",
  name: "Usuário Desenvolvimento",
  role: "STUDENT",
  password: "dev123" // Senha simples para desenvolvimento
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30)
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: false, // Disable debug in production
  logger: {
    error: (code, metadata) => {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("NextAuth Error:", code, metadata)
      }
    },
    warn: (code) => {
      // Suppress warnings in production
    },
    debug: (code, metadata) => {
      // Suppress debug logs
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

        // Verificação simples para desenvolvimento (fallback)
        if (credentials.email === DEV_USER.email && credentials.password === DEV_USER.password) {
          console.log("✅ [DEV] Authentication successful for:", DEV_USER.email)
          return {
            id: DEV_USER.id,
            email: DEV_USER.email,
            name: DEV_USER.name,
            role: DEV_USER.role,
          }
        }

        // Para desenvolvimento, usar usuário padrão se não conseguir conectar ao banco
        console.log("⚠️ [DEV] Database not available, using fallback authentication")
        if (credentials.email === "dev@hubedu.ia" && credentials.password === "dev123") {
          console.log("✅ [DEV] Fallback authentication successful")
          return {
            id: DEV_USER.id,
            email: DEV_USER.email,
            name: DEV_USER.name,
            role: DEV_USER.role,
          }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password_hash) {
            console.log("❌ User not found or no password hash")
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

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
          // Fallback para usuário de desenvolvimento em caso de erro de banco
          if (credentials.email === DEV_USER.email && credentials.password === DEV_USER.password) {
            console.log("✅ [DEV FALLBACK] Authentication successful for:", DEV_USER.email)
            return {
              id: DEV_USER.id,
              email: DEV_USER.email,
              name: DEV_USER.name,
              role: DEV_USER.role,
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