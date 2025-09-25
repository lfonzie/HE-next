'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { ModernNavigation } from './ModernNavigation'
import { UserProfile } from './UserProfile'
import { SupportModal } from './SupportModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModernHeaderProps {
  className?: string
  showLoginButton?: boolean
  showNavigation?: boolean
  showHome?: boolean
  transparent?: boolean
  showUserProfile?: boolean
}

export function ModernHeader({ 
  className, 
  showLoginButton = false, 
  showNavigation = true,
  showHome = true,
  transparent = false,
  showUserProfile = true
}: ModernHeaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setScrollY(window.scrollY)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClasses = useMemo(() => 
    cn(
      'fixed top-0 w-full z-50 transition-all duration-300',
      transparent 
        ? 'bg-transparent' 
        : isClient && scrollY > 50 
          ? 'bg-white shadow-xl border-b border-gray-200' 
          : 'bg-white border-b border-yellow-300',
      className
    ),
    [scrollY, isClient, transparent, className]
  )

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-visible">
        <div className="flex justify-between items-center overflow-visible">
          {/* Left side - Logo + Nome + Navigation + User Profile */}
          <div className="flex items-center gap-4">
            {/* Mobile Navigation (Hamburger) - Primeiro */}
            {showNavigation && (
              <div className="lg:hidden">
                <ModernNavigation showHome={showHome} />
              </div>
            )}
            
            {/* Mobile Logo + Nome - Segundo */}
            <Link 
              href="/" 
              className="lg:hidden flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/assets/Logo_HubEdu.ia.svg" 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="text-lg font-bold">
                <span className="text-black">Hub</span>
                <span className="text-yellow-500">Edu</span>
                <span className="text-black">.ia</span>
              </div>
            </Link>
            
            {/* Desktop Logo */}
            <Link 
              href="/" 
              className="hidden lg:flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/assets/Logo_HubEdu.ia.svg" 
                alt="HubEdu.ia Logo" 
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="text-xl font-bold">
                <span className="text-black">Hub</span>
                <span className="text-yellow-500">Edu</span>
                <span className="text-black">.ia</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            {showNavigation && (
              <div className="hidden lg:block">
                <ModernNavigation showHome={showHome} />
              </div>
            )}
          </div>
          
          {/* Right side - Support + User Profile + Login Button */}
          <div className="flex items-center gap-4">
            {/* Support Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSupportModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-yellow-50 hover:text-yellow-600 transition-colors rounded-xl"
              title="Suporte"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Suporte</span>
            </Button>

            {/* User Profile - Only on desktop */}
            {showUserProfile && (
              <div className="hidden lg:block">
                <UserProfile size="md" />
              </div>
            )}
            
            {/* Login Button */}
            {showLoginButton && (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </header>
  )
}

