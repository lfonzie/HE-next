"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Loader2, RefreshCw } from 'lucide-react';
import { useUnsplashImage } from '@/hooks/useUnsplashImage';
import InteractiveQuestionCard from '../quiz/InteractiveQuestionCard';

interface UnsplashSlideCardProps {
  slide: any;
  stepIndex: number;
  onAnswer: (stepIndex: number, selectedOption: number, isCorrect: boolean) => void;
  userAnswer?: number;
  showHelp?: boolean;
}

export default function UnsplashSlideCard({
  slide,
  stepIndex,
  onAnswer,
  userAnswer,
  showHelp
}: UnsplashSlideCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determinar se deve buscar imagem do Unsplash (slides 1 e 9)
  const shouldFetchImage = stepIndex === 0 || stepIndex === 8; // slide 1 (índice 0) ou slide 9 (índice 8)
  
  // Gerar query baseada no conteúdo do slide
  const getImageQuery = () => {
    if (slide.card2?.title) {
      return slide.card2.title;
    }
    if (slide.title) {
      return slide.title;
    }
    if (slide.content) {
      // Extrair palavras-chave do conteúdo
      const words = slide.content.split(' ').slice(0, 3).join(' ');
      return words;
    }
    return '';
  };

  const { imageUrl, isLoading: imageLoading, error: imageError, refetch } = useUnsplashImage(
    getImageQuery(),
    shouldFetchImage,
    slide.subject // Passar o subject para tradução
  );

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleRefreshImage = () => {
    setImageError(false);
    setImageLoaded(false);
    refetch();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Slide {stepIndex + 1}
          </Badge>
          {slide.type === 'question' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Quiz
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Conteúdo principal */}
        {slide.content && (
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {slide.content}
            </div>
          </div>
        )}

        {/* Card 1 */}
        {slide.card1 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card1.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 whitespace-pre-line">{slide.card1.content}</div>
            </CardContent>
          </Card>
        )}

        {/* Card 2 com imagem do Unsplash */}
        {slide.card2 && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card2.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-600 whitespace-pre-line">{slide.card2.content}</div>
              
              {/* Imagem do Unsplash para slides 1 e 9 */}
              {shouldFetchImage && (
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg min-h-[200px]">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Carregando imagem...</p>
                      </div>
                    </div>
                  )}
                  
                  {imageUrl && !imageError && !unsplashError && (
                    <div className="relative">
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      <Image
                        src={imageUrl}
                        alt={slide.card2.title || 'Imagem educacional'}
                        width={1350}
                        height={1080}
                        className={`w-full h-auto object-cover rounded-lg transition-opacity duration-300 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        style={{ 
                          aspectRatio: '1350/1080',
                          width: 'auto',
                          height: 'auto'
                        }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                      
                      {/* Botão para recarregar imagem */}
                      <button
                        onClick={handleRefreshImage}
                        className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                        title="Carregar nova imagem"
                      >
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Mensagem de erro ou fallback */}
                  {(imageError || unsplashError) && (
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">
                        Não foi possível carregar a imagem
                      </p>
                      <button
                        onClick={handleRefreshImage}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Questão de múltipla escolha */}
              {slide.card2.options && (
                <InteractiveQuestionCard
                  question={slide.card2.title}
                  options={slide.card2.options}
                  correctOption={slide.card2.correctOption || 0}
                  onAnswer={(selected, isCorrect) => onAnswer(stepIndex, selected, isCorrect)}
                  showHelp={showHelp}
                  helpMessage={slide.card2.helpMessage}
                  correctAnswer={slide.card2.correctAnswer}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Questão direta */}
        {slide.question && slide.options && (
          <InteractiveQuestionCard
            question={slide.question}
            options={slide.options}
            correctOption={slide.correctOption || 0}
            onAnswer={(selected, isCorrect) => onAnswer(stepIndex, selected, isCorrect)}
            showHelp={showHelp}
            helpMessage={slide.helpMessage}
            correctAnswer={slide.correctAnswer}
          />
        )}
      </CardContent>
    </Card>
  );
}
