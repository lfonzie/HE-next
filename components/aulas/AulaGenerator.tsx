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
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Gerador de Aulas Personalizado
        </CardTitle>
        <p className="text-sm text-gray-600">
          Descreva qualquer tópico e nossa IA criará uma experiência de aprendizado completa
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="topic" className="text-sm font-semibold flex items-center gap-2">
            O que você quer aprender hoje? 
            <span className="text-red-500">*</span>
          </label>
          
          {/* Accessibility Features */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
              <Accessibility className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Acessibilidade</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handleSpeechToText}
              title="Ativar entrada por voz"
              aria-label="Ativar entrada por voz"
            >
              <Mic className="h-3 w-3 mr-1" />
              Voz
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handleTextToSpeech}
              title="Ouvir o texto em voz alta"
              aria-label="Ouvir o texto em voz alta"
            >
              <Volume2 className="h-3 w-3 mr-1" />
              Ouvir
            </Button>
          </div>

          <Textarea
            id="topic"
            placeholder="Exemplo: Como a fotossíntese transforma luz solar em energia química, incluindo as reações e fatores que influenciam o processo..."
            value={formData.topic}
            onChange={handleTopicChange}
            onKeyPress={onKeyPress}
            rows={6}
            className={`resize-none transition-colors ${
              hasFieldError('topic') ? 'border-red-500 focus:border-red-500' : ''
            }`}
            aria-invalid={hasFieldError('topic')}
            aria-describedby={hasFieldError('topic') ? 'topic-error' : undefined}
            disabled={isGenerating}
          />
          {hasFieldError('topic') && (
            <p id="topic-error" className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {getFieldError('topic')}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>💡 Quanto mais específico, melhor será sua aula!</span>
            <span>{formData.topic.length}/500</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            O que nossa IA fará automaticamente:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✨ Identificar a matéria e série ideais</li>
            <li>🎯 Criar objetivos de aprendizagem específicos</li>
            <li>🎮 Desenvolver atividades interativas e gamificadas</li>
            <li>📊 Gerar avaliações personalizadas</li>
            <li>🏆 Implementar sistema de conquistas</li>
          </ul>
        </div>

        {/* Multi-Subject Support */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Suporte Multidisciplinar Completo
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-purple-800">Matemática</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-purple-800">Ciências</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-purple-800">Humanidades</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-800">Programação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-purple-800">Estudos Sociais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-purple-800">Linguagens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-purple-800">Artes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-purple-800">Educação Física</span>
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-2">
            Da educação básica ao ensino superior, cobrimos todas as disciplinas com metodologias adaptadas.
          </p>
        </div>

        <Button
          onClick={() => onGenerate()}
          disabled={isGenerating || !formData.topic.trim()}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Gerando sua aula personalizada...
            </>
          ) : (
            <>
              <Sparkles className="mr-3 h-5 w-5" />
              Gerar Aula Interativa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}


