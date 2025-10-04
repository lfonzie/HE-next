'use client'

import { useTheme } from '@/hooks/useTheme'
import { useDarkMode } from '@/hooks/useDarkMode'

export function DarkModeTest() {
  const { resolvedTheme } = useTheme()
  const { isDark, mounted } = useDarkMode()

  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <h3 className="font-bold mb-2 text-black dark:text-white">Teste CSS</h3>
      <div className="space-y-2">
        <div className="p-2 bg-yellow-50 dark:bg-gray-700 rounded aulas-section">
          <p className="text-black dark:text-white">Card teste</p>
        </div>
        
        {/* Teste específico do botão */}
        <div className="aulas-section">
          <button 
            className="p-4 bg-white/80 dark:bg-gray-800/90 border-2 border-blue-200 dark:border-gray-600 rounded-xl"
            style={{
              backgroundColor: isDark ? '#374151 !important' : undefined,
              background: isDark ? '#374151 !important' : undefined
            }}
          >
            <p className="text-black dark:text-white">Botão teste</p>
          </button>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>Tema: {resolvedTheme}</div>
          <div>Modo Escuro: {isDark ? '✅ Sim' : '❌ Não'}</div>
          <div>Montado: {mounted ? '✅ Sim' : '❌ Não'}</div>
          <div>Classe HTML: {typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}</div>
        </div>
      </div>
    </div>
  )
}