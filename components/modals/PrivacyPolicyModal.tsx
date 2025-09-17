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
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Informações que Coletamos</h3>
            <p className="text-gray-700 leading-relaxed">
              Coletamos informações que você nos fornece diretamente, como quando cria uma conta, 
              preenche formulários ou entra em contato conosco. Isso pode incluir nome, email, 
              telefone e informações da escola.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Como Usamos suas Informações</h3>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, 
              processar transações, comunicar com você e cumprir obrigações legais.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Compartilhamento de Informações</h3>
            <p className="text-gray-700 leading-relaxed">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">4. Segurança</h3>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
              proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">5. Seus Direitos</h3>
            <p className="text-gray-700 leading-relaxed">
              Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas 
              informações pessoais. Entre em contato conosco para exercer esses direitos.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">6. Alterações nesta Política</h3>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre 
              mudanças significativas através de nosso site ou por email.
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

export default PrivacyPolicyModal;
