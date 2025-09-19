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
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">📋 Termos de Uso do HubEdu.ia</h3>
            <p className="text-gray-700 leading-relaxed">
              Estes termos regem o uso da plataforma HubEdu.ia. Ao utilizar nossos serviços, 
              você concorda com todas as condições estabelecidas neste documento.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Aceitação dos Termos</h3>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar o HubEdu.ia, você concorda em cumprir e estar vinculado a estes 
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">⚠️ Importante:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                  <li>• Estes termos são vinculantes e devem ser respeitados</li>
                  <li>• Menores de idade devem ter consentimento dos pais/responsáveis</li>
                  <li>• Escolas devem garantir conformidade com LGPD</li>
                  <li>• Uso inadequado pode resultar em suspensão da conta</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Descrição do Serviço</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                O HubEdu.ia é uma plataforma de inteligência artificial desenvolvida especificamente 
                para escolas brasileiras, oferecendo:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">🎓 Serviços Educacionais:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Aulas geradas por IA baseadas na BNCC</li>
                    <li>• Simulador ENEM com +3000 questões</li>
                    <li>• Correção automática de redações</li>
                    <li>• Chat inteligente com 10 módulos</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">⚙️ Serviços Administrativos:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Automação de processos escolares</li>
                    <li>• Gestão de recursos humanos</li>
                    <li>• Controle financeiro</li>
                    <li>• Relatórios e analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Tipos de Usuários</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">👨‍🏫 Usuários Educacionais:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• Professores e coordenadores</li>
                    <li>• Alunos (com consentimento)</li>
                    <li>• Pais e responsáveis</li>
                    <li>• Administradores escolares</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-2">🏢 Usuários Institucionais:</h4>
                  <ul className="text-purple-700 leading-relaxed space-y-1 text-sm">
                    <li>• Escolas públicas e privadas</li>
                    <li>• Instituições de ensino superior</li>
                    <li>• Organizações educacionais</li>
                    <li>• Secretarias de educação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">4. Uso Aceitável</h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">✅ Usos Permitidos:</h4>
                <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                  <li>• Fins educacionais e pedagógicos</li>
                  <li>• Gestão administrativa escolar</li>
                  <li>• Preparação para exames (ENEM, vestibulares)</li>
                  <li>• Desenvolvimento profissional docente</li>
                  <li>• Pesquisa educacional (com autorização)</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">❌ Usos Proibidos:</h4>
                <ul className="text-red-700 leading-relaxed space-y-1 text-sm">
                  <li>• Atividades ilegais ou fraudulentas</li>
                  <li>• Violação de direitos autorais</li>
                  <li>• Spam ou conteúdo inadequado</li>
                  <li>• Tentativas de hackear o sistema</li>
                  <li>• Uso comercial não autorizado</li>
                  <li>• Compartilhamento de credenciais</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">5. Conta do Usuário</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🔐 Responsabilidades:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Manter confidencialidade de credenciais</li>
                  <li>• Informar dados verdadeiros e atualizados</li>
                  <li>• Notificar uso não autorizado imediatamente</li>
                  <li>• Respeitar políticas de segurança</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">👥 Contas Institucionais:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 ml-4">
                  <li>• Administrador responsável pela escola</li>
                  <li>• Gestão de usuários e permissões</li>
                  <li>• Conformidade com LGPD</li>
                  <li>• Backup e segurança dos dados</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">6. Propriedade Intelectual</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">🏢 Propriedade do HubEdu.ia:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                  <li>• Plataforma e código fonte</li>
                  <li>• Algoritmos de IA proprietários</li>
                  <li>• Interface e design</li>
                  <li>• Banco de questões ENEM</li>
                  <li>• Metodologias pedagógicas</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">📚 Propriedade do Usuário:</h4>
                <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                  <li>• Conteúdo educacional criado</li>
                  <li>• Dados pessoais e institucionais</li>
                  <li>• Materiais pedagógicos próprios</li>
                  <li>• Relatórios e análises geradas</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">7. Privacidade e Proteção de Dados</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                O tratamento de dados pessoais segue rigorosamente a LGPD:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔒 Medidas de Proteção:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• Criptografia de ponta a ponta</li>
                    <li>• Servidores brasileiros</li>
                    <li>• Conversas temporárias</li>
                    <li>• Acesso restrito</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-2">👤 Direitos dos Usuários:</h4>
                  <ul className="text-purple-700 leading-relaxed space-y-1 text-sm">
                    <li>• Acesso aos dados</li>
                    <li>• Correção de informações</li>
                    <li>• Exclusão de dados</li>
                    <li>• Portabilidade</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">8. Limitação de Responsabilidade</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">⚠️ Limitações:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• Serviço fornecido "como está"</li>
                  <li>• Não garantimos disponibilidade 100%</li>
                  <li>• Responsabilidade limitada ao valor pago</li>
                  <li>• Não responsáveis por danos indiretos</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">✅ Garantias:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                  <li>• Esforços para manter serviço estável</li>
                  <li>• Backup regular dos dados</li>
                  <li>• Suporte técnico disponível</li>
                  <li>• Atualizações de segurança</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">9. Suspensão e Encerramento</h3>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">🚫 Motivos para Suspensão:</h4>
                <ul className="text-red-700 leading-relaxed space-y-1 text-sm">
                  <li>• Violação dos termos de uso</li>
                  <li>• Uso inadequado da plataforma</li>
                  <li>• Atividades fraudulentas</li>
                  <li>• Não pagamento (planos pagos)</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">📋 Processo de Suspensão:</h4>
                <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                  <li>• Aviso prévio por email</li>
                  <li>• Prazo para correção</li>
                  <li>• Possibilidade de recurso</li>
                  <li>• Restauração após correção</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">10. Modificações e Atualizações</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos e o serviço:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">📝 Modificações:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• Notificação com 30 dias de antecedência</li>
                    <li>• Comunicação por email e plataforma</li>
                    <li>• Versão anterior disponível</li>
                    <li>• Possibilidade de cancelamento</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">🔄 Atualizações:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Melhorias contínuas</li>
                    <li>• Novas funcionalidades</li>
                    <li>• Correções de bugs</li>
                    <li>• Atualizações de segurança</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">11. Lei Aplicável e Foro</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <ul className="text-gray-700 leading-relaxed space-y-1">
                <li>• <strong>Lei aplicável:</strong> Legislação brasileira</li>
                <li>• <strong>Foro:</strong> Comarca de São Paulo/SP</li>
                <li>• <strong>Resolução de conflitos:</strong> Mediação preferencial</li>
                <li>• <strong>Idioma:</strong> Português brasileiro</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">12. Serviços de IA e Algoritmos</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                O HubEdu.ia utiliza inteligência artificial para fornecer serviços educacionais:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">🤖 Funcionalidades de IA:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Geração automática de aulas</li>
                    <li>• Correção de redações</li>
                    <li>• Chat inteligente educacional</li>
                    <li>• Recomendações personalizadas</li>
                    <li>• Análise de progresso</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">⚖️ Limitações e Responsabilidades:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• IA como ferramenta de apoio</li>
                    <li>• Supervisão humana necessária</li>
                    <li>• Não substitui avaliação docente</li>
                    <li>• Resultados podem variar</li>
                    <li>• Melhorias contínuas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">13. Conteúdo Gerado por IA</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">📝 Política de Conteúdo:</h4>
                <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                  <li>• Conteúdo gerado é para uso educacional</li>
                  <li>• Professores devem revisar antes de usar</li>
                  <li>• Adaptação às necessidades locais</li>
                  <li>• Conformidade com BNCC</li>
                  <li>• Respeito aos direitos autorais</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Limitações:</h4>
                <ul className="text-red-700 leading-relaxed space-y-1 text-sm">
                  <li>• Não garantimos precisão absoluta</li>
                  <li>• Conteúdo pode conter imprecisões</li>
                  <li>• Necessária validação pedagógica</li>
                  <li>• Responsabilidade do usuário</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">14. Planos e Pagamentos</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">💳 Modalidades de Pagamento:</h4>
                  <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                    <li>• Cartão de crédito/débito</li>
                    <li>• PIX</li>
                    <li>• Boleto bancário</li>
                    <li>• Transferência bancária</li>
                    <li>• Parcelamento disponível</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">📅 Ciclos de Cobrança:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Mensal</li>
                    <li>• Trimestral</li>
                    <li>• Semestral</li>
                    <li>• Anual (com desconto)</li>
                    <li>• Personalizado para escolas</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">💰 Política de Reembolso:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• Reembolso em até 7 dias após contratação</li>
                  <li>• Cancelamento a qualquer momento</li>
                  <li>• Não reembolso por uso parcial</li>
                  <li>• Processamento em até 30 dias</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">15. Suporte e Atendimento</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">🕒 Horários de Atendimento:</h4>
                  <ul className="text-yellow-700 leading-relaxed space-y-1 text-sm">
                    <li>• Segunda a sexta: 8h às 18h</li>
                    <li>• Sábado: 8h às 12h</li>
                    <li>• Feriados: conforme calendário</li>
                    <li>• Suporte emergencial 24h</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">📞 Canais de Suporte:</h4>
                  <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                    <li>• Chat online na plataforma</li>
                    <li>• Email: suporte@hubedu.ia.br</li>
                    <li>• Telefone: (11) 9999-9999</li>
                    <li>• WhatsApp Business</li>
                    <li>• Central de ajuda online</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">🎯 Tipos de Suporte:</h4>
                <ul className="text-green-700 leading-relaxed space-y-1 text-sm">
                  <li>• <strong>Técnico:</strong> Problemas de acesso e funcionamento</li>
                  <li>• <strong>Pedagógico:</strong> Dúvidas sobre uso educacional</li>
                  <li>• <strong>Administrativo:</strong> Questões de conta e pagamento</li>
                  <li>• <strong>Treinamento:</strong> Capacitação de usuários</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">16. Disposições Finais</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Cláusulas Importantes:</h4>
                <ul className="text-gray-700 leading-relaxed space-y-1 text-sm">
                  <li>• <strong>Integralidade:</strong> Estes termos constituem o acordo completo</li>
                  <li>• <strong>Divisibilidade:</strong> Cláusulas são independentes</li>
                  <li>• <strong>Renúncia:</strong> Não renunciamos direitos por tolerância</li>
                  <li>• <strong>Cessão:</strong> Usuário não pode ceder direitos sem autorização</li>
                  <li>• <strong>Idioma:</strong> Versão em português prevalece</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">⚖️ Resolução de Conflitos:</h4>
                <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                  <li>• <strong>Primeira instância:</strong> Mediação extrajudicial</li>
                  <li>• <strong>Segunda instância:</strong> Arbitragem</li>
                  <li>• <strong>Última instância:</strong> Poder Judiciário</li>
                  <li>• <strong>Foro:</strong> Comarca de São Paulo/SP</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">17. Contato</h3>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-gray-800 mb-2"><strong>Para questões sobre estes termos:</strong></p>
              <p className="text-gray-700"><strong>Email:</strong> legal@hubedu.ia.br</p>
              <p className="text-gray-700"><strong>Suporte:</strong> suporte@hubedu.ia.br</p>
              <p className="text-gray-700"><strong>Telefone:</strong> (11) 9999-9999</p>
              <p className="text-gray-700"><strong>Endereço:</strong> São Paulo, SP - Brasil</p>
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

export default TermsOfUseModal;
