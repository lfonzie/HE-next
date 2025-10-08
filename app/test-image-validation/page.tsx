'use client';

import { useState } from 'react';

interface ImageResult {
  url: string;
  title: string;
  description: string;
  provider: string;
  relevanceScore?: number;
}

interface SearchResponse {
  success: boolean;
  images: ImageResult[];
  found: number;
  requested: number;
  processingTime: number;
  cached: boolean;
  optimizedQuery: string;
  providers: string[];
  totalImagesFound: number;
  relevanceCheck?: string;
}

export default function TestImageValidationPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState('');

  const testCases = [
    { name: 'Metallica (Banda)', topic: 'Metallica' },
    { name: 'Beatles', topic: 'Beatles' },
    { name: 'Nikola Tesla', topic: 'Nikola Tesla' },
    { name: 'Steve Jobs', topic: 'Steve Jobs' },
    { name: 'Apple (Empresa)', topic: 'Apple empresa' },
    { name: 'DNA', topic: 'Como funciona o DNA' },
    { name: 'Fotossíntese', topic: 'fotossíntese' },
    { name: 'Sistema Solar', topic: 'sistema solar' },
  ];

  async function searchImages(searchTopic: string) {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/internal/images/fast-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: searchTopic,
          count: 6,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim()) {
      searchImages(topic.trim());
    }
  }

  function handleTestCase(testTopic: string) {
    setTopic(testTopic);
    searchImages(testTopic);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🔍 Teste de Validação de Imagens</h1>
        <p className="text-gray-400 mb-8">
          Sistema que filtra imagens irrelevantes (ex: Metallica não mostra metalurgia)
        </p>

        {/* Test Cases */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🧪 Casos de Teste Rápidos:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {testCases.map((testCase) => (
              <button
                key={testCase.topic}
                onClick={() => handleTestCase(testCase.topic)}
                disabled={loading}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                {testCase.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Digite um tópico para testar (ex: Metallica, Tesla, Beatles...)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '🔄 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-200">❌ Erro: {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Tópico Original</div>
                <div className="text-lg font-semibold">{topic}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Query Otimizada</div>
                <div className="text-lg font-semibold">{result.optimizedQuery}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Imagens Encontradas</div>
                <div className="text-lg font-semibold">
                  {result.found} / {result.totalImagesFound}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Tempo</div>
                <div className="text-lg font-semibold">{result.processingTime}ms</div>
              </div>
            </div>

            {/* Relevance Check */}
            {result.relevanceCheck && result.relevanceCheck !== 'OK' && (
              <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                <p className="text-yellow-200">
                  ⚠️ <strong>Validação:</strong> {result.relevanceCheck}
                </p>
                <p className="text-yellow-300 text-sm mt-2">
                  As imagens encontradas não eram relevantes ao tópico original, portanto foram filtradas.
                </p>
              </div>
            )}

            {/* Cache Status */}
            {result.cached && (
              <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <p className="text-green-300">✨ Resultado do cache (muito mais rápido!)</p>
              </div>
            )}

            {/* Providers */}
            {result.providers.length > 0 && (
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Provedores utilizados:</p>
                <div className="flex gap-2 flex-wrap">
                  {result.providers.map((provider) => (
                    <span
                      key={provider}
                      className="px-3 py-1 bg-blue-600/30 border border-blue-500 rounded-full text-sm"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Images Grid */}
            {result.images.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  ✅ Imagens Aprovadas ({result.images.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                    >
                      <div className="relative aspect-video bg-gray-900">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{image.title}</h3>
                        {image.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-1 bg-blue-600/30 rounded">{image.provider}</span>
                          {image.relevanceScore && (
                            <span className="text-gray-400">Score: {image.relevanceScore}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg text-center">
                <p className="text-2xl mb-2">🚫</p>
                <p className="text-xl font-semibold mb-2">Nenhuma imagem relevante encontrada</p>
                <p className="text-gray-400">
                  O sistema detectou que as imagens encontradas não eram relevantes ao tópico &quot;{topic}&quot;.
                  <br />
                  Slides aparecerão sem imagens (melhor que imagens irrelevantes).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <div className="mt-12 p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">📋 Como funciona?</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>
                <strong>Otimização de Query:</strong> AI detecta nomes próprios e evita traduções
                incorretas (ex: &quot;Metallica&quot; não vira &quot;metalurgia&quot;)
              </li>
              <li>
                <strong>Busca Multi-Provider:</strong> Busca em Unsplash, Pixabay e Pexels em paralelo
              </li>
              <li>
                <strong>Filtragem AI:</strong> Seleciona as melhores imagens educacionais
              </li>
              <li>
                <strong>Validação Rigorosa:</strong> Verifica se imagens são realmente sobre o tópico
                original
              </li>
              <li>
                <strong>Resultado:</strong> Retorna imagens relevantes ou array vazio (sem imagens
                irrelevantes)
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

