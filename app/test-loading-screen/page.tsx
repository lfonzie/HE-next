'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TestLoadingScreenPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('Preparando sua aula personalizada...')
  const [currentTip, setCurrentTip] = useState(0)

  // Educational tips and messages for loading screen
  const loadingTips = [
    "💡 Dica: A Segunda Guerra Mundial começou em 1939 com a invasão da Polônia pela Alemanha.",
    "📚 Curiosidade: O Tratado de Versalhes foi assinado em 1919 e impôs duras condições à Alemanha.",
    "🎯 Fato: A Grande Depressão de 1929 criou condições para o surgimento de regimes totalitários.",
    "⚡ Sabia que: A política de apaziguamento das potências ocidentais permitiu a expansão alemã.",
    "🔍 Interessante: A Liga das Nações falhou em manter a paz internacional antes da guerra.",
    "📖 História: Adolf Hitler prometeu restaurar o orgulho nacional alemão após a Primeira Guerra.",
    "🌍 Global: A guerra envolveu mais de 100 milhões de pessoas de mais de 30 países.",
    "⏰ Cronologia: A guerra durou de 1939 a 1945, transformando o mundo para sempre."
  ]

  const loadingMessages = [
    "Preparando sua aula personalizada...",
    "Gerando conteúdo educacional...",
    "Criando slides interativos...",
    "Preparando quizzes e exercícios...",
    "Otimizando imagens e recursos...",
    "Finalizando sua experiência de aprendizado...",
    "Quase pronto! Preparando os últimos detalhes...",
    "Aula completa! Iniciando apresentação..."
  ]

  const simulateLoading = () => {
    setIsLoading(true)
    setLoadingProgress(0)
    setCurrentTip(0)
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 1
      setLoadingProgress(progress)
      
      // Update message based on progress
      if (progress < 20) {
        setLoadingMessage(loadingMessages[0])
      } else if (progress < 40) {
        setLoadingMessage(loadingMessages[1])
      } else if (progress < 60) {
        setLoadingMessage(loadingMessages[2])
      } else if (progress < 80) {
        setLoadingMessage(loadingMessages[3])
      } else if (progress < 90) {
        setLoadingMessage(loadingMessages[4])
      } else if (progress < 95) {
        setLoadingMessage(loadingMessages[5])
      } else if (progress < 100) {
        setLoadingMessage(loadingMessages[6])
      } else {
        setLoadingMessage(loadingMessages[7])
      }
      
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    }, 750) // 75 seconds total (750ms per 1%)
  }

  // Rotate tips during loading
  useEffect(() => {
    if (isLoading) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % loadingTips.length)
      }, 8000) // Change tip every 8 seconds

      return () => clearInterval(tipInterval)
    }
  }, [isLoading, loadingTips.length])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-8">
              {/* Animated Header */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    🎓 Criando Sua Aula Personalizada
                  </h2>
                  <p className="text-lg text-gray-600 animate-pulse">
                    {loadingMessage}
                  </p>
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-700">Progresso</span>
                  <span className="font-bold text-blue-600">{Math.round(loadingProgress)}%</span>
                </div>
                
                <div className="relative">
                  <Progress value={loadingProgress} className="w-full h-3" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {Math.round(loadingProgress)}% completo
                    </span>
                  </div>
                </div>
                
                {/* Time estimate */}
                <div className="text-sm text-gray-500">
                  ⏱️ Tempo estimado: ~75 segundos
                </div>
              </div>
              
              {/* Educational Tips Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-lg font-semibold text-gray-800">Dica Educacional</h3>
                  </div>
                  
                  <motion.div
                    key={currentTip}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-700 text-center leading-relaxed"
                  >
                    {loadingTips[currentTip]}
                  </motion.div>
                  
                  <div className="flex justify-center space-x-1">
                    {loadingTips.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                          index === currentTip ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Loading Steps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  loadingProgress >= 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    loadingProgress >= 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span>Estrutura da Aula</span>
                </div>
                
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  loadingProgress >= 25 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    loadingProgress >= 25 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span>Conteúdo Educacional</span>
                </div>
                
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  loadingProgress >= 50 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    loadingProgress >= 50 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span>Quizzes Interativos</span>
                </div>
                
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  loadingProgress >= 75 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    loadingProgress >= 75 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span>Recursos Visuais</span>
                </div>
              </div>
              
              {/* Fun Facts */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-xl">🎯</span>
                  <span className="font-semibold text-yellow-800">Você Sabia?</span>
                </div>
                <p className="text-sm text-yellow-700 text-center">
                  Nossa IA está criando conteúdo único e personalizado para você, 
                  adaptado ao seu nível de aprendizado e estilo preferido!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Teste da Tela de Loading</h1>
        <p className="text-gray-600 mb-6">
          Esta página testa a nova tela de loading de 75 segundos com entretenimento educacional.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">🎯 Características da Nova Tela de Loading</h2>
          <ul className="space-y-2 text-blue-700">
            <li>• <strong>Duração:</strong> ~75 segundos (tempo real de geração)</li>
            <li>• <strong>Progresso Visual:</strong> Barra de progresso animada com porcentagem</li>
            <li>• <strong>Dicas Educacionais:</strong> 8 dicas sobre o tema que rotacionam a cada 8 segundos</li>
            <li>• <strong>Mensagens Dinâmicas:</strong> 8 mensagens que mudam conforme o progresso</li>
            <li>• <strong>Etapas Visuais:</strong> 4 etapas que ficam verdes conforme são completadas</li>
            <li>• <strong>Animações:</strong> Elementos animados para manter o usuário engajado</li>
            <li>• <strong>Design Responsivo:</strong> Funciona em desktop e mobile</li>
          </ul>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={simulateLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            🚀 Simular Carregamento de 75 Segundos
          </Button>
        </div>
        
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Instruções de Teste</h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Clique no botão acima para iniciar a simulação</li>
            <li>Observe a barra de progresso avançar gradualmente</li>
            <li>Veja as dicas educacionais mudarem automaticamente</li>
            <li>Note as mensagens de status mudando conforme o progresso</li>
            <li>Observe as etapas ficando verdes conforme são completadas</li>
            <li>A simulação dura exatamente 75 segundos</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
