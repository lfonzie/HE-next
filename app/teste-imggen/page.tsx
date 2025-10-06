'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Star,
  Shield,
  Brain,
  Zap,
  Wand2,
  Palette,
  Download,
  RefreshCw
} from 'lucide-react';

interface GeneratedImage {
  url: string;
  prompt: string;
  type: string;
  style: string;
  description: string;
  generationTime: number;
  success: boolean;
  error?: string;
}

interface TestResult {
  success: boolean;
  topic: string;
  subject?: string;
  totalImagesGenerated: number;
  successfulImages: GeneratedImage[];
  failedImages: { image: GeneratedImage; reason: string }[];
  generationTime: number;
  averageGenerationTime: number;
  recommendations: string[];
  errors?: string[];
  aiProcessing?: {
    originalTopic: string;
    correctedQuery: string;
    extractedTheme: string;
    translatedTheme: string;
    confidence: number;
    corrections: string[];
    language: string;
    processingTime: number;
  };
  imageStrategy?: {
    type: string;
    style: string;
    reasoning: string;
    context: string;
  };
}

export default function TesteImgGenPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/teste-imggen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // Se for uma imagem base64, criar blob diretamente
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Para URLs externas, usar fetch normal
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      // Fallback: abrir imagem em nova aba
      window.open(imageUrl, '_blank');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      diagram: 'bg-blue-100 text-blue-800',
      illustration: 'bg-green-100 text-green-800',
      chart: 'bg-purple-100 text-purple-800',
      infographic: 'bg-orange-100 text-orange-800',
      photo: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
      educational: 'bg-blue-100 text-blue-800',
      scientific: 'bg-green-100 text-green-800',
      artistic: 'bg-purple-100 text-purple-800',
      modern: 'bg-orange-100 text-orange-800',
      classic: 'bg-gray-100 text-gray-800',
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-purple-600" />
          Teste de Geração de Imagens Puras - Google Gemini 2.5 Flash
        </h1>
        <p className="text-gray-600">
          Teste o sistema de geração de imagens educacionais puras (sem texto) usando Google Gemini 2.5 Flash
        </p>
      </div>

      {/* Formulário de Geração */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Gerar Imagens Educacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Digite o que você quer ver (ex: como funciona a fotossíntese, o que é gravidade, revolução francesa)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !query.trim()}
                className="min-w-[160px] text-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Criar Imagem
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>🤖 IA Inteligente:</strong> Apenas digite o que você quer ver! A IA decide automaticamente o melhor tipo de imagem (diagrama, ilustração, gráfico) e estilo (educacional, científico, artístico) baseado no seu tema. <strong>🎨 Imagens puras:</strong> sem texto, apenas elementos visuais!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <div>
                <p className="font-medium">Gerando imagens com Gemini 2.5 Flash...</p>
                <p className="text-sm text-gray-600">
                  Processando prompt, conectando com Google AI, gerando imagens...
                </p>
              </div>
            </div>
            <Progress value={85} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro na geração:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {result && (
        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resultados da Geração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.totalImagesGenerated}</div>
                  <div className="text-sm text-gray-600">Total Geradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.successfulImages.length}</div>
                  <div className="text-sm text-gray-600">Sucesso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.failedImages.length}</div>
                  <div className="text-sm text-gray-600">Falharam</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.averageGenerationTime}ms</div>
                  <div className="text-sm text-gray-600">Tempo Médio</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-gray-600">
                  Tempo Total: {result.generationTime}ms
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estratégia de Imagem Escolhida pela IA */}
          {result.imageStrategy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Estratégia de Imagem Escolhida pela IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {result.imageStrategy.type.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">Tipo de Imagem</div>
                    <Badge className={getTypeColor(result.imageStrategy.type)}>
                      {result.imageStrategy.type}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {result.imageStrategy.style.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">Estilo</div>
                    <Badge className={getStyleColor(result.imageStrategy.style)}>
                      {result.imageStrategy.style}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600 mb-2">
                      🎯
                    </div>
                    <div className="text-sm text-gray-600">Contexto</div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      {result.imageStrategy.context}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 mb-2">
                      🤖 IA
                    </div>
                    <div className="text-sm text-gray-600">Decisão Automática</div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Inteligente
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">🧠 Raciocínio da IA:</h4>
                  <p className="text-sm text-yellow-700">{result.imageStrategy.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processamento com IA */}
          {result.aiProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Processamento Inteligente com IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Análise e Correção</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Original:</span>
                        <p className="text-gray-800">{result.aiProcessing.originalTopic}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Corrigido:</span>
                        <p className="text-blue-600 font-medium">{result.aiProcessing.correctedQuery}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tema Extraído:</span>
                        <p className="text-green-600 font-medium">{result.aiProcessing.extractedTheme}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Traduzido para Inglês:</span>
                        <p className="text-purple-600 font-medium">{result.aiProcessing.translatedTheme}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Confiança:</span>
                        <Badge variant={result.aiProcessing.confidence >= 80 ? 'default' : result.aiProcessing.confidence >= 60 ? 'secondary' : 'destructive'}>
                          {result.aiProcessing.confidence}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Tempo de Processamento:</span>
                        <Badge variant="outline">{result.aiProcessing.processingTime}ms</Badge>
                      </div>
                    </div>
                    
                    {/* Correções feitas pela IA */}
                    {result.aiProcessing.corrections && result.aiProcessing.corrections.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-orange-600">Correções Feitas pela IA</h4>
                        <div className="space-y-1">
                          {result.aiProcessing.corrections.map((correction, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                              <span className="text-orange-700">{correction}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Informações Técnicas</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm text-gray-600 mb-1">Idioma Detectado</h5>
                        <Badge variant="outline" className="text-xs">
                          {result.aiProcessing.language === 'pt' ? 'Português' : 'Inglês'}
                        </Badge>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-600 mb-1">Processamento</h5>
                        <div className="text-xs text-gray-500">
                          <p>• Query analisada e corrigida automaticamente</p>
                          <p>• Tema principal extraído e traduzido</p>
                          <p>• Prompt otimizado para geração de imagens</p>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-600 mb-1">Qualidade da Classificação</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                result.aiProcessing.confidence >= 80 ? 'bg-green-500' : 
                                result.aiProcessing.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${result.aiProcessing.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{result.aiProcessing.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Imagens Geradas */}
          <Tabs defaultValue="sucesso" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sucesso" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Sucesso ({result.successfulImages.length})
              </TabsTrigger>
              <TabsTrigger value="falharam" className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Falharam ({result.failedImages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sucesso" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.successfulImages.map((image, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Gerar placeholder SVG base64 para erro
                          const errorSvg = `
                            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100%" height="100%" fill="#F3F4F6"/>
                              <rect x="50" y="50" width="700" height="500" fill="white" stroke="#E5E7EB" stroke-width="2" rx="20"/>
                              <text x="400" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
                                    text-anchor="middle" fill="#6B7280">Erro ao carregar imagem</text>
                              <text x="400" y="320" font-family="Arial, sans-serif" font-size="14" 
                                    text-anchor="middle" fill="#9CA3AF">Imagem não disponível</text>
                            </svg>
                          `;
                          target.src = `data:image/svg+xml;base64,${btoa(errorSvg)}`;
                        }}
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className={getTypeColor(image.type)}>
                          {image.type}
                        </Badge>
                        <Badge className={getStyleColor(image.style)}>
                          {image.style}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => downloadImage(image.url, `gemini-${image.type}-${index + 1}.png`)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {image.description}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Prompt:</span>
                          <span className="text-gray-600 line-clamp-1">{image.prompt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tempo:</span>
                          <span className="text-blue-600">{image.generationTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sucesso
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="falharam" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.failedImages.map((item, index) => (
                  <Card key={index} className="overflow-hidden border-red-200">
                    <div className="relative">
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-400" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className={getTypeColor(item.image.type)}>
                          {item.image.type}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {item.image.description}
                      </h4>
                      <Alert variant="destructive" className="mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {item.reason}
                        </AlertDescription>
                      </Alert>
                      <div className="text-xs text-gray-500">
                        Prompt: {item.image.prompt}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Recomendações */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Exemplos de Queries */}
      {!result && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Prompts para Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { topic: 'como funciona a fotossíntese', desc: 'IA cria: Diagrama visual puro (sem texto)' },
                { topic: 'o que é gravidade', desc: 'IA cria: Ilustração visual pura (sem texto)' },
                { topic: 'fotosinste em plantas', desc: 'IA corrige + cria diagrama visual puro' },
                { topic: 'dados da população mundial', desc: 'IA cria: Gráfico visual puro (sem texto)' },
                { topic: 'revolução francesa', desc: 'IA cria: Ilustração histórica pura (sem texto)' },
                { topic: 'sistema solar', desc: 'IA cria: Diagrama espacial puro (sem texto)' },
                { topic: 'metallica', desc: 'IA detecta: banda de heavy metal + cria ilustração artística' },
                { topic: 'pokemon', desc: 'IA detecta: jogo/videogame + cria ilustração colorida' },
                { topic: 'star wars', desc: 'IA detecta: franquia + cria ilustração épica' },
                { topic: 'harry potter', desc: 'IA detecta: série/livro + cria ilustração mágica' },
                { topic: 'estrutura do DNA', desc: 'IA cria: Diagrama molecular puro (sem texto)' },
                { topic: 'arte renascentista', desc: 'IA cria: Ilustração artística pura (sem texto)' }
              ].map((example, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  setQuery(example.topic);
                }}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{example.topic}</h4>
                    <p className="text-xs text-gray-500">{example.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
