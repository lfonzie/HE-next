"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ImageWithFallback } from './ImageWithFallback'
import { processMessageForDisplay, forceConvertMathToUnicode } from '@/utils/unicode'
import { normalizeFormulas } from '@/lib/utils/latex-normalization'
import { convertEnemDevUrlToLocal } from '@/lib/utils/image-url-converter'
import { processTextWithImages } from '@/lib/utils/image-extraction'

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
  // Processar texto e extrair imagens do markdown
  const { cleanText, images } = processTextWithImages(question);
  
  // Processar Unicode para fórmulas matemáticas e químicas
  const processedContent = processMessageForDisplay(cleanText);
  const latexNormalizedContent = normalizeFormulas(processedContent);
  const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
  
  // Converter URL da prop imageUrl se necessário
  const convertedImageUrl = imageUrl ? convertEnemDevUrlToLocal(imageUrl) : undefined;
  
  return (
    <div className={`prose max-w-none ${className}`}>
      {/* Renderizar imagens extraídas do markdown */}
      {images.map((image, imgIndex) => (
        <div key={imgIndex} className="mb-4">
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              📷 Imagem {imgIndex + 1} - Analise cuidadosamente o conteúdo visual para responder.
            </p>
          </div>
          <ImageWithFallback
            src={image.url}
            alt={image.alt || `Imagem ${imgIndex + 1} da questão`}
            className="max-w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      ))}
      
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
              <strong className="font-semibold text-gray-900 inline">{children}</strong>
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
          {mathProcessedContent}
        </ReactMarkdown>
      </div>

      {/* Image Rendering with Fallback (from prop) */}
      {convertedImageUrl && (
        <div className="mb-4">
          {/* Add context when image is present */}
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              📷 Esta questão contém uma imagem. Analise cuidadosamente o conteúdo visual para responder.
            </p>
          </div>
          <ImageWithFallback
            src={convertedImageUrl}
            alt={imageAlt || "Imagem da questão"}
            className="max-w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  )
}
