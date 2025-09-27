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
          <SectionTitle subtitle="A melhor plataforma para preparação ao ENEM, 100% alinhada à BNCC">
            🎓 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Preparação para o ENEM</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Banco de Questões Gigante', description: 'Mais de 3000 questões oficiais (2009-2024) + infinitas geradas por IA.', icon: '📚', stats: '3000+ Questões Oficiais' },
              { title: 'Modos de Estudo Inteligentes', description: 'Modo rápido, personalizado por dificuldade e oficial com cronômetro.', icon: '⚡', stats: '3 Modos Disponíveis' },
              { title: 'Correção Automática de Redação', description: 'Correção por IA com critérios oficiais do ENEM, aceitando PDFs ou imagens.', icon: '✍️', stats: 'Correção Instantânea' },
              { title: 'Temas e Tendências 2025', description: 'Temas oficiais de redação e análise de tendências para o ENEM.', icon: '🎯', stats: 'Tendências Atualizadas' },
            ].map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-2xl font-black mb-4">🏆 Por que Escolher Nosso Simulador?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '📈', title: 'Resultados Comprovados', description: 'Estudantes aumentam 45% no desempenho' },
                { icon: '🎯', title: 'Foco no ENEM', description: 'Desenvolvido para o exame brasileiro' },
                { icon: '⚡', title: 'Tecnologia Avançada', description: 'IA que gera questões personalizadas' },
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
