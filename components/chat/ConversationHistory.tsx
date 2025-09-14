"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  MessageSquare, 
  Calendar, 
  Hash, 
  TrendingUp,
  Download,
  Upload,
  Trash2,
  Clock,
  User
} from 'lucide-react'
import { Conversation } from '@/types'
import { formatDate } from '@/lib/utils'

interface ConversationHistoryProps {
  conversations: Conversation[]
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onDeleteConversation: (conversationId: string) => void
  onExportConversation: (conversation: Conversation) => void
  onImportConversation: (file: File) => void
  searchConversations: (query: string) => Conversation[]
  getConversationStats: () => {
    totalConversations: number
    totalMessages: number
    totalTokens: number
    avgMessagesPerConversation: number
    mostUsedModule: string
  }
}

export function ConversationHistory({
  conversations,
  currentConversation,
  onSelectConversation,
  onDeleteConversation,
  onExportConversation,
  onImportConversation,
  searchConversations,
  getConversationStats
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showStats, setShowStats] = useState(false)
  
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    return searchConversations(searchQuery)
  }, [conversations, searchQuery, searchConversations])
  
  const stats = useMemo(() => getConversationStats(), [getConversationStats])
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImportConversation(file)
    }
  }
  
  const formatConversationTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return 'Hoje'
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias atrás`
    } else {
      return formatDate(date)
    }
  }
  
  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'professor': 'bg-blue-100 text-blue-800',
      'ti': 'bg-gray-100 text-gray-800',
      'atendimento': 'bg-red-100 text-red-800',
      'rh': 'bg-purple-100 text-purple-800',
      'financeiro': 'bg-green-100 text-green-800',
      'social-media': 'bg-pink-100 text-pink-800',
      'wellbeing': 'bg-orange-100 text-orange-800',
      'coordenacao': 'bg-indigo-100 text-indigo-800',
      'secretaria': 'bg-emerald-100 text-emerald-800'
    }
    return colors[module.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header com busca e ações */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Histórico
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                title="Estatísticas"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Ações de importação/exportação */}
          <div className="flex gap-2">
            <input
              type="file"
              id="import-conversation"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-conversation')?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            
            {currentConversation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportConversation(currentConversation)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {/* Estatísticas */}
      {showStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Conversas:</span>
                <span className="font-semibold">{stats.totalConversations}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Mensagens:</span>
                <span className="font-semibold">{stats.totalMessages}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Média:</span>
                <span className="font-semibold">{stats.avgMessagesPerConversation}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">Top:</span>
                <span className="font-semibold text-xs">{stats.mostUsedModule}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Lista de conversas */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <div className="space-y-2">
                      {/* Título e módulo */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm truncate pr-2">
                          {conversation.title || 'Conversa sem título'}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getModuleColor(conversation.module)}`}
                        >
                          {conversation.module}
                        </Badge>
                      </div>
                      
                      {/* Informações da conversa */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{conversation.messages.length}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatConversationTime(conversation.updatedAt)}</span>
                        </div>
                        
                        {conversation.tokenCount && (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>{conversation.tokenCount}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Última mensagem */}
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.messages[conversation.messages.length - 1].content.slice(0, 60)}...
                        </p>
                      )}
                      
                      {/* Ações */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onExportConversation(conversation)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteConversation(conversation.id)
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
