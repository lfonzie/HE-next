import type { ReactNode } from 'react'

export type ThemeName = 'light' | 'dark'
export type ThemePreference = 'system' | 'user'

export interface ThemeContextValue {
  /** Active theme applied to the document. */
  theme: ThemeName
  /** Mirrors `theme` for compatibility with older APIs. */
  resolvedTheme: ThemeName
  /** Real-time value of the system preference. */
  systemTheme: ThemeName
  /** Indicates whether the final theme comes from the user or the OS. */
  preference: ThemePreference
  /** Convenience boolean for toggles. */
  isDark: boolean
  /** True once the provider runs on the client. */
  mounted: boolean
  /** Persist and apply a new theme. */
  setTheme: (value: ThemeName | 'system' | ((current: ThemeName) => ThemeName | 'system')) => void
  /** Toggle between light and dark, preserving persistence. */
  toggleTheme: () => void
}

export interface ThemeProviderProps {
  children: ReactNode
}

export const THEME_STORAGE_KEY: 'theme'
export const ThemeContext: import('react').Context<ThemeContextValue | undefined>
export function ThemeProvider(props: ThemeProviderProps): JSX.Element
export function useThemeContext(): ThemeContextValue
