import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { ModuleSelector } from "../chat/ModuleSelector";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { X, Menu, Shield, School, User, LogOut, ChevronLeft, ChevronRight, Settings, Bell, Search } from "lucide-react";
import { ASSETS } from "../../constants/assets";
import { useModuleNavigation } from "../../hooks/useModuleNavigation";
import { Link } from "wouter";
import { getSidebarIcon } from "../../utils/sidebarIcons";
import { MODULES, type ModuleId } from "../../lib/modules";
import { getModuleColors, MODULE_ID_MAPPING } from "../../lib/moduleColors";

interface AdvancedSidebarProps {
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
          color: isSelected ? '#000000' : 'inherit'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = moduleColors.primary;
            e.currentTarget.style.color = '#000000';
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
              color: isSelected ? '#000000' : moduleColors.primary,
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
                color: isSelected ? '#000000' : '#374151',
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

export function AdvancedSidebar({ selectedModule, onSelectModule }: AdvancedSidebarProps) {
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      setIsMobile(newIsMobile);
      
      // Em mobile, sempre fechado
      if (newIsMobile) {
        setIsExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    setIsExpanded(false);
  };

  const handleModuleSelect = (moduleId: string) => {
    onSelectModule(moduleId);
    
    try {
      navigateToModule(moduleId);
      
      if (isMobile) {
        closeSidebar();
      }
    } catch (error) {
      console.error('❌ AdvancedSidebar: Error selecting module:', error);
      
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

  // Mapeamento de módulos para ícones
  const getModuleIcon = (moduleId: string) => {
    const moduleMapping: Record<string, ModuleId> = {
      "professor": "PROFESSOR",
      "aula-expandida": "AULA_EXPANDIDA",
      "ti": "TI", 
      "rh": "RH",
      "financeiro": "FINANCEIRO",
      "coordenacao": "COORDENACAO",
      "atendimento": "ATENDIMENTO",
      "social-media": "SOCIAL_MEDIA",
      "wellbeing": "BEM_ESTAR"
    };
    
    const moduleIdUpper = moduleMapping[moduleId] || moduleId.toUpperCase() as ModuleId;
    return getSidebarIcon(moduleIdUpper);
  };

  // Filtrar módulos baseado na busca
  const filteredModules = Object.keys(MODULES).filter(moduleId => {
    if (!searchQuery) return true;
    const moduleLabel = MODULES[moduleId as keyof typeof MODULES]?.label || moduleId;
    return moduleLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      {/* Botão hambúrguer para mobile */}
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

      {/* Sidebar Container */}
      {!isMobile && (
        <div 
          className={`advanced-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
          {/* Painel do sidebar */}
          <div className="advanced-sidebar-panel">
            {/* Logo */}
            <div 
              className="advanced-logo"
              title={`${user?.schoolId || 'Escola'} — Powered by HubEdu.ia`}
            >
              <Image 
                src={ASSETS.logoIcon} 
                alt="HubEdu.ia Logo" 
                width={32}
                height={32}
                className="rounded-lg object-contain flex-shrink-0"
              />
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                    className="advanced-logo-info"
                  >
                    <div className="advanced-school-name">
                      {user?.schoolId || "Escola"}
                    </div>
                    <div className="advanced-powered-by">
                      Powered by HubEdu.ia
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Barra de busca */}
            <div className="advanced-search-section">
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="advanced-search-container"
                  >
                    <div className="advanced-search-input">
                      <Search className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar módulos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="advanced-search-field"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Módulos */}
            <div className="advanced-modules">
              {filteredModules.map((moduleId) => {
                const moduleMapping: Record<string, string> = {
                  "PROFESSOR": "professor",
                  "AULA_EXPANDIDA": "aula-expandida",
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
                      if (!isMobile && !isExpanded) {
                        setIsExpanded(true);
                      }
                      handleModuleSelect(moduleKey);
                    }}
                  />
                );
              })}
            </div>

            {/* Botões de ação */}
            <div className="advanced-actions">
              {/* Admin Buttons */}
              {user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <>
                  {user.role === "SUPER_ADMIN" && (
                    <>
                      <Link href="/admin-dashboard">
                        <button
                          className={`advanced-action-icon ${isExpanded ? 'expanded' : ''}`}
                          title="System Admin"
                        >
                          <Shield className="w-6 h-6" />
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: 0.08 }}
                                className="advanced-action-label"
                              >
                                System Admin
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </Link>
                      <Link href="/escola-admin">
                        <button
                          className={`advanced-action-icon ${isExpanded ? 'expanded' : ''}`}
                          title="Admin Escola"
                        >
                          <School className="w-6 h-6" />
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: 0.08 }}
                                className="advanced-action-label"
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
                        className={`advanced-action-icon ${isExpanded ? 'expanded' : ''}`}
                        title="Admin"
                      >
                        <User className="w-6 h-6" />
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2, delay: 0.08 }}
                              className="advanced-action-label"
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
                className={`advanced-action-icon logout ${isExpanded ? 'expanded' : ''}`}
                title="Sair"
              >
                <LogOut className="w-6 h-6" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="advanced-action-label"
                    >
                      Sair
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Botão de expandir/recolher */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="advanced-expand-btn"
                title={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
                aria-expanded={isExpanded}
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
                {filteredModules.map((moduleId) => {
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
                            className="mobile-admin-btn system-admin"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            System Admin
                          </Button>
                        </Link>
                        <Link href="/escola-admin" className="w-full">
                          <Button 
                            variant="outline" 
                            className="mobile-admin-btn admin-escola"
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

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="advanced-sidebar-backdrop"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}