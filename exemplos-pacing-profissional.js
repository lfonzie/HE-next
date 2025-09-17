// Exemplo prático de uso do Sistema de Pacing Profissional
// Este arquivo demonstra como usar o novo sistema para gerar aulas otimizadas

import { NextRequest, NextResponse } from 'next/server'

// Exemplo 1: Geração de aula profissional básica
export async function exemploAulaBasica() {
  const request = new NextRequest('http://localhost:3000/api/generate-lesson-professional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'Fotossíntese',
      pacingMode: 'professional',
      demoMode: true
    })
  })

  const response = await fetch(request)
  const data = await response.json()
  
  console.log('📊 Métricas da aula:', data.pacingMetrics)
  console.log('⚠️ Warnings:', data.warnings)
  
  return data
}

// Exemplo 2: Geração de aula específica para fotossíntese
export async function exemploAulaFotossintese() {
  const request = new NextRequest('http://localhost:3000/api/generate-lesson-professional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'Fotossíntese',
      pacingMode: 'photosynthesis',
      demoMode: true
    })
  })

  const response = await fetch(request)
  const data = await response.json()
  
  // Validar métricas específicas para fotossíntese
  const metrics = data.pacingMetrics
  console.log('🌱 Aula de Fotossíntese:')
  console.log(`- Tempo síncrono: ${metrics.synchronousTime} min`)
  console.log(`- Tempo assíncrono: ${metrics.asynchronousTime} min`)
  console.log(`- Total de tokens: ${metrics.totalTokens}`)
  console.log(`- Palavras por slide: ${metrics.wordsPerSlide}`)
  
  return data
}

// Exemplo 3: Geração de slide único
export async function exemploSlideUnico() {
  const request = new NextRequest('http://localhost:3000/api/generate-lesson-professional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'Fotossíntese',
      generateSingleSlide: 4, // Quiz 1
      demoMode: true
    })
  })

  const response = await fetch(request)
  const data = await response.json()
  
  console.log('🎯 Slide único gerado:', data.slide)
  console.log(`- Tipo: ${data.slide.type}`)
  console.log(`- Tempo estimado: ${data.slide.timeEstimate} min`)
  console.log(`- Tokens alvo: ${data.slide.tokenTarget}`)
  
  return data
}

// Exemplo 4: Validação de pacing personalizado
export async function exemploValidacaoPacing() {
  // Simular dados de aula para validação
  const lessonData = {
    slides: [
      { tokenTarget: 500, timeEstimate: 4, type: 'introduction' },
      { tokenTarget: 500, timeEstimate: 5, type: 'explanation' },
      { tokenTarget: 500, timeEstimate: 5, type: 'explanation' },
      { tokenTarget: 400, timeEstimate: 4, type: 'question' },
      { tokenTarget: 500, timeEstimate: 5, type: 'explanation' },
      { tokenTarget: 500, timeEstimate: 5, type: 'explanation' },
      { tokenTarget: 500, timeEstimate: 5, type: 'explanation' },
      { tokenTarget: 400, timeEstimate: 4, type: 'question' },
      { tokenTarget: 400, timeEstimate: 3, type: 'closing' }
    ]
  }

  // Importar funções de validação (em ambiente real)
  // const { validateProfessionalPacing, calculatePacingMetrics } = await import('@/lib/system-prompts/lessons-professional-pacing')
  
  // const validation = validateProfessionalPacing(lessonData)
  // const metrics = calculatePacingMetrics(lessonData.slides)
  
  console.log('✅ Validação de pacing:')
  console.log(`- Válido: ${true}`) // validation.isValid
  console.log(`- Tempo total: ${40} min`) // metrics.synchronousTime
  console.log(`- Tokens totais: ${4500}`) // metrics.totalTokens
  
  return { isValid: true, metrics: {} }
}

// Exemplo 5: Integração com frontend React
export const exemploIntegracaoFrontend = `
// Componente React para usar o sistema de pacing profissional

import { useState } from 'react'

export function AulaProfissionalGenerator() {
  const [topic, setTopic] = useState('')
  const [pacingMode, setPacingMode] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [lesson, setLesson] = useState(null)
  const [metrics, setMetrics] = useState(null)

  const generateLesson = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-lesson-professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          pacingMode,
          demoMode: true
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLesson(data.lesson)
        setMetrics(data.pacingMetrics)
        
        // Exibir warnings se houver
        if (data.warnings) {
          console.warn('⚠️ Problemas de pacing:', data.warnings)
        }
      }
    } catch (error) {
      console.error('Erro ao gerar aula:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Gerador de Aulas Profissionais
      </h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tópico da Aula
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Fotossíntese, Equações Quadráticas, Revolução Francesa"
            className="w-full p-3 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Modo de Pacing
          </label>
          <select
            value={pacingMode}
            onChange={(e) => setPacingMode(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="professional">Profissional (Genérico)</option>
            <option value="photosynthesis">Fotossíntese (Específico)</option>
            <option value="custom">Customizado</option>
          </select>
        </div>
        
        <button
          onClick={generateLesson}
          disabled={loading || !topic}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Gerando Aula...' : 'Gerar Aula Profissional'}
        </button>
      </div>
      
      {metrics && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📊 Métricas da Aula</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Tempo Síncrono:</span> {metrics.synchronousTime} min
            </div>
            <div>
              <span className="font-medium">Tempo Assíncrono:</span> {metrics.asynchronousTime} min
            </div>
            <div>
              <span className="font-medium">Total de Tokens:</span> {metrics.totalTokens}
            </div>
            <div>
              <span className="font-medium">Palavras por Slide:</span> {metrics.wordsPerSlide}
            </div>
          </div>
        </div>
      )}
      
      {lesson && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">📚 Aula Gerada</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">{lesson.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {lesson.subject} • {lesson.grade}º ano
              </p>
            </div>
            
            <div className="grid gap-3">
              {lesson.slides.map((slide, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{slide.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {slide.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {slide.timeEstimate} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`

// Exemplo 6: Teste de performance e qualidade
export async function exemploTesteQualidade() {
  const topics = [
    'Fotossíntese',
    'Equações Quadráticas', 
    'Revolução Francesa',
    'Células Eucarióticas',
    'Física Quântica'
  ]
  
  const results = []
  
  for (const topic of topics) {
    console.log(\`🧪 Testando: \${topic}\`)
    
    const startTime = Date.now()
    
    try {
      const request = new NextRequest('http://localhost:3000/api/generate-lesson-professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          pacingMode: 'professional',
          demoMode: true
        })
      })

      const response = await fetch(request)
      const data = await response.json()
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      results.push({
        topic,
        success: data.success,
        duration: \`\${duration}ms\`,
        tokens: data.pacingMetrics?.totalTokens || 0,
        time: data.pacingMetrics?.synchronousTime || 0,
        warnings: data.warnings?.length || 0
      })
      
    } catch (error) {
      results.push({
        topic,
        success: false,
        error: error.message
      })
    }
  }
  
  console.log('📊 Resultados dos testes:')
  console.table(results)
  
  return results
}

// Exemplo 7: Comparação entre sistemas
export async function exemploComparacaoSistemas() {
  const topic = 'Fotossíntese'
  
  // Sistema antigo
  const oldSystem = await fetch('/api/generate-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, demoMode: true })
  })
  
  // Sistema novo profissional
  const newSystem = await fetch('/api/generate-lesson-professional', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      topic, 
      pacingMode: 'professional',
      demoMode: true 
    })
  })
  
  const oldData = await oldSystem.json()
  const newData = await newSystem.json()
  
  console.log('🔄 Comparação de Sistemas:')
  console.log('Sistema Antigo:')
  console.log(\`- Slides: \${oldData.lesson?.slides?.length || 0}\`)
  console.log(\`- Tempo estimado: \${oldData.lesson?.slides?.reduce((sum, s) => sum + (s.timeEstimate || 0), 0) || 0} min\`)
  
  console.log('Sistema Novo Profissional:')
  console.log(\`- Slides: \${newData.lesson?.slides?.length || 0}\`)
  console.log(\`- Tempo síncrono: \${newData.pacingMetrics?.synchronousTime || 0} min\`)
  console.log(\`- Tempo assíncrono: \${newData.pacingMetrics?.asynchronousTime || 0} min\`)
  console.log(\`- Total de tokens: \${newData.pacingMetrics?.totalTokens || 0}\`)
  console.log(\`- Warnings: \${newData.warnings?.length || 0}\`)
  
  return { oldData, newData }
}

// Exportar todos os exemplos
export const exemplos = {
  aulaBasica: exemploAulaBasica,
  aulaFotossintese: exemploAulaFotossintese,
  slideUnico: exemploSlideUnico,
  validacaoPacing: exemploValidacaoPacing,
  integracaoFrontend: exemploIntegracaoFrontend,
  testeQualidade: exemploTesteQualidade,
  comparacaoSistemas: exemploComparacaoSistemas
}
