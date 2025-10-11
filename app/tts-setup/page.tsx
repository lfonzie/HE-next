'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function TTSSetupPage() {
  const [copied, setCopied] = useState(false)

  const envContent = `# OpenAI Configuration para TTS
OPENAI_API_KEY="sua-chave-openai-aqui"

# Outras configurações necessárias
DATABASE_URL="postgresql://localhost:5432/hubedu_dev"
DIRECT_URL="postgresql://localhost:5432/hubedu_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_GEMINI_API_KEY="your-gemini-api-key-here"`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Configuração do Sistema TTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">🔧 Problema Identificado</h3>
            <p className="text-orange-700">
              A chave da OpenAI não está configurada. Para usar o sistema de Text-to-Speech, 
              você precisa configurar a chave da API da OpenAI.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📋 Passos para Configurar:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Obter Chave da OpenAI</p>
                  <p className="text-sm text-gray-600">Acesse <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 underline" rel="noreferrer">platform.openai.com/api-keys</a> e crie uma nova chave API</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Criar arquivo .env.local</p>
                  <p className="text-sm text-gray-600">Na raiz do projeto, crie um arquivo chamado <code className="bg-gray-100 px-1 rounded">.env.local</code></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Adicionar configurações</p>
                  <p className="text-sm text-gray-600">Cole o conteúdo abaixo no arquivo .env.local:</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <pre className="whitespace-pre-wrap">{envContent}</pre>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium">Reiniciar o servidor</p>
                <p className="text-sm text-gray-600">Execute <code className="bg-gray-100 px-1 rounded">npm run dev</code> para reiniciar o servidor</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Após Configurar</h3>
            <ul className="text-green-700 space-y-1">
              <li>• O sistema TTS funcionará automaticamente nas aulas</li>
              <li>• Você poderá testar em <a href="/test-tts" className="underline">/test-tts</a></li>
              <li>• Cada slide terá um player de áudio integrado</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.location.href = '/test-tts'}>
              Testar TTS
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/aulas'}>
              Voltar para Aulas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
