'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RotateCcw, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Flashcard {
  term: string
  definition: string
}

interface FlashcardMakerProps {
  initialTopic?: string
  onFlashcardsGenerated?: (flashcards: Flashcard[]) => void
}

export default function FlashcardMaker({ 
  initialTopic = '', 
  onFlashcardsGenerated 
}: FlashcardMakerProps) {
  const [topic, setTopic] = useState(initialTopic)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const generateFlashcards = async () => {
    const topicText = topic.trim()
    if (!topicText) {
      setError('Por favor, insira um tópico ou termos e definições.')
      return
    }

    setIsGenerating(true)
    setError('')
    setFlashcards([])
    setFlippedCards(new Set())

    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topicText }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar flashcards')
      }

      const data = await response.json()
      
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards)
        onFlashcardsGenerated?.(data.flashcards)
        toast.success(`${data.flashcards.length} flashcards gerados com sucesso!`)
      } else {
        setError('Não foi possível gerar flashcards válidos. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro ao gerar flashcards:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      toast.error('Erro ao gerar flashcards')
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
  }

  const downloadFlashcards = () => {
    if (flashcards.length === 0) return

    const content = flashcards
      .map((card, index) => `${index + 1}. ${card.term}: ${card.definition}`)
      .join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flashcards-${topic.slice(0, 30)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Flashcards baixados!')
  }

  const shareFlashcards = async () => {
    if (flashcards.length === 0) return

    const shareData = {
      title: `Flashcards: ${topic}`,
      text: flashcards.map(card => `${card.term}: ${card.definition}`).join('\n'),
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.text)
        toast.success('Flashcards copiados para a área de transferência!')
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
      toast.error('Erro ao compartilhar flashcards')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gerador de Flashcards
        </h1>
        <p className="text-muted-foreground">
          Crie flashcards interativos usando IA para qualquer tópico de estudo
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Insira o Tópico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            ref={textareaRef}
            placeholder="Digite um tópico (ex: História do Brasil) ou pares 'Termo: Definição' (um por linha)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={generateFlashcards}
              disabled={isGenerating || !topic.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Flashcards...
                </>
              ) : (
                'Gerar Flashcards'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flashcards Display */}
      {flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Flashcards Gerados ({flashcards.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCards}
                  disabled={flippedCards.size === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadFlashcards}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareFlashcards}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((flashcard, index) => (
                <div
                  key={index}
                  className={`flashcard-container cursor-pointer transition-all duration-300 hover:scale-105 ${
                    flippedCards.has(index) ? 'flipped' : ''
                  }`}
                  onClick={() => toggleCard(index)}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <div className="flashcard-content">
                        <h3 className="font-semibold text-lg mb-2">Termo</h3>
                        <p className="text-sm text-muted-foreground">{flashcard.term}</p>
                      </div>
                    </div>
                    <div className="flashcard-back">
                      <div className="flashcard-content">
                        <h3 className="font-semibold text-lg mb-2">Definição</h3>
                        <p className="text-sm">{flashcard.definition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .flashcard-container {
          width: 100%;
          height: 200px;
          perspective: 1000px;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard-container.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }

        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          border: 2px solid hsl(var(--border));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          box-sizing: border-box;
        }

        .flashcard-front {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%);
          color: hsl(var(--primary-foreground));
        }

        .flashcard-back {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary)) 100%);
          color: hsl(var(--secondary-foreground));
          transform: rotateY(180deg);
        }

        .flashcard-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
