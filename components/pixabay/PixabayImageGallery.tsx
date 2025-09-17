// components/pixabay/PixabayImageGallery.tsx - Galeria de imagens Pixabay
'use client';

import React, { useState, useEffect } from 'react';
import { usePixabayImage, PixabayImageResult, PixabayVideoResult } from '@/hooks/usePixabayImage';
import Image from 'next/image';
import { 
  Search, 
  BookOpen, 
  BarChart3, 
  Beaker, 
  Lightbulb, 
  Play,
  Download,
  Heart,
  Eye,
  User,
  Tag,
  ExternalLink,
  Loader2,
  AlertCircle,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';

interface PixabayImageGalleryProps {
  initialQuery?: string;
  initialSubject?: string;
  onImageSelect?: (image: PixabayImageResult) => void;
  onVideoSelect?: (video: PixabayVideoResult) => void;
  showFilters?: boolean;
  maxHeight?: string;
}

export default function PixabayImageGallery({
  initialQuery = '',
  initialSubject = '',
  onImageSelect,
  onVideoSelect,
  showFilters = true,
  maxHeight = '600px'
}: PixabayImageGalleryProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<'education' | 'science' | 'business' | 'backgrounds' | 'nature' | 'people'>('education');
  const [searchType, setSearchType] = useState<'images' | 'videos' | 'both'>('images');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const { 
    data, 
    loading, 
    error, 
    searchImages, 
    searchBySubject, 
    searchForPresentation, 
    searchScienceImages,
    searchInspirationalImages,
    searchVideos 
  } = usePixabayImage({
    query: searchQuery,
    page: currentPage,
    perPage,
    category: selectedCategory,
    subject: selectedSubject,
    type: searchType
  }, false);

  const subjects = [
    { id: 'matematica', name: 'Matemática', icon: '🔢' },
    { id: 'portugues', name: 'Português', icon: '📚' },
    { id: 'historia', name: 'História', icon: '🏛️' },
    { id: 'geografia', name: 'Geografia', icon: '🌍' },
    { id: 'ciencias', name: 'Ciências', icon: '🔬' },
    { id: 'fisica', name: 'Física', icon: '⚡' },
    { id: 'quimica', name: 'Química', icon: '🧪' },
    { id: 'biologia', name: 'Biologia', icon: '🌱' },
    { id: 'artes', name: 'Artes', icon: '🎨' },
    { id: 'educacao-fisica', name: 'Educação Física', icon: '🏃' }
  ];

  const categories = [
    { id: 'education', name: 'Educação', icon: BookOpen },
    { id: 'science', name: 'Ciência', icon: Beaker },
    { id: 'business', name: 'Negócios', icon: BarChart3 },
    { id: 'backgrounds', name: 'Fundos', icon: Grid3X3 },
    { id: 'nature', name: 'Natureza', icon: Tag },
    { id: 'people', name: 'Pessoas', icon: User }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchImages({
        query: searchQuery,
        page: 1,
        perPage,
        category: selectedCategory,
        type: searchType
      });
      setCurrentPage(1);
    }
  };

  const handleSubjectSearch = (subject: string) => {
    setSelectedSubject(subject);
    searchBySubject(subject, 1, perPage);
    setCurrentPage(1);
  };

  const handlePresentationSearch = () => {
    if (searchQuery.trim()) {
      searchForPresentation(searchQuery, 1, perPage);
      setCurrentPage(1);
    }
  };

  const handleScienceSearch = () => {
    if (searchQuery.trim()) {
      searchScienceImages(searchQuery, 1, perPage);
      setCurrentPage(1);
    }
  };

  const handleInspirationalSearch = () => {
    searchInspirationalImages(1, perPage);
    setCurrentPage(1);
  };

  const handleVideoSearch = () => {
    if (searchQuery.trim()) {
      searchVideos(searchQuery, 1, perPage);
      setCurrentPage(1);
    }
  };

  const handleImageClick = (item: PixabayImageResult | PixabayVideoResult) => {
    if ('duration' in item) {
      onVideoSelect?.(item as PixabayVideoResult);
    } else {
      onImageSelect?.(item as PixabayImageResult);
    }
  };

  const renderImageCard = (item: PixabayImageResult | PixabayVideoResult) => {
    const isVideo = 'duration' in item;
    
    return (
      <div
        key={item.id}
        className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleImageClick(item)}
      >
        <div className="relative aspect-video">
          <Image
            src={item.thumbnail}
            alt={item.description}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <Play className="w-12 h-12 text-white" />
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {isVideo ? `${(item as PixabayVideoResult).duration}s` : `${item.width}x${item.height}`}
          </div>
        </div>
        
        <div className="p-3">
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{item.author}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {item.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.views.toLocaleString()}</span>
                </div>
              )}
              
              {item.likes && (
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{item.likes}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Galeria de Imagens Educacionais
        </h2>
        <p className="text-gray-600">
          Encontre imagens e vídeos perfeitos para suas aulas e apresentações
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar imagens educacionais..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Search Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Buscar</span>
            </button>
            
            <button
              onClick={handlePresentationSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Apresentação</span>
            </button>
            
            <button
              onClick={handleScienceSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Beaker className="w-4 h-4" />
              <span>Ciência</span>
            </button>
            
            <button
              onClick={handleInspirationalSearch}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Inspiradoras</span>
            </button>
            
            <button
              onClick={handleVideoSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Vídeos</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Categories */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as any)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Mode */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Quick Access */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Disciplinas</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSearch(subject.id)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span className="text-lg">{subject.icon}</span>
              <span>{subject.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Buscando imagens...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        )}

        {data && !loading && !error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {data.metadata.totalResults} resultados encontrados
              </h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Página {data.metadata.page}
                </span>
              </div>
            </div>

            {data.data.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {data.data.map(renderImageCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma imagem encontrada</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tente ajustar sua busca ou usar termos diferentes
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
