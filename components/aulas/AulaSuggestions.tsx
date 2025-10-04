'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, RefreshCw, Send, TrendingUp, AlertCircle } from 'lucide-react'
import { useDynamicSuggestions } from '@/hooks/useDynamicSuggestions'
import { useDarkMode } from '@/hooks/useDarkMode'

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
  const { isDark } = useDarkMode()

  return (
    <Card className={`aulas-section border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:border-yellow-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3">
          <CardTitle className="card-title flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
            <Lightbulb className="card-icon h-7 w-7 text-yellow-500 dark:text-yellow-400" />
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
        <CardDescription className="card-description text-base text-gray-600 dark:text-gray-300">
          Sugestões geradas por IA que mudam a cada carregamento
        </CardDescription>
        {suggestionsError && (
          <Alert className="alert-error mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertCircle className="alert-icon h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-300">
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
                className="loading-skeleton p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 animate-pulse"
                aria-label="Carregando sugestão"
              >
                <div className="flex items-start gap-4">
                  <div className="skeleton-element w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="skeleton-element h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="skeleton-element h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="skeleton-element h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      <div className="skeleton-element h-5 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
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
                className="suggestion-button group p-6 text-left border-2 border-blue-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isDark ? '#374151 !important' : undefined,
                  background: isDark ? '#374151 !important' : undefined
                }}
                disabled={isGenerating}
                aria-label={`Gerar aula sobre ${suggestion.text}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="suggestion-text font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-800 dark:group-hover:text-blue-300 leading-relaxed mb-2">
                      {suggestion.text}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                      <Badge variant="outline" className="text-xs">{suggestion.level}</Badge>
                    </div>
                    <div className="suggestion-action flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="footer-container inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full border border-blue-200 dark:border-blue-800">
            <TrendingUp className="footer-icon h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="footer-text text-sm text-gray-700 dark:text-gray-300">
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