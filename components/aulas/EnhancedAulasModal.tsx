// components/aulas/EnhancedAulasModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader2, AlertCircle, CheckCircle, ExternalLink, Play, Edit, Trash2, Plus, Search, Filter, Star, Users, Clock, Target, Image, Settings } from 'lucide-react';
import GeminiImageBetaToggle from './GeminiImageBetaToggle';

interface EnhancedAulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  className?: string;
}

interface Slide {
  slideNumber: number;
  type: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageData?: string;
  imageMimeType?: string;
  generatedBy?: 'gemini' | 'fallback' | 'none';
  timeEstimate: number;
  questions?: any[];
}

interface Lesson {
  id: string;
  title: string;
  topic: string;
  subject: string;
  grade: number;
  objectives: string[];
  introduction: string;
  slides: Slide[];
  summary: string;
  nextSteps: string[];
  metadata: {
    totalSlides: number;
    slidesWithImages: number;
    betaImagesEnabled: boolean;
    generationTime: number;
    timestamp: string;
  };
}

interface BetaStatus {
  enabled: boolean;
  model: string;
  totalGenerated: number;
  totalFailed: number;
}

export function EnhancedAulasModal({ isOpen, onClose, initialTopic = '', className = '' }: EnhancedAulasModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'my-aulas'>('create');
  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [betaImagesEnabled, setBetaImagesEnabled] = useState(true); // ✅ SEMPRE ATIVADO
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTopic(initialTopic);
      setActiveTab('create');
    } else {
      setGeneratedLesson(null);
      setError(null);
      setProgress(0);
      setCurrentStep('');
    }
  }, [isOpen, initialTopic]);

  const generateAula = async () => {
    if (!topic.trim()) {
      setError('Por favor, digite um tópico para a aula');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Iniciando geração da aula...');

    try {
      // Simular progresso inicial
      const progressSteps = [
        { step: 'Analisando o tópico...', progress: 15 },
        { step: 'Estruturando conteúdo educacional...', progress: 30 },
        { step: 'Gerando slides interativos...', progress: 50 },
        { step: 'Criando atividades práticas...', progress: 70 },
        { step: 'Adicionando quizzes de avaliação...', progress: 85 },
        { step: 'Finalizando e organizando material...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of progressSteps) {
        setCurrentStep(step);
        setProgress(stepProgress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Chamar API de geração com sistema beta
      const response = await fetch('/api/aulas/generate-with-gemini-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.trim(),
          betaImagesEnabled: betaImagesEnabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar a aula');
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        setGeneratedLesson(data.lesson);
        setBetaStatus(data.betaStatus);
        console.log('✅ Aula gerada com sucesso:', data.lesson.title);
        console.log('🖼️ Status das imagens:', data.betaStatus);
      } else {
        throw new Error(data.error || 'Erro desconhecido na geração da aula');
      }

    } catch (error: any) {
      console.error('❌ Erro na geração da aula:', error);
      setError(error.message || 'Erro ao gerar a aula. Tente novamente.');
    } finally {
      setIsGenerating(false);
      setProgress(100);
      setCurrentStep('Concluído!');
    }
  };

  const handleBetaToggle = (enabled: boolean) => {
    setBetaImagesEnabled(enabled);
    console.log('🔄 Sistema beta de imagens:', enabled ? 'ATIVADO' : 'DESATIVADO');
  };

  const renderSlidePreview = (slide: Slide, index: number) => (
    <div key={slide.slideNumber} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
            Slide {slide.slideNumber}
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {slide.type}
          </span>
          {slide.generatedBy && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              slide.generatedBy === 'gemini' ? 'bg-green-100 text-green-800' :
              slide.generatedBy === 'fallback' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {slide.generatedBy === 'gemini' ? '🤖 Gemini' :
               slide.generatedBy === 'fallback' ? '🔄 Fallback' : '❌ Sem imagem'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{slide.timeEstimate}min</span>
      </div>
      
      <h4 className="font-semibold text-gray-900 mb-2">{slide.title}</h4>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {slide.content.substring(0, 150)}...
      </p>

      {slide.imageUrl && (
        <div className="mb-3">
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={slide.imageUrl} 
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {slide.generatedBy === 'gemini' ? '🤖' : '🔄'}
            </div>
          </div>
          {slide.imagePrompt && (
            <p className="text-xs text-gray-500 mt-1">
              Prompt: {slide.imagePrompt.substring(0, 50)}...
            </p>
          )}
        </div>
      )}

      {slide.questions && slide.questions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quiz</span>
          </div>
          <p className="text-xs text-blue-700">
            {slide.questions.length} pergunta(s) de avaliação
          </p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Criador de Aulas Inteligente</h2>
            {betaImagesEnabled && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Beta Ativo
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'create', label: 'Criar Aula', icon: Plus },
            { id: 'library', label: 'Biblioteca', icon: BookOpen },
            { id: 'my-aulas', label: 'Minhas Aulas', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* Sistema Beta de Imagens - SEMPRE ATIVADO */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <h4 className="font-semibold text-green-900">
                      ✅ Sistema Beta de Imagens Gemini - ATIVADO
                    </h4>
                    <p className="text-sm text-green-700">
                      Sistema beta sempre ativado - imagens serão geradas automaticamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário de Criação */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Criar Nova Aula
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tópico da Aula
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ex: Fotossíntese, Revolução Francesa, Equações do 2º grau..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>

                  <button
                    onClick={generateAula}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Gerando Aula...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Gerar Aula</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress */}
              {isGenerating && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <h4 className="font-medium text-blue-900">Gerando sua aula...</h4>
                      <p className="text-sm text-blue-700">{currentStep}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-blue-600 mt-2">{progress}% concluído</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Erro na Geração</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resultado */}
              {generatedLesson && (
                <div className="space-y-6">
                  {/* Header da Aula */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{generatedLesson.title}</h3>
                        <p className="text-blue-100 mb-4">{generatedLesson.introduction}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{generatedLesson.subject}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{generatedLesson.grade}º ano</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{generatedLesson.slides.reduce((acc, slide) => acc + slide.timeEstimate, 0)} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Image className="w-4 h-4" />
                            <span>{generatedLesson.metadata.slidesWithImages} imagens</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-blue-100 mb-2">
                          Sistema Beta: {betaStatus?.enabled ? 'ATIVADO' : 'DESATIVADO'}
                        </div>
                        {betaStatus && (
                          <div className="text-xs text-blue-200">
                            <div>🤖 Geradas: {betaStatus.totalGenerated}</div>
                            <div>🔄 Fallbacks: {betaStatus.totalFailed}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Objetivos */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Objetivos de Aprendizagem</span>
                    </h4>
                    <ul className="space-y-2">
                      {generatedLesson.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Slides */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Estrutura da Aula ({generatedLesson.slides.length} slides)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedLesson.slides.map((slide, index) => renderSlidePreview(slide, index))}
                    </div>
                  </div>

                  {/* Resumo */}
                  {generatedLesson.summary && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Resumo</h4>
                      <p className="text-sm text-gray-700">{generatedLesson.summary}</p>
                    </div>
                  )}

                  {/* Próximos Passos */}
                  {generatedLesson.nextSteps && generatedLesson.nextSteps.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos</h4>
                      <ul className="space-y-2">
                        {generatedLesson.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                            <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4" />
                      <span>Iniciar Aula</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Outras abas (placeholder) */}
          {activeTab === 'library' && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Biblioteca de Aulas</h3>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'my-aulas' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Minhas Aulas</h3>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnhancedAulasModal;
