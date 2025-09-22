import React from 'react';
import { useSemanticImages, SemanticImageItem, Provider } from '@/hooks/useSemanticImages';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Download, Info } from 'lucide-react';
import Image from 'next/image';

interface SemanticImageGridProps {
  query: string;
  orientation?: string;
  safe?: boolean;
  perProvider?: number;
  page?: number;
  onImageSelect?: (image: SemanticImageItem) => void;
  className?: string;
}

const ProviderColors: Record<Provider, string> = {
  unsplash: 'bg-green-100 text-green-800',
  pixabay: 'bg-blue-100 text-blue-800',
  wikimedia: 'bg-purple-100 text-purple-800',
};

const ProviderIcons: Record<Provider, string> = {
  unsplash: '📸',
  pixabay: '🎨',
  wikimedia: '📚',
};

function ImageSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function ImageCard({ 
  image, 
  onSelect 
}: { 
  image: SemanticImageItem; 
  onSelect?: (image: SemanticImageItem) => void;
}) {
  const providerColor = ProviderColors[image.provider];
  const providerIcon = ProviderIcons[image.provider];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image.thumbUrl || image.url}
          alt={image.alt || image.title || 'Imagem semântica'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <Badge className={providerColor}>
            {providerIcon} {image.provider}
          </Badge>
        </div>
        {image.score && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {(image.score * 100).toFixed(0)}% match
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-2 line-clamp-2">
          {image.title || image.alt || 'Sem título'}
        </h3>
        
        {image.author && (
          <p className="text-xs text-muted-foreground mb-2">
            Por: {image.author}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {image.sourcePage && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => window.open(image.sourcePage, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => window.open(image.url, '_blank')}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
          
          {onSelect && (
            <Button
              size="sm"
              onClick={() => onSelect(image)}
              className="h-7 px-3"
            >
              Selecionar
            </Button>
          )}
        </div>
        
        {image.license && (
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Info className="h-3 w-3" />
              <span className="font-medium">Licença:</span>
            </div>
            <p className="text-muted-foreground">{image.license}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-500 mb-4">
        <Info className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">Erro ao buscar imagens</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        Tentar novamente
      </Button>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-muted-foreground mb-4">
        <Info className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">Nenhuma imagem encontrada</p>
        <p className="text-sm">Tente uma busca diferente para "{query}"</p>
      </div>
    </div>
  );
}

export function SemanticImageGrid({
  query,
  orientation,
  safe = true,
  perProvider = 12,
  page = 1,
  onImageSelect,
  className = '',
}: SemanticImageGridProps) {
  const { data, isLoading, error, refetch } = useSemanticImages({
    query,
    orientation,
    safe,
    perProvider,
    page,
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ImageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!data || data.items.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className={className}>
      <div className="mb-4 text-sm text-muted-foreground">
        Encontradas {data.count} imagens para "{data.query}" 
        {data.items.length > 0 && (
          <span className="ml-2">
            (Top {data.topK} resultados semânticos)
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((image) => (
          <ImageCard
            key={`${image.provider}-${image.id}`}
            image={image}
            onSelect={onImageSelect}
          />
        ))}
      </div>
    </div>
  );
}

// Componente simplificado para uso rápido
export function SemanticImageSearch({ 
  query, 
  onImageSelect 
}: { 
  query: string; 
  onImageSelect?: (image: SemanticImageItem) => void;
}) {
  return (
    <SemanticImageGrid
      query={query}
      onImageSelect={onImageSelect}
    />
  );
}
