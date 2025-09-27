'use client';

import NavigationHeader from '../components/NavigationHeader';

const COMPLIANCE_FEATURES = [
  {
    category: 'LGPD - Lei Geral de Proteção de Dados',
    icon: '🛡️',
    color: 'from-green-500 to-green-600',
    features: [
      { title: 'Conversas Temporárias', desc: 'Dados apagados automaticamente após cada sessão', icon: '🗑️' },
      { title: 'Criptografia Total', desc: 'Dados protegidos com criptografia de ponta a ponta', icon: '🔒' },
      { title: 'Consentimento Explícito', desc: 'Termos claros e consentimento informado', icon: '📋' },
      { title: 'Auditoria Completa', desc: 'Logs de acesso e modificação de dados', icon: '📊' },
    ]
  },
  {
    category: 'BNCC - Base Nacional Comum Curricular',
    icon: '📚',
    color: 'from-blue-500 to-blue-600',
    features: [
      { title: 'Competências BNCC', desc: 'Desenvolvimento das 10 competências gerais', icon: '🎯' },
      { title: 'Objetivos de Aprendizagem', desc: 'Aulas alinhadas aos objetivos por ano e disciplina', icon: '📖' },
      { title: 'Atualizações Automáticas', desc: 'Conteúdo atualizado conforme mudanças na BNCC', icon: '🔄' },
      { title: 'Avaliação BNCC', desc: 'Questões e atividades seguindo critérios oficiais', icon: '✅' },
    ]
  },
  {
    category: 'Segurança e Privacidade',
    icon: '🔐',
    color: 'from-purple-500 to-purple-600',
    features: [
      { title: 'Infraestrutura Segura', desc: 'Servidores brasileiros com certificações internacionais', icon: '🏗️' },
      { title: 'Backup Automático', desc: 'Dados protegidos com redundância e recuperação', icon: '💾' },
      { title: 'Controle de Acesso', desc: 'Perfis específicos e permissões granulares', icon: '👤' },
      { title: 'Monitoramento 24/7', desc: 'Vigilância contínua contra ameaças', icon: '👁️' },
    ]
  }
];

const SectionTitle = ({ children, subtitle }) => (
  <div className="text-center mb-8">
    <h2 className="text-3xl lg:text-4xl font-black mb-3">{children}</h2>
    {subtitle && <p className="text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const ComplianceCard = ({ category }) => (
  <div className={`bg-gradient-to-br ${category.color} text-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300`}>
    <div className="text-center mb-4">
      <div className="text-4xl mb-3">{category.icon}</div>
      <h3 className="text-xl font-bold mb-4">{category.category}</h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {category.features.map((feature, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{feature.icon}</span>
            <h4 className="font-bold text-sm">{feature.title}</h4>
          </div>
          <p className="text-xs opacity-90">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function Slide7() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NavigationHeader />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          <SectionTitle subtitle="Conformidade total com LGPD e alinhamento rigoroso à BNCC">
            🛡️ <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Compliance LGPD e BNCC</span>
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {COMPLIANCE_FEATURES.map((category, index) => (
              <ComplianceCard key={index} category={category} />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-black mb-4 text-center">🏆 Por que Compliance é Fundamental?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-green-300">📋 LGPD - Proteção de Dados:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Evita multas de até 2% do faturamento',
                    'Protege dados de menores de idade',
                    'Garante transparência para pais e alunos',
                    'Constrói confiança na comunidade escolar'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <h4 className="text-lg font-bold mb-3 text-blue-300">📚 BNCC - Qualidade Educacional:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    'Garante alinhamento com currículo nacional',
                    'Desenvolve competências do século XXI',
                    'Facilita avaliação e acompanhamento',
                    'Prepara alunos para o futuro'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-4 rounded-xl text-center">
            <h4 className="text-lg font-bold mb-2">✅ Certificações e Validações</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">ISO 27001</div>
                <div className="text-xs">Segurança da Informação</div>
              </div>
              <div>
                <div className="font-semibold">LGPD</div>
                <div className="text-xs">Conformidade Total</div>
              </div>
              <div>
                <div className="font-semibold">BNCC</div>
                <div className="text-xs">100% Alinhado</div>
              </div>
              <div>
                <div className="font-semibold">SOC 2</div>
                <div className="text-xs">Auditoria Externa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
