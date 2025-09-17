"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, AlertCircle, CheckCircle, Clock, User, Building, FileText, Send } from "lucide-react";
import Link from "next/link";

interface TicketForm {
  subject: string;
  description: string;
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  category: "TECNICO" | "PEDAGOGICO" | "ADMINISTRATIVO" | "OUTROS";
}

export default function SuportePage() {
  const { toast } = useToast();
  const [form, setForm] = useState<TicketForm>({
    subject: "",
    description: "",
    priority: "MEDIA",
    category: "TECNICO"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.subject.trim() || !form.description.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: form.subject,
          description: form.description,
          priority: form.priority,
          category: form.category
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar ticket');
      }

      const data = await response.json();
      setSubmittedTicket(data.ticketId);
      
      toast({
        title: "Sucesso!",
        description: `Ticket criado com sucesso! ID: ${data.ticketId}`,
        variant: "default"
      });

      // Reset form
      setForm({
        subject: "",
        description: "",
        priority: "MEDIA",
        category: "TECNICO"
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar ticket de suporte",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityInfo = {
    BAIXA: { color: "bg-green-100 text-green-800", time: "24 horas", icon: Clock },
    MEDIA: { color: "bg-yellow-100 text-yellow-800", time: "4 horas", icon: Clock },
    ALTA: { color: "bg-orange-100 text-orange-800", time: "2 horas", icon: AlertCircle },
    CRITICA: { color: "bg-red-100 text-red-800", time: "1 hora", icon: AlertCircle }
  };

  const categoryInfo = {
    TECNICO: { name: "Técnico", icon: "💻", description: "Problemas de sistema, login, performance" },
    PEDAGOGICO: { name: "Pedagógico", icon: "📚", description: "Dúvidas sobre módulos, conteúdo educacional" },
    ADMINISTRATIVO: { name: "Administrativo", icon: "📋", description: "Gestão de usuários, configurações, relatórios" },
    OUTROS: { name: "Outros", icon: "❓", description: "Outras dúvidas e solicitações" }
  };

  if (submittedTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardContent className="pt-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ticket Criado com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu ticket de suporte foi criado e nossa equipe entrará em contato em breve.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">ID do Ticket:</p>
                <p className="font-mono text-lg font-bold text-gray-900">{submittedTicket}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setSubmittedTicket(null)}>
                  Criar Novo Ticket
                </Button>
                <Link href="/chat">
                  <Button variant="outline">
                    Voltar ao Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Suporte HubEdu.ia
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aqui para ajudar! Abra um ticket de suporte e nossa equipe especializada entrará em contato.
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Novo Ticket de Suporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Assunto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Descreva brevemente o problema ou dúvida"
                      maxLength={200}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {form.subject.length}/200 caracteres
                    </p>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <Select
                      value={form.category}
                      onValueChange={(value: any) => setForm({ ...form, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryInfo).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{info.icon}</span>
                              <span>{info.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryInfo[form.category as keyof typeof categoryInfo].description}
                    </p>
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade *
                    </label>
                    <Select
                      value={form.priority}
                      onValueChange={(value: any) => setForm({ ...form, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityInfo).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <info.icon className="w-4 h-4" />
                              <span>{key}</span>
                              <span className="text-xs text-gray-500">({info.time})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição Detalhada *
                    </label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Descreva o problema em detalhes. Inclua passos para reproduzir, screenshots se possível, e qualquer informação relevante."
                      rows={8}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 10 caracteres
                    </p>
                  </div>

                  {/* Botão de Envio */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.subject.trim() || form.description.trim().length < 10}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6">
            {/* Informações de Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempos de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(priorityInfo).map(([priority, info]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <info.icon className="w-4 h-4" />
                      <span className="text-sm">{priority}</span>
                    </div>
                    <Badge className={info.color}>{info.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dicas para um Ticket Eficiente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Descreva o problema de forma clara e objetiva</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Inclua passos para reproduzir o problema</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Anexe screenshots se possível</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Mencione seu navegador e sistema operacional</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Escolha a prioridade adequada</span>
                </div>
              </CardContent>
            </Card>

            {/* Canais Alternativos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Outros Canais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">suporte@hubedu.ia.br</p>
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-gray-600">(11) 99999-9999</p>
                </div>
                <div>
                  <p className="font-medium">Horário</p>
                  <p className="text-gray-600">24/7</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
