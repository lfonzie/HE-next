"use client"

import React, { useState, useEffect } from "react";
import { ModuleId } from "@/lib/modules";
import { getModuleIcon } from "@/lib/moduleIcons";

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

  // Get module icon and color
  const moduleIconKey = getModuleIconKey(effectiveModuleId || null);
  const ModuleIcon = getModuleIcon(moduleIconKey);
  const moduleColor = getModuleColor(moduleIconKey);
  // Processar conteúdo markdown
  const processContent = (text: string) => {
    let processedText = text
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="inline-code bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="code-block bg-gray-100 p-3 rounded-lg overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return processedText;
  };
  return (
    <div className="msg flex items-start gap-3 mb-6 justify-start">
      {/* Avatar do assistente - ícone específico do módulo */}
      <div className="flex flex-col items-center">
        <div 
          className="w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center"
          style={{
            backgroundColor: moduleColor,
            color: "#ffffff",
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderColor: `${moduleColor}40`
          }}
        >
          <ModuleIcon className="w-4 h-4 text-white" />
        </div>
        {tier && (
          <span className={`mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            tier === "IA_SUPER"
              ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200"
              : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
          }`}>
            {tier === "IA_SUPER" ? "🚀 IA Super" : "⚡ IA"}
          </span>
        )}
      </div>

      <div className="flex-1">
        <article className="openai-chat-message assistant">
          <div className="openai-message-content">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: processContent(content) 
                }}
              />
              {!isComplete && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
              )}
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
