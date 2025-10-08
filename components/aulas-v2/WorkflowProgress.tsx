'use client'

import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export interface WorkflowStep {
  step: number
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  message: string
}

interface WorkflowProgressProps {
  steps: WorkflowStep[]
  elapsedTime?: number
}

export function WorkflowProgress({ steps, elapsedTime }: WorkflowProgressProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 100)
    
    if (seconds < 60) {
      return `${seconds}.${ms}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-4">
      {elapsedTime !== undefined && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-800">Tempo Decorrido</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {formatTime(elapsedTime)}
          </span>
        </div>
      )}

      {steps.map((step, index) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border-2 border-gray-200 rounded-2xl p-6 bg-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step.status === 'completed' ? 'bg-green-500 text-white scale-110' :
                step.status === 'in_progress' ? 'bg-purple-500 text-white animate-pulse scale-110' :
                step.status === 'error' ? 'bg-red-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {step.step}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{step.name}</h3>
                <p className="text-sm text-gray-600">{step.message}</p>
              </div>
            </div>
            <div>
              {step.status === 'completed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </motion.div>
              )}
              {step.status === 'in_progress' && <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />}
              {step.status === 'error' && <AlertCircle className="h-6 w-6 text-red-500" />}
            </div>
          </div>
          
          {/* Progress Bar */}
          {step.status !== 'pending' && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${step.progress}%` }}
                transition={{ duration: 0.5 }}
                className={`h-2 rounded-full transition-all ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'error' ? 'bg-red-500' :
                  'bg-purple-500'
                }`}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

