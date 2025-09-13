'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Link from 'next/link';

interface Module {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  planRequired: string;
  isActive: boolean;
}

export default function ChatAdvanced() {
  const { data: session } = useSession();
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

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p>Você precisa estar logado para acessar o chat.</p>
          <Link href="/login">
            <Button className="mt-4">Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:flex md:flex-col"
        )}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Módulos</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    currentModuleId === module.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                    module.color
                  )}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{module.name}</span>
                      {!module.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Module Info */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-lg",
                  currentModule?.color
                )}>
                  {currentModule?.icon}
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{currentModule?.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentModule?.description}
                  </p>
                </div>
                {!hasAccess && (
                  <Badge variant="secondary" className="text-xs">
                    Pro
                  </Badge>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Action Buttons */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Novo chat",
                        description: "Iniciando nova conversa...",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Novo chat (Ctrl+K)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configurações (Ctrl+B)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Chat Interface */}
          <div className="flex-1 relative">
            {hasAccess ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Interface de Chat Avançada</h3>
                  <p className="text-gray-500">Componente em desenvolvimento</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Recurso Premium</h2>
                  <p className="text-muted-foreground mb-6">
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
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>HubEdu.ia v2.0</span>
              <span>•</span>
              <span>Powered by AI</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {session.user.role || 'USER'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Basic
              </Badge>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
