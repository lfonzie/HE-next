"use client"

import React from 'react'
import { Message as ChatMessageType } from '@/types'
import { ModuleId } from '@/lib/modules'
import { getModuleIcon } from '@/lib/moduleIcons'
import { getModuleIconKey, getModuleColor } from '@/lib/iconMapping'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Clock, User, Bot } from 'lucide-react'

interface MessageHeaderProps {
  message: ChatMessageType
  isUser: boolean
  userInitials: string
  currentModuleId?: ModuleId | null
  showTimestamp?: boolean
  showModule?: boolean
  showModel?: boolean
  className?: string
}

export function MessageHeader({
  message,
  isUser,
  userInitials,
  currentModuleId,
  showTimestamp = true,
  showModule = true,
  showModel = true,
  className = ''
}: MessageHeaderProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getModuleIconComponent = () => {
    if (!currentModuleId) return null
    
    const iconKey = getModuleIconKey(currentModuleId)
    const IconComponent = getModuleIcon(iconKey)
    
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />
    }
    
    return <Bot className="w-4 h-4" />
  }

  const getModuleColorClass = () => {
    if (!currentModuleId) return 'bg-gray-100 text-gray-700'
    
    const color = getModuleColor(currentModuleId)
    return `bg-${color}-100 text-${color}-700`
  }

  const getModelTierColor = (tier?: string) => {
    switch (tier) {
      case 'IA_SUPER':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'IA_ECO':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'IA':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
      default:
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 mb-2 ${className}`}>
        {/* Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarFallback className={`text-xs ${
            isUser 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : (
              getModuleIconComponent()
            )}
          </AvatarFallback>
        </Avatar>

        {/* Message info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Role label */}
          <span className="text-sm font-medium text-gray-700">
            {isUser ? 'Você' : 'Assistente'}
          </span>

          {/* Module badge */}
          {showModule && currentModuleId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getModuleColorClass()}`}
                >
                  {currentModuleId}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Módulo: {currentModuleId}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Model info */}
          {showModel && message.model && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getModelTierColor(message.tier)}`}
                >
                  {message.model}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div>Modelo: {message.model}</div>
                  {message.provider && <div>Provedor: {message.provider}</div>}
                  {message.tier && <div>Tier: {message.tier}</div>}
                  {message.tokens && <div>Tokens: {message.tokens}</div>}
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Complexity badge */}
          {message.complexity && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getComplexityColor(message.complexity)}`}
                >
                  {message.complexity}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Complexidade: {message.complexity}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Streaming indicator */}
          {message.isStreaming && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-blue-600">Streaming...</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatTimestamp(message.timestamp)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(message.timestamp).toLocaleString('pt-BR')}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}


