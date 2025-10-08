import GeminiAudioChat from '@/components/GeminiAudioChat'

export const metadata = {
  title: 'Teste - Gemini Audio | HubEdu',
  description: 'Página de teste do Gemini Audio Chat',
}

export default function TestGeminiAudioPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🧪 Teste - Gemini Audio</h1>
          <p className="text-muted-foreground">
            Página de teste para experimentar o Gemini Audio Chat
          </p>
        </div>

        <GeminiAudioChat />

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">💡 Prompts para Testar:</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>"Conte uma história curta sobre um astronauta corajoso"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>"Explique física quântica de forma simples"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>"Me conte uma curiosidade sobre o universo"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <span>"Quais são os benefícios de aprender um novo idioma?"</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Powered by Google Gemini 2.5 Flash + Google Cloud Text-to-Speech</p>
        </div>
      </div>
    </div>
  )
}

