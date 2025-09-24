'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  Menu, 
  X, 
  Home, 
  MessageSquare, 
  BookOpen, 
  Target, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserProfile } from './UserProfile'
import './CompactSidebar.css'

interface CompactSidebarProps {
  className?: string
  showHome?: boolean
}

// Componente interno que usa useSession
function CompactSidebarContent({ className, showHome = true }: CompactSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [pathname, setPathname] = useState<string>('')
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Initialize Next.js hooks safely after mount
  useEffect(() => {
    const initializeHooks = async () => {
      try {
        const { getSession } = await import('next-auth/react')
        
        // Get session
        const sessionData = await getSession()
        setSession(sessionData)
        
        // Get current pathname
        setPathname(window.location.pathname)
        
        // Listen for route changes
        const handleRouteChange = () => {
          setPathname(window.location.pathname)
          setIsExpanded(false)
        }
        
        window.addEventListener('popstate', handleRouteChange)
        
        return () => {
          window.removeEventListener('popstate', handleRouteChange)
        }
      } catch (error) {
        console.warn('Failed to initialize hooks:', error)
        setSession(null)
        setPathname(window.location.pathname)
      }
    }
    
    initializeHooks()
  }, [])

  // Auto-close on route change
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  // Initialize body classes on mount
  useEffect(() => {
    // Set initial state
    document.body.classList.add('sidebar-collapsed')
    document.body.classList.remove('sidebar-expanded')
  }, [])

  // Update body class for content adjustment
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('sidebar-expanded')
      document.body.classList.remove('sidebar-collapsed')
    } else {
      document.body.classList.add('sidebar-collapsed')
      document.body.classList.remove('sidebar-expanded')
    }

    return () => {
      document.body.classList.remove('sidebar-expanded', 'sidebar-collapsed')
    }
  }, [isExpanded])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isExpanded])

  const navigationItems = [
    { name: 'Chat', href: '/chat', icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Aulas', href: '/aulas', icon: BookOpen, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { name: 'ENEM', href: '/enem', icon: Target, color: 'text-red-600', bgColor: 'bg-red-50' },
    { name: 'Redação', href: '/redacao', icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    window.location.href = href
    setIsExpanded(false)
  }

  return (
    <>
      {/* Ultra-Modern Compact Sidebar - Fixed Position */}
      <div 
        ref={sidebarRef}
        className={cn(
          'compact-sidebar-fixed h-full',
          isExpanded ? 'expanded' : 'collapsed',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Modern Header with Logo */}
          <div className="compact-sidebar-header">
            {isExpanded ? (
              <>
                <div className="compact-sidebar-logo">
                  <Image 
                    src="/assets/Logo_HubEdu.ia.svg" 
                    alt="HubEdu.ia Logo" 
                    width={32}
                    height={32}
                    className="h-8 w-auto"
                  />
                  <div className="compact-sidebar-logo-text">
                    <span className="text-black">Hub</span>
                    <span className="text-yellow-500">Edu</span>
                    <span className="text-black">.ia</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="compact-sidebar-toggle"
                  aria-label="Recolher sidebar"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="compact-sidebar-logo compact-sidebar-toggle"
                aria-label="Expandir sidebar"
              >
                <Image 
                  src="/assets/Logo_HubEdu.ia.svg" 
                  alt="HubEdu.ia Logo" 
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </button>
            )}
          </div>

          {/* Modern Navigation */}
          <nav className="compact-sidebar-nav">
            {showHome && (
              <button
                onClick={() => handleNavigation('/')}
                className={cn(
                  'compact-sidebar-item',
                  isActive('/') && 'active',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? 'Início' : undefined}
              >
                <Home className="compact-sidebar-item-icon" />
                {isExpanded && <span className="compact-sidebar-item-text">Início</span>}
              </button>
            )}

            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'compact-sidebar-item',
                  isActive(item.href) && 'active',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon className="compact-sidebar-item-icon" />
                {isExpanded && <span className="compact-sidebar-item-text">{item.name}</span>}
              </button>
            ))}
          </nav>

          {/* Modern User Profile */}
          <div className="compact-sidebar-user">
            <UserProfile 
              size="sm" 
              showName={isExpanded}
              dropdownDirection="up"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="compact-sidebar-overlay lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}

// Componente wrapper que verifica se está montado
export function CompactSidebar({ className, showHome = true }: CompactSidebarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        'compact-sidebar-fixed h-full collapsed',
        className
      )}>
        <div className="flex flex-col h-full">
          <div className="compact-sidebar-header">
            <div className="compact-sidebar-logo">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">H</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <CompactSidebarContent className={className} showHome={showHome} />
}

// Hook para usar o sidebar em qualquer página
export function useCompactSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleSidebar = () => setIsExpanded(!isExpanded)
  const expandSidebar = () => setIsExpanded(true)
  const collapseSidebar = () => setIsExpanded(false)

  return {
    isExpanded,
    toggleSidebar,
    expandSidebar,
    collapseSidebar
  }
}