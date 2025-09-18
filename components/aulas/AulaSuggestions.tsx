'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, RefreshCw, Send, TrendingUp, AlertCircle } from 'lucide-react'
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions'

interface Suggestion {
  text: string
  category: string
  level: string
}

interface AulaSuggestionsProps {
  onSuggestionClick: (suggestion: Suggestion) => void
  isGenerating: boolean
  className?: string
}

const AulaSuggestions = memo(({ onSuggestionClick, isGenerating, className }: AulaSuggestionsProps) => {
  const { suggestions, loading: suggestionsLoading, error: suggestionsError, refreshSuggestions } = useDynamicSuggestions()

  return (
    <Card className={`border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Sugestões Inteligentes
          </CardTitle>
          <Button
            onClick={refreshSuggestions}
            variant="outline"
            size="sm"
            className="ml-2"
            disabled={suggestionsLoading}
            aria-label="Atualizar sugestões"
          >
            <RefreshCw className={`h-4 w-4 ${suggestionsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-base">
          Sugestões geradas por IA que mudam a cada carregamento
        </CardDescription>
        {suggestionsError && (
          <Alert className="mt-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Usando sugestões de fallback. Recarregue para tentar novamente.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestionsLoading ? (
            // Show loading skeleton while suggestions are being generated
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 animate-pulse"
                aria-label="Carregando sugestão"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 bg-gray-300 rounded w-16"></div>
                      <div className="h-5 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.text}-${index}`}
                onClick={() => onSuggestionClick(suggestion)}
                className="group p-6 text-left border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
                aria-label={`Gerar aula sobre ${suggestion.text}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 group-hover:text-blue-800 leading-relaxed mb-2">
                      {suggestion.text}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                      <Badge variant="outline" className="text-xs">{suggestion.level}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="h-3 w-3" />
                      <span>Clique para gerar automaticamente</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-blue-200">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              Ou descreva seu próprio tópico abaixo
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

AulaSuggestions.displayName = 'AulaSuggestions'

export default AulaSuggestions


