'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Clock, MessageSquare, User, Mail, Phone, AlertCircle } from 'lucide-react';

interface DemoUser {
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export default function Demo() {
  const router = useRouter();
  const { toast } = useToast();
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Perguntas pré-definidas para o demo
  const demoQuestions = [
    "Como funciona o sistema de IA educacional do HubEdu.ia?",
    "Quais são os módulos disponíveis e como eles podem ajudar minha escola?",
    "Como o HubEdu.ia garante a privacidade e conformidade com a LGPD?",
    "Quais são os benefícios financeiros e operacionais para uma escola?",
    "Como posso implementar o HubEdu.ia na minha instituição de ensino?"
  ];

  const startTimer = useCallback((registeredAt: Date) => {
    const updateTimer = () => {
      const now = new Date();
      const timeLeft = 24 * 60 * 60 * 1000 - (now.getTime() - registeredAt.getTime());
      
      if (timeLeft <= 0) {
        setTimeRemaining('Expirado');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('demoUser');
        }
        toast({
          title: 'Demo expirado',
          description: 'O período de demonstração de 24 horas expirou. Cadastre-se novamente para acessar.',
          variant: 'destructive',
        });
        router.push('/demo-register');
        return;
      }
      
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer(); // Atualizar imediatamente
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [router, toast]);

  useEffect(() => {
    // Verificar se o usuário está registrado para o demo
    if (typeof window !== 'undefined') {
      const storedDemoUser = localStorage.getItem('demoUser');
      if (storedDemoUser) {
        try {
          const user = JSON.parse(storedDemoUser);
          const registeredAt = new Date(user.registeredAt);
          const now = new Date();
          const hoursElapsed = (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60);
          
          // Verificar se ainda está dentro do prazo de 24 horas
          if (hoursElapsed < 24) {
            setDemoUser(user);
            startTimer(registeredAt);
          } else {
            // Demo expirado
            localStorage.removeItem('demoUser');
            toast({
              title: 'Demo expirado',
              description: 'O período de demonstração de 24 horas expirou. Cadastre-se novamente para acessar.',
              variant: 'destructive',
            });
            router.push('/demo-register');
          }
        } catch (error) {
          console.error('Erro ao carregar dados do demo:', error);
          localStorage.removeItem('demoUser');
          router.push('/demo-register');
        }
      } else {
        router.push('/demo-register');
      }
    }
    
    setIsLoading(false);
  }, [router, toast, startTimer]);


  const handleQuestionClick = (question: string) => {
    // Simular clique na pergunta (será implementado no chat)
    console.log('Pergunta selecionada:', question);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando demo...</p>
        </div>
      </div>
    );
  }

  if (!demoUser) {
    return null; // Será redirecionado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30">
      {/* Header do Demo */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/assets/Logo_HubEdu.ia.svg"
                alt="HubEdu.ia"
                width={32}
                height={32}
                className="object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Demo HubEdu.ia</h1>
                <p className="text-sm text-gray-600">Modo demonstração</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {timeRemaining}
                </span>
              </div>
              
              {/* Usuário */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{demoUser.name}</span>
              </div>
              
              {/* Botão voltar */}
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar com informações do demo */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informações do usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Seus dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{demoUser.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{demoUser.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{demoUser.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Limitações do demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span>Limitações do Demo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Máximo de 5 mensagens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Acesso por 24 horas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">1 demo por e-mail/celular</span>
                </div>
              </CardContent>
            </Card>

            {/* Perguntas sugeridas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perguntas sugeridas</CardTitle>
                <p className="text-sm text-gray-600">
                  Clique em uma pergunta para testar o chat
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {demoQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 text-sm"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Área do chat */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-lg">Chat IA - Modo Demo</CardTitle>
                <p className="text-sm text-gray-600">
                  Teste o sistema de IA educacional com até 5 mensagens
                </p>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Chat Demo</h3>
                    <p className="text-gray-500">Interface de chat será implementada aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer do demo */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-yellow-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gostou do que viu?
            </h3>
            <p className="text-gray-600 mb-4">
              Cadastre-se para ter acesso completo a todos os módulos e funcionalidades
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  Cadastrar-se
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline">
                  Falar com vendas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
