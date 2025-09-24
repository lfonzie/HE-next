'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Removed Badge import
// Removed animation-related icons
// Removed framer-motion animations
import ContentProcessor from './ContentProcessor'
import { useUnsplashImage } from '@/hooks/useUnsplashImage'
import AudioPlayer from '@/components/audio/AudioPlayer'

interface AnimationSlideProps {
  title: string
  content: string
  media?: string[]
  // Removed animationSteps - animations disabled
  autoPlay?: boolean
  showControls?: boolean
  allowFullscreen?: boolean
  onComplete?: () => void
  isFirstSlide?: boolean
  isLastSlide?: boolean
  lessonTheme?: string
  imageUrl?: string // Add imageUrl prop for dynamic images
}

export default function AnimationSlide({
  title,
  content,
  media = [],
  // animationSteps removed
  autoPlay = false,
  showControls = true,
  allowFullscreen = true,
  onComplete,
  isFirstSlide = false,
  isLastSlide = false,
  lessonTheme = 'geral',
  imageUrl
}: AnimationSlideProps) {
  // Removed animation-related state variables

  // Buscar imagem do Unsplash apenas se não há imageUrl da API
  const shouldFetchImage = !imageUrl && (isFirstSlide || isLastSlide)
  const imageQuery = shouldFetchImage
    ? isFirstSlide 
      ? `${lessonTheme} conceito introdução` 
      : `${lessonTheme} resumo conclusão`
    : ''
  
  const { image: unsplashImage, loading: imageLoading } = useUnsplashImage(
    imageQuery, 
    shouldFetchImage
  )

  // Removed animation effects - no automatic completion
  // useEffect(() => {
  //   onComplete?.()
  // }, []) // Empty dependency array to run only once on mount

  // Removed animation control functions

  // Removed animation step reference

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="space-y-6">
        {/* Content */}
        <div className="text-left space-y-4">
          {/* Imagem dinâmica - priorizar imageUrl da API, depois Unsplash para primeira/última slide */}
          {(imageUrl || (isFirstSlide || isLastSlide)) && (
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-2xl">
                {imageUrl ? (
                  // Usar imagem dinâmica da API
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${lessonTheme} - ${title}`}
                    className="w-full rounded-lg shadow-lg"
                    style={{ 
                      aspectRatio: '1350/1080',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.warn('Erro ao carregar imagem da API:', imageUrl);
                      // Fallback para imagem genérica se a dinâmica falhar
                      e.currentTarget.src = `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1350&h=1080&fit=crop&auto=format`
                    }}
                    onLoad={() => {
                      console.log('Imagem carregada com sucesso:', imageUrl);
                    }}
                  />
                ) : (
                  // Usar Unsplash para primeira/última slide (comportamento original)
                  <>
                    {imageLoading ? (
                      <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                        <span className="text-gray-500">Carregando imagem...</span>
                      </div>
                    ) : unsplashImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={unsplashImage.urls.regular}
                        alt={unsplashImage.alt_description || `${lessonTheme} image`}
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Imagem não disponível</span>
                      </div>
                    )}
                    {unsplashImage && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Foto por {unsplashImage.user.name}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Text-to-Speech Player */}
          {content && (
            <div className="mb-6">
              <AudioPlayer
                text={content}
                className="border-orange-200 bg-orange-50"
              />
            </div>
          )}
          
          <ContentProcessor 
            content={content} 
            subject={lessonTheme}
            className="text-lg"
          />
        </div>

        {/* Media Display */}
        {media.length > 0 && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {media.map((mediaItem, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  {mediaItem.endsWith('.mp4') || mediaItem.endsWith('.webm') ? (
                    <video
                      src={mediaItem}
                      controls
                      muted={false}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaItem}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animation Steps removed */}

        {/* Interactive Elements and Completion Message removed */}
      </CardContent>
    </Card>
  )
}
