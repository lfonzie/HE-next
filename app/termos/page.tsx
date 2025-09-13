'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Footer } from '../../components/Footer';

export default function Termos() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Última atualização:</strong> Janeiro de 2025
          </p>

          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Importante</h3>
            <p className="text-yellow-800 text-sm">
              Estes termos são válidos a partir de janeiro de 2025. Leia atentamente 
              antes de usar nossa plataforma. Ao continuar, você aceita todos os termos descritos.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 mb-4">
              Ao acessar e usar a plataforma HubEdu.ia, você concorda com estes Termos de Uso. 
              Se não concordar com algum termo, não use nossos serviços.
            </p>
            <p className="text-gray-600">
              Estes termos constituem um acordo legal entre você e a HubEdu.ia, 
              definindo os direitos e responsabilidades de ambas as partes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-600 mb-4">
              O HubEdu.ia é uma plataforma de IA educacional que oferece:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Assistentes de IA específicos para educação</li>
              <li>Módulos para diferentes áreas escolares</li>
              <li>Ferramentas administrativas e pedagógicas</li>
              <li>Suporte técnico e educacional</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Elegibilidade e Cadastro</h2>
            <p className="text-gray-600 mb-4">
              Para usar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Ter pelo menos 18 anos ou autorização de responsável</li>
              <li>Estar vinculado a uma instituição educacional</li>
              <li>Fornecer informações precisas e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Uso Aceitável</h2>
            <p className="text-gray-600 mb-4">
              Você concorda em usar a plataforma apenas para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Atividades educacionais legítimas</li>
              <li>Administração escolar apropriada</li>
              <li>Finalidades pedagógicas éticas</li>
            </ul>
            <p className="text-gray-600 mt-4 mb-4">
              <strong>É proibido:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Usar para atividades ilegais ou prejudiciais</li>
              <li>Tentar comprometer a segurança da plataforma</li>
              <li>Compartilhar conteúdo inadequado ou ofensivo</li>
              <li>Fazer engenharia reversa do sistema</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propriedade Intelectual</h2>
            <p className="text-gray-600 mb-4">
              O HubEdu.ia e todo seu conteúdo são protegidos por direitos autorais. 
              Você pode usar nossa plataforma conforme autorizado, mas não pode:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Copiar, modificar ou distribuir nosso software</li>
              <li>Usar nossas marcas sem autorização</li>
              <li>Reproduzir nosso conteúdo em outras plataformas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacidade e Dados</h2>
            <p className="text-gray-600 mb-4">
              Sua privacidade é importante. Consulte nossa Política de Privacidade 
              para entender como coletamos, usamos e protegemos seus dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-gray-600 mb-4">
              O HubEdu.ia é fornecido &quot;como está&quot;. Não garantimos que o serviço será 
              ininterrupto ou livre de erros. Nossa responsabilidade é limitada 
              ao valor pago pelos serviços.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificações</h2>
            <p className="text-gray-600 mb-4">
              Podemos modificar estes termos a qualquer momento. Mudanças significativas 
              serão comunicadas com antecedência através da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Lei Aplicável</h2>
            <p className="text-gray-600 mb-4">
              Estes termos são regidos pelas leis brasileiras. Disputas serão 
              resolvidas no foro da comarca de São Paulo/SP.
            </p>
          </section>

          <section className="text-center bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dúvidas sobre os Termos?</h3>
            <p className="text-gray-600 mb-4">
              Entre em contato conosco para esclarecimentos
            </p>
            <Button 
              onClick={() => window.open('mailto:legal@hubedu.ia.br', '_blank')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Enviar Email
            </Button>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
