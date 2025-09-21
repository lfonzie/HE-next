"use client";

import { useAsyncLoader, useLoading } from "@/components/ui/SplashScreen";
import { Button } from "@/components/ui/button";

export default function BotaoGerarAula() {
  const { withLoading } = useAsyncLoader();
  const { startLoading, stopLoading } = useLoading();

  async function gerarAula() {
    await withLoading(async () => {
      // Simula uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simula uma resposta da API
      const response = await fetch("/api/gerar-aula", { method: "POST" });
      if (!response.ok) throw new Error("Falha ao gerar aula");
      
      return response.json();
    }, "Gerando sua aula interativa…");
  }

  async function gerarAulaComProgresso() {
    const { startLoading, updateProgress, stopLoading } = useLoading();
    
    startLoading("Preparando aula...", true);
    
    try {
      // Simula etapas de progresso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(i, `Processando... ${i}%`);
      }
      
      stopLoading();
    } catch (error) {
      stopLoading();
      console.error("Erro:", error);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold text-yellow-400">Exemplo de Loading</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={gerarAula} 
          className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
        >
          Gerar Aula (Loading Simples)
        </Button>
        
        <Button 
          onClick={gerarAulaComProgresso} 
          className="w-full bg-orange-500 text-white hover:bg-orange-600"
        >
          Gerar Aula (Com Progresso)
        </Button>
      </div>
      
      <div className="text-sm text-gray-400">
        <p>• O primeiro botão mostra um loading simples</p>
        <p>• O segundo botão mostra progresso de 0% a 100%</p>
        <p>• Ambos usam o overlay global com tema HubEdu.ia</p>
      </div>
    </div>
  );
}
