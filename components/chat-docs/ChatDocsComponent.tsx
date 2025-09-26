'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Send, 
  Loader2, 
  FileSearch,
  Trash2,
  Download,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  content: string
  type: string
  size: number
  uploadedAt: Date
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  documentRef?: string
}

export default function ChatDocsComponent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload de documento
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['text/plain', 'application/pdf', 'text/markdown', 'application/json']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use TXT, PDF, MD ou JSON.')
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.')
      return
    }

    setIsLoading(true)
    
    try {
      const content = await readFileContent(file)
      
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        content,
        type: file.type,
        size: file.size,
        uploadedAt: new Date()
      }

      setDocuments(prev => [...prev, newDocument])
      toast.success(`Documento "${file.name}" carregado com sucesso!`)
      
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error)
      toast.error('Erro ao carregar arquivo')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Ler conteúdo do arquivo
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      
      if (file.type === 'application/pdf') {
        // Para PDF, usar texto simples por enquanto
        reader.readAsText(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      documentRef: selectedDocument || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat-docs/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          documentId: selectedDocument,
          documents: documents.filter(doc => doc.id === selectedDocument)
        })
      })

      if (!response.ok) {
        throw new Error('Erro na API')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao processar mensagem')
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, selectedDocument, documents])

  // Remover documento
  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    if (selectedDocument === id) {
      setSelectedDocument(null)
    }
    toast.success('Documento removido')
  }, [selectedDocument])

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Chat com Documentos
        </h1>
        <p className="text-muted-foreground">
          Converse com seus documentos usando IA. Faça perguntas e obtenha respostas baseadas no conteúdo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Documentos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos
                <Badge variant="secondary">{documents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload */}
              <div className="space-y-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Carregar Documento
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.md,.json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Suporta TXT, PDF, MD, JSON (máx. 10MB)
                </p>
              </div>

              {/* Lista de Documentos */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedDocument === doc.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)} • {doc.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Visualizar documento
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeDocument(doc.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum documento carregado</p>
                  <p className="text-sm">Carregue um documento para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5" />
                Chat
                {selectedDocument && (
                  <Badge variant="outline">
                    {documents.find(d => d.id === selectedDocument)?.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Faça uma pergunta sobre seus documentos</p>
                    <p className="text-sm">Selecione um documento e comece a conversar</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder={
                    selectedDocument 
                      ? "Faça uma pergunta sobre o documento selecionado..."
                      : "Selecione um documento primeiro..."
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={!selectedDocument || isLoading}
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {selectedDocument ? 'Pressione Enter para enviar' : 'Selecione um documento para começar'}
                  </p>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedDocument || !inputMessage.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
