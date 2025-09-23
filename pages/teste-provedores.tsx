import { useState } from 'react';
import Head from 'next/head';

interface ImageResult {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  source: 'unsplash' | 'pixabay' | 'wikimedia' | 'bing' | 'pexels';
  width: number;
  height: number;
  tags: string[];
  relevanceScore: number;
  educationalSuitability: number;
  qualityScore: number;
  downloadUrl?: string;
}

interface ProviderTestResult {
  provider: string;
  success: boolean;
  images: ImageResult[];
  count: number;
  error?: string;
  responseTime: number;
}

interface TestResults {
  query: string;
  subject: string;
  results: ProviderTestResult[];
  totalImages: number;
  totalTime: number;
}

export default function TesteProvedores() {
  const [query, setQuery] = useState('photosynthesis biology');
  const [subject, setSubject] = useState('biologia');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  const providers = [
    { name: 'Unsplash', key: 'unsplash', color: 'bg-green-100', textColor: 'text-green-800' },
    { name: 'Pixabay', key: 'pixabay', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { name: 'Wikimedia', key: 'wikimedia', color: 'bg-purple-100', textColor: 'text-purple-800' },
    { name: 'Bing Images', key: 'bing', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { name: 'Pexels', key: 'pexels', color: 'bg-red-100', textColor: 'text-red-800' }
  ];

  const testProvider = async (providerKey: string): Promise<ProviderTestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/images/test-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: providerKey,
          query,
          subject,
          count: 3
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        provider: providerKey,
        success: data.success,
        images: data.images || [],
        count: data.images?.length || 0,
        error: data.error,
        responseTime
      };
    } catch (error) {
      return {
        provider: providerKey,
        success: false,
        images: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        responseTime: Date.now() - startTime
      };
    }
  };

  const testAllProviders = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Testar todos os provedores em paralelo
      const results = await Promise.all(
        providers.map(provider => testProvider(provider.key))
      );

      const totalImages = results.reduce((sum, result) => sum + result.count, 0);
      const totalTime = Date.now() - startTime;

      setTestResults({
        query,
        subject,
        results,
        totalImages,
        totalTime
      });
    } catch (error) {
      console.error('Erro ao testar provedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSmartSearch = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/images/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          subject,
          count: 5
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Converter resultado do smart search para o formato de teste
      const smartResult: ProviderTestResult = {
        provider: 'smart-search',
        success: data.success,
        images: data.images || [],
        count: data.images?.length || 0,
        error: data.error,
        responseTime
      };

      setTestResults({
        query,
        subject,
        results: [smartResult],
        totalImages: data.images?.length || 0,
        totalTime: responseTime
      });
    } catch (error) {
      console.error('Erro ao testar busca inteligente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Teste de Provedores de Imagens - HubEdu</title>
        <meta name="description" content="Teste todos os provedores de imagens do sistema" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Teste de Provedores de Imagens
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query de Busca
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: photosynthesis biology"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: biologia"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={testAllProviders}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testando...' : '🔍 Testar Todos os Provedores'}
            </button>
            
            <button
              onClick={testSmartSearch}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testando...' : '🧠 Testar Busca Inteligente'}
            </button>
          </div>
        </div>

        {testResults && (
          <div className="space-y-6">
            {/* Resumo dos Resultados */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📊 Resumo dos Resultados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Query</div>
                  <div className="text-lg font-bold text-blue-900">{testResults.query}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Total de Imagens</div>
                  <div className="text-lg font-bold text-green-900">{testResults.totalImages}</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Tempo Total</div>
                  <div className="text-lg font-bold text-purple-900">{testResults.totalTime}ms</div>
                </div>
              </div>
            </div>

            {/* Resultados por Provedor */}
            <div className="space-y-4">
              {testResults.results.map((result, index) => {
                const provider = providers.find(p => p.key === result.provider);
                return (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${provider?.color} ${provider?.textColor}`}>
                          {provider?.name || result.provider}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <span className="text-green-600 text-sm">✅ Sucesso</span>
                          ) : (
                            <span className="text-red-600 text-sm">❌ Falha</span>
                          )}
                          
                          <span className="text-gray-500 text-sm">
                            {result.count} imagens • {result.responseTime}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <div className="text-red-800 text-sm">
                          <strong>Erro:</strong> {result.error}
                        </div>
                      </div>
                    )}

                    {result.images.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                              <img
                                src={image.thumbnail || image.url}
                                alt={image.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                            
                            <div className="p-3">
                              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                {image.title || 'Sem título'}
                              </h3>
                              
                              <div className="text-xs text-gray-500 mb-2">
                                <div>Autor: {image.author}</div>
                                <div>Dimensões: {image.width}x{image.height}</div>
                                <div>Score: {image.relevanceScore}</div>
                              </div>
                              
                              {image.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {image.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informações dos Provedores */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ℹ️ Informações dos Provedores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <div key={provider.key} className={`p-4 rounded-lg ${provider.color}`}>
                <h3 className={`font-bold ${provider.textColor} mb-2`}>
                  {provider.name}
                </h3>
                
                <div className="text-sm text-gray-600">
                  {provider.key === 'unsplash' && (
                    <>
                      <div>• API Key: UNSPLASH_ACCESS_KEY</div>
                      <div>• Qualidade: Excelente</div>
                      <div>• Conteúdo Educacional: Alto</div>
                    </>
                  )}
                  
                  {provider.key === 'pixabay' && (
                    <>
                      <div>• API Key: PIXABAY_API_KEY</div>
                      <div>• Qualidade: Boa</div>
                      <div>• Conteúdo Educacional: Médio</div>
                    </>
                  )}
                  
                  {provider.key === 'wikimedia' && (
                    <>
                      <div>• API Key: Não requer</div>
                      <div>• Qualidade: Variável</div>
                      <div>• Conteúdo Educacional: Excelente</div>
                    </>
                  )}
                  
                  {provider.key === 'bing' && (
                    <>
                      <div>• API Key: BING_SEARCH_API_KEY</div>
                      <div>• Qualidade: Boa</div>
                      <div>• Conteúdo Educacional: Médio</div>
                    </>
                  )}
                  
                  {provider.key === 'pexels' && (
                    <>
                      <div>• API Key: PEXELS_API_KEY</div>
                      <div>• Qualidade: Excelente</div>
                      <div>• Conteúdo Educacional: Médio</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

