'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Calculator, Calendar, Hash, Loader2, Shuffle, BookOpen } from 'lucide-react';
import { NumberFact, DateFact, YearFact, NumbersAPIService } from '@/lib/services/numbersapi-service';

interface NumbersAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

export function NumbersAPIModal({ isOpen, onClose, searchQuery = '', className = '' }: NumbersAPIModalProps) {
  const [fact, setFact] = useState<NumberFact | DateFact | YearFact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [factType, setFactType] = useState<'trivia' | 'math' | 'date' | 'year'>('trivia');

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchFact(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const searchFact = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      let result: NumberFact | DateFact | YearFact;
      
      // Verifica se é uma data (formato DD/MM ou MM/DD)
      const dateMatch = query.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (dateMatch) {
        const [, day, month] = dateMatch;
        result = await NumbersAPIService.getDateFact(parseInt(month), parseInt(day));
        setFactType('date');
      }
      // Verifica se é um ano (4 dígitos)
      else if (/^\d{4}$/.test(query) && NumbersAPIService.isValidYear(parseInt(query))) {
        result = await NumbersAPIService.getYearFact(parseInt(query));
        setFactType('year');
      }
      // Verifica se é um número
      else if (/^\d+$/.test(query) && NumbersAPIService.isValidNumber(parseInt(query))) {
        if (factType === 'math') {
          result = await NumbersAPIService.getMathFact(parseInt(query));
        } else {
          result = await NumbersAPIService.getTriviaFact(parseInt(query));
        }
      }
      else {
        throw new Error('Formato inválido. Use um número, data (DD/MM) ou ano (YYYY)');
      }
      
      setFact(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar fato');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomFact = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await NumbersAPIService.getRandomFact(factType);
      setFact(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar fato aleatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchFact(searchTerm);
  };

  const handleTypeChange = (type: 'trivia' | 'math' | 'date' | 'year') => {
    setFactType(type);
    if (searchTerm.trim()) {
      searchFact(searchTerm);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-2xl w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-teal-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Curiosidades Numéricas</h2>
              <p className="text-green-100">Descubra fatos interessantes sobre números</p>
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
                placeholder="Digite um número, data (DD/MM) ou ano (YYYY)..."
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

          {/* Type Selector */}
          <div className="flex gap-2 mb-4">
            {[
              { value: 'trivia', label: 'Curiosidade', icon: BookOpen },
              { value: 'math', label: 'Matemática', icon: Calculator },
              { value: 'date', label: 'Data', icon: Calendar },
              { value: 'year', label: 'Ano', icon: Hash }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleTypeChange(value as any)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  factType === value
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Random Button */}
          <button
            onClick={getRandomFact}
            disabled={isLoading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Fato Aleatório
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Calculator className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar fato</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => searchFact(searchTerm)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {fact && !isLoading && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-8 mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {factType === 'trivia' && <BookOpen className="w-8 h-8 text-green-600" />}
                  {factType === 'math' && <Calculator className="w-8 h-8 text-green-600" />}
                  {factType === 'date' && <Calendar className="w-8 h-8 text-green-600" />}
                  {factType === 'year' && <Hash className="w-8 h-8 text-green-600" />}
                  
                  <div className="text-2xl font-bold text-gray-900">
                    {factType === 'date' ? (fact as DateFact).date : 
                     factType === 'year' ? (fact as YearFact).year : 
                     (fact as NumberFact).number}
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full">
                    {NumbersAPIService.getFactTypeLabel(factType)}
                  </span>
                </div>
                
                <p className="text-lg text-gray-800 leading-relaxed">
                  {NumbersAPIService.formatFactText(fact.text)}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {fact.found ? 'Fato encontrado na NumbersAPI' : 'Fato não encontrado'}
              </div>
            </div>
          )}

          {!fact && !isLoading && !error && (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descubra curiosidades numéricas</h3>
              <p className="text-gray-600 mb-4">
                Digite um número, data (DD/MM) ou ano (YYYY) para descobrir fatos interessantes.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• <strong>Números:</strong> 42, 100, 365</p>
                <p>• <strong>Datas:</strong> 25/12, 01/01, 14/02</p>
                <p>• <strong>Anos:</strong> 2000, 1969, 2020</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
