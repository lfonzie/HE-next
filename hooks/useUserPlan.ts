import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export type UserRole = 'FREE' | 'PREMIUM' | 'ADMIN'

export interface UserInfo {
  id: string
  name: string | null
  email: string | null
  birth_date: string | null
  city: string | null
  state: string | null
  school: string | null
  role: UserRole
}

export function useUserPlan() {
  const { data: session, status } = useSession()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch('/api/auth/user')
          if (response.ok) {
            const data = await response.json()
            setUserInfo(data.user)
          }
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      }
      setLoading(false)
    }

    fetchUserInfo()
  }, [session, status])

  return {
    userInfo,
    role: userInfo?.role || 'FREE',
    isPremium: userInfo?.role === 'PREMIUM',
    isFree: userInfo?.role === 'FREE',
    isAdmin: userInfo?.role === 'ADMIN',
    loading,
    isAuthenticated: status === 'authenticated'
  }
}
