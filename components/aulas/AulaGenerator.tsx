'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Target, BookOpen, Mic, Volume2, Accessibility, AlertCircle } from 'lucide-react'
import { useAulaValidation } from '@/hooks/useAulaValidation'
import { toast } from 'sonner'

interface FormData {
  topic: string
  targetLevel?: string
  focusArea?: string
  schoolId?: string
}

interface AulaGeneratorProps {
  formData: FormData
  onFormDataChange: (data: FormData) => void
  onGenerate: (topicOverride?: string) => void
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isGenerating: boolean
  className?: string
}

export default function AulaGenerator({
  formData,
  onFormDataChange,
  onGenerate,
  onKeyPress,
  isGenerating,
  className
}: AulaGeneratorProps) {
  const { validateOnChange, getFieldError, hasFieldError } = useAulaValidation()

  const handleTopicChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    console.log('Mudança no campo topic:', { oldValue: formData.topic, newValue })
    
    const newFormData = { ...formData, topic: newValue }
    onFormDataChange(newFormData)
    
    // Validate on change
    validateOnChange('topic', newValue)
  }, [formData, onFormDataChange, validateOnChange])

  const handleSpeechToText = useCallback(() => {
    console.log('Speech-to-text activated')
    toast.success('Funcionalidade de voz ativada! Fale seu tópico.')
  }, [])

  const handleTextToSpeech = useCallback(() => {
    if (formData.topic) {
      console.log('Text-to-speech activated for:', formData.topic)
      toast.success('Lendo o texto em voz alta...')
    } else {
      toast.error('Digite algo primeiro para ouvir')
    }
  }, [formData.topic])

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          Gerador de Aulas Personalizado
        </CardTitle>
        <p className="text-yellow-100 text-lg mt-2">
          Descreva qualquer tópico e nossa IA criará uma experiência de aprendizado completa
        </p>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <label htmlFor="topic" className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            O que você quer aprender hoje? 
            <span className="text-red-500 text-xl">*</span>
          </label>
          
          <div className="relative">
            <Textarea
              id="topic"
              placeholder="Exemplo: Como a fotossíntese transforma luz solar em energia química, incluindo as reações e fatores que influenciam o processo..."
              value={formData.topic}
              onChange={handleTopicChange}
              onKeyPress={onKeyPress}
              rows={6}
              className={`resize-none transition-all duration-200 text-lg border-2 rounded-2xl p-4 ${
                hasFieldError('topic') ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-blue-200 focus:border-blue-400 bg-white'
              }`}
              aria-invalid={hasFieldError('topic')}
              aria-describedby={hasFieldError('topic') ? 'topic-error' : undefined}
              disabled={isGenerating}
            />
            
            {/* Character counter */}
            <div className="absolute bottom-3 right-4 text-sm text-gray-400">
              {formData.topic.length}/500
            </div>
          </div>
          
          {hasFieldError('topic') && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p id="topic-error" className="text-red-700 font-medium">
                {getFieldError('topic')}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              Quanto mais específico, melhor será sua aula!
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="h-3 w-3 text-white" />
            </div>
            O que nossa IA fará automaticamente:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Identificar matéria e série ideais</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Criar objetivos específicos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Desenvolver atividades interativas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Implementar gamificação</span>
            </div>
          </div>
        </div>

        {/* Multi-Subject Support */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <h4 className="font-semibold text-lg text-purple-900 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 text-white" />
            </div>
            Suporte Multidisciplinar Completo
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Matemática</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Ciências</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Humanidades</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Programação</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Estudos Sociais</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Linguagens</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Artes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-purple-800 font-medium">Educação Física</span>
            </div>
          </div>
          <p className="text-sm text-purple-700 mt-4 font-medium">
            Da educação básica ao ensino superior, cobrimos todas as disciplinas com metodologias adaptadas.
          </p>
        </div>

        <Button
          onClick={() => onGenerate()}
          disabled={isGenerating || !formData.topic.trim()}
          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="mr-4 h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
              Gerando sua aula personalizada...
            </>
          ) : (
            <>
              <Sparkles className="mr-4 h-6 w-6" />
              Gerar Aula Interativa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}


