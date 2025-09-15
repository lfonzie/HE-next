"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AlternativeButtonProps {
  label: string
  text: string
  index: number
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function AlternativeButton({
  label,
  text,
  index,
  isSelected,
  onClick,
  disabled = false,
  className = ""
}: AlternativeButtonProps) {
  // Clean the text from any duplicate labels
  const cleanText = text.replace(/^[A-E]\)\s*/, '').trim()
  
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "w-full justify-start h-auto min-h-[48px] p-4 text-left",
        "whitespace-normal break-words",
        "hover:bg-opacity-80 transition-all duration-200",
        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        // Responsive design
        "text-sm sm:text-base",
        "px-3 py-3 sm:px-4 sm:py-4",
        // Mobile touch targets
        "min-h-[44px] sm:min-h-[48px]",
        // Long text handling
        cleanText.length > 100 && "text-sm",
        cleanText.length > 200 && "text-xs sm:text-sm",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      style={{
        lineHeight: '1.4',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Label */}
        <span className="font-semibold text-sm sm:text-base flex-shrink-0 mt-0.5">
          {label})
        </span>
        
        {/* Text content with Markdown Support */}
        <div className="flex-1 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements in alternatives
              p: ({ children }) => (
                <span className="inline">{children}</span>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-800">{children}</em>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                  {children}
                </code>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-gray-800">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-gray-800">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),
            }}
          >
            {cleanText}
          </ReactMarkdown>
        </div>
      </div>
    </Button>
  )
}

// Utility function to clean alternative text from duplicate labels
export function cleanAlternativeText(text: string): string {
  return text.replace(/^[A-E]\)\s*/, '').trim()
}

// Utility function to get alternative label
export function getAlternativeLabel(index: number): string {
  return String.fromCharCode(65 + index) // A, B, C, D, E
}
