'use client'

import { useState, useEffect, useRef } from 'react'

interface StreamFeedbackProps {
  content: string
  theme: string
  sessionId: string
  onComplete?: () => void
}

interface StreamMessage {
  type: 'status' | 'progress' | 'complete' | 'error'
  message: string
  progress?: number
  sessionId?: string
  error?: string
}

export default function StreamFeedback({ 
  content, 
  theme, 
  sessionId, 
  onComplete 
}: StreamFeedbackProps) {
  const [messages, setMessages] = useState<StreamMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!content || !theme || !sessionId) return

    startStreaming()
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [content, theme, sessionId])

  const startStreaming = async () => {
    try {
      setIsStreaming(true)
      setMessages([])
      setCurrentProgress(0)

      // Criar EventSource para receber o stream
      const eventSource = new EventSource('/api/redacao/stream-feedback', {
        // Note: EventSource não suporta POST, então vamos usar fetch com stream
      })

      // Usar fetch com stream em vez de EventSource
      const response = await fetch('/api/redacao/stream-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          theme,
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Manter última linha incompleta no buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              setMessages(prev => [...prev, data])
              
              if (data.progress !== undefined) {
                setCurrentProgress(data.progress)
              }

              if (data.type === 'complete') {
                setIsStreaming(false)
                onComplete?.()
              }

              if (data.type === 'error') {
                setIsStreaming(false)
                console.error('Erro no stream:', data.error)
              }
            } catch (parseError) {
              console.warn('Erro ao parsear mensagem do stream:', parseError)
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro ao iniciar stream:', error)
      setIsStreaming(false)
      setMessages(prev => [...prev, {
        type: 'error',
        message: 'Erro ao conectar com o servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }])
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Análise em Tempo Real
        </h3>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          {currentProgress}% concluído
        </div>
      </div>

      {/* Mensagens do stream */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-800'
                : message.type === 'complete'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'error' && (
                <span className="text-red-500">❌</span>
              )}
              {message.type === 'complete' && (
                <span className="text-green-500">✅</span>
              )}
              {message.type === 'progress' && (
                <span className="text-blue-500">🔄</span>
              )}
              {message.type === 'status' && (
                <span className="text-blue-500">ℹ️</span>
              )}
              <span className="text-sm font-medium">{message.message}</span>
            </div>
            
            {message.error && (
              <div className="mt-2 text-xs text-red-600">
                {message.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status atual */}
      {isStreaming && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processando análise...</span>
        </div>
      )}

      {!isStreaming && messages.length > 0 && messages[messages.length - 1]?.type === 'complete' && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-green-600">
          <span>✅</span>
          <span>Análise concluída! Redirecionando para o resultado...</span>
        </div>
      )}
    </div>
  )
}
