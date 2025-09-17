// components/pixabay/PixabayImageCard.tsx - Card individual para imagem Pixabay
'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Download, 
  Heart, 
  Eye, 
  User, 
  ExternalLink,
  Tag,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface PixabayImageCardProps {
  image: {
    id: string;
    url: string;
    thumbnail: string;
    largeUrl?: string;
    fullHdUrl?: string;
    description: string;
    author: string;
    authorUrl: string;
    source: string;
    downloadUrl: string;
    width: number;
    height: number;
    tags: string[];
    quality: string;
    educational: boolean;
    views?: number;
    downloads?: number;
    likes?: number;
    comments?: number;
    userImage?: string;
  };
  showDetails?: boolean;
  onSelect?: (image: any) => void;
  className?: string;
}

export default function PixabayImageCard({
  image,
  showDetails = true,
  onSelect,
  className = ''
}: PixabayImageCardProps) {
  const handleImageClick = () => {
    onSelect?.(image);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(image.downloadUrl, '_blank');
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(image.authorUrl, '_blank');
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={handleImageClick}
    >
      {/* Image */}
      <div className="relative aspect-video group">
        <Image
          src={image.url}
          alt={image.description}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
        
        {/* Quality Badge */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <ImageIcon className="w-3 h-3" />
          <span className="capitalize">{image.quality}</span>
        </div>
        
        {/* Educational Badge */}
        {image.educational && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Educacional
          </div>
        )}
        
        {/* Download Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDownload}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-md transition-all duration-200"
            title="Baixar imagem"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {showDetails && (
        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {image.description}
          </p>
          
          {/* Author */}
          <div className="flex items-center space-x-2 mb-3">
            {image.userImage && (
              <Image
                src={image.userImage}
                alt={image.author}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <button
              onClick={handleAuthorClick}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{image.author}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {image.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{image.views.toLocaleString()}</span>
                </div>
              )}
              
              {image.likes && (
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{image.likes}</span>
                </div>
              )}
              
              {image.downloads && (
                <div className="flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>{image.downloads}</span>
                </div>
              )}
            </div>
            
            <div className="text-gray-400">
              {image.width} × {image.height}
            </div>
          </div>
          
          {/* Tags */}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
              {image.tags.length > 5 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{image.tags.length - 5} mais
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para exibir múltiplas imagens em grid
interface PixabayImageGridProps {
  images: any[];
  onImageSelect?: (image: any) => void;
  columns?: 2 | 3 | 4 | 5;
  showDetails?: boolean;
}

export function PixabayImageGrid({
  images,
  onImageSelect,
  columns = 3,
  showDetails = true
}: PixabayImageGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {images.map((image) => (
        <PixabayImageCard
          key={image.id}
          image={image}
          showDetails={showDetails}
          onSelect={onImageSelect}
        />
      ))}
    </div>
  );
}

// Componente para exibir uma imagem específica por ID
interface PixabayImageByIdProps {
  imageId: number;
  onImageSelect?: (image: any) => void;
  showDetails?: boolean;
  className?: string;
}

export function PixabayImageById({
  imageId,
  onImageSelect,
  showDetails = true,
  className = ''
}: PixabayImageByIdProps) {
  const [image, setImage] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/pixabay/${imageId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setImage(result.data);
        } else {
          setError(result.error || 'Erro ao carregar imagem');
        }
      } catch (err) {
        console.error('Erro ao buscar imagem:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageId]);

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-300 aspect-video rounded mb-4"></div>
          <div className="space-y-2">
            <div className="bg-gray-300 h-4 rounded"></div>
            <div className="bg-gray-300 h-4 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <p className="text-red-600">Erro ao carregar imagem: {error}</p>
      </div>
    );
  }

  if (!image) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600">Imagem não encontrada</p>
      </div>
    );
  }

  return (
    <PixabayImageCard
      image={image}
      showDetails={showDetails}
      onSelect={onImageSelect}
      className={className}
    />
  );
}
