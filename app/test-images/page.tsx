'use client';

import Link from 'next/link';

export default function TestNavigationPage() {
  const testPages = [
    {
      title: '🧪 Teste Geral de Provedores',
      description: 'Testa todos os provedores de imagem disponíveis e compara resultados',
      path: '/test-image-providers',
      features: [
        'Testa 6 provedores diferentes',
        'Compara resultados lado a lado',
        'Logs detalhados de cada API',
        'Análise de performance',
        'Interface visual para resultados'
      ]
    },
    {
      title: '🔬 Teste Detalhado - Freepik Search',
      description: 'Teste específico da API freepik-search com análise detalhada de relevância',
      path: '/test-freepik-search',
      features: [
        'Foco na API freepik-search corrigida',
        'Análise de relevância por imagem',
        'Logs detalhados do processo',
        'Estatísticas de fallback',
        'Detecção de imagens genéricas'
      ]
    },
    {
      title: '🔧 Correção Freepik',
      description: 'Testa as correções específicas implementadas para o sistema Freepik',
      path: '/test-freepik-fix',
      features: [
        'Lógica inteligente de relevância',
        'Temas históricos especiais',
        'Logs de debug detalhados',
        'Validação das correções',
        'Teste de diferentes temas'
      ]
    },
    {
      title: '🔍 Teste de Análise de Relevância',
      description: 'Testa especificamente o algoritmo de análise de relevância de imagens',
      path: '/test-relevance-analysis',
      features: [
        'Testa algoritmo de relevância',
        'Análise de termos relevantes/irrelevantes',
        'Cálculo de scores detalhado',
        'Exemplos pré-configurados',
        'Visualização do processo de análise'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Centro de Testes - Sistema de Imagens
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Páginas de teste para validar as correções implementadas no sistema de carregamento de imagens educacionais.
            Teste diferentes provedores, analise relevância e valide as melhorias implementadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testPages.map((page, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {page.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {page.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {page.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-gray-700 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={page.path}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🚀 Acessar Teste
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Informações sobre as Correções */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📋 Correções Implementadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🔧 Problemas Corrigidos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Erro SyntaxError no Pixabay (JSON inválido)
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  URLs duplicadas do Wikimedia
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Imagens genéricas sendo selecionadas
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Falta de análise de relevância rigorosa
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Sistema de fallback inadequado
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">✅ Soluções Implementadas</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Tratamento robusto de erros JSON
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Eliminação de URLs duplicadas
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Análise rigorosa de relevância temática
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Penalidades para conteúdo genérico
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Sistema de fallback melhorado
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Como Usar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🚀 Como Usar os Testes
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Teste Geral de Provedores</h3>
              <p className="text-sm">
                Use esta página para testar todos os provedores de uma vez e comparar resultados. 
                Ideal para identificar qual provedor funciona melhor para diferentes temas.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Teste Detalhado - Freepik Search</h3>
              <p className="text-sm">
                Foque especificamente na API freepik-search corrigida. Analise logs detalhados, 
                relevância das imagens e uso do sistema de fallback.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">3. Teste de Análise de Relevância</h3>
              <p className="text-sm">
                Teste especificamente o algoritmo de análise de relevância. Use exemplos pré-configurados 
                ou teste suas próprias combinações de query e imagem.
              </p>
            </div>
          </div>
        </div>

        {/* Temas Sugeridos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            💡 Temas Sugeridos para Teste
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { theme: 'reciclagem', category: 'Ciências' },
              { theme: 'sistema solar', category: 'Astronomia' },
              { theme: 'fotossíntese', category: 'Biologia' },
              { theme: 'inteligência artificial', category: 'Tecnologia' },
              { theme: 'matemática', category: 'Matemática' },
              { theme: 'história do Brasil', category: 'História' },
              { theme: 'geografia', category: 'Geografia' },
              { theme: 'química', category: 'Química' }
            ].map((item, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-medium text-blue-900 text-sm">{item.theme}</div>
                <div className="text-xs text-blue-700">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
