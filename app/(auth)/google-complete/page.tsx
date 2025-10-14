"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { states, citiesByState } from '@/lib/data/states-cities'
import { BrasilApiService, State, City } from '@/lib/services/brasil-api'

export default function GoogleAdditionalInfoPage() {
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [school, setSchool] = useState('')
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [availableStates, setAvailableStates] = useState<State[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar se temos as informações do Google
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    
    if (!name || !email) {
      // Se não temos as informações, redirecionar para login
      router.push('/login')
      return
    }
    
    setUserInfo({ name, email })
    
    // Carregar estados
    const loadStates = async () => {
      try {
        const states = await BrasilApiService.getStates()
        setAvailableStates(states)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
      }
    }
    loadStates()
  }, [searchParams, router])

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

    if (!birthDate || !city || !state || !school) {
      setError('Todos os campos são obrigatórios')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/google-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: userInfo?.name,
          email: userInfo?.email,
          birth_date: birthDate, 
          city, 
          state, 
          school
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao completar cadastro')
      }
    } catch (error) {
      setError('Erro ao completar cadastro')
    } finally {
      setIsLoading(false)
    }
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando informações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">HubEdu.ai</CardTitle>
          <p className="text-muted-foreground">Complete seu perfil</p>
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Bem-vindo, {userInfo.name}!</strong><br/>
              Email: {userInfo.email}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Completando cadastro...' : 'Completar Cadastro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
