/**
 * Componente de exemplo para demonstrar streaming otimizado
 * Mostra como usar as configurações otimizadas para streaming em tempo real
 */

"use client"

import React, { useState, useCallback } from 'react'
import { useMessageStreaming } from '@/hooks/useMessageStreaming'
import { StreamingConfigManager, STREAMING_PRESETS } from '@/lib/streaming-config'

interface OptimizedStreamingDemoProps {
  className?: string
}

export default function OptimizedStreamingDemo({ className = '' }: OptimizedStreamingDemoProps) {
  const [message, setMessage] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  
  // Usar configuração otimizada por padrão
  const streamingHook = useMessageStreaming()
  
  const configManager = StreamingConfigManager.getInstance()

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isStreaming) return

    setIsStreaming(true)
    setStreamingContent('')

    try {
      // Configurar para streaming em tempo real
      configManager.optimizeForRealtime()
      
      // Simular streaming de mensagem
      const chunks = message.split(' ')
      let content = ''
      
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simular latência
        content += chunks[i] + ' '
        setStreamingContent(content)
      }
      
    } catch (error) {
      console.error('Streaming error:', error)
    } finally {
      setIsStreaming(false)
    }
  }, [message, isStreaming, configManager])

  const handlePresetChange = useCallback((preset: keyof typeof STREAMING_PRESETS) => {
    configManager.usePreset(preset)
  }, [configManager])

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Streaming Otimizado Demo</h2>
      
      {/* Controles de configuração */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configurações de Streaming:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePresetChange('CHAT_REALTIME')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Tempo Real
          </button>
          <button
            onClick={() => handlePresetChange('AUDIO_STREAMING')}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Áudio
          </button>
          <button
            onClick={() => handlePresetChange('LARGE_DATA')}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            Dados Grandes
          </button>
          <button
            onClick={() => handlePresetChange('CRITICAL_TIME')}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Crítico
          </button>
        </div>
      </div>

      {/* Input de mensagem */}
      <div className="mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem para testar o streaming..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={3}
        />
      </div>

      {/* Botão de envio */}
      <button
        onClick={handleSendMessage}
        disabled={!message.trim() || isStreaming}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isStreaming ? 'Streaming...' : 'Enviar Mensagem'}
      </button>

      {/* Área de streaming */}
      {streamingContent && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Conteúdo Streaming:</h3>
          <div className="min-h-[100px] p-3 bg-white rounded border">
            {streamingContent}
            {isStreaming && <span className="animate-pulse">|</span>}
          </div>
        </div>
      )}

      {/* Informações de configuração atual */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800">Configuração Atual:</h4>
        <div className="text-sm text-blue-700 mt-1">
          Buffer: {configManager.getConfig().bufferSize} | 
          Flush: {configManager.getConfig().flushInterval}ms | 
          Chunk: {configManager.getConfig().chunkSize}
        </div>
      </div>
    </div>
  )
}
