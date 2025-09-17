'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Função para processar markdown básico
  const processMarkdown = (text: string) => {
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
      
      // Se a linha começar com #, tratar como cabeçalho
      if (processedLine.startsWith('#')) {
        const level = processedLine.match(/^#+/)?.[0].length || 1
        const text = processedLine.replace(/^#+\s*/, '')
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        
        return React.createElement(
          HeadingTag,
          { 
            key: index, 
            className: `font-bold mb-2 ${
              level === 1 ? 'text-xl' : 
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
          className="mb-2 text-left"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
  }

  return (
    <div className={`text-left ${className}`}>
      {processMarkdown(content)}
    </div>
  )
}
