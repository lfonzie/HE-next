'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Bug, Database, HardDrive, Globe, CheckCircle, XCircle } from 'lucide-react'

interface LessonDebuggerProps {
  lessonId: string
  onClose?: () => void
}

export function LessonDebugger({ lessonId, onClose }: LessonDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runDiagnostics = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const diagnostics = {
          lessonId,
          timestamp: new Date().toISOString(),
          localStorage: {
            demoLesson: localStorage.getItem(`demo_lesson_${lessonId}`),
            lesson: localStorage.getItem(`lesson_${lessonId}`),
            generatedLesson: localStorage.getItem(`generated_lesson_${lessonId}`),
            allKeys: Object.keys(localStorage).filter(key => key.includes(lessonId))
          },
          database: {
            fastLoad: null,
            regularLoad: null
          },
          navigation: {
            currentUrl: window.location.href,
            targetUrl: `/aulas/${lessonId}`,
            routerAvailable: typeof window !== 'undefined'
          }
        }

        // Test database connections
        try {
          const fastLoadResponse = await fetch('/api/lessons/fast-load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId })
          })
          diagnostics.database.fastLoad = {
            status: fastLoadResponse.status,
            ok: fastLoadResponse.ok,
            statusText: fastLoadResponse.statusText
          }
        } catch (dbError) {
          diagnostics.database.fastLoad = { error: (dbError as Error).message }
        }

        try {
          const regularLoadResponse = await fetch(`/api/lessons/${lessonId}`)
          diagnostics.database.regularLoad = {
            status: regularLoadResponse.status,
            ok: regularLoadResponse.ok,
            statusText: regularLoadResponse.statusText
          }
        } catch (dbError) {
          diagnostics.database.regularLoad = { error: (dbError as Error).message }
        }

        setDebugInfo(diagnostics)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    runDiagnostics()
  }, [lessonId])

  const clearLocalStorage = () => {
    const keys = Object.keys(localStorage).filter(key => key.includes(lessonId))
    keys.forEach(key => localStorage.removeItem(key))
    window.location.reload()
  }

  const retryNavigation = () => {
    window.location.href = `/aulas/${lessonId}`
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Executando Diagnósticos...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analisando problemas com a aula {lessonId}...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Erro no Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Diagnóstico da Aula: {lessonId}
        </CardTitle>
        {onClose && (
          <Button onClick={onClose} variant="outline" size="sm" className="absolute top-4 right-4">
            Fechar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* LocalStorage Status */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            LocalStorage
          </h3>
          <div className="space-y-2">
            {debugInfo.localStorage.allKeys.length > 0 ? (
              debugInfo.localStorage.allKeys.map((key: string) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-green-50 rounded border">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-mono text-sm">{key}</span>
                  <Badge variant="secondary">Encontrado</Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded border">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Nenhuma aula encontrada no localStorage</span>
              </div>
            )}
          </div>
        </div>

        {/* Database Status */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <span className="font-medium">Fast Load:</span>
              <Badge variant={debugInfo.database.fastLoad?.ok ? "default" : "destructive"}>
                {debugInfo.database.fastLoad?.status || 'Erro'}
              </Badge>
              {debugInfo.database.fastLoad?.statusText && (
                <span className="text-sm text-gray-600">
                  {debugInfo.database.fastLoad.statusText}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <span className="font-medium">Regular Load:</span>
              <Badge variant={debugInfo.database.regularLoad?.ok ? "default" : "destructive"}>
                {debugInfo.database.regularLoad?.status || 'Erro'}
              </Badge>
              {debugInfo.database.regularLoad?.statusText && (
                <span className="text-sm text-gray-600">
                  {debugInfo.database.regularLoad.statusText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Status */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Navegação
          </h3>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded border">
              <div className="text-sm">
                <strong>URL Atual:</strong> {debugInfo.navigation.currentUrl}
              </div>
              <div className="text-sm">
                <strong>URL Destino:</strong> {debugInfo.navigation.targetUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={clearLocalStorage} variant="outline">
            Limpar LocalStorage
          </Button>
          <Button onClick={retryNavigation}>
            Tentar Navegação Novamente
          </Button>
        </div>

        {/* Raw Debug Info */}
        <details className="pt-4 border-t">
          <summary className="cursor-pointer font-medium">Informações Técnicas Detalhadas</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

