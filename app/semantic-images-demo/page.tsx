'use client';

import React, { useState } from 'react';
import { SemanticImageGrid, SemanticImageItem } from '@/components/semantic-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, RotateCcw } from 'lucide-react';

const EXAMPLE_QUERIES = [
  'aula sobre como funciona a internet',
  'fotosíntese em plantas',
  'sistema solar e planetas',
  'história do Brasil colonial',
  'matemática e geometria',
  'laboratório de química',
  'ecossistema amazônico',
  'revolução industrial',
];

export default function SemanticImagesDemo() {
  const [query, setQuery] = useState('aula sobre como funciona a internet');
  const [selectedImage, setSelectedImage] = useState<SemanticImageItem | null>(null);
  const [orientation, setOrientation] = useState<string>('');

  const handleImageSelect = (image: SemanticImageItem) => {
    setSelectedImage(image);
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleReset = () => {
    setQuery('');
    setSelectedImage(null);
    setOrientation('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          🔍 Busca Semântica de Imagens
        </h1>
        <p className="text-muted-foreground mb-4">
          Sistema unificado que busca imagens com reranqueamento semântico obrigatório.
        </p>
        
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">OpenAI Embeddings</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controle */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Query de busca
                </label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: aula sobre como funciona a internet"
                  className="mb-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Orientação (opcional)
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Qualquer orientação</option>
                  <option value="landscape">Paisagem</option>
                  <option value="portrait">Retrato</option>
                  <option value="squarish">Quadrado</option>
                </select>
              </div>

              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </CardContent>
          </Card>

          {/* Exemplos */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Exemplos de Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleExampleClick(example)}
                  >
                    <span className="text-sm">{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          {query.trim() ? (
            <SemanticImageGrid
              query={query}
              orientation={orientation || undefined}
              onImageSelect={handleImageSelect}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Digite uma busca para começar
                </h3>
                <p className="text-muted-foreground">
                  Use os exemplos ao lado ou digite sua própria query
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Imagem Selecionada */}
      {selectedImage && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Imagem Selecionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || selectedImage.title || 'Imagem selecionada'}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Provedor:</strong> {selectedImage.provider}
                </div>
                <div>
                  <strong>Título:</strong> {selectedImage.title || 'Sem título'}
                </div>
                <div>
                  <strong>Autor:</strong> {selectedImage.author || 'Desconhecido'}
                </div>
                <div>
                  <strong>Licença:</strong> {selectedImage.license || 'Ver fonte'}
                </div>
                {selectedImage.score && (
                  <div>
                    <strong>Score semântico:</strong> {(selectedImage.score * 100).toFixed(1)}%
                  </div>
                )}
                <div>
                  <strong>Dimensões:</strong> {selectedImage.width} x {selectedImage.height}
                </div>
                {selectedImage.sourcePage && (
                  <div>
                    <strong>Fonte:</strong>{' '}
                    <a
                      href={selectedImage.sourcePage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver página original
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
