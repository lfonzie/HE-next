'use client';

import React, { useState } from 'react';
import { SemanticImageGrid, SemanticImageItem } from '@/components/semantic-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Check } from 'lucide-react';

interface ImageSelectorProps {
  onImageSelect: (image: SemanticImageItem) => void;
  selectedImages?: SemanticImageItem[];
  maxImages?: number;
  className?: string;
}

export function ImageSelector({ 
  onImageSelect, 
  selectedImages = [], 
  maxImages = 5,
  className = '' 
}: ImageSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleImageSelect = (image: SemanticImageItem) => {
    if (selectedImages.length < maxImages) {
      onImageSelect(image);
    }
  };

  const isImageSelected = (image: SemanticImageItem) => {
    return selectedImages.some(selected => 
      selected.id === image.id && selected.provider === image.provider
    );
  };

  const canSelectMore = selectedImages.length < maxImages;

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Imagem ({selectedImages.length}/{maxImages})
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Imagens para Aula
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: fotossíntese, sistema solar, história do Brasil..."
                className="flex-1"
              />
              <Button 
                onClick={() => setIsOpen(false)}
                variant="outline"
              >
                Fechar
              </Button>
            </div>

            {query.trim() && (
              <div className="max-h-[60vh] overflow-y-auto">
                <SemanticImageGrid
                  query={query}
                  onImageSelect={handleImageSelect}
                />
              </div>
            )}

            {!query.trim() && (
              <div className="text-center py-8 text-muted-foreground">
                Digite uma busca para encontrar imagens educacionais
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Imagens Selecionadas */}
      {selectedImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">
            Imagens Selecionadas ({selectedImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedImages.map((image, index) => (
              <Card key={`${image.provider}-${image.id}`} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={image.thumbUrl || image.url}
                    alt={image.alt || image.title || 'Imagem selecionada'}
                    className="w-full h-24 object-cover"
                  />
                  <Badge 
                    className="absolute top-1 left-1 text-xs"
                    variant="secondary"
                  >
                    {image.provider}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => {
                      // Implementar remoção se necessário
                      console.log('Remove image', image.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs line-clamp-2">
                    {image.title || image.alt || 'Sem título'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para exibir imagem com informações de licença
export function ImageWithLicense({ 
  image, 
  className = '' 
}: { 
  image: SemanticImageItem; 
  className?: string;
}) {
  return (
    <div className={`relative group ${className}`}>
      <img
        src={image.url}
        alt={image.alt || image.title || 'Imagem educacional'}
        className="w-full h-auto rounded-lg"
      />
      
      {/* Overlay com informações */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-medium">{image.title || 'Sem título'}</div>
            <div>Por: {image.author || 'Desconhecido'}</div>
          </div>
          <div className="text-right">
            <div>{image.provider}</div>
            {image.score && (
              <div>{(image.score * 100).toFixed(0)}% match</div>
            )}
          </div>
        </div>
        
        {image.license && (
          <div className="mt-1 text-xs text-gray-300">
            Licença: {image.license}
          </div>
        )}
        
        {image.sourcePage && (
          <a
            href={image.sourcePage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-100 text-xs"
          >
            Ver fonte original →
          </a>
        )}
      </div>
    </div>
  );
}

// Hook para gerenciar imagens de uma aula
export function useLessonImages() {
  const [images, setImages] = useState<SemanticImageItem[]>([]);

  const addImage = (image: SemanticImageItem) => {
    setImages(prev => [...prev, image]);
  };

  const removeImage = (imageId: string, provider: string) => {
    setImages(prev => 
      prev.filter(img => !(img.id === imageId && img.provider === provider))
    );
  };

  const clearImages = () => {
    setImages([]);
  };

  return {
    images,
    addImage,
    removeImage,
    clearImages,
  };
}
