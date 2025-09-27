'use client';

import NavigationHeader from '../components/NavigationHeader';

const CHAT_MODULES = [
  { name: 'Professor IA', description: 'Tire dúvidas pedagógicas instantaneamente', icon: '👩‍🏫' },
  { name: 'Suporte T.I.', description: 'Suporte técnico para funcionários', icon: '💻' },
  { name: 'Atendimento', description: 'Atendimento personalizado para pais e visitantes', icon: '👨‍👩‍👧‍👦' },
  { name: 'Bem-estar', description: 'Suporte emocional para a comunidade escolar', icon: '💚' },
  { name: 'Social Media', description: 'Gestão de redes sociais da escola', icon: '📱' },
  { name: 'Coordenação', description: 'Ferramentas para coordenação pedagógica', icon: '👨‍💼' },
  { name: 'Secretaria', description: 'Automação de processos administrativos', icon: '📋' },
  { name: 'RH', description: 'Gestão de recursos humanos', icon: '👥' },
  { name: 'Financeiro', description: 'Controle financeiro e pagamentos', icon: '💰' },
  { name: 'Gestão', description: 'Relatórios e analytics educacionais', icon: '📊' },
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const ChatModulesGrid = () => (
  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-8 rounded-2xl shadow-xl">
    <h3 className="text-3xl font-black mb-4 text-center">💬 10 Módulos de Chat IA</h3>
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
          <SectionTitle subtitle="10 módulos de chat para transformar sua escola">
            💬 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Chat Inteligente</span>
          </SectionTitle>
          <ChatModulesGrid />
        </div>
      </div>
    </div>
  );
}
