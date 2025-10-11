import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      
      // Handle Google OAuth
      if (account?.provider === 'google') {
        try {
          const userEmail = user.email || ''
          const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN || 'colegioose.com.br'
          const superAdminEmail = process.env.GOOGLE_SUPERADMIN_EMAIL || 'fonseca@colegioose.com.br'
          
          // Verificar se o email pertence ao domínio autorizado
          if (!userEmail.endsWith(`@${allowedDomain}`)) {
            console.error(`❌ [AUTH] Email ${userEmail} não autorizado. Apenas @${allowedDomain} permitido.`)
            throw new Error(`Apenas emails @${allowedDomain} são autorizados para login.`)
          }
          
          // Determinar a role do usuário
          const isSuperAdmin = userEmail === superAdminEmail
          const defaultRole = isSuperAdmin ? 'ADMIN' : 'FREE'
          
          console.log(`✅ [AUTH] Email autorizado: ${userEmail} (${isSuperAdmin ? 'ADMIN' : 'Usuário FREE'})`)
          
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
          })
          
          if (existingUser) {
            // Se for superadmin e a role estiver diferente, atualizar
            if (isSuperAdmin && existingUser.role !== 'ADMIN') {
              const updatedUser = await prisma.user.update({
                where: { email: userEmail },
                data: { role: 'ADMIN' }
              })
              console.log(`🔄 [AUTH] Role atualizada para ADMIN: ${userEmail}`)
              token.id = updatedUser.id
              token.role = existingUser.role
            } else {
              token.id = existingUser.id
              token.role = existingUser.role
            }

            // Verificar se perfil está completo
            const isProfileComplete = existingUser.birth_date && existingUser.city && existingUser.state && existingUser.school
            token.profileComplete = isProfileComplete
          } else {
            // Create new user for Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: userEmail,
                name: user.name || '',
                role: defaultRole,
                plan: 'free',
              }
            })
            console.log(`✨ [AUTH] Novo usuário criado: ${userEmail} (${defaultRole})`)
            token.id = newUser.id
            token.role = newUser.role
            token.profileComplete = false // Novo usuário precisa completar perfil
          }
        } catch (error) {
          console.error('❌ [AUTH] Error handling Google OAuth:', error)
          throw error // Re-throw para bloquear o login
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.profileComplete = token.profileComplete as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Force redirect to hubedu.ia.br domain
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If URL is from the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Otherwise, redirect to base URL
      return baseUrl
    },
    async signIn({ user, account }) {
      // Para Google OAuth, verificar se é usuário free ou se perfil está completo
      if (account?.provider === 'google') {
        try {
          const userEmail = user.email || ''
          const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
          })

          if (existingUser) {
            // Usuários FREE podem acessar sem completar perfil
            const isFreeUser = existingUser.role === 'FREE'
            const isProfileComplete = existingUser.birth_date && existingUser.city && existingUser.state && existingUser.school

            // Só redirecionar para completar perfil se for PREMIUM e perfil não estiver completo
            if (existingUser.role === 'PREMIUM' && !isProfileComplete) {
              return '/complete-profile'
            }
          } else {
            // Novo usuário Google é criado como free automaticamente
            // Não precisa completar perfil para acessar
            return true
          }
        } catch (error) {
          console.error('Error checking profile completion:', error)
        }
      }

      return true
    },
  },
}

// Export the auth function for API routes
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
