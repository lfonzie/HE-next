"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, FileText } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Termos de Uso - HubEdu.ia</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] pr-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 Resumo dos Termos
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✅ <strong>Gratuito de verdade</strong> - Sem pegadinhas ou cartão de crédito</li>
                <li>✅ <strong>Uso flexível</strong> - Pode usar sem cadastro ou criar conta para recursos completos</li>
                <li>✅ <strong>Privacidade protegida</strong> - Dados coletados apenas quando necessário</li>
                <li>✅ <strong>IA pode errar</strong> - Use como prática, não como única fonte de estudo</li>
                <li>✅ <strong>Use com responsabilidade</strong> - Não abuse do sistema ou envie conteúdo inadequado</li>
                <li>✅ <strong>Não somos o ENEM oficial</strong> - Somos uma ferramenta de estudo complementar</li>
              </ul>
            </div>

            <h2>TERMOS DE USO</h2>
            <p><strong>HubEdu.ia - Simulador ENEM e Correção de Redação Gratuitos</strong></p>
            <p><strong>Última Atualização:</strong> 14 de outubro de 2025</p>
            <p><strong>Versão:</strong> 1.0</p>

            <h3>1. ACEITAÇÃO DOS TERMOS</h3>
            <p>1.1. Ao acessar ou utilizar o Simulador ENEM e Correção de Redação da HubEdu.ia ("Serviços"), você ("Usuário" ou "você") concorda com estes Termos de Uso.</p>
            <p>1.2. Os Serviços são oferecidos por Insight Digital Serviços de Mídia, Participação e Administração de Bens Próprios Ltda, inscrita no CNPJ 10.466.594/0001-84, com sede na Rua da Penha, 620 - Sala 8 - Centro, Sorocaba/SP, CEP 18.010-002, operando sob o nome fantasia HubEdu.ia.</p>
            <p>1.3. <strong>MENORES DE IDADE:</strong> Usuários menores de 18 anos podem utilizar os Serviços com conhecimento e supervisão de seus responsáveis legais.</p>
            <p>1.4. Estes Termos podem ser atualizados a qualquer momento. Alterações entram em vigor imediatamente após publicação na plataforma.</p>

            <h3>2. DESCRIÇÃO DOS SERVIÇOS GRATUITOS</h3>
            <h4>2.1. Simulador ENEM:</h4>
            <ul>
              <li>Acesso a 3.000+ questões oficiais do ENEM (2009-2025)</li>
              <li>Modos: rápido, por área de conhecimento, simulado oficial completo</li>
              <li>Estatísticas de desempenho em tempo real</li>
              <li>Ilimitado e sem necessidade de cadastro</li>
            </ul>
            
            <h4>2.2. Correção de Redação:</h4>
            <ul>
              <li>Feedback automatizado em menos de 30 segundos</li>
              <li>Análise das 5 competências do ENEM</li>
              <li>Upload por foto ou digitação</li>
              <li>Ilimitada e sem necessidade de cadastro</li>
            </ul>

            <h4>2.3. Temas Preditivos ENEM:</h4>
            <ul>
              <li>Análise de tendências baseada em 15 anos de provas</li>
              <li>Probabilidades por tema</li>
              <li>Sugestões de repertórios socioculturais</li>
            </ul>
            
            <p>2.4. Os serviços são fornecidos gratuitamente, sem cobranças, taxas ocultas ou período de teste limitado.</p>

            <h3>3. USO COM E SEM CADASTRO</h3>
            <p>3.1. <strong>Uso sem cadastro:</strong> Os serviços básicos podem ser utilizados sem criação de conta, mas com funcionalidades limitadas.</p>
            <p>3.2. <strong>Uso com cadastro:</strong> Para acesso completo aos recursos, estatísticas personalizadas e histórico de atividades, é necessário criar uma conta gratuita.</p>
            <p>3.3. <strong>Dados coletados para cadastro:</strong></p>
            <ul>
              <li>Nome completo (para personalização)</li>
              <li>E-mail (para login e recuperação de conta)</li>
              <li>Data de nascimento (para validação de idade)</li>
              <li>Cidade e estado (para estatísticas regionais)</li>
              <li>Escola atual (para análises educacionais)</li>
            </ul>
            <p>3.4. <strong>Dados temporários para funcionamento:</strong></p>
            <ul>
              <li>Cookies de sessão (apagados ao fechar navegador)</li>
              <li>Estatísticas anônimas de uso agregado</li>
              <li>Cache temporário de respostas</li>
            </ul>
            <p>3.5. <strong>Dados não coletados:</strong></p>
            <ul>
              <li>CPF ou documentos de identificação</li>
              <li>Localização precisa ou endereço IP permanente</li>
              <li>Dados bancários ou de pagamento</li>
            </ul>

            <h3>4. USO ACEITÁVEL</h3>
            <p>4.1. Você concorda em <strong>NÃO:</strong></p>
            
            <h4>a) Abusar dos Serviços:</h4>
            <ul>
              <li>Utilizar bots, scripts ou automações para requisições massivas</li>
              <li>Sobrecarregar a infraestrutura propositalmente</li>
              <li>Fazer scraping (extração automatizada) de questões ou respostas</li>
              <li>Revender acesso aos Serviços ou criar serviços derivados</li>
            </ul>

            <h4>b) Conteúdo Inadequado:</h4>
            <ul>
              <li>Enviar redações com conteúdo ofensivo, discriminatório ou ilegal</li>
              <li>Incluir pornografia, apologia à violência ou discurso de ódio</li>
              <li>Compartilhar dados pessoais de terceiros sem consentimento</li>
            </ul>

            <h4>c) Uso Fraudulento:</h4>
            <ul>
              <li>Burlar limitações técnicas através de múltiplos acessos simultâneos</li>
              <li>Fingir ser outra pessoa ou entidade</li>
              <li>Violar direitos autorais de terceiros em redações enviadas</li>
            </ul>

            <p>4.2. <strong>Consequências de Violação</strong></p>
            <ul>
              <li>Suspensão temporária ou permanente do acesso via bloqueio de IP</li>
              <li>Remoção de conteúdo inadequado</li>
              <li>Responsabilização legal conforme legislação aplicável</li>
            </ul>

            <h3>5. CONTEÚDO GERADO POR INTELIGÊNCIA ARTIFICIAL</h3>
            <p>5.1. <strong>Natureza do Serviço:</strong></p>
            <ul>
              <li>As correções de redação e respostas de questões são geradas por sistemas de Inteligência Artificial</li>
              <li>O conteúdo é processado automaticamente, sem revisão humana individual</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg my-4">
              <h4 className="text-yellow-900 dark:text-yellow-100 font-semibold mb-2">
                ⚠️ ATENÇÃO - LEIA COM CUIDADO:
              </h4>
              <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                <li>NÃO garantimos 100% de precisão nas correções ou explicações</li>
                <li>Feedback de redação é orientativo, não substitui correção oficial do ENEM</li>
                <li>Questões são do banco oficial do INEP, mas explicações são geradas por IA</li>
                <li>Pode haver divergências com gabaritos oficiais em casos de questões anuladas</li>
                <li>Não somos afiliados ao INEP, MEC ou organizadores do ENEM</li>
              </ul>
            </div>

            <h3>6. QUESTÕES DO ENEM E DIREITOS AUTORAIS</h3>
            <p>6.1. <strong>Fonte das Questões:</strong></p>
            <ul>
              <li>Todas as questões são de domínio público, disponibilizadas pelo INEP/MEC</li>
              <li>Utilizamos questões oficiais de provas de 2009 a 2025</li>
            </ul>

            <h3>7. PRIVACIDADE E PROTEÇÃO DE DADOS</h3>
            <p>7.1. <strong>Princípio de Privacidade por Design:</strong></p>
            <ul>
              <li>Os Serviços foram desenvolvidos com foco na privacidade do usuário</li>
              <li>Para uso sem cadastro: não coletamos dados pessoais identificáveis</li>
              <li>Para uso com cadastro: coletamos apenas dados essenciais para o funcionamento do serviço</li>
              <li>Arquitetura de segurança: dados são protegidos com criptografia</li>
            </ul>
            <p>7.2. <strong>Conformidade com LGPD:</strong></p>
            <ul>
              <li>Uso sem cadastro: não há tratamento de dados pessoais</li>
              <li>Uso com cadastro: tratamento baseado em consentimento e necessidade do serviço</li>
              <li>Cookies de sessão são estritamente técnicos e temporários</li>
              <li>Estatísticas agregadas são anônimas</li>
            </ul>
            <p>7.3. <strong>Segurança dos Dados:</strong></p>
            <ul>
              <li>Dados processados em ambiente criptografado (HTTPS)</li>
              <li>Senhas são hasheadas com bcrypt</li>
              <li>Redações não são armazenadas permanentemente</li>
              <li>Não compartilhamos dados pessoais com terceiros</li>
            </ul>
            <p>7.4. <strong>Direitos LGPD (para usuários cadastrados):</strong></p>
            <ul>
              <li>Acesso aos dados pessoais</li>
              <li>Correção de dados incorretos</li>
              <li>Exclusão da conta e dados</li>
              <li>Portabilidade dos dados</li>
              <li>Revogação do consentimento</li>
            </ul>
            <p>7.5. <strong>Contato para Privacidade:</strong> legal@hubedu.ia.br</p>

            <h3>8. ISENÇÕES E LIMITAÇÕES DE RESPONSABILIDADE</h3>
            <p>8.1. <strong>Isenção de Garantias</strong></p>
            <p>OS SERVIÇOS SÃO FORNECIDOS "NO ESTADO EM QUE SE ENCONTRAM" E "CONFORME DISPONÍVEIS".</p>
            
            <p>8.1.1. <strong>NÃO garantimos:</strong></p>
            <ul>
              <li>Precisão de 100% nas correções de redação</li>
              <li>Compatibilidade com todos dispositivos, navegadores ou conexões</li>
              <li>Funcionamento durante o dia oficial do ENEM</li>
              <li>Que uso dos Serviços resultará em aprovação em vestibulares</li>
            </ul>

            <h3>9. DISPOSIÇÕES GERAIS</h3>
            <p>9.1. <strong>Lei Aplicável e Foro:</strong></p>
            <ul>
              <li>Legislação brasileira</li>
              <li>Foro da Comarca de Sorocaba/SP, com renúncia a qualquer outro</li>
            </ul>

            <h3>10. CONTATO</h3>
            <ul>
              <li>Dúvidas sobre os Termos: legal@hubedu.ia.br</li>
            </ul>

            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg mt-6">
              <h3 className="text-green-900 dark:text-green-100 font-semibold mb-2">
                ✅ DECLARAÇÃO FINAL
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Ao utilizar os Serviços, você declara ter lido e compreendido estes Termos de Uso, 
                concordar com todas as condições aqui estabelecidas, entender que os Serviços são 
                complementares e não oficiais do ENEM, reconhecer as limitações de precisão de 
                correções por IA, aceitar a coleta de dados conforme descrito para usuários cadastrados
                e utilizar os Serviços de forma ética e responsável.
              </p>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              <strong>HubEdu.ia - Preparação ENEM Gratuita e Acessível a Todos</strong><br/>
              Data de Vigência: 14 de outubro de 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
