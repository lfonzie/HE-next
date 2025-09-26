'use client'

import React from 'react'
import { normalizeUnicode, processMessageForDisplay, convertMathToUnicode, forceConvertMathToUnicode } from "@/utils/unicode";
import { normalizeFormulas } from "@/lib/utils/latex-normalization";

interface MarkdownRendererProps {
  content?: string
  className?: string
}

export default function MarkdownRenderer({ content = '', className = '' }: MarkdownRendererProps) {
  // Processar Unicode e normalizar conteúdo
  const processedContent = processMessageForDisplay(content);
  const latexNormalizedContent = normalizeFormulas(processedContent);
  const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
  // Preservar quebras de linha duplas para separação de parágrafos
  const normalizedContent = mathProcessedContent.replace(/\n{3,}/g, '\n\n').trim();
  
  // Função para processar markdown básico
  const processMarkdown = (text: string) => {
    // Verificar se text é válido
    if (!text || typeof text !== 'string') {
      return <p className="text-gray-500 italic">Conteúdo não disponível</p>
    }
    
    // Quebrar linhas
    const lines = text.split('\n')
    
    return lines.map((line, index) => {
      // Processar texto em negrito **texto**
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Processar texto em itálico *texto*
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Se a linha estiver vazia, criar um parágrafo vazio
      if (processedLine.trim() === '') {
        return <br key={index} />
      }
      
      // Se a linha começar com #, tratar como cabeçalho (exceto nível 1 que já aparece no cabeçalho)
      if (processedLine.startsWith('#')) {
        const level = processedLine.match(/^#+/)?.[0].length || 1
        const text = processedLine.replace(/^#+\s*/, '')
        
        // Não renderizar cabeçalhos de nível 1 pois já aparecem no cabeçalho do slide
        if (level === 1) {
          return null // Skip rendering level 1 headers completely
        }
        
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        
        return React.createElement(
          HeadingTag,
          { 
            key: index, 
            className: `font-bold mb-4 ${
              level === 2 ? 'text-lg' : 
              level === 3 ? 'text-base' : 'text-sm'
            }`
          },
          React.createElement('span', { dangerouslySetInnerHTML: { __html: text } })
        )
      }
      
      // Linha normal
      return (
        <p 
          key={index} 
          className="mb-4 text-left"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
  }

  return (
    <div className={`text-left whitespace-pre-line ${className}`}>
      {processMarkdown(normalizedContent)}
    </div>
  )
}
