import React, { useState, useEffect, startTransition } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { ModuleSelector } from "../chat/ModuleSelector";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { X, Menu, Shield, School, User, LogOut, Zap, Sparkles, MessageSquare } from "lucide-react";
import { ASSETS } from "../../constants/assets";
import { useModuleNavigation } from "../../hooks/useModuleNavigation";
import { useChatContext } from "../providers/ChatContext";
// useTheme removido - dark mode desabilitado
import { Link } from "wouter";
import "./MainSidebar.css";

interface UnifiedSidebarProps {
  selectedModule: string | null;
  onSelectModule: (moduleId: string) => void;
}

export function UnifiedSidebar({ selectedModule, onSelectModule }: UnifiedSidebarProps) {
  const { user, logout } = useAuth();
  const { isModuleHighlighted } = useChatContext();
  // const { theme, toggleTheme } = useTheme(); // Dark mode desabilitado
  const { navigateToModule, isNavigating } = useModuleNavigation({
    onModuleChange: (moduleId) => {
      onSelectModule(moduleId);
    },
    userRole: user?.role || 'STUDENT',
    schoolPlan: user?.schoolPlan || 'PROFESSOR'
  });
  
  const [isOpen, setIsOpen] = useState(false); // Começar colapsado por padrão
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      const newIsTablet = width >= 768 && width < 1024;
      
      setIsMobile(newIsMobile);
      setIsTablet(newIsTablet);
      
      // Em mobile, fechar sidebar ao redimensionar
      if (newIsMobile) {
        setIsOpen(false);
      }
      // Em tablet/desktop, manter o estado atual (colapsado por padrão)
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gerenciar classe do body para CSS
  useEffect(() => {
    if (!isMobile && isOpen) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
    
    // Cleanup ao desmontar
    return () => {
      document.body.classList.remove('sidebar-expanded');
    };
  }, [isOpen, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleModuleSelect = (moduleId: string) => {
    // Se o sidebar estiver colapsado (não mobile), expandir automaticamente
    if (!isOpen && !isMobile) {
      setIsOpen(true);
    }
    
    // Always call the parent callback first
    onSelectModule(moduleId);
    
    try {
      // Usar o hook de navegação seguro
      navigateToModule(moduleId);
      
      // Fechar sidebar apenas em mobile
      if (isMobile) {
        closeSidebar();
      }
    } catch (error) {
      console.error('❌ UnifiedSidebar: Error selecting module:', error);
      
      // Fechar sidebar apenas em mobile
      if (isMobile) {
        closeSidebar();
      }
    }
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  // Em mobile, renderizar botão hamburger e sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Botão hamburger para mobile */}
        <button
          onClick={toggleSidebar}
          className="mobile-hamburger-btn"
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar mobile como overlay */}
        <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <div>
                <h2 className="sidebar-title">
                  {user?.schoolId || "Escola"}
                </h2>
                <p className="sidebar-subtitle">Powered by HubEdu.ia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={closeSidebar}
                className="bg-red-500 text-white border-none rounded-lg p-2.5 cursor-pointer text-lg w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:translate-y-0 active:shadow-sm"
                aria-label="Fechar menu"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Módulos */}
          <div className="sidebar-content">
            <ModuleSelector
              selectedModule={selectedModule}
              onSelectModule={handleModuleSelect}
            />
            
            {/* Footer com informações do usuário */}
            <div className="sidebar-footer">
              <div className="user-info">
                <Avatar className="w-12 h-12">
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
                <div className="user-details">
                  <p className="user-name">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="user-role">
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
                <div className="admin-buttons">
                  {user.role === "SUPER_ADMIN" && (
                    <>
                      <Button 
                        variant="outline" 
                        className="admin-btn system-admin"
                        onClick={() => window.location.href = '/admin-dashboard'}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        System Admin
                      </Button>
                      <Button 
                        variant="outline" 
                        className="admin-btn"
                        onClick={() => window.location.href = '/admin-system-prompts'}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        System Messages
                      </Button>
                      <Button 
                        variant="outline" 
                        className="admin-btn admin-escola"
                        onClick={() => window.location.href = '/admin-escola'}
                      >
                        <School className="w-4 h-4 mr-2" />
                        Admin Escola
                      </Button>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <Button 
                      variant="outline" 
                      className="admin-btn"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                </div>
              )}
              
              {/* Botão de Logout */}
              <Button
                variant="outline"
                onClick={logout}
                className="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Backdrop para mobile */}
        {isOpen && (
          <div 
            className="sidebar-backdrop active"
            onClick={closeSidebar}
          />
        )}
      </>
    );
  }

  
  // Em tablet e desktop, renderizar sidebar fixa
  return (
    <>
      {/* Backdrop para fechar sidebar quando clicar fora (apenas quando expandido) */}
      {isOpen && !isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-[999]"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar completamente inline */}
      <div 
        className={`sidebar-desktop ${isOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
        style={{ 
          position: 'fixed',
          top: '0',
          left: '0',
          width: isOpen ? (isTablet ? '240px' : '256px') : '80px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderRight: '2px solid #e5e7eb',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '2px 0 15px rgba(0, 0, 0, 0.1)',
          padding: '0',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Image 
            src={ASSETS.logoIcon} 
            alt="HubEdu.ia Logo" 
            width={isOpen ? 32 : 24}
            height={isOpen ? 32 : 24}
            className="rounded-lg object-contain"
          />
          {isOpen && (
            <div>
              <p className="sidebar-title">
                {user?.schoolId || "Escola"}
              </p>
              <p className="sidebar-subtitle">Powered by HubEdu.ia</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isOpen ? (
            <button
              onClick={toggleSidebar}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none rounded-lg p-2 cursor-pointer text-sm w-8 h-8 flex items-center justify-center transition-all duration-300"
              aria-label="Colapsar sidebar"
              title="Colapsar sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none rounded-lg p-1 cursor-pointer text-sm w-6 h-6 flex items-center justify-center transition-all duration-300"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
            >
              <Menu className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Módulos */}
      <div className="sidebar-content">
        <ModuleSelector
          selectedModule={selectedModule}
          onSelectModule={handleModuleSelect}
          isCollapsed={!isOpen}
          isHighlighted={isModuleHighlighted}
        />

        {/* Footer com informações do usuário */}
        <div className="sidebar-footer">
          <div className="user-info">
            <Avatar className={isOpen ? "w-10 h-10" : "w-8 h-8"}>
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
            {isOpen && (
              <div className="user-details">
                <p className="user-name">
                  {user?.name || "Usuário"}
                </p>
                <p className="user-role">
                  {user?.role === "STUDENT" ? "Aluno" : 
                   user?.role === "TEACHER" ? "Professor" :
                   user?.role === "STAFF" ? "Funcionário" : 
                   user?.role === "ADMIN" ? "Admin" :
                   user?.role === "SUPER_ADMIN" ? "Super Admin" : 
                   user?.role || "Usuário"}
                </p>
              </div>
            )}
          </div>

          {/* Admin Buttons */}
          {isOpen && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div className="admin-buttons">
              {user.role === "SUPER_ADMIN" && (
                <>
                  <Button 
                    variant="outline" 
                    className="admin-btn system-admin"
                    onClick={() => window.location.href = '/admin-dashboard'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    System Admin
                  </Button>
                  <Button 
                    variant="outline" 
                    className="admin-btn"
                    onClick={() => window.location.href = '/admin-system-prompts'}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    System Messages
                  </Button>
                  <Button 
                    variant="outline" 
                    className="admin-btn admin-escola"
                    onClick={() => window.location.href = '/admin-escola'}
                  >
                    <School className="w-4 h-4 mr-2" />
                    Admin Escola
                  </Button>
                </>
              )}
              {user.role === "ADMIN" && (
                <Button 
                  variant="outline" 
                  className="admin-btn"
                  onClick={() => window.location.href = '/admin'}
                >
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
          )}

          <Button
            variant="outline"
            onClick={logout}
            className="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isOpen && <span>Sair</span>}
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}