'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, BarChart3, Globe, TrendingUp, Calendar, Loader2, Filter } from 'lucide-react';
import { WorldBankIndicator, WorldBankDataPoint, WorldBankAPIService } from '@/lib/services/worldbank-service';

interface WorldBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  className?: string;
}

export function WorldBankModal({ isOpen, onClose, searchQuery = '', className = '' }: WorldBankModalProps) {
  const [indicators, setIndicators] = useState<WorldBankIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<WorldBankIndicator | null>(null);
  const [indicatorData, setIndicatorData] = useState<WorldBankDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [showData, setShowData] = useState(false);

  const countries = [
    { code: 'BR', name: 'Brasil' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'Índia' },
    { code: 'JP', name: 'Japão' },
    { code: 'DE', name: 'Alemanha' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'FR', name: 'França' },
    { code: 'IT', name: 'Itália' },
    { code: 'CA', name: 'Canadá' }
  ];

  useEffect(() => {
    if (isOpen && searchQuery) {
      setSearchTerm(searchQuery);
      searchIndicators(searchQuery);
    } else if (isOpen) {
      loadPopularIndicators();
    }
  }, [isOpen, searchQuery]);

  const searchIndicators = async (query: string) => {
    if (!query.trim()) {
      loadPopularIndicators();
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowData(false);
    
    try {
      const result = await WorldBankAPIService.searchIndicators(query, 10);
      setIndicators(result.indicators);
      setTotalResults(result.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar indicadores');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularIndicators = async () => {
    setIsLoading(true);
    setError(null);
    setShowData(false);
    
    try {
      const indicators = await WorldBankAPIService.getPopularIndicators();
      setIndicators(indicators);
      setTotalResults(indicators.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores populares');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndicatorData = async (indicator: WorldBankIndicator) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await WorldBankAPIService.getIndicatorData(indicator.id, selectedCountry, 2010, 2023);
      setIndicatorData(result.data);
      setSelectedIndicator(indicator);
      setShowData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do indicador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchIndicators(searchTerm);
  };

  const handleIndicatorClick = (indicator: WorldBankIndicator) => {
    loadIndicatorData(indicator);
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    if (selectedIndicator) {
      loadIndicatorData(selectedIndicator);
    }
  };

  const formatChartData = () => {
    return indicatorData
      .filter(point => point.value !== null)
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .slice(-10); // Últimos 10 anos
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Dados Mundiais</h2>
              <p className="text-indigo-100">Explore indicadores socioeconômicos globais</p>
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
                placeholder="Digite palavras-chave para buscar indicadores..."
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

          {/* Country Filter */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="px-3 py-2 bg-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code} className="text-gray-900">
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <BarChart3 className="w-16 h-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao buscar dados</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => searchIndicators(searchTerm)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!showData && indicators.length > 0 && !isLoading && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {totalResults > 0 && (
                  <span>Encontrados {totalResults} indicadores</span>
                )}
              </div>
              
              <div className="grid gap-4">
                {indicators.map((indicator, index) => (
                  <div
                    key={indicator.id || index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleIndicatorClick(indicator)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {indicator.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>{indicator.source}</span>
                          </div>
                          
                          {indicator.topics && indicator.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {indicator.topics.slice(0, 3).map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                                >
                                  {topic.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {indicator.sourceNote && (
                          <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                            {indicator.sourceNote}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-indigo-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Ver dados</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showData && selectedIndicator && !isLoading && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setShowData(false)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-2 mb-4"
                >
                  ← Voltar aos indicadores
                </button>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedIndicator.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {WorldBankAPIService.getCountryName(selectedCountry)} • {selectedIndicator.source}
                </p>
              </div>

              {indicatorData.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados Históricos</h4>
                    
                    <div className="grid gap-4">
                      {formatChartData().map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{point.date}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {WorldBankAPIService.formatValue(point.value!)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {WorldBankAPIService.getIndicatorCategory(selectedIndicator.id)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 text-center">
                    <p>Dados fornecidos pelo Banco Mundial</p>
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
                  <p className="text-gray-600">Não há dados disponíveis para este indicador no país selecionado.</p>
                </div>
              )}
            </div>
          )}

          {indicators.length === 0 && !isLoading && !error && searchTerm && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum indicador encontrado</h3>
              <p className="text-gray-600">Tente uma busca diferente ou explore os indicadores populares.</p>
            </div>
          )}

          {!searchTerm && !isLoading && !showData && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore dados mundiais</h3>
              <p className="text-gray-600 mb-4">
                Digite palavras-chave para buscar indicadores ou explore os mais populares.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• <strong>Economia:</strong> PIB, inflação, desemprego</p>
                <p>• <strong>Educação:</strong> alfabetização, gastos educacionais</p>
                <p>• <strong>Saúde:</strong> expectativa de vida, mortalidade</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
