'use client';

import NavigationHeader from '../components/NavigationHeader';

const ADVANCED_FEATURES = [
  {
    category: 'Aulas Interativas',
    icon: '🎮',
    features: [
      { title: 'Geração Automática', desc: 'Aulas criadas em segundos com IA avançada', icon: '⚡' },
      { title: 'Estrutura BNCC', desc: '14 slides organizados por competências', icon: '📚' },
      { title: 'Quizzes Dinâmicos', desc: 'Perguntas adaptativas com feedback instantâneo', icon: '🎯' },
      { title: 'Gamificação', desc: 'Rankings, pontos e conquistas para engajamento', icon: '🏆' },
    ]
  },
  {
    category: 'Gestão Escolar',
    icon: '🏫',
    features: [
      { title: 'Dashboard Executivo', desc: 'Métricas em tempo real da escola', icon: '📊' },
      { title: 'Relatórios Automáticos', desc: 'Análises de performance e engajamento', icon: '📈' },
      { title: 'Comunicação Integrada', desc: 'WhatsApp, email e SMS automatizados', icon: '💬' },
      { title: 'Controle de Acesso', desc: 'Perfis específicos para cada função', icon: '🔐' },
    ]
  },
  {
    category: 'Tecnologia Avançada',
    icon: '🤖',
    features: [
      { title: 'IA Multimodal', desc: 'Processa texto, imagem e áudio', icon: '🧠' },
      { title: 'API Integrada', desc: 'Conecta com sistemas existentes da escola', icon: '🔌' },
      { title: 'Cloud Nativo', desc: 'Escalabilidade automática e alta disponibilidade', icon: '☁️' },
      { title: 'Backup Automático', desc: 'Dados protegidos com redundância', icon: '💾' },
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
          <SectionTitle subtitle="Funcionalidades avançadas que fazem a diferença">
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
                <h4 className="text-lg font-bold mb-3 text-indigo-300">🔬 IA e Machine Learning:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'OpenAI GPT-4 e Google Gemini integrados',
                    'Processamento de linguagem natural em português',
                    'Algoritmos de recomendação personalizados',
                    'Análise preditiva de performance escolar'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-purple-300">⚡ Performance e Escalabilidade:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Arquitetura cloud-native com AWS/Azure',
                    'CDN global para acesso rápido',
                    'Auto-scaling baseado na demanda',
                    '99.9% de uptime garantido'
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
