'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function useDarkMode() {
  const { resolvedTheme, mounted } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (!mounted) return

    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark')
      const isDarkTheme = resolvedTheme === 'dark'
      
      setIsDark(hasDarkClass && isDarkTheme)
    }

    checkDarkMode()

    // Observer para mudanças na classe dark
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })

    return () => observer.disconnect()
  }, [mounted, resolvedTheme])

  return { isDark, mounted }
}
