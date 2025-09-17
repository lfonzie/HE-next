import { useState, useCallback, useEffect } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Verificar se o navegador suporta fullscreen
  useEffect(() => {
    const checkSupport = () => {
      const supported = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      )
      setIsSupported(supported)
    }

    checkSupport()
  }, [])

  // Monitorar mudanças no estado de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    // Adicionar listeners para diferentes navegadores
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = useCallback(async (element?: HTMLElement) => {
    if (!isSupported) {
      console.warn('Fullscreen não é suportado neste navegador')
      return false
    }

    const targetElement = element || document.documentElement

    try {
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen()
      } else if ((targetElement as any).webkitRequestFullscreen) {
        await (targetElement as any).webkitRequestFullscreen()
      } else if ((targetElement as any).mozRequestFullScreen) {
        await (targetElement as any).mozRequestFullScreen()
      } else if ((targetElement as any).msRequestFullscreen) {
        await (targetElement as any).msRequestFullscreen()
      } else {
        throw new Error('Fullscreen não é suportado')
      }
      
      console.log('✅ Entrou no modo fullscreen')
      return true
    } catch (error) {
      console.error('❌ Erro ao entrar no fullscreen:', error)
      return false
    }
  }, [isSupported])

  const exitFullscreen = useCallback(async () => {
    if (!isFullscreen) return false

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      } else {
        throw new Error('Exit fullscreen não é suportado')
      }
      
      console.log('✅ Saiu do modo fullscreen')
      return true
    } catch (error) {
      console.error('❌ Erro ao sair do fullscreen:', error)
      return false
    }
  }, [isFullscreen])

  const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
    if (isFullscreen) {
      return await exitFullscreen()
    } else {
      return await enterFullscreen(element)
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}
