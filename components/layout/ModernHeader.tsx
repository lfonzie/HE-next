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

  const headerClasses = useMemo(
    () =>
      cn(
        'fixed top-0 w-full z-50 border-b transition-all duration-300 backdrop-blur',
        transparent
          ? 'border-transparent bg-transparent shadow-none'
          : isClient && scrollY > 50
            ? 'border-[color:var(--color-border-strong)] bg-[var(--color-surface-elevated)] shadow-elevated'
            : 'border-[color:var(--color-border)] bg-[var(--color-surface-veil)] shadow-soft',
        className
      ),
    [scrollY, isClient, transparent, className]
  )

  return (
    <header className={headerClasses}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 overflow-visible">
        <div className="flex justify-between items-center overflow-visible">
          {/* Left side - Logo + Nome + Navigation + User Profile */}
          <div className="flex items-center gap-3">
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
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <div className="text-base font-bold text-[var(--color-text-strong)]">
                <span className="text-[var(--color-text-strong)]">Hub</span>
                <span className="text-[var(--color-accent)]">Edu</span>
                <span className="text-[var(--color-text-strong)]">.ia</span>
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
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="text-lg font-bold text-[var(--color-text-strong)]">
                <span className="text-[var(--color-text-strong)]">Hub</span>
                <span className="text-[var(--color-accent)]">Edu</span>
                <span className="text-[var(--color-text-strong)]">.ia</span>
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
          <div className="flex items-center gap-4 text-[var(--color-text-strong)]">
            {/* Support Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSupportModalOpen(true)}
              className="hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
                className="hidden sm:flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 font-bold text-[var(--color-accent-contrast)] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)] hover:shadow-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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

