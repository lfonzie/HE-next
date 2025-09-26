'use client';

import { useState } from 'react';

interface RelevanceAnalysis {
  query: string;
  imageTitle: string;
  imageDescription: string;
  score: number;
  hasRelevantTerms: boolean;
  hasIrrelevantTerms: boolean;
  relevantTerms: string[];
  irrelevantTerms: string[];
  themeRelevance: {
    score: number;
    reason: string;
  };
  penalty: number;
  bonus: number;
  finalRelevance: 'high' | 'medium' | 'low' | 'unknown';
}

export default function TestRelevanceAnalysisPage() {
  const [query, setQuery] = useState('reciclagem');
  const [imageTitle, setImageTitle] = useState('Shanghai recycling transport tricycle');
  const [imageDescription, setImageDescription] = useState('A tricycle used for transport in Shanghai');
  const [analysis, setAnalysis] = useState<RelevanceAnalysis | null>(null);

  const analyzeRelevance = () => {
    const queryLower = query.toLowerCase();
    const titleLower = imageTitle.toLowerCase();
    const descriptionLower = imageDescription.toLowerCase();
    const allText = `${titleLower} ${descriptionLower}`;
    
    let score = 0;
    
    // 1. CORRESPONDÊNCIA EXATA
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    const relevantTerms: string[] = [];
    
    queryWords.forEach(word => {
      if (allText.includes(word)) {
        relevantTerms.push(word);
        score += 0.3;
      }
    });
    
    // 2. ANÁLISE DE RELEVÂNCIA TEMÁTICA
    const themeRelevance = analyzeThemeRelevance(queryLower, allText);
    score += themeRelevance.score;
    
    // 3. PENALIDADES POR CONTEÚDO IRRELEVANTE
    const penalty = calculateIrrelevantPenalty(allText, queryLower);
    score -= penalty;
    
    // 4. BONUS POR CONTEÚDO EDUCACIONAL ESPECÍFICO
    const bonus = calculateEducationalBonus(allText, queryLower);
    score += bonus;
    
    // Normalizar para 0-1
    const finalScore = Math.max(0, Math.min(1, score));
    
    // Determinar relevância final
    let finalRelevance: 'high' | 'medium' | 'low' | 'unknown';
    if (finalScore >= 0.7) {
      finalRelevance = 'high';
    } else if (finalScore >= 0.4) {
      finalRelevance = 'medium';
    } else if (finalScore >= 0.1) {
      finalRelevance = 'low';
    } else {
      finalRelevance = 'unknown';
    }
    
    setAnalysis({
      query,
      imageTitle,
      imageDescription,
      score: finalScore,
      hasRelevantTerms: relevantTerms.length > 0,
      hasIrrelevantTerms: penalty > 0,
      relevantTerms,
      irrelevantTerms: getIrrelevantTerms(allText),
      themeRelevance,
      penalty,
      bonus,
      finalRelevance
    });
  };

  const analyzeThemeRelevance = (query: string, text: string): { score: number; reason: string } => {
    const themePatterns: { [key: string]: { patterns: string[], score: number, reason: string } } = {
      'recycling': {
        patterns: ['recycling', 'recycle', 'waste', 'garbage', 'trash', 'bin', 'container', 'sorting', 'separation', 'environmental', 'sustainability'],
        score: 0.4,
        reason: 'recycling-specific'
      },
      'solar system': {
        patterns: ['solar', 'system', 'planet', 'sun', 'moon', 'earth', 'mars', 'jupiter', 'saturn', 'orbit', 'space', 'astronomy'],
        score: 0.4,
        reason: 'solar-system-specific'
      },
      'photosynthesis': {
        patterns: ['photosynthesis', 'plant', 'leaf', 'chlorophyll', 'oxygen', 'carbon dioxide', 'glucose', 'sunlight'],
        score: 0.4,
        reason: 'photosynthesis-specific'
      }
    };
    
    for (const [theme, config] of Object.entries(themePatterns)) {
      if (query.includes(theme)) {
        const matches = config.patterns.filter(pattern => text.includes(pattern));
        if (matches.length > 0) {
          return { score: config.score, reason: config.reason };
        }
      }
    }
    
    return { score: 0, reason: 'no-specific-theme' };
  };

  const calculateIrrelevantPenalty = (text: string, query: string): number => {
    let penalty = 0;
    
    const genericPenalties: { [key: string]: number } = {
      'transport': 0.3,
      'vehicle': 0.3,
      'metal': 0.2,
      'scrap': 0.1,
      'business': 0.4,
      'office': 0.3,
      'abstract': 0.4,
      'pattern': 0.3,
      'background': 0.3,
      'texture': 0.3
    };
    
    Object.entries(genericPenalties).forEach(([term, penaltyValue]) => {
      if (text.includes(term)) {
        penalty += penaltyValue;
      }
    });
    
    const hasGenericTerms = Object.keys(genericPenalties).some(term => text.includes(term));
    const hasSpecificTerms = query.split(' ').some(word => text.includes(word));
    
    if (hasGenericTerms && !hasSpecificTerms) {
      penalty += 0.5;
    }
    
    return penalty;
  };

  const calculateEducationalBonus = (text: string, query: string): number => {
    let bonus = 0;
    
    const educationalTerms: { [key: string]: string[] } = {
      'recycling': ['environmental education', 'sustainability', 'waste management', 'eco-friendly', 'green'],
      'solar system': ['astronomy education', 'space science', 'planetary science', 'cosmic'],
      'photosynthesis': ['biology education', 'plant science', 'botany', 'cellular process']
    };
    
    for (const [theme, terms] of Object.entries(educationalTerms)) {
      if (query.includes(theme)) {
        const matches = terms.filter(term => text.includes(term));
        bonus += matches.length * 0.1;
      }
    }
    
    return bonus;
  };

  const getIrrelevantTerms = (text: string): string[] => {
    const irrelevantTerms = ['transport', 'vehicle', 'metal', 'scrap', 'business', 'office', 'abstract', 'pattern', 'background', 'texture'];
    return irrelevantTerms.filter(term => text.includes(term));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Teste de Análise de Relevância de Imagens
        </h1>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configurações do Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query/Tema Educacional
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
                Título da Imagem
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Shanghai recycling transport tricycle"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Imagem
              </label>
              <textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: A tricycle used for transport in Shanghai"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={analyzeRelevance}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🔍 Analisar Relevância
            </button>
            
            <button
              onClick={() => setAnalysis(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Resultado da Análise */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Resultado da Análise</h2>
            
            {/* Score Final */}
            <div className="mb-6">
              <div className={`text-center p-6 rounded-lg ${
                analysis.finalRelevance === 'high' ? 'bg-green-50 border-2 border-green-200' :
                analysis.finalRelevance === 'medium' ? 'bg-yellow-50 border-2 border-yellow-200' :
                analysis.finalRelevance === 'low' ? 'bg-red-50 border-2 border-red-200' :
                'bg-gray-50 border-2 border-gray-200'
              }`}>
                <div className={`text-4xl font-bold ${
                  analysis.finalRelevance === 'high' ? 'text-green-600' :
                  analysis.finalRelevance === 'medium' ? 'text-yellow-600' :
                  analysis.finalRelevance === 'low' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {analysis.score.toFixed(2)}
                </div>
                <div className={`text-lg font-semibold ${
                  analysis.finalRelevance === 'high' ? 'text-green-800' :
                  analysis.finalRelevance === 'medium' ? 'text-yellow-800' :
                  analysis.finalRelevance === 'low' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Relevância {analysis.finalRelevance === 'high' ? 'Alta' :
                              analysis.finalRelevance === 'medium' ? 'Média' :
                              analysis.finalRelevance === 'low' ? 'Baixa' :
                              'Desconhecida'}
                </div>
              </div>
            </div>

            {/* Detalhes da Análise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Termos Relevantes */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Termos Relevantes</h3>
                {analysis.relevantTerms.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.relevantTerms.map((term, index) => (
                      <span key={index} className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-sm mr-2">
                        {term}
                      </span>
                    ))}
                    <div className="text-sm text-green-700 mt-2">
                      <strong>Score:</strong> +{analysis.relevantTerms.length * 0.3}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-700">Nenhum termo relevante encontrado</div>
                )}
              </div>

              {/* Termos Irrelevantes */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">❌ Termos Irrelevantes</h3>
                {analysis.irrelevantTerms.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.irrelevantTerms.map((term, index) => (
                      <span key={index} className="inline-block bg-red-200 text-red-800 px-2 py-1 rounded text-sm mr-2">
                        {term}
                      </span>
                    ))}
                    <div className="text-sm text-red-700 mt-2">
                      <strong>Penalidade:</strong> -{analysis.penalty.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-700">Nenhum termo irrelevante encontrado</div>
                )}
              </div>
            </div>

            {/* Análise Temática */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Análise Temática</h3>
              <div className="text-sm text-blue-700">
                <div><strong>Tipo:</strong> {analysis.themeRelevance.reason}</div>
                <div><strong>Score:</strong> +{analysis.themeRelevance.score}</div>
              </div>
            </div>

            {/* Bonus Educacional */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-purple-800 mb-2">🎓 Bonus Educacional</h3>
              <div className="text-sm text-purple-700">
                <div><strong>Score:</strong> +{analysis.bonus.toFixed(2)}</div>
              </div>
            </div>

            {/* Resumo dos Cálculos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🧮 Resumo dos Cálculos</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>Score base: 0.00</div>
                <div>Termos relevantes: +{(analysis.relevantTerms.length * 0.3).toFixed(2)}</div>
                <div>Análise temática: +{analysis.themeRelevance.score.toFixed(2)}</div>
                <div>Penalidade irrelevante: -{analysis.penalty.toFixed(2)}</div>
                <div>Bonus educacional: +{analysis.bonus.toFixed(2)}</div>
                <div className="border-t pt-2 font-semibold">
                  Score final: {analysis.score.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exemplos de Teste */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">💡 Exemplos de Teste</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                query: 'reciclagem',
                title: 'Shanghai recycling transport tricycle',
                description: 'A tricycle used for transport in Shanghai',
                expected: 'Baixa relevância (transporte genérico)'
              },
              {
                query: 'reciclagem',
                title: 'Three brightly colored waste bins',
                description: 'Recycling bins for sorting different types of waste',
                expected: 'Alta relevância (lixeiras de reciclagem)'
              },
              {
                query: 'sistema solar',
                title: 'Moons of solar system',
                description: 'Various moons orbiting planets in our solar system',
                expected: 'Alta relevância (sistema solar específico)'
              },
              {
                query: 'fotossíntese',
                title: 'Green leaf photosynthesis process',
                description: 'Plant leaf showing the process of photosynthesis',
                expected: 'Alta relevância (fotossíntese específica)'
              }
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(example.query);
                  setImageTitle(example.title);
                  setImageDescription(example.description);
                }}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {example.query} → {example.title}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {example.description}
                </div>
                <div className="text-xs text-blue-600">
                  Esperado: {example.expected}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
