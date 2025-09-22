'use client'

import { useState } from 'react'
import { usePerplexityChat } from '@/hooks/usePerplexityChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Trash2, TestTube } from 'lucide-react'

export default function PerplexityDemo() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    sendMessage,
    clearMessages,
    isLoading,
    error,
  } = usePerplexityChat({
    onStreamingStart: () => console.log('Streaming started'),
    onStreamingEnd: () => console.log('Streaming ended'),
    onError: (error) => console.error('Error:', error),
  })


  const testPerplexityConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/test-perplexity')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: 'Test failed', details: error })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input && input.trim()) {
      sendMessage(input, 'professor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Perplexity AI SDK Demo
            </CardTitle>
            <CardDescription>
              Demonstração da integração do Vercel AI SDK com Perplexity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testPerplexityConnection} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Testar Conexão
              </Button>
              <Button 
                onClick={clearMessages} 
                variant="outline"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Limpar Chat
              </Button>
            </div>

            {testResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Resultado do Teste</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Digite sua pergunta sobre educação..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !(input && input.trim())}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Erro: {error.message}
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message, index) => (
                <Card key={index} className={message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                        {message.role === 'user' ? 'Usuário' : 'Perplexity'}
                      </Badge>
                      {isLoading && index === messages.length - 1 && message.role === 'assistant' && (
                        <Badge variant="outline" className="animate-pulse">
                          Digitando...
                        </Badge>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Nenhuma mensagem ainda. Faça uma pergunta para começar!</p>
                <p className="text-xs mt-2">
                  Exemplo: "Explique sobre a Revolução Francesa para o ENEM"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
