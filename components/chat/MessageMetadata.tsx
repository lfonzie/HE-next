"use client"

import React, { useState } from 'react'
import { Message as ChatMessageType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Cpu, 
  Database, 
  Zap,
  Info,
  BarChart3,
  Activity
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MessageMetadataProps {
  message: ChatMessageType
  showDetails?: boolean
  className?: string
}

export function MessageMetadata({
  message,
  showDetails = false,
  className = ''
}: MessageMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails)

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      relative: getRelativeTime(timestamp)
    }
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
    return `${seconds} segundo${seconds > 1 ? 's' : ''} atrás`
  }

  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'IA_SUPER':
        return {
          label: 'IA Super',
          description: 'Modelo mais avançado com maior capacidade',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: '🚀'
        }
      case 'IA_ECO':
        return {
          label: 'IA Eco',
          description: 'Modelo otimizado para eficiência',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: '🌱'
        }
      case 'IA':
      default:
        return {
          label: 'IA Padrão',
          description: 'Modelo padrão para uso geral',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: '🤖'
        }
    }
  }

  const getComplexityInfo = (complexity?: string) => {
    switch (complexity) {
      case 'high':
        return {
          label: 'Alta',
          description: 'Resposta complexa com múltiplos conceitos',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: '🔥'
        }
      case 'medium':
        return {
          label: 'Média',
          description: 'Resposta moderadamente complexa',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: '⚡'
        }
      case 'low':
      default:
        return {
          label: 'Baixa',
          description: 'Resposta simples e direta',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: '✨'
        }
    }
  }

  const timestamp = formatTimestamp(message.timestamp)
  const tierInfo = getTierInfo(message.tier)
  const complexityInfo = getComplexityInfo(message.complexity)

  return (
    <TooltipProvider>
      <div className={`message-metadata ${className}`}>
        {/* Compact view */}
        {!isExpanded && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timestamp.relative}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div>{timestamp.date}</div>
                  <div>{timestamp.time}</div>
                </div>
              </TooltipContent>
            </Tooltip>

            {message.tokens && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    {message.tokens} tokens
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Tokens utilizados na resposta
                </TooltipContent>
              </Tooltip>
            )}

            {message.tier && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${tierInfo.color}`}
                  >
                    {tierInfo.icon} {tierInfo.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {tierInfo.description}
                </TooltipContent>
              </Tooltip>
            )}

            {message.complexity && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${complexityInfo.color}`}
                  >
                    {complexityInfo.icon} {complexityInfo.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {complexityInfo.description}
                </TooltipContent>
              </Tooltip>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <Card className="mt-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Timestamp */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{timestamp.date}</div>
                  <div className="text-xs text-gray-500">{timestamp.time}</div>
                </div>
              </div>

              {/* Model information */}
              {message.model && (
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{message.model}</div>
                    {message.provider && (
                      <div className="text-xs text-gray-500">{message.provider}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Token usage */}
              {message.tokens && (
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{message.tokens} tokens</div>
                    <div className="text-xs text-gray-500">Utilizados na resposta</div>
                  </div>
                </div>
              )}

              {/* Tier information */}
              {message.tier && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${tierInfo.color}`}
                    >
                      {tierInfo.icon} {tierInfo.label}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {tierInfo.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Complexity information */}
              {message.complexity && (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${complexityInfo.color}`}
                    >
                      {complexityInfo.icon} Complexidade {complexityInfo.label}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {complexityInfo.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Message ID */}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">ID da Mensagem</div>
                  <div className="text-xs text-gray-500 font-mono">{message.id}</div>
                </div>
              </div>

              {/* Streaming status */}
              {message.isStreaming && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-600">Streaming ativo</span>
                </div>
              )}

              {/* Collapse button */}
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="w-full"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ocultar detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
