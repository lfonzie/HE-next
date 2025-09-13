"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, HelpCircle, BookOpen, Users, Settings, Shield, Wrench } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
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
  "Usuários e Permissões",
  "Funcionalidades Principais",
  "Configurações e Personalização",
  "Painéis Administrativos",
  "Problemas e Soluções",
  "Requisitos Técnicos",
  "Segurança e Privacidade",
  "Suporte e Manutenção"
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

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Encontre respostas rápidas para as dúvidas mais comuns sobre a plataforma HubEdu.ia
            </p>
            <div className="mt-6">
              <Link href="/chat">
                <Button variant="outline">
                  Voltar ao Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            const CategoryIcon = categoryIcons[faq.category];
            
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

        {/* Contact Support */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Não encontrou o que procurava?
            </h3>
            <p className="text-gray-600 mb-4">
              Nossa equipe de suporte está pronta para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/suporte">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Abrir Ticket de Suporte
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline">
                  Chat com Suporte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
