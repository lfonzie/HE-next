"use client";

import { useAsyncLoader, useLoading, LoadingProvider } from "@/components/ui/SplashScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoadingDemoContent() {
  const { withLoading } = useAsyncLoader();
  const { startLoading, stopLoading, updateProgress } = useLoading();

  // Exemplo 1: Loading simples
  async function operacaoSimples() {
    await withLoading(async () => {
      // Simula uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simula uma resposta da API
      const response = await fetch("/api/test", { method: "GET" });
      if (!response.ok) throw new Error("Falha na operação");
      
      return response.json();
    }, "Processando dados...");
  }

  // Exemplo 2: Loading com progresso
  async function operacaoComProgresso() {
    startLoading("Iniciando processamento...", true);
    
    try {
      // Simula etapas de progresso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(i, `Processando dados... ${i}%`);
      }
      
      stopLoading();
    } catch (error) {
      stopLoading();
      console.error("Erro:", error);
    }
  }

  // Exemplo 3: Simulação de geração de aula
  async function gerarAula() {
    await withLoading(async () => {
      // Simula etapas de geração de aula
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simula chamada para API de geração de aula
      const response = await fetch("/api/gerar-aula", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: "Matemática", serie: "9º ano" })
      });
      
      if (!response.ok) throw new Error("Falha ao gerar aula");
      
      return response.json();
    }, "Gerando sua aula interativa...");
  }

  // Exemplo 4: Simulação de correção de redação
  async function corrigirRedacao() {
    await withLoading(async () => {
      // Simula upload e processamento de redação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simula chamada para API de correção
      const response = await fetch("/api/corrigir-redacao", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: "Texto da redação..." })
      });
      
      if (!response.ok) throw new Error("Falha na correção");
      
      return response.json();
    }, "Corrigindo sua redação...");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            🚀 Sistema de Loading HubEdu.ia
          </h1>
          <p className="text-xl text-gray-300">
            Demonstração do sistema de splash screen e loading global
          </p>
        </div>

        {/* Cards de Demonstração */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Loading Simples */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Loading Simples
              </CardTitle>
              <CardDescription className="text-gray-400">
                Operação assíncrona com loading automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={operacaoSimples} 
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Executar Operação (3s)
              </Button>
              <div className="mt-4 text-sm text-gray-400">
                <p>• Mostra overlay durante 3 segundos</p>
                <p>• Mensagem: "Processando dados..."</p>
                <p>• Loading automático com withLoading</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Loading com Progresso */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Loading com Progresso
              </CardTitle>
              <CardDescription className="text-gray-400">
                Barra de progresso de 0% a 100%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={operacaoComProgresso} 
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                Executar com Progresso (2s)
              </Button>
              <div className="mt-4 text-sm text-gray-400">
                <p>• Barra de progresso animada</p>
                <p>• Atualização a cada 10%</p>
                <p>• Controle manual de progresso</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Geração de Aula */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Geração de Aula
              </CardTitle>
              <CardDescription className="text-gray-400">
                Simula geração de aula interativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={gerarAula} 
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Gerar Aula IA (1s)
              </Button>
              <div className="mt-4 text-sm text-gray-400">
                <p>• Simula chamada para API de IA</p>
                <p>• Mensagem: "Gerando sua aula interativa..."</p>
                <p>• Integração com sistema HubEdu.ia</p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Correção de Redação */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Correção de Redação
              </CardTitle>
              <CardDescription className="text-gray-400">
                Simula correção automática de redação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={corrigirRedacao} 
                className="w-full bg-green-500 text-white hover:bg-green-600"
              >
                Corrigir Redação (2s)
              </Button>
              <div className="mt-4 text-sm text-gray-400">
                <p>• Simula upload e processamento</p>
                <p>• Mensagem: "Corrigindo sua redação..."</p>
                <p>• Integração com IA de correção</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Características do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-yellow-300 mb-3">🎨 Design HubEdu.ia</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Fundo escuro com gradiente</li>
                  <li>• Letras amarelas (#ffd233)</li>
                  <li>• Ícones SVG profissionais</li>
                  <li>• Animações Framer Motion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-yellow-300 mb-3">⚡ Funcionalidades</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Loading global com overlay</li>
                  <li>• Barra de progresso 0-100%</li>
                  <li>• Integração com rotas</li>
                  <li>• PWA ready</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-yellow-300 mb-3">🔧 Hooks Disponíveis</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• <code className="bg-gray-700 px-1 rounded">useLoading()</code></li>
                  <li>• <code className="bg-gray-700 px-1 rounded">useAsyncLoader()</code></li>
                  <li>• <code className="bg-gray-700 px-1 rounded">withLoading()</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-yellow-300 mb-3">📱 Acessibilidade</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• ARIA labels</li>
                  <li>• Screen reader support</li>
                  <li>• Contraste adequado</li>
                  <li>• Reduced motion support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções de Uso */}
        <Card className="bg-gray-800 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-yellow-400">📖 Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <h4 className="font-bold text-yellow-300 mb-2">1. Loading Simples:</h4>
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`const { withLoading } = useAsyncLoader();

await withLoading(async () => {
  const response = await fetch("/api/dados");
  return response.json();
}, "Carregando dados...");`}
                </pre>
              </div>
              <div>
                <h4 className="font-bold text-yellow-300 mb-2">2. Loading com Progresso:</h4>
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`const { startLoading, updateProgress, stopLoading } = useLoading();

startLoading("Processando...", true);
for (let i = 0; i <= 100; i += 10) {
  updateProgress(i, \`Processando... \${i}%\`);
}
stopLoading();`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoadingDemoPage() {
  return (
    <LoadingProvider>
      <LoadingDemoContent />
    </LoadingProvider>
  );
}
