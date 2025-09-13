"use client"

import React from "react";
import { Citation } from "@/types/chat";
import { ExternalLink, Clock } from "lucide-react";

interface WebSearchCitationsProps {
  citations: Citation[];
  usedWebSearch: boolean;
  searchTime?: number;
  className?: string;
}

export const WebSearchCitations: React.FC<WebSearchCitationsProps> = ({
  citations,
  usedWebSearch,
  searchTime,
  className = ""
}) => {
  if (!usedWebSearch || !citations.length) return null;

  return (
    <div className={`web-search-citations ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="fas fa-search text-white text-xs"></i>
          </div>
          <h4 className="text-sm font-semibold text-blue-900">Fontes Consultadas</h4>
          {searchTime && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Clock className="w-3 h-3" />
              {searchTime}ms
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {citations.map((citation, index) => (
            <div key={index} className="bg-white rounded border border-blue-100 p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-blue-900 mb-1 line-clamp-2">
                    {citation.title}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {citation.snippet}
                  </p>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver fonte
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
