'use client'

import { useState, useEffect, useRef } from 'react'

interface RedacaoTimerProps {
  isEvaluating: boolean
  onTimeUp?: () => void
  estimatedTime?: number // em segundos, padrão 45s
}

// Dicas específicas para nota 1000 organizadas por competência
const DICAS_NOTA_1000 = {
  comp1: [
    "Domine a norma padrão: evite erros de ortografia, acentuação e concordância",
    "Use vocabulário formal e preciso, evitando gírias e expressões coloquiais",
    "Pratique pontuação correta: vírgulas separam elementos, pontos finalizam ideias",
    "Revise concordância verbal: sujeito e verbo devem concordar em número e pessoa"
  ],
  comp2: [
    "Compreenda o tema completamente antes de escrever",
    "Desenvolva uma estrutura clara: introdução, desenvolvimento e conclusão",
    "Integre conhecimentos de diferentes áreas do conhecimento",
    "Mantenha foco no tema proposto, sem tangenciar ou fugir do assunto"
  ],
  comp3: [
    "Selecione argumentos sólidos e diversos para sustentar sua tese",
    "Organize suas ideias de forma lógica e progressiva",
    "Use dados, fatos e exemplos para embasar seus argumentos",
    "Desenvolva interpretação crítica das informações apresentadas"
  ],
  comp4: [
    "Use conectores adequados: 'portanto', 'entretanto', 'além disso'",
    "Mantenha coesão referencial com pronomes e sinônimos",
    "Varie sua estrutura sintática para evitar repetições",
    "Garanta coerência global: todas as ideias devem se relacionar"
  ],
  comp5: [
    "Detalhe sua proposta: ações, agentes, meios e efeitos",
    "Respeite os direitos humanos em sua intervenção",
    "Articule a proposta com os argumentos desenvolvidos",
    "Seja específico e viável, evitando propostas genéricas"
  ],
  gerais: [
    "Leia atentamente a proposta e os textos de apoio",
    "Planeje sua redação antes de começar a escrever",
    "Use exemplos concretos e atualizados",
    "Revise seu texto antes de finalizar"
  ]
}

// Função para obter competência baseada no tempo
function getCompetenciaByTime(timeLeft: number): { nome: string, numero: number, cor: string } {
  if (timeLeft > 35) {
    return { nome: "Domínio da Norma Padrão", numero: 1, cor: "blue" }
  } else if (timeLeft > 25) {
    return { nome: "Compreensão do Tema", numero: 2, cor: "green" }
  } else if (timeLeft > 15) {
    return { nome: "Argumentação", numero: 3, cor: "purple" }
  } else if (timeLeft > 5) {
    return { nome: "Mecanismos Linguísticos", numero: 4, cor: "orange" }
  } else {
    return { nome: "Proposta de Intervenção", numero: 5, cor: "red" }
  }
}

// Função para obter dica baseada no tempo restante
function getDicaByTime(timeLeft: number): string {
  if (timeLeft > 35) {
    // Competência 1 - Domínio da norma padrão
    const dicas = DICAS_NOTA_1000.comp1
    return dicas[Math.floor(Math.random() * dicas.length)]
  } else if (timeLeft > 25) {
    // Competência 2 - Compreensão do tema
    const dicas = DICAS_NOTA_1000.comp2
    return dicas[Math.floor(Math.random() * dicas.length)]
  } else if (timeLeft > 15) {
    // Competência 3 - Argumentação
    const dicas = DICAS_NOTA_1000.comp3
    return dicas[Math.floor(Math.random() * dicas.length)]
  } else if (timeLeft > 5) {
    // Competência 4 - Mecanismos linguísticos
    const dicas = DICAS_NOTA_1000.comp4
    return dicas[Math.floor(Math.random() * dicas.length)]
  } else {
    // Competência 5 - Proposta de intervenção
    const dicas = DICAS_NOTA_1000.comp5
    return dicas[Math.floor(Math.random() * dicas.length)]
  }
}

export default function RedacaoTimer({ 
  isEvaluating, 
  onTimeUp, 
  estimatedTime = 45 
}: RedacaoTimerProps) {
  const [timeLeft, setTimeLeft] = useState(estimatedTime)
  const [progress, setProgress] = useState(0)
  const [currentDica, setCurrentDica] = useState('')
  const [currentCompetencia, setCurrentCompetencia] = useState({ nome: '', numero: 0, cor: '' })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isEvaluating) {
      setTimeLeft(estimatedTime)
      setProgress(0)
      setCurrentDica(getDicaByTime(estimatedTime))
      setCurrentCompetencia(getCompetenciaByTime(estimatedTime))
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          const newProgress = ((estimatedTime - newTime) / estimatedTime) * 100
          setProgress(newProgress)
          
          // Atualizar dica e competência a cada 5 segundos
          if (newTime % 5 === 0) {
            setCurrentDica(getDicaByTime(newTime))
            setCurrentCompetencia(getCompetenciaByTime(newTime))
          }
          
          if (newTime <= 0) {
            onTimeUp?.()
            return 0
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setTimeLeft(estimatedTime)
      setProgress(0)
      setCurrentDica('')
      setCurrentCompetencia({ nome: '', numero: 0, cor: '' })
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEvaluating, estimatedTime, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusMessage = () => {
    if (!isEvaluating) return 'Aguardando avaliação...'
    
    if (timeLeft > 30) return 'Analisando estrutura e conteúdo...'
    if (timeLeft > 15) return 'Verificando competências do ENEM...'
    if (timeLeft > 5) return 'Finalizando avaliação...'
    return 'Quase pronto!'
  }

  const getStatusColor = () => {
    if (timeLeft > 30) return 'text-blue-600'
    if (timeLeft > 15) return 'text-yellow-600'
    if (timeLeft > 5) return 'text-orange-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (timeLeft > 30) return 'bg-blue-500'
    if (timeLeft > 15) return 'bg-yellow-500'
    if (timeLeft > 5) return 'bg-orange-500'
    return 'bg-green-500'
  }

  if (!isEvaluating) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Timer de Avaliação
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            A avaliação leva aproximadamente <strong>45 segundos</strong>
          </p>
          <div className="text-xs text-gray-500">
            O timer será iniciado quando você submeter a redação
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🤖</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Avaliando Redação
        </h3>
        <p className="text-sm text-gray-600">
          Tempo estimado: <strong>45 segundos</strong>
        </p>
      </div>

      {/* Timer Circular */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={`${getProgressColor()} transition-all duration-1000 ease-out`}
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-500">
              restantes
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        
        {/* Indicador da Competência Atual */}
        {currentCompetencia.numero > 0 && (
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-600 font-bold text-sm">
                Competência {currentCompetencia.numero}
              </span>
              <span className="text-blue-800 text-sm">
                {currentCompetencia.nome}
              </span>
            </div>
          </div>
        )}

        {/* Dica para nota 1000 */}
        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">💡</span>
            <div className="text-xs text-yellow-800">
              <strong className="text-yellow-900">Dica para Nota 1000:</strong>
              <div className="mt-1 font-medium">
                {currentDica}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading animation */}
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
