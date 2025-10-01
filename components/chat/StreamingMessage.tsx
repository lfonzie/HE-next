"use client"

import React, { useState, useEffect } from "react";
import { ModuleId } from "@/lib/modules";
import { getModuleIcon } from "@/lib/moduleIcons";
import { MarkdownRendererNew as MarkdownRenderer } from "./MarkdownRendererNew";
import { ModelBadge } from "./ModelBadge";
import { useConversation } from "@/stores/conversation";

interface StreamingMessageProps {
  content: string;
  userInitials: string;
  isComplete: boolean;
  currentModuleId?: ModuleId | null;
  tier?: "IA" | "IA_SUPER" | "IA_ECO";
  model?: string;
  tokens?: number;
  provider?: string;
  complexity?: string;
}

// Mapear IDs dos módulos para chaves dos ícones
const getModuleIconKey = (moduleId: ModuleId | null): string => {
  if (!moduleId) return "professor";
  
  const mapping: Partial<Record<ModuleId, string>> = {
    PROFESSOR: "professor",
    AULA_EXPANDIDA: "aula-expandida",
    ENEM_INTERACTIVE: "enem-interativo",
    TI: "ti",
    RH: "rh",
    FINANCEIRO: "financeiro",
    COORDENACAO: "coordenacao",
    ATENDIMENTO: "atendimento",
    BEM_ESTAR: "wellbeing",
    SOCIAL_MEDIA: "social-media"
  };
  
  return mapping[moduleId] || "professor";
};

// Obter cor do módulo baseada no iconKey
const getModuleColor = (iconKey: string): string => {
  const colors: Record<string, string> = {
    "professor": "#2563eb",
    "aula-expandida": "#f59e0b",
    "enem-interativo": "#3b82f6",
    "ti": "#6b7280",
    "atendimento": "#ef4444",
    "rh": "#8b5cf6",
    "financeiro": "#10b981",
    "social-media": "#ec4899",
    "wellbeing": "#f97316",
    "coordenacao": "#6366f1",
    "secretaria": "#059669"
  };
  
  return colors[iconKey] || "#2563eb";
};

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  userInitials,
  isComplete,
  currentModuleId,
  tier,
  model,
  tokens,
  provider,
  complexity
}) => {
  const { lastUsedModel, setLastUsedModel } = useConversation()

  // StreamingMessage representa mensagens do sistema/IA, não do usuário
  // Não fazemos classificação automática aqui pois são respostas do sistema

  // Use currentModuleId diretamente (sem classificação automática)
  const effectiveModuleId = currentModuleId;

  // Determinar modelo a ser exibido
  const modelToShow = model || lastUsedModel

  // Atualizar lastUsedModel quando receber model
  React.useEffect(() => {
    if (model) {
      setLastUsedModel(model)
    }
  }, [model, setLastUsedModel])

  // Debug log para verificar consistência de módulos (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log('StreamingMessage effectiveModuleId debug:', {
      content: content.substring(0, 50) + '...',
      isComplete,
      currentModuleId,
      effectiveModuleId,
      willUseStandardMarkdown: effectiveModuleId === "ATENDIMENTO"
    });
  }

  // Get module icon and color
  const moduleIconKey = getModuleIconKey(effectiveModuleId as ModuleId || null);
  const ModuleIcon = getModuleIcon(moduleIconKey);
  const moduleColor = getModuleColor(moduleIconKey);
  return (
    <div className="msg flex items-start gap-3 mb-3 justify-start">
      {/* Avatar do assistente - ícone específico do módulo */}
      <div className="flex flex-col items-center">
        <div 
          className="w-10 h-10 rounded-full border-2 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: moduleColor,
            color: "#ffffff",
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            borderColor: `${moduleColor}60`
          }}
          title={`Módulo: ${currentModuleId === "PROFESSOR" ? "Professor" : 
                 currentModuleId === "TI" ? "TI" :
                 currentModuleId === "RH" ? "RH" :
                 currentModuleId === "FINANCEIRO" ? "Financeiro" :
                 currentModuleId === "COORDENACAO" ? "Coordenação" :
                 currentModuleId === "ATENDIMENTO" ? "Atendimento" :
                 currentModuleId === "BEM_ESTAR" ? "Bem-Estar" :
                 currentModuleId === "SOCIAL_MEDIA" ? "Social Media" :
                 currentModuleId || 'Assistente'}`}
        >
          <ModuleIcon className="w-5 h-5 text-white" />
        </div>
        {/* Badge do modelo removido - agora aparece apenas na linha de metadados */}
        
        {/* Descrição do módulo */}
        {currentModuleId && (
          <div className="mt-2 text-xs text-center max-w-24">
            <div className="font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
              {currentModuleId === "PROFESSOR" ? "Professor" : 
               currentModuleId === "TI" ? "TI" :
               currentModuleId === "RH" ? "RH" :
               currentModuleId === "FINANCEIRO" ? "Financeiro" :
               currentModuleId === "COORDENACAO" ? "Coordenação" :
               currentModuleId === "ATENDIMENTO" ? "Atendimento" :
               currentModuleId === "BEM_ESTAR" ? "Bem-Estar" :
               currentModuleId === "SOCIAL_MEDIA" ? "Social Media" :
               currentModuleId}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {currentModuleId === "PROFESSOR" ? "Assistente de estudos" : 
               currentModuleId === "TI" ? "Suporte técnico" :
               currentModuleId === "RH" ? "Recursos humanos" :
               currentModuleId === "FINANCEIRO" ? "Controle financeiro" :
               currentModuleId === "COORDENACAO" ? "Gestão pedagógica" :
               currentModuleId === "ATENDIMENTO" ? "Suporte geral" :
               currentModuleId === "BEM_ESTAR" ? "Suporte emocional" :
               currentModuleId === "SOCIAL_MEDIA" ? "Comunicação digital" :
               "Módulo especializado"}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <article className="self-start rounded-2xl px-4 py-3 shadow-sm border border-zinc-200/60 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/60 max-w-prose md:max-w-[65ch] break-words hyphens-auto">
          <div className="message-content">
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer 
                content={content}
                className="text-gray-700 dark:text-gray-300"
                isStreaming={!isComplete}
              />
            </div>
          </div>
          
          {/* Metadados */}
          <footer className="message-metadata mt-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {tokens && tokens > 0 && (
                <span>{tokens} tokens</span>
              )}
              {/* Badge do modelo - única fonte de verdade */}
              <ModelBadge model={modelToShow} />
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};
