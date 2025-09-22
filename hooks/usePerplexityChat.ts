import { useState, useCallback } from 'react'
// Temporarily comment out useChat to avoid import issues
// import { useChat } from '@ai-sdk/react'

interface UsePerplexityChatOptions {
  onStreamingStart?: () => void
  onStreamingEnd?: () => void
  onError?: (error: Error) => void
}

export function usePerplexityChat(options: UsePerplexityChatOptions = {}) {
  const { onStreamingStart, onStreamingEnd, onError } = options

  // Temporary local state management instead of useChat
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const sendMessage = useCallback(async (message: string, module?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Add user message immediately
      const newMessages = [...messages, { role: 'user', content: message }]
      setMessages(newMessages)
      setInput('') // Clear input

      const response = await fetch('/api/chat/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          module: module || 'auto',
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Processar streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      onStreamingStart?.()

      let fullResponse = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk

        // Atualizar mensagens com streaming
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'user', content: message },
          { role: 'assistant', content: fullResponse }
        ])
      }

      onStreamingEnd?.()
    } catch (error) {
      console.error('Error sending message to Perplexity:', error)
      setError(error as Error)
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [messages, onStreamingStart, onStreamingEnd, onError])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input, 'professor')
    }
  }, [input, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const reload = useCallback(() => {
    // Simple reload implementation
    console.log('Reload not implemented in this version')
  }, [])

  const stop = useCallback(() => {
    setIsLoading(false)
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    sendMessage,
    clearMessages,
    isLoading,
    error,
    reload,
    stop,
  }
}
