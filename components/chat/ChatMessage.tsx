"use client"

import React, { memo, useMemo } from "react";
import { Message } from "@/types/chat";
import { ModuleId } from "@/lib/modules";
import { CopyButton } from "./CopyButton";
import { WebSearchCitations } from "./WebSearchCitations";
import { MessageVoting } from "./MessageVoting";
import { ProfessorAnswer } from "./ProfessorAnswer";
import { TIAnswer } from "./TIAnswer";
import { RHAnswer } from "./RHAnswer";
import { FinanceiroAnswer } from "./FinanceiroAnswer";
import { CoordenacaoAnswer } from "./CoordenacaoAnswer";
import { SecretariaAnswer } from "./SecretariaAnswer";
import { BemEstarAnswer } from "./BemEstarAnswer";
import { SocialMediaAnswer } from "./SocialMediaAnswer";
import { WeatherAnswer } from "./WeatherAnswer";
import { MessageRenderer } from "./MessageRenderer";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BlocksRenderer } from "./BlocksRenderer";
import { ActionsRenderer } from "./ActionsRenderer";
import { MODULES } from "@/lib/modules";
import { getModuleIcon } from "@/lib/moduleIcons";
import { useState, useEffect } from "react";
import { useAutoClassification } from "@/hooks/useAutoClassification";
import { isWeatherQuery } from "@/utils/weatherApi";

/* ---------- Utils ---------- */

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatHourMinute = (date?: number | string) => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "";
  }
};

const formatTokens = (tokens: number) => {
  if (tokens < 1000) return `${tokens}`;
  return `${(tokens / 1000).toFixed(1)}k`;
};

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

type Props = {
  message: Message;
  isUser: boolean;
  userInitials?: string;
  userPhoto?: string;
  currentModuleId?: ModuleId | null;
  conversationId?: string;
  messageIndex?: number;
};

/* ---------- Component ---------- */

export const ChatMessage = memo(function ChatMessage({
  message,
  isUser,
  userInitials,
  userPhoto,
  currentModuleId,
  conversationId,
  messageIndex,
}: Props) {
  const msgTime = useMemo(() => formatHourMinute(message.timestamp.getTime()), [message.timestamp]);
  const [autoClassifiedModule, setAutoClassifiedModule] = useState<ModuleId | null>(null);
  const { classifyMessage } = useAutoClassification();

  const roleClass = isUser ? "justify-end" : "justify-start";
  const bubbleRole = isUser ? "user" : "assistant";
  const msgId = message.id ?? `${message.timestamp ?? ""}-${bubbleRole}`;

  // Auto-classify message ONLY if it's a USER message and no module is selected
  useEffect(() => {
    if (isUser && !currentModuleId && message.content) {
      // Use the hook's classification function which has built-in caching and deduplication
      classifyMessage(message.content).then((result) => {
        setAutoClassifiedModule(result.module as ModuleId);
      }).catch((error) => {
        console.error('Auto-classification failed:', error);
      });
    }
  }, [isUser, currentModuleId, message.content, classifyMessage]);

  // Use auto-classified module if available, otherwise use currentModuleId
  const effectiveModuleId = autoClassifiedModule || currentModuleId;

  // Get module info for avatar
  const moduleInfo = effectiveModuleId ? MODULES[effectiveModuleId] : null;
  const moduleIconKey = getModuleIconKey(effectiveModuleId || null);
  const ModuleIcon = getModuleIcon(moduleIconKey);
  const moduleColor = getModuleColor(moduleIconKey);

  // Bubble classes based on role
  const bubbleClass = (role: 'user' | 'assistant' | 'system') => {
    if (role === 'user') {
      return "self-end bg-amber-300 text-black rounded-2xl px-4 py-3 shadow-sm max-w-prose md:max-w-[65ch] break-words hyphens-auto";
    }
    if (role === 'assistant') {
      return "self-start rounded-2xl px-4 py-3 shadow-sm border border-zinc-200/60 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/60 max-w-prose md:max-w-[65ch] break-words hyphens-auto";
    }
    return "self-center text-xs text-zinc-500 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-full px-3 py-1";
  };

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      data-message-role={bubbleRole}
      data-message-id={msgId}
      aria-live={isUser ? "off" : "polite"}
      aria-atomic="false"
      role="group"
    >
      {/* Avatar do assistente - ícone específico do módulo */}
      {!isUser && (
        <div className={`flex flex-col items-center ${isUser ? 'order-last' : 'order-first'}`}>
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
          {/* Menção de IA/IA Super */}
          {message.tier && (
            <span className={`mt-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
              message.tier === "IA_SUPER"
                ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200"
                : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
            }`}
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontSize: '10px'
            }}>
              {message.tier === "IA_SUPER" ? "🚀 IA Super" : "⚡ IA"}
            </span>
          )}
        </div>
      )}

      <div className={`${isUser ? 'order-first' : 'order-last'}`}>
        <article
          className={bubbleClass(bubbleRole as 'user' | 'assistant' | 'system')}
          aria-label={isUser ? "Mensagem do usuário" : "Resposta do assistente"}
        >
          <div className="message-content">
          {/* Renderização especial para módulos com componentes Answer específicos */}
          {!isUser && effectiveModuleId === "PROFESSOR" ? (
            <ProfessorAnswer 
              question={message.originalQuery || ""} 
              answer={message.content}
            />
          ) : !isUser && effectiveModuleId === "TI" ? (
              <TIAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "RH" ? (
              <RHAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "FINANCEIRO" ? (
              <FinanceiroAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "COORDENACAO" ? (
              <CoordenacaoAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "ATENDIMENTO" ? (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer 
                  content={message.content || ""} 
                  className="text-gray-700 dark:text-gray-300"
                />
              </div>
            ) : !isUser && effectiveModuleId === "BEM_ESTAR" ? (
              <BemEstarAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "SOCIAL_MEDIA" ? (
              <SocialMediaAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && isWeatherQuery(message.content || message.originalQuery || "") ? (
              <WeatherAnswer 
                question={message.originalQuery || message.content || ""} 
                answer={message.content}
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer 
                  content={message.content || ""} 
                  className="text-gray-700 dark:text-gray-300"
                />
              </div>
            )}


            {/* Detectar e renderizar aula interativa */}
            {!isUser && message.content && message.content.includes('🎓 **Aula Interativa Criada!**') && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-900">Aula Interativa Disponível</h3>
                </div>
                <p className="text-yellow-800 mb-4">
                  Uma aula interativa foi criada especialmente para você! Esta aula inclui explicações detalhadas, 
                  perguntas interativas e feedback personalizado.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Navegar para o módulo professor com a mensagem
                      const messageText = message.content || '';
                      const encodedMessage = encodeURIComponent(messageText);
                      window.location.href = `/professor?message=${encodedMessage}`;
                    }}
                    className="px-4 py-2 bg-blue-600 text-yellow-300 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-play text-sm"></i>
                    Começar Aula
                  </button>
                  <button
                    onClick={() => {
                      // Copiar informações da aula para o clipboard
                      navigator.clipboard.writeText(message.content);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-copy text-sm"></i>
                    Copiar Info
                  </button>
                </div>
              </div>
            )}


            {/* Citações (web search) */}
            {!isUser && !!message.webSearchUsed && !!message.citations?.length && (
              <WebSearchCitations
                citations={message.citations}
                usedWebSearch={message.webSearchUsed}
                searchTime={message.searchTime}
                className="mt-4"
              />
            )}

            {/* Anexo */}
            {message.attachment && (
              <div className="mt-4" role="region" aria-label="Anexo">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <i className="fas fa-file text-yellow-600 w-5 h-5" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {message.attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(message.attachment.size)}
                    </p>
                  </div>
                  {message.attachment.url && (
                    <a
                      href={message.attachment.url}
                      className="ml-auto text-xs underline text-yellow-600 hover:text-yellow-700"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir anexo em nova aba"
                    >
                      Abrir
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Ações (copiar) */}
            {!isUser && (
              <div className="mt-2 flex items-center justify-end gap-2">
                <CopyButton text={message.content} />
              </div>
            )}

            {/* Votação */}
            {!isUser && conversationId && typeof messageIndex === "number" && (
              <div className="mt-3 flex items-center justify-end">
                <MessageVoting
                  conversationId={conversationId}
                  messageIndex={messageIndex}
                  className="scale-90"
                />
              </div>
            )}

            {/* Respiro inferior apenas no assistente para evitar corte visual */}
            {!isUser && <div className="pb-4" />}
          </div>

          {/* Metadados */}
          <footer className="mt-1 text-xs text-zinc-500 select-none">
            {msgTime && (
              <time dateTime={new Date(message.timestamp!).toISOString()}>{msgTime}</time>
            )}
            {typeof message.tokens === "number" && (
              <span className="ml-2">{formatTokens(message.tokens)} tokens</span>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
},
/* ---------- Custom compare para evitar re-render ---------- */
(prev, next) => {
  // Re-render somente se algo realmente mudou
  return (
    prev.isUser === next.isUser &&
    prev.userInitials === next.userInitials &&
    prev.userPhoto === next.userPhoto &&
    prev.currentModuleId === next.currentModuleId &&
    prev.conversationId === next.conversationId &&
    prev.messageIndex === next.messageIndex &&
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.model === next.message.model &&
    prev.message.timestamp === next.message.timestamp &&
    prev.message.tokens === next.message.tokens &&
    prev.message.tier === next.message.tier &&
    prev.message.webSearchUsed === next.message.webSearchUsed &&
    JSON.stringify(prev.message.citations ?? []) === JSON.stringify(next.message.citations ?? []) &&
    JSON.stringify(prev.message.attachment ?? null) === JSON.stringify(next.message.attachment ?? null)
  );
});

ChatMessage.displayName = "ChatMessage";
