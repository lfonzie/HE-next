'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Globe, Calendar, User, ExternalLink, Loader2, Filter, TrendingUp } from 'lucide-react';
import { CurrentsArticle, CurrentsAPIService } from '@/lib/services/currentsapi-service';

interface CurrentsAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

export function CurrentsAPIModal({ isOpen, onClose, searchQuery = '', className = '' }: CurrentsAPIModalProps) {
  const [articles, setArticles] = useState<CurrentsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isTrending, setIsTrending] = useState(false);

  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'business', label: 'Negócios' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'general', label: 'Geral' },
    { value: 'health', label: 'Saúde' },
    { value: 'science', label: 'Ciência' },
    { value: 'sports', label: 'Esportes' },
    { value: 'technology', label: 'Tecnologia' },
    { value: 'politics', label: 'Política' },
    { value: 'world', label: 'Mundo' }
  ];

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchNews(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const searchNews = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (query.trim()) {
        result = await CurrentsAPIService.searchNews(query, 'pt', 10);
        setIsTrending(false);
      } else if (selectedCategory) {
        result = await CurrentsAPIService.getNewsByCategory(selectedCategory, 'pt', 10);
        setIsTrending(false);
      } else {
        result = await CurrentsAPIService.getLatestNews('pt', 10);
        setIsTrending(true);
      }
      
      setArticles(result.news);
      setTotalResults(result.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar notícias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchNews(searchTerm);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (!searchTerm.trim()) {
      searchNews('');
    }
  };

  const handleArticleClick = (article: CurrentsArticle) => {
    window.open(article.url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Notícias Globais</h2>
              <p className="text-purple-100">Acompanhe as tendências mundiais em tempo real</p>
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
                placeholder="Digite palavras-chave para buscar notícias..."
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

          {/* Category Filter and Trending */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} className="text-gray-900">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                searchNews('');
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isTrending
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Tendências
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Globe className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar notícias</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => searchNews(searchTerm)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {articles.length > 0 && !isLoading && (
            <>
              <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                {isTrending && (
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                )}
                {totalResults > 0 && (
                  <span>Encontradas {totalResults} notícias</span>
                )}
              </div>
              
              <div className="grid gap-4">
                {articles.map((article, index) => (
                  <div
                    key={article.id || index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="flex gap-4">
                      {/* Article Image */}
                      <div className="flex-shrink-0">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-32 h-24 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-32 h-24 bg-gray-200 rounded border flex items-center justify-center">
                            <Globe className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Article Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {article.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                            {CurrentsAPIService.formatDescription(article.description)}
                          </p>
                        )}
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{CurrentsAPIService.formatDate(article.published)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{article.source}</span>
                            {article.author && (
                              <span className="text-gray-500">• {article.author}</span>
                            )}
                          </div>
                        </div>

                        {article.category && article.category.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {article.category.slice(0, 3).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {CurrentsAPIService.getCategoryLabel(cat)}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-purple-600">
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Ler notícia completa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {articles.length === 0 && !isLoading && !error && (searchTerm || selectedCategory) && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-gray-600">Tente uma busca diferente ou selecione outra categoria.</p>
            </div>
          )}

          {!searchTerm && !selectedCategory && !isLoading && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore as notícias globais</h3>
              <p className="text-gray-600 mb-4">Digite palavras-chave para buscar ou selecione uma categoria para ver as principais notícias.</p>
              <div className="text-sm text-gray-500">
                <p>• Acompanhe as tendências mundiais em tempo real</p>
                <p>• Filtre por categoria para notícias específicas</p>
                <p>• Explore diferentes fontes e perspectivas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
