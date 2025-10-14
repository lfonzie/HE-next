"use client"

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Mail, FileText } from 'lucide-react'
import { TermsModal } from '@/components/auth/TermsModal'
import { BrasilApiService, State, City } from '@/lib/services/brasil-api'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [school, setSchool] = useState('')
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [availableStates, setAvailableStates] = useState<State[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const router = useRouter()

  // Carregar estados na inicialização
  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await BrasilApiService.getStates()
        setAvailableStates(states)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
      }
    }
    loadStates()
  }, [])

  const handleStateChange = async (selectedState: string) => {
    setState(selectedState)
    setCity('') // Limpa a cidade quando muda o estado
    setAvailableCities([]) // Limpa cidades anteriores
    
    if (selectedState) {
      setIsLoadingCities(true)
      try {
        const cities = await BrasilApiService.getCitiesByState(selectedState)
        setAvailableCities(cities)
      } catch (error) {
        console.error('Erro ao carregar cidades:', error)
        setError('Erro ao carregar cidades. Tente novamente.')
      } finally {
        setIsLoadingCities(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Uso para continuar')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          birth_date: birthDate, 
          city, 
          state, 
          school,
          accept_terms: acceptTerms
        }),
      })

      if (response.ok) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.ok) {
          router.push('/dashboard')
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      setError('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    // Redirecionar para Google OAuth com callback para página de informações adicionais
    await signIn('google', { 
      callbackUrl: '/auth/google-complete',
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">HubEdu.ai</CardTitle>
          <p className="text-muted-foreground">Crie sua conta</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <select
                id="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Selecione seu estado</option>
                {availableStates.map((stateOption) => (
                  <option key={stateOption.sigla} value={stateOption.sigla}>
                    {stateOption.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
                disabled={!state || isLoadingCities}
              >
                <option value="">
                  {!state 
                    ? 'Primeiro selecione o estado' 
                    : isLoadingCities 
                    ? 'Carregando cidades...' 
                    : availableCities.length === 0 
                    ? 'Nenhuma cidade encontrada' 
                    : 'Selecione sua cidade'
                  }
                </option>
                {availableCities.map((cityData) => (
                  <option key={cityData.id} value={cityData.nome}>
                    {cityData.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">Escola Atual</Label>
              <Input
                id="school"
                type="text"
                placeholder="Nome da sua escola"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                autoComplete="organization"
                required
              />
            </div>
            
            {/* Terms of Use Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-5">
                  Eu li e aceito os{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 underline"
                    onClick={() => setShowTermsModal(true)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Termos de Uso
                  </Button>
                  {' '}da HubEdu.ia
                </Label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>
              Faça login
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </div>
  )
}
