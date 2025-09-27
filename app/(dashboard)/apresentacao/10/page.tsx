'use client';

import NavigationHeader from '../components/NavigationHeader';

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

export default function Slide10() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader />
      
      <div className="pt-16 h-screen flex flex-col">
        <div className="px-4 py-4">
          <SectionTitle subtitle="Veja o HubEdu.ia em ação - Teste nosso chat agora mesmo!">
            🚀 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Demo Interativo</span>
          </SectionTitle>
        </div>
        
        {/* Iframe ocupando toda a tela restante */}
        <div className="flex-1 px-4 pb-4">
          <div className="bg-white rounded-lg shadow-xl h-full overflow-hidden">
            <div className="flex items-center bg-gray-100 px-4 py-2 border-b">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 text-sm text-gray-600">HubEdu.ia - Chat Demonstração</div>
            </div>
            <iframe 
              src="/chat" 
              className="w-full h-full border-0"
              title="HubEdu.ia Chat Demo"
            />
          </div>
        </div>
        
        {/* Instruções compactas */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Como usar o demo:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>
                <p className="font-semibold mb-1">🎯 Teste os módulos:</p>
                <ul className="space-y-0.5">
                  <li>• Professor IA - Dúvidas pedagógicas</li>
                  <li>• Suporte T.I. - Problemas técnicos</li>
                  <li>• Atendimento - Informações escolares</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">✨ Funcionalidades:</p>
                <ul className="space-y-0.5">
                  <li>• Conversas temporárias (LGPD)</li>
                  <li>• Respostas em português brasileiro</li>
                  <li>• Conteúdo adaptado para educação</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
