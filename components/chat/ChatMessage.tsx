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
// import { WeatherAnswer } from "./WeatherAnswer"; // DISABLED: Weather Card function
import { MessageRenderer } from "./MessageRenderer";
import { MarkdownRendererNew as MarkdownRenderer } from "./MarkdownRendererNew";
import { BlocksRenderer } from "./BlocksRenderer";
import { ActionsRenderer } from "./ActionsRenderer";
import { ModelChip, ModelDetails } from "./ModelChip";
import { MODULES, convertToOldModuleId } from "@/lib/modules";
import { getModuleIcon } from "@/lib/moduleIcons";
import { getModuleIconKey, getModuleColor, debugIconMapping } from "@/lib/iconMapping";
import { Copy, Play, File, GraduationCap, Users } from 'lucide-react';
// import { useAutoClassification } from "@/hooks/useAutoClassification"; // REMOVED: Duplicate classification
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

// Note: getModuleIconKey and getModuleColor are now imported from lib/iconMapping.ts

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

  const msgTime = useMemo(() => {
    if (!message.timestamp) return "";
    
    // Handle different timestamp formats (Date object, number, or string)
    let timestamp: Date;
    if (message.timestamp instanceof Date) {
      timestamp = message.timestamp;
    } else if (typeof message.timestamp === 'number') {
      timestamp = new Date(message.timestamp);
    } else if (typeof message.timestamp === 'string') {
      timestamp = new Date(message.timestamp);
    } else {
      console.warn('Invalid timestamp format:', message.timestamp);
      return "";
    }
    
    return formatHourMinute(timestamp.getTime());
  }, [message.timestamp]);
  // REMOVED: Duplicate classification - orchestrator already handles this

  const roleClass = isUser ? "justify-end" : "justify-start";
  const bubbleRole = isUser ? "user" : "assistant";
  const msgId = message.id ?? `${message.timestamp ?? ""}-${bubbleRole}`;

  // REMOVED: Duplicate classification - orchestrator already handles this

  // Determine the effective module ID with priority:
  // 1. message.module (from streaming/API response) - highest priority
  // 2. currentModuleId (from context) - fallback
  const effectiveModuleId = useMemo(() => {
    if (message.module) {
      // Use the module from the message (from API response)
      return convertToOldModuleId(message.module as ModuleId);
    }
    // Fallback to current module context
    return currentModuleId;
  }, [message.module, currentModuleId]);

  // Debug log para verificar consistência de módulos (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log('ChatMessage effectiveModuleId debug:', {
      messageId: message.id,
      isUser,
      messageModule: message.module,
      currentModuleId,
      effectiveModuleId,
      convertedModule: message.module ? convertToOldModuleId(message.module as ModuleId) : 'N/A',
      willUseProfessorAnswer: !isUser && effectiveModuleId === "professor",
      willUseStandardMarkdown: !isUser && effectiveModuleId === "atendimento"
    });
  }

  // Get module info for avatar using centralized icon mapping
  const moduleInfo = effectiveModuleId ? MODULES[effectiveModuleId as ModuleId] : null;
  const moduleIconKey = getModuleIconKey(effectiveModuleId as ModuleId || null);
  const ModuleIcon = getModuleIcon(moduleIconKey);
  const moduleColor = getModuleColor(effectiveModuleId as ModuleId || null);
  
  // Debug icon mapping in development
  if (process.env.NODE_ENV === 'development') {
    debugIconMapping(effectiveModuleId);
  }

  // Bubble classes based on role
  const bubbleClass = (role: 'user' | 'assistant' | 'system') => {
    if (role === 'user') {
      return "self-end bg-yellow-500 text-black rounded-2xl px-4 py-3 shadow-sm max-w-prose md:max-w-[65ch] break-words hyphens-auto";
    }
    if (role === 'assistant') {
      return "self-start px-4 py-3 max-w-prose md:max-w-[65ch] break-words hyphens-auto";
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
      {/* Avatar - ícone específico do módulo para ambas as mensagens */}
      <div className={`flex flex-col items-center ${isUser ? 'order-last' : 'order-first'}`}>
        <div 
          className="w-10 h-10 rounded-full border-2 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-help"
          style={{
            backgroundColor: isUser ? '#f59e0b' : moduleColor, // Amarelo para usuário, cor do módulo para assistente
            color: "#ffffff",
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            borderColor: isUser ? '#f59e0b60' : `${moduleColor}60`
          }}
          title={isUser 
            ? `Usuário\nMódulo detectado: ${moduleInfo?.label || 'N/A'}\nID: ${effectiveModuleId || 'N/A'}` 
            : `Módulo: ${moduleInfo?.label || 'Assistente'}\nID: ${effectiveModuleId || 'N/A'}\nÍcone: ${moduleIconKey}`
          }
          data-module-id={effectiveModuleId}
          data-icon-key={moduleIconKey}
        >
          {isUser ? (
            // Ícone do usuário (pessoa) quando é mensagem do usuário
            <Users className="w-5 h-5 text-white" />
          ) : (
            // Ícone específico do módulo quando é mensagem do assistente
            <ModuleIcon className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Chip do modelo usado - apenas para assistente */}
        {!isUser && (
          <div className="mt-1">
            <ModelChip 
              model={message.model}
              provider={message.provider}
              complexity={message.complexity}
              tier={message.tier}
              className="scale-90"
            />
          </div>
        )}
        
        {/* Descrição do módulo - apenas para assistente */}
        {!isUser && moduleInfo && (
          <div className="mt-2 text-xs text-center max-w-24">
            <div className="font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
              {moduleInfo.label}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {moduleInfo.description}
            </div>
          </div>
        )}
        
        {/* Indicador do módulo detectado para mensagens do usuário */}
        {isUser && effectiveModuleId && (
          <div className="mt-2 text-xs text-center max-w-24">
            <div className="font-semibold text-gray-800 dark:text-gray-200 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-700">
              {moduleInfo?.label || effectiveModuleId}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              Módulo detectado
            </div>
          </div>
        )}
      </div>

      <div className={`${isUser ? 'order-first' : 'order-last'}`}>
        <article
          className={bubbleClass(bubbleRole as 'user' | 'assistant' | 'system')}
          aria-label={isUser ? "Mensagem do usuário" : "Resposta do assistente"}
        >
          <div className="message-content">
          {/* Renderização especial para módulos com componentes Answer específicos */}
          {!isUser && effectiveModuleId === "professor" ? (
            <ProfessorAnswer 
              question={message.originalQuery || ""} 
              answer={message.content}
            />
          ) : !isUser && effectiveModuleId === "ti" ? (
              <TIAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "rh" ? (
              <RHAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "financeiro" ? (
              <FinanceiroAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "coordenacao" ? (
              <CoordenacaoAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "atendimento" ? (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer 
                  content={message.content || ""} 
                  className="text-gray-700 dark:text-gray-300"
                  isStreaming={message.isStreaming}
                />
              </div>
            ) : !isUser && effectiveModuleId === "bem-estar" ? (
              <BemEstarAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : !isUser && effectiveModuleId === "social-media" ? (
              <SocialMediaAnswer 
                question={message.originalQuery || ""} 
                answer={message.content}
              />
            ) : /* DISABLED: Weather Card function
            !isUser && isWeatherQuery(message.content || message.originalQuery || "") ? (
              <WeatherAnswer 
                question={message.originalQuery || message.content || ""} 
                answer={message.content}
              />
            ) : */ (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer 
                  content={message.content || ""} 
                  className="text-gray-700 dark:text-gray-300"
                  isStreaming={message.isStreaming}
                />
              </div>
            )}


            {/* Detectar e renderizar aula interativa */}
            {!isUser && message.content && message.content.includes('🎓 **Aula Interativa Criada!**') && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="text-white text-sm w-4 h-4" />
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
                    <Play className="text-sm w-4 h-4" />
                    Começar Aula
                  </button>
                  <button
                    onClick={() => {
                      // Copiar informações da aula para o clipboard
                      navigator.clipboard.writeText(message.content);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <Copy className="text-sm w-4 h-4" />
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
                  <File className="text-yellow-600 w-5 h-5" aria-hidden />
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
            {!isUser && <div className="pb-2" />}
          </div>

          {/* Metadados */}
          <footer className="mt-1 text-xs text-zinc-500 select-none">
            {msgTime && (
              <time dateTime={(() => {
                if (!message.timestamp) return new Date().toISOString();
                if (message.timestamp instanceof Date) return message.timestamp.toISOString();
                return new Date(message.timestamp).toISOString();
              })()}>{msgTime}</time>
            )}
            {typeof message.tokens === "number" && (
              <span className="ml-2">{formatTokens(message.tokens)} tokens</span>
            )}
            {/* Informações detalhadas do modelo - só se houver tokens */}
            {!isUser && message.tokens && message.tokens > 0 && (
              <div className="mt-1">
                <ModelDetails 
                  model={message.model}
                  provider={message.provider}
                  complexity={message.complexity}
                  tier={message.tier}
                  tokens={message.tokens}
                />
              </div>
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
    prev.message.provider === next.message.provider &&
    prev.message.complexity === next.message.complexity &&
    prev.message.webSearchUsed === next.message.webSearchUsed &&
    JSON.stringify(prev.message.citations ?? []) === JSON.stringify(next.message.citations ?? []) &&
    JSON.stringify(prev.message.attachment ?? null) === JSON.stringify(next.message.attachment ?? null)
  );
});

ChatMessage.displayName = "ChatMessage";
