// app/(dashboard)/apresentacao/index/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Clock, DollarSign, Star, ArrowRight, Play, CheckCircle, MessageSquare, Bot, Zap, Rocket, Shield, Heart, Menu, X, Phone, Mail, MapPin, Target, TrendingUp, BookOpen, Lightbulb, LogIn } from 'lucide-react';
import PrivacyPolicyModal from '@/components/modals/PrivacyPolicyModal';
import TermsOfUseModal from '@/components/modals/TermsOfUseModal';
import LGPDModal from '@/components/modals/LGPDModal';

// Importar conteúdo centralizado
import { hero, numerosQueFalam, depoimentos, planos, visual, features, stats, modules, demoScenarios, pricingFeatures } from '@/content/home';
import { Hero, Numeros, Depoimentos, Planos } from '@/sections';

const ApresentacaoPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const demoInterval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3);
    }, 6000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(demoInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <TermsOfUseModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
      <LGPDModal isOpen={lgpdModalOpen} onClose={() => setLgpdModalOpen(false)} />
      
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      } border-b border-yellow-200 overflow-x-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/Logo_HubEdu.ia.svg" 
              alt="HubEdu.ia Logo" 
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <div className="text-2xl font-bold">
              <span className="text-black">Hub</span>
              <span className="text-yellow-500">Edu</span>
              <span className="text-black">.ia</span>
            </div>
          </div>
          

          <div className="flex items-center gap-4">
            <a href="/login" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Entrar
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero data={hero} features={features} className={`${visual.gradientHero} text-white`} />

      {/* Enhanced Stats Section */}
      <Numeros data={stats} className={`${visual.sectionDark}`} />

      {/* Interactive Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-yellow-50 to-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              🎮 <span className="text-yellow-500">Veja em Ação:</span> Demo Interativa
            </h2>
            <p className="text-xl text-gray-600">Experimente como o HubEdu.ia funciona na prática</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {demoScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemo(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    activeDemo === index 
                      ? 'bg-yellow-400 text-black shadow-lg' 
                      : 'bg-white hover:bg-yellow-50 border-2 border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{scenario.title}</h3>
                  <p className="text-sm opacity-75">Clique para ver a conversa</p>
                </button>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-black to-gray-800 p-8 rounded-3xl text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-8 h-8 text-yellow-400" />
                <h3 className="text-xl font-bold">{demoScenarios[activeDemo].title}</h3>
                <div className="ml-auto flex gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-4 min-h-[200px]">
                <div className="bg-gray-700 p-4 rounded-xl rounded-br-sm">
                  <p className="text-sm text-gray-300 mb-2">👤 Usuário</p>
                  <p className="text-white">{demoScenarios[activeDemo].student}</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-xl rounded-bl-sm">
                  <p className="text-sm text-gray-700 mb-2">🤖 HubEdu.ia</p>
                  <p className="font-medium">{demoScenarios[activeDemo].ai}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-400">
                  ⚡ Resposta gerada em menos de 2 segundos • 🛡️ Conteúdo seguro e educacional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Modules Section */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ⚙️ <span className="text-yellow-500">8 Módulos</span> Integrados
            </h2>
            <p className="text-xl text-gray-600">Até +60% de eficiência operacional em todas as áreas</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <div key={index} className="group relative">
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl hover:border-yellow-400 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{module.icon}</div>
                    {module.status === 'em-breve' && (
                      <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-medium">
                        EM BREVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.desc}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Benefícios:</h4>
                    {module.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-full">
              <Rocket className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Todos os módulos inclusos no plano único</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <Depoimentos data={depoimentos} className={`${visual.sectionDark}`} />

      {/* Enhanced Pricing */}
      <Planos data={planos} className={`${visual.sectionDark}`} />

      {/* Enhanced CTA Section */}
      <section className={`${visual.gradientCTA} text-white py-20 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white">Transforme sua escola com IA</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Junte-se às escolas que já transformaram sua gestão com o HubEdu.ia
          </p>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl mb-12 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400">🎯 Garantia de Resultado</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">24h</div>
              <div>Respostas inteligentes</div>
            </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">24h</div>
                <div>Setup completo</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">100%</div>
              <div>Brasileiro</div>
            </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/demo-register" className="group px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Teste Grátis - Demo IA
            </a>
            <a href="/contato" className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 font-semibold flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Fale com um especialista
            </a>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Dados seguros (LGPD)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Suporte rápido e humanizado</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Suporte 100% nacional</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ❓ Perguntas <span className="text-yellow-500">Frequentes</span>
            </h2>
            <p className="text-xl text-gray-600">Tire suas principais dúvidas sobre o HubEdu.ia</p>
          </div>
          
          <div className="space-y-6">
            <div className="group bg-gradient-to-r from-yellow-50 to-white p-6 rounded-2xl border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                🔧 O HubEdu.ai substitui meu ERP/SGE atual?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Não, ele <strong>complementa</strong> seu sistema atual. O HubEdu.ia padroniza e automatiza o fluxo de informações, 
                integrando-se perfeitamente com ERPs como Lyceum, Prime, Educacional, entre outros.
              </p>
            </div>
            
            <div className="group bg-gradient-to-r from-yellow-50 to-white p-6 rounded-2xl border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                📞 Como funciona o atendimento omni-channel?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                A escola configura as informações principais no painel, e o HubEdu.ia responde automaticamente em 
                <strong> WhatsApp, site, Instagram, Facebook e Google</strong>. Respostas consistentes em todos os canais, 24/7.
              </p>
            </div>
            
            <div className="group bg-gradient-to-r from-yellow-50 to-white p-6 rounded-2xl border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                🔒 Os dados dos alunos ficam seguros?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Totalmente seguro.</strong> Todas as conversas são efêmeras (não armazenadas), 
                em total conformidade com a LGPD. Usamos criptografia de ponta a ponta e servidores brasileiros.
              </p>
            </div>
            
            <details className="group rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
              <summary className="cursor-pointer select-none text-lg font-medium group-open:mb-2">
                Qual tecnologia de IA é usada?
              </summary>
              <p className="text-white/80">
                Utilizamos modelos avançados da OpenAI (GPT-5) com camadas adicionais de segurança,
                filtragem e alinhamento à BNCC. Os dados são tratados conforme nossa política de privacidade e LGPD.
              </p>
            </details>
            
            <div className="group bg-gradient-to-r from-yellow-50 to-white p-6 rounded-2xl border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                ⏱️ Quanto tempo leva para implementar?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Apenas 24 horas!</strong> Nossa equipe faz todo o setup inicial, treinamento da sua equipe 
                e configuração personalizada. Você começa a ver resultados no primeiro dia.
              </p>
            </div>
            
            <div className="group bg-gradient-to-r from-yellow-50 to-white p-6 rounded-2xl border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors">
                💰 Como funciona o modelo de preços?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Preço a partir de <strong>R$ 2.000/mês por escola</strong> (até 150 alunos). Sem cobrança por usuário, 
                sem taxas extras, todos os 9 módulos inclusos. Escolas maiores têm desconto progressivo.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Ainda tem dúvidas? Fale com nossos especialistas!</p>
            <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold transform hover:scale-105 transition-all duration-300 shadow-lg">
              💬 Tirar Dúvidas via WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="text-3xl font-bold mb-4">
                <span className="text-white">Hub</span>
                <span className="text-yellow-400">Edu</span>
                <span className="text-white">.ia</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                A primeira plataforma de inteligência artificial desenvolvida especificamente para escolas brasileiras. 
                Professor digital, automações administrativas e atendimento inteligente em uma solução completa.
              </p>
              <div className="flex gap-4">
                <a href="/demo-register" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold transform hover:scale-105 transition-all duration-300">
                  Solicitar Demo
                </a>
                <a href="/login" className="px-6 py-3 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 font-semibold">
                  Entrar
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-400">contato@hubedu.ai</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <div className="font-semibold">Telefone</div>
                    <div className="text-gray-400">(11) 9999-9999</div>
                    <div className="text-sm text-gray-500">Seg-Sex, 8h-18h</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <div className="font-semibold">Escritório</div>
                    <div className="text-gray-400">São Paulo - SP, Brasil</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Links Rápidos</h3>
              <div className="space-y-3">
                <a href="#demo" className="block text-gray-400 hover:text-yellow-400 transition-colors">Demo Interativa</a>
                <a href="/faq" className="block text-gray-400 hover:text-yellow-400 transition-colors">Central de Ajuda</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 HubEdu.ai — Transformando a educação brasileira com IA
              </p>
              <div className="flex gap-6 text-sm text-gray-500">
                <button 
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Política de Privacidade
                </button>
                <button 
                  onClick={() => setTermsModalOpen(true)}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Termos de Uso
                </button>
                <button 
                  onClick={() => setLgpdModalOpen(true)}
                  className="hover:text-yellow-400 transition-colors"
                >
                  LGPD
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApresentacaoPage;
