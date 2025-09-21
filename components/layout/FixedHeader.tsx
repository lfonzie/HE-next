'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface FixedHeaderProps {
  showLoginButton?: boolean
}

export function FixedHeader({ showLoginButton = false }: FixedHeaderProps) {
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
    `fixed top-0 w-full z-50 transition-all duration-300 ${
      isClient && scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white/90 backdrop-blur-sm'
    } border-b-2 border-yellow-300`,
    [scrollY, isClient]
  )

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/chat" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
            Chat IA
          </Link>
          <Link href="/enem" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
            Simulador ENEM
          </Link>
          <Link href="/redacao" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
            Redação ENEM
          </Link>
          <Link href="/aulas" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
            Aulas IA
          </Link>
        </nav>
        
        {showLoginButton && (
          <button 
            disabled
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-2xl shadow-lg flex items-center gap-2 cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            EM BREVE
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

