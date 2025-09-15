import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"

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
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 [DEV] NextAuth authorize called with:", { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [DEV] Missing credentials")
          return null
        }

        // Verificação simples para desenvolvimento
        if (credentials.email === DEV_USER.email && credentials.password === DEV_USER.password) {
          console.log("✅ [DEV] Authentication successful for:", DEV_USER.email)
          return {
            id: DEV_USER.id,
            email: DEV_USER.email,
            name: DEV_USER.name,
            role: DEV_USER.role,
          }
        }

        console.log("❌ [DEV] Invalid credentials")
        return null
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
