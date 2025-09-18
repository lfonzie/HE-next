'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';

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

interface SearchResults {
  data: FreepikResource[];
  total: number;
  page: number;
  per_page: number;
}

export default function FreepikSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FreepikResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('images');
  const [limit, setLimit] = useState(12);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const resourceTypes = [
    { value: 'images', label: 'Images', icon: '🖼️' },
    { value: 'templates', label: 'Templates', icon: '📄' },
    { value: 'videos', label: 'Videos', icon: '🎥' },
    { value: 'icons', label: 'Icons', icon: '🎯' },
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `/api/freepik/search?query=${encodeURIComponent(query)}&limit=${limit}&type=${selectedType}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data: SearchResults = await response.json();
      setResults(data.data || []);
      setTotalResults(data.total || 0);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // AI generation not available in current plan
  const handleAiGeneration = async () => {
    setError('AI generation is not available in your current Freepik plan. Please upgrade to access AI features.');
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/freepik/download?id=${resourceId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const data = await response.json();
      
      if (data.download_url) {
        // Open download URL in new tab
        window.open(data.download_url, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Freepik Resource Search
          </h1>
          <p className="text-lg text-gray-600">
            Search and discover high-quality vectors, photos, and AI-generated content
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                  onClick={() => setSelectedType(type.value)}
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
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* AI Generation Section */}
          <div className="border-t pt-4 mt-4">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({totalResults} found)
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image Preview */}
                <div className="aspect-square bg-gray-100 relative group">
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
                  
                  {/* Download Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(resource.id)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity duration-200 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Resource Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600 capitalize">
                      {resource.type}
                    </span>
                  </div>

                  {resource.author && (
                    <div className="flex items-center gap-2 mb-2">
                      {resource.author.avatar_url && (
                        <img
                          src={resource.author.avatar_url}
                          alt={resource.author.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-600">
                        by {resource.author.name}
                      </span>
                    </div>
                  )}

                  {resource.dimensions && (
                    <div className="text-xs text-gray-500 mb-2">
                      {resource.dimensions.width} × {resource.dimensions.height}
                    </div>
                  )}

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{resource.tags.length - 3}
                        </span>
                      )}
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
    </div>
  );
}
