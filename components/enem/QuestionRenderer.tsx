"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ImageWithFallback } from './ImageWithFallback'

interface QuestionRendererProps {
  question: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export function QuestionRenderer({ 
  question, 
  imageUrl, 
  imageAlt, 
  className = "" 
}: QuestionRendererProps) {
  return (
    <div className={`prose max-w-none ${className}`}>
      {/* Question Statement with Markdown Support */}
      <div className="mb-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => (
              <h1 className="text-xl font-semibold mb-3 text-gray-900">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mb-3 text-gray-900">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-800 mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 text-gray-800">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-800">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="mb-1">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800">{children}</em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-700 mb-4">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-4">
                {children}
              </pre>
            ),
          }}
        >
          {question}
        </ReactMarkdown>
      </div>

      {/* Image Rendering with Fallback */}
      {imageUrl && (
        <div className="mb-4">
          <ImageWithFallback
            src={imageUrl}
            alt={imageAlt || "Imagem da questão"}
            className="max-w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  )
}
