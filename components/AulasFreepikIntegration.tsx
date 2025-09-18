'use client';

import { useState } from 'react';
import { ImageIcon, Plus, Search } from 'lucide-react';
import FreepikImageSelector from './FreepikImageSelector';

interface AulasFreepikIntegrationProps {
  onImageAdd?: (imageUrl: string, imageData: any) => void;
  className?: string;
}

export default function AulasFreepikIntegration({
  onImageAdd,
  className = '',
}: AulasFreepikIntegrationProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageSelect = (imageUrl: string, imageData: any) => {
    if (onImageAdd) {
      onImageAdd(imageUrl, imageData);
    }
    setIsSelectorOpen(false);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setIsSelectorOpen(true);
  };

  // Common educational search terms
  const quickSearches = [
    'mathematics',
    'science',
    'biology',
    'chemistry',
    'physics',
    'history',
    'geography',
    'literature',
    'art',
    'technology',
    'education',
    'school',
    'student',
    'teacher',
    'classroom',
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
          Add Images from Freepik
        </h3>
        <button
          onClick={() => setIsSelectorOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Browse Images
        </button>
      </div>

      {/* Quick Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Search
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for educational images..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleQuickSearch(searchQuery)}
            disabled={!searchQuery.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Educational Topics
        </label>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((term) => (
            <button
              key={term}
              onClick={() => handleQuickSearch(term)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-1">How to use:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Browse Images" to open the full Freepik search interface</li>
          <li>Use quick search for common educational terms</li>
          <li>Select images to add them to your lesson content</li>
          <li>AI generation is available for custom image creation</li>
        </ul>
      </div>

      {/* Freepik Image Selector Modal */}
      <FreepikImageSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onImageSelect={handleImageSelect}
        searchQuery={searchQuery}
        resourceType="images"
        limit={12}
      />
    </div>
  );
}
