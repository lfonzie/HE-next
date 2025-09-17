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
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📞 Contato do DPO</h3>
            <p className="text-gray-700 leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre proteção de dados, 
              entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
              <p className="text-gray-800"><strong>Email:</strong> dpo@hubedu.ai</p>
              <p className="text-gray-800"><strong>Telefone:</strong> (11) 9999-9999</p>
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
