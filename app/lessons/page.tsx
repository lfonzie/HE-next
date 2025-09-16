'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LessonsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para /aulas para manter compatibilidade
    router.replace('/aulas')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para as aulas...</p>
        </div>
      </div>
    </div>
  )
}