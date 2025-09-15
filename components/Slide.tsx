'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slide as SlideType } from '@/types/slides';

interface SlideProps {
  slide: SlideType;
  slideNumber: number;
  totalSlides: number;
}

export default function Slide({ slide, slideNumber, totalSlides }: SlideProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'explanation': return 'bg-blue-100 text-blue-800';
      case 'question': return 'bg-green-100 text-green-800';
      case 'closing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSlideTypeLabel = (type: string) => {
    switch (type) {
      case 'explanation': return 'Explicação';
      case 'question': return 'Pergunta';
      case 'closing': return 'Encerramento';
      default: return 'Conteúdo';
    }
  };

  return (
    <div className="slide-container max-w-4xl mx-auto p-4">
      {/* Slide Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getSlideTypeColor(slide.type)}>
            {getSlideTypeLabel(slide.type)}
          </Badge>
          <span className="text-sm text-gray-500">
            Slide {slideNumber} de {totalSlides}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{slide.title}</h2>
      </div>

      {slide.type === 'question' ? (
        /* Question Layout - Two Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 - Question Stem */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Pergunta</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-lg leading-relaxed"
                style={{ fontSize: '1.2rem', lineHeight: 1.5 }}
              >
                {slide.question_stem}
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Options */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Opções de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slide.options?.map((option, index) => {
                  const optionLetter = option[0];
                  const isSelected = selectedOption === optionLetter;
                  const isCorrect = optionLetter === slide.answer;
                  
                  let buttonStyle = 'w-full text-left p-4 rounded-lg border transition-colors';
                  
                  if (selectedOption) {
                    if (isCorrect) {
                      buttonStyle += ' bg-green-100 border-green-300 text-green-800';
                    } else if (isSelected) {
                      buttonStyle += ' bg-red-100 border-red-300 text-red-800';
                    } else {
                      buttonStyle += ' bg-gray-50 border-gray-200 text-gray-600';
                    }
                  } else {
                    buttonStyle += ' bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(optionLetter)}
                      className={buttonStyle}
                      disabled={!!selectedOption}
                    >
                      <span className="font-medium">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Rationale */}
              {selectedOption && slide.rationale && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Explicação:</h4>
                  <p className="text-blue-800">{slide.rationale}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Explanation/Closing Layout - Single Card */
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-lg leading-relaxed mb-4">{slide.content}</p>
              
              {/* Key Points */}
              {slide.key_points && slide.key_points.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Pontos Principais:</h4>
                  <ul className="space-y-2">
                    {slide.key_points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Rendering - Only if confidence >= 0.7 */}
      {slide.image_confidence && slide.image_confidence >= 0.7 && slide.image_prompt && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Ilustração</span>
                <Badge variant="outline" className="text-xs">
                  Unsplash
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <Image
                  src={`/api/image?prompt=${encodeURIComponent(slide.image_prompt)}`}
                  alt={slide.title}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg shadow-sm transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="secondary" className="text-xs bg-white/90">
                    Confiança: {Math.round(slide.image_confidence * 100)}%
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="text-xs bg-white/90">
                    Imagem educacional
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
