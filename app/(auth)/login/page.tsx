"use client"

import { useEffect, useRef, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, MonitorSmartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useLoading } from '@/components/ui/loading'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chat'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const { start: startLoading, end: endLoading } = useLoading()

  useEffect(() => {
    emailRef.current?.focus()
    router.prefetch(callbackUrl)
  }, [callbackUrl, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const loadingKey = startLoading('login', {
      message: 'Conectando…',
      cancelable: false,
      priority: 'high',
      timeout: 15000,
    })

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.')
        endLoading(loadingKey, 'error')
      } else if (result?.ok) {
        endLoading(loadingKey, 'success')

        setTimeout(async () => {
          await fetch('/api/auth/session', { method: 'GET' })
          router.push(callbackUrl)
        }, 400)
      } else {
        setError('Não foi possível autenticar no momento. Tente novamente.')
        endLoading(loadingKey, 'error')
      }
    } catch (err) {
      console.error('Login error', err)
      setError('Erro interno ao tentar efetuar login.')
      endLoading(loadingKey, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[hsl(var(--background))] px-4 py-10 text-[hsl(var(--foreground))] transition-theme sm:px-6 lg:px-8">
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <div className="mx-auto h-full w-full max-w-5xl rounded-full bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.12)_0%,transparent_55%)] blur-3xl" />
      </motion.div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <MonitorSmartphone className="h-4 w-4 opacity-60" aria-hidden="true" />
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <section className="flex flex-1 flex-col justify-between gap-8 rounded-3xl bg-surface-1 p-8 shadow-soft transition-theme lg:p-12">
          <div className="space-y-6">
            <Image
              src="/assets/Logo_HubEdu.ia.svg"
              alt="HubEdu.ia"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
              unoptimized
            />
            <div className="space-y-3">
              <h1 className="text-step-4 font-semibold leading-tight">Plataforma educacional inteligente</h1>
              <p className="max-w-sm text-subtle text-step-0">
                Plataforma educacional inteligente com IA para aulas personalizadas, chat interativo e ferramentas de ensino avançadas.
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-subtle">
          </div>
        </section>

        <Card className="flex-1 border border-subtle bg-surface-0/95 shadow-elevated backdrop-blur transition-theme">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-step-3 font-semibold">Acesse o HubEdu.ia</CardTitle>
            <p className="text-step--1 text-subtle">
              Use seu e-mail institucional para entrar. Você pode alternar entre tema claro e escuro a qualquer momento.
            </p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={error}
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-step--1 font-medium">
                  Email institucional
                </Label>
                <div className="flex items-center h-12 rounded-2xl border border-subtle bg-surface-0 px-4 transition-theme focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
                  <Mail className="h-5 w-5 text-subtle mr-3 flex-shrink-0" aria-hidden="true" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="professor@escola.com.br"
                    autoComplete="username email"
                    inputMode="email"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="flex-1 border-0 bg-transparent p-0 text-step-0 focus-visible:outline-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-step--1 font-medium">
                  Senha
                </Label>
                <div className="flex items-center h-12 rounded-2xl border border-subtle bg-surface-0 px-4 transition-theme focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
                  <Lock className="h-5 w-5 text-subtle mr-3 flex-shrink-0" aria-hidden="true" />
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    spellCheck={false}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="flex-1 border-0 bg-transparent p-0 text-step-0 focus-visible:outline-none focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-subtle transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-step--2 text-subtle">Use pelo menos 8 caracteres com letras e números.</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-step--1 text-subtle">
                <label className="inline-flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-subtle bg-surface-0 text-primary focus:ring-primary"
                  />
                  <span>Lembrar acesso neste dispositivo</span>
                </label>
                <Link href="/forgot-password" className="font-medium text-primary transition-colors hover:text-accent">
                  Esqueci minha senha
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl text-step-0 font-semibold shadow-soft transition-theme hover:shadow-elevated"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-[rgba(0,0,0,0.6)] dark:border-t-[rgba(0,0,0,0.85)]" />
                    Entrando…
                  </span>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="py-6">
              <Separator className="bg-border" />
              <span className="mt-3 block text-center text-step--1 text-subtle">ou</span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-2xl border-subtle bg-surface-0 text-step-0 font-medium transition-theme hover:border-primary hover:text-primary"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com Google
            </Button>

            <div className="mt-8 space-y-4">
              <div className="text-center text-sm text-subtle">
                <span>Não tem conta? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-accent"
                  onClick={() => router.push('/register')}
                >
                  Criar conta gratuita
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-step--1 text-subtle">
                <p>Precisa de acesso?</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-step--1 text-primary transition-colors hover:text-accent"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar ao site
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-theme">
          <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
