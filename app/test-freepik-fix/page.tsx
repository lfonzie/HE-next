'use client';

import { useState } from 'react';

export default function TestFreepikFix() {
  const [query, setQuery] = useState('Causas da Revolução Francesa');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const testFreepikSearch = async () => {
    setLoading(true);
    setResults(null);
    setLogs([]);
    
    try {
      const response = await fetch('/api/aulas/freepik-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          count: 3
        }),
      });

      const data = await response.json();
      setResults(data);
      
      // Simular logs baseados na resposta
      const mockLogs = [
        `🔍 Buscando imagens no Freepik para: "${query}"`,
        `🤖 Usando IA para extrair tema de: "${query}"`,
        `🎯 Tema detectado pela IA: ${data.optimizedQuery || query}`,
        `📊 Resultados Freepik: ${data.images?.length || 0} imagens encontradas`,
        `📊 Análise de relevância: ${data.images?.length || 0} total, ${data.images?.filter((img: any) => img.score > 0.3).length || 0} relevantes`,
        data.fallbackUsed ? '🔄 Usando sistema de fallback com múltiplos provedores' : '✅ Usando resultados do Freepik',
        `📊 Método de busca: ${data.searchMethod || 'unknown'}`
      ];
      
      setLogs(mockLogs);
      
    } catch (error) {
      console.error('Erro no teste:', error);
      setLogs([`❌ Erro: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const predefinedQueries = [
    'Causas da Revolução Francesa',
    'Sistema Solar',
    'Fotossíntese',
    'Reciclagem',
    'Segunda Guerra Mundial',
    'Império Romano',
    'Renascimento',
    'Revolução Industrial'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔧 Teste de Correção do Freepik
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Problema Identificado:
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">
                <strong>❌ Freepik não estava funcionando:</strong> Sistema muito rigoroso rejeitava todas as imagens do Freepik, 
                forçando uso apenas dos provedores antigos (Wikimedia, Unsplash, Pixabay).
              </p>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Correções Implementadas:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Lógica mais inteligente:</strong> Score alto (&gt;0.4) sempre aceito</li>
              <li><strong>Critérios flexíveis:</strong> Termos do tema + não irrelevante</li>
              <li><strong>Temas históricos:</strong> Mais permissivo para revolução, história, guerra</li>
              <li><strong>Logs detalhados:</strong> Debug completo do processo de seleção</li>
              <li><strong>Padrões específicos:</strong> French Revolution, Revolution, History</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query de Teste:
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o tema para testar..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {predefinedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              onClick={testFreepikSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 Testando...' : '🚀 Testar Busca Freepik'}
            </button>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              📋 Logs de Debug
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              📊 Resultados da Busca
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {results.images?.map((image: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {image.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Provedor:</strong> {image.provider}</p>
                      <p><strong>Score:</strong> {image.score?.toFixed(2) || 'N/A'}</p>
                      <p><strong>Licença:</strong> {image.license}</p>
                      {image.author && (
                        <p><strong>Autor:</strong> {image.author}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">📈 Estatísticas:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total encontradas:</span>
                  <span className="font-semibold ml-2">{results.totalFound || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Método:</span>
                  <span className="font-semibold ml-2">{results.searchMethod || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fallback usado:</span>
                  <span className="font-semibold ml-2">{results.fallbackUsed ? 'Sim' : 'Não'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sucesso:</span>
                  <span className="font-semibold ml-2">{results.success ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
