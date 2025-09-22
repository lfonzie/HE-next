import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { ModuleSelector } from "../chat/ModuleSelector";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { X, Menu, Shield, School, UserShield, SignOutAlt } from 'lucide-react';
import { ASSETS } from "../../constants/assets";
import { useModuleNavigation } from "../../hooks/useModuleNavigation";
import { Link } from "wouter";

interface SidebarProps {
  selectedModule: string;
  onSelectModule: (moduleId: string) => void;
}

export function Sidebar({ selectedModule, onSelectModule }: SidebarProps) {
  const { user, logout } = useAuth();
  const { navigateToModule, isNavigating } = useModuleNavigation({
    onModuleChange: (moduleId) => {
      onSelectModule(moduleId);
    },
    userRole: user?.role || 'STUDENT',
    schoolPlan: user?.schoolPlan || 'PROFESSOR'
  });
  
  // Estado para controlar sidebar mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detecção mobile com useEffect para resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Se é mobile, fechar sidebar
      if (newIsMobile) {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // NÃO RENDERIZAR EM MOBILE
  if (isMobile) {
    return null;
  }

  const handleModuleSelect = (moduleId: string) => {
    try {
      // Usar o hook de navegação seguro
      navigateToModule(moduleId);
      
    } catch (error) {
      console.error('❌ Erro ao selecionar módulo no sidebar:', error);
      
      // Fallback: usar a função original
      onSelectModule(moduleId);
    }
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <>
      {/* Sidebar - APENAS PARA DESKTOP */}
      <div
        className="sidebar"
        style={{
          display: 'block',
          visibility: 'visible'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Image 
              src={ASSETS.logoIcon} 
              alt="HubEdu.ia Logo" 
              width={32}
              height={32}
              className="rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.schoolId || "Escola"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Powered by HubEdu.ia</p>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="sidebar-content">
          <ModuleSelector
            selectedModule={selectedModule}
            onSelectModule={handleModuleSelect}
          />
        </div>

        {/* Token Message Panel - Para todos os usuários */}
        <div className="sidebar-token-panel">
        </div>

        {/* Footer com informações do usuário */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
          {/* User Identification */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              {user?.profileImageUrl ? (
                <AvatarImage 
                  src={user.profileImageUrl} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === "STUDENT" ? "Aluno" : 
                 user?.role === "TEACHER" ? "Professor" :
                 user?.role === "STAFF" ? "Funcionário" : 
                 user?.role === "ADMIN" ? "Admin" :
                 user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                 user?.role || "Usuário"}
              </p>
            </div>
          </div>

          {/* Admin Buttons */}
          {user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div className="space-y-2">
              {user.role === "SUPER_ADMIN" && (
                <>
                  <Link href="/admin-dashboard" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                      data-testid="button-system-admin-sidebar"
                    >
                      <Shield className="mr-2" />
                      System Admin
                    </Button>
                  </Link>
                  <Link href="/escola-admin" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                      data-testid="button-admin-escola-sidebar"
                    >
                      <School className="mr-2" />
                      Admin Escola
                    </Button>
                  </Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                    data-testid="button-admin-sidebar"
                  >
                    <UserShield className="mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={logout}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            data-testid="button-logout-sidebar"
          >
            <SignOutAlt className="mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
}