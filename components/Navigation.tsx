'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Info, Code } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: Info },
  { name: 'API Demo', href: '/api-demo', icon: Code },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">HE Next</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
            <ThemeToggle variant="ghost" size="sm" />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle variant="ghost" size="sm" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-accent'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
