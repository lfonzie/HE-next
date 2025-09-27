'use client';

import NavigationHeader from '../components/NavigationHeader';

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

export default function Slide2() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="Tecnologia avançada combinada com pedagogia brasileira">
            🚀 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Inovação em Educação</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '🧠', title: 'IA Generativa Avançada', description: 'Algoritmos que criam conteúdo educacional personalizado em tempo real.' },
              { icon: '🤖', title: 'Correção Automática', description: 'IA corrige redações e simulados instantaneamente, seguindo critérios do ENEM e BNCC.' },
              { icon: '📚', title: 'Aulas Estruturadas', description: 'Slides com introdução, desenvolvimento e conclusão, incluindo quizzes interativos.' },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-black mb-4 text-center">🌟 Por que HubEdu.ia é Revolucionário?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-purple-300">🔬 Tecnologia de Ponta:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'IA Multimodal: Processa texto, imagem e áudio',
                    'IA Avançada: Tecnologia OpenAI e Google',
                    'Conteúdo Estruturado: Aulas organizadas',
                    'Cloud Native: Arquitetura escalável'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-pink-300">🎓 Pedagogia Brasileira:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'BNCC Integrada: Alinhada com competências',
                    'Metodologias Ativas: Aprendizado interativo',
                    'Gamificação: Engajamento via jogos',
                    'Inclusão Digital: Acessível para todos'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
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
