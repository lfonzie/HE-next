import UnifiedChatBox from "@/components/UnifiedChatBox";

export default function TestUnifiedChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste do Sistema de Chat Unificado
          </h1>
          <p className="text-gray-600">
            Sistema completo com persistência de contexto, múltiplos provedores e trimming inteligente
          </p>
        </div>
        
        <UnifiedChatBox />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades Implementadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-600 mb-2">✅ Persistência de Contexto</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• ConversationId estável na URL</li>
                <li>• Mensagens salvas individualmente</li>
                <li>• Histórico recuperado automaticamente</li>
                <li>• Ordem estável com índice</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-600 mb-2">✅ Múltiplos Provedores</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• OpenAI (GPT-4o, GPT-4o-mini)</li>
                <li>• Google Gemini (gemini-pro)</li>
                <li>• Groq (llama3-8b-8192)</li>
                <li>• Formatação específica por provedor</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-purple-600 mb-2">✅ Trimming Inteligente</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Limite de ~12k caracteres</li>
                <li>• Preserva system prompt</li>
                <li>• Mantém contexto recente</li>
                <li>• Estimativa de tokens</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-orange-600 mb-2">✅ Streaming & Performance</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Streaming em tempo real</li>
                <li>• Fallback para modo normal</li>
                <li>• Logs detalhados</li>
                <li>• Tratamento de erros</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🔧 Como Testar</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Envie uma mensagem inicial</li>
            <li>Troque de provedor e envie outra mensagem</li>
            <li>Recarregue a página - o contexto deve ser mantido</li>
            <li>Teste com streaming ligado/desligado</li>
            <li>Verifique o Network tab para ver as chamadas à API</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
