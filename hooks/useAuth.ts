import { useSession, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  const user = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'STUDENT',
    schoolId: session.user.schoolId || null,
    profileImageUrl: session.user.image || null,
    schoolPlan: 'PROFESSOR' // Default plan since school object is not available
  } : null

  const logout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return {
    user,
    logout,
    isLoading: status === 'loading'
  }
}
