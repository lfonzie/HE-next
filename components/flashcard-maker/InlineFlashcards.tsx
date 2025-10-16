'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Flashcard {
  term: string
  definition: string
}

interface InlineFlashcardsProps {
  topic: string
  className?: string
}

export default function InlineFlashcards({ topic, className = '' }: InlineFlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Auto-generate flashcards when component mounts
  useEffect(() => {
    if (topic && flashcards.length === 0 && !isGenerating) {
      generateFlashcards()
    }
  }, [topic])

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      setError('Tópico não disponível para gerar flashcards.')
      return
    }

    setIsGenerating(true)
    setError('')
    setFlashcards([])
    setFlippedCards(new Set())
    setCurrentCardIndex(0)

    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar flashcards')
      }

      const data = await response.json()
      
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards)
        toast.success(`${data.flashcards.length} flashcards gerados!`)
      } else {
        setError('Não foi possível gerar flashcards válidos.')
      }
    } catch (err) {
      console.error('Erro ao gerar flashcards:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleCard = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const resetCards = () => {
    setFlippedCards(new Set())
    setCurrentCardIndex(0)
  }

  const nextCard = () => {
    setCurrentCardIndex(prev => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length)
  }

  if (isGenerating) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🎴 Gerando Flashcards</h3>
          <p className="text-gray-600">Criando flashcards personalizados para "{topic}"...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Erro</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={generateFlashcards} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🎴 Flashcards do Tema</h3>
          <p className="text-gray-600 mb-4">Pratique os conceitos aprendidos nesta aula!</p>
          <Button onClick={generateFlashcards} className="bg-blue-600 hover:bg-blue-700 text-white">
            Gerar Flashcards
          </Button>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex]
  const isFlipped = flippedCards.has(currentCardIndex)

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <span className="text-xl">🎴</span>
          Flashcards do Tema
        </h3>
        <p className="text-sm text-gray-600">
          Card {currentCardIndex + 1} de {flashcards.length} - {topic}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <motion.div
          key={currentCardIndex}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.3 }}
          className="perspective-1000"
        >
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              isFlipped ? 'bg-blue-100' : 'bg-white'
            }`}
            onClick={() => toggleCard(currentCardIndex)}
          >
            <CardContent className="p-6 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {isFlipped ? (
                    <motion.div
                      key="definition"
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-sm font-medium text-blue-600 mb-2">DEFINIÇÃO</h4>
                      <p className="text-gray-800 leading-relaxed">{currentCard.definition}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="term"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-sm font-medium text-blue-600 mb-2">TERMO</h4>
                      <p className="text-gray-800 font-semibold text-lg">{currentCard.term}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            onClick={prevCard}
            variant="outline"
            size="sm"
            disabled={flashcards.length <= 1}
          >
            ← Anterior
          </Button>
          
          <Button
            onClick={() => toggleCard(currentCardIndex)}
            variant="outline"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isFlipped ? 'Ver Termo' : 'Ver Definição'}
          </Button>
          
          <Button
            onClick={nextCard}
            variant="outline"
            size="sm"
            disabled={flashcards.length <= 1}
          >
            Próximo →
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            onClick={resetCards}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
