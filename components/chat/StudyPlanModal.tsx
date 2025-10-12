'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Target, FileText, CheckCircle, Loader2, Sparkles, Brain, GraduationCap, Users, Award, Clock, Download, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StudyPlanData {
  metadata: {
    student_name: string;
    profile: string;
    period: string;
    weekly_hours: number;
    target_score: string;
    focus_area: string;
    exam_date: string;
    current_level: string;
  };
  phases: Array<{
    phase_number: number;
    phase_name: string;
    duration_weeks: number;
    objectives: string[];
    modules: Array<{
      module_name: string;
      weekly_hours: number;
      topics: string[];
      resources: Array<{
        type: string;
        title: string;
        description: string;
        link?: string;
      }>;
      activities: Array<{
        type: string;
        description: string;
        frequency: string;
      }>;
    }>;
  }>;
  weekly_schedule: {
    monday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    tuesday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    wednesday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    thursday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    friday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    saturday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
    sunday: Array<{ time: string; activity: string; subject: string; duration: string; }>;
  };
  assessment_plan: {
    weekly_quiz: boolean;
    monthly_simulado: boolean;
    progress_tracking: string[];
    adjustment_criteria: string[];
  };
  contingency_plan: {
    behind_schedule: string[];
    struggling_topics: string[];
    motivation_issues: string[];
    technical_issues: string[];
  };
}

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
  className?: string;
}

const PROFILES = [
  'Iniciante - Nunca estudei sistematicamente',
  'Intermediário - Já fiz alguns simulados',
  'Avançado - Quero maximizar minha pontuação',
  'Intensivo - Tenho pouco tempo (1-3 meses)',
  'Estendido - Preparação completa (6-12 meses)',
  'Especializado - Foco em área específica'
];

const FOCUS_AREAS = [
  'Geral - Todas as áreas',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática',
  'Linguagens',
  'Redação'
];

const LEARNING_STYLES = [
  'Visual - Prefiro mapas, gráficos e imagens',
  'Auditivo - Aprendo melhor ouvindo',
  'Cinestésico - Preciso praticar fazendo',
  'Leitura/Escrita - Aprendo lendo e escrevendo'
];

const CURRENT_LEVELS = [
  '1 - Conhecimentos básicos',
  '2 - Conhecimentos elementares',
  '3 - Conhecimentos satisfatórios',
  '4 - Conhecimentos bons',
  '5 - Conhecimentos muito bons',
  '6 - Conhecimentos excelentes',
  '7 - Conhecimentos diferenciados'
];

export function StudyPlanModal({ isOpen, onClose, topic = '', className = '' }: StudyPlanModalProps) {
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'results'>('form');
  const [formData, setFormData] = useState({
    student_name: '',
    profile: '',
    duration_months: '6',
    focus_area: 'Geral - Todas as áreas',
    hours_per_week: '20',
    exam_date: '',
    current_level: '',
    target_score: '700',
    learning_style: 'Visual - Prefiro mapas, gráficos e imagens',
    additional_notes: 'Quero uma preparação completa e equilibrada'
  });
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setStudyPlanData(null);
      setError(null);
      setTimer(0);
      setIsTimerRunning(false);
      if (topic) {
        setFormData(prev => ({ ...prev, focus_area: topic }));
      }
    }
  }, [isOpen, topic]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!formData.student_name || !formData.profile || !formData.exam_date) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setCurrentStep('generating');
    setIsLoading(true);
    setError(null);
    setTimer(0);
    setIsTimerRunning(true);

    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'grok-4-fast',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'study_plan_enem',
              schema: {
                type: 'object',
                required: ['metadata', 'phases', 'weekly_schedule', 'assessment_plan', 'contingency_plan'],
                properties: {
                  metadata: {
                    type: 'object',
                    required: ['student_name', 'profile', 'period', 'weekly_hours', 'target_score', 'focus_area', 'exam_date', 'current_level'],
                    properties: {
                      student_name: { type: 'string' },
                      profile: { type: 'string' },
                      period: { type: 'string' },
                      weekly_hours: { type: 'number' },
                      target_score: { type: 'string' },
                      focus_area: { type: 'string' },
                      exam_date: { type: 'string' },
                      current_level: { type: 'string' }
                    }
                  },
                  phases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['phase_number', 'phase_name', 'duration_weeks', 'objectives', 'modules'],
                      properties: {
                        phase_number: { type: 'number' },
                        phase_name: { type: 'string' },
                        duration_weeks: { type: 'number' },
                        objectives: { type: 'array', items: { type: 'string' } },
                        modules: {
                          type: 'array',
                          items: {
                            type: 'object',
                            required: ['module_name', 'weekly_hours', 'topics', 'resources', 'activities'],
                            properties: {
                              module_name: { type: 'string' },
                              weekly_hours: { type: 'number' },
                              topics: { type: 'array', items: { type: 'string' } },
                              resources: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  required: ['type', 'title', 'description'],
                                  properties: {
                                    type: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    link: { type: 'string' }
                                  }
                                }
                              },
                              activities: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  required: ['type', 'description', 'frequency'],
                                  properties: {
                                    type: { type: 'string' },
                                    description: { type: 'string' },
                                    frequency: { type: 'string' }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  weekly_schedule: {
                    type: 'object',
                    required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    properties: {
                      monday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      tuesday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      wednesday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      thursday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      friday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      saturday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } },
                      sunday: { type: 'array', items: { type: 'object', required: ['time', 'activity', 'subject', 'duration'], properties: { time: { type: 'string' }, activity: { type: 'string' }, subject: { type: 'string' }, duration: { type: 'string' } } } }
                    }
                  },
                  assessment_plan: {
                    type: 'object',
                    required: ['weekly_quiz', 'monthly_simulado', 'progress_tracking', 'adjustment_criteria'],
                    properties: {
                      weekly_quiz: { type: 'boolean' },
                      monthly_simulado: { type: 'boolean' },
                      progress_tracking: { type: 'array', items: { type: 'string' } },
                      adjustment_criteria: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  contingency_plan: {
                    type: 'object',
                    required: ['behind_schedule', 'struggling_topics', 'motivation_issues', 'technical_issues'],
                    properties: {
                      behind_schedule: { type: 'array', items: { type: 'string' } },
                      struggling_topics: { type: 'array', items: { type: 'string' } },
                      motivation_issues: { type: 'array', items: { type: 'string' } },
                      technical_issues: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          },
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em planejamento educacional e preparação para o ENEM. Crie trilhas de estudo cientificamente fundamentadas, altamente personalizáveis e orientadas a resultados. Use apenas português do Brasil e siga rigorosamente o formato JSON definido.`
            },
            {
              role: 'user',
              content: `Gere uma TRILHA DE ESTUDO PERSONALIZADA PARA O ENEM completa e detalhada baseada nestes parâmetros:

=== PERFIL DO ALUNO ===
Nome: ${formData.student_name}
Perfil: ${formData.profile}
Duração: ${formData.duration_months} meses
Área de foco: ${formData.focus_area}
Horas semanais: ${formData.hours_per_week}
Data da prova: ${formData.exam_date}
Nível atual: ${formData.current_level}
Nota alvo: ${formData.target_score}
Estilo de aprendizagem: ${formData.learning_style}
Observações: ${formData.additional_notes}

INSTRUÇÕES OBRIGATÓRIAS:
1. Use o prompt profissional de geração de trilhas de estudo ENEM fornecido
2. Crie uma estrutura completa com 4-6 fases dependendo da duração
3. Inclua cronograma semanal detalhado e realista
4. Foque em pedagogia baseada em evidências científicas
5. Mantenha equilíbrio teoria/prática (40/60)
6. Inclua estratégias metacognitivas e gestão de ansiedade
7. Forneça alternativas para diferentes estilos de aprendizagem
8. Entregue apenas o JSON no formato exato definido

IMPORTANTE: Gere uma trilha REALISTA e EXECUTÁVEL baseada nos parâmetros fornecidos.`
            }
          ],
          input_placeholders: {
            profile: formData.profile,
            duration: `${formData.duration_months} meses`,
            focus_area: formData.focus_area,
            hours_per_week: formData.hours_per_week,
            exam_date: formData.exam_date,
            current_level: formData.current_level,
            target_score: formData.target_score,
            learning_style: formData.learning_style
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na geração da trilha');
      }

      const data = await response.json();
      setStudyPlanData(data);
      setCurrentStep('results');
      setIsTimerRunning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar trilha de estudo');
      setCurrentStep('form');
      setIsTimerRunning(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!studyPlanData) return;

    const content = generatePlanText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trilha-estudo-enem-${studyPlanData.metadata.student_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePlanText = () => {
    if (!studyPlanData) return '';

    let content = `TRILHA DE ESTUDO PERSONALIZADA ENEM\n\n`;
    content += `ALUNO: ${studyPlanData.metadata.student_name}\n`;
    content += `PERFIL: ${studyPlanData.metadata.profile}\n`;
    content += `PERÍODO: ${studyPlanData.metadata.period}\n`;
    content += `HORAS SEMANAIS: ${studyPlanData.metadata.weekly_hours}\n`;
    content += `NOTA ALVO: ${studyPlanData.metadata.target_score}\n`;
    content += `DATA DA PROVA: ${studyPlanData.metadata.exam_date}\n\n`;

    studyPlanData.phases.forEach(phase => {
      content += `FASE ${phase.phase_number}: ${phase.phase_name}\n`;
      content += `DURAÇÃO: ${phase.duration_weeks} semanas\n\n`;
      content += `OBJETIVOS:\n`;
      phase.objectives.forEach(obj => content += `- ${obj}\n`);
      content += `\n`;

      phase.modules.forEach(module => {
        content += `MÓDULO: ${module.module_name}\n`;
        content += `HORAS SEMANAIS: ${module.weekly_hours}\n\n`;
        content += `TÓPICOS:\n`;
        module.topics.forEach(topic => content += `- ${topic}\n`);
        content += `\n`;

        content += `RECURSOS:\n`;
        module.resources.forEach(resource => {
          content += `- ${resource.title}: ${resource.description}\n`;
          if (resource.link) content += `  Link: ${resource.link}\n`;
        });
        content += `\n`;

        content += `ATIVIDADES:\n`;
        module.activities.forEach(activity => {
          content += `- ${activity.type}: ${activity.description} (${activity.frequency})\n`;
        });
        content += `\n`;
      });
    });

    content += `CRONOGRAMA SEMANAL:\n`;
    Object.entries(studyPlanData.weekly_schedule).forEach(([day, activities]) => {
      content += `${day.toUpperCase()}:\n`;
      activities.forEach(activity => {
        content += `- ${activity.time}: ${activity.activity} (${activity.subject}) - ${activity.duration}\n`;
      });
      content += `\n`;
    });

    return content;
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerar Trilha de Estudos ENEM</h2>
        <p className="text-gray-600">Crie uma trilha personalizada com IA Grok 4 Fast</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student_name">Nome do Aluno *</Label>
          <Input
            id="student_name"
            placeholder="Seu nome completo"
            value={formData.student_name}
            onChange={(e) => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam_date">Data da Prova ENEM *</Label>
          <Input
            id="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={(e) => setFormData(prev => ({ ...prev, exam_date: e.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="profile">Perfil do Aluno *</Label>
          <Select value={formData.profile} onValueChange={(value) => setFormData(prev => ({ ...prev, profile: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu perfil" />
            </SelectTrigger>
            <SelectContent>
              {PROFILES.map(profile => (
                <SelectItem key={profile} value={profile}>{profile}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="focus_area">Área de Foco</Label>
          <Select value={formData.focus_area} onValueChange={(value) => setFormData(prev => ({ ...prev, focus_area: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a área de foco" />
            </SelectTrigger>
            <SelectContent>
              {FOCUS_AREAS.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_level">Nível Atual (1-7)</Label>
          <Select value={formData.current_level} onValueChange={(value) => setFormData(prev => ({ ...prev, current_level: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu nível atual" />
            </SelectTrigger>
            <SelectContent>
              {CURRENT_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_months">Duração (meses)</Label>
          <Select value={formData.duration_months} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_months: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a duração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 mês (intensivo)</SelectItem>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="9">9 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours_per_week">Horas por Semana</Label>
          <Select value={formData.hours_per_week} onValueChange={(value) => setFormData(prev => ({ ...prev, hours_per_week: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Horas disponíveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 horas</SelectItem>
              <SelectItem value="15">15 horas</SelectItem>
              <SelectItem value="20">20 horas</SelectItem>
              <SelectItem value="25">25 horas</SelectItem>
              <SelectItem value="30">30 horas</SelectItem>
              <SelectItem value="40">40+ horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_score">Nota Alvo</Label>
          <Input
            id="target_score"
            placeholder="Ex: 700, 850, etc"
            value={formData.target_score}
            onChange={(e) => setFormData(prev => ({ ...prev, target_score: e.target.value }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="learning_style">Estilo de Aprendizagem</Label>
          <Select value={formData.learning_style} onValueChange={(value) => setFormData(prev => ({ ...prev, learning_style: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Como você aprende melhor?" />
            </SelectTrigger>
            <SelectContent>
              {LEARNING_STYLES.map(style => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Observações Adicionais</Label>
        <Textarea
          id="additional_notes"
          placeholder="Conteúdo específico de interesse, dificuldades, restrições de tempo, etc."
          value={formData.additional_notes}
          onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
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
          Gerar Trilha com IA
        </Button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Gerando Trilha de Estudos</h3>
      <p className="text-gray-600 mb-6">IA Grok 4 Fast criando sua trilha personalizada...</p>

      {/* Timer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg">{formatTime(timer)}</span>
        </div>
        <p className="text-sm text-blue-600 mt-1">Tempo de geração</p>
      </div>

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
    if (!studyPlanData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trilha Gerada com Sucesso!</h2>
          <p className="text-gray-600">Sua trilha personalizada está pronta</p>

          {/* Timer result */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">Gerado em {formatTime(timer)}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações da Trilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Aluno:</span>
                <p className="text-gray-900">{studyPlanData.metadata.student_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Perfil:</span>
                <p className="text-gray-900">{studyPlanData.metadata.profile}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Período:</span>
                <p className="text-gray-900">{studyPlanData.metadata.period}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Horas/Semana:</span>
                <p className="text-gray-900">{studyPlanData.metadata.weekly_hours}h</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nota Alvo:</span>
                <p className="text-gray-900">{studyPlanData.metadata.target_score}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Data da Prova:</span>
                <p className="text-gray-900">{studyPlanData.metadata.exam_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        {studyPlanData.phases.map((phase, phaseIndex) => (
          <Card key={phaseIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Fase {phase.phase_number}: {phase.phase_name}
                <Badge variant="outline" className="ml-auto">
                  {phase.duration_weeks} semanas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Objetivos</h4>
                <ul className="space-y-2">
                  {phase.objectives.map((objective, objIndex) => (
                    <li key={objIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {phase.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">{module.module_name}</h5>
                    <Badge variant="secondary">{module.weekly_hours}h/semana</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Tópicos</h6>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Recursos</h6>
                      <div className="space-y-2">
                        {module.resources.map((resource, resIndex) => (
                          <div key={resIndex} className="bg-gray-50 rounded p-3">
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {resource.type}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{resource.title}</p>
                                <p className="text-xs text-gray-600">{resource.description}</p>
                                {resource.link && (
                                  <a href={resource.link} target="_blank" rel="noopener noreferrer"
                                     className="text-xs text-blue-600 hover:underline">
                                    Ver recurso →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Atividades</h6>
                      <div className="space-y-2">
                        {module.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{activity.type}</p>
                              <p className="text-xs text-gray-600">{activity.description}</p>
                              <p className="text-xs text-blue-600">{activity.frequency}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cronograma Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(studyPlanData.weekly_schedule).map(([day, activities]) => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                    {day === 'monday' ? 'Segunda' :
                     day === 'tuesday' ? 'Terça' :
                     day === 'wednesday' ? 'Quarta' :
                     day === 'thursday' ? 'Quinta' :
                     day === 'friday' ? 'Sexta' :
                     day === 'saturday' ? 'Sábado' : 'Domingo'}
                  </h4>
                  <div className="space-y-2">
                    {activities.map((activity, actIndex) => (
                      <div key={actIndex} className="bg-gray-50 rounded p-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-xs text-gray-600">{activity.time}</span>
                          <span className="text-xs text-blue-600">{activity.duration}</span>
                        </div>
                        <p className="text-sm font-medium">{activity.activity}</p>
                        <p className="text-xs text-gray-600">{activity.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Plan */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="w-5 h-5" />
              Plano de Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Avaliações</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={studyPlanData.assessment_plan.weekly_quiz} readOnly className="rounded" />
                    <span className="text-sm">Quiz semanal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={studyPlanData.assessment_plan.monthly_simulado} readOnly className="rounded" />
                    <span className="text-sm">Simulado mensal</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Acompanhamento</h4>
                <ul className="text-sm space-y-1">
                  {studyPlanData.assessment_plan.progress_tracking.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setCurrentStep('form')} className="flex-1">
            Gerar Nova Trilha
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
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
      <div className={`bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl ${className}`}>
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Trilha de Estudos ENEM Personalizada</h1>
              <p className="text-sm opacity-90">IA Grok 4 Fast • Timer • Download</p>
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
