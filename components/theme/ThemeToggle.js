'use client'

import { memo, useMemo } from 'react'
import { Moon, Sun, MonitorSmartphone } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

/**
 * Accessible theme toggle switch that emphasises the HubEdu yellow highlight (#FFEB3B)
 * when dark mode is active. It synchronises with the ThemeProvider and persists the
 * choice in localStorage while keeping the OS preference as a fallback.
 */
function ThemeToggleComponent({ className, hideLabel = false, size = 'default' }) {
  const { isDark, toggleTheme, setTheme, preference, systemTheme } = useTheme()

  const ariaLabel = useMemo(
    () => `Alternar para modo ${isDark ? 'claro' : 'escuro'}`,
    [isDark]
  )

  const preferenceHint =
    preference === 'system'
      ? 'Sincronizado com o sistema'
      : 'Preferência salva'

  const title =
    'Clique para alternar entre claro/escuro. Clique com o botão direito para seguir o sistema.'

  const handleContextMenu = (event) => {
    if (preference === 'system') return
    event.preventDefault()
    setTheme('system')
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={ariaLabel}
      title={title}
      className={cn('theme-toggle group inline-flex items-center gap-3', className)}
      data-size={size}
      data-state={isDark ? 'dark' : 'light'}
      onClick={toggleTheme}
      onContextMenu={handleContextMenu}
    >
      {!hideLabel && (
        <span className="theme-toggle__label">
          <span className="theme-toggle__label-text">
            {isDark ? 'Modo escuro' : 'Modo claro'}
          </span>
          <span className="theme-toggle__label-hint">{preferenceHint}</span>
        </span>
      )}

      <span className="theme-toggle__control" aria-hidden="true">
        <span className="theme-toggle__track" />
        <span className="theme-toggle__thumb">
          <span className="theme-toggle__icon">
            {preference === 'system' ? (
              <MonitorSmartphone className="h-3.5 w-3.5" />
            ) : isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </span>
        </span>
      </span>

      {size !== 'compact' && (
        <span className="theme-toggle__system" data-visible={preference === 'system'}>
          <span className="theme-toggle__system-indicator" aria-hidden="true" />
          <span className="theme-toggle__system-label">{systemTheme === 'dark' ? 'Sistema: escuro' : 'Sistema: claro'}</span>
        </span>
      )}
    </button>
  )
}

const ThemeToggle = memo(ThemeToggleComponent)
export default ThemeToggle
