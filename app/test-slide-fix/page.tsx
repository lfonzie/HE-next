'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export default function TestSlideFixPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testSlideGeneration = async (slideNumber: number) => {
    setIsLoading(true)
    
    try {
      console.log(`[TEST] Testing slide ${slideNumber} generation`)
      
      const response = await fetch('/api/aulas/next-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: 'Química dos alimentos',
          slideNumber: slideNumber,
          lessonId: 'test_lesson_123'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[TEST] Received data for slide ${slideNumber}:`, data)

      setTestResults(prev => [...prev, {
        slideNumber,
        success: data.success,
        hasContent: !!data.slide?.content,
        hasQuestions: !!data.slide?.questions?.length,
        contentType: data.slide?.type,
        title: data.slide?.title,
        timestamp: new Date().toISOString()
      }])

    } catch (error) {
      console.error(`[TEST] Error testing slide ${slideNumber}:`, error)
      setTestResults(prev => [...prev, {
        slideNumber,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const testAllSlides = async () => {
    setTestResults([])
    
    // Test slides 1, 7, and 12 (the problematic ones mentioned)
    const slidesToTest = [1, 7, 12]
    
    for (const slideNumber of slidesToTest) {
      await testSlideGeneration(slideNumber)
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Teste de Correção dos Slides</h1>
        <p className="text-gray-600 mb-6">
          Esta página testa se as correções para os problemas de renderização de slides estão funcionando corretamente.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={testAllSlides} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Slides 1, 7 e 12'
            )}
          </Button>
          
          <Button 
            onClick={() => testSlideGeneration(1)}
            disabled={isLoading}
            variant="outline"
          >
            Testar Slide 1
          </Button>
          
          <Button 
            onClick={() => testSlideGeneration(7)}
            disabled={isLoading}
            variant="outline"
          >
            Testar Slide 7
          </Button>
          
          <Button 
            onClick={() => testSlideGeneration(12)}
            disabled={isLoading}
            variant="outline"
          >
            Testar Slide 12
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="outline"
          >
            Limpar Resultados
          </Button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados dos Testes</h2>
          
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Slide {result.slideNumber}</span>
                  <Badge 
                    variant={result.success ? "default" : "destructive"}
                    className={result.success ? "bg-green-600" : "bg-red-600"}
                  >
                    {result.success ? "Sucesso" : "Falha"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-2">
                    <p><strong>Título:</strong> {result.title}</p>
                    <p><strong>Tipo:</strong> {result.contentType}</p>
                    <p><strong>Tem Conteúdo:</strong> {result.hasContent ? "Sim" : "Não"}</p>
                    <p><strong>Tem Perguntas:</strong> {result.hasQuestions ? "Sim" : "Não"}</p>
                    <p><strong>Timestamp:</strong> {result.timestamp}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Erro:</strong> {result.error}</p>
                    <p><strong>Timestamp:</strong> {result.timestamp}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Correções Implementadas:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ <strong>Front-end:</strong> Adicionado mecanismo para buscar conteúdo real dos slides quando necessário</li>
          <li>✅ <strong>Front-end:</strong> Adicionado estado de carregamento durante busca de conteúdo</li>
          <li>✅ <strong>Backend:</strong> Aumentado max_tokens de 800 para 1000 para evitar truncamento</li>
          <li>✅ <strong>Backend:</strong> Melhorado parsing de JSON com correção de strings não terminadas</li>
          <li>✅ <strong>Backend:</strong> Adicionado mecanismo de retry para geração falhada</li>
          <li>✅ <strong>Backend:</strong> Melhorado tratamento de erros com fallbacks</li>
        </ul>
      </div>
    </div>
  )
}
