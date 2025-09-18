"use client"

import React, { useState } from 'react'
import { Message as ChatMessageType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Share2, 
  MoreHorizontal,
  Flag,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Download
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MessageVoting } from './MessageVoting'
import { CopyButton } from './CopyButton'

interface MessageActionsProps {
  message: ChatMessageType
  conversationId: string
  messageIndex: number
  onVote?: (messageId: string, vote: 'up' | 'down') => void
  onCopy?: (content: string) => void
  onShare?: (message: ChatMessageType) => void
  onBookmark?: (messageId: string) => void
  onReport?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onExport?: (message: ChatMessageType) => void
  className?: string
}

export function MessageActions({
  message,
  conversationId,
  messageIndex,
  onVote,
  onCopy,
  onShare,
  onBookmark,
  onReport,
  onRegenerate,
  onExport,
  className = ''
}: MessageActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  const handleVote = (voteType: 'up' | 'down') => {
    setVote(voteType)
    onVote?.(message.id, voteType)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      onCopy?.(message.content)
      
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = () => {
    onShare?.(message)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark?.(message.id)
  }

  const handleReport = () => {
    onReport?.(message.id)
  }

  const handleRegenerate = () => {
    onRegenerate?.(message.id)
  }

  const handleExport = () => {
    onExport?.(message)
  }

  const canVote = !message.isStreaming && message.role === 'assistant'
  const canRegenerate = !message.isStreaming && message.role === 'assistant'

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Voting buttons */}
        {canVote && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('up')}
                  className={`h-8 w-8 p-0 ${
                    vote === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-500'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {vote === 'up' ? 'Voto positivo' : 'Votar positivamente'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('down')}
                  className={`h-8 w-8 p-0 ${
                    vote === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-500'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {vote === 'down' ? 'Voto negativo' : 'Votar negativamente'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Copy button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`h-8 w-8 p-0 ${
                isCopied ? 'text-green-600 bg-green-50' : 'text-gray-500'
              }`}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isCopied ? 'Copiado!' : 'Copiar mensagem'}
          </TooltipContent>
        </Tooltip>

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleBookmark}>
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Remover dos favoritos
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Adicionar aos favoritos
                </>
              )}
            </DropdownMenuItem>

            {canRegenerate && (
              <DropdownMenuItem onClick={handleRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar resposta
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar mensagem
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={handleReport}
              className="text-red-600 focus:text-red-600"
            >
              <Flag className="w-4 h-4 mr-2" />
              Reportar problema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message metadata badges */}
        <div className="flex items-center gap-1 ml-2">
          {message.tokens && (
            <Badge variant="outline" className="text-xs">
              {message.tokens} tokens
            </Badge>
          )}
          
          {message.tier && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                message.tier === 'IA_SUPER' 
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : message.tier === 'IA_ECO'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              {message.tier}
            </Badge>
          )}

          {message.complexity && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                message.complexity === 'high'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : message.complexity === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-green-100 text-green-700 border-green-200'
              }`}
            >
              {message.complexity}
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}


