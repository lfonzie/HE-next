'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Image, Download, Copy, Check, Loader2, AlertCircle, Filter, Grid, List } from 'lucide-react';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  className?: string;
}

interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  author: string;
  source: string;
  license: string;
  width: number;
  height: number;
  tags: string[];
}

export function ImageSearchModal({ isOpen, onClose, initialQuery = '', className = '' }: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedImage, setCopiedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilters, setSelectedFilters] = useState({
    orientation: 'all',
    license: 'all',
    source: 'all'
  });

  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchQuery(initialQuery);
      searchImages(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const searchImages = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - in real implementation, use the semantic images API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration
      const mockImages: ImageResult[] = [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          title: 'Estudante estudando',
          description: 'Jovem estudante concentrado em seus livros',
          author: 'John Doe',
          source: 'Unsplash',
          license: 'Unsplash License',
          width: 800,
          height: 600,
          tags: ['estudo', 'educação', 'livros', 'concentração']
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200',
          title: 'Matemática e fórmulas',
          description: 'Equações matemáticas em quadro negro',
          author: 'Jane Smith',
          source: 'Pixabay',
          license: 'Pixabay License',
          width: 800,
          height: 600,
          tags: ['matemática', 'fórmulas', 'educação', 'ciência']
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200',
          title: 'Laboratório de química',
          description: 'Experimentos químicos em laboratório',
          author: 'Mike Johnson',
          source: 'Wikimedia',
          license: 'CC BY-SA 3.0',
          width: 800,
          height: 600,
          tags: ['química', 'laboratório', 'experimento', 'ciência']
        }
      ];

      setImages(mockImages);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar imagens');
    } finally {
      setIsLoading(false);
    }
  };

  const copyImageUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedImage(id);
      setTimeout(() => setCopiedImage(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const downloadImage = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Erro ao baixar imagem:', err);
    }
  };

  const filteredImages = images.filter(image => {
    if (selectedFilters.orientation !== 'all') {
      const aspectRatio = image.width / image.height;
      if (selectedFilters.orientation === 'landscape' && aspectRatio < 1.2) return false;
      if (selectedFilters.orientation === 'portrait' && aspectRatio > 0.8) return false;
      if (selectedFilters.orientation === 'square' && (aspectRatio < 0.9 || aspectRatio > 1.1)) return false;
    }
    
    if (selectedFilters.source !== 'all' && image.source !== selectedFilters.source) return false;
    
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-6xl w-full shadow-2xl max-h-[90vh] flex flex-col ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Busca de Imagens</h2>
              <p className="text-sm opacity-90">Encontre imagens educacionais de alta qualidade</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchImages(searchQuery)}
                placeholder="Buscar imagens educacionais..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
            </div>
            <button
              onClick={() => searchImages(searchQuery)}
              disabled={!searchQuery.trim() || isLoading}
              className="px-6 py-3 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Filters and Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>
                
                <select
                  value={selectedFilters.orientation}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, orientation: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">Todas as orientações</option>
                  <option value="landscape">Paisagem</option>
                  <option value="portrait">Retrato</option>
                  <option value="square">Quadrado</option>
                </select>
                
                <select
                  value={selectedFilters.source}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, source: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">Todas as fontes</option>
                  <option value="Unsplash">Unsplash</option>
                  <option value="Pixabay">Pixabay</option>
                  <option value="Wikimedia">Wikimedia</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {isLoading ? 'Buscando imagens...' : `${filteredImages.length} imagens encontradas`}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
                  <p className="text-gray-600">Buscando imagens...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Erro ao buscar imagens</p>
                  <p className="text-gray-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!isLoading && !error && filteredImages.length === 0 && searchQuery && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma imagem encontrada</p>
                  <p className="text-gray-500 text-sm">Tente termos diferentes</p>
                </div>
              </div>
            )}

            {!isLoading && !error && filteredImages.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
              }>
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'aspect-video'} bg-gray-100`}>
                      <img
                        src={image.thumbnail}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="p-3 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {image.title}
                      </h3>
                      
                      {image.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{image.author}</span>
                        <span>{image.source}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {image.width} × {image.height}
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyImageUrl(image.url, image.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copiar URL"
                          >
                            {copiedImage === image.id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => downloadImage(image.url, image.title)}
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Baixar imagem"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {image.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{image.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Imagens de alta qualidade para uso educacional
            </div>
            <div className="text-xs text-gray-500">
              Sempre verifique as licenças antes do uso
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
