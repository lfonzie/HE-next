"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class LiveChatErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('LiveChat Error Boundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          Erro no Chat ao Vivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Ocorreu um erro inesperado no sistema de chat ao vivo:</p>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            {error.message}
          </code>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Se o problema persistir, tente:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Atualizar a página</li>
            <li>Verificar sua conexão com a internet</li>
            <li>Usar o chat tradicional em vez do chat ao vivo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom error fallback for audio-specific errors
export function AudioErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="w-5 h-5" />
          Problema com Áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Não foi possível acessar o microfone ou reproduzir áudio:</p>
          <code className="block p-2 bg-muted rounded text-xs">
            {error.message}
          </code>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Soluções possíveis:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Verificar permissões do microfone no navegador</li>
            <li>Usar um navegador compatível (Chrome, Firefox, Safari)</li>
            <li>Verificar se há outros aplicativos usando o microfone</li>
            <li>Usar o chat de texto como alternativa</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom error fallback for connection errors
export function ConnectionErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          Erro de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Não foi possível conectar ao serviço de chat ao vivo:</p>
          <code className="block p-2 bg-muted rounded text-xs">
            {error.message}
          </code>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconectar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Possíveis causas:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Problemas de conectividade</li>
            <li>Serviço temporariamente indisponível</li>
            <li>Configuração de API incorreta</li>
            <li>Limite de uso excedido</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
