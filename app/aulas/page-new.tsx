"use client";

'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookOpen, Clock, Image, Target } from 'lucide-react';
import { toast } from 'sonner';

interface LessonMetadata {
  duration: {
    sync: number;
    async: number;
  };
  content: {
    totalTokens: number;
    totalWords: number;
    averageTokensPerSlide: number;
  };
  quality: {
    score: number;
    validSlides: number;
    totalSlides: number;
  };
  images: {
    count: number;
    estimatedSizeMB: number;
  };
}

interface GeneratedLesson {
  id: string;
  title: string;
  subject: string;
  level: string;
  estimatedDuration: number;
  objective: string;
  slides: Array<{
    number: number;
    type: string;
    card1: {
      title: string;
      content: string;
    };
    card2?: {
      title: string;
      content: string;
      imageUrl?: string;
      imageAlt?: string;
    };
    options?: string[];
    correctOption?: number;
    helpMessage?: string;
    correctAnswer?: string;
  }>;
  metadata: {
    subject: string;
    grade: string;
    duration: string;
    difficulty: string;
    tags: string[];
  };
}

export default function AulasPage() {
  const [topic_226, setTopic] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [mode, setMode] = useState('sync');
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [metadata, setMetadata] = useState<LessonMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const generateLesson = async () => {
    if (!topic_226.trim()) {
      toast.error('Digite um tópico para a aula');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/aulas/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'demo-token'}`
        },
        body: JSON.stringify({ topic_226, schoolId, mode })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Erro na geração da aula');
      }
      
      const data = await res.json();
      
      if (data.success && data.lesson) {
        setLesson(data.lesson);
        setMetadata(data.metadata);
        toast.success('Aula gerada com sucesso!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error(`Erro ao gerar aula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = () => {
    if (lesson) {
      // Salvar no localStorage para navegação
      localStorage.setItem(`lesson_${lesson.id}`, JSON.stringify(lesson));
      window.location.href = `/aulas/${lesson.id}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Gerando aula...</h2>
          <p className="text-gray-600">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-blue-600" />
            Gerador de Aulas Inteligente
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Crie aulas completas de 45-55 minutos com pacing profissional, 
            imagens otimizadas e conteúdo validado por IA
          </p>
        </div>

        {/* Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Configurações da Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tópico da Aula *</label>
                <Input
                  type="text"
                  placeholder="Ex: Fotossíntese, Equações Quadráticas, Revolução Francesa"
                  value={topic_226}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ID da Escola</label>
                <Input
                  type="text"
                  placeholder="Opcional - para prompts customizados"
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Modo da Aula</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sync">Síncrono (45-55 min)</SelectItem>
                    <SelectItem value="async">Assíncrono (30-40 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={generateLesson} 
              disabled={!topic_226.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Gerar Aula Completa
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {lesson && metadata && (
          <div className="space-y-6">
            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-600" />
                  Métricas da Aula Gerada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-1" />
                      <span className="text-sm font-medium">Duração</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {metadata.duration.sync}min
                    </div>
                    <div className="text-xs text-gray-500">
                      ({metadata.duration.async}min assíncrono)
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-sm font-medium">Conteúdo</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {metadata.content.totalWords.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      palavras ({metadata.content.totalTokens} tokens)
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-purple-600 mr-1" />
                      <span className="text-sm font-medium">Qualidade</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {metadata.quality.score}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {metadata.quality.validSlides}/{metadata.quality.totalSlides} slides válidos
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Image className="h-5 w-5 text-orange-600 mr-1"  />
                      <span className="text-sm font-medium">Imagens</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {metadata.images.count}
                    </div>
                    <div className="text-xs text-gray-500">
                      ~{metadata.images.estimatedSizeMB} MB
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    {lesson.title}
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{lesson.subject}</Badge>
                    <Badge variant="outline">{lesson.level}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Objetivos de Aprendizagem:</h4>
                  <p className="text-sm text-gray-600">{lesson.objective}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Estrutura da Aula ({lesson.slides.length} slides):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lesson.slides.map((slide, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {slide.number}
                          </div>
                          <Badge variant={slide.type === 'question' ? 'destructive' : slide.type === 'closing' ? 'secondary' : 'default'}>
                            {slide.type === 'question' ? 'Quiz' : slide.type === 'closing' ? 'Encerramento' : 'Conteúdo'}
                          </Badge>
                        </div>
                        <h5 className="font-medium text-sm mb-1">{slide.card1.title}</h5>
                        <p className="text-xs text-gray-600 line-clamp-2">{slide.card1.content.substring(0, 100)}...</p>
                        {slide.card2?.imageUrl && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <Image className="h-3 w-3"  />
                            <span>Imagem incluída</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={startLesson} className="flex-1 bg-green-600 hover:bg-green-700">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Iniciar Aula
                  </Button>
                  <Button
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(lesson, null, 2));
                      toast.success('Aula copiada para a área de transferência');
                    }}
                  >
                    Copiar JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Recursos Implementados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Pacing Profissional</h3>
                    <p className="text-sm text-gray-600">
                      45-55 min síncrono ou 30-40 min assíncrono com microtarefas e pausas estratégicas
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Image className="h-6 w-6 text-green-600"  />
                    </div>
                    <h3 className="font-semibold mb-2">Imagens Otimizadas</h3>
                    <p className="text-sm text-gray-600">
                      Apenas primeiro e último slide com Unsplash, cache e lazy-loading
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Validação Robusta</h3>
                    <p className="text-sm text-gray-600">
                      JSON sanitizado, validação Zod e mínimo 500 tokens por slide
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!lesson && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Pronto para gerar sua primeira aula?</h3>
              <p className="text-gray-600 mb-6">
                Digite um tópico acima e clique em &quot;Gerar Aula Completa&quot; para começar
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>✅ Pacing profissional de 45-55 minutos</p>
                <p>✅ Imagens otimizadas do Unsplash</p>
                <p>✅ Validação robusta com Zod</p>
                <p>✅ JSON sanitizado sem erros</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
