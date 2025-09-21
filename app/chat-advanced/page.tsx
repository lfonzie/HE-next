'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { 
  Menu, 
  X, 
  Plus, 
  Settings, 
  User, 
  LogOut,
  Sparkles,
  MessageSquare,
  BookOpen,
  History,
  Zap,
  Brain,
  Heart,
  Rocket,
  Target,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

interface Module {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  planRequired: string;
  isActive: boolean;
}

function ChatAdvancedContent() {
  const session = useSession();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState('professor');
  const [isMobile, setIsMobile] = useState(false);

  // Mock modules data
  const modules: Module[] = [
    {
      id: 'professor',
      name: 'Professor IA',
      icon: '👨‍🏫',
      color: 'bg-blue-500',
      description: 'Assistente para professores',
      planRequired: 'BASIC',
      isActive: true,
    },
    {
      id: 'ti',
      name: 'TI & Suporte',
      icon: '💻',
      color: 'bg-green-500',
      description: 'Suporte técnico e TI',
      planRequired: 'FULL',
      isActive: true,
    },
    {
      id: 'secretaria',
      name: 'Secretaria',
      icon: '📋',
      color: 'bg-purple-500',
      description: 'Assistente administrativo',
      planRequired: 'FULL',
      isActive: true,
    },
    {
      id: 'social-media',
      name: 'Social Media',
      icon: '📱',
      color: 'bg-pink-500',
      description: 'Gestão de redes sociais',
      planRequired: 'FULL',
      isActive: false,
    },
    {
      id: 'wellbeing',
      name: 'Bem-estar',
      icon: '🧘',
      color: 'bg-orange-500',
      description: 'Saúde mental e bem-estar',
      planRequired: 'FULL',
      isActive: false,
    },
  ];

  // Check if user has access to current module
  const currentModule = modules.find(m => m.id === currentModuleId);
  const hasAccess = currentModule?.isActive || session?.user?.role === 'SUPER_ADMIN';

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Handle new chat
        toast({
          title: "Novo chat",
          description: "Iniciando nova conversa...",
        });
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, toast]);

  const handleModuleSelect = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  if (!session?.data?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-3xl">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Acesso Negado
                </h2>
                <p className="text-lg text-gray-600">
                  Você precisa estar logado para acessar o chat avançado.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl" role="main">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
                  <MessageSquare className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white fill-current" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Chat Avançado com IA
              </h1>
              <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Converse com assistentes especializados em diferentes áreas educacionais
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-200">
                  <Sparkles className="h-4 w-4" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-800 border border-purple-200">
                  <Target className="h-4 w-4" />
                  Especializado
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-pink-100 text-pink-800 border border-pink-200">
                  <Users className="h-4 w-4" />
                  Interativo
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                  <Heart className="h-4 w-4" />
                  Personalizado
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">IA Especializada</h3>
                  <p className="text-sm text-blue-700">Assistentes treinados para diferentes áreas educacionais</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Resposta Rápida</h3>
                  <p className="text-sm text-purple-700">Respostas instantâneas e contextualizadas</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-pink-900 mb-2">Experiência Única</h3>
                  <p className="text-sm text-pink-700">Cada conversa é adaptada ao seu contexto</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Module Selection */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              Escolha seu Assistente
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecione o módulo que melhor atende às suas necessidades educacionais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  currentModuleId === module.id
                    ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100'
                    : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'
                }`}
                onClick={() => handleModuleSelect(module.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-2xl">{module.icon}</span>
                  </div>
                  <CardTitle className="text-xl">{module.name}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {!module.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Pro
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {module.planRequired}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full"
                    variant={currentModuleId === module.id ? "default" : "outline"}
                    disabled={!module.isActive && session?.data?.user?.role !== 'SUPER_ADMIN'}
                  >
                    {currentModuleId === module.id ? 'Selecionado' : 'Selecionar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                {currentModule?.name} - Interface de Chat
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg mt-2">
                {currentModule?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {hasAccess ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Interface de Chat Avançada</h3>
                  <p className="text-gray-500">Componente em desenvolvimento</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Recurso Premium</h2>
                  <p className="text-gray-600 mb-6">
                    Este módulo está disponível apenas para usuários com plano completo.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade para Pro
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Documentação
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ChatAdvanced() {
  return (
    <ProtectedRoute>
      <ChatAdvancedContent />
    </ProtectedRoute>
  );
}
