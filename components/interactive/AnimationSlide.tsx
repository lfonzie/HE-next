'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimationSlideProps {
  title: string
  content: string
  media?: string[]
  animationSteps?: Array<{
    id: string
    title: string
    description: string
    duration: number
    element?: string
  }>
  autoPlay?: boolean
  showControls?: boolean
  allowFullscreen?: boolean
  onComplete?: () => void
}

export default function AnimationSlide({
  title,
  content,
  media = [],
  animationSteps = [],
  autoPlay = false,
  showControls = true,
  allowFullscreen = true,
  onComplete
}: AnimationSlideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && animationSteps.length > 0) {
      const timer = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1
          if (nextStep >= animationSteps.length) {
            setIsPlaying(false)
            onComplete?.()
            return prev
          }
          return nextStep
        })
      }, animationSteps[currentStep]?.duration || 2000)

      return () => clearInterval(timer)
    }
  }, [isPlaying, currentStep, animationSteps, onComplete])

  // Progress calculation
  useEffect(() => {
    if (animationSteps.length > 0) {
      setProgress((currentStep / animationSteps.length) * 100)
    }
  }, [currentStep, animationSteps.length])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setProgress(0)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setIsPlaying(false)
  }

  const handleFullscreen = () => {
    if (!allowFullscreen) return
    
    setIsFullscreen(!isFullscreen)
  }

  const currentAnimationStep = animationSteps[currentStep]

  return (
    <Card className={`w-full max-w-4xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Animação Interativa</Badge>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {allowFullscreen && (
              <Button
                onClick={handleFullscreen}
                variant="outline"
                size="sm"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="sm"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">{content}</h3>
        </div>

        {/* Media Display */}
        {media.length > 0 && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {media.map((mediaItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  {mediaItem.endsWith('.mp4') || mediaItem.endsWith('.webm') ? (
                    <video
                      src={mediaItem}
                      controls
                      muted={isMuted}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaItem}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Animation Steps */}
        {animationSteps.length > 0 && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Animação</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Step Display */}
            <AnimatePresence mode="wait">
              {currentAnimationStep && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <h4 className="text-lg font-semibold mb-2">
                    {currentAnimationStep.title}
                  </h4>
                  <p className="text-gray-700">
                    {currentAnimationStep.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            {showControls && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handlePlay}
                  disabled={isPlaying || currentStep >= animationSteps.length}
                  variant="outline"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Reproduzir
                </Button>
                <Button
                  onClick={handlePause}
                  disabled={!isPlaying}
                  variant="outline"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
              </div>
            )}

            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2 justify-center">
              {animationSteps.map((step, index) => (
                <Button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  variant={index === currentStep ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Elements */}
        {currentAnimationStep?.element && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="text-sm text-gray-600 mb-2">
              💡 Clique nos elementos destacados para interagir
            </div>
            <div className="relative">
              {/* This would be where interactive elements are rendered */}
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">
                  Elemento interativo: {currentAnimationStep.element}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  (Implementação específica baseada no tipo de elemento)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completion Message */}
        {currentStep >= animationSteps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-green-50 rounded-lg border border-green-200"
          >
            <h4 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Animação Concluída!
            </h4>
            <p className="text-green-700">
              Você completou todas as etapas da animação. Clique em &quot;Reiniciar&quot; para ver novamente.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
