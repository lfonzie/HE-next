'use client';

import NavigationHeader from '../components/NavigationHeader';

const ADVANCED_FEATURES = [
  {
    category: 'Aulas Completas',
    icon: '🎮',
    features: [
      { title: 'Geração Ultra-Rápida', desc: 'Aulas completas criadas em menos de 2 minutos', icon: '⚡' },
      { title: 'Qualquer Tema', desc: 'Aulas sobre qualquer assunto educacional', icon: '🌍' },
      { title: 'Quizzes Integrados', desc: 'Quizzes automáticos com feedback instantâneo', icon: '🎯' },
      { title: 'Narração em Tempo Real', desc: 'Aulas com narração automática', icon: '🎙️' },
    ]
  },
  {
    category: 'Chat Professor IA',
    icon: '👩‍🏫',
    features: [
      { title: 'Dúvidas Pedagógicas', desc: 'Professor virtual para questões educacionais', icon: '💬' },
      { title: '5 Principais IAs', desc: 'Grok 4, ChatGPT 5, Gemini 2.5, Claude 4.5, Perplexity', icon: '🤖' },
      { title: 'Suporte BNCC', desc: 'Orientações alinhadas ao currículo nacional', icon: '📚' },
      { title: '10 Módulos Especializados', desc: 'Chat para diferentes áreas da escola', icon: '🏫' },
    ]
  },
  {
    category: 'Simulador ENEM',
    icon: '📚',
    features: [
      { title: '3000+ Questões Oficiais', desc: 'Banco completo (2009-2024) + infinitas por IA', icon: '📝' },
      { title: 'Correção Automática', desc: 'Correção de redações e questões por IA', icon: '🤖' },
      { title: 'Explicação de Erros', desc: 'Feedback detalhado de questões erradas', icon: '🧠' },
      { title: 'Temas desde 1998', desc: 'Todos os temas oficiais + infinitos por IA', icon: '✍️' },
    ]
  }
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const FeatureCategory = ({ category }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
    <div className="text-center mb-4">
      <div className="text-4xl mb-3">{category.icon}</div>
      <h3 className="text-xl font-bold text-indigo-700 mb-4">{category.category}</h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {category.features.map((feature, index) => (
        <div key={index} className="bg-white p-3 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{feature.icon}</span>
            <h4 className="font-bold text-sm text-indigo-800">{feature.title}</h4>
          </div>
          <p className="text-xs text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function Slide6() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="4 módulos principais com tecnologia de ponta para educação brasileira">
            🚀 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Funcionalidades Avançadas</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {ADVANCED_FEATURES.map((category, index) => (
              <FeatureCategory key={index} category={category} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-black mb-4 text-center">💡 Tecnologias de Ponta</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-indigo-300">🔬 5 Principais IAs Integradas:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Grok 4: Análise de dados e insights',
                    'ChatGPT 5: Geração de conteúdo',
                    'Gemini 2.5: Processamento multimodal',
                    'Claude 4.5: Raciocínio e correção',
                    'Perplexity: Busca em tempo real'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-purple-300">⚡ Capacidades Avançadas:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Aulas completas em menos de 2 minutos',
                    'Correção automática por IA',
                    'Chat Professor IA com 5 IAs',
                    '3000+ questões oficiais ENEM',
                    'Conversas temporárias LGPD'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
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
