import { useEffect, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onNext?: () => void
  onPrevious?: () => void
  onFullscreen?: () => void
  onExitFullscreen?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  isFullscreen?: boolean
  disabled?: boolean
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onFullscreen,
  onExitFullscreen,
  canGoNext = true,
  canGoPrevious = true,
  isFullscreen = false,
  disabled = false
}: KeyboardNavigationOptions) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver desabilitado ou se estiver em um input/textarea
    if (disabled || 
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return
    }

    // Prevenir comportamento padrão para teclas de navegação
    const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'F11', 'Escape']
    if (navigationKeys.includes(event.key)) {
      event.preventDefault()
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        if (canGoNext && onNext) {
          console.log('⌨️ Navegação por teclado: Próximo')
          onNext()
        }
        break
        
      case 'ArrowLeft':
      case 'ArrowUp':
        if (canGoPrevious && onPrevious) {
          console.log('⌨️ Navegação por teclado: Anterior')
          onPrevious()
        }
        break
        
      case 'F11':
        if (isFullscreen && onExitFullscreen) {
          console.log('⌨️ Navegação por teclado: Sair do fullscreen')
          onExitFullscreen()
        } else if (!isFullscreen && onFullscreen) {
          console.log('⌨️ Navegação por teclado: Entrar no fullscreen')
          onFullscreen()
        }
        break
        
      case 'Escape':
        if (isFullscreen && onExitFullscreen) {
          console.log('⌨️ Navegação por teclado: Sair do fullscreen (ESC)')
          onExitFullscreen()
        }
        break
        
      default:
        break
    }
  }, [onNext, onPrevious, onFullscreen, onExitFullscreen, canGoNext, canGoPrevious, isFullscreen, disabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    // Função para verificar se uma tecla específica está sendo pressionada
    isKeyPressed: (key: string) => {
      // Esta função pode ser expandida se necessário
      return false
    }
  }
}
