'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, User, Calendar, FileText, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { BookData, OpenLibraryService } from '@/lib/services/openlibrary-service';

interface OpenLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

export function OpenLibraryModal({ isOpen, onClose, searchQuery = '', className = '' }: OpenLibraryModalProps) {
  const [books, setBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchBooks(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const searchBooks = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await OpenLibraryService.searchBooks(query, 10);
      setBooks(result.books);
      setTotalResults(result.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar livros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks(searchTerm);
  };

  const handleBookClick = (book: BookData) => {
    if (book.url) {
      window.open(book.url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Biblioteca Digital</h2>
              <p className="text-blue-100">Pesquise livros na OpenLibrary</p>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o título, autor ou assunto do livro..."
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
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <BookOpen className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar livros</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => searchBooks(searchTerm)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {books.length > 0 && !isLoading && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {totalResults > 0 && (
                  <span>Encontrados {totalResults} livros</span>
                )}
              </div>
              
              <div className="grid gap-4">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleBookClick(book)}
                  >
                    <div className="flex gap-4">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={`Capa de ${book.title}`}
                            className="w-20 h-28 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-28 bg-gray-200 rounded border flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {book.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{OpenLibraryService.formatAuthor(book.author)}</span>
                          </div>
                          
                          {book.publishDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{book.publishDate}</span>
                            </div>
                          )}
                          
                          {book.pages && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{book.pages} páginas</span>
                            </div>
                          )}
                          
                          {book.language && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>{book.language}</span>
                            </div>
                          )}
                        </div>

                        {book.description && (
                          <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                            {OpenLibraryService.formatDescription(book.description)}
                          </p>
                        )}

                        {book.subjects && book.subjects.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {book.subjects.slice(0, 3).map((subject, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-blue-600">
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Ver detalhes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {books.length === 0 && !isLoading && !error && searchTerm && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum livro encontrado</h3>
              <p className="text-gray-600">Tente uma busca diferente ou verifique a ortografia.</p>
            </div>
          )}

          {!searchTerm && !isLoading && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pesquise por livros</h3>
              <p className="text-gray-600">Digite o título, autor ou assunto do livro que você está procurando.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
