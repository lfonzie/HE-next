'use client';

import NavigationHeader from '../components/NavigationHeader';

const COMPETITORS = [
  { 
    name: 'ChatGPT', 
    price: 'US$ 20/mês por usuário (~R$ 106/mês)', 
    restrictions: [
      'Conteúdo não adaptado para idade escolar',
      'Sem conteúdo específico para escolas',
      'Não baseado na BNCC',
      'Sem compliance LGPD'
    ], 
    icon: '🤖',
    color: 'from-green-500 to-green-600'
  },
  { 
    name: 'Grok', 
    price: 'US$ 30/mês por usuário (~R$ 159/mês)', 
    restrictions: [
      'Conteúdo não adaptado para idade escolar',
      'Sem simulador ENEM',
      'Não baseado na BNCC',
      'Sem compliance LGPD'
    ], 
    icon: '⚡',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Gemini 2.5', 
    price: 'US$ 20/mês por usuário (~R$ 106/mês)', 
    restrictions: [
      'Conteúdo não adaptado para idade escolar',
      'Sem conteúdo específico para escolas',
      'Não baseado na BNCC',
      'Sem compliance LGPD'
    ], 
    icon: '💎',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'HubEdu.ia', 
    price: 'Preço Especial', 
    advantages: [
      'Todas as idades: Crianças, adolescentes e adultos',
      'Preço especial para escolas',
      'Conteúdo adaptado para educação brasileira',
      '100% BNCC',
      'Total LGPD: Chats temporários',
      'Chat Professor IA para dúvidas',
      'Aulas completas em 2 minutos',
      '3000+ questões oficiais + infinitas por IA',
      'Correção automática por IA',
      'Gestão completa: IA + Automação + Analytics'
    ], 
    icon: '🎓',
    color: 'from-yellow-500 to-yellow-600',
    isSpecial: true
  },
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const CompetitorCard = ({ competitor }) => (
  <div className={`${competitor.isSpecial ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-lg ${competitor.isSpecial ? 'relative shadow-2xl' : ''}`}>
    {competitor.isSpecial && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">🏆 MELHOR ESCOLHA</span>
      </div>
    )}
    <div className={`text-center mb-4 ${competitor.isSpecial ? 'mt-3' : ''}`}>
      <div className="text-4xl mb-3">{competitor.icon}</div>
      <h3 className={`text-xl font-bold mb-2 ${competitor.isSpecial ? 'text-black' : 'text-gray-800'}`}>{competitor.name}</h3>
      <div className={`text-2xl font-black mb-3 ${competitor.isSpecial ? 'text-black' : 'text-red-500'}`}>{competitor.price}</div>
    </div>
    <div className="space-y-2">
      <h4 className={`font-bold mb-2 text-sm ${competitor.isSpecial ? 'text-black' : 'text-gray-700'}`}>
        {competitor.isSpecial ? '✅ Vantagens:' : '❌ Limitações:'}
      </h4>
      {(competitor.restrictions || competitor.advantages || []).map((item, idx) => (
        <div key={idx} className={`flex items-start gap-2 text-xs ${competitor.isSpecial ? 'text-black' : 'text-gray-600'}`}>
          <span className={`mt-1 ${competitor.isSpecial ? 'text-green-600' : 'text-red-500'}`}>•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Slide5() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-100">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="Enquanto outras plataformas cobram R$ 106-159/mês por usuário, HubEdu.ia oferece tudo isso por um preço especial para escolas">
            ⚔️ <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Por que Escolher HubEdu.ia?</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {COMPETITORS.map((competitor, index) => (
              <CompetitorCard key={index} competitor={competitor} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-black mb-4 text-center">🎯 Por que HubEdu.ia é Superior?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-red-300">🚫 Limitações de ChatGPT, Grok e Gemini:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Restrição de idade: Menores de 18 anos não podem usar',
                    'Preço alto: US$ 20-30/mês (~R$ 106-159) por usuário',
                    'Conteúdo não adaptado para escolas',
                    'Sem BNCC: Não alinhado com currículo brasileiro',
                    'Sem LGPD: Conversas salvas permanentemente',
                    'Sem simulador ENEM',
                    'Sem gestão escolar integrada'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-orange-300">✅ Vantagens do HubEdu.ia:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Todas as idades: Crianças, adolescentes e adultos',
                    'Preço especial para escolas brasileiras',
                    'Conteúdo adaptado para educação brasileira',
                    '100% BNCC: Alinhado com currículo nacional',
                    'Total LGPD: Chats temporários e seguros',
                    'Chat Professor IA para dúvidas',
                    'Aulas completas em 2 minutos',
                    '3000+ questões oficiais + infinitas por IA',
                    'Correção automática por IA',
                    'Gestão completa: IA + Automação + Analytics'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
