"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Calendar, MapPin, GraduationCap, SkipForward } from 'lucide-react'
import { useUserPlan } from '@/hooks/useUserPlan'

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { userInfo, loading: userLoading } = useUserPlan()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [school, setSchool] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Se o perfil já estiver completo OU se for usuário free, redirecionar para o dashboard
    if (session.user.profileComplete || (userInfo && userInfo.plan === 'free')) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, userInfo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: birthDate, city, state, school }),
      })

      if (response.ok) {
        // Atualizar a sessão para refletir que o perfil está completo
        await fetch('/api/auth/session', { method: 'GET' })
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao completar perfil')
      }
    } catch (error) {
      setError('Erro ao completar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.profileComplete) {
    return null
  }

  const isFreeUser = userInfo?.role === 'FREE'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete seu Perfil</CardTitle>
          <p className="text-muted-foreground">
            Bem-vindo, {session.user.name}!
            {isFreeUser
              ? " Complete seu perfil para uma experiência personalizada ou pule esta etapa."
              : " Precisamos de algumas informações para personalizar sua experiência."
            }
          </p>
          {isFreeUser && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                🎁 Como usuário gratuito, você pode acessar o sistema imediatamente!
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Cidade
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="Sua cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Estado
              </Label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione seu estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Escola Atual
              </Label>
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
              {isLoading ? 'Salvando...' : 'Completar Perfil'}
            </Button>

            {isFreeUser && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-3"
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Pular e acessar o sistema
              </Button>
            )}
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sair da conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
