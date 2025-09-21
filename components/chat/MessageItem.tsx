"use client"

import { Message } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, getModuleConfig } from '@/lib/utils'
import { MessageRenderer } from './MessageRenderer'
import { Copy, Check, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

interface MessageItemProps {
  message: Message
  isLast?: boolean
}

export function MessageItem({ message, isLast = false }: MessageItemProps) {
  const isUser = message.role === 'user'
  const moduleConfig = message.module ? getModuleConfig(message.module) : null
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(timestamp)
  }

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isUser ? (
        // Mensagem do usuário
        <div className="relative max-w-[75%] lg:max-w-[60%]">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-lg">
            <div className="prose prose-sm max-w-none prose-invert">
              <div className="whitespace-pre-wrap text-white">
                {message.content || ''}
              </div>
            </div>
            <div className="text-xs opacity-70 mt-2 text-right text-white">
              {message.timestamp ? formatTime(message.timestamp) : ''}
            </div>
          </div>
          
          {/* Seta da bolha */}
          <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-blue-600"></div>
          
          {/* Ações */}
          {showActions && (
            <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50"
              >
                {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Mensagem do assistente
        <div className="relative max-w-[85%] lg:max-w-[70%]">
          <div className="p-4">
              <div className="space-y-3">
                {/* Header com informações do módulo */}
                <div className="flex items-center gap-2 text-sm">
                  {moduleConfig && (
                    <>
                      <span className="text-lg">{moduleConfig.icon}</span>
                      <Badge variant="secondary" className="text-xs">
                        {moduleConfig.name}
                      </Badge>
                    </>
                  )}
                  {message.tier && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${
                        message.tier === "IA_SUPER"
                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-200"
                          : message.tier === "IA_ECO"
                          ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-200"
                          : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {message.tier === "IA_SUPER" ? "🚀 IA Turbo" : message.tier === "IA_ECO" ? "🌱 IA Eco" : "⚡ IA"}
                    </Badge>
                  )}
                  
                  {/* Indicador de streaming */}
                  {message.isStreaming && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs">Digitando...</span>
                    </div>
                  )}
                </div>
                
                {/* Conteúdo da mensagem */}
                <MessageRenderer
                  content={message.content || ''}
                  moduleId={message.module}
                  structured={message.structured}
                  blocks={message.blocks}
                  actions={message.actions}
                  onActionClick={(action) => {
                    console.log('Action clicked:', action)
                    // Aqui você pode implementar a lógica para executar a ação
                  }}
                  onBlockClick={(block) => {
                    console.log('Block clicked:', block)
                    // Aqui você pode implementar a lógica para executar o bloco
                  }}
                />
                
                {/* Footer com timestamp e ações */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{message.timestamp ? formatTime(message.timestamp) : ''}</span>
                  
                  {/* Ações */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
