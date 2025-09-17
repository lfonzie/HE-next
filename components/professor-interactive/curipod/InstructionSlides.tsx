"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface InstructionSlide {
  card1: {
    title: string;
    content: string;
  };
  card2: {
    title: string;
    content: string;
  };
}

interface InstructionSlidesProps {
  slides: InstructionSlide[];
  onComplete: () => void;
}

export default function InstructionSlides({ slides, onComplete }: InstructionSlidesProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());

  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const isFirstSlide = currentSlideIndex === 0;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCompletedSlides(prev => new Set([...prev, currentSlideIndex]));
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Instrução Interativa
            </h2>
            <p className="text-sm text-gray-600">
              Slide {currentSlideIndex + 1} de {slides.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {completedSlides.size}/{slides.length} Concluídos
          </Badge>
        </div>
      </div>

      {/* Indicadores de progresso */}
      <div className="flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlideIndex
                ? 'bg-blue-500 scale-125'
                : completedSlides.has(index)
                ? 'bg-green-400'
                : 'bg-gray-300'
            }`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Conteúdo do slide atual */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            {currentSlide.card1.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="prose prose-lg max-w-none">
              <h3 className="font-semibold text-gray-900 mb-3">
                {currentSlide.card1.title}
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {currentSlide.card1.content}
              </p>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="font-semibold text-gray-900 mb-3">
                {currentSlide.card2.title}
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {currentSlide.card2.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={handlePrevious}
          disabled={isFirstSlide}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <div className="text-sm text-gray-600">
          {isLastSlide ? 'Último slide' : `${slides.length - currentSlideIndex - 1} slides restantes`}
        </div>
        
        <Button 
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
        >
          {isLastSlide ? 'Continuar para Checkpoint' : 'Próximo'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          💡 Dicas para aproveitar melhor:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Leia atentamente cada card</li>
          <li>• Faça conexões entre os conceitos</li>
          <li>• Use os indicadores para navegar</li>
          <li>• Complete todos os slides antes de continuar</li>
        </ul>
      </div>
    </div>
  );
}
