"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { useConversationManager } from '@/hooks/useConversationManager'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  History, 
  Download, 
  Search, 
  Trash2, 
  Copy, 
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Clock
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Conversation as ChatConversation } from '@/types'

interface ConversationManagerProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversation: ChatConversation) => void
  currentConversationId?: string
  className?: string
}

export function ConversationManager({
  isOpen,
  onClose,
  onSelectConversation,
  currentConversationId,
  className = ''
}: ConversationManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const {
    conversations,
    currentConversation,
    conversationCount,
    createConversation,
    deleteConversation,
    exportConversation,
    searchConversations,
    duplicateConversation
  } = useConversationManager({
    autoSave: true,
    maxConversations: 50,
    enableHistory: true,
    enableExport: true,
    enableSearch: true
  })

  const { notifySuccess, notifyError } = useNotificationContext()

  // Computed values
  const filteredConversations = useMemo(() => {
    return searchConversations(searchQuery)
  }, [conversations, searchQuery, searchConversations])

  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [filteredConversations])

  // Actions
  const handleCreateConversation = useCallback(async () => {
    try {
      const newConversation = await createConversation('atendimento', 'Nova Conversa')
      onSelectConversation(newConversation)
      onClose()
      notifySuccess('Nova Conversa', 'Conversa criada com sucesso!')
    } catch (error) {
      notifyError('Erro', 'Falha ao criar conversa')
    }
  }, [createConversation, onSelectConversation, onClose, notifySuccess, notifyError])

  const handleSelectConversation = useCallback((conversation: ChatConversation) => {
    onSelectConversation(conversation)
    onClose()
  }, [onSelectConversation, onClose])

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      setIsDeleting(conversationId)
      await deleteConversation(conversationId)
      notifySuccess('Conversa Excluída', 'Conversa removida com sucesso!')
    } catch (error) {
      notifyError('Erro', 'Falha ao excluir conversa')
    } finally {
      setIsDeleting(null)
    }
  }, [deleteConversation, notifySuccess, notifyError])

  const handleExportConversation = useCallback(async (conversationId: string) => {
    try {
      setIsExporting(true)
      await exportConversation(conversationId)
      notifySuccess('Exportação Concluída', 'Conversa exportada com sucesso!')
    } catch (error) {
      notifyError('Erro', 'Falha ao exportar conversa')
    } finally {
      setIsExporting(false)
    }
  }, [exportConversation, notifySuccess, notifyError])

  const handleDuplicateConversation = useCallback(async (conversationId: string) => {
    try {
      const duplicated = await duplicateConversation(conversationId)
      notifySuccess('Conversa Duplicada', 'Conversa duplicada com sucesso!')
    } catch (error) {
      notifyError('Erro', 'Falha ao duplicar conversa')
    }
  }, [duplicateConversation, notifySuccess, notifyError])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }, [])

  const getModuleLabel = useCallback((module: string) => {
    const moduleLabels: Record<string, string> = {
      'professor': 'Professor',
      'ti': 'TI',
      'rh': 'RH',
      'financeiro': 'Financeiro',
      'coordenacao': 'Coordenação',
      'secretaria': 'Secretaria',
      'bem-estar': 'Bem-Estar',
      'social-media': 'Social Media',
      'atendimento': 'Atendimento'
    }
    return moduleLabels[module] || module
  }, [])

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Conversas
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversas..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateConversation} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Conversa
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{conversationCount} conversas</span>
            <span>{filteredConversations.length} encontradas</span>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-6 space-y-4">
            {sortedConversations.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={handleCreateConversation} 
                    className="mt-4"
                    variant="outline"
                  >
                    Criar primeira conversa
                  </Button>
                )}
              </div>
            ) : (
              sortedConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentConversationId === conversation.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">
                            {conversation.title || 'Nova Conversa'}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {getModuleLabel(conversation.module)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {conversation.messages.length} mensagens
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(conversation.updatedAt)}
                          </div>
                          {conversation.tokenCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span>{conversation.tokenCount} tokens</span>
                            </div>
                          )}
                        </div>
                        
                        {conversation.messages.length > 0 && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.messages[conversation.messages.length - 1]?.content?.substring(0, 100)}
                            {conversation.messages[conversation.messages.length - 1]?.content?.length > 100 && '...'}
                          </p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectConversation(conversation)
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Abrir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateConversation(conversation.id)
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExportConversation(conversation.id)
                            }}
                            disabled={isExporting}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isExporting ? 'Exportando...' : 'Exportar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteConversation(conversation.id)
                            }}
                            disabled={isDeleting === conversation.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting === conversation.id ? 'Excluindo...' : 'Excluir'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


