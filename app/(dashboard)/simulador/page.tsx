"use client"

import { useState } from 'react'
import { EnemSetup } from '@/components/enem/EnemSetup'
import { EnemSimulator } from '@/components/enem/EnemSimulator'

export default function SimuladorPage() {
  const [simulationConfig, setSimulationConfig] = useState<{
    area: string
    numQuestions: number
    duration: number
  } | null>(null)

  const handleStart = (config: { area: string; numQuestions: number; duration: number }) => {
    setSimulationConfig(config)
  }

  const handleBack = () => {
    setSimulationConfig(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Simulador ENEM</h1>
        <p className="text-muted-foreground">
          Pratique com questões do ENEM e melhore seu desempenho
        </p>
      </div>
      
      <div className="p-6">
        {simulationConfig ? (
          <div>
            <button 
              onClick={handleBack}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar à configuração
            </button>
            <EnemSimulator
              area={simulationConfig.area}
              numQuestions={simulationConfig.numQuestions}
              duration={simulationConfig.duration}
            />
          </div>
        ) : (
          <EnemSetup onStart={handleStart} />
        )}
      </div>
    </div>
  )
}
