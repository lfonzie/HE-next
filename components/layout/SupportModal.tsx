'use client'

import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, HelpCircle, Send, ChevronDown, ChevronUp, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Como funciona o sistema de aulas com IA?',
    answer: 'Nosso sistema utiliza inteligência artificial avançada para criar aulas personalizadas baseadas no tópico que você inserir. A IA analisa o conteúdo, identifica a matéria e série ideais, e gera uma experiência de aprendizado completa com atividades interativas.',
    category: 'Aulas IA'
  },
  {
    id: '2',
    question: 'Posso usar o simulador ENEM sem pagar?',
    answer: 'Sim! O simulador ENEM é totalmente gratuito e inclui questões reais de anos anteriores. Você pode fazer simulados rápidos, personalizados ou completos sem nenhum custo.',
    category: 'ENEM'
  },
  {
    id: '3',
    question: 'Como funciona o chat com IA?',
    answer: 'Temos diferentes assistentes especializados: Professor IA, TI & Suporte, Secretaria, Social Media e Bem-estar. Cada um é treinado para responder questões específicas da sua área.',
    category: 'Chat IA'
  },
  {
    id: '4',
    question: 'Minhas aulas são salvas automaticamente?',
    answer: 'Sim, todas as aulas geradas são salvas automaticamente na sua conta. Você pode acessá-las a qualquer momento através do seu perfil.',
    category: 'Aulas IA'
  },
  {
    id: '5',
    question: 'Como posso melhorar minha redação ENEM?',
    answer: 'Nossa ferramenta de redação ENEM oferece correção automática, sugestões de melhoria e análise detalhada seguindo os critérios oficiais do ENEM.',
    category: 'Redação'
  },
  {
    id: '6',
    question: 'O sistema funciona no celular?',
    answer: 'Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em smartphones, tablets e desktops.',
    category: 'Geral'
  }
]

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente de suporte do HubEdu.ia. Como posso ajudar você hoje? Você pode me perguntar sobre aulas, simulador ENEM, redação ou qualquer outra funcionalidade da plataforma. 😊',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const categories = ['Todas', ...Array.from(new Set(faqData.map(item => item.category)))]
  const filteredFAQ = selectedCategory === 'Todas' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value)
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Suporte HubEdu.ia</h2>
              <p className="text-sm text-gray-600">Como podemos ajudar você hoje?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat ao Vivo
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'chat' ? (
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-md ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        <span className="text-sm text-gray-600">Digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                      : ""
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFAQ.map((item) => (
                  <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader 
                      className="pb-2 cursor-pointer"
                      onClick={() => toggleFAQ(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <CardTitle className="text-sm font-medium text-gray-900">
                            {item.question}
                          </CardTitle>
                        </div>
                        {expandedFAQ === item.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedFAQ === item.id && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Suporte online disponível</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Email: suporte@hubedu.ia</span>
              <span>WhatsApp: (11) 99999-9999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
