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

interface FreepikTestResult {
  success: boolean;
  images: ImageResult[];
  totalFound: number;
  query: string;
  optimizedQuery: string;
  fallbackUsed: boolean;
  searchMethod: string;
  error?: string;
  duration: number;
  logs: string[];
}

export default function TestFreepikSearchPage() {
  const [query, setQuery] = useState('reciclagem');
  const [subject, setSubject] = useState('ciencias');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreepikTestResult | null>(null);

  const testFreepikSearch = async () => {
    setLoading(true);
    setResult(null);
    
    const startTime = Date.now();
    const logs: string[] = [];
    
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      logs.push(`[${timestamp}] ${message}`);
    };

    addLog(`🚀 Iniciando teste Freepik Search`);
    addLog(`📝 Query: "${query}", Subject: "${subject}", Count: ${count}`);

    try {
      const response = await fetch('/api/aulas/freepik-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          subject,
          count
        }),
      });

      const duration = Date.now() - startTime;
      addLog(`⏱️ Resposta recebida em ${duration}ms`);

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Sucesso! Status: ${response.status}`);
        addLog(`📊 Imagens encontradas: ${data.images?.length || 0}`);
        addLog(`🔍 Método de busca: ${data.searchMethod || 'N/A'}`);
        addLog(`🔄 Fallback usado: ${data.fallbackUsed ? 'Sim' : 'Não'}`);
        addLog(`📝 Query otimizada: "${data.optimizedQuery || 'N/A'}"`);
        
        if (data.images?.length > 0) {
          addLog(`🎯 Provedores utilizados: ${[...new Set(data.images.map((img: any) => img.provider))].join(', ')}`);
          
          data.images.forEach((img: any, index: number) => {
            addLog(`🖼️ Imagem ${index + 1}: ${img.provider} - "${img.title}" (Score: ${img.score?.toFixed(2) || 'N/A'})`);
          });
        }

        setResult({
          success: true,
          images: data.images || [],
          totalFound: data.totalFound || 0,
          query: data.query || query,
          optimizedQuery: data.optimizedQuery || '',
          fallbackUsed: data.fallbackUsed || false,
          searchMethod: data.searchMethod || '',
          duration,
          logs
        });
      } else {
        const errorText = await response.text();
        addLog(`❌ Erro HTTP ${response.status}: ${errorText}`);
        
        setResult({
          success: false,
          images: [],
          totalFound: 0,
          query,
          optimizedQuery: '',
          fallbackUsed: false,
          searchMethod: '',
          error: `HTTP ${response.status}: ${errorText}`,
          duration,
          logs
        });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      addLog(`💥 Erro de rede: ${error.message}`);
      
      setResult({
        success: false,
        images: [],
        totalFound: 0,
        query,
        optimizedQuery: '',
        fallbackUsed: false,
        searchMethod: '',
        error: error.message,
        duration,
        logs
      });
    }

    setLoading(false);
  };

  const analyzeImageRelevance = (image: ImageResult) => {
    const analysis = {
      hasRelevantTerms: false,
      hasIrrelevantTerms: false,
      score: image.score || 0,
      relevance: 'unknown'
    };

    const allText = `${image.title} ${image.description}`.toLowerCase();
    const queryWords = query.toLowerCase().split(' ');

    // Verificar termos relevantes
    analysis.hasRelevantTerms = queryWords.some(word => allText.includes(word));
    
    // Verificar termos irrelevantes
    const irrelevantTerms = ['transport', 'vehicle', 'metal', 'scrap', 'business', 'office', 'abstract', 'pattern', 'background', 'texture'];
    analysis.hasIrrelevantTerms = irrelevantTerms.some(term => allText.includes(term));

    // Determinar relevância
    if (analysis.hasRelevantTerms && !analysis.hasIrrelevantTerms) {
      analysis.relevance = 'high';
    } else if (analysis.hasRelevantTerms && analysis.hasIrrelevantTerms) {
      analysis.relevance = 'medium';
    } else if (!analysis.hasRelevantTerms && analysis.hasIrrelevantTerms) {
      analysis.relevance = 'low';
    } else {
      analysis.relevance = 'unknown';
    }

    return analysis;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔬 Teste Detalhado - Freepik Search API
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
              onClick={testFreepikSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Testando...' : '🔬 Testar Freepik Search'}
            </button>
            
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Logs */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Logs Detalhados</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
              {result.logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {result.success ? '✅' : '❌'} Resultado do Teste
              </h2>
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

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-blue-600">{result.totalFound}</div>
                <div className="text-sm text-blue-800">Total Encontradas</div>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-green-600">{result.images.length}</div>
                <div className="text-sm text-green-800">Retornadas</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-purple-600">
                  {result.fallbackUsed ? 'Sim' : 'Não'}
                </div>
                <div className="text-sm text-purple-800">Fallback Usado</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-orange-600">{result.duration}ms</div>
                <div className="text-sm text-orange-800">Tempo</div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-semibold mb-2">📊 Detalhes da Busca</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Query Original:</strong> {result.query}</div>
                <div><strong>Query Otimizada:</strong> {result.optimizedQuery}</div>
                <div><strong>Método de Busca:</strong> {result.searchMethod}</div>
                <div><strong>Fallback Usado:</strong> {result.fallbackUsed ? 'Sim' : 'Não'}</div>
              </div>
            </div>

            {/* Imagens */}
            {result.images.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🖼️ Imagens Encontradas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.images.map((image, index) => {
                    const analysis = analyzeImageRelevance(image);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                          
                          {/* Análise de Relevância */}
                          <div className={`text-xs px-2 py-1 rounded-md ${
                            analysis.relevance === 'high' ? 'bg-green-100 text-green-800' :
                            analysis.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            analysis.relevance === 'low' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <strong>Relevância:</strong> {
                              analysis.relevance === 'high' ? 'Alta' :
                              analysis.relevance === 'medium' ? 'Média' :
                              analysis.relevance === 'low' ? 'Baixa' :
                              'Desconhecida'
                            }
                          </div>
                          
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
                          
                          {/* Análise Detalhada */}
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600">🔍 Análise Detalhada</summary>
                            <div className="mt-2 space-y-1">
                              <div>Tem termos relevantes: {analysis.hasRelevantTerms ? '✅' : '❌'}</div>
                              <div>Tem termos irrelevantes: {analysis.hasIrrelevantTerms ? '⚠️' : '✅'}</div>
                              <div>Score calculado: {analysis.score.toFixed(2)}</div>
                            </div>
                          </details>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Nenhuma imagem encontrada
              </div>
            )}
          </div>
        )}

        {/* Temas Sugeridos */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
