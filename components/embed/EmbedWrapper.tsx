'use client'

import { useEffect, useState } from 'react'
import { getParentDomain } from '@/lib/embed-validator'
import { AlertCircle } from 'lucide-react'

interface EmbedWrapperProps {
  children: React.ReactNode
  module: 'enem' | 'redacao'
}

/**
 * Wrapper para páginas embed
 * Adiciona estilos otimizados para iframe e validação client-side
 */
export function EmbedWrapper({ children, module }: EmbedWrapperProps) {
  const [isInIframe, setIsInIframe] = useState(true)
  const [parentDomain, setParentDomain] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se está em iframe
    const inIframe = window !== window.parent
    setIsInIframe(inIframe)

    // Tentar obter domínio pai
    const domain = getParentDomain()
    setParentDomain(domain)

    // Log para debugging
    console.log(`📦 [EMBED-${module.toUpperCase()}] Carregado em iframe:`, inIframe)
    if (domain) {
      console.log(`📦 [EMBED-${module.toUpperCase()}] Domínio pai:`, domain)
    }

    // Comunicação com parent frame (postMessage)
    const handleMessage = (event: MessageEvent) => {
      // Validar origem se necessário
      console.log('📨 [EMBED] Mensagem recebida:', event.data)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [module])

  // Aviso se não estiver em iframe (apenas visual, não bloqueia)
  if (!isInIframe && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Módulo Embed
          </h2>
          <p className="text-gray-600 mb-4">
            Este módulo é destinado para uso em iframe. Para acessar a versão completa,
            visite <a href="https://hubedu.ia.br" className="text-blue-600 hover:underline">hubedu.ia.br</a>
          </p>
          <p className="text-sm text-gray-500">
            Módulo: <span className="font-mono font-semibold">{module}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Estilos específicos para embed */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        /* Remover bordas e margens desnecessárias */
        .embed-container {
          min-height: 100vh;
          width: 100%;
        }

        /* Otimizações para iframe */
        * {
          box-sizing: border-box;
        }
      `}</style>

      <div className="embed-container">
        {children}
      </div>

      {/* Indicador de debug em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 bg-black/80 text-white text-xs px-3 py-2 rounded-full font-mono z-50">
          🎯 Embed: {module} {parentDomain && `• ${parentDomain}`}
        </div>
      )}
    </>
  )
}

