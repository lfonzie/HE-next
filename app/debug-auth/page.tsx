'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from 'next-auth/react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      setDebugInfo({
        user: session?.user,
        expires: session?.expires,
        status: status,
        timestamp: new Date().toISOString()
      })
    }
  }, [session, status])

  const refreshSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setDebugInfo({
        ...data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Debug de Autenticação</h1>
          <p className="text-gray-600">Informações de debug para desenvolvimento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status da Sessão
              {status === 'authenticated' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : status === 'unauthenticated' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={status === 'authenticated' ? 'default' : 'destructive'}>
                {status}
              </Badge>
              <Button
                onClick={refreshSession}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {status === 'loading' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Carregando informações de autenticação...
                </AlertDescription>
              </Alert>
            )}

            {status === 'unauthenticated' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Usuário não autenticado. Faça login para ver as informações de debug.
                </AlertDescription>
              </Alert>
            )}

            {debugInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações da Sessão:</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">NODE_ENV:</span>
                <Badge variant="outline">{process.env.NODE_ENV}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">NEXTAUTH_URL:</span>
                <span className="text-sm text-gray-600">{process.env.NEXTAUTH_URL || 'Não definido'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="text-sm text-gray-600">{new Date().toISOString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}