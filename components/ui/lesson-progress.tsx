'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface LessonProgressProps {
  progress: number
  status: string
  isGenerating: boolean
  className?: string
}

const generationSteps = [
  { id: 1, name: 'Analisando tópico', threshold: 10 },
  { id: 2, name: 'Identificando matéria', threshold: 20 },
  { id: 3, name: 'Criando objetivos', threshold: 30 },
  { id: 4, name: 'Estruturando slides', threshold: 40 },
  { id: 5, name: 'Gerando conteúdo', threshold: 50 },
  { id: 6, name: 'Criando perguntas', threshold: 60 },
  { id: 7, name: 'Buscando imagens', threshold: 70 },
  { id: 8, name: 'Finalizando aula', threshold: 80 },
  { id: 9, name: 'Preparando exibição', threshold: 90 }
]

export function LessonProgress({ progress, status, isGenerating, className = '' }: LessonProgressProps) {
  const completedSteps = generationSteps.filter(step => progress >= step.threshold)
  const currentStep = generationSteps.find(step => progress >= step.threshold && progress < step.threshold + 10)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {isGenerating ? 'Gerando Aula' : 'Concluído'}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Status Message */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {status || 'Preparando geração da aula...'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tempo estimado: ~20 segundos
        </p>
      </div>

      {/* Generation Steps */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Etapas da Geração
        </h4>
        <div className="space-y-1">
          {generationSteps.map((step, index) => {
            const isCompleted = progress >= step.threshold
            const isCurrent = currentStep?.id === step.id
            const isPending = progress < step.threshold

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-xs ${
                  isCompleted ? 'text-green-600' : 
                  isCurrent ? 'text-blue-600' : 
                  'text-gray-400'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                </div>
                <span className={isCurrent ? 'font-medium' : ''}>
                  {step.name}
                </span>
                {isCompleted && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-500 ml-auto"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Time Estimation */}
      <div className="text-center pt-2 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>
            {isGenerating 
              ? `Aproximadamente ${Math.max(0, Math.round((100 - progress) / 5))}s restantes`
              : 'Aula gerada com sucesso!'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
