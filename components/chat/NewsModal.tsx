'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Newspaper, ExternalLink, Calendar, User, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: string;
  author?: string;
  category?: string;
}

export function NewsModal({ isOpen, onClose, searchQuery = '', className = '' }: NewsModalProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'politica', label: 'Política' },
    { value: 'economia', label: 'Economia' },
    { value: 'esportes', label: 'Esportes' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'ciencia', label: 'Ciência' },
    { value: 'mundo', label: 'Mundo' }
  ];

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchNews(searchQuery);
    } else if (isOpen) {
      loadDefaultNews();
    }
  }, [isOpen, searchQuery]);

  const loadDefaultNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular carregamento de notícias padrão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNews: NewsArticle[] = [
        {
          id: '1',
          title: 'Tecnologia: Novos avanços em IA revolucionam o mercado',
          description: 'Pesquisadores desenvolvem algoritmos que podem transformar a indústria tecnológica nos próximos anos.',
          url: 'https://example.com/news/1',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
          publishedAt: new Date().toISOString(),
          source: 'TechNews Brasil',
          author: 'João Silva',
          category: 'tecnologia'
        },
        {
          id: '2',
          title: 'Educação: Reforma do ensino médio entra em vigor',
          description: 'Nova estrutura curricular começa a ser implementada em escolas de todo o país.',
          url: 'https://example.com/news/2',
          image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: 'Educação Hoje',
          author: 'Maria Santos',
          category: 'educacao'
        },
        {
          id: '3',
          title: 'Ciência: Descoberta de novo planeta potencialmente habitável',
          description: 'Astrônomos identificam planeta com características similares à Terra em sistema solar distante.',
          url: 'https://example.com/news/3',
          image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: 'Ciência Viva',
          author: 'Carlos Oliveira',
          category: 'ciencia'
        },
        {
          id: '4',
          title: 'Saúde: Vacina contra gripe disponível em todo o país',
          description: 'Campanha de vacinação contra influenza começa com foco em grupos prioritários.',
          url: 'https://example.com/news/4',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: 'Saúde Pública',
          author: 'Ana Costa',
          category: 'saude'
        },
        {
          id: '5',
          title: 'Economia: Índice de inflação registra queda em setembro',
          description: 'Dados do IBGE mostram redução na taxa de inflação, sinalizando estabilização econômica.',
          url: 'https://example.com/news/5',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          source: 'Economia Brasil',
          author: 'Pedro Lima',
          category: 'economia'
        }
      ];
      
      setArticles(mockNews);
    } catch (err) {
      setError('Erro ao carregar notícias padrão');
    } finally {
      setIsLoading(false);
    }
  };

  const searchNews = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular busca de notícias
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSearchResults: NewsArticle[] = [
        {
          id: 'search-1',
          title: `Resultados para "${query}": Desenvolvimentos recentes`,
          description: `Notícias relacionadas ao termo "${query}" encontradas em diversas fontes confiáveis.`,
          url: 'https://example.com/search/1',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
          publishedAt: new Date().toISOString(),
          source: 'Busca Notícias',
          author: 'Sistema de Busca',
          category: 'geral'
        },
        {
          id: 'search-2',
          title: `Análise: Impacto de "${query}" no cenário atual`,
          description: `Especialistas analisam as implicações e consequências relacionadas ao tema "${query}".`,
          url: 'https://example.com/search/2',
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
          publishedAt: new Date(Date.now() - 43200000).toISOString(),
          source: 'Análise Notícias',
          author: 'Equipe Editorial',
          category: 'analise'
        }
      ];
      
      setArticles(mockSearchResults);
    } catch (err) {
      setError('Erro ao buscar notícias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchNews(searchTerm);
    } else {
      loadDefaultNews();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      // Simular busca por categoria
      searchNews(category);
    } else {
      loadDefaultNews();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      tecnologia: 'bg-blue-100 text-blue-800',
      educacao: 'bg-green-100 text-green-800',
      ciencia: 'bg-purple-100 text-purple-800',
      saude: 'bg-red-100 text-red-800',
      economia: 'bg-yellow-100 text-yellow-800',
      politica: 'bg-gray-100 text-gray-800',
      esportes: 'bg-orange-100 text-orange-800',
      cultura: 'bg-pink-100 text-pink-800',
      mundo: 'bg-indigo-100 text-indigo-800',
      geral: 'bg-gray-100 text-gray-800',
      analise: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category || 'geral'] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Notícias e Atualidades</h2>
              <p className="text-sm opacity-90">Acompanhe as principais notícias do Brasil e do mundo</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notícias..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => {
                    setError(null);
                    loadDefaultNews();
                  }}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando notícias...</p>
              </div>
            </div>
          )}

          {/* Articles */}
          {!isLoading && !error && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Principais Notícias'}
                </h3>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    loadDefaultNews();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <article key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {article.image && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {article.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{article.source}</span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </div>
                        {article.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {article.author}
                          </div>
                        )}
                      </div>
                      
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ler mais
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {articles.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma notícia encontrada</p>
                  <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
