'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Image, Shuffle, Loader2, ExternalLink, Star } from 'lucide-react';
import { GiphyGif, GiphyAPIService } from '@/lib/services/giphy-service';

interface GiphyModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

export function GiphyModal({ isOpen, onClose, searchQuery = '', className = '' }: GiphyModalProps) {
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [totalResults, setTotalResults] = useState(0);
  const [isTrending, setIsTrending] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchGifs(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const searchGifs = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (query.trim()) {
        result = await GiphyAPIService.searchGifs(query, 12);
        setIsTrending(false);
      } else {
        result = await GiphyAPIService.getTrendingGifs(12);
        setIsTrending(true);
      }
      
      setGifs(result.gifs);
      setTotalResults(result.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar GIFs');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomGif = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gif = await GiphyAPIService.getRandomGif(searchTerm);
      if (gif) {
        setGifs([gif]);
        setTotalResults(1);
        setIsTrending(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar GIF aleatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchTerm);
  };

  const handleGifClick = (gif: GiphyGif) => {
    // Copia a URL do GIF para a área de transferência
    navigator.clipboard.writeText(gif.url).then(() => {
      // Aqui você pode adicionar uma notificação de sucesso
      console.log('URL do GIF copiada para a área de transferência');
    });
  };

  const handleTrendingClick = () => {
    setSearchTerm('');
    searchGifs('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 rounded-t-2xl p-6 text-white">
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
              <h2 className="text-2xl font-bold">GIFs Animados</h2>
              <p className="text-pink-100">Encontre GIFs perfeitos para suas aulas</p>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite palavras-chave para buscar GIFs..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleTrendingClick}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isTrending
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Star className="w-4 h-4" />
              Tendências
            </button>

            <button
              onClick={getRandomGif}
              disabled={isLoading}
              className="px-4 py-2 bg-white/10 text-white/80 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Aleatório
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Image className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar GIFs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => searchGifs(searchTerm)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {gifs.length > 0 && !isLoading && (
            <>
              <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                {isTrending && (
                  <Star className="w-4 h-4 text-pink-600" />
                )}
                {totalResults > 0 && (
                  <span>Encontrados {totalResults} GIFs</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gifs.map((gif, index) => (
                  <div
                    key={gif.id || index}
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                    onClick={() => handleGifClick(gif)}
                  >
                    <img
                      src={gif.images.fixedWidth.url}
                      alt={GiphyAPIService.formatTitle(gif.title)}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">Copiar</span>
                      </div>
                    </div>

                    {/* Title */}
                    {gif.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs line-clamp-2">
                          {GiphyAPIService.formatTitle(gif.title)}
                        </p>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-white/90 text-gray-800 text-xs rounded-full">
                        {GiphyAPIService.getRatingLabel(gif.rating)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Clique em um GIF para copiar sua URL para a área de transferência</p>
              </div>
            </>
          )}

          {gifs.length === 0 && !isLoading && !error && searchTerm && (
            <div className="text-center py-12">
              <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum GIF encontrado</h3>
              <p className="text-gray-600">Tente uma busca diferente ou explore as tendências.</p>
            </div>
          )}

          {!searchTerm && !isLoading && (
            <div className="text-center py-12">
              <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Encontre GIFs perfeitos</h3>
              <p className="text-gray-600 mb-4">
                Digite palavras-chave para buscar GIFs ou explore as tendências.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• <strong>Educação:</strong> estudar, aprender, escola</p>
                <p>• <strong>Emoções:</strong> feliz, triste, animado</p>
                <p>• <strong>Ações:</strong> correr, pular, dançar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
