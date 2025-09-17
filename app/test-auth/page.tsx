"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuthPost = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: 'Hello from frontend',
          timestamp: new Date().toISOString()
        }),
      })
      
      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Teste de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da Sessão */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Status da Sessão (Frontend)</h3>
            <div className="flex items-center gap-2">
              <Badge variant={session ? "default" : "secondary"}>
                {session ? "Autenticado" : "Não autenticado"}
              </Badge>
              <Badge variant="outline">
                Status: {status}
              </Badge>
            </div>
            {session && (
              <div className="text-sm text-muted-foreground">
                <p>Email: {session.user?.email}</p>
                <p>Nome: {session.user?.name}</p>
                <p>ID: {session.user?.id}</p>
              </div>
            )}
          </div>

          {/* Botões de Teste */}
          <div className="flex gap-4">
            <Button 
              onClick={testAuth} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Testar GET
            </Button>
            
            <Button 
              onClick={testAuthPost} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Testar POST
            </Button>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Resultado do Teste</h3>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "Sucesso" : "Erro"}
                </Badge>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Informações de Debug */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informações de Debug</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Ambiente: {process.env.NODE_ENV || 'development'}</p>
              <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
