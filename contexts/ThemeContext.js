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
  const [theme, setThemeState] = useState(null)
  const [systemTheme, setSystemTheme] = useState('light')
  const [preference, setPreference] = useState('system')
  const [mounted, setMounted] = useState(false)
  const preferenceRef = useRef('system')

  const updatePreference = useCallback((value) => {
    preferenceRef.current = value
    setPreference(value)
  }, [])

  const commitTheme = useCallback((nextTheme, persist) => {
    applyThemeToDocument(nextTheme)

    if (typeof window === 'undefined') return

    try {
      if (persist) {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } else {
        window.localStorage.removeItem(THEME_STORAGE_KEY)
      }
    } catch (error) {
      // Ignored: storage may be unavailable (private browsing, SSR, etc.)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(COLOR_SCHEME_QUERY)
    const mediaQueryTheme = mediaQueryList.matches ? 'dark' : 'light'
    setSystemTheme(mediaQueryTheme)

    let storedTheme = null
    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch (error) {
      storedTheme = null
    }

    const hasStoredTheme = storedTheme === 'light' || storedTheme === 'dark'
    const initialTheme = hasStoredTheme ? storedTheme : mediaQueryTheme

    updatePreference(hasStoredTheme ? 'user' : 'system')
    setThemeState(initialTheme)
    setMounted(true)
    commitTheme(initialTheme, hasStoredTheme)

    const handleSystemChange = (event) => {
      const nextSystemTheme = event.matches ? 'dark' : 'light'
      setSystemTheme(nextSystemTheme)

      if (preferenceRef.current === 'system') {
        setThemeState(nextSystemTheme)
        commitTheme(nextSystemTheme, false)
        updatePreference('system')
      }
    }

    mediaQueryList.addEventListener('change', handleSystemChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleSystemChange)
    }
  }, [commitTheme, updatePreference])

  const setTheme = useCallback(
    (value) => {
      const incomingValue =
        typeof value === 'function' ? value(theme ?? systemTheme) : value

      if (incomingValue === 'system') {
        setThemeState(systemTheme)
        commitTheme(systemTheme, false)
        updatePreference('system')
        return
      }

      const normalizedValue = incomingValue === 'dark' ? 'dark' : 'light'
      setThemeState(normalizedValue)
      commitTheme(normalizedValue, true)
      updatePreference('user')
    },
    [commitTheme, systemTheme, theme, updatePreference]
  )

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  const value = useMemo(() => {
    const activeTheme = theme ?? systemTheme

    return {
      theme: activeTheme,
      resolvedTheme: activeTheme,
      systemTheme,
      preference,
      isDark: activeTheme === 'dark',
      mounted,
      setTheme,
      toggleTheme,
    }
  }, [mounted, preference, setTheme, systemTheme, theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }

  return context
}
