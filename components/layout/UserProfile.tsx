'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  UserCircle,
  Shield,
  BookOpen,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfileProps {
  className?: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  dropdownDirection?: 'down' | 'up' | 'left' | 'right'
}

export function UserProfile({ 
  className, 
  showName = false, 
  size = 'md',
  dropdownDirection = 'down'
}: UserProfileProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [actualDirection, setActualDirection] = useState(dropdownDirection)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect best direction for dropdown based on viewport
  useEffect(() => {
    const detectDirection = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        
        // In mobile, prefer opening downward unless there's not enough space
        if (window.innerWidth < 1024) { // Mobile
          setActualDirection(spaceBelow < 200 && spaceAbove > spaceBelow ? 'up' : 'down')
        } else {
          setActualDirection(dropdownDirection)
        }
      }
    }

    if (isOpen) {
      detectDirection()
    }
  }, [isOpen, dropdownDirection])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
    setIsOpen(false)
  }

  const handleSettingsClick = () => {
    router.push('/settings')
    setIsOpen(false)
  }

  const handleDashboardClick = () => {
    router.push('/dashboard')
    setIsOpen(false)
  }

  if (status === 'loading') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 animate-pulse',
        className
      )}>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        {showName && <div className="w-20 h-4 bg-gray-300 rounded"></div>}
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'
  
  // Type assertion para acessar propriedades estendidas
  const userWithRole = user as typeof user & { role?: string }

  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6 text-xs',
      name: 'text-sm',
      icon: 'h-3 w-3'
    },
    md: {
      avatar: 'w-8 h-8 text-sm',
      name: 'text-base',
      icon: 'h-4 w-4'
    },
    lg: {
      avatar: 'w-10 h-10 text-base',
      name: 'text-lg',
      icon: 'h-5 w-5'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
          'border border-transparent hover:border-gray-200',
          isOpen && 'bg-gray-50 border-gray-200'
        )}
        aria-label="Abrir menu do perfil"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-semibold',
          currentSize.avatar
        )}>
          {userInitials}
        </div>

        {/* Name (optional) */}
        {showName && (
          <span className={cn('font-medium text-gray-700', currentSize.name)}>
            {user.name || user.email}
          </span>
        )}

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={cn(
            'text-gray-500 transition-transform duration-200',
            currentSize.icon,
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50',
          actualDirection === 'up' && 'bottom-full mb-2 left-0 user-profile-dropdown',
          actualDirection === 'down' && 'top-full mt-2 right-0',
          actualDirection === 'left' && 'right-full mr-2 top-0',
          actualDirection === 'right' && 'left-full ml-2 top-0',
          // Mobile specific positioning
          'md:right-0', // Desktop/tablet: alinhado à direita
          'max-md:right-auto max-md:left-0 max-md:w-80' // Mobile: alinhado à esquerda e mais largo
        )}>
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-semibold',
                currentSize.avatar
              )}>
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.name || 'Usuário'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>
                {userWithRole.role && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 capitalize">
                      {userWithRole.role.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-[var(--color-text-strong)] transition-colors duration-150 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
            >
              <UserCircle className="h-4 w-4 text-gray-500" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={handleDashboardClick}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-[var(--color-text-strong)] transition-colors duration-150 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
            >
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={handleSettingsClick}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-[var(--color-text-strong)] transition-colors duration-150 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Configurações</span>
            </button>

            {/* Theme Switcher */}
            <div className="px-4 py-2">
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-subtle"></div>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-[var(--color-error)] transition-colors duration-150 hover:bg-[rgba(207,102,121,0.16)]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
