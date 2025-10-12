'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  CheckCircle,
  Target,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Image from 'next/image'

export default function EnemRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/enem'

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', {
        callbackUrl: callbackUrl,
        redirect: true
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/Logo_HubEdu.ia.svg"
              alt="HubEdu.ia Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Acesso Gratuito ao ENEM
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Simulador ENEM completo e correção automática de redações. Faça seu cadastro simples e comece agora!
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-yellow-200 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
              🎓 ENEM - 100% Gratuito
            </CardTitle>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-200">
                <CheckCircle className="h-4 w-4" />
                Gratuito
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-200">
                <Target className="h-4 w-4" />
                Simulados ENEM
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-800 border border-purple-200">
                <FileText className="h-4 w-4" />
                Correção de Redação
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-blue-800 mb-2 text-center">Simulados ENEM</h3>
                <p className="text-sm text-blue-700 text-center">3000+ questões oficiais + correção por IA</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-purple-800 mb-2 text-center">Redação ENEM</h3>
                <p className="text-sm text-purple-700 text-center">Correção automática com critérios oficiais</p>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Para acessar os módulos gratuitos, faça login com sua conta Google:
              </p>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                size="lg"
                className="w-full max-w-md bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </Button>
            </div>

            {/* Features List */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
              <h3 className="font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                O que você terá acesso:
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>3000+ questões oficiais do ENEM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Todos os temas de redação desde 1998</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Correção automática por IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Análise detalhada de desempenho</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Explicação de erros por IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Relatórios de performance</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Ao continuar, você concorda com nossos{' '}
                <a href="/termos" className="text-blue-600 hover:underline">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/privacidade" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </a>
              </p>
              <p className="text-xs text-gray-400">
                Seus dados estão protegidos e em conformidade com a LGPD
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

