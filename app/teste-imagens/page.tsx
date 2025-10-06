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
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  Star,
  Shield,
  Brain,
  Zap
} from 'lucide-react';

interface ImageResult {
  url: string;
  provider: string;
  title?: string;
  description?: string;
  author?: string;
  license?: string;
  width?: number;
  height?: number;
  sourceUrl?: string;
  relevanceScore: number;
  educationalValue: number;
  qualityScore: number;
  appropriatenessScore: number;
  overallScore: number;
  category: string;
  isRelevant: boolean;
  reasoning: string;
  warnings: string[];
}

interface TestResult {
  success: boolean;
  topic: string;
  subject?: string;
  totalImagesFound: number;
  validImages: ImageResult[];
  invalidImages: { image: ImageResult; reason: string }[];
  themeAnalysis: {
    originalTopic: string;
    extractedTheme: string;
    translatedTheme: string;
    confidence: number;
    category: string;
    relatedTerms: string[];
    visualConcepts: string[];
    educationalContext: string[];
    searchQueries: string[];
    language: string;
    corrections?: string[];
  };
  providerStats: {
    [provider: string]: {
      searched: boolean;
      success: boolean;
      imagesFound: number;
      imagesSelected: number;
      searchTime: number;
    };
  };
  qualityMetrics: {
    averageScore: number;
    diversityScore: number;
    qualityScore: number;
    educationalValue: number;
  };
  searchTime: number;
  recommendations: string[];
  errors?: string[];
}

export default function TesteImagensPage() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/teste-imagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: query,
          subject: subject || undefined,
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
      handleSearch();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getProviderName = (provider: any): string => {
    if (typeof provider === 'string') {
      return provider;
    }
    if (typeof provider === 'object' && provider !== null) {
      return provider.name || provider.source || 'unknown';
    }
    return 'unknown';
  };

  const getProviderColor = (provider: any) => {
    const providerName = getProviderName(provider);
    const colors: { [key: string]: string } = {
      wikimedia: 'bg-blue-100 text-blue-800',
      unsplash: 'bg-green-100 text-green-800',
      pixabay: 'bg-purple-100 text-purple-800',
      pexels: 'bg-orange-100 text-orange-800',
      bing: 'bg-gray-100 text-gray-800',
    };
    return colors[providerName] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-blue-600" />
          Teste do Sistema Melhorado de Imagens
        </h1>
        <p className="text-gray-600">
          Teste o novo sistema integrado de busca e classificação de imagens educacionais
        </p>
      </div>

      {/* Formulário de Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Imagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o tema da aula (ex: fotossíntese, gravidade, revolução francesa)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <div className="w-48">
              <Input
                placeholder="Disciplina (opcional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !query.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium">Processando busca...</p>
                <p className="text-sm text-gray-600">
                  Analisando tema, buscando em provedores, classificando imagens...
                </p>
              </div>
            </div>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro na busca:</strong> {error}
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
                Resultados da Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totalImagesFound}</div>
                  <div className="text-sm text-gray-600">Total Encontradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.validImages.length}</div>
                  <div className="text-sm text-gray-600">Válidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.invalidImages.length}</div>
                  <div className="text-sm text-gray-600">Rejeitadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.searchTime}ms</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{result.qualityMetrics.averageScore}/100</div>
                  <div className="text-sm text-gray-600">Score Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{result.qualityMetrics.diversityScore}/100</div>
                  <div className="text-sm text-gray-600">Diversidade</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{result.qualityMetrics.qualityScore}/100</div>
                  <div className="text-sm text-gray-600">Qualidade</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{result.qualityMetrics.educationalValue}/100</div>
                  <div className="text-sm text-gray-600">Educacional</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise Semântica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Análise Semântica com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Processamento da Query</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Original:</span>
                      <p className="text-gray-800">{result.themeAnalysis.originalTopic}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Extraído:</span>
                      <p className="text-blue-600 font-medium">{result.themeAnalysis.extractedTheme}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Traduzido:</span>
                      <p className="text-green-600 font-medium">{result.themeAnalysis.translatedTheme}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Categoria:</span>
                      <Badge variant="outline">{result.themeAnalysis.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Confiança:</span>
                      <Badge variant={getScoreBadgeVariant(result.themeAnalysis.confidence)}>{result.themeAnalysis.confidence}%</Badge>
                    </div>
                  </div>
                  
                  {/* Correções feitas pela IA */}
                  {result.themeAnalysis.corrections && result.themeAnalysis.corrections.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-orange-600">Correções Feitas pela IA</h4>
                      <div className="space-y-1">
                        {result.themeAnalysis.corrections.map((correction, index) => (
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
                  <h4 className="font-semibold mb-2">Expansão Semântica</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Termos Relacionados</h5>
                      <div className="flex flex-wrap gap-1">
                        {result.themeAnalysis.relatedTerms.slice(0, 5).map((term, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{term}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Conceitos Visuais</h5>
                      <div className="flex flex-wrap gap-1">
                        {result.themeAnalysis.visualConcepts.slice(0, 3).map((concept, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-1">Contexto Educacional</h5>
                      <div className="flex flex-wrap gap-1">
                        {result.themeAnalysis.educationalContext.slice(0, 3).map((context, index) => (
                          <Badge key={index} variant="default" className="text-xs bg-blue-100 text-blue-800">{context}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas dos Provedores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Estatísticas dos Provedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(result.providerStats).map(([provider, stats]) => (
                  <div key={provider} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getProviderColor(provider)}>
                        {provider.toUpperCase()}
                      </Badge>
                      {stats.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Encontradas:</strong> {stats.imagesFound}</p>
                      <p><strong>Selecionadas:</strong> {stats.imagesSelected}</p>
                      <p><strong>Tempo:</strong> {stats.searchTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Tabs defaultValue="validas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="validas" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Válidas ({result.validImages.length})
              </TabsTrigger>
              <TabsTrigger value="rejeitadas" className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejeitadas ({result.invalidImages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="validas" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.validImages.map((image, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.title || 'Imagem educacional'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gY2FycmVnYW5kbyBpbWFnZW08L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className={getProviderColor(image.provider)}>
                          {getProviderName(image.provider)}
                        </Badge>
                        <Badge variant={getScoreBadgeVariant(image.overallScore)}>
                          {image.overallScore}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white/90">
                          {image.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {image.title || 'Sem título'}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Relevância:</span>
                          <span className={getScoreColor(image.relevanceScore)}>{image.relevanceScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Educacional:</span>
                          <span className={getScoreColor(image.educationalValue)}>{image.educationalValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qualidade:</span>
                          <span className={getScoreColor(image.qualityScore)}>{image.qualityScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adequação:</span>
                          <span className={getScoreColor(image.appropriatenessScore)}>{image.appropriatenessScore}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {image.reasoning}
                      </p>
                      {image.warnings.length > 0 && (
                        <div className="mt-2">
                          {image.warnings.map((warning, i) => (
                            <Badge key={i} variant="destructive" className="text-xs mr-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {warning}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        {image.width}x{image.height} • {image.author || 'Autor desconhecido'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rejeitadas" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.invalidImages.map((item, index) => (
                  <Card key={index} className="overflow-hidden border-red-200">
                    <div className="relative">
                      <img
                        src={item.image.url}
                        alt={item.image.title || 'Imagem rejeitada'}
                        className="w-full h-48 object-cover opacity-50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gY2FycmVnYW5kbyBpbWFnZW08L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className={getProviderColor(item.image.provider)}>
                          {getProviderName(item.image.provider)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                        {item.image.title || 'Sem título'}
                      </h4>
                      <Alert variant="destructive" className="mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {item.reason}
                        </AlertDescription>
                      </Alert>
                      <div className="text-xs text-gray-500">
                        Score: {item.image.overallScore} • {item.image.width}x{item.image.height}
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
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
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
            <CardTitle>Exemplos de Queries para Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { topic: 'como funciona a fotossíntese', subject: 'biologia', desc: 'Pergunta completa sobre processo biológico' },
                { topic: 'o que é gravidade', subject: 'física', desc: 'Pergunta sobre força fundamental' },
                { topic: 'definição de matemática', subject: 'matemática', desc: 'Pergunta sobre conceitos básicos' },
                { topic: 'como funciona a fotosinste', subject: 'biologia', desc: 'Exemplo com erro de português' },
                { topic: 'o que é matematica', subject: 'matemática', desc: 'Exemplo sem acento' },
                { topic: 'introdução a química', subject: 'química', desc: 'Pergunta sobre introdução' },
                { topic: 'revolução francesa causas', subject: 'história', desc: 'Tema histórico específico' },
                { topic: 'sistema solar planetas', subject: 'geografia', desc: 'Astronomia básica' }
              ].map((example, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  setQuery(example.topic);
                  setSubject(example.subject);
                }}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{example.topic}</h4>
                    <p className="text-xs text-gray-600 mb-2">{example.subject}</p>
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
