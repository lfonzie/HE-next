"use client"

import { Message } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getModuleConfig } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const moduleConfig = message.module ? getModuleConfig(message.module) : null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {isUser ? (
        // Bolha amarela para mensagens do usuário
        <div className="relative max-w-[80%]">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-2xl rounded-tr-md px-4 py-3 shadow-lg">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-black">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-black">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-black">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 text-black">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-black/10 px-1 py-0.5 rounded text-sm text-black">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-black/10 p-3 rounded overflow-x-auto text-sm text-black">{children}</pre>
                  ),
                }}
              >
                {message.content || ''}
              </ReactMarkdown>
            </div>
            <div className="text-xs opacity-70 mt-2 text-right text-black">
              {message.timestamp ? formatDate(message.timestamp) : ''}
            </div>
          </div>
          {/* Seta da bolha amarela */}
          <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-yellow-500"></div>
        </div>
      ) : (
        // Mensagem do assistente (mantém estilo original)
        <Card className="max-w-[80%]">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm mb-2">
                {moduleConfig && (
                  <>
                    <span className="text-lg">{moduleConfig.icon}</span>
                    <Badge variant="secondary" className="text-xs">
                      {moduleConfig.name}
                    </Badge>
                  </>
                )}
                {message.tier && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${
                      message.tier === "IA_SUPER"
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-200"
                        : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {message.tier === "IA_SUPER" ? "🚀 IA Super" : "⚡ IA"}
                  </Badge>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-3 rounded overflow-x-auto text-sm">{children}</pre>
                    ),
                  }}
                >
                  {message.content || ''}
                </ReactMarkdown>
              </div>
              
              <div className="text-xs opacity-70">
                {message.timestamp ? formatDate(message.timestamp) : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
