'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader2, AlertCircle, CheckCircle, ExternalLink, Play, Edit, Trash2, Plus, Search, Filter, Star, Users, Clock, Target } from 'lucide-react';

interface AulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  className?: string;
}

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'content' | 'quiz' | 'activity' | 'video' | 'image';
  order: number;
}

interface Aula {
  id: string;
  title: string;
  topic: string;
  description: string;
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  tags: string[];
  author: string;
  rating?: number;
  views?: number;
}

export function AulasModal({ isOpen, onClose, initialTopic = '', className = '' }: AulasModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'my-aulas'>('create');
  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAula, setGeneratedAula] = useState<Aula | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Mock data for library
  const mockAulas: Aula[] = [
    {
      id: '1',
      title: 'Introdução à Física Quântica',
      topic: 'Física',
      description: 'Conceitos básicos da física quântica para iniciantes',
      slides: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      status: 'published',
      difficulty: 'beginner',
      duration: 45,
      tags: ['física', 'quântica', 'ciência'],
      author: 'Prof. Silva',
      rating: 4.8,
      views: 1250
    },
    {
      id: '2',
      title: 'Revolução Francesa',
      topic: 'História',
      description: 'Análise completa da Revolução Francesa e seus impactos',
      slides: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      status: 'published',
      difficulty: 'intermediate',
      duration: 60,
      tags: ['história', 'revolução', 'frança'],
      author: 'Prof. Santos',
      rating: 4.6,
      views: 890
    }
  ];

  useEffect(() => {
    if (isOpen && initialTopic) {
      setTopic(initialTopic);
      setActiveTab('create');
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

    try {
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockSlides: Slide[] = [
        {
          id: '1',
          title: 'Introdução ao Tópico',
          content: `Bem-vindos à aula sobre ${topic}. Nesta aula, vamos explorar os conceitos fundamentais e aplicações práticas.`,
          type: 'content',
          order: 1
        },
        {
          id: '2',
          title: 'Conceitos Fundamentais',
          content: 'Vamos entender os conceitos básicos e sua importância no contexto educacional.',
          type: 'content',
          order: 2
        },
        {
          id: '3',
          title: 'Quiz de Verificação',
          content: 'Teste seus conhecimentos com este quiz interativo.',
          type: 'quiz',
          order: 3
        },
        {
          id: '4',
          title: 'Atividade Prática',
          content: 'Aplique o que aprendeu nesta atividade hands-on.',
          type: 'activity',
          order: 4
        }
      ];

      const newAula: Aula = {
        id: `aula-${Date.now()}`,
        title: `Aula sobre ${topic}`,
        topic: topic,
        description: `Aula completa e interativa sobre ${topic}, desenvolvida com base na BNCC e melhores práticas educacionais.`,
        slides: mockSlides,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        difficulty: 'intermediate',
        duration: 45,
        tags: [topic.toLowerCase(), 'educação', 'interativo'],
        author: 'IA HubEdu'
      };

      setGeneratedAula(newAula);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar aula');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishAula = async (aula: Aula) => {
    // Simulate publishing
    setGeneratedAula(prev => prev ? { ...prev, status: 'published' as const } : null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'N/A';
    }
  };

  const filteredAulas = mockAulas.filter(aula => {
    const matchesSearch = aula.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        aula.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        aula.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || aula.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Aulas Interativas</h2>
              <p className="text-sm opacity-90">Crie e gerencie aulas personalizadas com IA</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'create' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Criar Aula
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'library' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Biblioteca
              </button>
              <button
                onClick={() => setActiveTab('my-aulas')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'my-aulas' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Minhas Aulas
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-3 bg-white rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">Estatísticas</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Aulas criadas:</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de slides:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo total:</span>
                  <span className="font-medium">90min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'create' && (
              <div className="p-6">
                {!generatedAula ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Criar Nova Aula</h3>
                      <p className="text-gray-600 text-sm">
                        Digite um tópico e nossa IA criará uma aula completa e interativa para você.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tópico da Aula
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Fotossíntese, Revolução Francesa, Equações do 2º grau..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">O que você receberá:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Slides estruturados e organizados</li>
                        <li>• Conteúdo baseado na BNCC</li>
                        <li>• Atividades interativas e quizzes</li>
                        <li>• Material adaptado para diferentes níveis</li>
                        <li>• Sugestões de recursos adicionais</li>
                      </ul>
                    </div>

                    <button
                      onClick={generateAula}
                      disabled={!topic.trim() || isGenerating}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                      {isGenerating ? 'Gerando Aula...' : 'Criar Aula'}
                    </button>

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-700">{error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Generation Progress */}
                    {isGenerating && (
                      <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <h4 className="font-medium text-blue-800">Gerando sua aula...</h4>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-blue-700 mb-1">
                            <span>{currentStep}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <p className="text-sm text-blue-600">
                          Isso pode levar alguns minutos. Por favor, aguarde...
                        </p>
                      </div>
                    )}

                    {/* Generated Aula */}
                    {generatedAula && !isGenerating && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-green-800 mb-1">Aula criada com sucesso!</h4>
                            <p className="text-green-700 text-sm mb-3">
                              Sua aula "{generatedAula.title}" foi gerada e está pronta para uso.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => publishAula(generatedAula)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Publicar
                              </button>
                              <button
                                onClick={() => {
                                  setGeneratedAula(null);
                                  setTopic('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                              >
                                Nova Aula
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Aula Preview */}
                    {generatedAula && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {generatedAula.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{generatedAula.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {generatedAula.duration} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {getDifficultyText(generatedAula.difficulty)}
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {generatedAula.slides.length} slides
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(generatedAula.difficulty)}`}>
                            {getDifficultyText(generatedAula.difficulty)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Estrutura da Aula:</h4>
                          <div className="space-y-2">
                            {generatedAula.slides.map((slide, index) => (
                              <div key={slide.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{slide.title}</div>
                                  <div className="text-sm text-gray-600">{slide.content}</div>
                                </div>
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                                  {slide.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Visualizar
                          </button>
                          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'library' && (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Biblioteca de Aulas</h3>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar aulas..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">Todos os níveis</option>
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAulas.map((aula) => (
                    <div key={aula.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 line-clamp-2">{aula.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(aula.difficulty)}`}>
                          {getDifficultyText(aula.difficulty)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{aula.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {aula.duration}min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {aula.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {aula.rating}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" />
                          Acessar
                        </button>
                        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAulas.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma aula encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-aulas' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Aulas</h3>
                <div className="text-center py-12 text-gray-500">
                  <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma aula criada ainda</p>
                  <p className="text-sm">Crie sua primeira aula na aba "Criar Aula"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
