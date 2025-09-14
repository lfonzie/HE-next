// components/ui/UnsplashImageSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { UnsplashImage } from '@/lib/unsplash';

interface UnsplashImageSearchProps {
  onImageSelect?: (image: UnsplashImage) => void;
  onImageSelectUrl?: (url: string, alt: string) => void;
  className?: string;
}

interface SearchResult {
  data: {
    results: UnsplashImage[];
    total: number;
    total_pages: number;
  };
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export function UnsplashImageSearch({ 
  onImageSelect, 
  onImageSelectUrl, 
  className = '' 
}: UnsplashImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('search');

  const searchImages = async (query: string, page: number = 1, type: string = 'search') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        per_page: '20',
        type
      });

      const response = await fetch(`/api/unsplash/search?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar imagens');
      }

      const searchResult: SearchResult = result;
      setSearchResults(searchResult.data.results);
      setTotalPages(searchResult.pagination.total_pages);
      setCurrentPage(searchResult.pagination.page);

    } catch (err: any) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
      searchImages(searchQuery, 1, activeTab);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchResults([]);
    setCurrentPage(1);
    
    if (value === 'education') {
      searchImages('', 1, 'education');
    } else if (value === 'presentation') {
      searchImages('', 1, 'presentation');
    }
  };

  const handleImageClick = (image: UnsplashImage) => {
    if (onImageSelect) {
      onImageSelect(image);
    }
    if (onImageSelectUrl) {
      onImageSelectUrl(image.urls.regular, image.alt_description || image.description || 'Imagem do Unsplash');
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      searchImages(searchQuery, nextPage, activeTab);
    }
  };

  const loadPrev = () => {
    if (currentPage > 1 && !loading) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      searchImages(searchQuery, prevPage, activeTab);
    }
  };

  // Carregar imagens de educação por padrão
  useEffect(() => {
    if (activeTab === 'education') {
      searchImages('', 1, 'education');
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="education">Educação</TabsTrigger>
          <TabsTrigger value="presentation">Apresentações</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o que você está procurando..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Imagens relacionadas à educação, escolas e aprendizado
          </div>
        </TabsContent>

        <TabsContent value="presentation" className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Imagens profissionais para apresentações e documentos
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Buscando imagens...</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((image) => (
              <Card 
                key={image.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleImageClick(image)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-md">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || image.description || 'Imagem do Unsplash'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {image.likes} ♥
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.alt_description || image.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      por {image.user.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={loadPrev}
                disabled={currentPage <= 1 || loading}
                size="sm"
              >
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={currentPage >= totalPages || loading}
                size="sm"
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && searchResults.length === 0 && activeTab === 'search' && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Digite um termo de busca para encontrar imagens</p>
        </div>
      )}
    </div>
  );
}
