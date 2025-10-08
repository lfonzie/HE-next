'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
import {
  Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare,
  Bot, Zap, Rocket, Shield, Heart, Phone, Mail, MapPin, Target, TrendingUp,
  BookOpen, Lightbulb, LogIn, ChevronDown, Brain, Award, Globe,
  GraduationCap, Trophy, Users2, BarChart3, Settings, Calendar, FileText,
  MessageCircle, Search, Filter, Download, Share2
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

// Lazy-loaded modals
const PrivacyPolicyModal = lazy(() => import('../components/modals/PrivacyPolicyModal'));
const TermsOfUseModal = lazy(() => import('../components/modals/TermsOfUseModal'));
const LGPDModal = lazy(() => import('../components/modals/LGPDModal'));

// Custom debounce function to replace lodash
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Constants
const BRAND = {
  name: 'HubEdu.ia',
  tagline: 'A Educação do Futuro',
  description: 'Aulas completas em 2 minutos, chat Professor IA para dúvidas, simulador ENEM completo e correção automática por IA de redações e questões. A única plataforma educacional com 5 principais IAs integradas.'
};

const CHAT_MODULES = [
  { name: 'Professor IA', description: 'Assistente pedagógico para dúvidas educacionais', icon: '👩‍🏫', features: ['Dúvidas sobre BNCC', 'Sugestões de atividades', 'Planejamento de aulas', 'Ideias de avaliação', 'Metodologias ativas'], benefits: 'Suporte pedagógico inteligente' },
  { name: 'Suporte T.I.', description: 'Assistente técnico para questões de tecnologia', icon: '💻', features: ['Problemas de sistema', 'Configuração básica', 'Orientações digitais', 'Soluções simples', 'Troubleshooting'], benefits: 'Resolução técnica rápida' },
  { name: 'Atendimento', description: 'Assistente para comunicação escolar', icon: '👨‍👩‍👧‍👦', features: ['Informações gerais', 'Orientações básicas', 'Comunicação simples', 'FAQ escolar', 'Direcionamento'], benefits: 'Comunicação eficiente' },
  { name: 'Bem-estar', description: 'Assistente para orientações de saúde mental', icon: '💚', features: ['Dicas de bem-estar', 'Orientações básicas', 'Recursos de apoio', 'Informações gerais', 'Direcionamento'], benefits: 'Suporte emocional básico' },
  { name: 'Social Media', description: 'Assistente para conteúdo de redes sociais', icon: '📱', features: ['Ideias de posts', 'Sugestões de conteúdo', 'Textos educativos', 'Hashtags relevantes', 'Inspirações'], benefits: 'Conteúdo para redes sociais' },
  { name: 'Coordenação', description: 'Assistente para coordenação pedagógica', icon: '👨‍💼', features: ['Planejamento pedagógico', 'Organização de eventos', 'Coordenação de atividades', 'Sugestões metodológicas', 'Orientações gerais'], benefits: 'Suporte à coordenação' },
  { name: 'Secretaria', description: 'Assistente para processos administrativos', icon: '📋', features: ['Orientações administrativas', 'Processos básicos', 'Documentação simples', 'Organização de dados', 'Fluxos padrão'], benefits: 'Automação administrativa' },
  { name: 'RH', description: 'Assistente para recursos humanos', icon: '👥', features: ['Orientações de RH', 'Processos básicos', 'Comunicação interna', 'Documentação simples', 'Fluxos padrão'], benefits: 'Suporte em RH' },
  { name: 'Financeiro', description: 'Assistente para questões financeiras', icon: '💰', features: ['Orientações financeiras', 'Cálculos básicos', 'Relatórios simples', 'Organização de dados', 'Controle básico'], benefits: 'Suporte financeiro' },
  { name: 'Gestão', description: 'Assistente para análise e relatórios', icon: '📊', features: ['Análise de dados', 'Relatórios básicos', 'Insights simples', 'Visualizações', 'Métricas educacionais'], benefits: 'Analytics educacional' },
];

const AI_INTEGRATIONS = [
  { name: 'Grok 4', description: 'IA avançada para análise de dados e insights educacionais', icon: '⚡', features: ['Análise de performance', 'Insights pedagógicos', 'Dados em tempo real', 'Relatórios avançados'], color: 'from-blue-500 to-blue-600' },
  { name: 'OpenAI ChatGPT 5', description: 'Geração de conteúdo educacional personalizado', icon: '🤖', features: ['Conteúdo adaptativo', 'Explicações detalhadas', 'Suporte pedagógico', 'Criação de exercícios'], color: 'from-green-500 to-green-600' },
  { name: 'Google Gemini 2.5', description: 'Processamento multimodal para aulas interativas', icon: '💎', features: ['Análise de imagens', 'Processamento de texto', 'Síntese de informações', 'Busca inteligente'], color: 'from-purple-500 to-purple-600' },
  { name: 'Claude 4.5', description: 'Raciocínio avançado para correção e feedback', icon: '🧠', features: ['Correção de redações', 'Análise de questões', 'Feedback personalizado', 'Raciocínio complexo'], color: 'from-orange-500 to-orange-600' },
  { name: 'Perplexity', description: 'Busca em tempo real para conteúdo atualizado', icon: '🔍', features: ['Busca em tempo real', 'Fontes verificadas', 'Conteúdo atualizado', 'Pesquisa contextual'], color: 'from-red-500 to-red-600' },
];

const COMPETITORS = [
  { name: 'ChatGPT', price: 'US$ 20/mês por usuário (~R$ 106/mês)', restrictions: ['Conteúdo não adaptado para idade escolar', 'Sem conteúdo específico para escolas', 'Não baseado na BNCC', 'Sem compliance LGPD'], icon: '🤖' },
  { name: 'Grok', price: 'US$ 30/mês por usuário (~R$ 159/mês)', restrictions: ['Conteúdo não adaptado para idade escolar', 'Sem simulador ENEM', 'Não baseado na BNCC', 'Sem compliance LGPD'], icon: '⚡' },
  { name: 'Gemini 2.5', price: 'US$ 20/mês por usuário (~R$ 106/mês)', restrictions: ['Conteúdo não adaptado para idade escolar', 'Sem conteúdo específico para escolas', 'Não baseado na BNCC', 'Sem compliance LGPD'], icon: '💎' },
];

const ADVANTAGES = [
  'Disponível para todas as idades (incluindo menores)',
  'Conteúdo específico para escolas brasileiras',
  '100% baseado na BNCC',
  'Compliance total com LGPD',
  'Conversas temporárias (apagadas automaticamente)',
  'Chat Professor IA para dúvidas pedagógicas',
  'Aulas completas geradas em 2 minutos',
  'Simulador ENEM com 3000+ questões oficiais',
  'Correção automática por IA de redações e questões',
  'Infraestrutura global de ponta',
  'Suporte nacional especializado',
  'Plataforma pioneira para educação brasileira',
];

const HERO_MODULES = [
  { title: 'Aulas Completas', description: 'Aulas completas sobre qualquer tema com quizzes, geradas em menos de 2 minutos por IA.', icon: '🎮', features: ['Qualquer tema educacional', 'Aulas completas com quizzes', 'Geração em menos de 2 minutos', '100% baseado na BNCC', 'Narração em tempo real'], cta: 'Explorar Aula' },
  { title: 'Chat Professor IA', description: 'Professor virtual para tirar dúvidas pedagógicas instantaneamente com 5 principais IAs.', icon: '👩‍🏫', features: ['Dúvidas pedagógicas', 'Suporte BNCC', 'Sugestões de atividades', 'Orientação educacional', '5 IAs integradas'], cta: 'Conversar com Professor' },
  { title: 'Simulador ENEM', description: '3000 questões oficiais (2009-2024) + infinitas geradas por IA com explicações detalhadas.', icon: '📚', features: ['3000+ questões oficiais', 'Questões infinitas por IA', 'Explicação de erros por IA', 'Modos personalizados', 'Análise detalhada'], cta: 'Fazer Simulado' },
  { title: 'Redação ENEM', description: 'Todos os temas oficiais desde 1998 + infinitos gerados por IA baseados nas principais tendências.', icon: '✍️', features: ['Temas oficiais desde 1998', 'Infinitos temas por IA', 'Tendências atuais 2025', 'Correção automática por IA', 'Feedback personalizado'], cta: 'Testar Redação' },
];

const FEATURES = {
  lessons: [
    { title: 'Aulas Completas', description: 'Aulas completas sobre qualquer assunto, geradas em menos de 2 minutos.', icon: '🎮' },
    { title: 'Geração Ultra-Rápida', description: 'Aulas completas com quizzes geradas em menos de 2 minutos por IA.', icon: '⚡' },
    { title: 'Narração em Tempo Real', description: 'Aulas com narração automática em tempo real para melhor compreensão.', icon: '🎙️' },
    { title: '100% Baseado na BNCC', description: 'Conteúdo rigorosamente alinhado à Base Nacional Comum Curricular.', icon: '📚' },
  ],
  chat: [
    { title: 'Professor IA', description: 'Professor virtual para dúvidas pedagógicas com 5 principais IAs integradas.', icon: '👩‍🏫', stats: 'Suporte Pedagógico' },
    { title: '10 Módulos Especializados', description: 'Chat especializado para diferentes áreas da escola e comunidade.', icon: '💬', stats: 'Módulos Especializados' },
    { title: 'Dúvidas Instantâneas', description: 'Tire dúvidas pedagógicas, técnicas e administrativas instantaneamente.', icon: '⚡', stats: 'Resposta Rápida' },
    { title: 'Conversas Temporárias', description: 'Chats apagados automaticamente para compliance total com LGPD.', icon: '🔒', stats: 'LGPD Compliant' },
  ],
  school: [
    { title: 'Personalização de Conteúdo', description: 'Conteúdo adaptado ao currículo e metodologia da escola.', icon: '📚', stats: 'Conteúdo Customizado' },
    { title: 'Ferramentas de IA para Todos', description: 'Ferramentas específicas para professores, coordenadores, gestores, alunos e pais.', icon: '🤖', stats: '5 Perfis de Usuário' },
    { title: 'Conteúdo Personalizado', description: 'Aulas adaptadas para diferentes níveis e necessidades de cada turma.', icon: '🎯', stats: 'Adaptação Inteligente' },
  ],
  enem: [
    { title: '3000+ Questões Oficiais', description: 'Banco completo com questões oficiais do ENEM (2009-2024) + infinitas geradas por IA.', icon: '📚', stats: '3000+ Questões Oficiais' },
    { title: 'Temas de Redação Completos', description: 'Todos os temas oficiais desde 1998 + infinitos gerados por IA baseados em tendências.', icon: '✍️', stats: 'Temas desde 1998' },
    { title: 'Explicação de Erros por IA', description: 'Explicação detalhada de questões erradas no simulado usando IA avançada.', icon: '🧠', stats: 'Feedback Inteligente' },
    { title: 'Correção Automática', description: 'Correção instantânea de redações por IA com critérios oficiais do ENEM.', icon: '🤖', stats: 'Correção Instantânea' },
  ],
};

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Professora de Biologia, Escola Nova Era', content: 'Incrível! Criei uma aula completa sobre fotossíntese em menos de 2 minutos. Os alunos aumentaram 40% no desempenho com os quizzes interativos e narração automática.', rating: 5 },
  { name: 'Carlos Mendes', role: 'Coordenador Pedagógico, Instituto Esperança', content: 'O simulador ENEM com 3000+ questões oficiais revolucionou nossa preparação. A explicação de erros por IA fez nossos alunos subirem 35 pontos na média geral.', rating: 5 },
  { name: 'Ana Silva', role: 'Diretora, Colégio Crescer', content: 'Economizamos 15 horas por semana com a correção automática de redações. Os 10 módulos de chat atendem toda nossa comunidade escolar com excelência.', rating: 5 },
];

const FAQ_ITEMS = [
  { question: 'Como são criadas as aulas?', answer: 'A IA gera aulas completas sobre qualquer tema em menos de 2 minutos, com slides, atividades, quizzes e narração em tempo real, baseadas na BNCC.' },
  { question: 'Quanto tempo leva para gerar uma aula?', answer: 'Menos de 2 minutos! A IA cria aulas completas com quizzes sobre qualquer tema educacional instantaneamente.' },
  { question: 'O simulador ENEM tem quantas questões?', answer: 'Mais de 3000 questões oficiais (2009-2024) + infinitas geradas por IA com explicações detalhadas de erros.' },
  { question: 'Quantos temas de redação estão disponíveis?', answer: 'Todos os temas oficiais do ENEM desde 1998 + infinitos temas gerados por IA baseados nas principais tendências atuais.' },
  { question: 'Quantos módulos tem o chat inteligente?', answer: '10 módulos especializados diferentes: Professor IA, Suporte T.I., Atendimento Pais, Bem-estar, Social Media, Coordenação, Secretaria, RH, Financeiro e Gestão.' },
  { question: 'As aulas têm narração?', answer: 'Sim, todas as aulas incluem narração automática em tempo real para melhor compreensão e acessibilidade.' },
  { question: 'Quais IAs são utilizadas?', answer: 'Integramos as principais IAs: Grok 4, OpenAI ChatGPT 5, Google Gemini 2.5, Claude 4.5 e Perplexity para buscas em tempo real.' },
  { question: 'Como funciona a correção de redação?', answer: 'Correção automática por IA com critérios oficiais ENEM, feedback personalizado e sugestões de melhoria.' },
  { question: 'O simulador explica questões erradas?', answer: 'Sim, o sistema usa IA avançada para explicar detalhadamente cada questão errada no simulado do ENEM.' },
  { question: 'As aulas seguem a BNCC?', answer: 'Sim, todas as aulas são rigorosamente alinhadas à Base Nacional Comum Curricular.' },
  { question: 'O chat é seguro para alunos?', answer: 'Sim, módulos são seguros por faixa etária e função escolar.' },
  { question: 'Os pais têm acesso?', answer: 'Sim, via chat omni-channel (WhatsApp, site e redes sociais).' },
  { question: 'É compatível com LGPD?', answer: 'Sim, com chats efêmeros e dados protegidos em servidores brasileiros.' },
  { question: 'Menores de 18 anos podem usar?', answer: 'Sim, a plataforma é acessível para todas as idades.' },
  { question: 'Quando estará disponível?', answer: 'Em breve, com suporte completo para escolas brasileiras.' },
];

// Interfaces for Type Safety
interface Feature {
  title: string;
  description: string;
  icon: string;
  stats?: string;
}

interface Module {
  name?: string;
  title?: string;
  description: string;
  icon: string;
  features: string[];
  benefits?: string;
  cta?: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Competitor {
  name: string;
  price?: string;
  restrictions?: string[];
  icon: string;
}

interface AIIntegration {
  name: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
}

// Skeleton Loader for Suspense
const SkeletonLoader = () => (
  <div className="animate-pulse bg-gray-200 h-64 rounded-2xl"></div>
);

// Reusable Components
const SectionTitle: React.FC<{ children: React.ReactNode; subtitle: string }> = ({ children, subtitle }) => (
  <div className="text-center mb-12">
    <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">{children}</h2>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
  </div>
);

const FeatureCard: React.FC<{ feature: Feature; gradient?: string; border?: string }> = ({
  feature,
  gradient = 'from-yellow-50 to-white',
  border = 'border-yellow-200 hover:border-yellow-400'
}) => (
  <motion.div
    className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={feature.title}
  >
    <div className="text-center">
      <div className="text-4xl mb-4" aria-hidden="true">{feature.icon}</div>
      <h3 className="text-lg font-bold text-yellow-600 mb-3">{feature.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
      {feature.stats && (
        <div className="mt-4">
          <span className="text-sm font-bold text-black bg-yellow-400 px-3 py-1 rounded-full">{feature.stats}</span>
        </div>
      )}
    </div>
  </motion.div>
);

const ModuleCard: React.FC<{ module: Module; disabled?: boolean }> = ({ module, disabled = true }) => (
  <motion.div
    className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-2 border-yellow-300 hover:border-yellow-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={module.title}
  >
    <div className="text-center mb-6">
      <div className="text-4xl mb-4" aria-hidden="true">{module.icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-3">{module.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{module.description}</p>
    </div>
    <div className="space-y-2 mb-6">
      {module.features.slice(0, 3).map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
          <span>{feature}</span>
        </div>
      ))}
      {module.features.length > 3 && (
        <div className="text-sm text-gray-500 text-center font-medium">+{module.features.length - 3} mais</div>
      )}
    </div>
    <button
      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      aria-disabled={disabled}
    >
      {module.cta}
    </button>
  </motion.div>
);

const ModuleModal: React.FC<{ module: Module | null; isOpen: boolean; onClose: () => void }> = ({ module, isOpen, onClose }) => {
  if (!isOpen || !module) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="dialog"
        aria-labelledby="module-modal-title"
        aria-modal="true"
      >
        <motion.div
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl" aria-hidden="true">{module.icon}</div>
              <div>
                <h3 id="module-modal-title" className="text-2xl font-bold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">🎯 Funcionalidades:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {module.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
            <h4 className="text-lg font-bold text-gray-900 mb-2">✨ Benefício Principal:</h4>
            <p className="text-gray-700">{module.benefits}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-2xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Fechar"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ChatModulesGrid: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModuleClick = useCallback((module: Module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedModule(null);
  }, []);

  return (
    <>
      <motion.div
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-10 rounded-3xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-4xl font-extrabold mb-6 text-center">💬 10 Módulos de Chat IA</h3>
        <p className="text-2xl font-semibold mb-10 text-center">Soluções de IA para toda a comunidade escolar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {CHAT_MODULES.map((module, index) => (
            <motion.div
              key={index}
              className="text-center bg-white/20 p-4 sm:p-6 rounded-2xl cursor-pointer hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              onClick={() => handleModuleClick(module)}
              whileHover={{ scale: 1.05 }}
              role="button"
              tabIndex={0}
              aria-label={`Saiba mais sobre ${module.name}`}
              onKeyDown={(e) => e.key === 'Enter' && handleModuleClick(module)}
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3" aria-hidden="true">{module.icon}</div>
              <div className="font-bold text-sm sm:text-base">{module.name}</div>
              <div className="text-xs sm:text-sm">{module.description}</div>
              <div className="text-xs sm:text-sm mt-2 sm:mt-3 text-yellow-800 font-semibold">Clique para saber mais</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <ModuleModal module={selectedModule} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-yellow-400 transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={`Depoimento de ${testimonial.name}`}
  >
    <div className="flex mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
      ))}
    </div>
    <blockquote className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</blockquote>
    <footer>
      <div className="font-bold">{testimonial.name}</div>
      <div className="text-gray-300">{testimonial.role}</div>
    </footer>
  </motion.div>
);

const AIIntegrationCard: React.FC<{ integration: AIIntegration }> = ({ integration }) => (
  <motion.div
    className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={integration.name}
  >
    <div className="text-center mb-6">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${integration.color} flex items-center justify-center text-white text-2xl shadow-lg`} aria-hidden="true">
        {integration.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-3">{integration.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
    </div>
    <div className="space-y-2">
      {integration.features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const CompetitorCard: React.FC<{ competitor: Competitor; isSpecial?: boolean }> = ({ competitor, isSpecial = false }) => (
  <motion.div
    className={`${isSpecial ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 shadow-lg ${isSpecial ? 'relative shadow-2xl' : ''}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={`Comparativo com ${competitor.name}`}
  >
    {isSpecial && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">🏆 MELHOR ESCOLHA</span>
      </div>
    )}
    <div className={`text-center mb-6 ${isSpecial ? 'mt-4' : ''}`}>
      <div className="text-4xl mb-3" aria-hidden="true">{competitor.icon}</div>
      <h3 className={`text-2xl font-bold mb-2 ${isSpecial ? 'text-black' : 'text-gray-800'}`}>{competitor.name}</h3>
      <div className={`text-3xl font-extrabold mb-4 ${isSpecial ? 'text-black' : 'text-red-500'}`}>{competitor.price || 'Preço Especial'}</div>
    </div>
    <div className="space-y-3">
      <h4 className={`font-bold mb-3 ${isSpecial ? 'text-black' : 'text-gray-700'}`}>{isSpecial ? '✅ Vantagens:' : '❌ Limitações:'}</h4>
      {(competitor.restrictions || ADVANTAGES.slice(0, 5)).map((item, idx) => (
        <div key={idx} className={`flex items-start gap-2 text-sm ${isSpecial ? 'text-black' : 'text-gray-600'}`}>
          <span className={`mt-1 ${isSpecial ? 'text-green-600' : 'text-red-500'}`}>•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const FAQItem: React.FC<{ item: FAQ; index: number; isOpen: boolean; onToggle: (index: number) => void }> = ({ item, index, isOpen, onToggle }) => (
  <motion.div
    className="border border-gray-200 rounded-2xl overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    role="region"
    aria-label={`Pergunta: ${item.question}`}
  >
    <button
      className="w-full p-6 text-left hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
      onClick={() => onToggle(index)}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{item.question}</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id={`faq-answer-${index}`}
          className="px-6 pb-6"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="region"
        >
          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// Main Component
const HubEduLanding: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [openFAQs, setOpenFAQs] = useState(new Set<number>());
  const [modalsState, setModalsState] = useState({ privacy: false, terms: false, lgpd: false });

  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQs((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((modalType: 'privacy' | 'terms' | 'lgpd') => {
    setModalsState((prev) => ({ ...prev, [modalType]: !prev[modalType] }));
  }, []);

  useEffect(() => {
    setIsClient(true);
    setIsVisible(true);
    const handleScroll = debounce(() => setScrollY(window.scrollY), 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = useMemo(
    () =>
      `fixed top-0 w-full z-50 transition-all duration-300 ${
        isClient && scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white/90 backdrop-blur-sm'
      } border-b-2 border-yellow-300`,
    [scrollY, isClient]
  );

  return (
    <>
      <Head>
        <title>{BRAND.name} - {BRAND.tagline} | Plataforma Educacional com IA</title>
        <meta name="description" content={BRAND.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="educação, IA, BNCC, LGPD, ENEM, simulador, aulas interativas, Grok 4, ChatGPT 5, Gemini 2.5, Claude 4.5, Perplexity, narração tempo real, correção automática" />
        <meta name="author" content="HubEdu.ia" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${BRAND.name} - ${BRAND.tagline} | Plataforma Educacional com IA`} />
        <meta property="og:description" content={BRAND.description} />
        <meta property="og:image" content="/assets/Logo_HubEdu.ia.svg" />
        <meta property="og:url" content="https://hubedu.ia.br" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HubEdu.ia" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${BRAND.name} - ${BRAND.tagline}`} />
        <meta name="twitter:description" content={BRAND.description} />
        <meta name="twitter:image" content="/assets/Logo_HubEdu.ia.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://hubedu.ia.br" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "HubEdu.ia",
            "description": "Aulas completas em 2 minutos, chat Professor IA para dúvidas, simulador ENEM completo e correção automática por IA de redações e questões. A única plataforma educacional com 5 principais IAs integradas.",
            "url": "https://hubedu.ia.br",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BRL",
              "availability": "https://schema.org/PreOrder"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "3"
            },
            "author": {
              "@type": "Organization",
              "name": "HubEdu.ia"
            }
          })}
        </script>
      </Head>
      <div className="min-h-screen w-full overflow-x-hidden scroll-smooth">
        {/* Launch Banner */}
        <motion.div
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-center py-3 font-bold text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="alert"
          aria-live="polite"
        >
          🚀 EM BREVE - Aulas com Narração + 5 Principais IAs + Correção ENEM por IA
        </motion.div>

        {/* Header */}
        <header className={headerClasses} role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/Logo_HubEdu.ia.svg"
                alt="HubEdu.ia Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
                loading="eager"
              />
              <div className="text-xl font-bold">
                <span className="text-black">Hub</span><span className="text-yellow-500">Edu</span><span className="text-black">.ia</span>
              </div>
            </div>
            <button
              disabled
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-2xl shadow-lg flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-disabled="true"
            >
              <LogIn className="w-5 h-5" aria-hidden="true" /> EM BREVE <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 text-black pt-24 pb-16 relative overflow-hidden" aria-labelledby="hero-title">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/30 to-yellow-700/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '3s' }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-2xl text-lg font-bold mb-8 shadow-xl animate-pulse">
                <Rocket className="w-6 h-6" aria-hidden="true" /> 🚀 EM BREVE - A Educação do Futuro
              </div>
              <div className="flex justify-center mb-6">
                <Image
                  src="/assets/Logo_HubEdu.ia.svg"
                  alt="HubEdu.ia Logo"
                  width={120}
                  height={120}
                  className="h-20 w-auto"
                  loading="eager"
                  priority
                />
              </div>
              <h1 id="hero-title" className="text-6xl lg:text-8xl font-extrabold mb-8 leading-tight text-black">
                <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">{BRAND.name}</span><br />
                <span className="text-4xl lg:text-6xl font-bold text-gray-800">{BRAND.tagline}</span>
              </h1>
              <h2 className="text-xl lg:text-2xl mb-8 text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">{BRAND.description}</h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <button
                  className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-extrabold text-xl shadow-2xl rounded-2xl flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                  aria-disabled="true"
                >
                  <Play className="w-6 h-6" aria-hidden="true" /> Em Breve
                </button>
                <button
                  className="px-10 py-5 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-700 font-bold text-xl rounded-2xl flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                  aria-disabled="true"
                >
                  <Phone className="w-6 h-6" aria-hidden="true" /> Agendar Demonstração Gratuita <ArrowRight className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {HERO_MODULES.map((module, index) => (
                  <ModuleCard key={index} module={module} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Innovation Section */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="A única plataforma que combina as 5 principais IAs do mundo com pedagogia brasileira - resultado: educação 10x mais eficiente">
              🚀 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Por que HubEdu.ia é Revolucionário?</span>
            </SectionTitle>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: '🎮', title: 'Aulas Completas em 2 Minutos', description: 'Aulas completas sobre qualquer tema com quizzes, geradas instantaneamente por IA.' },
                { icon: '👩‍🏫', title: 'Chat Professor IA', description: 'Professor virtual para dúvidas pedagógicas com 5 principais IAs integradas.' },
                { icon: '📚', title: '3000+ Questões Oficiais', description: 'Simulador ENEM com questões oficiais (2009-2024) + infinitas geradas por IA.' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  role="region"
                  aria-label={feature.title}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4" aria-hidden="true">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8 rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-extrabold mb-6 text-center">🌟 Por que HubEdu.ia é Revolucionário?</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-purple-300">🔬 Tecnologia de Ponta:</h4>
                  <ul className="space-y-3 text-sm">
                    {['Aulas completas em 2 minutos', 'Chat Professor IA com 5 IAs', '3000+ questões oficiais ENEM', 'Correção automática por IA', 'Cloud Native: Arquitetura escalável'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-pink-300">🎓 Pedagogia Brasileira:</h4>
                  <ul className="space-y-3 text-sm">
                    {['BNCC Integrada: Alinhada com competências', 'Metodologias Ativas: Aprendizado interativo', 'Gamificação: Engajamento via jogos', 'Inclusão Digital: Acessível para todos'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Integrations Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Integração com as principais IAs do mercado para máxima eficiência educacional">
              🤖 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Principais IAs Integradas</span>
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
              {AI_INTEGRATIONS.map((integration, index) => (
                <AIIntegrationCard key={index} integration={integration} />
              ))}
            </div>
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-extrabold mb-6 text-center">🚀 Por que Integrar Múltiplas IAs?</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-indigo-300">🎯 Especialização por Função:</h4>
                  <ul className="space-y-3 text-sm">
                    {['Análise de dados e insights', 'Geração de conteúdo', 'Processamento multimodal', 'Raciocínio e correção', 'Busca em tempo real'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-purple-300">⚡ Vantagens da Integração:</h4>
                  <ul className="space-y-3 text-sm">
                    {['Melhor qualidade de conteúdo', 'Feedback mais preciso', 'Correção avançada', 'Busca contextual', 'Análise de performance'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="4 módulos principais + 10 módulos de chat para transformar sua escola">
              🎮 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Como Funciona</span>
            </SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {FEATURES.lessons.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
            <ChatModulesGrid />
          </div>
        </section>

        {/* ENEM Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="A melhor plataforma para preparação ao ENEM, 100% alinhada à BNCC">
              🎓 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Preparação para o ENEM</span>
            </SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {FEATURES.enem.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-extrabold mb-4">🏆 Por que Escolher Nosso Simulador?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '📈', title: 'Resultados Comprovados', description: 'Estudantes aumentam 45% no desempenho' },
                  { icon: '🧠', title: 'Explicação de Erros', description: 'IA explica detalhadamente cada questão errada' },
                  { icon: '⚡', title: 'Tecnologia Avançada', description: 'IA que gera questões personalizadas' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-3" aria-hidden="true">{item.icon}</div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Schools Section */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Soluções completas para escolas brasileiras, alinhadas à BNCC e LGPD">
              🏫 <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Soluções para Escolas</span>
            </SectionTitle>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {FEATURES.school.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  gradient="from-gray-800 to-gray-900"
                  border="border-yellow-400 hover:border-yellow-300"
                />
              ))}
            </div>
          </div>
        </section>

        {/* LGPD Compliance Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Compatível com a LGPD, garantindo privacidade e segurança">
              🛡️ <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Compliance com LGPD</span>
            </SectionTitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { icon: '🗑️', title: 'Conversas Temporárias', description: 'Conversas descartadas automaticamente após cada sessão.' },
                { icon: '🌐', title: 'Infraestrutura Global', description: 'Nuvem global para máxima performance e disponibilidade.' },
                { icon: '🔒', title: 'Criptografia Total', description: 'Dados protegidos com criptografia de ponta a ponta.' },
                { icon: '👶', title: 'Todas as Idades', description: 'Plataforma segura e adequada para o contexto educacional.' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  role="region"
                  aria-label={feature.title}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4" aria-hidden="true">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BNCC Compliance Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Conteúdos rigorosamente alinhados à Base Nacional Comum Curricular">
              📚 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100% BNCC</span>
            </SectionTitle>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: '🎯', title: 'Competências BNCC', description: 'Desenvolvimento das 10 competências gerais da BNCC.' },
                { icon: '📋', title: 'Objetivos de Aprendizagem', description: 'Aulas alinhadas aos objetivos da BNCC por ano e disciplina.' },
                { icon: '🔄', title: 'Atualizações Automáticas', description: 'Conteúdo atualizado conforme mudanças na BNCC.' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  role="region"
                  aria-label={feature.title}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4" aria-hidden="true">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-extrabold mb-6 text-center">🎓 Por que a BNCC é Fundamental?</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-blue-300">📖 Base Nacional Comum Curricular:</h4>
                  <ul className="space-y-3 text-sm">
                    {['Padronização: Conteúdo unificado nacionalmente', 'Competências: Habilidades do século XXI', 'Flexibilidade: Adaptação às realidades locais', 'Qualidade: Educação de excelência'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-blue-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl">
                  <h4 className="text-xl font-bold mb-4 text-purple-300">🚀 HubEdu.ia + BNCC:</h4>
                  <ul className="space-y-3 text-sm">
                    {['IA Alinhada: Conteúdo gerado com base na BNCC', 'Conteúdo Personalizado: Aulas sob medida', 'Avaliação BNCC: Questões alinhadas', 'Relatórios BNCC: Acompanhamento de competências'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Depoimentos de educadores que já conhecem nossa plataforma">💬 O que dizem <span className="text-yellow-400">sobre nós</span></SectionTitle>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Tire suas dúvidas sobre o HubEdu.ia">❓ Perguntas <span className="text-yellow-500">Frequentes</span></SectionTitle>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem key={index} item={item} index={index} isOpen={openFAQs.has(index)} onToggle={toggleFAQ} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Comparison Section */}
        <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle subtitle="Enquanto outras plataformas cobram R$ 106-159/mês por usuário, HubEdu.ia oferece tudo isso por um preço especial para escolas">
              💰 <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">Por que Escolher HubEdu.ia?</span>
            </SectionTitle>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {COMPETITORS.map((competitor, index) => (
                <CompetitorCard key={index} competitor={competitor} />
              ))}
              <CompetitorCard competitor={{ name: 'HubEdu.ia', icon: '🎓', price: 'Preço Especial' }} isSpecial />
            </div>
            <motion.div
              className="text-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-extrabold mb-4">🎯 Por que HubEdu.ia é Superior?</h3>
              <p className="text-lg mb-6 font-medium">Enquanto ChatGPT, Grok e Gemini cobram caro e não atendem escolas, HubEdu.ia oferece uma solução completa e especializada para educação brasileira.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h4 className="font-bold text-lg mb-3">🚫 Limitações de ChatGPT, Grok e Gemini:</h4>
                  <ul className="space-y-2 text-sm">
                    {['Restrição de idade: Menores de 18 anos não podem usar', 'Preço alto: US$ 20-30/mês (~R$ 106-159)', 'Conteúdo não adaptado para escolas', 'Sem BNCC', 'Sem LGPD: Conversas salvas permanentemente', 'Sem simulador ENEM', 'Sem gestão escolar'].map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg mb-3">✅ Vantagens do HubEdu.ia:</h4>
                  <ul className="space-y-2 text-sm">
                    {['Todas as idades: Crianças, adolescentes e adultos', 'Preço especial para escolas', 'Conteúdo adaptado para educação brasileira', '100% BNCC', 'Total LGPD: Chats temporários', 'Chat Professor IA para dúvidas', 'Aulas completas em 2 minutos', '3000+ questões oficiais + infinitas por IA', 'Correção automática por IA', 'Gestão completa: IA + Automação + Analytics'].map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h2
              className="text-4xl sm:text-5xl font-extrabold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              A Educação do Futuro Chega Agora
            </motion.h2>
            <motion.p
              className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Transforme sua escola com a plataforma mais avançada do Brasil. Aulas completas em 2 minutos, chat Professor IA para dúvidas e correção automática por IA.
            </motion.p>
            <motion.div
              className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 4 Módulos Principais:</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {[
                  { title: 'Aulas Completas', desc: 'Qualquer tema em minutos', icon: '🎮', color: 'from-blue-500 to-blue-600' },
                  { title: 'Chat Professor IA', desc: 'Dúvidas pedagógicas', icon: '👩‍🏫', color: 'from-green-500 to-green-600' },
                  { title: 'Simulador ENEM', desc: '3000+ questões oficiais', icon: '📚', color: 'from-purple-500 to-purple-600' },
                  { title: 'Redação ENEM', desc: 'Temas desde 1998', icon: '✍️', color: 'from-yellow-500 to-yellow-600' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className={`text-3xl p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`} aria-hidden="true">{feature.icon}</div>
                    <div>
                      <div className="text-gray-300 font-bold text-lg">{feature.title}</div>
                      <div className="text-gray-400 text-sm">{feature.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-300 font-medium">Suporte nacional e configuração rápida</span>
              </div>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
                aria-disabled="true"
              >
                <Play className="w-5 h-5" aria-hidden="true" /> Em Breve
              </button>
              <button
                className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold rounded-xl flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
                aria-disabled="true"
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" /> Agendar Demonstração Gratuita
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center items-center gap-3 mb-6">
                <Image
                  src="/assets/Logo_HubEdu.ia.svg"
                  alt="HubEdu.ia Logo"
                  width={60}
                  height={60}
                  className="h-15 w-auto"
                  loading="lazy"
                />
                <div className="text-3xl font-bold">
                  <span className="text-white">Hub</span><span className="text-yellow-400">Edu</span><span className="text-white">.ia</span>
                </div>
              </div>
              <div className="flex justify-center items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-yellow-400" aria-hidden="true" />
                <a
                  href="mailto:contato@hubedu.ia.br"
                  className="text-xl font-semibold text-white hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rel="noopener noreferrer"
                >
                  contato@hubedu.ia.br
                </a>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-sm">© 2025 HubEdu.ia - Transformando a educação com IA avançada</p>
                <div className="flex gap-6 text-sm text-gray-500">
                  {['privacy', 'terms', 'lgpd'].map((modal) => (
                    <button
                      key={modal}
                      onClick={() => toggleModal(modal as 'privacy' | 'terms' | 'lgpd')}
                      className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-3 py-1 border border-gray-600 hover:border-yellow-400"
                      aria-label={`Abrir ${modal.charAt(0).toUpperCase() + modal.slice(1)}`}
                    >
                      {modal.charAt(0).toUpperCase() + modal.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <Suspense fallback={<SkeletonLoader />}>
          {modalsState.privacy && <PrivacyPolicyModal isOpen={modalsState.privacy} onClose={() => toggleModal('privacy')} />}
          {modalsState.terms && <TermsOfUseModal isOpen={modalsState.terms} onClose={() => toggleModal('terms')} />}
          {modalsState.lgpd && <LGPDModal isOpen={modalsState.lgpd} onClose={() => toggleModal('lgpd')} />}
        </Suspense>
      </div>
    </>
  );
};

export default memo(HubEduLanding);
