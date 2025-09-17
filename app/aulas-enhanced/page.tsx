'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Target, 
  Users, 
  Clock, 
  BarChart3, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface GeneratedLesson {
  topic: string;
  mode: string;
  slides: Array<{
    number: number;
    title: string;
    content: string;
    type: 'content' | 'quiz' | 'closing';
    imageQuery: string;
    image?: {
      url: string;
      alt: string;
      sizeEstimate: string;
      photographer: string;
      photographerUrl: string;
    };
  }>;
  metrics: {
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
  };
  validation: {
    isValid: boolean;
    issues: string[];
    recommendations: Array<{
      type: 'warning' | 'info' | 'success';
      message: string;
    }>;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costEstimate: string;
  };
}

interface FormData {
  topic: string;
  schoolId: string;
  mode: 'sync' | 'async';
  customPrompt: string;
}

// Componente para exibir métricas detalhadas
const MetricsDisplay = ({ metrics, validation, usage }: { 
  metrics: GeneratedLesson['metrics'], 
  validation: GeneratedLesson['validation'],
  usage: GeneratedLesson['usage']
}) => {
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Duração</p>
                <p className="text-lg font-bold">
                  {metrics.duration.sync} min (síncrono)
                </p>
                <p className="text-sm text-gray-500">
                  {metrics.duration.async} min (assíncrono)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Conteúdo</p>
                <p className="text-lg font-bold">
                  {metrics.content.totalTokens.toLocaleString()} tokens
                </p>
                <p className="text-sm text-gray-500">
                  {metrics.content.totalWords.toLocaleString()} palavras
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Qualidade</p>
                <p className="text-lg font-bold">
                  {metrics.quality.score}%
                </p>
                <p className="text-sm text-gray-500">
                  {metrics.quality.validSlides}/{metrics.quality.totalSlides} slides válidos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validação e Recomendações */}
      {!validation.isValid && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-medium text-red-800 mb-2">⚠️ Problemas Detectados:</div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {validation.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.recommendations.length > 0 && (
        <div className="space-y-2">
          {validation.recommendations.map((rec, index) => (
            <Alert key={index} className={
              rec.type === 'success' ? 'border-green-200 bg-green-50' :
              rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              {rec.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               rec.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
               <Info className="h-4 w-4 text-blue-600" />}
              <AlertDescription className={
                rec.type === 'success' ? 'text-green-800' :
                rec.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }>
                {rec.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Informações de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📊 Informações de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Tokens utilizados:</span>
              <span className="ml-2">{usage.totalTokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Custo estimado:</span>
              <span className="ml-2">R$ {usage.costEstimate}</span>
            </div>
            <div>
              <span className="font-medium">Imagens:</span>
              <span className="ml-2">{metrics.images.count} (~{metrics.images.estimatedSizeMB} MB)</span>
            </div>
            <div>
              <span className="font-medium">Média por slide:</span>
              <span className="ml-2">{metrics.content.averageTokensPerSlide} tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para exibir slide individual
const SlidePreview = ({ slide, index }: { slide: GeneratedLesson['slides'][0], index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">{slide.number}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{slide.title}</CardTitle>
              <CardDescription>
                <Badge variant="secondary" className="mr-2">
                  {slide.type === 'quiz' ? 'Quiz' : slide.type === 'closing' ? 'Encerramento' : 'Conteúdo'}
                </Badge>
                {slide.imageQuery && (
                  <Badge variant="outline" className="mr-2">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Imagem
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{slide.content}</p>
            </div>
            
            {slide.image && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img 
                  src={slide.image.url} 
                  alt={slide.image.alt}
                  className="w-full h-auto rounded-lg shadow-sm"
                  loading="lazy"
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p>📸 Foto por <a href={slide.image.photographerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{slide.image.photographer}</a></p>
                  <p>🔗 <a href={slide.image.photographerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver no Unsplash</a></p>
                </div>
              </div>
            )}
            
            {slide.imageQuery && !slide.image && (
              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  🔍 Query de imagem: "{slide.imageQuery}"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function AulasEnhanced() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    schoolId: '',
    mode: 'sync',
    customPrompt: ''
  });
  
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = async () => {
    if (!formData.topic.trim()) {
      toast.error('Por favor, digite um tópico para a aula');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Gerando aula:', formData);
      
      const response = await fetch('/api/aulas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na geração da aula');
      }
      
      const data = await response.json();
      setLesson(data);
      
      toast.success('Aula gerada com sucesso!');
      console.log('✅ Aula gerada:', data);
      
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao gerar aula. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = () => {
    if (!lesson) return;
    
    // Salvar no localStorage para modo demo
    localStorage.setItem(`demo_lesson_${Date.now()}`, JSON.stringify(lesson));
    
    // Navegar para a aula
    window.location.href = `/aulas/${Date.now()}`;
  };

  const handleDownloadLesson = () => {
    if (!lesson) return;
    
    const dataStr = JSON.stringify(lesson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aula-${lesson.topic.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Aula baixada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Gerador de Aulas Profissionais
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie aulas estruturadas de 45-60 minutos com pacing otimizado, 
            imagens educacionais e métricas precisas de qualidade.
          </p>
        </div>

        {/* Formulário */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Configuração da Aula
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para gerar uma aula personalizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Tópico da Aula *</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Fotossíntese, Equações Quadráticas, Revolução Francesa"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="schoolId">ID da Escola</Label>
                  <Input
                    id="schoolId"
                    placeholder="Opcional: ID da escola para prompts customizados"
                    value={formData.schoolId}
                    onChange={(e) => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mode">Modo da Aula</Label>
                  <Select
                    value={formData.mode}
                    onValueChange={(value: 'sync' | 'async') => setFormData(prev => ({ ...prev, mode: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sync">Síncrono (Professor conduzindo)</SelectItem>
                      <SelectItem value="async">Assíncrono (Autoestudo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="customPrompt">Prompt Customizado</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Opcional: Instruções específicas para a IA"
                    value={formData.customPrompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={generateLesson}
                disabled={loading || !formData.topic.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando Aula...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Aula Profissional
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Gerando sua aula...</h3>
              <p className="text-gray-600">
                Criando conteúdo educacional, buscando imagens e calculando métricas de qualidade.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-1">Erro na geração da aula</div>
              <div className="text-sm">{error}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Lesson Preview */}
        {lesson && !loading && (
          <div className="space-y-8">
            {/* Métricas */}
            <MetricsDisplay 
              metrics={lesson.metrics} 
              validation={lesson.validation}
              usage={lesson.usage}
            />

            {/* Ações */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleStartLesson}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Aula
                  </Button>
                  <Button 
                    onClick={handleDownloadLesson}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar JSON
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Slides Preview */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Preview da Aula: {lesson.topic}
              </h2>
              
              <div className="space-y-4">
                {lesson.slides.map((slide, index) => (
                  <SlidePreview key={index} slide={slide} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!lesson && !loading && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pronto para criar sua primeira aula?
              </h3>
              <p className="text-gray-600 mb-6">
                Digite um tópico acima e clique em "Gerar Aula Profissional" para começar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>9 slides estruturados</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>500+ tokens por slide</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Imagens educacionais</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
