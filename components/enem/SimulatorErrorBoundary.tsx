"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class SimulatorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error for monitoring
    console.error('Simulator Error Boundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to monitoring service (if available)
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // This would integrate with your error monitoring service
      // Example: Sentry, LogRocket, etc.
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      // In a real implementation, you would send this to your monitoring service
      console.log('Error logged for monitoring:', errorData)
    } catch (loggingError) {
      console.error('Failed to log error to monitoring service:', loggingError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleGoHome = () => {
    window.location.href = '/enem'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                Encontramos um problema inesperado no simulador. 
                Não se preocupe, seus dados estão seguros.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    Detalhes técnicos (modo desenvolvimento)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Se o problema persistir, entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    
    // Send to monitoring service
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      console.log('Error logged for monitoring:', errorData)
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  return { handleError }
}
