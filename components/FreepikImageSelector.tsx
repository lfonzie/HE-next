'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Image as ImageIcon, Sparkles, X, Check } from 'lucide-react';

interface FreepikResource {
  id: string;
  title: string;
  preview_url: string;
  download_url?: string;
  type: string;
  premium: boolean;
  author: {
    name: string;
    avatar_url?: string;
  };
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

interface FreepikImageSelectorProps {
  onImageSelect?: (imageUrl: string, imageData: FreepikResource) => void;
  onClose?: () => void;
  isOpen?: boolean;
  searchQuery?: string;
  resourceType?: 'images' | 'templates' | 'videos' | 'icons';
  limit?: number;
}

export default function FreepikImageSelector({
  onImageSelect,
  onClose,
  isOpen = false,
  searchQuery = '',
  resourceType = 'vector',
  limit = 12,
}: FreepikImageSelectorProps) {
  const [query, setQuery] = useState(searchQuery);
  const [results, setResults] = useState<FreepikResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(resourceType);
  const [selectedImage, setSelectedImage] = useState<FreepikResource | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const resourceTypes = [
    { value: 'images', label: 'Images', icon: '🖼️' },
    { value: 'templates', label: 'Templates', icon: '📄' },
    { value: 'videos', label: 'Videos', icon: '🎥' },
    { value: 'icons', label: 'Icons', icon: '🎯' },
  ];

  useEffect(() => {
    if (searchQuery && isOpen) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery, isOpen]);

  const handleSearch = async (searchTerm?: string) => {
    const searchQuery = searchTerm || query;
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/freepik/search?query=${encodeURIComponent(searchQuery)}&limit=${limit}&type=${selectedType}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt for AI generation');
      return;
    }

    setAiGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/freepik/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          style: 'realistic',
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI generation failed');
      }

      const data = await response.json();
      // Handle AI generation response - this would depend on Freepik's actual response format
      console.log('AI Generation result:', data);
      setAiPrompt('');
      
      // If the response includes generated images, add them to results
      if (data.data && Array.isArray(data.data)) {
        setResults(prev => [...data.data, ...prev]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImageSelect = (resource: FreepikResource) => {
    setSelectedImage(resource);
    if (onImageSelect) {
      onImageSelect(resource.preview_url, resource);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedImage && onImageSelect) {
      onImageSelect(selectedImage.preview_url, selectedImage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Select Image from Freepik
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for vectors, photos, or illustrations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resource Type Filter */}
            <div className="flex gap-2">
              {resourceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as any)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === type.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* AI Generation Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              AI Image Generation
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAiGeneration}
                disabled={aiGenerating}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((resource) => (
                <div
                  key={resource.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedImage?.id === resource.id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleImageSelect(resource)}
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={resource.preview_url}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {resource.premium && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Premium
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {selectedImage?.id === resource.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-2">
                          <Check className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resource Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">
                      {resource.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600 capitalize">
                        {resource.type}
                      </span>
                    </div>

                    {resource.author && (
                      <div className="text-xs text-gray-500">
                        by {resource.author.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or selecting a different resource type.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && !query && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start your search
              </h3>
              <p className="text-gray-600">
                Enter a search term above to find vectors, photos, and illustrations.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedImage ? (
              <span>Selected: {selectedImage.title}</span>
            ) : (
              <span>No image selected</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedImage}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
