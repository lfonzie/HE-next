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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-2">
            {!isUser && moduleConfig && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{moduleConfig.icon}</span>
                <Badge variant="secondary" className="text-xs">
                  {moduleConfig.name}
                </Badge>
              </div>
            )}
            
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
                {message.content}
              </ReactMarkdown>
            </div>
            
            <div className="text-xs opacity-70">
              {formatDate(message.timestamp)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
