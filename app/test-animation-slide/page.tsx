'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimationSlide from '@/components/interactive/AnimationSlide';

export default function TestAnimationSlidePage() {
  const [testCase, setTestCase] = useState(1)

  const testCases = [
    {
      id: 1,
      title: 'Test Case 1: First Slide (should load Unsplash image)',
      props: {
        title: 'Abertura: Tema e Objetivos',
        content: 'Este é um teste do primeiro slide que deve carregar uma imagem do Unsplash.',
        isFirstSlide: true,
        isLastSlide: false,
        lessonTheme: 'Causas da Segunda Guerra Mundial'
      }
    },
    {
      id: 2,
      title: 'Test Case 2: Last Slide (should load Unsplash image)',
      props: {
        title: 'Encerramento: Síntese Final',
        content: 'Este é um teste do último slide que deve carregar uma imagem do Unsplash.',
        isFirstSlide: false,
        isLastSlide: true,
        lessonTheme: 'Causas da Segunda Guerra Mundial'
      }
    },
    {
      id: 3,
      title: 'Test Case 3: Middle Slide (no image)',
      props: {
        title: 'Conceitos Fundamentais',
        content: 'Este é um teste de um slide do meio que não deve carregar imagem.',
        isFirstSlide: false,
        isLastSlide: false,
        lessonTheme: 'Causas da Segunda Guerra Mundial'
      }
    },
    {
      id: 4,
      title: 'Test Case 4: With Dynamic Image URL',
      props: {
        title: 'Slide com Imagem Dinâmica',
        content: 'Este slide tem uma imagem URL dinâmica fornecida.',
        isFirstSlide: false,
        isLastSlide: false,
        lessonTheme: 'Causas da Segunda Guerra Mundial',
        imageUrl: 'https://picsum.photos/800/400?random=123'
      }
    }
  ]

  const currentTest = testCases.find(tc => tc.id === testCase) || testCases[0]

  const handleStageComplete = (result: any) => {
    console.log('Stage completed:', result)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Teste do AnimationSlide</h1>
        <p className="text-gray-600 mb-6">
          Esta página testa o componente AnimationSlide para verificar se as correções de null safety estão funcionando.
        </p>
        
        <div className="flex gap-4 mb-6">
          {testCases.map((tc) => (
            <Button
              key={tc.id}
              onClick={() => setTestCase(tc.id)}
              variant={testCase === tc.id ? "default" : "outline"}
              size="sm"
            >
              Teste {tc.id}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{currentTest.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Props do Teste:</h3>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(currentTest.props, null, 2)}
                </pre>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Componente AnimationSlide:</h3>
                <AnimationSlide
                  {...currentTest.props}
                  onComplete={handleStageComplete}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Teste 1:</strong> Deve carregar uma imagem do Unsplash para o primeiro slide</p>
              <p><strong>Teste 2:</strong> Deve carregar uma imagem do Unsplash para o último slide</p>
              <p><strong>Teste 3:</strong> Não deve tentar carregar imagem (slide do meio)</p>
              <p><strong>Teste 4:</strong> Deve usar a imagem URL dinâmica fornecida</p>
              <p className="mt-4 text-red-600">
                <strong>Erro esperado antes da correção:</strong> &quot;Cannot read properties of null (reading &apos;urls&apos;)&quot;
              </p>
              <p className="text-green-600">
                <strong>Comportamento esperado após correção:</strong> Componente renderiza sem erros, mostrando loading ou imagem
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
