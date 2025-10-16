'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export const THEME_STORAGE_KEY = 'theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

/**
 * Applies the theme to the <html> element by updating the data-theme attribute and
 * synchronising the color-scheme property. This enables consistent styling, native form
 * controls that respect the theme, and prevents a flash of incorrect colors.
 */
function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = theme
  root.style.setProperty('color-scheme', theme === 'dark' ? 'dark' : 'light')
}

export const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')
  const [systemTheme, setSystemTheme] = useState('light')
  const [preference, setPreference] = useState('user')
  const [mounted, setMounted] = useState(false)
  const preferenceRef = useRef('user')

  const updatePreference = useCallback((value) => {
    preferenceRef.current = value
    setPreference(value)
  }, [])

  const commitTheme = useCallback((nextTheme, persist) => {
    // Força sempre o tema claro
    applyThemeToDocument('light')

    if (typeof window === 'undefined') return

    try {
      if (persist) {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
      } else {
        window.localStorage.removeItem(THEME_STORAGE_KEY)
      }
    } catch (error) {
      // Ignored: storage may be unavailable (private browsing, SSR, etc.)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Força sempre o tema claro
    setSystemTheme('light')
    setThemeState('light')
    setMounted(true)
    commitTheme('light', true)
    updatePreference('user')
  }, [commitTheme, updatePreference])

  const setTheme = useCallback(
    (value) => {
      // Força sempre o tema claro independente do valor recebido
      setThemeState('light')
      commitTheme('light', true)
      updatePreference('user')
    },
    [commitTheme, updatePreference]
  )

  const toggleTheme = useCallback(() => {
    // Desabilita o toggle - sempre mantém o tema claro
    setTheme('light')
  }, [setTheme])

  const value = useMemo(() => {
    // Sempre retorna tema claro
    return {
      theme: 'light',
      resolvedTheme: 'light',
      systemTheme: 'light',
      preference: 'user',
      isDark: false,
      mounted,
      setTheme,
      toggleTheme,
    }
  }, [mounted, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }

  return context
}
