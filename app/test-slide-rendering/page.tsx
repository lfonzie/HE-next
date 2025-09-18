'use client'

import { useState } from 'react'
import DynamicStage from '@/components/interactive/DynamicStage'

export default function TestSlideRenderingPage() {
  const [testCase, setTestCase] = useState(1)

  // Test case 1: ContentComponent with proper data
  const testSlide1 = {
    etapa: "Abertura: Tema e Objetivos",
    type: "content",
    activity: {
      component: "ContentComponent",
      content: "Bem-vindos à aula sobre Química dos Alimentos! Esta aula irá explorar os conceitos fundamentais da química aplicada aos alimentos, incluindo composição molecular, reações químicas e transformações que ocorrem durante o processamento e preparo dos alimentos.",
      time: 5,
      points: 5,
      imageUrl: "https://picsum.photos/800/400?random=1"
    },
    route: "/aulas/test/0"
  }

  // Test case 2: Missing component (should fallback to ContentComponent)
  const testSlide2 = {
    etapa: "Conceitos Fundamentais",
    type: "content",
    activity: {
      component: "", // Empty component
      content: "Os alimentos são compostos por diferentes tipos de moléculas: carboidratos, proteínas, lipídios, vitaminas e minerais. Cada um desses componentes tem propriedades químicas específicas que influenciam o sabor, textura e valor nutricional dos alimentos.",
      time: 5,
      points: 5
    },
    route: "/aulas/test/1"
  }

  // Test case 3: Missing activity (should create default)
  const testSlide3 = {
    etapa: "Conceitos Fundamentais",
    type: "content",
    content: "Este slide não tem atividade definida, mas deve renderizar com conteúdo padrão.",
    route: "/aulas/test/2"
    // No activity property
  }

  // Test case 4: Closing component
  const testSlide4 = {
    etapa: "Encerramento: Síntese Final",
    type: "closing",
    activity: {
      component: "ClosingComponent",
      content: "Parabéns! Você completou esta aula sobre Química dos Alimentos com sucesso! Continue explorando este tema fascinante.",
      time: 5,
      points: 10
    },
    route: "/aulas/test/3"
  }

  // Test case 5: Unknown component (should show error with debug info)
  const testSlide5 = {
    etapa: "Componente Desconhecido",
    type: "unknown",
    activity: {
      component: "UnknownComponent",
      content: "Este é um teste de componente desconhecido.",
      time: 5,
      points: 5
    },
    route: "/aulas/test/4"
  }

  const testSlides = [testSlide1, testSlide2, testSlide3, testSlide4, testSlide5]
  const currentSlide = testSlides[testCase - 1]

  const handleStageComplete = (result: any) => {
    console.log('Stage completed:', result)
  }

  const handleNext = () => {
    if (testCase < 5) {
      setTestCase(testCase + 1)
    }
  }

  const handlePrevious = () => {
    if (testCase > 1) {
      setTestCase(testCase - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Teste de Renderização de Slides
          </h1>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTestCase(1)}
              className={`px-4 py-2 rounded ${
                testCase === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Teste 1: ContentComponent
            </button>
            <button
              onClick={() => setTestCase(2)}
              className={`px-4 py-2 rounded ${
                testCase === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Teste 2: Componente Vazio
            </button>
            <button
              onClick={() => setTestCase(3)}
              className={`px-4 py-2 rounded ${
                testCase === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Teste 3: Atividade Ausente
            </button>
            <button
              onClick={() => setTestCase(4)}
              className={`px-4 py-2 rounded ${
                testCase === 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Teste 4: ClosingComponent
            </button>
            <button
              onClick={() => setTestCase(5)}
              className={`px-4 py-2 rounded ${
                testCase === 5 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Teste 5: Componente Desconhecido
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Teste {testCase}: {currentSlide.etapa}
          </h2>
          
          <DynamicStage
            stage={currentSlide}
            stageIndex={testCase - 1}
            totalStages={5}
            onComplete={handleStageComplete}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={testCase < 5}
            canGoPrevious={testCase > 1}
            timeSpent={0}
            pointsEarned={0}
            lessonTheme="test"
          />
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(currentSlide, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
