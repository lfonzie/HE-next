'use client'

import { Loader2, BookOpen, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface LoadingState {
  step: number
  message: string
  description?: string
}

const loadingSteps: LoadingState[] = [
  {
    step: 1,
    message: 'Preparando questões...',
    description: 'Selecionando questões do banco de dados'
  },
  {
    step: 2,
    message: 'Gerando conteúdo...',
    description: 'Criando explicações e alternativas'
  },
  {
    step: 3,
    message: 'Finalizando simulado...',
    description: 'Organizando questões e verificando qualidade'
  }
]

export function ExamGenerationLoading({ 
  currentStep = 1, 
  message = 'Gerando simulado...',
  showSteps = true 
}: {
  currentStep?: number
  message?: string
  showSteps?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <BookOpen className="h-16 w-16 text-blue-600" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Loader2 className="h-6 w-6 text-blue-600" />
          </motion.div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {message}
          </h3>
          <p className="text-gray-600">
            Isso pode levar alguns segundos...
          </p>
        </div>
      </motion.div>

      {showSteps && (
        <div className="w-full max-w-md space-y-4">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: currentStep >= step.step ? 1 : 0.5,
                x: 0 
              }}
              transition={{ delay: index * 0.2 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                currentStep >= step.step 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {currentStep > step.step ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : currentStep === step.step ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5 text-blue-600" />
                  </motion.div>
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  currentStep >= step.step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.message}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xs text-gray-500"
      >
        Por favor, aguarde...
      </motion.div>
    </div>
  )
}

export function QuestionLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-600">Carregando questão...</span>
      </div>
    </div>
  )
}

export function ResultsLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Calculando resultados...
        </h3>
        <p className="text-sm text-gray-600">
          Analisando suas respostas
        </p>
      </div>
    </div>
  )
}