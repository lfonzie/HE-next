import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react'

export default function GoogleTTSSetupPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuração do Google Text-to-Speech
          </h1>
          <p className="text-gray-600">
            Configure sua chave da API do Google Cloud para usar TTS gratuito
          </p>
        </div>

        {/* Benefits */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Vantagens do Google TTS
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 space-y-2">
            <ul className="space-y-1">
              <li>• <strong>1 milhão de caracteres gratuitos</strong> por mês</li>
              <li>• Vozes naturais em português brasileiro</li>
              <li>• Qualidade profissional de áudio</li>
              <li>• Sem necessidade de cartão de crédito para o nível gratuito</li>
              <li>• API confiável e estável</li>
            </ul>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Passo a Passo da Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Acesse o Google Cloud Console
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Vá para o Google Cloud Console e crie um novo projeto ou selecione um existente.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Google Cloud Console
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Ative a API Text-to-Speech
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  No menu lateral, vá para "APIs e Serviços" → "Biblioteca" e procure por "Cloud Text-to-Speech API".
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://console.cloud.google.com/apis/library/texttospeech.googleapis.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ativar Text-to-Speech API
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Crie uma Chave de API
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Vá para "APIs e Serviços" → "Credenciais" e clique em "Criar Credenciais" → "Chave de API".
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Criar Chave de API
                </Button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                Configure a Chave no Projeto
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  Copie a chave gerada e adicione ao arquivo <code className="bg-gray-200 px-2 py-1 rounded text-xs">.env.local</code>:
                </p>
                <div className="bg-gray-800 text-green-400 p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span>GOOGLE_API_KEY=sua_chave_aqui</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard('GOOGLE_API_KEY=sua_chave_aqui')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 space-y-2">
            <ul className="space-y-1">
              <li>• A chave de API é gratuita e não requer cartão de crédito</li>
              <li>• Você tem direito a 1 milhão de caracteres por mês gratuitamente</li>
              <li>• Após o limite gratuito, o custo é de $4,00 por 1 milhão de caracteres</li>
              <li>• Mantenha sua chave segura e não a compartilhe publicamente</li>
              <li>• Você pode monitorar o uso no Google Cloud Console</li>
            </ul>
          </CardContent>
        </Card>

        {/* Test Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => window.location.href = '/test-google-tts'}
          >
            Testar Configuração
          </Button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}
