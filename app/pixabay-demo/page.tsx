// app/pixabay-demo/page.tsx - Página de demonstração da API Pixabay
'use client';

import React, { useState } from 'react';
import PixabayImageGallery from '@/components/pixabay/PixabayImageGallery';
import { PixabayImageGrid } from '@/components/pixabay/PixabayImageGrid';
import { usePixabayImage } from '@/hooks/usePixabayImage';
import { 
  BookOpen, 
  BarChart3, 
  Beaker, 
  Lightbulb, 
  Play,
  Search,
  Image as ImageIcon,
  Video,
  Download,
  Heart,
  Eye
} from 'lucide-react';

export default function PixabayDemoPage() {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageSelect = (image: any) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleVideoSelect = (video: any) => {
    setSelectedImage(video);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                API Pixabay para Imagens Educacionais
              </h1>
              <p className="mt-2 text-gray-600">
                Demonstração completa da integração com a API Pixabay para conteúdo educacional
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ImageIcon className="w-5 h-5" />
              <span>Powered by Pixabay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Educacional</h3>
            </div>
            <p className="text-sm text-gray-600">
              Imagens otimizadas para contexto educacional com foco em aprendizado
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Apresentações</h3>
            </div>
            <p className="text-sm text-gray-600">
              Conteúdo profissional ideal para slides e apresentações educativas
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Beaker className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Ciência</h3>
            </div>
            <p className="text-sm text-gray-600">
              Imagens científicas e tecnológicas para disciplinas STEM
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Video className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Vídeos</h3>
            </div>
            <p className="text-sm text-gray-600">
              Vídeos educacionais curtos para complementar o aprendizado
            </p>
          </div>
        </div>

        {/* API Statistics */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estatísticas da API Pixabay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5000</div>
              <div className="text-sm text-gray-600">Requisições por hora</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">200</div>
              <div className="text-sm text-gray-600">Imagens por requisição</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Conteúdo educacional</div>
            </div>
          </div>
        </div>

        {/* Main Gallery */}
        <PixabayImageGallery
          initialQuery="education"
          onImageSelect={handleImageSelect}
          onVideoSelect={handleVideoSelect}
          showFilters={true}
        />
      </div>

      {/* Modal for selected image/video */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedImage.description}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative aspect-video mb-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.description}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Autor:</span>
                      <span className="text-gray-900">{selectedImage.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensões:</span>
                      <span className="text-gray-900">{selectedImage.width} × {selectedImage.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qualidade:</span>
                      <span className="text-gray-900 capitalize">{selectedImage.quality}</span>
                    </div>
                    {selectedImage.views && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visualizações:</span>
                        <span className="text-gray-900">{selectedImage.views.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedImage.likes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Curtidas:</span>
                        <span className="text-gray-900">{selectedImage.likes}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <a
                      href={selectedImage.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar</span>
                    </a>
                    
                    <a
                      href={selectedImage.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver no Pixabay</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
