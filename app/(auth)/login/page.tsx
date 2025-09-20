"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useLoading } from '@/components/ui/Loading'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/chat'
  const { start: startLoading, end: endLoading } = useLoading()
  
  // Refs para foco
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Start loading with optimized system
    const loadingKey = startLoading('login', {
      message: 'Carregando…',
      cancelable: false,
      priority: 'high',
      timeout: 15000 // 15s timeout
    })

    try {
      console.log('🔐 Attempting login with:', { email, callbackUrl })
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('🔐 Login result:', result)

      if (result?.error) {
        console.error('❌ Login error:', result.error)
        setError('Credenciais inválidas')
        endLoading(loadingKey, 'error')
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting to:', callbackUrl)
        
        // End login loading first
        endLoading(loadingKey, 'success')
        
        // Add a small delay to ensure session is properly set
        setTimeout(async () => {
          console.log('🚀 Navigating to:', callbackUrl)
          // Force refresh the session before navigation
          await fetch('/api/auth/session', { method: 'GET' })
          router.push(callbackUrl)
        }, 500)
      } else {
        console.error('❌ Unexpected login result:', result)
        setError('Erro inesperado no login')
        endLoading(loadingKey, 'error')
      }
    } catch (error) {
      console.error('❌ Login exception:', error)
      setError('Erro ao fazer login')
      endLoading(loadingKey, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl })
  }

  const togglePasswordVisibility = () => setShowPassword(prev => !prev)

  // Auto-focus no email ao carregar and prefetch callback route
  useEffect(() => {
    emailRef.current?.focus()
    // Prefetch callback route to reduce navigation latency
    router.prefetch(callbackUrl)
  }, [router, callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-white p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-5">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-300 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 100 
        }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 rounded-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Image
                src="/assets/Logo_HubEdu.ia.svg"
                alt="HubEdu.ia"
                width={150}
                height={150}
                className="object-contain transition-transform hover:scale-105"
                priority
                unoptimized
              />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-black mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              HubEdu.ia
            </motion.h1>
            <motion.p 
              className="text-gray-700 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Plataforma Educacional Inteligente
            </motion.p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* EMAIL */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="email" className="text-gray-800 font-medium">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="professor@escola.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    spellCheck={false}
                    autoComplete="username email"
                    inputMode="email"
                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 text-lg"
                  />
                </div>
              </motion.div>

              {/* PASSWORD */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="password" className="text-gray-800 font-medium">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    spellCheck={false}
                    autoComplete="current-password"
                    className="h-12 pl-12 pr-12 rounded-xl border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 text-lg"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Mínimo de 6 caracteres</p>
              </motion.div>

              {/* REMEMBER + FORGOT */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-gray-700 text-sm">Lembrar de mim</span>
                </label>

                <button 
                  type="button"
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
                  onClick={() => router.push('/forgot-password')}
                >
                  Esqueci minha senha
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <button
                  type="submit"
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-semibold text-lg rounded-xl transition-all duration-200 hover:shadow-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full mr-3 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar no HubEdu.ia"
                  )}
                </button>
              </motion.div>
            </form>

            {/* divider */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-6 h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium transition-all duration-200 hover:shadow-md inline-flex items-center justify-center"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>
            </motion.div>

            <motion.div 
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-gray-600 text-sm">
                Entre em contato com a administração da sua escola para obter acesso.
              </p>
              <button 
                className="text-gray-600 hover:text-yellow-600 font-medium text-sm inline-flex items-center gap-2 transition-colors"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar à página inicial
              </button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
