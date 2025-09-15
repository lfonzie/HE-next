"use client"

import React, { useState, useEffect } from "react";
import { ModuleId } from "@/lib/modules";
import { getModuleIcon } from "@/lib/moduleIcons";
import { MarkdownRendererNew as MarkdownRenderer } from "./MarkdownRendererNew";

interface StreamingMessageProps {
  content: string;
  userInitials: string;
  isComplete: boolean;
  currentModuleId?: ModuleId | null;
  tier?: "IA" | "IA_SUPER";
  model?: string;
  tokens?: number;
}

// Mapear IDs dos módulos para chaves dos ícones
const getModuleIconKey = (moduleId: ModuleId | null): string => {
  if (!moduleId) return "professor";
  
  const mapping: Record<ModuleId, string> = {
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
  tokens
}) => {
  // StreamingMessage representa mensagens do sistema/IA, não do usuário
  // Não fazemos classificação automática aqui pois são respostas do sistema

  // Use currentModuleId diretamente (sem classificação automática)
  const effectiveModuleId = currentModuleId;

  // Debug log para verificar consistência de módulos (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log('StreamingMessage effectiveModuleId debug:', {
      content: content.substring(0, 50) + '...',
      isComplete,
      currentModuleId,
      effectiveModuleId,
      willUseStandardMarkdown: effectiveModuleId === "atendimento"
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
          title={`Módulo: ${currentModuleId === "professor" ? "Professor" : 
                 currentModuleId === "ti" ? "TI" :
                 currentModuleId === "rh" ? "RH" :
                 currentModuleId === "financeiro" ? "Financeiro" :
                 currentModuleId === "coordenacao" ? "Coordenação" :
                 currentModuleId === "atendimento" ? "Atendimento" :
                 currentModuleId === "bem-estar" ? "Bem-Estar" :
                 currentModuleId === "social-media" ? "Social Media" :
                 currentModuleId || 'Assistente'}`}
        >
          <ModuleIcon className="w-5 h-5 text-white" />
        </div>
        {tier && (
          <span className={`mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            tier === "IA_SUPER"
              ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200"
              : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
          }`}
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            fontSize: '10px'
          }}>
            {tier === "IA_SUPER" ? "🚀 IA Super" : "⚡ IA"}
          </span>
        )}
        
        {/* Descrição do módulo */}
        {currentModuleId && (
          <div className="mt-2 text-xs text-center max-w-24">
            <div className="font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
              {currentModuleId === "professor" ? "Professor" : 
               currentModuleId === "ti" ? "TI" :
               currentModuleId === "rh" ? "RH" :
               currentModuleId === "financeiro" ? "Financeiro" :
               currentModuleId === "coordenacao" ? "Coordenação" :
               currentModuleId === "atendimento" ? "Atendimento" :
               currentModuleId === "bem-estar" ? "Bem-Estar" :
               currentModuleId === "social-media" ? "Social Media" :
               currentModuleId}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {currentModuleId === "professor" ? "Assistente de estudos" : 
               currentModuleId === "ti" ? "Suporte técnico" :
               currentModuleId === "rh" ? "Recursos humanos" :
               currentModuleId === "financeiro" ? "Controle financeiro" :
               currentModuleId === "coordenacao" ? "Gestão pedagógica" :
               currentModuleId === "atendimento" ? "Suporte geral" :
               currentModuleId === "bem-estar" ? "Suporte emocional" :
               currentModuleId === "social-media" ? "Comunicação digital" :
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
          <footer className="message-metadata mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {tier && (
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                tier === "IA_SUPER"
                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200"
                  : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
              }`}>
                {tier === "IA_SUPER" ? "🚀 IA Super" : "⚡ IA"}
              </span>
            )}
            {model && <span>Modelo: {model}</span>}
            {tokens && <span>{tokens} tokens</span>}
          </footer>
        </article>
      </div>
    </div>
  );
};
