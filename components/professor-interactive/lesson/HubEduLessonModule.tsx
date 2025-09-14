import React, { useState, useEffect, useRef } from 'react';
import { useHubEduInteractive, HubEduSlide } from '@/hooks/useHubEduInteractive';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface HubEduLessonModuleProps {
  initialQuery?: string;
  onLessonComplete?: () => void;
  className?: string;
}

export default function HubEduLessonModule({ 
  initialQuery = "", 
  onLessonComplete,
  className = ""
}: HubEduLessonModuleProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const {
    lesson,
    isLoading,
    error,
    isGeneratingNext,
    generateInitialSlides,
    goToNextSlide,
    goToPreviousSlide,
    clearLesson,
    getCurrentSlide,
    canGoNext,
    canGoPrevious,
    isQuestionSlide,
    isClosingSlide
  } = useHubEduInteractive();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-generate initial slides when query changes
  useEffect(() => {
    if (query && !lesson) {
      generateInitialSlides(query);
    }
  }, [query, lesson, generateInitialSlides]);

  // Load image for current slide
  useEffect(() => {
    const currentSlide = getCurrentSlide();
    if (currentSlide?.image_prompt) {
      loadImageForSlide(currentSlide);
    }
  }, [getCurrentSlide]);

  const loadImageForSlide = async (slide: HubEduSlide) => {
    try {
      // For now, we'll use a placeholder service
      // In production, this would integrate with Unsplash/Pexels/DALL·E
      const response = await fetch('/api/unsplash/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: slide.image_prompt,
          count: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setImageUrl(data.photos[0].urls.regular);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      // Fallback to placeholder
      setImageUrl(`https://picsum.photos/800/400?random=${slide.slide}`);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setShowAnswer(true);
    }
  };

  const handleNextSlide = () => {
    if (isQuestionSlide() && !showAnswer) {
      handleSubmitAnswer();
      return;
    }
    
    setSelectedAnswer(null);
    setShowAnswer(false);
    goToNextSlide();
  };

  const handlePreviousSlide = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    goToPreviousSlide();
  };

  const handleRestart = () => {
    clearLesson();
    setQuery('');
    setSelectedAnswer(null);
    setShowAnswer(false);
    setImageUrl(null);
  };

  const renderQuestionSlide = (slide: HubEduSlide) => {
    const isCorrect = selectedAnswer === slide.answer;
    const showFeedback = showAnswer;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
          <p className="text-lg text-gray-700 mb-6">{slide.content}</p>
        </div>

        <div className="grid gap-3">
          {slide.options?.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === optionLetter;
            const isCorrectOption = optionLetter === slide.answer;
            
            let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
            
            if (showFeedback) {
              if (isCorrectOption) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected && !isCorrectOption) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-300 bg-gray-50";
              }
            } else {
              buttonClass += isSelected 
                ? "border-blue-500 bg-blue-50 text-blue-800" 
                : "border-gray-300 hover:border-blue-300 hover:bg-blue-50";
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(optionLetter)}
                disabled={showFeedback}
              >
                <div className="flex items-center space-x-3">
                  {showFeedback && isCorrectOption && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">{optionLetter})</span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
                <p className="text-blue-700">
                  A resposta correta é {slide.answer}, pois {slide.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {!showFeedback && selectedAnswer && (
          <div className="text-center">
            <Button onClick={handleSubmitAnswer} className="bg-blue-600 hover:bg-blue-700">
              Verificar Resposta
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderExplanationSlide = (slide: HubEduSlide) => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{slide.content}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderClosingSlide = (slide: HubEduSlide) => {
    return (
      <div className="space-y-6 text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-green-600">🎉 Parabéns!</h2>
          <h3 className="text-xl font-semibold mb-4">{slide.title}</h3>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">{slide.content}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-800 mb-2">Você completou a aula sobre {lesson?.theme}!</h4>
          <p className="text-green-700">
            Continue explorando este tema fascinante e aplicando o que aprendeu.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={handleRestart} variant="outline">
            Nova Aula
          </Button>
          {onLessonComplete && (
            <Button onClick={onLessonComplete} className="bg-green-600 hover:bg-green-700">
              Finalizar
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSlide = (slide: HubEduSlide) => {
    switch (slide.type) {
      case 'question':
        return renderQuestionSlide(slide);
      case 'closing':
        return renderClosingSlide(slide);
      default:
        return renderExplanationSlide(slide);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Gerando sua aula interativa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <XCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Erro ao carregar a aula</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={handleRestart} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Aula Interativa HubEdu</h2>
          <p className="text-gray-600 mb-6">
            Digite um tema para começar sua aula personalizada de 8 slides
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: frações, fotossíntese, revolução francesa..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            onKeyPress={(e) => e.key === 'Enter' && generateInitialSlides(query)}
          />
          <Button 
            onClick={() => generateInitialSlides(query)}
            disabled={!query.trim()}
            className="w-full"
          >
            Começar Aula
          </Button>
        </div>
      </div>
    );
  }

  const currentSlide = getCurrentSlide();
  if (!currentSlide) return null;

  return (
    <div ref={containerRef} className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {lesson.theme}
          </Badge>
          <span className="text-sm text-gray-600">
            Slide {currentSlide.slide} de 8
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < lesson.slides.length 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentSlide.title}</span>
            {isGeneratingNext && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando próximo slide...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderSlide(currentSlide)}
        </CardContent>
      </Card>

      {/* Image */}
      {imageUrl && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <img
              src={imageUrl}
              alt={currentSlide.image_prompt}
              className="w-full h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePreviousSlide}
          disabled={!canGoPrevious()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </Button>

        <div className="flex space-x-2">
          <Button onClick={handleRestart} variant="outline" size="sm">
            Nova Aula
          </Button>
        </div>

        <Button
          onClick={handleNextSlide}
          disabled={!canGoNext() && !isClosingSlide()}
          className="flex items-center space-x-2"
        >
          <span>
            {isClosingSlide() ? 'Finalizar' : 'Próximo'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
