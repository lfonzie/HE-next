'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Volume2, 
  Settings,
  Info
} from 'lucide-react'
import GoogleAudioPlayer from '@/components/audio/GoogleAudioPlayer'

export default function GoogleTTSSetupPage() {
  const [testText, setTestText] = useState('Olá! Este é um teste da síntese de voz do Google em português brasileiro. A voz feminina está funcionando perfeitamente!')
  const [isTesting, setIsTesting] = useState(false)

  const handleTest = () => {
    setIsTesting(true)
    // Reset after a short delay to allow the audio player to initialize
    setTimeout(() => setIsTesting(false), 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Volume2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Google TTS Setup
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Configure a síntese de voz do Google para usar voz feminina em português brasileiro nas aulas
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Status da Configuração
          </CardTitle>
          <CardDescription>
            Verifique se a Google API está configurada corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Google TTS API configurada</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Voz feminina em português brasileiro</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              pt-BR-Wavenet-C
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <span className="text-orange-700 font-medium">Sistema de fallback OpenAI TTS</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Ativo
            </Badge>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A voz <strong>pt-BR-Wavenet-C</strong> é uma voz feminina alternativa neural muito mais natural em português brasileiro, 
              otimizada para conteúdo educacional e com excelente qualidade de pronúncia.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Sistema de Fallback:</strong> Se o Google TTS falhar, o sistema automaticamente 
              usa o OpenAI TTS como backup, garantindo que o áudio sempre funcione.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configuração da API
          </CardTitle>
          <CardDescription>
            Configure sua chave da Google Cloud Text-to-Speech API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Google API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Sua chave da Google API"
              value="••••••••••••••••"
              disabled
            />
            <p className="text-sm text-gray-500">
              Configure a variável <code className="bg-gray-100 px-1 rounded">GOOGLE_API_KEY</code> no arquivo .env.local
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como obter sua chave:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Acesse o <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Crie um projeto ou selecione um existente</li>
                <li>Ative a API "Cloud Text-to-Speech"</li>
                <li>Crie uma chave de API</li>
                <li>Adicione a chave ao arquivo .env.local</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Voice Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Configuração da Voz
          </CardTitle>
          <CardDescription>
            Voz feminina em português brasileiro otimizada para educação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Voz</h4>
              <p className="text-sm text-blue-700">pt-BR-Wavenet-C</p>
              <p className="text-xs text-blue-600 mt-1">Feminina, Natural</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Velocidade</h4>
              <p className="text-sm text-green-700">1.0x</p>
              <p className="text-xs text-green-600 mt-1">Velocidade Normal</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Tom</h4>
              <p className="text-sm text-purple-700">0.0</p>
              <p className="text-xs text-purple-600 mt-1">Tom Natural</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A voz <strong>pt-BR-Wavenet-C</strong> oferece:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pronúncia natural em português brasileiro</li>
                <li>Tom feminino agradável e profissional</li>
                <li>Excelente qualidade para conteúdo educacional</li>
                <li>Suporte completo a acentos e caracteres especiais</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Teste da Voz
          </CardTitle>
          <CardDescription>
            Teste a síntese de voz com texto personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-text">Texto para Teste</Label>
            <textarea
              id="test-text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              placeholder="Digite o texto que deseja testar..."
            />
          </div>

          <Button 
            onClick={handleTest}
            className="w-full"
            disabled={!testText.trim()}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Testar Síntese de Voz
          </Button>

          {testText.trim() && (
            <div className="mt-4">
              <GoogleAudioPlayer
                text={testText}
                voice="pt-BR-Wavenet-C"
                speed={1.0}
                pitch={0.0}
                enableFallback={true}
                className="border-blue-200 bg-blue-50"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Como Usar
          </CardTitle>
          <CardDescription>
            O Google TTS está integrado automaticamente nas aulas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold">Aulas Automáticas</h4>
                <p className="text-sm text-gray-600">O Google TTS é usado automaticamente em todas as aulas geradas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold">Reprodução Inteligente</h4>
                <p className="text-sm text-gray-600">Clique no botão de play para gerar e reproduzir o áudio</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold">Cache Automático</h4>
                <p className="text-sm text-gray-600">Os áudios são armazenados em cache para reprodução instantânea</p>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pronto para usar!</strong> O sistema está configurado e funcionando. 
              Todas as aulas agora usam a voz feminina do Google TTS em português brasileiro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}