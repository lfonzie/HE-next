'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Target, FileText, CheckCircle, Loader2, Sparkles, Brain, GraduationCap, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StudyPackData {
  metadata: {
    segment: string;
    grade: string;
    subject: string;
    themes: string[];
    language: string;
    length_hint: string;
  };
  content_blocks: Array<{
    theme: string;
    summary: string;
    questions: Array<{
      id: string;
      type: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa_curta' | 'completar';
      stem: string;
      options?: string[];
    }>;
  }>;
  answer_key: Array<{
    id: string;
    correct: string;
    explanation: string;
  }>;
}

interface StudyPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
  isStudyPath?: boolean;
  className?: string;
}

const SEGMENTS = [
  'Fundamental I',
  'Fundamental II',
  'Ensino Médio',
  'Técnico',
  'Corporativo',
  'Superior'
];

const GRADES = [
  '1º ano',
  '2º ano',
  '3º ano',
  '4º ano',
  '5º ano',
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  '1ª série',
  '2ª série',
  '3ª série',
  '1º ano EM',
  '2º ano EM',
  '3º ano EM'
];

const SUBJECTS = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Inglês',
  'Espanhol',
  'Artes',
  'Educação Física',
  'Filosofia',
  'Sociologia',
  'Biologia',
  'Física',
  'Química',
  'Literatura'
];

export function StudyPackModal({ isOpen, onClose, topic = '', isStudyPath = false, className = '' }: StudyPackModalProps) {
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'results'>('form');
  const [formData, setFormData] = useState({
    segment: '',
    grade: '',
    subject: '',
    themes: topic ? [topic] : [''],
    style_notes: 'Tom didático, exemplos simples, vocabulário acessível'
  });
  const [studyPackData, setStudyPackData] = useState<StudyPackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setStudyPackData(null);
      setError(null);

      // Pre-configurar automaticamente para ENEM quando for trilha de estudo
      if (isStudyPath) {
        setFormData({
          segment: 'Ensino Médio',
          grade: '3º ano EM',
          subject: 'ENEM',
          themes: topic ? [topic] : ['Preparação Geral ENEM'],
          style_notes: 'Tom didático, com foco em revisão sistemática, exercícios progressivos e preparação para vestibular. Incluir dicas de estudo e estratégias para o exame.'
        });
      } else {
        setFormData(prev => ({
          ...prev,
          themes: topic ? [topic] : ['']
        }));
      }
    }
  }, [isOpen, topic, isStudyPath]);

  const handleGenerate = async () => {
    if (!formData.segment || !formData.grade || !formData.subject || !formData.themes.some(t => t.trim())) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setCurrentStep('generating');
    setIsLoading(true);
    setError(null);

    try {
      const themesJson = JSON.stringify(formData.themes.filter(t => t.trim()));

      const response = await fetch('/api/study-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'grok-4-fast',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'study_pack_with_exercises',
              schema: {
                type: 'object',
                required: ['metadata', 'content_blocks', 'answer_key'],
                properties: {
                  metadata: {
                    type: 'object',
                    required: ['segment', 'grade', 'subject', 'themes', 'language', 'length_hint'],
                    properties: {
                      segment: { type: 'string', description: 'Ex.: Fund. II, Ensino Médio, Técnico, Corporativo' },
                      grade: { type: 'string', description: 'Ano, série ou nível' },
                      subject: { type: 'string', description: 'Disciplina ou área de conhecimento' },
                      themes: { type: 'array', items: { type: 'string' }, description: 'Temas do conteúdo' },
                      language: { type: 'string', enum: ['pt-BR'] },
                      length_hint: { type: 'string', description: 'Tamanho estimado, ex.: 2 páginas A4 (~900–1200 palavras)' }
                    }
                  },
                  content_blocks: {
                    type: 'array',
                    description: 'Cada tema contém um resumo teórico e as questões correspondentes.',
                    items: {
                      type: 'object',
                      required: ['theme', 'summary', 'questions'],
                      properties: {
                        theme: { type: 'string' },
                        summary: {
                          type: 'string',
                          description: 'Resumo explicativo para estudo, 2–4 parágrafos, linguagem didática e coerente com o nível escolar.'
                        },
                        questions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            required: ['id', 'type', 'stem'],
                            properties: {
                              id: { type: 'string', description: 'Identificador único, ex.: T1-Q1' },
                              type: {
                                type: 'string',
                                enum: ['multipla_escolha', 'verdadeiro_falso', 'dissertativa_curta', 'completar']
                              },
                              stem: { type: 'string', description: 'Enunciado da questão' },
                              options: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Somente para múltipla escolha ou VF'
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  answer_key: {
                    type: 'array',
                    description: 'Lista de respostas corretas e explicações resumidas.',
                    items: {
                      type: 'object',
                      required: ['id', 'correct'],
                      properties: {
                        id: { type: 'string' },
                        correct: { type: 'string', description: 'Letra (a, b, c, d) ou resposta curta' },
                        explanation: { type: 'string', description: 'Breve justificativa (1–2 linhas)' }
                      }
                    }
                  }
                }
              }
            }
          },
          messages: [
            {
              role: 'system',
              content: 'Você é um gerador didático estruturado. Crie um material em português do Brasil, com linguagem clara e apropriada à série indicada. Cada tema deve ter um resumo teórico completo e perguntas variadas sobre ele. No final, inclua um gabarito com respostas corretas e justificativas breves. Respeite o formato JSON definido.'
            },
            {
              role: 'user',
              content: `Gere um conteúdo no formato de 2 páginas A4 (~1000 palavras) com resumo e perguntas sobre os temas indicados, seguido de um gabarito. Agrupe por tema. Varie os tipos de questão (múltipla escolha, VF, dissertativa curta, completar). Linguagem adequada ao segmento e série.

PARÂMETROS:
segmento: ${formData.segment}
série/ano: ${formData.grade}
disciplina: ${formData.subject}
temas: ${themesJson}
idioma: pt-BR
estilo: ${formData.style_notes}

Regras:
- Cada tema deve conter um resumo teórico e 3–5 questões.
- O gabarito vem apenas no final.
- IDs das questões no formato T{n}-Q{m}.
- Evite repetições e linguagem técnica excessiva.
- Entregue apenas o JSON no formato definido.`
            }
          ],
          input_placeholders: {
            segment: formData.segment,
            grade: formData.grade,
            subject: formData.subject,
            themes_json: themesJson,
            style_notes: formData.style_notes
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na geração do material');
      }

      const data = await response.json();
      setStudyPackData(data);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar material de estudo');
      setCurrentStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const addTheme = () => {
    setFormData(prev => ({ ...prev, themes: [...prev.themes, ''] }));
  };

  const updateTheme = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.map((theme, i) => i === index ? value : theme)
    }));
  };

  const removeTheme = (index: number) => {
    if (formData.themes.length > 1) {
      setFormData(prev => ({
        ...prev,
        themes: prev.themes.filter((_, i) => i !== index)
      }));
    }
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isStudyPath ? <Target className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isStudyPath ? 'Gerar Trilha de Estudo ENEM' : 'Gerar Material de Estudo'}
        </h2>
        <p className="text-gray-600">
          {isStudyPath
            ? 'Crie uma trilha completa de preparação para o ENEM com material estruturado'
            : 'Crie resumos e questões personalizadas para seus estudos'
          }
        </p>
        {isStudyPath && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">🎯 Pré-configurado para ENEM</p>
            <p className="text-blue-700 text-sm">O formulário já está otimizado para preparação vestibular</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="segment">Segmento *</Label>
          <Select value={formData.segment} onValueChange={(value) => setFormData(prev => ({ ...prev, segment: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o segmento" />
            </SelectTrigger>
            <SelectContent>
              {SEGMENTS.map(segment => (
                <SelectItem key={segment} value={segment}>{segment}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Série/Ano *</Label>
          <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a série" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map(grade => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="subject">Disciplina *</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Temas *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTheme}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            + Adicionar Tema
          </Button>
        </div>

        {formData.themes.map((theme, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Tema ${index + 1}`}
              value={theme}
              onChange={(e) => updateTheme(index, e.target.value)}
              className="flex-1"
            />
            {formData.themes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTheme(index)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="style_notes">Notas de Estilo</Label>
        <Textarea
          id="style_notes"
          placeholder="Ex.: Tom didático, exemplos simples, vocabulário acessível..."
          value={formData.style_notes}
          onChange={(e) => setFormData(prev => ({ ...prev, style_notes: e.target.value }))}
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={handleGenerate}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Material
        </Button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Gerando Material de Estudo</h3>
      <p className="text-gray-600 mb-6">Aguarde enquanto criamos seu conteúdo personalizado...</p>
      <div className="flex justify-center">
        <div className="animate-pulse flex space-x-1">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!studyPackData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Material Gerado com Sucesso!</h2>
          <p className="text-gray-600">Confira seu material de estudo personalizado</p>
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações do Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Segmento:</span>
                <p className="text-gray-900">{studyPackData.metadata.segment}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Série:</span>
                <p className="text-gray-900">{studyPackData.metadata.grade}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Disciplina:</span>
                <p className="text-gray-900">{studyPackData.metadata.subject}</p>
              </div>
              <div className="md:col-span-3">
                <span className="font-medium text-gray-600">Temas:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {studyPackData.metadata.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary">{theme}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Blocks */}
        {studyPackData.content_blocks.map((block, blockIndex) => (
          <Card key={blockIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {block.theme}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Resumo Teórico
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {block.summary.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Questions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Questões
                </h4>
                <div className="space-y-4">
                  {block.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">
                          {question.id}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{question.stem}</p>

                          {question.type === 'multipla_escolha' && question.options && (
                            <div className="space-y-1 ml-4">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600 w-4">
                                    {String.fromCharCode(97 + oIndex)}.
                                  </span>
                                  <span className="text-sm text-gray-700">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === 'verdadeiro_falso' && (
                            <div className="ml-4 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-4">a.</span>
                                <span className="text-sm text-gray-700">Verdadeiro</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-4">b.</span>
                                <span className="text-sm text-gray-700">Falso</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Answer Key */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Award className="w-5 h-5" />
              Gabarito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyPackData.answer_key.map((answer, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <Badge variant="outline" className="mt-1 border-green-300 text-green-700">
                    {answer.id}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-800">Resposta:</span>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        {answer.correct}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{answer.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('form')} className="flex-1">
            Gerar Novo Material
          </Button>
          <Button onClick={onClose} className="flex-1">
            Fechar
          </Button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Material de Estudo Personalizado</h1>
              <p className="text-sm opacity-90">IA gerando conteúdo educacional</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentStep === 'form' && renderForm()}
          {currentStep === 'generating' && renderGenerating()}
          {currentStep === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
}
