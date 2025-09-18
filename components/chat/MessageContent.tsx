"use client"

import React, { useMemo } from 'react'
import { Message as ChatMessageType } from '@/types'
import { MarkdownRendererNew as MarkdownRenderer } from './MarkdownRendererNew'
import { BlocksRenderer } from './BlocksRenderer'
import { ActionsRenderer } from './ActionsRenderer'
import { MessageRenderer } from './MessageRenderer'
import { ProfessorAnswer } from './ProfessorAnswer'
import { TIAnswer } from './TIAnswer'
import { RHAnswer } from './RHAnswer'
import { FinanceiroAnswer } from './FinanceiroAnswer'
import { CoordenacaoAnswer } from './CoordenacaoAnswer'
import { SecretariaAnswer } from './SecretariaAnswer'
import { BemEstarAnswer } from './BemEstarAnswer'
import { SocialMediaAnswer } from './SocialMediaAnswer'
import { WebSearchCitations } from './WebSearchCitations'
import { ModuleId } from '@/lib/modules'
import { convertToOldModuleId } from '@/lib/modules'

interface MessageContentProps {
  message: ChatMessageType
  currentModuleId?: ModuleId | null
  className?: string
}

export function MessageContent({
  message,
  currentModuleId,
  className = ''
}: MessageContentProps) {
  const oldModuleId = useMemo(() => 
    currentModuleId ? convertToOldModuleId(currentModuleId) : null,
    [currentModuleId]
  )

  const renderModuleSpecificContent = () => {
    if (!oldModuleId) return null

    const moduleProps = {
      message,
      currentModuleId: oldModuleId
    }

    switch (oldModuleId) {
      case 'PROFESSOR':
        return <ProfessorAnswer {...moduleProps} />
      case 'TI':
        return <TIAnswer {...moduleProps} />
      case 'RH':
        return <RHAnswer {...moduleProps} />
      case 'FINANCEIRO':
        return <FinanceiroAnswer {...moduleProps} />
      case 'COORDENACAO':
        return <CoordenacaoAnswer {...moduleProps} />
      case 'SECRETARIA':
        return <SecretariaAnswer {...moduleProps} />
      case 'BEM_ESTAR':
        return <BemEstarAnswer {...moduleProps} />
      case 'SOCIAL_MEDIA':
        return <SocialMediaAnswer {...moduleProps} />
      default:
        return null
    }
  }

  const renderContent = () => {
    // Check if message has structured content
    if (message.content && typeof message.content === 'object') {
      return <BlocksRenderer content={message.content} />
    }

    // Check if message has actions
    if (message.actions && message.actions.length > 0) {
      return (
        <div className="space-y-4">
          <MessageRenderer content={message.content} />
          <ActionsRenderer actions={message.actions} />
        </div>
      )
    }

    // Check if message has web search citations
    if (message.webSearchCitations && message.webSearchCitations.length > 0) {
      return (
        <div className="space-y-4">
          <MarkdownRenderer content={message.content} />
          <WebSearchCitations citations={message.webSearchCitations} />
        </div>
      )
    }

    // Check if message has attachments
    if (message.attachments && message.attachments.length > 0) {
      return (
        <div className="space-y-4">
          <MarkdownRenderer content={message.content} />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Anexos:</h4>
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{attachment.name}</span>
                <span className="text-xs text-gray-500">
                  ({attachment.type}, {formatFileSize(attachment.size)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Default rendering
    return <MarkdownRenderer content={message.content} />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes < 0) return "—"
    const units = ["B", "KB", "MB", "GB"]
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
  }

  return (
    <div className={`message-content ${className}`}>
      {/* Module-specific content */}
      {renderModuleSpecificContent()}
      
      {/* General content */}
      {renderContent()}
      
      {/* Streaming indicator */}
      {message.isStreaming && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Gerando resposta...</span>
        </div>
      )}
    </div>
  )
}


