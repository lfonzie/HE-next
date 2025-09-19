import React from 'react';
import { X } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LGPDModal: React.FC<LGPDModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Conformidade LGPD</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🔒 Compromisso com a LGPD</h3>
            <p className="text-gray-700 leading-relaxed">
              O HubEdu.ia está totalmente em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
              e comprometido com a proteção da privacidade e segurança dos dados pessoais de nossos usuários.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📋 Princípios Fundamentais</h3>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• <strong>Finalidade:</strong> Coletamos dados apenas para fins específicos e legítimos</li>
              <li>• <strong>Adequação:</strong> Dados coletados são adequados e necessários para nossos serviços</li>
              <li>• <strong>Necessidade:</strong> Coletamos apenas o mínimo necessário</li>
              <li>• <strong>Livre acesso:</strong> Você pode acessar seus dados a qualquer momento</li>
              <li>• <strong>Qualidade:</strong> Mantemos seus dados atualizados e precisos</li>
              <li>• <strong>Transparência:</strong> Informamos claramente como usamos seus dados</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🛡️ Medidas de Segurança</h3>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Criptografia de ponta a ponta</li>
              <li>• Servidores brasileiros</li>
              <li>• Acesso restrito e monitorado</li>
              <li>• Backup seguro e regular</li>
              <li>• Auditorias de segurança periódicas</li>
              <li>• Treinamento da equipe em proteção de dados</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">👤 Seus Direitos</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Conforme a LGPD, você tem os seguintes direitos:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• <strong>Acesso:</strong> Solicitar informações sobre seus dados</li>
              <li>• <strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
              <li>• <strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
              <li>• <strong>Portabilidade:</strong> Transferir seus dados para outro serviço</li>
              <li>• <strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📊 Categorias de Dados Pessoais</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">👤 Dados Identificadores:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Nome completo</li>
                    <li>• CPF/RG</li>
                    <li>• Data de nascimento</li>
                    <li>• Endereço</li>
                    <li>• Telefone e email</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">🎓 Dados Educacionais:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Histórico escolar</li>
                    <li>• Notas e avaliações</li>
                    <li>• Frequência</li>
                    <li>• Comportamento</li>
                    <li>• Progresso de aprendizagem</li>
                  </ul>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">🏢 Dados Institucionais:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• CNPJ da escola</li>
                    <li>• Dados de funcionários</li>
                    <li>• Informações financeiras</li>
                    <li>• Contratos e documentos</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-2">💻 Dados Técnicos:</h4>
                  <ul className="text-purple-700 leading-relaxed space-y-1 text-sm">
                    <li>• Endereço IP</li>
                    <li>• Cookies</li>
                    <li>• Logs de acesso</li>
                    <li>• Informações do dispositivo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🎯 Finalidades do Tratamento</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">📚 Finalidades Educacionais:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Prestação de serviços educacionais</li>
                    <li>• Geração de conteúdo personalizado</li>
                    <li>• Acompanhamento pedagógico</li>
                    <li>• Avaliação e correção</li>
                    <li>• Relatórios de progresso</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">⚙️ Finalidades Operacionais:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Gestão de usuários</li>
                    <li>• Suporte técnico</li>
                    <li>• Melhoria da plataforma</li>
                    <li>• Segurança e prevenção de fraudes</li>
                    <li>• Cumprimento de obrigações legais</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">⏰ Tempo de Retenção</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Mantemos os dados pelo tempo necessário para cumprir as finalidades:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">📅 Períodos Específicos:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• <strong>Dados de conta:</strong> Enquanto ativa</li>
                    <li>• <strong>Dados educacionais:</strong> 5 anos após conclusão</li>
                    <li>• <strong>Logs de segurança:</strong> 2 anos</li>
                    <li>• <strong>Dados de marketing:</strong> Até revogação</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">🗑️ Exclusão Automática:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Contas inativas por 2 anos</li>
                    <li>• Dados de teste após 30 dias</li>
                    <li>• Logs antigos automaticamente</li>
                    <li>• Backup após período legal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🔐 Medidas de Segurança Avançadas</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-red-800 mb-2">🛡️ Segurança Técnica:</h4>
                  <ul className="text-red-700 leading-relaxed space-y-1 text-sm">
                    <li>• Criptografia AES-256</li>
                    <li>• Certificados SSL/TLS</li>
                    <li>• Firewall de aplicação</li>
                    <li>• Detecção de intrusão</li>
                    <li>• Backup criptografado</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">👥 Segurança Organizacional:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Controle de acesso baseado em função</li>
                    <li>• Treinamento obrigatório em LGPD</li>
                    <li>• Auditorias internas trimestrais</li>
                    <li>• Política de senhas forte</li>
                    <li>• Monitoramento de atividades</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">🔍 Monitoramento Contínuo:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• Monitoramento 24/7 de segurança</li>
                  <li>• Alertas automáticos de anomalias</li>
                  <li>• Relatórios de conformidade mensais</li>
                  <li>• Testes de penetração semestrais</li>
                  <li>• Análise de vulnerabilidades</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📋 Exercício de Direitos</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Para exercer seus direitos LGPD, siga os procedimentos:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">📝 Como Solicitar:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Email: dpo@hubedu.ia.br</li>
                    <li>• Formulário online na plataforma</li>
                    <li>• Telefone: (11) 9999-9999</li>
                    <li>• Presencialmente (com agendamento)</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">⏱️ Prazos de Resposta:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• <strong>Acesso:</strong> 15 dias úteis</li>
                    <li>• <strong>Correção:</strong> 15 dias úteis</li>
                    <li>• <strong>Exclusão:</strong> 15 dias úteis</li>
                    <li>• <strong>Portabilidade:</strong> 15 dias úteis</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">📄 Documentação Necessária:</h4>
                <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                  <li>• Identificação com foto</li>
                  <li>• Comprovante de endereço</li>
                  <li>• Documentos específicos da solicitação</li>
                  <li>• Procurador (se aplicável)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🏛️ Autoridade Nacional de Proteção de Dados (ANPD)</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Em caso de violação de dados ou descumprimento da LGPD:
              </p>
              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Notificação à ANPD:</h4>
                <ul className="text-red-700 leading-relaxed space-y-1 text-sm">
                  <li>• Notificação em até 72 horas</li>
                  <li>• Relatório detalhado do incidente</li>
                  <li>• Medidas tomadas para correção</li>
                  <li>• Plano de prevenção</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">📞 Contato da ANPD:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                  <li>• Site: www.gov.br/anpd</li>
                  <li>• Email: contato@anpd.gov.br</li>
                  <li>• Telefone: (61) 2027-6400</li>
                  <li>• Endereço: Brasília, DF</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📞 Contato do DPO</h3>
            <p className="text-gray-700 leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre proteção de dados, 
              entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
              <p className="text-gray-800"><strong>Email:</strong> dpo@hubedu.ia.br</p>
              <p className="text-gray-800"><strong>Telefone:</strong> (11) 9999-9999</p>
              <p className="text-gray-800"><strong>Endereço:</strong> São Paulo, SP - Brasil</p>
              <p className="text-gray-800"><strong>Horário:</strong> Segunda a sexta, 8h às 18h</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LGPDModal;
