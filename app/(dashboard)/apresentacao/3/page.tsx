'use client';

import NavigationHeader from '../components/NavigationHeader';

const CHAT_MODULES = [
  { name: 'Professor IA', description: 'Assistente pedagógico para dúvidas educacionais', icon: '👩‍🏫' },
  { name: 'Suporte T.I.', description: 'Assistente técnico para questões de tecnologia', icon: '💻' },
  { name: 'Atendimento', description: 'Assistente para comunicação escolar', icon: '👨‍👩‍👧‍👦' },
  { name: 'Bem-estar', description: 'Assistente para orientações de saúde mental', icon: '💚' },
  { name: 'Social Media', description: 'Assistente para conteúdo de redes sociais', icon: '📱' },
  { name: 'Coordenação', description: 'Assistente para coordenação pedagógica', icon: '👨‍💼' },
  { name: 'Secretaria', description: 'Assistente para processos administrativos', icon: '📋' },
  { name: 'RH', description: 'Assistente para recursos humanos', icon: '👥' },
  { name: 'Financeiro', description: 'Assistente para questões financeiras', icon: '💰' },
  { name: 'Gestão', description: 'Assistente para análise e relatórios', icon: '📊' },
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const ChatModulesGrid = () => (
  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-8 rounded-2xl shadow-xl">
    <h3 className="text-3xl font-black mb-4 text-center">👩‍🏫 Chat Professor IA + 9 Módulos Especializados</h3>
    <p className="text-lg font-semibold mb-6 text-center">Soluções de IA para toda a comunidade escolar</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
      {CHAT_MODULES.map((module, index) => (
        <div 
          key={index} 
          className="text-center bg-white/20 p-3 sm:p-4 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-2xl sm:text-3xl mb-2">{module.icon}</div>
          <div className="font-bold text-xs sm:text-sm">{module.name}</div>
          <div className="text-xs">{module.description}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function Slide3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="10 módulos especializados com 5 principais IAs integradas">
            👩‍🏫 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Chat Professor IA</span>
          </SectionTitle>
          <ChatModulesGrid />
        </div>
      </div>
    </div>
  );
}
