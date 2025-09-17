"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnemOldRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a versão principal do ENEM
    router.replace('/enem')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Redirecionando para o Simulador ENEM...
        </h2>
        <p className="text-gray-600">
          Você está sendo direcionado para a versão mais recente do simulador.
        </p>
      </div>
    </div>
  )
}