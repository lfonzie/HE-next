'use client'

import React from 'react'
import { CheckCircle, Brain } from 'lucide-react'

interface ClassificationIndicatorProps {
  module: string
  confidence: number
  rationale: string
  isVisible: boolean
}

export function ClassificationIndicator({ 
  module, 
  confidence, 
  rationale, 
  isVisible 
}: ClassificationIndicatorProps) {
  if (!isVisible) return null

  const moduleLabels: Record<string, string> = {
    professor: 'Professor',
    ti: 'Suporte Técnico',
    secretaria: 'Secretaria',
    financeiro: 'Financeiro',
    rh: 'Recursos Humanos',
    coordenacao: 'Coordenação',
    'bem-estar': 'Bem-estar',
    'social-media': 'Redes Sociais',
    atendimento: 'Atendimento Geral',
  }

  const moduleColors: Record<string, string> = {
    professor: 'bg-blue-100 text-blue-800 border-blue-200',
    ti: 'bg-purple-100 text-purple-800 border-purple-200',
    secretaria: 'bg-green-100 text-green-800 border-green-200',
    financeiro: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rh: 'bg-pink-100 text-pink-800 border-pink-200',
    coordenacao: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bem-estar': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'social-media': 'bg-orange-100 text-orange-800 border-orange-200',
    atendimento: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
      <Brain className="w-4 h-4 text-blue-600" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Classificado como:</span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${moduleColors[module] || moduleColors.atendimento}`}>
          {moduleLabels[module] || module}
        </span>
        <span className="text-xs text-gray-500">
          ({Math.round(confidence * 100)}%)
        </span>
      </div>
      <CheckCircle className="w-4 h-4 text-green-600" />
    </div>
  )
}
