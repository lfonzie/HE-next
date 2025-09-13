import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../hooks/useAuth";
import { ModuleSelector } from "./chat/ModuleSelector";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { X, Menu, Shield, School, User, LogOut } from "lucide-react";
import { ASSETS } from "../constants/assets";
import { useModuleNavigation } from "../hooks/useModuleNavigation";
import { Link } from "wouter";

interface SidebarMobileProps {
  selectedModule: string | null;
  onSelectModule: (moduleId: string) => void;
}

export function SidebarMobile({ selectedModule, onSelectModule }: SidebarMobileProps) {
  const { user, logout } = useAuth();
  const { navigateToModule, isNavigating } = useModuleNavigation({
    onModuleChange: (moduleId) => {
      onSelectModule(moduleId);
    },
    userRole: user?.role || 'STUDENT',
    schoolPlan: user?.schoolPlan || 'PROFESSOR'
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      setIsMobile(newIsMobile);
      
      // Em mobile, fechar sidebar ao redimensionar
      if (newIsMobile) {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleModuleSelect = (moduleId: string) => {
    // Always call the parent callback first
    onSelectModule(moduleId);
    
    try {
      // Usar o hook de navegação seguro
      navigateToModule(moduleId);
      
      // Fechar sidebar após seleção
      closeSidebar();
    } catch (error) {
      console.error('❌ SidebarMobile: Error selecting module:', error);
      
      // Fechar sidebar após erro
      closeSidebar();
    }
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  // Não renderizar em desktop
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Botão hamburger para mobile */}
      <button
        onClick={toggleSidebar}
        className="mobile-hamburger-btn"
        aria-label="Abrir menu"
        title="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar mobile como overlay */}
      <div className={`mobile-sidebar-overlay ${isOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-content">
          {/* Header */}
          <div className="mobile-sidebar-header">
            <div className="mobile-sidebar-logo">
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <div>
                <h2 className="mobile-sidebar-title">
                  {user?.schoolId || "Escola"}
                </h2>
                <p className="mobile-sidebar-subtitle">Powered by HubEdu.ia</p>
              </div>
            </div>
            
            <button
              onClick={closeSidebar}
              className="mobile-close-btn"
              aria-label="Fechar menu"
              title="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Módulos */}
          <div className="mobile-sidebar-content-body">
            <ModuleSelector
              selectedModule={selectedModule}
              onSelectModule={handleModuleSelect}
            />

            {/* Token Message Panel */}
            <div className="mobile-token-panel">
            </div>

            {/* Footer com informações do usuário */}
            <div className="mobile-sidebar-footer">
              <div className="mobile-user-info">
                <Avatar className="w-10 h-10">
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
                <div className="mobile-user-details">
                  <p className="mobile-user-name">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="mobile-user-role">
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
                <div className="mobile-admin-buttons">
                  {user.role === "SUPER_ADMIN" && (
                    <>
                      <Link href="/admin-dashboard" className="w-full">
                        <Button 
                          variant="outline" 
                          className="mobile-admin-btn system-admin"
                          data-testid="button-system-admin-mobile"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          System Admin
                        </Button>
                      </Link>
                      <Link href="/escola-admin" className="w-full">
                        <Button 
                          variant="outline" 
                          className="mobile-admin-btn admin-escola"
                          data-testid="button-admin-escola-mobile"
                        >
                          <School className="w-4 h-4 mr-2" />
                          Admin Escola
                        </Button>
                      </Link>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="w-full">
                      <Button 
                        variant="outline" 
                        className="mobile-admin-btn admin"
                        data-testid="button-admin-mobile"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                onClick={logout}
                className="mobile-logout-btn"
                data-testid="button-logout-mobile"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop para mobile */}
      {isOpen && (
        <div 
          className="mobile-sidebar-backdrop"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}