import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Política de Privacidade</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-8 space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🔒 Compromisso com sua Privacidade</h3>
            <p className="text-gray-700 leading-relaxed">
              O HubEdu.ia está comprometido com a proteção da privacidade e segurança dos dados pessoais 
              de nossos usuários. Esta política descreve como coletamos, usamos e protegemos suas informações.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Informações que Coletamos</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📝 Informações Fornecidas por Você:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Nome completo e dados de contato</li>
                  <li>• Informações da escola (nome, endereço, CNPJ)</li>
                  <li>• Dados de professores e funcionários</li>
                  <li>• Informações de alunos (com consentimento dos pais)</li>
                  <li>• Conteúdo educacional e interações na plataforma</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📊 Informações Coletadas Automaticamente:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Dados de uso da plataforma (tempo de sessão, páginas visitadas)</li>
                  <li>• Informações técnicas (IP, navegador, dispositivo)</li>
                  <li>• Cookies e tecnologias similares</li>
                  <li>• Logs de sistema para segurança</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Como Usamos suas Informações</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎓 Finalidades Educacionais:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Personalizar conteúdo educacional</li>
                  <li>• Gerar aulas e atividades adaptadas</li>
                  <li>• Corrigir redações e simulados</li>
                  <li>• Acompanhar progresso dos alunos</li>
                  <li>• Fornecer feedback pedagógico</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">⚙️ Operações Técnicas:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Manter e melhorar a plataforma</li>
                  <li>• Prevenir fraudes e garantir segurança</li>
                  <li>• Cumprir obrigações legais</li>
                  <li>• Comunicar atualizações e novidades</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Compartilhamento de Informações</h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">✅ Não Compartilhamos:</h4>
                <ul className="text-green-700 leading-relaxed space-y-1 ml-4">
                  <li>• Dados pessoais com terceiros para marketing</li>
                  <li>• Informações de alunos com empresas externas</li>
                  <li>• Conteúdo educacional sem autorização</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">🔗 Compartilhamento Autorizado:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 ml-4">
                  <li>• Com prestadores de serviços (hosting, segurança)</li>
                  <li>• Quando exigido por autoridades competentes</li>
                  <li>• Para proteger direitos legais do HubEdu.ia</li>
                  <li>• Com consentimento explícito do usuário</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">4. Medidas de Segurança</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">🔐 Segurança Técnica:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• Criptografia SSL/TLS</li>
                  <li>• Servidores brasileiros</li>
                  <li>• Backup automático</li>
                  <li>• Monitoramento 24/7</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">👥 Segurança Organizacional:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• Acesso restrito aos dados</li>
                  <li>• Treinamento da equipe</li>
                  <li>• Auditorias regulares</li>
                  <li>• Políticas internas rigorosas</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">5. Seus Direitos (LGPD)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📋 Direitos Fundamentais:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• <strong>Acesso:</strong> Consultar seus dados</li>
                  <li>• <strong>Correção:</strong> Corrigir informações</li>
                  <li>• <strong>Exclusão:</strong> Solicitar remoção</li>
                  <li>• <strong>Portabilidade:</strong> Transferir dados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">⚖️ Direitos Adicionais:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• <strong>Revogação:</strong> Cancelar consentimento</li>
                  <li>• <strong>Oposição:</strong> Opor-se ao tratamento</li>
                  <li>• <strong>Informação:</strong> Saber sobre uso dos dados</li>
                  <li>• <strong>Revisão:</strong> Contestar decisões automatizadas</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">6. Cookies e Tecnologias</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-1">🍪 Cookies Essenciais</h4>
                <p className="text-yellow-700 text-xs">Necessários para funcionamento básico</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">📊 Cookies de Análise</h4>
                <p className="text-blue-700 text-xs">Para melhorar a plataforma</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">⚙️ Cookies de Funcionalidade</h4>
                <p className="text-green-700 text-xs">Para personalizar experiência</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">7. Retenção de Dados</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
              <li>• <strong>Dados de conta:</strong> Enquanto a conta estiver ativa</li>
              <li>• <strong>Dados educacionais:</strong> Conforme política da escola</li>
              <li>• <strong>Logs de segurança:</strong> Até 2 anos</li>
              <li>• <strong>Dados de marketing:</strong> Até revogação do consentimento</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">8. Alterações nesta Política</h3>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
              através de nosso site, email ou dentro da plataforma. Recomendamos revisar esta política regularmente.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">9. Contato</h3>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-gray-800 mb-2"><strong>Para questões sobre privacidade:</strong></p>
              <p className="text-gray-700"><strong>Email:</strong> privacidade@hubedu.ia.br</p>
              <p className="text-gray-700"><strong>DPO:</strong> dpo@hubedu.ia.br</p>
              <p className="text-gray-700"><strong>Telefone:</strong> (11) 9999-9999</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Última atualização: Setembro de 2025
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

export default PrivacyPolicyModal;
