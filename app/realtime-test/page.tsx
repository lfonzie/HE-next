"use client";

export default function RealtimeTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            OpenAI Realtime API - Teste
          </h1>
          <p className="text-muted-foreground">
            Página de teste para verificar se os componentes estão funcionando
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Status dos Componentes</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">✅ Página Carregada</h3>
              <p className="text-green-700 dark:text-green-300">
                A página está funcionando corretamente.
              </p>
            </div>
            
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">🔧 Próximos Passos</h3>
              <p className="text-blue-700 dark:text-blue-300">
                1. Teste os componentes individuais<br/>
                2. Verifique as importações<br/>
                3. Teste a conectividade com a API
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
