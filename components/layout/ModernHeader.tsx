'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ModernNavigation } from './ModernNavigation'
import { cn } from '@/lib/utils'

interface ModernHeaderProps {
  className?: string
  showLoginButton?: boolean
  showNavigation?: boolean
  showHome?: boolean
  transparent?: boolean
}

export function ModernHeader({ 
  className, 
  showLoginButton = false, 
  showNavigation = true,
  showHome = true,
  transparent = false
}: ModernHeaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [scrollY, setScrollY] = useState(0)

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
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
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
          
          {/* Navigation */}
          {showNavigation && (
            <ModernNavigation showHome={showHome} />
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
    </header>
  )
}

