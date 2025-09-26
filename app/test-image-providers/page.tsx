'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageResult {
  url: string;
  title: string;
  description: string;
  provider: string;
  attribution: string;
  license: string;
  author: string;
  sourceUrl: string;
  score: number;
  id: string;
  premium: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface TestResult {
  provider: string;
  success: boolean;
  images: ImageResult[];
  error?: string;
  duration: number;
  metadata?: any;
}

export default function TestImageProvidersPage() {
  const [query, setQuery] = useState('reciclagem');
  const [subject, setSubject] = useState('ciencias');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testProviders = async () => {
    setLoading(true);
    setResults([]);
    setLogs([]);
    
    addLog(`🚀 Iniciando teste com query: "${query}", subject: "${subject}", count: ${count}`);

    const providers = [
      { name: 'Freepik Search', endpoint: '/api/aulas/freepik-search' },
      { name: 'Smart Search', endpoint: '/api/images/smart-search' },
      { name: 'Enhanced Search', endpoint: '/api/images/enhanced-search' },
      { name: 'Pixabay Direct', endpoint: '/api/pixabay' },
      { name: 'Unsplash Search', endpoint: '/api/unsplash/search' },
      { name: 'Wikimedia Search', endpoint: '/api/wikimedia/search' }
    ];

    const testResults: TestResult[] = [];

    for (const provider of providers) {
      addLog(`🔍 Testando ${provider.name}...`);
      const startTime = Date.now();

      try {
        const response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            subject,
            count,
            action: provider.name === 'Pixabay Direct' ? 'search' : undefined
          }),
        });

        const duration = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          addLog(`✅ ${provider.name}: ${data.images?.length || data.data?.length || 0} imagens encontradas em ${duration}ms`);
          
          testResults.push({
            provider: provider.name,
            success: true,
            images: data.images || data.data || [],
            duration,
            metadata: data
          });
        } else {
          const errorText = await response.text();
          addLog(`❌ ${provider.name}: Erro ${response.status} - ${errorText}`);
          
          testResults.push({
            provider: provider.name,
            success: false,
            images: [],
            error: `HTTP ${response.status}: ${errorText}`,
            duration
          });
        }
      } catch (error: any) {
        const duration = Date.now() - startTime;
        addLog(`💥 ${provider.name}: Erro de rede - ${error.message}`);
        
        testResults.push({
          provider: provider.name,
          success: false,
          images: [],
          error: error.message,
          duration
        });
      }
    }

    setResults(testResults);
    addLog(`🏁 Teste concluído! ${testResults.filter(r => r.success).length}/${testResults.length} provedores funcionaram`);
    setLoading(false);
  };

  const testSpecificProvider = async (providerName: string, endpoint: string) => {
    addLog(`🎯 Testando apenas ${providerName}...`);
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          subject,
          count,
          action: providerName === 'Pixabay Direct' ? 'search' : undefined
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ ${providerName}: ${data.images?.length || data.data?.length || 0} imagens encontradas em ${duration}ms`);
        
        // Mostrar detalhes da resposta
        addLog(`📊 Detalhes: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        addLog(`❌ ${providerName}: Erro ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      addLog(`💥 ${providerName}: Erro de rede - ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Teste de Provedores de Imagem
        </h1>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configurações do Teste</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query/Tema
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: reciclagem, sistema solar, fotossíntese"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disciplina
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ciencias">Ciências</option>
                <option value="matematica">Matemática</option>
                <option value="portugues">Português</option>
                <option value="historia">História</option>
                <option value="geografia">Geografia</option>
                <option value="fisica">Física</option>
                <option value="quimica">Química</option>
                <option value="biologia">Biologia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testProviders}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Testando...' : '🚀 Testar Todos os Provedores'}
            </button>
            
            <button
              onClick={() => {
                setLogs([]);
                setResults([]);
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Logs de Debug</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log ainda. Execute um teste para ver os logs.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">📊 Resultados dos Testes</h2>
            
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {result.success ? '✅' : '❌'} {result.provider}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {result.duration}ms | {result.images.length} imagens
                  </div>
                </div>

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-800 text-sm">
                      <strong>Erro:</strong> {result.error}
                    </p>
                  </div>
                )}

                {result.metadata && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <details>
                      <summary className="cursor-pointer text-blue-800 text-sm font-medium">
                        📊 Metadados da Resposta
                      </summary>
                      <pre className="mt-2 text-xs text-blue-700 overflow-x-auto">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {result.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
                          <Image
                            src={image.url}
                            alt={image.title}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.svg';
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {image.title}
                          </h4>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong>Provedor:</strong> {image.provider}</div>
                            <div><strong>Score:</strong> {image.score?.toFixed(2) || 'N/A'}</div>
                            <div><strong>Autor:</strong> {image.author || 'N/A'}</div>
                            <div><strong>Licença:</strong> {image.license || 'N/A'}</div>
                            {image.dimensions && (
                              <div><strong>Dimensões:</strong> {image.dimensions.width}x{image.dimensions.height}</div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            <strong>Descrição:</strong> {image.description || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Nenhuma imagem encontrada
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Testes Rápidos */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Testes Rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Freepik Search', endpoint: '/api/aulas/freepik-search' },
              { name: 'Smart Search', endpoint: '/api/images/smart-search' },
              { name: 'Enhanced Search', endpoint: '/api/images/enhanced-search' },
              { name: 'Pixabay Direct', endpoint: '/api/pixabay' },
              { name: 'Unsplash Search', endpoint: '/api/unsplash/search' },
              { name: 'Wikimedia Search', endpoint: '/api/wikimedia/search' }
            ].map((provider, index) => (
              <button
                key={index}
                onClick={() => testSpecificProvider(provider.name, provider.endpoint)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                🎯 {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* Temas Sugeridos */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">💡 Temas Sugeridos para Teste</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'reciclagem', 'sistema solar', 'fotossíntese', 'inteligência artificial',
              'matemática', 'história do Brasil', 'geografia', 'química',
              'biologia', 'física', 'literatura', 'arte'
            ].map((theme, index) => (
              <button
                key={index}
                onClick={() => setQuery(theme)}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
