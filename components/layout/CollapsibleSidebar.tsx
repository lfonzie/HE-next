import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { X, Menu, Shield, School, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { ASSETS } from "../../constants/assets";
import { useModuleNavigation } from "../../hooks/useModuleNavigation";
import { Link } from "wouter";
import { getSidebarIcon } from "../../utils/sidebarIcons";
import { getIconMapping, getFontAwesomeClass, getModuleName } from "../../lib/iconMapping";
import { MODULES, type ModuleId } from "../../lib/modules";
import { getModuleColors, MODULE_ID_MAPPING } from "../../lib/moduleColors";
import "./CollapsibleSidebar.css";

interface CollapsibleSidebarProps {
  selectedModule: string | null;
  onSelectModule: (moduleId: string) => void;
}

interface SidebarItemProps {
  moduleKey: string;
  moduleId: ModuleId;
  iconInfo: { icon: string; name: string; color: string };
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

// Componente SidebarItem com animação fluida
const SidebarItem: React.FC<SidebarItemProps> = ({
  moduleKey,
  moduleId,
  iconInfo,
  isSelected,
  isExpanded,
  onClick
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Obter cores do módulo
  const mappedModuleId = MODULE_ID_MAPPING[moduleKey] || moduleKey;
  const moduleColors = getModuleColors(mappedModuleId);
  
  // Configuração da animação spring (mantida para futuras implementações)
  // const springConfig = {
  //   type: "spring" as const,
  //   stiffness: prefersReducedMotion ? 1000 : 450,
  //   damping: prefersReducedMotion ? 50 : 38,
  //   duration: prefersReducedMotion ? 0 : undefined
  // };

  return (
    <div className="relative">
      {/* Botão base */}
      <button
        onClick={onClick}
        className={`relative flex items-center gap-3 rounded-2xl h-12 px-3 cursor-pointer select-none transition-all duration-300 ${
          isExpanded ? 'w-full justify-start' : 'w-12 justify-center'
        } ${isSelected ? 'shadow-lg active-module' : 'hover:shadow-md'}`}
        role="button"
        aria-pressed={isSelected}
        title={MODULES[moduleId]?.label || moduleKey}
        style={{
          backgroundColor: isSelected ? moduleColors.primary : 'transparent',
          border: isSelected ? `2px solid ${moduleColors.border}` : '2px solid transparent',
          boxShadow: isSelected ? moduleColors.shadow : 'none',
          color: isSelected ? '#000000' : 'inherit' // Texto sempre preto quando ativo
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = moduleColors.primary;
            e.currentTarget.style.color = '#000000'; // Texto preto no hover
            e.currentTarget.style.borderColor = moduleColors.border;
            e.currentTarget.style.boxShadow = moduleColors.shadow;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'inherit';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {/* Ícone */}
        <div className="relative z-10 flex items-center justify-center">
          <i
            className={iconInfo.icon}
            style={{
              fontSize: '18px',
              color: isSelected ? '#000000' : moduleColors.primary, // Ícone sempre preto quando ativo
              opacity: 1,
              visibility: 'visible',
              display: 'inline-block',
              transition: 'color 0.3s ease'
            }}
          />
        </div>
        
        {/* Label - apenas quando expandido */}
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.2,
                delay: prefersReducedMotion ? 0 : 0.08
              }}
              className="relative z-10 text-sm font-medium whitespace-nowrap"
              style={{ 
                color: isSelected ? '#000000' : '#374151', // Preto quando ativo
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                transition: 'color 0.3s ease'
              }}
            >
              {MODULES[moduleId]?.label || moduleKey}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export function CollapsibleSidebar({ selectedModule, onSelectModule }: CollapsibleSidebarProps) {
  const { user, logout } = useAuth();
  const { navigateToModule } = useModuleNavigation({
    onModuleChange: (moduleId) => {
      onSelectModule(moduleId);
    },
    userRole: user?.role || 'STUDENT',
    schoolPlan: user?.schoolPlan || 'PROFESSOR'
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tipo de dispositivo + sincronizar classe no body
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      setIsMobile(newIsMobile);
      // Em mobile, sempre fechado
      if (newIsMobile) {
        setIsExpanded(false);
        try { document.body.classList.remove('sidebar-expanded'); } catch {}
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    try { document.body.classList.toggle('sidebar-expanded', next); } catch {}
  };

  const closeSidebar = () => {
    setIsExpanded(false);
    try { document.body.classList.remove('sidebar-expanded'); } catch {}
  };

  const handleModuleSelect = (moduleId: string) => {
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
      console.error('❌ CollapsibleSidebar: Error selecting module:', error);
      
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

  // Mapeamento de módulos para ícones usando centralized icon mapping
  const getModuleIcon = (moduleId: string) => {
    const iconMapping = getIconMapping(moduleId);
    return {
      icon: iconMapping.fontAwesomeClass,
      name: iconMapping.name,
      color: iconMapping.color
    };
  };

  return (
    <>
      {/* Botão hambúrguer fixo para mobile - apenas quando sidebar está fechado */}
      {isMobile && !isExpanded && (
        <button
          onClick={toggleSidebar}
          className="mobile-hamburger-btn"
          style={{
            width: '56px',
            height: '56px',
            minWidth: '44px',
            minHeight: '44px',
            padding: '16px',
            borderRadius: '12px'
          }}
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Container - apenas em desktop */}
      {!isMobile && (
        <div 
          className={`collapsible-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
        
        {/* Painel do sidebar (ícones + labels quando expandido) */}
        <div className="collapsible-sidebar-icons">
            {/* Logo */}
            <div 
              className="collapsible-logo"
              title={`${user?.schoolId || 'Escola'} — Powered by HubEdu.ia`}
              aria-label={`${user?.schoolId || 'Escola'} — Powered by HubEdu.ia`}
            >
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain flex-shrink-0"
              />
              {/* Informações da escola - apenas quando expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.2,
                      delay: 0.08
                    }}
                    className="collapsible-logo-info"
                  >
                    <div className="collapsible-school-name">
                      {user?.schoolId || "Escola"}
                    </div>
                    <div className="collapsible-powered-by">
                      Powered by HubEdu.ia
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Módulos como ícones */}
            <div className="collapsible-modules">
              {Object.keys(MODULES).map((moduleId) => {
                // Mapear IDs dos módulos para os IDs usados no sistema
                const moduleMapping: Record<string, string> = {
                  "PROFESSOR": "professor",
                  "AULA_EXPANDIDA": "aula",
                  "TI": "ti", 
                  "RH": "rh",
                  "FINANCEIRO": "financeiro",
                  "COORDENACAO": "coordenacao",
                  "ATENDIMENTO": "atendimento",
                  "SOCIAL_MEDIA": "social-media",
                  "BEM_ESTAR": "wellbeing"
                };
                
                const moduleKey = moduleMapping[moduleId] || moduleId.toLowerCase();
                const isSelected = selectedModule === moduleKey;
                const iconInfo = getModuleIcon(moduleKey);
                
                return (
                  <SidebarItem
                    key={moduleKey}
                    moduleKey={moduleKey}
                    moduleId={moduleId as ModuleId}
                    iconInfo={iconInfo}
                    isSelected={isSelected}
                    isExpanded={isExpanded}
                    onClick={() => {
                      // Em desktop/tablet: navegar imediatamente; se estiver colapsado, também expandir
                      if (!isMobile && !isExpanded) {
                        setIsExpanded(true);
                        try { document.body.classList.add('sidebar-expanded'); } catch {}
                      }
                      // Navegar para o módulo em qualquer caso
                      handleModuleSelect(moduleKey);
                    }}
                  />
                );
              })}
            </div>

            {/* Botões de ação */}
            <div className="collapsible-actions">
              {/* Admin Buttons */}
              {user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <>
                  {user.role === "SUPER_ADMIN" && (
                    <>
                      <Link href="/admin-dashboard">
                        <button
                          className={`collapsible-action-icon ${isExpanded ? 'expanded' : ''}`}
                          title="System Admin"
                        >
                          <Shield className="w-6 h-6" />
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{
                                  duration: 0.2,
                                  delay: 0.08
                                }}
                                className="collapsible-action-label"
                              >
                                System Admin
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </Link>
                      <Link href="/escola-admin">
                        <button
                          className={`collapsible-action-icon ${isExpanded ? 'expanded' : ''}`}
                          title="Admin Escola"
                        >
                          <School className="w-6 h-6" />
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{
                                  duration: 0.2,
                                  delay: 0.08
                                }}
                                className="collapsible-action-label"
                              >
                                Admin Escola
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </Link>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <Link href="/admin">
                      <button
                        className={`collapsible-action-icon ${isExpanded ? 'expanded' : ''}`}
                        title="Admin"
                      >
                        <User className="w-6 h-6" />
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{
                                duration: 0.2,
                                delay: 0.08
                              }}
                              className="collapsible-action-label"
                            >
                              Admin
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </Link>
                  )}
                </>
              )}

              {/* Logout */}
              <button
                onClick={logout}
                className={`collapsible-action-icon logout ${isExpanded ? 'expanded' : ''}`}
                title="Sair"
              >
                <LogOut className="w-6 h-6" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: 0.08
                      }}
                      className="collapsible-action-label"
                    >
                      Sair
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Botão de expandir/recolher - desktop */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="collapsible-expand-btn"
                title={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
              >
                {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Mobile como Overlay */}
      {isMobile && isExpanded && (
        <div className="mobile-sidebar-overlay">
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
              
              {/* Botão de fechar para mobile */}
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
              <div className="mobile-modules-list">
                {Object.keys(MODULES).map((moduleId) => {
                  // Mapear IDs dos módulos para os IDs usados no sistema
                  const moduleMapping: Record<string, string> = {
                    "PROFESSOR": "professor",
                    "TI": "ti", 
                    "RH": "rh",
                    "FINANCEIRO": "financeiro",
                    "COORDENACAO": "coordenacao",
                    "ATENDIMENTO": "atendimento",
                    "SOCIAL_MEDIA": "social-media",
                    "BEM_ESTAR": "wellbeing"
                  };
                  
                  const moduleKey = moduleMapping[moduleId] || moduleId.toLowerCase();
                  const isSelected = selectedModule === moduleKey;
                  const iconInfo = getModuleIcon(moduleKey);
                  
                  return (
                    <button
                      key={moduleKey}
                      onClick={() => handleModuleSelect(moduleKey)}
                      className={`mobile-module-btn ${isSelected ? 'active' : ''}`}
                    >
                      <i className={iconInfo.icon} style={{ color: iconInfo.color }} />
                      <span>{MODULES[moduleId as keyof typeof MODULES]?.label || moduleKey}</span>
                    </button>
                  );
                })}
              </div>

              {/* Footer com informações do usuário */}
              <div className="mobile-sidebar-footer">
                <div className="mobile-user-info">
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
                            className="unified-admin-btn system-admin w-full"
                            style={{
                              justifyContent: 'flex-start !important',
                              padding: '12px 16px',
                              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                              borderColor: '#b91c1c',
                              color: 'white',
                              fontSize: '14px',
                              borderRadius: '10px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              minHeight: '44px'
                            }}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            System Admin
                          </Button>
                        </Link>
                        <Link href="/escola-admin" className="w-full">
                          <Button 
                            variant="outline" 
                            className="unified-admin-btn admin-escola w-full"
                            style={{
                              justifyContent: 'flex-start !important',
                              padding: '12px 16px',
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              borderColor: '#047857',
                              color: 'white',
                              fontSize: '14px',
                              borderRadius: '10px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              minHeight: '44px'
                            }}
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
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop: fecha ao clicar fora (desktop e mobile) */}
      {isExpanded && (
        <div 
          className="collapsible-sidebar-backdrop"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}