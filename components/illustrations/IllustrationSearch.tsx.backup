// components/illustrations/IllustrationSearch.tsx - Componente para busca de ilustrações
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Image, Download, ExternalLink, BookOpen, Microscope, Atom, Calculator, Globe, History, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Illustration {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  author: string;
  authorUrl: string;
  source: string;
  downloadUrl: string;
  width: number;
  height: number;
  tags: string[];
  metadata?: {
    category: string;
    process?: string;
    style: string;
    language: string;
    searchQuery: string;
    optimizedQuery: string;
    educationalRelevance: number;
  };
  processRelevance?: number;
  educationalLevel?: string;
}

interface ProcessInfo {
  id: string;
  name: string;
  description: string;
  categories: string[];
  difficulty: string;
  ageRange: string;
  keywords: string[];
  relatedProcesses: string[];
  steps?: string[];
}

interface IllustrationSearchProps {
  onImageSelect?: (image: Illustration) => void;
  onProcessSelect?: (process: ProcessInfo) => void;
  initialQuery?: string;
  initialProcess?: string;
  showProcesses?: boolean;
  showCategories?: boolean;
  maxResults?: number;
}

const CATEGORY_ICONS = {
  biology: Microscope,
  chemistry: Atom,
  physics: Atom,
  math: Calculator,
  history: History,
  geography: Globe,
  general: BookOpen
};

const CATEGORY_COLORS = {
  biology: 'bg-green-100 text-green-800',
  chemistry: 'bg-blue-100 text-blue-800',
  physics: 'bg-purple-100 text-purple-800',
  math: 'bg-orange-100 text-orange-800',
  history: 'bg-yellow-100 text-yellow-800',
  geography: 'bg-teal-100 text-teal-800',
  general: 'bg-gray-100 text-gray-800'
};

export function IllustrationSearch({
  onImageSelect,
  onProcessSelect,
  initialQuery = '',
  initialProcess = '',
  showProcesses = true,
  showCategories = true,
  maxResults = 12
}: IllustrationSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedProcess, setSelectedProcess] = useState(initialProcess);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('medio');
  const [images, setImages] = useState<Illustration[]>([]);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'processes'>('search');

  // Carregar processos disponíveis
  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const response = await fetch('/api/illustrations/processes?action=list');
      const data = await response.json();
      
      if (data.success) {
        setProcesses(data.data);
      }
    } catch (error) {
      console.error('Error loading processes:', error);
    }
  };

  const searchImages = async () => {
    if (!query.trim()) {
      setError('Digite um termo de busca');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/illustrations/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          category: selectedCategory || undefined,
          process: selectedProcess || undefined,
          limit: maxResults,
          includeMetadata: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setImages(data.data);
      } else {
        setError(data.error || 'Erro ao buscar imagens');
      }
    } catch (error) {
      setError('Erro de conexão');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProcessImages = async (processId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/illustrations/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          process: processId,
          level: selectedLevel,
          limit: maxResults,
          includeSteps: true,
          includeDiagrams: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setImages(data.images);
        if (onProcessSelect && data.process) {
          onProcessSelect(data.process);
        }
      } else {
        setError(data.error || 'Erro ao buscar imagens do processo');
      }
    } catch (error) {
      setError('Erro de conexão');
      console.error('Process search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: Illustration) => {
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const handleProcessClick = (process: ProcessInfo) => {
    setSelectedProcess(process.id);
    setQuery(process.name);
    searchProcessImages(process.id);
    if (onProcessSelect) {
      onProcessSelect(process);
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || BookOpen;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Busca de Ilustrações Educacionais</h1>
        <p className="text-gray-600">Encontre imagens e diagramas para seus conteúdos educacionais</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'processes')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Busca Geral</TabsTrigger>
          <TabsTrigger value="processes">Processos Específicos</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Ilustrações</CardTitle>
              <CardDescription>
                Digite um termo de busca para encontrar imagens educacionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: fotossíntese, tabela periódica, movimento..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                  className="flex-1"
                />
                <Button onClick={searchImages} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    <SelectItem value="biology">Biologia</SelectItem>
                    <SelectItem value="chemistry">Química</SelectItem>
                    <SelectItem value="physics">Física</SelectItem>
                    <SelectItem value="math">Matemática</SelectItem>
                    <SelectItem value="history">História</SelectItem>
                    <SelectItem value="geography">Geografia</SelectItem>
                    <SelectItem value="general">Geral</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental">Fundamental</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processos Educacionais</CardTitle>
              <CardDescription>
                Selecione um processo específico para encontrar imagens relacionadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processes.map((process) => (
                  <Card 
                    key={process.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProcessClick(process)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{process.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {process.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{process.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {process.categories.map((category) => (
                          <Badge key={category} className={`text-xs ${getCategoryColor(category)}`}>
                            {getCategoryIcon(category)}
                            <span className="ml-1">{category}</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={image.thumbnail}
                      alt={image.description}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleImageClick(image)}
                    />
                    {image.metadata?.educationalRelevance && (
                      <Badge 
                        className="absolute top-2 right-2 bg-green-600 text-white"
                        variant="secondary"
                      >
                        {Math.round(image.metadata.educationalRelevance * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {image.description || 'Sem descrição'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{image.author}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {image.metadata?.category && (
                      <Badge className={`text-xs mt-2 ${getCategoryColor(image.metadata.category)}`}>
                        {getCategoryIcon(image.metadata.category)}
                        <span className="ml-1">{image.metadata.category}</span>
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Buscando imagens...</span>
        </div>
      )}
    </div>
  );
}
