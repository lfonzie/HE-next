'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Footer } from '../../components/Footer';

export default function Privacidade() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 py-2">
            <Link href="/">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative p-1">
                  <Image
                    src="/Logo_HubEdu.ia.svg"
                    alt="HubEdu.ia"
                    width={40}
                    height={40}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                    priority
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-all duration-300">
                  HubEdu.ia
                </h1>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Última atualização:</strong> Janeiro de 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informações que Coletamos</h2>
            <p className="text-gray-600 mb-4">
              Coletamos informações que você nos fornece diretamente:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Dados de cadastro (nome, email, cargo, escola)</li>
              <li>Mensagens e interações com nossa IA</li>
              <li>Informações de uso da plataforma</li>
              <li>Dados técnicos para melhoria do serviço</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos suas Informações</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência</li>
              <li>Comunicar atualizações e novidades</li>
              <li>Garantir a segurança da plataforma</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Proteção de Dados</h2>
            <p className="text-gray-600 mb-4">
              Implementamos medidas de segurança rigorosas:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Acesso restrito por autenticação segura</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-gray-600 mb-4">
              Não vendemos ou alugamos seus dados pessoais. Compartilhamos informações apenas:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir obrigações legais</li>
              <li>Com provedores de serviços confiáveis (OpenAI para IA)</li>
              <li>Em caso de emergência para proteção de direitos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="text-gray-600 mb-4">
              Conforme a Lei Geral de Proteção de Dados, você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão de dados desnecessários</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies e Tecnologias</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência. 
              Você pode configurar seu navegador para recusar cookies, mas isso pode afetar 
              algumas funcionalidades da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contato</h2>
            <p className="text-gray-600 mb-4">
              Para questões sobre esta política ou exercer seus direitos, entre em contato:
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="font-semibold">Encarregado de Proteção de Dados (DPO)</p>
              <p>Email: privacidade@hubedu.ia.br</p>
              <p>Telefone: +55 (11) 9 9999-9999</p>
            </div>
          </section>

          <section className="text-center bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-600">
              Esta política pode ser atualizada periodicamente. 
              Notificaremos sobre mudanças significativas através da plataforma.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
