import React from 'react';
import { X } from 'lucide-react';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Termos de Uso</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Aceitação dos Termos</h3>
            <p className="text-gray-700 leading-relaxed">
              Ao acessar e usar o HubEdu.ia, você concorda em cumprir e estar vinculado a estes 
              Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Descrição do Serviço</h3>
            <p className="text-gray-700 leading-relaxed">
              O HubEdu.ia é uma plataforma de inteligência artificial desenvolvida para escolas brasileiras, 
              oferecendo professor digital, automações administrativas e atendimento inteligente.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Uso Aceitável</h3>
            <p className="text-gray-700 leading-relaxed">
              Você concorda em usar o serviço apenas para fins legais e educacionais. É proibido usar 
              o serviço para atividades ilegais, prejudiciais ou que violem os direitos de terceiros.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">4. Conta do Usuário</h3>
            <p className="text-gray-700 leading-relaxed">
              Você é responsável por manter a confidencialidade de sua conta e senha. Todas as atividades 
              que ocorrem sob sua conta são de sua responsabilidade.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">5. Propriedade Intelectual</h3>
            <p className="text-gray-700 leading-relaxed">
              O serviço e seu conteúdo original, recursos e funcionalidades são propriedade exclusiva 
              do HubEdu.ia e estão protegidos por leis de direitos autorais e outras leis de propriedade intelectual.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">6. Limitação de Responsabilidade</h3>
            <p className="text-gray-700 leading-relaxed">
              Em nenhuma circunstância o HubEdu.ia será responsável por danos diretos, indiretos, 
              incidentais ou consequenciais resultantes do uso ou incapacidade de usar o serviço.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">7. Modificações</h3>
            <p className="text-gray-700 leading-relaxed">
              Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento, 
              com ou sem aviso prévio.
            </p>
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

export default TermsOfUseModal;
