"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle, Lightbulb, Download, Printer, RotateCcw, Plus, Keyboard } from 'lucide-react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { useProgressiveLesson } from '@/hooks/useProgressiveLesson';

interface ProgressiveLessonComponentProps {
  initialQuery?: string;
  initialSubject?: string;
  onLessonComplete?: () => void;
  className?: string;
}

export default function ProgressiveLessonComponent({ 
  initialQuery = "", 
  initialSubject = "",
  onLessonComplete,
  className = ""
}: ProgressiveLessonComponentProps) {
  const [query, setQuery] = useState(initialQuery);
  const [subject, setSubject] = useState(initialSubject);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showClosingOptions, setShowClosingOptions] = useState(false);
  
  // Navegação pelo teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Evitar conflitos quando estiver digitando em inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (canGoPrevious()) {
            handlePreviousSlide();
          }
          break;
        case 'ArrowRight':
          if (canGoNext() && !(isQuestionSlide() && !showAnswer && !selectedAnswer)) {
            handleNextSlide();
          }
          break;
        case 'Enter':
          if (isQuestionSlide() && !showAnswer && selectedAnswer) {
            setShowAnswer(true);
          } else if (isQuestionSlide() && showAnswer) {
            handleNextSlide();
          }
          break;
        case 'Escape':
          if (showAnswer) {
            setShowAnswer(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGoNext, canGoPrevious, isQuestionSlide, showAnswer, selectedAnswer]);

  const {
    skeleton,
    generatedSlides,
    isLoading,
    isGeneratingNext,
    error,
    currentSlide,
    totalSlides,
    generateSkeleton,
    goToNextSlide,
    goToPreviousSlide,
    clearLesson,
    canGoNext,
    canGoPrevious,
    getCurrentSlide,
    isQuestionSlide,
    isClosingSlide
  } = useProgressiveLesson();

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-generate skeleton when query changes
  useEffect(() => {
    if (query && !skeleton) {
      generateSkeleton(query, subject);
    }
  }, [query, subject, skeleton, generateSkeleton]);

  // Load image for current slide
  useEffect(() => {
    const currentSlideData = getCurrentSlide();
    if (currentSlideData?.imagePrompt) {
      loadImageForSlide(currentSlideData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, generatedSlides.length]);

  const loadImageForSlide = async (slide: any) => {
    try {
      const query = slide.imagePrompt || skeleton?.theme || '';
      
      if (!query.trim()) {
        console.log('⚠️ Query vazia, não buscando imagem');
        return;
      }
      
      console.log('🖼️ Carregando imagem para slide:', currentSlide + 1, 'Prompt:', query);
      
      // 1) Wikimedia Commons first
      let selectedUrl: string | null = null;
      try {
        const wikiRes = await fetch('/api/wikimedia/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, subject: skeleton?.subject || '', count: 1 })
        });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.success && wikiData.photos && wikiData.photos.length > 0) {
            selectedUrl = wikiData.photos[0].urls?.regular || wikiData.photos[0].url;
          }
        }
      } catch (e) {
        console.warn('Wikimedia fetch failed, will fallback:', e);
      }

      // 2) Fallback to Unsplash translate-search
      if (!selectedUrl) {
        const response = await fetch('/api/unsplash/translate-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            query: query,
            subject: skeleton?.subject || '',
            count: 1
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            selectedUrl = data.photos[0].urls.regular;
          }
        }
      }

      // 3) Final fallback
      setImageUrl(
        selectedUrl || `https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`
      );
    } catch (error) {
      console.error('❌ Erro ao carregar imagem:', error);
      setImageUrl(`https://commons.wikimedia.org/wiki/Special:FilePath/Education%20-%20The%20Noun%20Project.svg?width=800&height=400`);
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
      // Se é uma pergunta e não foi respondida, não permitir avançar
      if (!selectedAnswer) {
        return; // Não fazer nada se não há resposta selecionada
      }
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
    setShowClosingOptions(false);
  };

  const handleFinalizeLesson = () => {
    setShowClosingOptions(true);
  };

  const handleSavePDF = () => {
    try {
      // Criar conteúdo HTML para o PDF
      const lessonTitle = skeleton?.theme || 'Aula Interativa';
      const slidesContent = generatedSlides.map((slide, index) => {
        let content = `<h3>Slide ${index + 1}: ${slide.title}</h3>`;
        content += `<div>${slide.content}</div>`;
        
        if (slide.type === 'question' && slide.options) {
          content += '<h4>Pergunta:</h4>';
          content += `<p>${slide.question}</p>`;
          content += '<h4>Opções:</h4>';
          content += '<ul>';
          slide.options.forEach((option, optIndex) => {
            content += `<li>${option}</li>`;
          });
          content += '</ul>';
          if (slide.correctAnswer) {
            content += `<p><strong>Resposta correta:</strong> ${slide.correctAnswer}</p>`;
          }
        }
        
        return content;
      }).join('<hr>');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${lessonTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #2563eb; text-align: center; }
            h2 { color: #1e40af; }
            h3 { color: #3730a3; }
            h4 { color: #4f46e5; }
            .slide { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${lessonTitle}</h1>
          <div class="slide">
            ${slidesContent}
          </div>
          <div class="footer">
            <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>HubEdu - Plataforma de Aulas Interativas</p>
          </div>
        </body>
        </html>
      `;

      // Criar blob e baixar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_aula.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PDF/HTML da aula salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      alert('Erro ao salvar a aula. Tente novamente.');
    }
  };

  const handlePrint = () => {
    try {
      // Criar conteúdo para impressão
      const lessonTitle = skeleton?.theme || 'Aula Interativa';
      const slidesContent = generatedSlides.map((slide, index) => {
        let content = `<div class="slide-print">
          <h3>Slide ${index + 1}: ${slide.title}</h3>
          <div class="content">${slide.content}</div>`;
        
        if (slide.type === 'question' && slide.options) {
          content += '<div class="question-section">';
          content += '<h4>Pergunta:</h4>';
          content += `<p class="question">${slide.question}</p>`;
          content += '<h4>Opções:</h4>';
          content += '<ul class="options">';
          slide.options.forEach((option, optIndex) => {
            content += `<li>${option}</li>`;
          });
          content += '</ul>';
          if (slide.correctAnswer) {
            content += `<p class="correct-answer"><strong>Resposta correta:</strong> ${slide.correctAnswer}</p>`;
          }
          content += '</div>';
        }
        
        content += '</div>';
        return content;
      }).join('');

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${lessonTitle} - Impressão</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
              .no-print { display: none !important; }
            }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            h2 { color: #1e40af; margin-top: 25px; }
            h3 { color: #3730a3; margin-top: 20px; }
            h4 { color: #4f46e5; margin-top: 15px; }
            .slide-print { margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; page-break-inside: avoid; }
            .question-section { margin-top: 15px; }
            .question { font-weight: bold; margin: 10px 0; }
            .options { margin: 10px 0; }
            .correct-answer { color: #059669; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${lessonTitle}</h1>
          ${slidesContent}
          <div class="footer">
            <p>Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>HubEdu - Plataforma de Aulas Interativas</p>
          </div>
        </body>
        </html>
      `;

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        // Fallback para navegadores que bloqueiam popups
        window.print();
      }

      console.log('Aula enviada para impressão!');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao imprimir a aula. Tente novamente.');
    }
  };

  const handleRepeatLesson = () => {
    // Reiniciar a mesma aula
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowClosingOptions(false);
    goToSlide(0); // Voltar para o primeiro slide
  };

  const handleNewLesson = () => {
    // Iniciar nova aula
    handleRestart();
  };

  const renderQuestionSlide = (slide: any) => {
    const correctAnswer = slide.correctOption;
    console.log('🔍 Debug pergunta:', {
      selectedAnswer,
      correctAnswer,
      options: slide.options
    });
    
    let isCorrect = false;
    if (typeof correctAnswer === 'number') {
      isCorrect = selectedAnswer === String.fromCharCode(65 + correctAnswer);
    }
    
    const showFeedback = showAnswer;

    // Se o slide tem estrutura card1/card2, renderizar em 2 cards
    if (slide.card1 && slide.card2) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 - Pergunta */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card1.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 whitespace-pre-line">
                <MarkdownRenderer 
                  content={slide.card1.content} 
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Opções de Resposta */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card2.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opções de resposta */}
              <div className="grid gap-3">
                {slide.card2.options?.map((option: string, index: number) => {
                  const optionLetter = String.fromCharCode(65 + index);
                  const isSelected = selectedAnswer === optionLetter;
                  const isCorrectOption = index === correctAnswer;
                  
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
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
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

              {/* Botão de verificação */}
              {!showFeedback && selectedAnswer && (
                <Button 
                  onClick={handleSubmitAnswer} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Verificar Resposta
                </Button>
              )}

              {/* Explicação da resposta */}
              {showFeedback && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
                      <div className="text-blue-700">
                        <MarkdownRenderer 
                          content={slide.card2.correctAnswer || 'Explicação da resposta correta'} 
                          className="text-blue-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fallback para slides sem estrutura card1/card2
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
          <div className="mb-6">
            <MarkdownRenderer 
              content={slide.content} 
              className="text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        <div className="grid gap-3">
          {slide.options?.map((option: string, index: number) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === optionLetter;
            const isCorrectOption = index === correctAnswer;
            
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
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
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
                <div className="text-blue-700">
                  <MarkdownRenderer 
                    content={slide.correctAnswer || 'Explicação da resposta correta'} 
                    className="text-blue-700"
                  />
                </div>
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

  const renderExplanationSlide = (slide: any) => {
    // Se o slide tem estrutura card1/card2, renderizar em 2 cards
    if (slide.card1 && slide.card2) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card1.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 whitespace-pre-line">
                <MarkdownRenderer 
                  content={slide.card1.content} 
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{slide.card2.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 whitespace-pre-line">
                <MarkdownRenderer 
                  content={slide.card2.content} 
                  className="text-gray-700 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fallback para slides sem estrutura card1/card2
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
          <div>
            <MarkdownRenderer 
              content={slide.content} 
              className="text-gray-700 leading-relaxed"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderClosingSlide = (slide: any) => {
    return (
      <div className="space-y-6 text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-green-600">🎉 Parabéns!</h2>
          <h3 className="text-xl font-semibold mb-4">{slide.title}</h3>
          <div>
            <MarkdownRenderer 
              content={slide.content} 
              className="text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-800 mb-2">Você completou a aula sobre {skeleton?.theme}!</h4>
          <p className="text-green-700">
            Continue explorando este tema fascinante e aplicando o que aprendeu.
          </p>
        </div>

      </div>
    );
  };

  const renderSlide = (slide: any) => {
    if (!slide) return null;
    
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Gerando esqueleto da aula...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={handleRestart} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const currentSlideData = getCurrentSlide();
  if (!currentSlideData || !skeleton) return null;

  return (
    <div ref={containerRef} className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {skeleton.theme}
          </Badge>
          <span className="text-sm text-gray-600">
            Slide {currentSlide + 1} de {totalSlides}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= currentSlide 
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
            <span>{currentSlideData.title}</span>
            {isGeneratingNext && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando próximo slide...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderSlide(currentSlideData)}
        </CardContent>
      </Card>

      {/* Image */}
      {imageUrl && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <Image
              src={imageUrl}
              alt={currentSlideData.imagePrompt}
              width={1350}
              height={1080}
              className="w-full h-auto object-cover rounded-lg"
              style={{ aspectRatio: '1350/1080' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Keyboard Navigation Help */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Keyboard className="h-4 w-4" />
          <span className="font-medium">Navegação por teclado:</span>
          <span>← → para navegar</span>
          <span>•</span>
          <span>Enter para confirmar</span>
          <span>•</span>
          <span>Esc para voltar</span>
        </div>
      </div>

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

        {isClosingSlide() ? (
          // No último slide, mostrar diretamente as opções de notas
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">O que você gostaria de fazer agora?</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={handleSavePDF}
                className="flex flex-col items-center space-y-2 p-4 h-auto bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-6 h-6" />
                <span className="text-sm">Salvar PDF</span>
              </Button>
              
              <Button
                onClick={handlePrint}
                className="flex flex-col items-center space-y-2 p-4 h-auto bg-gray-600 hover:bg-gray-700"
              >
                <Printer className="w-6 h-6" />
                <span className="text-sm">Imprimir</span>
              </Button>
              
              <Button
                onClick={handleRepeatLesson}
                className="flex flex-col items-center space-y-2 p-4 h-auto bg-purple-600 hover:bg-purple-700"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="text-sm">Reiniciar</span>
              </Button>
              
              <Button
                onClick={handleNewLesson}
                className="flex flex-col items-center space-y-2 p-4 h-auto bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm">Nova Aula</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleNextSlide}
            disabled={!canGoNext() || (isQuestionSlide() && !showAnswer && !selectedAnswer)}
            className={`flex items-center space-x-2 ${
              isQuestionSlide() && !showAnswer && !selectedAnswer 
                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                : ''
            }`}
          >
            <span>
              {isQuestionSlide() && !showAnswer && !selectedAnswer 
                ? 'Selecione uma resposta' 
                : 'Próximo'
              }
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
