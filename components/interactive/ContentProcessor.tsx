// components/interactive/ContentProcessor.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ContentProcessorProps {
  content: string
  subject?: string
  className?: string
}

export default function ContentProcessor({ 
  content, 
  subject,
  className = "" 
}: ContentProcessorProps) {
  const [processedContent, setProcessedContent] = useState<string>(content)
  const [generatedImages, setGeneratedImages] = useState<Map<string, string>>(new Map())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    processContent(content)
  }, [content])

  const processContent = async (text: string) => {
    // Detectar sintaxe especial para diagramas, tabelas e gráficos
    const specialSyntaxRegex = /<<<criar (?:um|uma) (diagrama|tabela|gráfico) (?:da|de|do) (.+?)(?:, sem letras somente imagem)?>>>/gi
    let processedText = text
    let match

    // Encontrar todas as ocorrências de sintaxe especial
    const specialMatches: Array<{fullMatch: string, type: string, content: string, index: number}> = []
    while ((match = specialSyntaxRegex.exec(text)) !== null) {
      specialMatches.push({
        fullMatch: match[0],
        type: match[1],
        content: match[2],
        index: match.index
      })
    }

    // Processar cada ocorrência
    for (const specialMatch of specialMatches) {
      const placeholder = `[IMAGE_PLACEHOLDER_${specialMatch.index}]`
      processedText = processedText.replace(specialMatch.fullMatch, placeholder)
      
      // Gerar imagem para este conteúdo
      await generateImage(specialMatch.content, specialMatch.type, placeholder)
    }

    setProcessedContent(processedText)
  }

  const generateImage = async (content: string, type: string, placeholder: string) => {
    setLoadingImages(prev => new Set(prev).add(placeholder))
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(placeholder)
      return newSet
    })

    try {
      const response = await fetch('/api/gemini/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          subject: subject,
          type: type
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.image) {
        if (data.image.data) {
          // Imagem gerada pelo Gemini
          const imageUrl = `data:${data.image.mimeType};base64,${data.image.data}`
          setGeneratedImages(prev => new Map(prev).set(placeholder, imageUrl))
        } else if (data.image.fallbackUrl) {
          // Fallback
          setGeneratedImages(prev => new Map(prev).set(placeholder, data.image.fallbackUrl))
        }
      } else {
        throw new Error('Failed to generate image')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setImageErrors(prev => new Set(prev).add(placeholder))
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(placeholder)
        return newSet
      })
    }
  }

  const renderContent = () => {
    let renderedContent = processedContent

    // Substituir placeholders por imagens ou indicadores de carregamento
    generatedImages.forEach((imageUrl, placeholder) => {
      renderedContent = renderedContent.replace(placeholder, `![Generated Image](${imageUrl})`)
    })

    // Substituir placeholders de carregamento
    loadingImages.forEach(placeholder => {
      renderedContent = renderedContent.replace(placeholder, `
        <div class="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div class="flex items-center gap-2 text-gray-500">
            <Loader2 class="h-5 w-5 animate-spin" />
            <span>Gerando imagem...</span>
          </div>
        </div>
      `)
    })

    // Substituir placeholders de erro
    imageErrors.forEach(placeholder => {
      renderedContent = renderedContent.replace(placeholder, `
        <div class="flex items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
          <div class="flex items-center gap-2 text-red-500">
            <AlertCircle class="h-5 w-5" />
            <span>Erro ao gerar imagem</span>
          </div>
        </div>
      `)
    })

    return renderedContent
  }

  return (
    <div className={className}>
      <MarkdownRenderer content={renderContent()} />
    </div>
  )
}
