'use client';

import NavigationHeader from '../components/NavigationHeader';

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const FeatureCard = ({ feature }) => (
  <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 hover:border-yellow-400 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
    <div className="text-center">
      <div className="text-4xl mb-3">{feature.icon}</div>
      <h3 className="text-lg font-bold text-yellow-600 mb-2">{feature.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
      {feature.stats && (
        <div className="mt-3">
          <span className="text-xs font-bold text-black bg-yellow-400 px-2 py-1 rounded-full">{feature.stats}</span>
        </div>
      )}
    </div>
  </div>
);

export default function Slide4() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="Simulador ENEM completo + Correção automática de redações. 100% gratuito mediante cadastro simples.">
            🎓 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">ENEM - 100% Gratuito</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { title: '100% Gratuito', description: 'Acesso completo aos simulados e redação mediante cadastro simples com email Google.', icon: '🎁', stats: 'Gratuito' },
              { title: '3000+ Questões Oficiais', description: 'Banco completo com questões oficiais do ENEM (2009-2024) + infinitas geradas por IA.', icon: '📚', stats: '3000+ Questões' },
              { title: 'Temas de Redação Completos', description: 'Todos os temas oficiais desde 1998 + infinitos gerados por IA baseados em tendências.', icon: '✍️', stats: 'Temas desde 1998' },
              { title: 'Explicação de Erros por IA', description: 'Explicação detalhada de questões erradas no simulado usando IA avançada.', icon: '🧠', stats: 'Feedback IA' },
              { title: 'Correção Automática', description: 'Correção instantânea de redações por IA com critérios oficiais do ENEM.', icon: '🤖', stats: 'Correção Instantânea' },
            ].map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-2xl font-black mb-4">🏆 Por que Escolher Nosso Simulador?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '📈', title: 'Resultados Comprovados', description: 'Estudantes aumentam 35 pontos na média' },
                { icon: '🎯', title: 'Foco no ENEM', description: 'Desenvolvido para o exame brasileiro' },
                { icon: '⚡', title: 'IA Avançada', description: 'Correção automática de redações e questões' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-bold text-base mb-1">{item.title}</h4>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
