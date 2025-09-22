"use client"

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Settings, 
  Shield, 
  Wrench,
  X,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Como faço para acessar os módulos da plataforma?",
    answer: "Para acessar os módulos, faça login na plataforma e clique no ícone do módulo desejado na barra lateral. Cada módulo tem funcionalidades específicas para diferentes áreas da escola.",
    category: "Visão Geral da Plataforma",
    tags: ["acesso", "módulos", "login"]
  },
  {
    id: "2",
    question: "Quais são os módulos disponíveis?",
    answer: "A plataforma oferece 9 módulos: Professor (assistente de estudos), TI (suporte técnico), RH (recursos humanos), Financeiro (gestão financeira), Coordenação (gestão pedagógica), Atendimento (suporte multicanal), Bem-Estar (suporte socioemocional), Social Media (comunicação digital) e ENEM Interativo (simulador ENEM).",
    category: "Módulos Disponíveis",
    tags: ["módulos", "funcionalidades", "especialização"]
  },
  {
    id: "3",
    question: "Como funciona o sistema de cotas?",
    answer: "O sistema de cotas controla o uso da plataforma por usuário. Cada plano tem limites específicos de mensagens, tokens e funcionalidades. Você pode acompanhar seu uso no painel de usuário.",
    category: "Funcionalidades Principais",
    tags: ["cotas", "limites", "uso"]
  },
  {
    id: "4",
    question: "Posso usar a plataforma em dispositivos móveis?",
    answer: "Sim! A plataforma é totalmente responsiva e funciona em smartphones e tablets. Recomendamos usar navegadores atualizados como Chrome, Firefox ou Safari.",
    category: "Requisitos Técnicos",
    tags: ["mobile", "dispositivos", "navegadores"]
  },
  {
    id: "5",
    question: "Como faço para resetar minha senha?",
    answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas por email. Se não receber o email, verifique sua caixa de spam ou entre em contato com o suporte.",
    category: "Problemas e Soluções",
    tags: ["senha", "login", "recuperação"]
  },
  {
    id: "6",
    question: "A plataforma suporta renderização de fórmulas matemáticas?",
    answer: "Sim! A plataforma suporta LaTeX para renderização de fórmulas matemáticas. Use $ para fórmulas inline e $$ para fórmulas em bloco. Exemplo: $x^2 + y^2 = z^2$",
    category: "Funcionalidades Principais",
    tags: ["matemática", "latex", "fórmulas"]
  },
  {
    id: "7",
    question: "Como funciona o sistema de gamificação?",
    answer: "O sistema de gamificação inclui pontos por interações, badges por conquistas, ranking entre usuários e progresso visual. Isso torna o aprendizado mais engajante e motivador.",
    category: "Funcionalidades Principais",
    tags: ["gamificação", "pontos", "badges", "ranking"]
  },
  {
    id: "8",
    question: "Posso personalizar a interface da plataforma?",
    answer: "Sim! A plataforma oferece temas claro e escuro, e você pode personalizar algumas configurações no painel de usuário. Mais opções de personalização estão sendo desenvolvidas.",
    category: "Configurações e Personalização",
    tags: ["personalização", "temas", "interface"]
  },
  {
    id: "9",
    question: "Como funciona o sistema de analytics?",
    answer: "O sistema de analytics fornece relatórios detalhados sobre uso da plataforma, performance dos usuários, estatísticas de módulos e métricas de engajamento. Administradores têm acesso a relatórios avançados.",
    category: "Painéis Administrativos",
    tags: ["analytics", "relatórios", "métricas"]
  },
  {
    id: "10",
    question: "A plataforma é segura?",
    answer: "Sim! A plataforma utiliza criptografia SSL, autenticação JWT, e segue as melhores práticas de segurança. Todos os dados são protegidos e a plataforma está em conformidade com a LGPD.",
    category: "Segurança e Privacidade",
    tags: ["segurança", "lgpd", "criptografia", "privacidade"]
  }
];

const categories = [
  "Visão Geral da Plataforma",
  "Módulos Disponíveis",
  "Funcionalidades Principais",
  "Configurações e Personalização",
  "Painéis Administrativos",
  "Problemas e Soluções",
  "Requisitos Técnicos",
  "Segurança e Privacidade"
];

const categoryIcons: Record<string, any> = {
  "Visão Geral da Plataforma": BookOpen,
  "Módulos Disponíveis": Settings,
  "Usuários e Permissões": Users,
  "Funcionalidades Principais": HelpCircle,
  "Configurações e Personalização": Settings,
  "Painéis Administrativos": Settings,
  "Problemas e Soluções": Wrench,
  "Requisitos Técnicos": Wrench,
  "Segurança e Privacidade": Shield,
  "Suporte e Manutenção": HelpCircle
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          context: 'support'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[40vh] p-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Suporte HubEdu.ia
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat com IA
            </Button>
            <Button
              variant={activeTab === 'faq' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('faq')}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Olá! Como posso ajudá-lo hoje?</p>
                    <p className="text-sm mt-2">Digite sua pergunta abaixo e nossa IA irá responder.</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm text-gray-600">IA está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || isLoading}
                    className="px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar perguntas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      onClick={() => setSelectedCategory(null)}
                      size="sm"
                    >
                      Todas
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        size="sm"
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map(faq => {
                  const isExpanded = expandedItems.has(faq.id);
                  const CategoryIcon = categoryIcons[faq.category] || HelpCircle;
                  
                  return (
                    <Card key={faq.id} className="hover:shadow-md transition-shadow">
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleExpanded(faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CategoryIcon className="w-5 h-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{faq.question}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                                <div className="flex gap-1">
                                  {faq.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredFAQs.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <HelpCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhuma pergunta encontrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tente ajustar sua busca ou filtros para encontrar o que procura.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(null);
                    }}>
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
